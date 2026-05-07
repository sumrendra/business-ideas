#!/usr/bin/env node
/**
 * MCA21 Company Master Data — Download & Preprocess
 *
 * Downloads the monthly company master CSV from MCA's open data portal,
 * parses it, and generates a district/NIC/year summary JSON.
 *
 * Output: public/data/mca21/summary.json
 *
 * Usage:
 *   node scripts/fetch-mca21.mjs
 *   # or with explicit cookie if MCA requires auth:
 *   MCA_COOKIE="session=..." node scripts/fetch-mca21.mjs
 *
 * Requires: Node 18+ (native fetch + streams)
 */

import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { readFile, writeFile, unlink } from 'fs/promises'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import path from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'data', 'mca21')
const OUT_FILE = path.join(OUT_DIR, 'summary.json')
const CSV_FILE = path.join(OUT_DIR, 'company_master.csv')

mkdirSync(OUT_DIR, { recursive: true })

// ── Download sources (try in order) ─────────────────────────────────────────
const DOWNLOAD_SOURCES = [
  // data.gov.in company master (requires DATA_GOV_IN_API_KEY)
  process.env.DATA_GOV_IN_API_KEY
    ? `https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?api-key=${process.env.DATA_GOV_IN_API_KEY}&format=csv&limit=500000`
    : null,
  // MCA direct open data (monthly, may require cookies)
  'https://www.mca.gov.in/bin/ebook/dms/getdocument?doc=MW==&docCategory=Company+Master+Data&type=open',
  // Alternative MCA URL
  'https://data.mca.gov.in/company-master-data/active-companies.csv',
]

async function tryDownload(url, destFile) {
  console.log(`  Trying: ${url.slice(0, 80)}...`)
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'text/csv,application/zip,*/*',
  }
  if (process.env.MCA_COOKIE) headers['Cookie'] = process.env.MCA_COOKIE

  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const contentType = res.headers.get('content-type') ?? ''
  const isZip = contentType.includes('zip') || url.includes('.zip')

  const ws = createWriteStream(isZip ? destFile + '.zip' : destFile)
  await pipeline(res.body, ws)
  console.log(`  Downloaded: ${(await res.blob().then(b => b.size) / 1024 / 1024).toFixed(1)} MB`)

  if (isZip) {
    console.log('  Extracting ZIP...')
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    await promisify(exec)(`unzip -o "${destFile}.zip" -d "${OUT_DIR}"`)
    await unlink(destFile + '.zip').catch(() => {})
    // Find the CSV
    const { readdir } = await import('fs/promises')
    const files = await readdir(OUT_DIR)
    const csv = files.find(f => f.endsWith('.csv'))
    if (csv && csv !== path.basename(destFile)) {
      const { rename } = await import('fs/promises')
      await rename(path.join(OUT_DIR, csv), destFile)
    }
  }
  return true
}

async function downloadCSV() {
  if (existsSync(CSV_FILE)) {
    console.log('✓ CSV already exists, skipping download (delete to re-fetch)')
    return true
  }
  for (const src of DOWNLOAD_SOURCES) {
    if (!src) continue
    try {
      await tryDownload(src, CSV_FILE)
      return true
    } catch (e) {
      console.log(`  Failed: ${e.message}`)
    }
  }
  return false
}

// ── CSV Parser ────────────────────────────────────────────────────────────────
// MCA21 CSV columns (as of 2024):
// CIN, COMPANY_NAME, ROC_CODE, REGISTRATION_NUMBER, COMPANY_CATEGORY,
// COMPANY_SUB_CATEGORY, CLASS_OF_COMPANY, AUTHORISED_CAP, PAIDUP_CAP,
// DATE_OF_INCORPORATION, REGISTERED_STATE, REGISTERED_OFFICE_ADDRESS,
// REGISTERED_EMAIL_ID, DATE_OF_LAST_AGM, DATE_OF_BALANCE_SHEET,
// COMPANY_STATUS, ACTIVE_COMPLIANCE, DATE_OF_LAST_DIR12,
// LISTING_STATUS, DATE_OF_LAST_AR, NIC_CODE, PRINCIPAL_BUSINESS_ACTIVITY_AS_PER_CIN,
// PRINCIPAL_BUSINESS_ACTIVITY

const RELEVANT_STATUS = new Set(['Active', 'ACTIVE', 'Strike Off', 'STRIKE OFF', 'Struck Off'])

function parseDate(s) {
  if (!s) return null
  // Common formats: DD/MM/YYYY or YYYY-MM-DD
  const parts = s.includes('/') ? s.split('/').reverse() : s.split('-')
  const year = parseInt(parts[0])
  return isNaN(year) || year < 1956 || year > 2030 ? null : year
}

function parseRow(headers, values) {
  const row = {}
  headers.forEach((h, i) => { row[h.trim()] = (values[i] ?? '').trim() })
  return row
}

// Extract district from address (heuristic)
function extractDistrict(address, state) {
  if (!address) return state
  // Address usually ends with "State - PIN" or contains city
  // We look for known city names as district proxy
  const lower = address.toLowerCase()
  const CITIES = [
    'mumbai', 'pune', 'nagpur', 'nashik', 'aurangabad',
    'delhi', 'new delhi', 'noida', 'gurgaon', 'faridabad',
    'bengaluru', 'bangalore', 'mysore', 'hubli', 'mangalore',
    'chennai', 'coimbatore', 'madurai', 'salem', 'tiruchirappalli',
    'hyderabad', 'warangal', 'nizamabad', 'karimnagar',
    'ahmedabad', 'surat', 'vadodara', 'rajkot',
    'kolkata', 'howrah', 'durgapur', 'asansol',
    'jaipur', 'jodhpur', 'udaipur', 'kota',
    'lucknow', 'kanpur', 'agra', 'varanasi', 'allahabad',
    'bhopal', 'indore', 'gwalior', 'jabalpur',
    'patna', 'gaya', 'muzaffarpur',
    'chandigarh', 'amritsar', 'ludhiana', 'jalandhar',
    'bhubaneswar', 'cuttack', 'rourkela',
    'ranchi', 'jamshedpur', 'dhanbad',
  ]
  for (const city of CITIES) {
    if (lower.includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1)
    }
  }
  return state // fallback to state
}

async function processCSV() {
  console.log('Processing CSV...')

  // Result structure: { state: { nicDivision: { year: { active, struckOff } } } }
  const byStateNicYear = {}
  // Also city-level (best effort): { state: { city: { nicDivision: { year: count } } } }
  const byCityNicYear = {}

  let headers = null
  let rowCount = 0
  let processed = 0
  let skipped = 0

  const rl = createInterface({ input: createReadStream(CSV_FILE), crlfDelay: Infinity })

  for await (const line of rl) {
    if (!line.trim()) continue
    // Simple CSV split (handles basic quoting)
    const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim())

    if (!headers) {
      headers = values.map(h => h.toUpperCase().replace(/\s+/g, '_'))
      continue
    }

    rowCount++
    if (rowCount % 100_000 === 0) process.stdout.write(`  ${rowCount.toLocaleString()} rows...\r`)

    const row = parseRow(headers, values)
    const nicCode = row['NIC_CODE'] ?? row['NIC'] ?? ''
    const state = row['REGISTERED_STATE'] ?? row['STATE'] ?? ''
    const status = row['COMPANY_STATUS'] ?? row['STATUS'] ?? ''
    const dateStr = row['DATE_OF_INCORPORATION'] ?? row['INCORPORATION_DATE'] ?? ''
    const address = row['REGISTERED_OFFICE_ADDRESS'] ?? row['ADDRESS'] ?? ''

    if (!nicCode || !state || !dateStr) { skipped++; continue }

    const year = parseDate(dateStr)
    if (!year) { skipped++; continue }

    const division = nicCode.slice(0, 2)
    const isActive = status.toLowerCase().includes('active')
    const isStruckOff = status.toLowerCase().includes('struck') || status.toLowerCase().includes('strike')

    // State level
    if (!byStateNicYear[state]) byStateNicYear[state] = {}
    if (!byStateNicYear[state][division]) byStateNicYear[state][division] = {}
    if (!byStateNicYear[state][division][year]) byStateNicYear[state][division][year] = { active: 0, struckOff: 0 }
    if (isActive) byStateNicYear[state][division][year].active++
    else if (isStruckOff) byStateNicYear[state][division][year].struckOff++
    else byStateNicYear[state][division][year].active++ // assume active if unknown

    // City level (best effort)
    const city = extractDistrict(address, state)
    if (!byCityNicYear[city]) byCityNicYear[city] = {}
    if (!byCityNicYear[city][division]) byCityNicYear[city][division] = {}
    if (!byCityNicYear[city][division][year]) byCityNicYear[city][division][year] = { active: 0, struckOff: 0 }
    if (isActive) byCityNicYear[city][division][year].active++
    else if (isStruckOff) byCityNicYear[city][division][year].struckOff++
    else byCityNicYear[city][division][year].active++

    processed++
  }

  console.log(`\n  Processed: ${processed.toLocaleString()}, Skipped: ${skipped.toLocaleString()}`)

  const summary = {
    generated: new Date().toISOString(),
    totalRows: rowCount,
    processed,
    byStateNicYear,
    byCityNicYear,
  }

  await writeFile(OUT_FILE, JSON.stringify(summary))
  console.log(`✓ Saved summary to ${OUT_FILE}`)
  console.log(`  States: ${Object.keys(byStateNicYear).length}`)
  console.log(`  Cities: ${Object.keys(byCityNicYear).length}`)
}

async function main() {
  console.log('=== MCA21 Company Master Data Processor ===\n')

  const downloaded = await downloadCSV()
  if (!downloaded) {
    console.error(`
❌ Could not download MCA21 data.

To use real MCA21 data, either:
  1. Manually download the company master CSV from:
     https://www.mca.gov.in/content/mca/global/en/data-and-reports/company-master-data.html
     Save it as: ${CSV_FILE}
     Then re-run this script.

  2. Register for data.gov.in API key (free):
     https://data.gov.in/user/register
     Then: DATA_GOV_IN_API_KEY=your_key node scripts/fetch-mca21.mjs

  3. If you have MCA portal cookies:
     MCA_COOKIE="your_cookie_here" node scripts/fetch-mca21.mjs

The tool will use curated MCA Annual Report statistics as fallback.
    `)
    process.exit(1)
  }

  await processCSV()
  console.log('\n✅ Done! Run the dev server to use real MCA21 district-level data.')
}

main().catch(console.error)
