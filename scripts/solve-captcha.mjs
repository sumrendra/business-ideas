/**
 * CAPTCHA solver with two modes:
 *
 *   TWO_CAPTCHA_API_KEY set  → 2captcha.com (human solver, ~10s, ~$0.003/solve)
 *   TWO_CAPTCHA_API_KEY unset → Tesseract.js local OCR (free, ~30% accuracy on CPPP)
 *
 * Usage:
 *   import { solveCaptchaFromElement, terminateSolver } from './solve-captcha.mjs'
 *   const text = await solveCaptchaFromElement(page, '#captchaImage')
 */

import fs from 'fs'
import os from 'os'
import path from 'path'

// ── 2captcha solver ───────────────────────────────────────────────────────────

async function solve2captcha(imgPath) {
  const key = process.env.TWO_CAPTCHA_API_KEY
  const imageBase64 = fs.readFileSync(imgPath).toString('base64')

  // Submit the CAPTCHA image
  const submitRes = await fetch('https://2captcha.com/in.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      key,
      method: 'base64',
      body: imageBase64,
      json: '1',
    }),
  })
  const submit = await submitRes.json()
  if (submit.status !== 1) throw new Error(`2captcha submit failed: ${submit.request}`)

  const taskId = submit.request
  console.log(`  [2captcha] task ${taskId} submitted, polling...`)

  // Poll until solved (2captcha workers typically solve in 5-15s)
  for (let i = 0; i < 24; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const pollRes = await fetch(
      `https://2captcha.com/res.php?key=${key}&action=get&id=${taskId}&json=1`
    )
    const poll = await pollRes.json()
    if (poll.status === 1) {
      const solved = poll.request.replace(/[^A-Za-z0-9]/g, '').trim()
      console.log(`  [2captcha] solved: "${solved}"`)
      return solved
    }
    if (poll.request !== 'CAPCHA_NOT_READY') {
      throw new Error(`2captcha poll error: ${poll.request}`)
    }
  }
  throw new Error('2captcha timed out after 120s')
}

// ── Tesseract fallback ────────────────────────────────────────────────────────

import { createCanvas, loadImage } from 'canvas'

let tesseractWorker = null

async function getTesseractWorker() {
  if (tesseractWorker) return tesseractWorker
  const { createWorker } = await import('tesseract.js')
  tesseractWorker = await createWorker('eng', 1, { logger: () => {} })
  await tesseractWorker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    tessedit_pageseg_mode: '7',
  })
  return tesseractWorker
}

function removeSmallBlobs(data, width, height, minPixels = 80) {
  const n = width * height
  const visited = new Uint8Array(n)
  const result = new Uint8ClampedArray(data)
  for (let start = 0; start < n; start++) {
    if (visited[start] || data[start * 4] !== 0) continue
    const blob = [start]
    visited[start] = 1
    for (let qi = 0; qi < blob.length; qi++) {
      const idx = blob[qi]
      const x = idx % width, y = (idx / width) | 0
      for (const [nx, ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
        const nidx = ny * width + nx
        if (visited[nidx] || data[nidx * 4] !== 0) continue
        visited[nidx] = 1
        blob.push(nidx)
      }
    }
    if (blob.length < minPixels) {
      for (const idx of blob) {
        result[idx*4] = result[idx*4+1] = result[idx*4+2] = 255
      }
    }
  }
  return result
}

async function preprocessImage(inputPath) {
  const img = await loadImage(inputPath)
  const scale = 3
  const canvas = createCanvas(img.width * scale, img.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]
    const val = gray < 140 ? 0 : 255
    data[i] = data[i+1] = data[i+2] = val
    data[i+3] = 255
  }
  const cleaned = removeSmallBlobs(data, canvas.width, canvas.height, 80)
  for (let i = 0; i < cleaned.length; i++) imageData.data[i] = cleaned[i]
  ctx.putImageData(imageData, 0, 0)
  const outPath = path.join(os.tmpdir(), `captcha-processed-${Date.now()}.png`)
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'))
  return outPath
}

async function solveTesseract(imgPath) {
  const processedPath = await preprocessImage(imgPath)
  try {
    const w = await getTesseractWorker()
    const { data: { text } } = await w.recognize(processedPath)
    const solved = text.replace(/[^A-Za-z0-9]/g, '').trim()
    console.log(`  [tesseract] solved: "${solved}"`)
    return solved
  } finally {
    fs.unlink(processedPath, () => {})
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function solveCaptchaFromElement(page, selector = '#captchaImage') {
  const tmpPath = path.join(os.tmpdir(), `captcha-raw-${Date.now()}.png`)
  const el = await page.$(selector)
  if (!el) throw new Error(`CAPTCHA element not found: ${selector}`)
  await el.screenshot({ path: tmpPath })
  return solveCaptchaFromFile(tmpPath)
}

export async function solveCaptchaFromFile(imgPath) {
  if (process.env.TWO_CAPTCHA_API_KEY) {
    return solve2captcha(imgPath)
  }
  return solveTesseract(imgPath)
}

export async function terminateSolver() {
  if (tesseractWorker) { await tesseractWorker.terminate(); tesseractWorker = null }
}
