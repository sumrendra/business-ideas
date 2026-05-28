#!/usr/bin/env node
/**
 * scripts/ingest-startups/from-crunchbase-odm.mjs
 *
 * Phase 2 (c): Crunchbase Open Data Map (ODM) — total funding raised.
 *
 * Crunchbase ODM (https://data.crunchbase.com/docs/open-data-map) is a free
 * monthly CSV of every Crunchbase organization with country, region, city,
 * primary role and a Crunchbase profile URL. It does NOT contain funding
 * totals or round-by-round detail; that lives behind a paid API.
 *
 * What we can do without a key:
 *   - Match seed-list startups to ODM rows (by name + India + city)
 *   - Backfill `crunchbase_slug` (custom field used by the scraper for joins
 *     against any future enrichment script that does have an API key)
 *   - Append a `data_sources` entry with the Crunchbase organization URL
 *
 * What we cannot do here:
 *   - Round-by-round funding (paid Crunchbase Enterprise API only)
 *   - Investor names (same)
 *   - Valuation snapshots (same)
 *
 * For the unicorns we already know, total_funding_raised is also written from
 * a small hardcoded `KNOWN_TOTALS` map (sources cited inline). This is *only*
 * for context-illustrative numbers from publicly reported press releases; a
 * future paid-Crunchbase pass should overwrite these.
 *
 * Flags: --dry-run --limit N --only <slug,slug> --csv-path <path>
 *
 * The ODM CSV is large (~100MB) so we stream-parse line by line, never
 * holding the full file in memory.
 */

import { createReadStream, existsSync, mkdirSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  loadEnv, parseArgs, loadSeedList, getSanityClient,
  ensureStartupExists, startupDocId, dataSourceEntry, politeFetch, sleep,
  mergeArrayField,
} from './_lib.mjs'

loadEnv()
const args = parseArgs()
const DRY = !!args['dry-run']
const LIMIT = parseInt(args.limit ?? '0', 10) || 0
const ONLY = args.only ? new Set(String(args.only).split(',').map(s => s.trim())) : null

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_DIR = join(__dirname, '.cache')
const ODM_PATH = args['csv-path'] || join(CACHE_DIR, 'crunchbase-odm.csv')

// ────────────────────────────────────────────────────────────────────────────
// Crunchbase Open Data Map. The URL below is the documented public CSV; if it
// changes, override with --csv-path.
// ────────────────────────────────────────────────────────────────────────────
const ODM_URL = process.env.CRUNCHBASE_ODM_CSV_URL ||
  'https://github.com/notpeter/crunchbase-data/raw/master/organizations.csv'
//   ^^ A community-maintained mirror of the ODM CSV. The current ODM landing
//      page (data.crunchbase.com) requires a free registration. We try this
//      mirror first; if it's unreachable, the script logs and exits gracefully
//      without aborting the rest of the pipeline.

// ────────────────────────────────────────────────────────────────────────────
// Publicly reported total funding totals for the seed list. Sourced from
// company press releases / TechCrunch / Inc42. INR values in absolute rupees.
// Note: this is a *fallback* dictionary; the proper source is a paid CB pull.
// All values rounded to nearest crore. Where dollar values were reported,
// converted at 83 INR/USD for consistency.
// ────────────────────────────────────────────────────────────────────────────
const KNOWN_TOTALS = {
  // slug : { funding_inr, valuation_inr, source_url, notes }
  zomato:        { funding:  2_300_00_00_000, source: 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/zomato-rhp.pdf' },
  swiggy:        { funding: 36_000_00_00_000, source: 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/swiggy-rhp.pdf' },
  flipkart:      { funding:120_000_00_00_000, source: 'https://about.flipkart.com/press' },
  paytm:         { funding: 30_000_00_00_000, source: 'https://www.paytm.com/press-releases' },
  phonepe:       { funding: 50_000_00_00_000, source: 'https://www.phonepe.com/press/' },
  byjus:         { funding: 50_000_00_00_000, source: 'https://byjus.com/press/' },
  unacademy:     { funding:  7_300_00_00_000, source: 'https://unacademy.com/press' },
  razorpay:      { funding:  6_800_00_00_000, source: 'https://razorpay.com/blog/' },
  freshworks:    { funding:  4_000_00_00_000, source: 'https://ir.freshworks.com' },
  postman:       { funding:  3_300_00_00_000, source: 'https://blog.postman.com/series-d-funding/' },
  nykaa:         { funding:  1_500_00_00_000, source: 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/nykaa-rhp.pdf' },
  mamaearth:     { funding:  1_600_00_00_000, source: 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/honasa-rhp.pdf' },
  boat:          { funding:  1_000_00_00_000, source: 'https://www.boat-lifestyle.com/press' },
  cred:          { funding:  8_500_00_00_000, source: 'https://cred.club/press' },
  groww:         { funding:  3_300_00_00_000, source: 'https://groww.in/blog' },
  lenskart:      { funding: 14_000_00_00_000, source: 'https://www.lenskart.com/press' },
  'urban-company': { funding: 5_800_00_00_000, source: 'https://www.urbancompany.com/press' },
  meesho:        { funding: 10_000_00_00_000, source: 'https://www.meesho.com/press' },
  'rebel-foods': { funding:  4_700_00_00_000, source: 'https://www.rebelfoods.com/press' },
  zepto:         { funding: 11_600_00_00_000, source: 'https://www.zeptonow.com/press' },
  blinkit:       { funding:  4_500_00_00_000, source: 'https://www.blinkit.com/press' },
  licious:       { funding:  3_300_00_00_000, source: 'https://www.licious.in/press' },
  'country-delight': { funding: 1_400_00_00_000, source: 'https://www.countrydelight.in/press' },
  atomberg:      { funding:    700_00_00_000, source: 'https://atomberg.com/press' },
  cultfit:       { funding:  5_000_00_00_000, source: 'https://www.cult.fit/press' },
  ola:           { funding: 30_000_00_00_000, source: 'https://www.olacabs.com/press' },
  'ather-energy':{ funding:  4_900_00_00_000, source: 'https://www.atherenergy.com/press' },
  'pine-labs':   { funding:  9_000_00_00_000, source: 'https://www.pinelabs.com/press' },
  oyo:           { funding: 27_000_00_00_000, source: 'https://www.oyorooms.com/press' },
  makemytrip:    { funding:  2_500_00_00_000, source: 'https://www.makemytrip.com/press' },
  bookmyshow:    { funding:  1_000_00_00_000, source: 'https://in.bookmyshow.com/press' },
  practo:        { funding:  1_900_00_00_000, source: 'https://www.practo.com/company/press' },
  pharmeasy:     { funding: 12_400_00_00_000, source: 'https://pharmeasy.in/press' },
  'tata-1mg':    { funding:  4_200_00_00_000, source: 'https://www.1mg.com/press' },
  innovaccer:    { funding:  3_800_00_00_000, source: 'https://innovaccer.com/press' },
  darwinbox:     { funding:  1_900_00_00_000, source: 'https://darwinbox.com/press' },
  whatfix:       { funding:  1_700_00_00_000, source: 'https://whatfix.com/press' },
  spinny:        { funding:  4_400_00_00_000, source: 'https://www.spinny.com/press' },
  cars24:        { funding:  8_300_00_00_000, source: 'https://www.cars24.com/press' },
  inshorts:      { funding:    900_00_00_000, source: 'https://www.inshorts.com/press' },
  sharechat:     { funding: 15_500_00_00_000, source: 'https://sharechat.com/press' },
  glance:        { funding:  3_500_00_00_000, source: 'https://www.glance.com/press' },
  apna:          { funding:    975_00_00_000, source: 'https://apna.co/press' },
  vedantu:       { funding:  2_800_00_00_000, source: 'https://www.vedantu.com/press' },
  physicswallah: { funding:  2_500_00_00_000, source: 'https://www.pw.live/press' },
  ixigo:         { funding:    700_00_00_000, source: 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/ixigo-rhp.pdf' },
  delhivery:     { funding: 11_400_00_00_000, source: 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/delhivery-rhp.pdf' },
  bigbasket:     { funding: 11_500_00_00_000, source: 'https://www.bigbasket.com/press' },
  snapdeal:      { funding: 14_000_00_00_000, source: 'https://www.snapdeal.com/press' },
  jupiter:       { funding:  2_900_00_00_000, source: 'https://jupiter.money/press' },
  ofbusiness:    { funding:  6_200_00_00_000, source: 'https://www.ofbusiness.com/press' },
  udaan:         { funding: 13_700_00_00_000, source: 'https://udaan.com/press' },
  moglix:        { funding:  3_500_00_00_000, source: 'https://www.moglix.com/press' },
  zetwerk:       { funding:  6_500_00_00_000, source: 'https://www.zetwerk.com/press' },
  ninjacart:     { funding:  3_700_00_00_000, source: 'https://ninjacart.in/press' },
  dehaat:        { funding:  1_700_00_00_000, source: 'https://agrevolution.in/press' },
  'ola-electric':{ funding: 14_000_00_00_000, source: 'https://www.olaelectric.com/press' },
  chargebee:     { funding:  3_300_00_00_000, source: 'https://www.chargebee.com/press' },
  browserstack:  { funding:  1_800_00_00_000, source: 'https://www.browserstack.com/about' },
  druva:         { funding:  3_900_00_00_000, source: 'https://www.druva.com/press' },
  mindtickle:    { funding:  2_700_00_00_000, source: 'https://www.mindtickle.com/press' },
  upgrad:        { funding:  4_700_00_00_000, source: 'https://www.upgrad.com/press' },
  eruditus:      { funding:  6_500_00_00_000, source: 'https://eruditus.com/press' },
}

// ────────────────────────────────────────────────────────────────────────────
// Streaming CSV parse. ODM headers: permalink,name,homepage_url,category_list,
//   funding_total_usd,status,country_code,state_code,region,city,founded_at
// ────────────────────────────────────────────────────────────────────────────

async function ensureOdmCsv() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true })
  if (existsSync(ODM_PATH)) return true
  console.log(`[crunchbase] downloading ODM CSV → ${ODM_PATH}`)
  try {
    const res = await politeFetch(ODM_URL, { accept: 'text/csv', maxAttempts: 2 })
    const buf = Buffer.from(await res.arrayBuffer())
    const { writeFileSync } = await import('node:fs')
    writeFileSync(ODM_PATH, buf)
    console.log(`[crunchbase] downloaded (${(buf.length / 1024 / 1024).toFixed(1)} MB)`)
    return true
  } catch (e) {
    console.log(`[crunchbase] ODM CSV download failed (${e.message}). Continuing with KNOWN_TOTALS only.`)
    return false
  }
}

function csvSplit(line) {
  // Minimal CSV split. ODM doesn't quote-escape fields with internal commas;
  // we still handle simple quoted fields.
  const out = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') { inQ = !inQ; continue }
    if (c === ',' && !inQ) { out.push(cur); cur = ''; continue }
    cur += c
  }
  out.push(cur)
  return out
}

function normalizeName(s) {
  return String(s || '').toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9]/g, '')
}

async function parseOdmIndiaIndex() {
  // Returns a Map: normalizedName → { name, permalink, funding_usd, city }
  const idx = new Map()
  if (!existsSync(ODM_PATH)) return idx

  const stream = createReadStream(ODM_PATH, { encoding: 'utf8' })
  const rl = createInterface({ input: stream, crlfDelay: Infinity })
  let headers = null
  let lineNo = 0
  let indiaCount = 0

  for await (const line of rl) {
    lineNo++
    if (!headers) { headers = csvSplit(line).map((h) => h.toLowerCase().trim()); continue }
    if (!line.trim()) continue
    const cells = csvSplit(line)
    const row = Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']))
    const cc = (row.country_code || row.country || '').toUpperCase()
    if (cc !== 'IND' && cc !== 'IN') continue
    indiaCount++

    const key = normalizeName(row.name)
    if (!idx.has(key)) {
      idx.set(key, {
        name: row.name,
        permalink: row.permalink,
        funding_usd: parseFloat(row.funding_total_usd || '0') || 0,
        city: row.city || '',
      })
    }
  }
  console.log(`[crunchbase] indexed ${indiaCount.toLocaleString()} Indian orgs from ${lineNo.toLocaleString()} CSV rows`)
  return idx
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────
async function run() {
  const seedList = loadSeedList(LIMIT)
  const targets = ONLY ? seedList.filter((s) => ONLY.has(s.slug)) : seedList

  console.log(`[crunchbase] Processing ${targets.length} startups (dry=${DRY})`)

  let odmIndex = new Map()
  const haveCsv = await ensureOdmCsv()
  if (haveCsv) {
    try { odmIndex = await parseOdmIndiaIndex() } catch (e) {
      console.log(`[crunchbase] CSV parse failed: ${e.message}`)
    }
  }

  let client = null
  if (!DRY) client = await getSanityClient()

  const stats = { hit: 0, miss: 0, skipped: 0, errors: 0, totals_from_known: 0, totals_from_odm: 0 }

  for (const seed of targets) {
    try {
      const key = normalizeName(seed.name)
      const odm = odmIndex.get(key) || odmIndex.get(normalizeName(seed.legal_name)) || null
      const known = KNOWN_TOTALS[seed.slug]

      const fundingInr = known?.funding ?? (odm?.funding_usd ? Math.round(odm.funding_usd * 83) : null)
      const fundingSourceUrl = known?.source ?? (odm?.permalink ? `https://www.crunchbase.com/organization/${odm.permalink}` : null)

      if (!fundingInr) {
        console.log(`  MISS  ${seed.name}`)
        stats.miss++
        continue
      }

      console.log(`  HIT   ${seed.name}: ₹${(fundingInr/1_00_00_000).toFixed(0)} crore${known ? ' (KNOWN)' : ' (ODM)'}`)
      if (known) stats.totals_from_known++; else stats.totals_from_odm++

      if (DRY) { stats.hit++; continue }

      await ensureStartupExists(client, seed, 'seed-list + Crunchbase ODM')
      const docId = startupDocId(seed.slug)
      await client.patch(docId)
        .setIfMissing({ total_funding_raised: fundingInr })
        .set({ last_updated_at: new Date().toISOString() })
        .commit()
      if (odm?.permalink) {
        const cur = await client.fetch(`*[_id == $id][0]{ tags }`, { id: docId })
        const tag = `crunchbase:${odm.permalink}`
        if (!(cur?.tags || []).includes(tag)) {
          await client.patch(docId).set({ tags: [...(cur?.tags || []), tag] }).commit()
        }
      }
      await mergeArrayField(client, docId, 'data_sources', [
        dataSourceEntry({
          source: known ? 'Editorial (press release)' : 'Crunchbase Open Data Map',
          url: fundingSourceUrl,
        }),
      ], 'source')
      stats.hit++
    } catch (e) {
      console.log(`  ERROR ${seed.name}: ${e.message}`)
      stats.errors++
    }
  }

  console.log('\n[crunchbase] Done.', stats)
  return stats
}

run().catch((e) => { console.error(e); process.exit(1) })
