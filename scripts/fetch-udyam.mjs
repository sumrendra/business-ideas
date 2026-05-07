#!/usr/bin/env node
// Preprocesses Udyam MSME registration data from data.gov.in for all app cities.
// Output: public/data/udyam/summary.json
// Usage: DATA_GOV_IN_API_KEY=xxx node scripts/fetch-udyam.mjs
//        DATA_GOV_IN_API_KEY=xxx node scripts/fetch-udyam.mjs --city "Mumbai" --city "Pune"

import { writeFile, readFile, mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_PATH  = path.join(__dirname, '..', 'public', 'data', 'udyam', 'summary.json')
const API_KEY   = process.env.DATA_GOV_IN_API_KEY
const RESOURCE_ID = '8b68ae56-84cf-4728-a0a6-1be11028dea7'

if (!API_KEY) { console.error('Set DATA_GOV_IN_API_KEY env var'); process.exit(1) }

// All app cities: [state, district] — district must match Udyam API spelling (uppercase)
const CITIES = [
  ['Maharashtra',     'Mumbai',           'THANE'],
  ['Delhi',           'Delhi',            'NEW DELHI'],
  ['Karnataka',       'Bengaluru',        'BENGALURU (URBAN)'],
  ['Telangana',       'Hyderabad',        'HYDERABAD'],
  ['Gujarat',         'Ahmedabad',        'AHMEDABAD'],
  ['Tamil Nadu',      'Chennai',          'CHENNAI'],
  ['West Bengal',     'Kolkata',          'KOLKATA'],
  ['Maharashtra',     'Pune',             'PUNE'],
  ['Gujarat',         'Surat',            'SURAT'],
  ['Rajasthan',       'Jaipur',           'JAIPUR'],
  ['Uttar Pradesh',   'Lucknow',          'LUCKNOW'],
  ['Uttar Pradesh',   'Kanpur',           'KANPUR NAGAR'],
  ['Maharashtra',     'Nagpur',           'NAGPUR'],
  ['Madhya Pradesh',  'Indore',           'INDORE'],
  ['Madhya Pradesh',  'Bhopal',           'BHOPAL'],
  ['Andhra Pradesh',  'Visakhapatnam',    'VISAKHAPATNAM'],
  ['Bihar',           'Patna',            'PATNA'],
  ['Gujarat',         'Vadodara',         'VADODARA'],
  ['Uttar Pradesh',   'Ghaziabad',        'GHAZIABAD'],
  ['Punjab',          'Ludhiana',         'LUDHIANA'],
  ['Uttar Pradesh',   'Agra',             'AGRA'],
  ['Maharashtra',     'Nashik',           'NASHIK'],
  ['Haryana',         'Faridabad',        'FARIDABAD'],
  ['Uttar Pradesh',   'Meerut',           'MEERUT'],
  ['Gujarat',         'Rajkot',           'RAJKOT'],
  ['Tamil Nadu',      'Coimbatore',       'COIMBATORE'],
  ['Kerala',          'Kochi',            'ERNAKULAM'],
  ['Chandigarh',      'Chandigarh',       'CHANDIGARH'],
  ['Assam',           'Guwahati',         'KAMRUP'],
  ['Kerala',          'Thiruvananthapuram','THIRUVANANTHAPURAM'],
  ['Chhattisgarh',    'Raipur',           'RAIPUR'],
  ['Uttarakhand',     'Dehradun',         'DEHRADUN'],
  ['Punjab',          'Amritsar',         'AMRITSAR'],
  ['Jharkhand',       'Ranchi',           'RANCHI'],
  ['Rajasthan',       'Jodhpur',          'JODHPUR'],
  ['Tamil Nadu',      'Madurai',          'MADURAI'],
  ['Karnataka',       'Mysuru',           'MYSURU'],
  ['Haryana',         'Gurgaon',          'GURUGRAM'],
  ['Uttar Pradesh',   'Noida',            'GAUTAM BUDDHA NAGAR'],
  ['Madhya Pradesh',  'Jabalpur',         'JABALPUR'],
  ['Uttar Pradesh',   'Varanasi',         'VARANASI'],
  ['Karnataka',       'Mangaluru',        'DAKSHINA KANNADA'],
  ['Tamil Nadu',      'Tiruppur',         'TIRUPPUR'],
  ['Odisha',          'Bhubaneswar',      'KHORDHA'],
  ['Punjab',          'Jalandhar',        'JALANDHAR'],
  ['Rajasthan',       'Udaipur',          'UDAIPUR'],
  ['Andhra Pradesh',  'Nellore',          'NELLORE'],
  ['Karnataka',       'Hubli-Dharwad',    'DHARWAD'],
  ['Himachal Pradesh','Shimla',           'SHIMLA'],
  ['Manipur',         'Imphal',           'IMPHAL WEST'],
  ['Puducherry',      'Puducherry',       'PONDICHERRY'],
]

// Parse --city filters
const args = process.argv.slice(2)
const filterCities = []
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--city' && args[i + 1]) filterCities.push(args[i + 1]); i++
}
const targetCities = filterCities.length
  ? CITIES.filter(([, name]) => filterCities.includes(name))
  : CITIES

function parseYear(dateStr) {
  const parts = dateStr?.split('/')
  if (parts?.length !== 3) return null
  const year = parseInt(parts[2])
  return year >= 2019 && year <= new Date().getFullYear() ? year : null
}

function matchesNic(activitiesJson, nicPrefix) {
  if (!activitiesJson) return true
  try {
    const acts = JSON.parse(activitiesJson)
    return acts.some(a => a.NIC5DigitId?.startsWith(nicPrefix))
  } catch { return false }
}

async function fetchPage(state, district, offset, limit = 500) {
  const params = new URLSearchParams({
    'api-key': API_KEY,
    'format': 'json',
    'limit': String(limit),
    'offset': String(offset),
    'filters[State]': state.toUpperCase(),
    'filters[District]': district,
  })
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(`https://api.data.gov.in/resource/${RESOURCE_ID}?${params}`,
        { headers: { 'User-Agent': 'BusinessIdeasBot/1.0' } })
      if (res.status === 429) {
        const wait = 30000 * (attempt + 1)
        process.stdout.write(`\n    Rate limited — waiting ${wait / 1000}s...`)
        await new Promise(r => setTimeout(r, wait))
        continue
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      if (attempt === 4) throw e
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
    }
  }
}

async function processCity(state, cityName, district) {
  // Fetch up to 2000 records (API hard limit is 10k but Udyam is 39M — district slice is manageable)
  const LIMIT = 500
  const MAX_RECORDS = 2000

  const first = await fetchPage(state, district, 0, LIMIT)
  const total = parseInt(first?.total ?? 0)
  if (!total || !first?.records?.length) return null

  const allRecords = [...(first.records ?? [])]
  const pages = Math.min(Math.ceil(total / LIMIT), MAX_RECORDS / LIMIT)
  for (let page = 1; page < pages; page++) {
    await new Promise(r => setTimeout(r, 300)) // gentle pacing
    const data = await fetchPage(state, district, page * LIMIT, LIMIT)
    allRecords.push(...(data?.records ?? []))
    process.stdout.write(`\r    ${allRecords.length}/${Math.min(total, MAX_RECORDS)} sampled (${Math.round(allRecords.length / Math.min(total, MAX_RECORDS) * 100)}%)`)
  }

  // Group by NIC 2-digit prefix + year
  // byNicYear: { "56": { 2020: 12, 2021: 18 }, "47": { ... } }
  const byNicYear = {}
  let totalCount = 0

  for (const r of allRecords) {
    const year = r.RegistrationDate ? parseYear(r.RegistrationDate) : null
    if (!year) continue

    // Determine NIC divisions for this record
    let nics = []
    try {
      const acts = r.Activities ? JSON.parse(r.Activities) : []
      nics = [...new Set(acts.map(a => a.NIC5DigitId?.slice(0, 2)).filter(Boolean))]
    } catch { /* skip */ }

    if (!nics.length) nics = ['00'] // uncategorized

    for (const nic of nics) {
      byNicYear[nic] ??= {}
      byNicYear[nic][year] = (byNicYear[nic][year] ?? 0) + 1
    }
    totalCount++
  }

  // Scale factor if we didn't fetch all records
  const scaleFactor = allRecords.length < total ? total / allRecords.length : 1.0

  // Apply scale to each NIC/year count
  if (scaleFactor > 1.0) {
    for (const nic of Object.keys(byNicYear)) {
      for (const year of Object.keys(byNicYear[nic])) {
        byNicYear[nic][year] = Math.round(byNicYear[nic][year] * scaleFactor)
      }
    }
  }

  return { byNicYear, totalCount: Math.round(totalCount * scaleFactor), sampled: allRecords.length, total }
}

async function main() {
  console.log('=== Udyam MSME Preprocessor ===\n')
  console.log(`Cities to process: ${targetCities.map(c => c[1]).join(', ')}`)

  // Load existing summary
  let summary = { byCityNicYear: {}, generatedAt: null }
  try {
    const raw = await readFile(OUT_PATH, 'utf-8')
    summary = JSON.parse(raw)
    console.log(`Loaded existing summary (${Object.keys(summary.byCityNicYear).length} cities already processed)\n`)
  } catch { console.log('Starting fresh\n') }

  for (const [state, cityName, district] of targetCities) {
    if (summary.byCityNicYear[cityName]) {
      console.log(`  Skipping ${cityName} (already processed)`)
      continue
    }

    process.stdout.write(`  Processing ${cityName} (${state}, district: ${district})...\n`)
    try {
      const result = await processCity(state, cityName, district)
      if (!result) {
        console.log(`    No data found`)
        continue
      }
      const { byNicYear, totalCount, sampled, total } = result
      const scaleFactor = total > sampled ? (total / sampled).toFixed(1) : '1.0'
      process.stdout.write(`\n    Total: ${total.toLocaleString()} | Sampled: ${sampled} | Scale ×${scaleFactor} | NIC divisions: ${Object.keys(byNicYear).length}\n`)
      summary.byCityNicYear[cityName] = byNicYear

      // Save after each city
      summary.generatedAt = new Date().toISOString()
      await mkdir(path.dirname(OUT_PATH), { recursive: true })
      await writeFile(OUT_PATH, JSON.stringify(summary))
      console.log(`  ✓ Saved (${Object.keys(summary.byCityNicYear).length} cities so far)`)
    } catch (e) {
      console.error(`  ✗ Failed: ${e.message}`)
    }

    await new Promise(r => setTimeout(r, 500)) // between cities
  }

  console.log(`\n✅ Done! ${Object.keys(summary.byCityNicYear).length} cities in ${OUT_PATH}`)
}

main()
