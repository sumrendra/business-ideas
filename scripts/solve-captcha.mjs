/**
 * CAPTCHA solver using Tesseract.js — no external service needed.
 * Designed for CPPP's simple 6-char alphanumeric image CAPTCHA.
 *
 * Usage:
 *   import { solveCaptchaFromElement } from './solve-captcha.mjs'
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
  // Whitelist only alphanumeric chars (CPPP uses A-Za-z0-9)
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    tessedit_pageseg_mode: '8',  // single word
  })
  return worker
}

/**
 * Preprocess CAPTCHA image: grayscale + binary threshold to sharpen text.
 * Returns path to processed temp PNG.
 */
async function preprocessImage(inputPath) {
  const img = await loadImage(inputPath)
  const canvas = createCanvas(img.width * 2, img.height * 2)  // 2x upscale helps OCR
  const ctx = canvas.getContext('2d')

  // Draw at 2x scale
  ctx.drawImage(img, 0, 0, img.width * 2, img.height * 2)

  // Convert to grayscale + apply threshold
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    // Threshold: dark pixels → black, light → white
    const val = gray < 160 ? 0 : 255
    data[i] = data[i + 1] = data[i + 2] = val
  }
  ctx.putImageData(imageData, 0, 0)

  const outPath = path.join(os.tmpdir(), `captcha-processed-${Date.now()}.png`)
  const buf = canvas.toBuffer('image/png')
  fs.writeFileSync(outPath, buf)
  return outPath
}

/**
 * Solve CAPTCHA from a Playwright element handle.
 * Returns the solved text string.
 */
export async function solveCaptchaFromElement(page, selector = '#captchaImage') {
  const tmpPath = path.join(os.tmpdir(), `captcha-raw-${Date.now()}.png`)

  // Screenshot the CAPTCHA element
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
    // Strip whitespace and non-alphanumeric chars
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
