#!/usr/bin/env node
/**
 * Fetches real company data from the MCA21 Company Master dataset on data.gov.in.
 * Maps NIC codes to our MSME sectors and outputs lib/msme/companies.ts.
 *
 * Usage:
 *   DATA_GOV_IN_API_KEY=your_key node scripts/fetch-msme-companies.mjs
 *
 * Get a free API key at: https://data.gov.in/user/register  (takes ~2 min)
 *
 * What this produces:
 *   - ~100–150 real registered companies per industry sector
 *   - Company name, city, state, NIC sub-sector, registration year
 *   - Only "Active" status companies included
 *   - Replaces lib/msme/companies.ts entirely
 */

import { writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_PATH   = path.join(__dirname, '..', 'lib', 'msme', 'companies.ts')
const API_KEY    = process.env.DATA_GOV_IN_API_KEY

if (!API_KEY) {
  console.error('ERROR: Set DATA_GOV_IN_API_KEY env var')
  console.error('  Get a free key at https://data.gov.in/user/register')
  process.exit(1)
}

// ── MCA21 Company Master Data resource IDs (per state, data.gov.in) ───────────
const STATE_RESOURCES = [
  { state: 'Maharashtra',      id: 'b83e1bfa-14a6-4ac1-8ce2-3f74b82a0a5d' },
  { state: 'Gujarat',          id: '0bd2c054-87d4-4b58-b134-cedd3d182d10' },
  { state: 'Tamil Nadu',       id: 'ef3e8c06-9543-41a1-a46b-84055ff6c2cc' },
  { state: 'Karnataka',        id: '77cdb9fb-a407-432b-881d-33d02074a6eb' },
  { state: 'Uttar Pradesh',    id: '7620611c-ed65-493f-8eb7-39aabcb338e1' },
  { state: 'Rajasthan',        id: '53d57616-e512-48ff-9200-8298472efe47' },
  { state: 'Punjab',           id: 'b72a91d1-5dd1-4f8d-bddd-12ba5ed50fd9' },
  { state: 'Haryana',          id: '109ae27d-85dc-4076-bb19-77373bc239b1' },
  { state: 'West Bengal',      id: 'd1302dba-c522-415d-90f3-8f3032192f8b' },
  { state: 'Madhya Pradesh',   id: 'e3e56088-9a92-42b0-9ae2-f01275dfb4e7' },
  { state: 'Telangana',        id: 'f82d4ab1-2af8-429a-b650-7858f79b1f16' },
  { state: 'Andhra Pradesh',   id: '33f1e3bd-ffb8-4f69-a8b3-154bbbd0b476' },
  { state: 'Kerala',           id: '2c9f94ca-a87e-49e7-b771-de6f3cb3ab41' },
  { state: 'Delhi',            id: 'bffbc5a2-0c7b-4c7a-be82-6da25438dd07' },
  { state: 'Odisha',           id: 'b24e7923-53e5-4dec-93da-fcec7a25662c' },
  { state: 'Bihar',            id: '5946885d-05cf-44d3-bf81-ecc519a891c6' },
  { state: 'Uttarakhand',      id: '6747de29-2aae-48a0-8c77-b67a870229ab' },
  { state: 'Himachal Pradesh', id: '4d075fd9-a025-42e4-b922-9ee15c4d5fdc' },
  { state: 'Chhattisgarh',     id: 'd06978c6-62c2-43a7-9876-1d6e0f30a8e2' },
  { state: 'Jharkhand',        id: '67739c6d-6cba-42be-87a0-a5a6acef20a2' },
  { state: 'Assam',            id: '87e273ab-e378-4184-98bd-ece0802fa000' },
  { state: 'Chandigarh',       id: '5c3532e6-b8f8-4830-b87b-f24afdb0fcda' },
]

// ── NIC 2004 prefix → NIC 2008 2-digit division ───────────────────────────────
const NIC2004_TO_NIC2008 = {
  '01': '01', '02': '02', '05': '03',
  '15': '10', '16': '12', '17': '13', '18': '14',
  '19': '15', '20': '16', '21': '17', '22': '18',
  '23': '19', '24': '20', '25': '21',
  '26': '22', '27': '24', '28': '25', '29': '28',
  '30': '26', '31': '27', '32': '26', '33': '27',
  '34': '29', '35': '30',
  '36': '31', '37': '38',
  '40': '35', '41': '36',
  '45': '41',
  '50': '45', '51': '46', '52': '47',
  '55': '56',
  '60': '49', '61': '50', '62': '51', '63': '52', '64': '53',
  '65': '64', '66': '65', '67': '66',
  '70': '68',
  '71': '77', '72': '62', '73': '72', '74': '69',
  '75': '84', '80': '85', '85': '86',
  '90': '90', '92': '93', '93': '96',
}

const ACTIVITY_TO_NIC = {
  'agriculture': '01', 'food products': '10', 'beverages': '11', 'tobacco': '12',
  'textiles': '13', 'wearing apparel': '14', 'leather': '15',
  'paper': '17', 'printing': '18', 'chemicals': '20',
  'rubber': '22', 'plastic': '22', 'non-metallic': '23', 'cement': '23',
  'basic metals': '24', 'fabricated metal': '25', 'machinery': '28',
  'computer': '26', 'electronic': '26', 'electrical equipment': '27',
  'motor vehicle': '29', 'electricity': '35',
  'waste': '38', 'recycling': '38', 'construction': '41',
  'wholesale': '46', 'retail': '47',
  'hotels': '55', 'restaurant': '56', 'food service': '56',
  'transport': '49', 'warehousing': '52', 'courier': '53',
  'information technology': '62', 'software': '62', 'it service': '62',
  'financial': '64', 'banking': '64', 'insurance': '65',
  'real estate': '68', 'education': '85', 'coaching': '85',
  'health': '86', 'hospital': '86', 'medical': '86', 'pharmaceutical': '21',
  'veterinary': '75', 'travel': '79', 'tourism': '79',
  'cleaning': '81', 'facility': '81', 'personal service': '96',
  'advertising': '73', 'research': '72',
}

function mapNic(industrialClass, activityDesc) {
  const ic = String(industrialClass ?? '').trim()
  if (ic && ic !== 'NA' && ic !== '0' && ic !== '00000') {
    const s = ic.padStart(5, '0')
    const mapped = NIC2004_TO_NIC2008[s.slice(0, 2)]
    if (mapped) return mapped
    if (ic.length <= 2 && parseInt(ic) > 0) return ic.padStart(2, '0')
  }
  if (activityDesc) {
    const lower = activityDesc.toLowerCase()
    for (const [kw, div] of Object.entries(ACTIVITY_TO_NIC)) {
      if (lower.includes(kw)) return div
    }
  }
  return null
}

// ── NIC 2-digit → our MSME sector ────────────────────────────────────────────
const NIC_TO_SECTOR = {
  '01': 'Agricultural Inputs',
  '10': 'Food & Beverage', '11': 'Food & Beverage', '12': 'Food & Beverage',
  '13': 'Textile & Apparel', '14': 'Textile & Apparel', '15': 'Textile & Apparel',
  '17': 'Paper & Print', '18': 'Paper & Print',
  '20': 'Specialty Chemicals', '21': 'Healthcare & Wellness',
  '22': 'Plastics & Rubber',
  '23': 'Construction Materials',
  '24': 'Metal & Engineering', '25': 'Metal & Engineering', '28': 'Metal & Engineering',
  '29': 'Metal & Engineering', '30': 'Metal & Engineering', '31': 'Metal & Engineering',
  '26': 'Electronics & Electrical', '27': 'Electronics & Electrical',
  '35': 'Clean Energy & Environment', '36': 'Clean Energy & Environment',
  '38': 'Clean Energy & Environment',
  '41': 'Construction Materials', '43': 'Construction Materials',
  '46': 'Export & Trade Services',
  '47': 'D2C & Consumer Brands',
  '49': 'Logistics & Supply Chain', '52': 'Logistics & Supply Chain',
  '53': 'Logistics & Supply Chain',
  '55': 'Travel & Hospitality', '56': 'Travel & Hospitality', '79': 'Travel & Hospitality',
  '62': 'IT & Software Services', '63': 'IT & Software Services', '72': 'IT & Software Services',
  '64': 'Financial Services', '65': 'Financial Services', '66': 'Financial Services',
  '68': 'Real Estate Services',
  '75': 'Pet Care & Veterinary',
  '81': 'Local & Home Services', '82': 'Local & Home Services', '96': 'Local & Home Services',
  '85': 'EdTech & Coaching',
  '86': 'Healthcare & Wellness', '87': 'Healthcare & Wellness',
  '69': 'Industrial Services', '70': 'Industrial Services', '71': 'Industrial Services',
  '73': 'D2C & Consumer Brands',
  '77': 'Industrial Services', '80': 'Industrial Services',
}

const NIC_DESCRIPTION = {
  '01': 'Crop cultivation & farming inputs',
  '10': 'Food processing & manufacturing',
  '11': 'Beverages production',
  '13': 'Textile manufacturing',
  '14': 'Apparel & garment manufacturing',
  '15': 'Leather & footwear',
  '17': 'Paper & paper products',
  '18': 'Printing & publishing',
  '20': 'Chemical manufacturing',
  '21': 'Pharmaceutical manufacturing',
  '22': 'Plastic & rubber products',
  '23': 'Ceramic, tile, cement & glass products',
  '24': 'Iron, steel & basic metals',
  '25': 'Fabricated metal products & tools',
  '26': 'Electronic components & equipment',
  '27': 'Electrical equipment manufacturing',
  '28': 'Machinery & equipment',
  '29': 'Motor vehicles & auto components',
  '30': 'Other transport equipment',
  '31': 'Furniture manufacturing',
  '35': 'Electricity & renewable energy',
  '36': 'Water treatment & supply',
  '38': 'Waste management & recycling',
  '41': 'Building & infrastructure construction',
  '43': 'Specialised construction & installation',
  '46': 'Wholesale trade & distribution',
  '47': 'Retail trade & consumer goods',
  '49': 'Road freight & logistics',
  '52': 'Warehousing & cargo handling',
  '53': 'Courier & last-mile delivery',
  '55': 'Hotels & accommodation',
  '56': 'Restaurants, catering & cloud kitchens',
  '62': 'Software development & IT services',
  '63': 'Data processing & digital platforms',
  '64': 'Banking, lending & financial services',
  '65': 'Insurance & risk management',
  '66': 'Investment & auxiliary financial services',
  '68': 'Real estate development & services',
  '69': 'Legal, accounting & management consulting',
  '70': 'Management consultancy & advisory',
  '71': 'Architecture, engineering & technical services',
  '72': 'R&D & scientific research',
  '73': 'Advertising, marketing & branding',
  '75': 'Veterinary & animal care services',
  '77': 'Equipment rental & leasing',
  '79': 'Travel agencies & tour operators',
  '80': 'Security & investigation services',
  '81': 'Cleaning, maintenance & facilities management',
  '82': 'Office support, BPO & outsourcing',
  '85': 'Education, coaching & vocational training',
  '86': 'Hospitals, clinics & diagnostic services',
  '87': 'Residential care & rehabilitation',
  '96': 'Beauty salons, laundry & personal services',
}

// ── City extraction ───────────────────────────────────────────────────────────
const CITIES = [
  'mumbai','pune','nagpur','nashik','thane','aurangabad','solapur',
  'delhi','new delhi','noida','gurgaon','gurugram','faridabad',
  'bengaluru','bangalore','mysuru','mysore','hubli','mangaluru',
  'chennai','coimbatore','madurai','salem','tiruppur',
  'hyderabad','secunderabad','warangal','visakhapatnam','vijayawada',
  'ahmedabad','surat','vadodara','rajkot','gandhinagar',
  'kolkata','howrah','durgapur','siliguri',
  'jaipur','jodhpur','udaipur','kota',
  'lucknow','kanpur','agra','varanasi','meerut','allahabad',
  'bhopal','indore','gwalior','jabalpur',
  'patna','muzaffarpur',
  'chandigarh','amritsar','ludhiana','jalandhar',
  'bhubaneswar','cuttack',
  'ranchi','jamshedpur',
  'kochi','thiruvananthapuram','kozhikode','thrissur',
  'dehradun','haridwar',
  'guwahati','raipur','srinagar','jammu',
]

function extractCity(address, stateFallback) {
  if (!address) return stateFallback
  const lower = address.toLowerCase()
  for (const city of CITIES) {
    if (lower.includes(city)) {
      return city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }
  }
  return stateFallback
}

// ── Category inference from authorized_cap_in_inr ────────────────────────────
function inferCategory(authorizedCap) {
  const cap = parseFloat(String(authorizedCap ?? '').replace(/[^0-9.]/g, ''))
  if (!cap || isNaN(cap)) return 'Micro'
  // MSME turnover thresholds (rough proxy via authorized capital):
  // Medium: cap > 5 Cr; Small: cap > 50 L; Micro: below
  if (cap >= 50_000_000) return 'Medium'   // ≥ 5 Cr
  if (cap >= 5_000_000)  return 'Small'    // ≥ 50 L
  return 'Micro'
}

// ── API fetch with retry ─────────────────────────────────────────────────────
async function fetchPage(resourceId, offset, limit = 1000) {
  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${API_KEY}&format=json&limit=${limit}&offset=${offset}`
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'BusinessIdeasBot/1.0' } })
      if (res.status === 429) {
        const wait = 30_000 * (attempt + 1)
        console.log(`\n  Rate limited — waiting ${wait / 1000}s…`)
        await new Promise(r => setTimeout(r, wait))
        continue
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${txt.slice(0, 200)}`)
      }
      const data = await res.json()
      if (data.status === 'error') throw new Error(JSON.stringify(data.message ?? data.error))
      return data
    } catch (e) {
      if (attempt === 4) throw e
      await new Promise(r => setTimeout(r, 2_000 * (attempt + 1)))
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== MSME Company Data Fetcher (MCA21 source) ===\n')

  // companiesBySector: sector → Set of {name, city, state, nic2, year, category}
  const companiesBySector = {}

  const PER_SECTOR_TARGET = 120    // stop adding to a sector once it hits this
  const LIMIT = 1000
  const MAX_PAGES_PER_STATE = 10  // up to 10k records per state

  // Probe first resource to see field names
  console.log('Probing field names from first resource…')
  const probe = await fetchPage(STATE_RESOURCES[0].id, 0, 2)
  const sample = (probe?.records ?? [])[0]
  if (sample) {
    console.log('  Fields:', Object.keys(sample).join(', '))
  } else {
    console.error('ERROR: Could not fetch sample. Check your API key.')
    process.exit(1)
  }

  for (const { state, id } of STATE_RESOURCES) {
    // Check if all sectors are already full
    const underFilled = Object.values(NIC_TO_SECTOR)
      .filter((v, i, a) => a.indexOf(v) === i)  // unique sectors
      .filter(sector => (companiesBySector[sector]?.length ?? 0) < PER_SECTOR_TARGET)
    if (underFilled.length === 0) {
      console.log('\nAll sectors full — stopping early.')
      break
    }

    console.log(`\nFetching: ${state} (${underFilled.length} sectors still need more data)`)
    let offset = 0, pages = 0

    while (pages < MAX_PAGES_PER_STATE) {
      let data
      try {
        data = await fetchPage(id, offset, LIMIT)
      } catch (e) {
        console.error(`  Error: ${e.message}`)
        break
      }

      const records = data?.records ?? []
      if (!records.length) break

      let added = 0
      for (const r of records) {
        // Extract fields — MCA21 uses both lower_snake and mixed_Snake naming
        const name = (
          r.company_name || r.Company_Name || r.COMPANY_NAME || ''
        ).trim()
        const activityDesc = (
          r.principal_business_activity_as_per_cin ||
          r.PRINCIPAL_BUSINESS_ACTIVITY_AS_PER_CIN ||
          r.principal_business_activity || ''
        ).trim()
        const industrialClass = r.industrial_class || r.Industrial_Class || r.INDUSTRIAL_CLASS
        const status = (r.company_status || r.Company_status || r.COMPANY_STATUS || '').toLowerCase()
        const address = r.registered_office_address || r.Registered_Office_Address || ''
        const dateReg = r.date_of_registration || r.DATE_OF_REGISTRATION || ''
        const authCap = r.authorized_cap_in_inr || r.authorized_capital || r.AUTHORIZED_CAP || ''

        if (!name || name.length < 3) continue
        if (status && !status.includes('active') && !status.includes('actv')) continue

        const nic2 = mapNic(industrialClass, activityDesc)
        if (!nic2) continue

        const sector = NIC_TO_SECTOR[nic2]
        if (!sector) continue

        if (!companiesBySector[sector]) companiesBySector[sector] = []
        if (companiesBySector[sector].length >= PER_SECTOR_TARGET) continue

        // Deduplicate by name (case-insensitive)
        const key = name.toLowerCase().replace(/\s+/g, ' ')
        if (companiesBySector[sector].some(c => c._key === key)) continue

        const year = dateReg ? new Date(dateReg).getFullYear() : undefined
        const city = extractCity(address, state)

        companiesBySector[sector].push({
          _key:    key,
          name:    toTitleCase(name),
          city,
          state,
          nic2,
          sector,
          subSector: NIC_DESCRIPTION[nic2] || activityDesc.slice(0, 60),
          category:  inferCategory(authCap),
          registeredYear: (year && year >= 1980 && year <= 2025) ? year : undefined,
        })
        added++
      }

      process.stdout.write(`  offset=${offset} records=${records.length} added=${added}\r`)
      offset += records.length
      pages++

      await new Promise(r => setTimeout(r, 200))
      if (records.length < LIMIT) break
    }

    // Print sector fill rates after each state
    const sectorSummary = Object.entries(companiesBySector)
      .map(([s, arr]) => `${s.split(' ')[0]}:${arr.length}`)
      .join(' ')
    console.log(`\n  Sectors: ${sectorSummary}`)
    await new Promise(r => setTimeout(r, 500))
  }

  // ── Sort each sector: Medium > Small > Micro, then alphabetical ──────────────
  for (const sector of Object.keys(companiesBySector)) {
    const order = { Medium: 0, Small: 1, Micro: 2 }
    companiesBySector[sector].sort((a, b) =>
      (order[a.category] - order[b.category]) || a.name.localeCompare(b.name)
    )
  }

  const totalCompanies = Object.values(companiesBySector).reduce((s, a) => s + a.length, 0)
  console.log('\n\n=== Final counts ===')
  for (const [sector, arr] of Object.entries(companiesBySector)) {
    console.log(`  ${sector}: ${arr.length}`)
  }
  console.log(`  TOTAL: ${totalCompanies} companies\n`)

  // ── Generate TypeScript file ───────────────────────────────────────────────
  const allCompanies = Object.values(companiesBySector).flat()

  const companiesTs = allCompanies.map((c, i) => {
    const fields = [
      `    id: '${slugify(c.name)}-${i}'`,
      `    name: ${JSON.stringify(c.name)}`,
      `    city: ${JSON.stringify(c.city)}`,
      `    state: ${JSON.stringify(c.state)}`,
      `    sector: ${JSON.stringify(c.sector)}`,
      `    subSector: ${JSON.stringify(c.subSector)}`,
      `    category: '${c.category}'`,
    ]
    if (c.registeredYear) fields.push(`    registeredYear: ${c.registeredYear}`)
    return `  {\n${fields.join(',\n')},\n  }`
  }).join(',\n')

  const sectorMapTs = Object.entries(MSME_SECTOR_MAP_DEF)
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    .join('\n')

  const ts = `// AUTO-GENERATED — do not edit manually.
// Source: MCA21 Company Master Data — data.gov.in
// Script: scripts/fetch-msme-companies.mjs
// Generated: ${new Date().toISOString().slice(0, 10)}
// Total: ${totalCompanies} active registered companies across ${Object.keys(companiesBySector).length} sectors

export type MSMECategory = 'Micro' | 'Small' | 'Medium'

export interface MSMECompany {
  id: string
  name: string
  city: string
  state: string
  registeredYear?: number
  sector: string
  subSector: string
  category: MSMECategory
  employeeRange?: string
  annualTurnover?: string
  clusterNote?: string
}

export const MSME_SECTOR_MAP: Record<string, string[]> = {
${sectorMapTs}
}

export function matchMSMESector(industry: string): string | undefined {
  const norm = industry.toLowerCase()
  for (const [sector, industries] of Object.entries(MSME_SECTOR_MAP)) {
    if (industries.some(i => i.toLowerCase() === norm)) return sector
  }
  for (const [sector, industries] of Object.entries(MSME_SECTOR_MAP)) {
    if (industries.some(i => norm.includes(i.toLowerCase()) || i.toLowerCase().includes(norm))) return sector
  }
  return undefined
}

export function searchMSMEs(
  sector: string | undefined,
  query?: string,
  state?: string,
  limit = 50,
): MSMECompany[] {
  let results = sector ? COMPANIES.filter(c => c.sector === sector) : COMPANIES
  if (state)  results = results.filter(c => c.state === state)
  if (query)  results = results.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.subSector.toLowerCase().includes(query.toLowerCase()) ||
    c.city.toLowerCase().includes(query.toLowerCase())
  )
  return results.slice(0, limit)
}

export const COMPANIES: MSMECompany[] = [
${companiesTs}
]
`

  await writeFile(OUT_PATH, ts)
  console.log(`✅  Written to ${OUT_PATH}`)
  console.log(`    ${totalCompanies} companies · ${Object.keys(companiesBySector).length} sectors`)
  console.log('\nNext steps:')
  console.log('  npm run build   # verify no TypeScript errors')
  console.log('  git add lib/msme/companies.ts && git commit -m "Real MCA21 MSME data"')
}

const MSME_SECTOR_MAP_DEF = {
  'Construction Materials':    ['manufacturing', 'proptech'],
  'Packaging':                 ['e-commerce', 'logistics', 'export'],
  'Industrial Safety':         ['b2b-services'],
  'Agricultural Inputs':       ['agritech'],
  'Specialty Chemicals':       ['chemicals'],
  'IT & Software Services':    ['SaaS', 'saas', 'AI / ML', 'ai-ml'],
  'EdTech & Coaching':         ['EdTech', 'edtech'],
  'Financial Services':        ['FinTech', 'fintech'],
  'Healthcare & Wellness':     ['Health & Wellness', 'health'],
  'Local & Home Services':     ['Local Services', 'local-services'],
  'D2C & Consumer Brands':     ['E-commerce', 'e-commerce', 'Creator Economy', 'creator-economy'],
  'Clean Energy & Environment':['Climate / Sustainability', 'climate'],
  'Logistics & Supply Chain':  ['logistics'],
  'Real Estate Services':      ['proptech', 'real-estate'],
  'Travel & Hospitality':      ['travel'],
  'Pet Care & Veterinary':     ['petcare'],
  'Export & Trade Services':   ['export'],
  'Food & Beverage':           ['food'],
  'Plastics & Rubber':         ['manufacturing'],
  'Metal & Engineering':       ['manufacturing'],
  'Textile & Apparel':         ['manufacturing'],
  'Industrial Services':       ['b2b-services'],
  'Electronics & Electrical':  ['manufacturing'],
  'Paper & Print':             ['manufacturing'],
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
}

function toTitleCase(str) {
  const skipWords = new Set(['and', 'of', 'the', 'in', 'a', 'an', 'for', 'pvt', 'ltd', 'llp'])
  return str.replace(/\w+/g, (w, i) =>
    (i > 0 && skipWords.has(w.toLowerCase()))
      ? w.toLowerCase()
      : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  )
}

main().catch(e => { console.error(e); process.exit(1) })
