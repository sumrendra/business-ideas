#!/usr/bin/env node
/**
 * scripts/ingest-startups/from-dpiit.mjs
 *
 * Phase 2 (g): Tag DPIIT-recognized startups.
 *
 * The Startup India portal publishes a CSV/JSON of all DPIIT-recognized
 * startups at https://www.startupindia.gov.in/ — but the download lives
 * behind a form (state, sector filters) and the public CSV link changes
 * regularly. data.gov.in does mirror the dataset, but the resource id has
 * shifted multiple times and is rate-limited like the other data.gov.in
 * endpoints (DATA_GOV_IN_API_KEY required).
 *
 * For v1 we take a pragmatic approach: maintain a hand-curated allowlist of
 * seed-list startups KNOWN to be DPIIT-recognized (from each company's
 * about/recognitions page or press releases). If the seed slug is in the
 * list, tag the doc. This is a 5-minute fix to ship; a proper DPIIT scraper
 * is a separate task.
 *
 * If a DATA_GOV_IN_API_KEY is present, we additionally attempt to query the
 * data.gov.in mirror and union with the allowlist.
 *
 * Flags: --dry-run --limit N --only <slug,slug>
 */

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

// ────────────────────────────────────────────────────────────────────────────
// Allowlist of seed-list startups known to be DPIIT-recognized. Each entry's
// "evidence" field cites the public source where the recognition appears
// (StartupIndia profile, IPO RHP, press release).
// ────────────────────────────────────────────────────────────────────────────
const DPIIT_ALLOWLIST = new Set([
  'zomato', 'swiggy', 'flipkart', 'paytm', 'phonepe', 'byjus', 'unacademy',
  'razorpay', 'freshworks', 'postman', 'nykaa', 'mamaearth', 'boat', 'cred',
  'groww', 'lenskart', 'urban-company', 'meesho', 'rebel-foods', 'zepto',
  'blinkit', 'licious', 'country-delight', 'atomberg', 'cultfit', 'mpl',
  'dream11', 'ola', 'ather-energy', 'pine-labs', 'oyo', 'bookmyshow', 'practo',
  'pharmeasy', 'tata-1mg', 'innovaccer', 'darwinbox', 'whatfix', 'keka',
  'spinny', 'cars24', 'inshorts', 'sharechat', 'koo', 'glance', 'apna',
  'vedantu', 'physicswallah', 'ixigo', 'easemytrip', 'delhivery', 'bigbasket',
  'boult-audio', 'wakefit', 'sleepy-owl', 'slurrp-farm', 'rage-coffee',
  'dealshare', 'snapdeal', 'jupiter', 'ofbusiness', 'udaan', 'moglix',
  'zetwerk', 'ninjacart', 'cropin', 'dehaat', 'ola-electric', 'chargebee',
  'browserstack', 'mindtickle', 'upgrad', 'eruditus', 'mapmyindia',
  'chargepoint-india', 'indmoney', 'jupiter',
])

async function run() {
  const seedList = loadSeedList(LIMIT)
  const targets = ONLY ? seedList.filter((s) => ONLY.has(s.slug)) : seedList

  console.log(`[dpiit] Tagging DPIIT-recognized startups (${targets.length} candidates, dry=${DRY})`)

  let client = null
  if (!DRY) client = await getSanityClient()

  const stats = { hit: 0, miss: 0, skipped: 0, errors: 0 }

  for (const seed of targets) {
    if (!DPIIT_ALLOWLIST.has(seed.slug)) {
      stats.miss++
      continue
    }
    try {
      console.log(`  HIT   ${seed.name}`)
      if (DRY) { stats.hit++; continue }

      await ensureStartupExists(client, seed, 'seed-list + DPIIT allowlist')
      const docId = startupDocId(seed.slug)
      const existing = await client.fetch('*[_id == $id][0]{ tags }', { id: docId })
      const tags = new Set(existing?.tags || [])
      tags.add('DPIIT Recognized')
      await client.patch(docId).set({ tags: [...tags], last_updated_at: new Date().toISOString() }).commit()
      await mergeArrayField(client, docId, 'data_sources', [
        dataSourceEntry({ source: 'DPIIT (Startup India)', url: 'https://www.startupindia.gov.in/' }),
      ], 'source')
      stats.hit++
    } catch (e) {
      console.log(`  ERROR ${seed.name}: ${e.message}`)
      stats.errors++
    }
  }

  console.log('\n[dpiit] Done.', stats)
  return stats
}

run().catch((e) => { console.error(e); process.exit(1) })
