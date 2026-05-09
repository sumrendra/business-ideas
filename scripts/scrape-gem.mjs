/**
 * Scrapes live bids + bid results from GeM (bidplus.gem.gov.in)
 * Run: DATABASE_URL=... node scripts/scrape-gem.mjs
 *
 * When GeM Open API key arrives, update fetchGeMAPI() instead of Playwright.
 */

import { chromium } from 'playwright'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const BASE = 'https://bidplus.gem.gov.in'
const MAX_PAGES = 50   // ~1250 bids per run (25 per page)

// ── If GeM Open API key is set, use it instead of Playwright ─────────────────
async function fetchGeMAPI(endpoint, params = {}) {
  const key = process.env.GEM_API_KEY
  if (!key) return null
  const url = new URL(`https://openapi.gem.gov.in/v1/${endpoint}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, { headers: { 'api-key': key, 'Accept': 'application/json' } })
  if (!res.ok) return null
  return res.json()
}

function parseINR(str) {
  if (!str) return null
  const clean = String(str).replace(/[₹,\s]/g, '')
  const n = parseFloat(clean)
  return isNaN(n) || n === 0 ? null : n
}

function parseDate(str) {
  if (!str) return null
  try { return new Date(str).toISOString() } catch { return null }
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
        state=EXCLUDED.state, tender_value=EXCLUDED.tender_value,
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
        state,l1_price,l1_seller_name,l1_seller_gstin,estimated_value,total_bidders,
        bid_closing_date,savings_percent,scraped_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())
      ON CONFLICT(bid_no,source) DO UPDATE SET
        l1_price=EXCLUDED.l1_price, l1_seller_name=EXCLUDED.l1_seller_name,
        l1_seller_gstin=EXCLUDED.l1_seller_gstin, total_bidders=EXCLUDED.total_bidders,
        savings_percent=EXCLUDED.savings_percent, scraped_at=NOW()
    `, [b.id,b.source,b.bid_no,b.category,b.item_description,b.ministry,b.organization,
        b.state,b.l1_price,b.l1_seller_name,b.l1_seller_gstin,b.estimated_value,
        b.total_bidders,b.bid_closing_date,b.savings_percent])
    return r.rowCount > 0
  } catch { return false }
}

// ── Scrape GeM active bids using Playwright ───────────────────────────────────
async function scrapeGeMBids(page) {
  console.log('Navigating to GeM all-bids...')
  await page.goto(`${BASE}/all-bids`, { waitUntil: 'networkidle', timeout: 30000 })

  const allTenders = []
  let pageNum = 1

  while (pageNum <= MAX_PAGES) {
    console.log(`  GeM bids page ${pageNum}...`)

    // Wait for bid cards to load
    try {
      await page.waitForSelector('.bid-box, .card-body, .bidcard, [class*="bid"], [class*="card"]', { timeout: 15000 })
    } catch {
      console.log('  No bid cards found, trying table...')
      try { await page.waitForSelector('table tbody tr', { timeout: 8000 }) }
      catch { console.log('  No data on this page, stopping'); break }
    }

    // Give JS a moment to fully render
    await page.waitForTimeout(1000)

    const bids = await page.evaluate(() => {
      // GeM bidplus uses card-based layout
      const cards = Array.from(document.querySelectorAll(
        '.bid-box, .bidcard, .card, [class*="bid-card"], [class*="bidcard"]'
      ))

      return cards.map(card => {
        const text = card.innerText || ''
        const link = card.querySelector('a')?.href || ''

        // Extract bid number
        const bidNoMatch = text.match(/GEM[/_\-][A-Z0-9/_\-]+/i)
        const bidNo = bidNoMatch?.[0]?.trim() ?? ''

        // Extract all labeled fields from card
        const fields = {}
        card.querySelectorAll('[class*="label"], [class*="field"], [class*="key"], [class*="title"], dt, th').forEach(el => {
          const key = el.innerText?.trim().toLowerCase().replace(/[^a-z]/g, '_')
          const val = el.nextElementSibling?.innerText?.trim() ?? ''
          if (key && val) fields[key] = val
        })

        // Fallback: extract from raw text
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

        return { bidNo, text: lines.slice(0, 15).join(' | '), link, fields, lines }
      }).filter(b => b.bidNo || b.text.length > 20)
    })

    for (const bid of bids) {
      const lines = bid.lines || []
      const text = bid.text || ''

      // Parse key fields from text
      const catMatch = text.match(/Category[:\s]+([^|]+)/i)
      const orgMatch = text.match(/(?:Buyer|Organization|Organisation|Ministry|Dept)[:\s]+([^|]+)/i)
      const stateMatch = text.match(/State[:\s]+([^|]+)/i)
      const valueMatch = text.match(/(?:Bid Value|Estimated Value|EMD)[:\s]+([₹\d,.]+\s*(?:Lakh|Crore|L|Cr)?)/i)
      const deadlineMatch = text.match(/(?:Closing|End|Last)\s*Date[:\s]+(\d{2}[-/]\d{2}[-/]\d{4}[^|]*)/i)
      const qtyMatch = text.match(/Quantity[:\s]+([^|]+)/i)

      const category = catMatch?.[1]?.trim() || ''
      const org = orgMatch?.[1]?.trim() || ''
      const state = stateMatch?.[1]?.trim() || ''

      const t = {
        id: `gem-${bid.bidNo || Date.now()}`,
        source: 'gem',
        bid_no: bid.bidNo || `GEM-UNKNOWN-${Date.now()}`,
        title: category || lines[0] || 'GeM Tender',
        organization: org,
        ministry: org,
        department: '',
        category,
        state,
        tender_value: parseINR(valueMatch?.[1]),
        bid_deadline: parseDate(deadlineMatch?.[1]),
        published_at: new Date().toISOString(),
        status: 'active',
        document_url: bid.link || `${BASE}/all-bids`,
        item_description: lines.slice(0, 3).join(' '),
        quantity: qtyMatch?.[1]?.trim() || '',
      }
      allTenders.push(t)
    }

    // Try to go to next page
    const nextBtn = await page.$('a[aria-label="Next"], .pagination .next, a:has-text("Next"), button:has-text("Next")')
    if (!nextBtn) break
    await nextBtn.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    pageNum++
  }

  return allTenders
}

// ── Scrape GeM bid results ────────────────────────────────────────────────────
async function scrapeGeMBidResults(page) {
  console.log('\nNavigating to GeM bid results...')
  await page.goto(`${BASE}/bidresultlists/?lang=english`, { waitUntil: 'networkidle', timeout: 30000 })

  const allBids = []
  let pageNum = 1

  while (pageNum <= MAX_PAGES) {
    console.log(`  GeM bid results page ${pageNum}...`)

    try {
      await page.waitForSelector('table tbody tr, .result-card, [class*="result"]', { timeout: 12000 })
    } catch { break }

    await page.waitForTimeout(1000)

    const results = await page.evaluate(() => {
      // Try table rows first
      const rows = Array.from(document.querySelectorAll('table tbody tr'))
      if (rows.length > 0) {
        return rows.map(row => {
          const cells = Array.from(row.querySelectorAll('td'))
          const link = row.querySelector('a')?.href ?? ''
          return { cells: cells.map(c => c.innerText?.trim() ?? ''), link, type: 'table' }
        })
      }
      // Fallback: cards
      return Array.from(document.querySelectorAll('[class*="result"], [class*="bid-result"]')).map(card => ({
        cells: [card.innerText],
        link: card.querySelector('a')?.href ?? '',
        type: 'card',
      }))
    })

    for (const r of results) {
      if (r.cells.length < 3) continue
      const cells = r.cells

      // GeM bid result table columns (typical):
      // Bid No | Item | L1 Seller | L1 Price | No. of Bidders | Est. Value | Closing Date
      const bidNoMatch = (cells[0] || '').match(/GEM[/_\-][A-Z0-9/_\-]+/i)
      const bidNo = bidNoMatch?.[0] || cells[0] || ''

      const bid = {
        id: `gem-result-${bidNo || Date.now()}`,
        source: 'gem',
        bid_no: bidNo,
        category: cells[1] || '',
        item_description: cells[1] || cells[2] || '',
        ministry: '',
        organization: '',
        state: '',
        l1_price: parseINR(cells[3] || cells[4] || ''),
        l1_seller_name: cells[2] || cells[3] || '',
        l1_seller_gstin: '',
        estimated_value: parseINR(cells[5] || ''),
        total_bidders: parseInt(cells[4] || cells[5] || '0') || null,
        bid_closing_date: parseDate(cells[6] || cells[7] || ''),
        savings_percent: null,
      }

      // Calculate savings
      if (bid.estimated_value && bid.l1_price && bid.estimated_value > 0) {
        bid.savings_percent = Math.round(((bid.estimated_value - bid.l1_price) / bid.estimated_value) * 100 * 10) / 10
      }

      if (bid.bid_no || bid.l1_seller_name) allBids.push(bid)
    }

    const nextBtn = await page.$('a[aria-label="Next"], .pagination .next, a:has-text("Next")')
    if (!nextBtn) break
    await nextBtn.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    pageNum++
  }

  return allBids
}

// ── Main ─────────────────────────────────────────────────────────────────────
const logRow = await pool.query(`INSERT INTO scrape_log(source,status) VALUES('gem','running') RETURNING id`)
const logId = logRow.rows[0].id
let found = 0, upserted = 0, bidsFound = 0, bidsUpserted = 0

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
})
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 900 },
  extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
})
const page = await ctx.newPage()

// Suppress non-critical console noise
page.on('console', m => { if (m.type() === 'error') console.error(' [page]', m.text().slice(0, 80)) })

try {
  const tenders = await scrapeGeMBids(page)
  found = tenders.length
  console.log(`\nFound ${found} active GeM bids. Upserting to DB...`)
  for (const t of tenders) {
    const ok = await upsertTender(t)
    if (ok) upserted++
  }

  const bids = await scrapeGeMBidResults(page)
  bidsFound = bids.length
  console.log(`Found ${bidsFound} GeM bid results. Upserting to DB...`)
  for (const b of bids) {
    const ok = await upsertBid(b)
    if (ok) bidsUpserted++
  }

  console.log(`\n✅ GeM done: ${upserted}/${found} tenders, ${bidsUpserted}/${bidsFound} bid results`)
  await pool.query(
    `UPDATE scrape_log SET finished_at=NOW(),tenders_found=$1,tenders_upserted=$2,
     bids_found=$3,bids_upserted=$4,status='ok' WHERE id=$5`,
    [found, upserted, bidsFound, bidsUpserted, logId]
  )
} catch(e) {
  console.error('❌ Error:', e.message)
  await pool.query(
    `UPDATE scrape_log SET finished_at=NOW(),status='error',error=$1 WHERE id=$2`,
    [e.message, logId]
  )
} finally {
  await browser.close()
  await pool.end()
}
