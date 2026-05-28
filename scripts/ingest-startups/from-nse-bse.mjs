#!/usr/bin/env node
/**
 * scripts/ingest-startups/from-nse-bse.mjs
 *
 * Phase 2 (d): Listed-company financials from NSE / BSE public JSON.
 *
 * NSE's equity quote API is session-based: a fresh client needs to first GET
 * the home page to set the rgs (rate-guard) cookie, then carry it on the
 * actual /api/quote-equity request. Without that step every IP gets a 401.
 *
 * BSE has a simpler `https://api.bseindia.com/BseIndiaAPI/api/.../w` endpoint
 * that doesn't require cookies but it does require a real User-Agent and
 * `Referer: https://www.bseindia.com/`.
 *
 * For the seed list, we just need:
 *   - Market cap          → latest_valuation
 *   - Last 3 FY revenue / profit / EBITDA → financials[]
 *
 * NSE's quote-equity endpoint returns a "marketDeptOrderBook" + a "info"
 * object; for financials we hit the *separate* corporate-announcements +
 * financial-results endpoint:
 *     https://www.nseindia.com/api/corporates-financial-results?index=equities&symbol=ZOMATO&period=Annual
 * That endpoint returns press releases tied to a results filing. Parsing them
 * out cleanly requires either OCR'ing the PDF (heavy) or reading from the
 * quote-equity response's "metadata.industry" + "priceInfo.lastPrice" only.
 *
 * For v1 (this script) we:
 *   1. Hit quote-equity for market cap.
 *   2. Skip detailed revenue/profit (would require PDF parsing of XBRL or AOC-4
 *      filings, which is a separate scraper).
 *   3. Append a data_sources entry so the editor knows what was checked.
 *
 * If NSE blocks the IP entirely, we log and move on.
 *
 * Flags: --dry-run --limit N --only <slug,slug>
 */

import {
  loadEnv, parseArgs, loadSeedList, getSanityClient,
  ensureStartupExists, startupDocId, dataSourceEntry, politeFetch, sleep, rkey,
  mergeArrayField,
} from './_lib.mjs'

loadEnv()
const args = parseArgs()
const DRY = !!args['dry-run']
const LIMIT = parseInt(args.limit ?? '0', 10) || 0
const ONLY = args.only ? new Set(String(args.only).split(',').map(s => s.trim())) : null

const NSE_HOME    = 'https://www.nseindia.com'
const NSE_API     = 'https://www.nseindia.com/api/quote-equity?symbol='
const NSE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36',
  'Accept':           'application/json, text/plain, */*',
  'Accept-Language':  'en-US,en;q=0.9',
  'Referer':          'https://www.nseindia.com/get-quotes/equity?symbol=ZOMATO',
}

// ────────────────────────────────────────────────────────────────────────────
// NSE session bootstrap. Set cookies via home page GET.
// ────────────────────────────────────────────────────────────────────────────
let cookieJar = ''

async function nseBootstrap() {
  try {
    const res = await fetch(NSE_HOME, { headers: NSE_HEADERS, redirect: 'follow' })
    const setCookies = res.headers.getSetCookie?.() ?? []
    cookieJar = setCookies.map((c) => c.split(';')[0]).filter(Boolean).join('; ')
    if (cookieJar) console.log(`[nse] bootstrapped (${setCookies.length} cookies)`)
    return !!cookieJar
  } catch (e) {
    console.log(`[nse] bootstrap failed: ${e.message}`)
    return false
  }
}

async function fetchNseQuote(symbol) {
  const headers = { ...NSE_HEADERS, Cookie: cookieJar }
  const res = await fetch(NSE_API + encodeURIComponent(symbol), { headers, redirect: 'follow' })
  if (!res.ok) throw new Error(`NSE HTTP ${res.status} for ${symbol}`)
  return res.json()
}

// ────────────────────────────────────────────────────────────────────────────
// Screener.in: scrapes the consolidated annual P&L table from the public HTML
// company page. robots.txt allows /company/* for crawlers.
// Returns array of { fiscal_year, revenue, profit } in absolute rupees, latest first.
// ────────────────────────────────────────────────────────────────────────────
const SCREENER_BASE = 'https://www.screener.in/company/'

async function fetchScreenerFinancials(symbol) {
  const url = `${SCREENER_BASE}${encodeURIComponent(symbol)}/consolidated/`
  const res = await politeFetch(url, {
    accept: 'text/html,application/xhtml+xml',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BusinessIdeasLive-Bot/1.0; +https://businessideas.live)' },
    allowNotOk: true,
    maxAttempts: 2,
  })
  if (!res.ok) {
    // Try without /consolidated/ (some companies only have standalone)
    const fallback = await politeFetch(`${SCREENER_BASE}${encodeURIComponent(symbol)}/`, {
      accept: 'text/html,application/xhtml+xml',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BusinessIdeasLive-Bot/1.0; +https://businessideas.live)' },
      allowNotOk: true,
      maxAttempts: 2,
    })
    if (!fallback.ok) return { rows: [], url: null }
    const html = await fallback.text()
    return { rows: parseScreenerProfitLoss(html), url: `${SCREENER_BASE}${symbol}/` }
  }
  const html = await res.text()
  return { rows: parseScreenerProfitLoss(html), url }
}

function parseScreenerProfitLoss(html) {
  // Screener renders the P&L as <section id="profit-loss"> with a table.
  // Headers are years like "Mar 2024", "Mar 2023". First data row is "Sales".
  const section = html.match(/<section[^>]*id="profit-loss"[\s\S]*?<\/section>/i)?.[0]
  if (!section) return []
  const table = section.match(/<table[\s\S]*?<\/table>/i)?.[0]
  if (!table) return []

  // Headers
  const headRow = table.match(/<thead[\s\S]*?<\/thead>/i)?.[0] || table.match(/<tr[\s\S]*?<\/tr>/i)?.[0] || ''
  const headers = [...headRow.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  )

  // Body rows
  const rowsHtml = [...table.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi)].map((m) => m[0])
  const byLabel = {} // label -> [cell values]
  for (const r of rowsHtml) {
    const cells = [...r.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) =>
      m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    )
    if (cells.length < 2) continue
    const label = cells[0].toLowerCase()
    byLabel[label] = cells.slice(1)
  }

  // Find revenue + profit rows. Sales/Revenue label may vary.
  const salesRow = byLabel['sales'] || byLabel['sales '] || byLabel['revenue'] || byLabel['operating revenue'] || byLabel['interest']
  const profitRow = byLabel['net profit'] || byLabel['net profit '] || byLabel['profit after tax'] || byLabel['profit'] || byLabel['profit/loss']

  const yearCols = headers.slice(1).filter((h) => /\d{4}/.test(h))
  const out = []
  for (let i = 0; i < yearCols.length; i++) {
    const yr = yearCols[i]
    const yearM = yr.match(/(\d{4})/)
    if (!yearM) continue
    const fy = `FY${yearM[1].slice(-2)}` // "Mar 2024" → "FY24"
    const rev = parseScreenerNumber(salesRow?.[i])
    const profit = parseScreenerNumber(profitRow?.[i])
    if (rev == null && profit == null) continue
    // Screener values are in ₹ crore. Convert to absolute rupees.
    out.push({
      fiscal_year: fy,
      revenue: rev != null ? Math.round(rev * 1_00_00_000) : null,
      profit: profit != null ? Math.round(profit * 1_00_00_000) : null,
    })
  }
  return out.reverse() // earliest first → makes Studio easier to read
}

function parseScreenerNumber(s) {
  if (!s) return null
  const cleaned = s.replace(/[,\s]/g, '').replace(/^-+$/, '')
  if (!cleaned) return null
  const n = parseFloat(cleaned)
  if (Number.isNaN(n)) return null
  return n
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────
async function run() {
  const seedList = loadSeedList(LIMIT)
  let targets = ONLY ? seedList.filter((s) => ONLY.has(s.slug)) : seedList
  targets = targets.filter((s) => s.nse_symbol)

  console.log(`[nse-bse] Processing ${targets.length} listed startups (dry=${DRY})`)
  if (!targets.length) return { hit: 0, miss: 0, skipped: 0, errors: 0 }

  // NSE quote endpoint is blocked from many IPs (returns 403 even with the
  // cookie-jar warmup). Skip it by default; pass --skip-nse to force or
  // --include-nse to retry. Screener.in provides the same revenue/profit
  // data at the consolidated/ page with no auth.
  const SKIP_NSE_QUOTE = args['skip-nse'] === undefined || args['skip-nse'] === true ||
    args['skip-nse'] === 'true' ? true : false
  if (!SKIP_NSE_QUOTE) {
    await nseBootstrap()
    await sleep(800)
  } else {
    console.log('[nse] Skipping NSE quote endpoint (use --skip-nse=false to enable). Screener-only mode.')
  }

  let client = null
  if (!DRY) client = await getSanityClient()

  const stats = { hit: 0, miss: 0, skipped: 0, errors: 0 }

  for (const seed of targets) {
    try {
      let quote = null
      if (!SKIP_NSE_QUOTE) {
        try { quote = await fetchNseQuote(seed.nse_symbol) }
        catch (e) {
          console.log(`  NSE miss ${seed.name} (${seed.nse_symbol}): ${e.message} - will still try Screener`)
        }
      }

      // priceInfo + securityInfo nested objects vary by endpoint version.
      // Read defensively.
      const price       = quote?.priceInfo?.lastPrice
      const issuedSize  = quote?.securityInfo?.issuedSize ?? quote?.metadata?.issuedSize
      const marketCapInr = (price && issuedSize) ? Math.round(price * issuedSize) : null
      const industry    = quote?.industryInfo?.industry || quote?.metadata?.industry
      const isin        = quote?.metadata?.isin

      console.log(`  HIT   ${seed.name}: ₹${price ?? '?'} / mcap ₹${marketCapInr ? (marketCapInr/1_00_00_000).toFixed(0)+' cr' : '?'}`)

      if (DRY) { stats.hit++; await sleep(800); continue }

      await ensureStartupExists(client, seed, 'seed-list + NSE')
      const docId = startupDocId(seed.slug)

      // Commit set/setIfMissing first.
      const patch = client.patch(docId)
      if (marketCapInr) patch.setIfMissing({ latest_valuation: marketCapInr })
      patch.set({ last_updated_at: new Date().toISOString() })
      await patch.commit({ autoGenerateArrayKeys: true })

      // Append-style writes via mergeArrayField (read-modify-write).
      const arrayMutations = []
      if (marketCapInr) {
        arrayMutations.push(mergeArrayField(client, docId, 'financials', [{
          _key: rkey('fin'),
          _type: 'financialSnapshot',
          fiscal_year: 'Current (market cap)',
          valuation: marketCapInr,
          currency: 'INR',
          source: 'NSE quote-equity API',
          source_url: `https://www.nseindia.com/get-quotes/equity?symbol=${seed.nse_symbol}`,
        }], 'fiscal_year'))
      }
      const newTags = []
      if (industry) newTags.push(`NSE: ${industry}`)
      if (isin) newTags.push(`ISIN: ${isin}`)
      if (newTags.length) {
        // tags is string[], not object[] — use a simple read-modify-write with set, dedupe by value.
        const cur = await client.fetch(`*[_id == $id][0]{ tags }`, { id: docId })
        const merged = Array.from(new Set([...(cur?.tags || []), ...newTags]))
        await client.patch(docId).set({ tags: merged }).commit()
      }
      arrayMutations.push(mergeArrayField(client, docId, 'data_sources', [
        dataSourceEntry({ source: 'NSE filings', url: `https://www.nseindia.com/get-quotes/equity?symbol=${seed.nse_symbol}` }),
      ], 'source'))

      // ── Historical revenue/profit from Screener.in ────────────────────────
      let screenerCount = 0
      try {
        const { rows: scr, url: scrUrl } = await fetchScreenerFinancials(seed.nse_symbol)
        if (scr.length) {
          const toAdd = scr.map((r) => ({
            _key: rkey('fin'),
            _type: 'financialSnapshot',
            fiscal_year: r.fiscal_year,
            revenue: r.revenue,
            profit: r.profit,
            currency: 'INR',
            source: 'Screener.in (NSE filings)',
            source_url: scrUrl,
          }))
          const added = await mergeArrayField(client, docId, 'financials', toAdd, 'fiscal_year')
          await mergeArrayField(client, docId, 'data_sources', [
            dataSourceEntry({ source: 'Screener.in', url: scrUrl }),
          ], 'source')
          screenerCount = added
          stats.screener_years = (stats.screener_years || 0) + added
        }
      } catch (e) {
        console.log(`    screener fail ${seed.nse_symbol}: ${e.message}`)
      }

      await Promise.all(arrayMutations)
      if (screenerCount) console.log(`        +${screenerCount} FY snapshots from Screener`)
      stats.hit++
      await sleep(800) // be polite to Screener
    } catch (e) {
      console.log(`  ERROR ${seed.name}: ${e.message}`)
      stats.errors++
    }
  }

  console.log('\n[nse-bse] Done.', stats)
  return stats
}

run().catch((e) => { console.error(e); process.exit(1) })
