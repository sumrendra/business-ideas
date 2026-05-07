#!/usr/bin/env node
/**
 * MCA21 Company Master Data — data.gov.in API Preprocessor
 *
 * Fetches state-by-state company master data from data.gov.in,
 * maps Industrial_Class (NIC 2004, 5-digit) → NIC 2008 2-digit divisions,
 * and generates a state/city/NIC/year summary JSON for use by Local Market Radar.
 *
 * Output: public/data/mca21/summary.json
 *
 * Usage:
 *   DATA_GOV_IN_API_KEY=your_key node scripts/fetch-mca21.mjs
 *   DATA_GOV_IN_API_KEY=your_key node scripts/fetch-mca21.mjs --state Maharashtra
 *   DATA_GOV_IN_API_KEY=your_key node scripts/fetch-mca21.mjs --state Delhi --state Karnataka
 *
 * Requires: Node 18+, DATA_GOV_IN_API_KEY env var
 */

import { mkdirSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'data', 'mca21')
const OUT_FILE = path.join(OUT_DIR, 'summary.json')

mkdirSync(OUT_DIR, { recursive: true })

const API_KEY = process.env.DATA_GOV_IN_API_KEY
if (!API_KEY) {
  console.error('❌ Set DATA_GOV_IN_API_KEY env var')
  process.exit(1)
}

// ── State → data.gov.in resource ID (MCA Company Master Data, most recent per state) ──
// Full cross-sector company master datasets (March 2021 preferred over Feb 2019 sector cuts)
const STATE_RESOURCE_IDS = {
  'Andhra Pradesh':    '33f1e3bd-ffb8-4f69-a8b3-154bbbd0b476',
  'Arunachal Pradesh': 'af3ce5b4-a469-4a0d-9e55-d2faa054afbd',
  'Assam':             '87e273ab-e378-4184-98bd-ece0802fa000',  // Mar 2021 full
  'Bihar':             '5946885d-05cf-44d3-bf81-ecc519a891c6',
  'Chandigarh':        '5c3532e6-b8f8-4830-b87b-f24afdb0fcda',
  'Chhattisgarh':      'd06978c6-62c2-43a7-9876-1d6e0f30a8e2',
  'Delhi':             'bffbc5a2-0c7b-4c7a-be82-6da25438dd07',  // Mar 2021, 366k, full sectors
  'Goa':               '2b79db52-0e25-4cca-940c-696af5421790',
  'Gujarat':           '0bd2c054-87d4-4b58-b134-cedd3d182d10',
  'Haryana':           '109ae27d-85dc-4076-bb19-77373bc239b1',
  'Himachal Pradesh':  '4d075fd9-a025-42e4-b922-9ee15c4d5fdc',  // Mar 2021
  'Jharkhand':         '67739c6d-6cba-42be-87a0-a5a6acef20a2',
  'Karnataka':         '77cdb9fb-a407-432b-881d-33d02074a6eb',  // Mar 2021 full sectors
  'Kerala':            '2c9f94ca-a87e-49e7-b771-de6f3cb3ab41',
  'Madhya Pradesh':    'e3e56088-9a92-42b0-9ae2-f01275dfb4e7',
  'Maharashtra':       'b83e1bfa-14a6-4ac1-8ce2-3f74b82a0a5d',  // Mar 2021 full sectors
  'Manipur':           'e50d367c-e325-4c3c-beb4-25b8d710c4b1',
  'Meghalaya':         '8c658b1c-8ee6-474c-9ac8-09e54df73479',
  'Mizoram':           '87f853c6-59ee-41dd-aaa2-2fbdfb660ced',  // Mar 2021
  'Nagaland':          '234a3beb-d519-4941-8263-6fbbedc6cc46',  // Mar 2021
  'Odisha':            'b24e7923-53e5-4dec-93da-fcec7a25662c',
  'Puducherry':        'f2416803-1cb3-4331-9b20-5876657ad86e',
  'Punjab':            'b72a91d1-5dd1-4f8d-bddd-12ba5ed50fd9',
  'Rajasthan':         '53d57616-e512-48ff-9200-8298472efe47',
  'Sikkim':            '9c3b10c4-89cf-4134-929b-a0f4f9864bb9',  // Mar 2021
  'Tamil Nadu':        'ef3e8c06-9543-41a1-a46b-84055ff6c2cc',
  'Telangana':         'f82d4ab1-2af8-429a-b650-7858f79b1f16',
  'Tripura':           'a22c20cc-0bc0-44b2-a187-656dd3da3ebf',
  'Uttar Pradesh':     '7620611c-ed65-493f-8eb7-39aabcb338e1',
  'Uttarakhand':       '6747de29-2aae-48a0-8c77-b67a870229ab',
  'West Bengal':       'd1302dba-c522-415d-90f3-8f3032192f8b',
}

// ── NIC 2004 (5-digit prefix) → NIC 2008 2-digit division ───────────────────
// MCA uses NIC 2004 codes in Industrial_Class field.
// We map the leading 2 digits of the 5-digit code to NIC 2008 divisions.
const NIC2004_TO_NIC2008 = {
  '01': '01', '02': '02', '05': '03',                   // Agriculture, forestry, fishing
  '10': '05', '11': '06', '12': '07', '13': '08', '14': '09', // Mining
  '15': '10', '16': '12', '17': '13', '18': '14',       // Food, tobacco, textiles, leather
  '19': '15', '20': '16', '21': '17', '22': '18',       // Wood, paper, printing
  '23': '19', '24': '20', '25': '21',                   // Petroleum, chemicals
  '26': '22', '27': '24', '28': '25', '29': '28',       // Rubber, metals, machinery
  '30': '26', '31': '27', '32': '26', '33': '27',       // Electronics, electrical
  '34': '29', '35': '30',                               // Motor vehicles, other transport
  '36': '31', '37': '38',                               // Furniture, recycling
  '40': '35', '41': '36',                               // Electricity, water
  '45': '41',                                           // Construction
  '50': '45', '51': '46', '52': '47',                   // Motor trade, wholesale, retail
  '55': '56',                                           // Hotels & restaurants → Food service
  '60': '49', '61': '50', '62': '51', '63': '52', '64': '53', // Transport & communications
  '65': '64', '66': '65', '67': '66',                   // Finance & insurance
  '70': '68',                                           // Real estate
  '71': '77', '72': '62', '73': '72', '74': '69',       // IT, R&D, professional services
  '75': '84',                                           // Public administration
  '80': '85',                                           // Education
  '85': '86',                                           // Health
  '90': '90', '91': '91', '92': '93', '93': '96',       // Community & personal services
  '95': '97', '99': '99',
}

const ACTIVITY_TO_NIC2008 = {
  'agriculture': '01', 'hunting': '01', 'fishing': '03', 'forestry': '02',
  'mining': '05', 'quarrying': '08',
  'food products': '10', 'beverages': '11', 'tobacco': '12',
  'textiles': '13', 'wearing apparel': '14', 'leather': '15',
  'wood': '16', 'paper': '17', 'printing': '18',
  'petroleum': '19', 'chemicals': '20', 'rubber': '22',
  'basic metals': '24', 'fabricated metal': '25', 'machinery': '28',
  'computer': '26', 'electronic': '26', 'electrical equipment': '27',
  'motor vehicle': '29', 'transport equipment': '30', 'furniture': '31',
  'electricity': '35', 'water supply': '36',
  'construction': '41',
  'wholesale': '46', 'retail': '47', 'motor trade': '45',
  'hotels': '55', 'restaurants': '56', 'food service': '56',
  'transport': '49', 'warehousing': '52',
  'communication': '61', 'information technology': '62', 'software': '62',
  'financial intermediation': '64', 'banking': '64',
  'insurance': '65', 'real estate': '68',
  'business service': '69', 'professional': '69', 'legal': '69',
  'scientific': '72', 'advertising': '73',
  'public administration': '84', 'education': '85',
  'health': '86', 'hospital': '86', 'medical': '86',
  'entertainment': '90', 'sports': '93', 'personal service': '96',
}

function mapNic(industrialClass, activityDescription) {
  const ic = String(industrialClass ?? '').trim()
  if (ic && ic !== 'NA' && ic !== '0') {
    const s = ic.padStart(5, '0')
    const mapped = NIC2004_TO_NIC2008[s.slice(0, 2)]
    if (mapped) return mapped
    // Direct 2-digit NIC 2008
    if (ic.length <= 2 && parseInt(ic) > 0) return ic.padStart(2, '0')
  }
  // Fallback to activity description
  if (activityDescription) {
    const lower = activityDescription.toLowerCase()
    for (const [kw, div] of Object.entries(ACTIVITY_TO_NIC2008)) {
      if (lower.includes(kw)) return div
    }
  }
  return null
}

// ── City extraction from address ─────────────────────────────────────────────
const CITY_PATTERNS = [
  'mumbai', 'pune', 'nagpur', 'nashik', 'aurangabad', 'thane', 'solapur',
  'delhi', 'new delhi', 'noida', 'gurgaon', 'gurugram', 'faridabad',
  'bengaluru', 'bangalore', 'mysuru', 'mysore', 'hubli', 'mangaluru',
  'chennai', 'coimbatore', 'madurai', 'salem', 'tiruchirappalli', 'tiruppur',
  'hyderabad', 'secunderabad', 'warangal', 'visakhapatnam', 'vijayawada',
  'ahmedabad', 'surat', 'vadodara', 'rajkot', 'gandhinagar',
  'kolkata', 'howrah', 'durgapur', 'asansol', 'siliguri',
  'jaipur', 'jodhpur', 'udaipur', 'kota', 'ajmer',
  'lucknow', 'kanpur', 'agra', 'varanasi', 'allahabad', 'prayagraj', 'meerut',
  'bhopal', 'indore', 'gwalior', 'jabalpur',
  'patna', 'gaya', 'muzaffarpur',
  'chandigarh', 'amritsar', 'ludhiana', 'jalandhar',
  'bhubaneswar', 'cuttack', 'rourkela',
  'ranchi', 'jamshedpur', 'dhanbad',
  'kochi', 'thiruvananthapuram', 'kozhikode', 'thrissur',
  'dehradun', 'haridwar',
  'guwahati',
  'srinagar', 'jammu',
]

function extractCity(address, stateFallback) {
  if (!address) return stateFallback
  const lower = address.toLowerCase()
  for (const city of CITY_PATTERNS) {
    if (lower.includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1)
    }
  }
  return stateFallback
}

// ── API fetch with retry ─────────────────────────────────────────────────────
async function fetchPage(resourceId, offset, limit = 500) {
  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${API_KEY}&format=json&limit=${limit}&offset=${offset}`
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'BusinessIdeasBot/1.0' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.status === 'error') throw new Error(data.message || 'API error')
      return data
    } catch (e) {
      if (attempt === 2) throw e
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
}

// ── Process one state ────────────────────────────────────────────────────────
async function processState(stateName, resourceId, existing) {
  console.log(`\n  Processing ${stateName}...`)

  const first = await fetchPage(resourceId, 0, 1)
  const total = first.total
  console.log(`    Total companies: ${total.toLocaleString()}`)

  const byNicYear   = {}  // { nicDiv: { year: { active, struckOff } } }
  const byCityNicYear = {} // { city: { nicDiv: { year: count } } }

  // data.gov.in enforces a hard limit: max offset = 10,000 (ElasticSearch window).
  // Fetch up to 10k records as a sample, then extrapolate to full state total.
  const MAX_RECORDS = 10000
  const LIMIT = 500
  const sampleTarget = Math.min(total, MAX_RECORDS)

  let processed = 0, skipped = 0, fetched = 0

  for (let offset = 0; offset < sampleTarget; offset += LIMIT) {
    const data = await fetchPage(resourceId, offset, LIMIT)
    const records = data.records ?? []
    if (!records.length) break

    for (const r of records) {
      const activity = r.principal_business_activity_as_per_cin ?? r.PRINCIPAL_BUSINESS_ACTIVITY_AS_PER_CIN ?? ''
      const nicDiv = mapNic(r.industrial_class ?? r.Industrial_Class, activity)
      const dateStr = r.date_of_registration ?? r.DATE_OF_REGISTRATION ?? ''
      const status  = (r.company_status ?? r.Company_status ?? '').toLowerCase()
      const address = r.registered_office_address ?? r.Registered_Office_Address ?? ''

      fetched++
      if (!nicDiv || !dateStr || dateStr === 'NA') { skipped++; continue }

      const year = new Date(dateStr).getFullYear()
      if (isNaN(year) || year < 1956 || year > 2025) { skipped++; continue }

      const isActive    = status.includes('active') || status.includes('actv')
      const isStruckOff = status.includes('struck') || status.includes('strike') || status.includes('strf')

      if (!byNicYear[nicDiv]) byNicYear[nicDiv] = {}
      if (!byNicYear[nicDiv][year]) byNicYear[nicDiv][year] = { active: 0, struckOff: 0 }
      if (isActive) byNicYear[nicDiv][year].active++
      else if (isStruckOff) byNicYear[nicDiv][year].struckOff++
      else byNicYear[nicDiv][year].active++

      const city = extractCity(address, stateName)
      if (!byCityNicYear[city]) byCityNicYear[city] = {}
      if (!byCityNicYear[city][nicDiv]) byCityNicYear[city][nicDiv] = {}
      if (!byCityNicYear[city][nicDiv][year]) byCityNicYear[city][nicDiv][year] = { active: 0, struckOff: 0 }
      if (isActive) byCityNicYear[city][nicDiv][year].active++
      else if (isStruckOff) byCityNicYear[city][nicDiv][year].struckOff++
      else byCityNicYear[city][nicDiv][year].active++

      processed++
    }

    process.stdout.write(`    ${fetched}/${sampleTarget} sampled (${Math.round(fetched / sampleTarget * 100)}%)\r`)
    await new Promise(r => setTimeout(r, 200))
  }

  // Extrapolate state-level counts to full total; city counts stay as-is (address parsing imprecise)
  const scaleFactor = fetched > 0 ? total / fetched : 1
  if (scaleFactor > 1.1) {
    for (const nicDiv of Object.keys(byNicYear)) {
      for (const year of Object.keys(byNicYear[nicDiv])) {
        byNicYear[nicDiv][year].active    = Math.round(byNicYear[nicDiv][year].active    * scaleFactor)
        byNicYear[nicDiv][year].struckOff = Math.round(byNicYear[nicDiv][year].struckOff * scaleFactor)
      }
    }
  }

  console.log(`\n    Sampled: ${fetched.toLocaleString()}/${total.toLocaleString()} | Extrapolation ×${scaleFactor.toFixed(1)} | Processed: ${processed.toLocaleString()} | Skipped: ${skipped.toLocaleString()}`)
  return { byNicYear, byCityNicYear }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== MCA21 Company Master — data.gov.in Preprocessor ===\n')

  // Parse --state flags
  const args = process.argv.slice(2)
  const stateFilter = []
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--state' && args[i + 1]) stateFilter.push(args[++i])
  }

  const statesToProcess = stateFilter.length > 0
    ? Object.entries(STATE_RESOURCE_IDS).filter(([s]) => stateFilter.includes(s))
    : Object.entries(STATE_RESOURCE_IDS)

  console.log(`States to process: ${statesToProcess.map(([s]) => s).join(', ')}`)

  // Load existing summary if present (to merge incrementally)
  let existing = { generated: null, byStateNicYear: {}, byCityNicYear: {} }
  try {
    const raw = await readFile(OUT_FILE, 'utf-8')
    existing = JSON.parse(raw)
    console.log(`Loaded existing summary (${Object.keys(existing.byStateNicYear).length} states already processed)`)
  } catch { /* fresh start */ }

  for (const [stateName, resourceId] of statesToProcess) {
    try {
      const { byNicYear, byCityNicYear } = await processState(stateName, resourceId, existing)
      existing.byStateNicYear[stateName] = byNicYear
      // Merge city data
      for (const [city, nicData] of Object.entries(byCityNicYear)) {
        if (!existing.byCityNicYear[city]) existing.byCityNicYear[city] = {}
        for (const [nic, yearData] of Object.entries(nicData)) {
          if (!existing.byCityNicYear[city][nic]) existing.byCityNicYear[city][nic] = {}
          for (const [year, counts] of Object.entries(yearData)) {
            const prev = existing.byCityNicYear[city][nic][year] ?? { active: 0, struckOff: 0 }
            existing.byCityNicYear[city][nic][year] = {
              active: prev.active + counts.active,
              struckOff: prev.struckOff + counts.struckOff,
            }
          }
        }
      }
    } catch (e) {
      console.error(`  ⚠ Failed ${stateName}: ${e.message}`)
    }

    // Save after each state (incremental)
    existing.generated = new Date().toISOString()
    existing.totalStates = Object.keys(existing.byStateNicYear).length
    existing.totalCities = Object.keys(existing.byCityNicYear).length
    await writeFile(OUT_FILE, JSON.stringify(existing))
    console.log(`  ✓ Saved (${existing.totalStates} states, ${existing.totalCities} cities so far)`)
  }

  console.log(`\n✅ Done! Summary: ${existing.totalStates} states, ${existing.totalCities} cities`)
  console.log(`   Output: ${OUT_FILE}`)
  console.log(`\n   Restart the dev server to use real MCA21 data in Local Market Radar.`)
}

main().catch(console.error)
