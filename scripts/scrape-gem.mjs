/**
 * Scrapes active bids + bid results from GeM (bidplus.gem.gov.in)
 *
 * GeM's WAF blocks direct HTTP requests but the `all-bids-data` JSON API works
 * when called from within a browser session (has real cookies + CSRF token).
 * Strategy: load the page once, capture the CSRF token, then call the API
 * from `page.evaluate()` for all pages — no DOM scraping needed.
 *
 * API returns 10 records/page, paginated with `page` param (1-indexed).
 * 37k+ ongoing bids, 5.5M+ bid results available.
 *
 * Bid result L1 data (seller name/price) requires login — not scraped here.
 * We store bid result metadata (bid_no, category, ministry, closed_date).
 *
 * Run: DATABASE_URL=... node scripts/scrape-gem.mjs
 */

import { chromium } from 'playwright'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const BASE = 'https://bidplus.gem.gov.in'
const MAX_PAGES = 500   // 500 pages × 10 = 5,000 bids per run

function parseDate(str) {
  if (!str) return null
  try { return new Date(str).toISOString() } catch { return null }
}

function guessMinistry(min) {
  if (!min) return 'Central Government'
  const m = min.toLowerCase()
  if (m.includes('pmo') || m.includes('prime minister')) return 'Prime Minister\'s Office'
  if (m.includes('defence') || m.includes('defense')) return 'Ministry of Defence'
  if (m.includes('health') || m.includes('medical')) return 'Ministry of Health & Family Welfare'
  if (m.includes('railway')) return 'Ministry of Railways'
  if (m.includes('education') || m.includes('school')) return 'Ministry of Education'
  if (m.includes('road') || m.includes('highway')) return 'Ministry of Road Transport'
  if (m.includes('power') || m.includes('energy') || m.includes('electric')) return 'Ministry of Power'
  if (m.includes('water') || m.includes('jal')) return 'Ministry of Jal Shakti'
  if (m.includes('home') || m.includes('police')) return 'Ministry of Home Affairs'
  if (m.includes('finance') || m.includes('tax')) return 'Ministry of Finance'
  if (m.includes('urban') || m.includes('municipal')) return 'Ministry of Housing & Urban Affairs'
  if (m.includes('atomic') || m.includes('nuclear')) return 'Department of Atomic Energy'
  if (m.includes('space') || m.includes('isro')) return 'Department of Space'
  if (m.includes('heavy') || m.includes('industry')) return 'Ministry of Heavy Industries'
  if (m.includes('commerce') || m.includes('gem')) return 'Ministry of Commerce & Industry'
  return min
}

async function upsertTender(t) {
  try {
    const r = await pool.query(`
      INSERT INTO tenders(id,source,bid_no,title,organization,ministry,department,category,state,
        tender_value,bid_deadline,published_at,status,document_url,item_description,quantity,scraped_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW())
      ON CONFLICT(bid_no,source) DO UPDATE SET
        title=EXCLUDED.title, organization=EXCLUDED.organization,
        ministry=EXCLUDED.ministry, category=EXCLUDED.category,
        bid_deadline=EXCLUDED.bid_deadline, status=EXCLUDED.status,
        item_description=EXCLUDED.item_description, quantity=EXCLUDED.quantity,
        scraped_at=NOW()
    `, [t.id,t.source,t.bid_no,t.title,t.organization,t.ministry,t.department,t.category,
        t.state,t.tender_value,t.bid_deadline,t.published_at,t.status,t.document_url,
        t.item_description,t.quantity])
    return r.rowCount > 0
  } catch { return false }
}

async function upsertBid(b) {
  try {
    const r = await pool.query(`
      INSERT INTO bid_results(id,source,bid_no,category,item_description,ministry,organization,
        state,l1_price,l1_seller_name,estimated_value,total_bidders,award_date,scraped_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
      ON CONFLICT(bid_no,source) DO UPDATE SET
        category=EXCLUDED.category, ministry=EXCLUDED.ministry,
        award_date=EXCLUDED.award_date, scraped_at=NOW()
    `, [b.id,b.source,b.bid_no,b.category,b.item_description,b.ministry,b.organization,
        b.state,null,null,null,null,b.award_date])
    return r.rowCount > 0
  } catch { return false }
}

// ── Call all-bids-data API from within the browser page context ───────────────
// This avoids WAF blocking — the browser session already has valid cookies+CSRF.
async function callGeMAPI(page, csrf, statusType, pageNum) {
  return page.evaluate(async ({ csrf, statusType, pageNum }) => {
    const body = new URLSearchParams({
      payload: JSON.stringify({
        page: pageNum,
        param: { searchBid: "", searchType: "fullText" },
        filter: {
          bidStatusType: statusType,
          byType: "all",
          highBidValue: "",
          byEndDate: { from: "", to: "" },
          sort: "Bid-End-Date-Oldest",
        },
      }),
      csrf_bd_gem_nk: csrf,
    })
    const r = await fetch('/all-bids-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: body.toString(),
    })
    const data = await r.json()
    return {
      total: data?.response?.response?.numFound || 0,
      docs: data?.response?.response?.docs || [],
    }
  }, { csrf, statusType, pageNum })
}

// ── Scrape GeM active bids ────────────────────────────────────────────────────
async function scrapeGeMBids(page, csrf) {
  console.log('Scraping GeM active bids via API...')
  const allTenders = []
  const seen = new Set()

  for (let pg = 1; pg <= MAX_PAGES; pg++) {
    const { total, docs } = await callGeMAPI(page, csrf, 'ongoing_bids', pg)
    if (pg === 1) console.log(`  Total ongoing bids: ${total}`)
    if (!docs.length) break

    for (const d of docs) {
      const bidNo = d.b_bid_number?.[0] || ''
      if (!bidNo || seen.has(bidNo)) continue
      seen.add(bidNo)

      const category  = d.b_category_name?.[0] || d.bd_category_name?.[0] || ''
      const minName   = d.ba_official_details_minName?.[0] || ''
      const deptName  = d.ba_official_details_deptName?.[0] || ''
      const ministry  = guessMinistry(minName || deptName)
      const org       = [deptName, minName].filter(Boolean).join(' — ') || ministry
      const isHighVal = d.is_high_value?.[0] || false

      allTenders.push({
        id: `gem-${bidNo}`.replace(/[^a-zA-Z0-9\-]/g, '-').slice(0, 64),
        source: 'gem',
        bid_no: bidNo,
        title: category,
        organization: org,
        ministry,
        department: deptName,
        category,
        state: '',
        tender_value: isHighVal ? 10000000 : null,  // flag only — real value requires auth
        bid_deadline: parseDate(d.final_end_date_sort?.[0]),
        published_at: parseDate(d.final_start_date_sort?.[0]) || new Date().toISOString(),
        status: 'active',
        document_url: `${BASE}/showbidDocument/${d.b_id?.[0] || ''}`,
        item_description: category,
        quantity: String(d.b_total_quantity?.[0] || ''),
      })
    }

    console.log(`  Page ${pg}: ${docs.length} bids (total collected: ${allTenders.length})`)
    if (allTenders.length >= total) break
    await page.waitForTimeout(300)  // light rate limit
  }

  return allTenders
}

// ── Scrape GeM bid results (metadata only — L1 data requires auth) ────────────
async function scrapeGeMBidResults(page, csrf) {
  console.log('\nScraping GeM bid results via API...')
  const allBids = []
  const seen = new Set()

  // Sort newest first so we get recent results; stop after MAX_PAGES
  const result = await page.evaluate(async ({ csrf }) => {
    const body = new URLSearchParams({
      payload: JSON.stringify({
        page: 1,
        param: { searchBid: "", searchType: "fullText" },
        filter: {
          bidStatusType: "bid_result",
          byType: "all",
          highBidValue: "",
          byEndDate: { from: "", to: "" },
          sort: "Bid-End-Date-Newest",
        },
      }),
      csrf_bd_gem_nk: csrf,
    })
    const r = await fetch('/all-bids-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
      body: body.toString(),
    })
    const data = await r.json()
    return { total: data?.response?.response?.numFound || 0, docs: data?.response?.response?.docs || [] }
  }, { csrf })

  console.log(`  Total bid results available: ${result.total}`)

  // Collect from pages 1..MAX_PAGES (newest first)
  for (let pg = 1; pg <= MAX_PAGES; pg++) {
    const { docs } = await callGeMAPI(page, csrf, 'bid_result', pg)
    if (!docs.length) break

    for (const d of docs) {
      const bidNo = d.b_bid_number?.[0] || d.b_bid_number_parent?.[0] || ''
      if (!bidNo || seen.has(bidNo)) continue
      seen.add(bidNo)

      const category = d.b_category_name?.[0] || d.bd_category_name?.[0] || ''
      const minName  = d.ba_official_details_minName?.[0] || ''
      const deptName = d.ba_official_details_deptName?.[0] || ''
      const ministry = guessMinistry(minName || deptName)

      allBids.push({
        id: `gem-result-${bidNo}`.replace(/[^a-zA-Z0-9\-]/g, '-').slice(0, 64),
        source: 'gem',
        bid_no: bidNo,
        category,
        item_description: category,
        ministry,
        organization: [deptName, minName].filter(Boolean).join(' — ') || ministry,
        state: '',
        // L1 data not in public index — requires login
        award_date: parseDate(d.final_end_date_sort?.[0]),
      })
    }

    console.log(`  Page ${pg}: ${docs.length} results (total collected: ${allBids.length})`)
    if (pg % 50 === 0) await page.waitForTimeout(500)
  }

  return allBids
}

// ── Main ─────────────────────────────────────────────────────────────────────
const logRow = await pool.query(`INSERT INTO scrape_log(source,status) VALUES('gem','running') RETURNING id`)
const logId = logRow.rows[0].id
let found = 0, upserted = 0, bidsFound = 0, bidsUpserted = 0

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'],
})
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 900 },
  extraHTTPHeaders: {
    'sec-ch-ua': '"Google Chrome";v="124", "Chromium";v="124", "Not-A.Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
  },
})
await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }) })
const page = await ctx.newPage()

try {
  // Load page once to get a live session + CSRF token
  let csrf = ''
  page.on('request', req => {
    if (req.url().includes('all-bids-data')) {
      const m = (req.postData() || '').match(/csrf_bd_gem_nk=([a-f0-9]+)/)
      if (m) csrf = m[1]
    }
  })

  console.log('Loading GeM all-bids page...')
  await page.goto(`${BASE}/all-bids`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(6000)  // let the page's own API call fire to capture CSRF

  if (!csrf) {
    // Fallback: read from hidden input
    csrf = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="hidden"]')
      for (const inp of inputs) { if (inp.name === 'csrf_bd_gem_nk' || inp.value?.match(/^[a-f0-9]{32}$/)) return inp.value }
      return ''
    })
  }

  if (!csrf) throw new Error('Could not get CSRF token from GeM page')
  console.log(`CSRF token acquired: ${csrf.slice(0, 8)}...`)

  const tenders = await scrapeGeMBids(page, csrf)
  found = tenders.length
  console.log(`\nFound ${found} active GeM bids. Upserting...`)
  for (const t of tenders) { if (await upsertTender(t)) upserted++ }

  const bids = await scrapeGeMBidResults(page, csrf)
  bidsFound = bids.length
  console.log(`\nFound ${bidsFound} GeM bid results. Upserting...`)
  for (const b of bids) { if (await upsertBid(b)) bidsUpserted++ }

  console.log(`\n✅ GeM done: ${upserted}/${found} tenders, ${bidsUpserted}/${bidsFound} bid results`)
  await pool.query(
    `UPDATE scrape_log SET finished_at=NOW(),tenders_found=$1,tenders_upserted=$2,bids_found=$3,bids_upserted=$4,status='ok' WHERE id=$5`,
    [found, upserted, bidsFound, bidsUpserted, logId]
  )
} catch(e) {
  console.error('❌ Error:', e.message)
  await pool.query(`UPDATE scrape_log SET finished_at=NOW(),status='error',error=$1 WHERE id=$2`, [e.message, logId])
} finally {
  await browser.close()
  await pool.end()
}
