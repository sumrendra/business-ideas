/**
 * CAPTCHA solver using Tesseract.js — no external service needed.
 * Designed for CPPP's 6-char alphanumeric CAPTCHA with dot separators (e.g. T·v·P·B·Y·H).
 *
 * Key fix: connected-component blob removal strips separator dots (tiny isolated pixel
 * clusters) while preserving character strokes, so Tesseract reads 6 chars not 12.
 *
 * Usage:
 *   import { solveCaptchaFromElement, terminateSolver } from './solve-captcha.mjs'
 *   const text = await solveCaptchaFromElement(page, '#captchaImage')
 */

import { createWorker } from 'tesseract.js'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'

let worker = null

async function getWorker() {
  if (worker) return worker
  worker = await createWorker('eng', 1, { logger: () => {} })
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    tessedit_pageseg_mode: '7',  // single text line
  })
  return worker
}

/**
 * Remove small connected components (dots/noise) from a binary pixel array.
 * Pixels with value 0 are foreground (text), 255 is background.
 * Any connected blob smaller than minPixels is erased to background.
 */
function removeSmallBlobs(data, width, height, minPixels = 50) {
  const n = width * height
  const visited = new Uint8Array(n)
  const result = new Uint8ClampedArray(data)

  for (let start = 0; start < n; start++) {
    if (visited[start] || data[start * 4] !== 0) continue  // skip white or already visited

    // BFS to find the full connected component
    const blob = [start]
    visited[start] = 1
    for (let qi = 0; qi < blob.length; qi++) {
      const idx = blob[qi]
      const x = idx % width
      const y = (idx / width) | 0
      for (const [nx, ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
        const nidx = ny * width + nx
        if (visited[nidx] || data[nidx * 4] !== 0) continue
        visited[nidx] = 1
        blob.push(nidx)
      }
    }

    // If blob is smaller than threshold, erase it (set to white)
    if (blob.length < minPixels) {
      for (const idx of blob) {
        result[idx * 4] = result[idx * 4 + 1] = result[idx * 4 + 2] = 255
      }
    }
  }

  return result
}

/**
 * Preprocess CAPTCHA image:
 * 1. Upscale 3x for better OCR resolution
 * 2. Grayscale + adaptive binary threshold
 * 3. Remove small blobs (separator dots between chars)
 */
async function preprocessImage(inputPath) {
  const img = await loadImage(inputPath)
  const scale = 3
  const canvas = createCanvas(img.width * scale, img.height * scale)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let data = imageData.data

  // Grayscale + binary threshold
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    const val = gray < 140 ? 0 : 255
    data[i] = data[i + 1] = data[i + 2] = val
    data[i + 3] = 255
  }

  // Remove separator dots — at 3x scale a dot is ~9-25px, characters are 300-1000px
  const cleaned = removeSmallBlobs(data, canvas.width, canvas.height, 80)
  for (let i = 0; i < cleaned.length; i++) imageData.data[i] = cleaned[i]
  ctx.putImageData(imageData, 0, 0)

  const outPath = path.join(os.tmpdir(), `captcha-processed-${Date.now()}.png`)
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'))
  return outPath
}

/**
 * Solve CAPTCHA from a Playwright element handle.
 */
export async function solveCaptchaFromElement(page, selector = '#captchaImage') {
  const tmpPath = path.join(os.tmpdir(), `captcha-raw-${Date.now()}.png`)
  const el = await page.$(selector)
  if (!el) throw new Error(`CAPTCHA element not found: ${selector}`)
  await el.screenshot({ path: tmpPath })
  return solveCaptchaFromFile(tmpPath)
}

/**
 * Solve CAPTCHA from a local image file.
 */
export async function solveCaptchaFromFile(imgPath) {
  const processedPath = await preprocessImage(imgPath)
  try {
    const w = await getWorker()
    const { data: { text } } = await w.recognize(processedPath)
    const solved = text.replace(/[^A-Za-z0-9]/g, '').trim()
    console.log(`  [captcha] solved: "${solved}"`)
    return solved
  } finally {
    fs.unlink(processedPath, () => {})
  }
}

/**
 * Terminate the Tesseract worker (call when scraper is done).
 */
export async function terminateSolver() {
  if (worker) { await worker.terminate(); worker = null }
}
