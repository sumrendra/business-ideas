/**
 * Scrapes active tenders + bid results from CPPP (eprocure.gov.in)
 * Run: DATABASE_URL=... node scripts/scrape-cppp.mjs
 * Uses Playwright (Chromium) to render JS and extract data.
 */

import { chromium } from 'playwright'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const BASE = 'https://eprocure.gov.in/eprocure/app'
const MAX_PAGES = 20   // ~500 tenders per run

async function log(source, data) {
  const r = await pool.query(
    `INSERT INTO scrape_log(source, status) VALUES($1,'running') RETURNING id`,
    [source]
  )
  return r.rows[0].id
}

async function finishLog(id, data) {
  await pool.query(
    `UPDATE scrape_log SET finished_at=NOW(), tenders_found=$1, tenders_upserted=$2,
     bids_found=$3, bids_upserted=$4, status=$5, error=$6 WHERE id=$7`,
    [data.found, data.upserted, data.bidsFound ?? 0, data.bidsUpserted ?? 0,
     data.error ? 'error' : 'ok', data.error ?? null, id]
  )
}

async function upsertTender(t) {
  try {
    const r = await pool.query(`
      INSERT INTO tenders(id,source,bid_no,title,organization,ministry,category,state,
        tender_value,bid_deadline,published_at,status,document_url,description,scraped_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
      ON CONFLICT(bid_no,source) DO UPDATE SET
        title=EXCLUDED.title, organization=EXCLUDED.organization,
        ministry=EXCLUDED.ministry, category=EXCLUDED.category,
        state=EXCLUDED.state, tender_value=EXCLUDED.tender_value,
        bid_deadline=EXCLUDED.bid_deadline, status=EXCLUDED.status,
        document_url=EXCLUDED.document_url, description=EXCLUDED.description,
        scraped_at=NOW()
    `, [t.id,t.source,t.bid_no,t.title,t.organization,t.ministry,t.category,t.state,
        t.tender_value,t.bid_deadline,t.published_at,t.status,t.document_url,t.description])
    return r.rowCount > 0
  } catch { return false }
}

function parseINR(str) {
  if (!str) return null
  const clean = str.replace(/[₹,\s]/g, '').replace(/lakhs?/i, '00000').replace(/crores?/i, '0000000')
  const n = parseFloat(clean)
  return isNaN(n) ? null : n
}

function parseDate(str) {
  if (!str) return null
  try { return new Date(str).toISOString() } catch { return null }
}

async function scrapeCPPPActiveTenders(page) {
  console.log('Navigating to CPPP active tenders...')
  await page.goto(`${BASE}?page=FrontEndLatestActiveTenders&service=page`, {
    waitUntil: 'networkidle', timeout: 30000
  })

  const allTenders = []
  let pageNum = 1

  while (pageNum <= MAX_PAGES) {
    console.log(`  Scraping CPPP page ${pageNum}...`)

    // Wait for the tender table to load
    try {
      await page.waitForSelector('table.list_table, table#table, .list-table, table[class*="list"]', { timeout: 10000 })
    } catch {
      // Try any table with tender data
      try { await page.waitForSelector('td a[href*="TenderRef"]', { timeout: 8000 }) }
      catch { console.log('  No tender table found on this page'); break }
    }

    // Extract all tender rows
    const tenders = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tr')).filter(r => r.querySelectorAll('td').length >= 4)
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'))
        const linkEl = row.querySelector('a[href*="TenderRef"], a[href*="eprocure"]')
        const link = linkEl?.href ?? ''
        const texts = cells.map(c => c.innerText?.trim() ?? '')
        return { texts, link }
      }).filter(r => r.texts.some(t => t.length > 5))
    })

    for (const { texts, link } of tenders) {
      // CPPP table columns (typical): No., Ref No., Description, Org, Closing Date, Doc
      if (texts.length < 3) continue
      const tender = {
        id: `cppp-${Buffer.from(texts[1] || link || texts[0] || String(Math.random())).toString('base64').replace(/[^a-zA-Z0-9]/g,'').slice(0, 30)}`,
        source: 'cppp',
        bid_no: texts[1] || texts[0] || '',
        title: texts[2] || texts[1] || 'Untitled Tender',
        organization: texts[3] || '',
        ministry: guessMinistry(texts[3] || ''),
        category: '',
        state: '',
        tender_value: parseINR(texts[5] || texts[4] || ''),
        bid_deadline: parseDate(texts[4] || texts[5] || ''),
        published_at: new Date().toISOString(),
        status: 'active',
        document_url: link || BASE,
        description: texts.slice(0, 6).join(' | '),
      }
      if (tender.bid_no || tender.title) allTenders.push(tender)
    }

    // Check for next page
    const nextBtn = await page.$('a:has-text("Next"), a[title="Next Page"], input[value="Next"]')
    if (!nextBtn) break
    await nextBtn.click()
    await page.waitForLoadState('networkidle')
    pageNum++
  }

  return allTenders
}

async function scrapeCPPPBidResults(page) {
  console.log('Navigating to CPPP bid results...')
  await page.goto(`${BASE}?page=ResultOfTenders&service=page`, {
    waitUntil: 'networkidle', timeout: 30000
  })

  const allBids = []
  let pageNum = 1

  while (pageNum <= MAX_PAGES) {
    console.log(`  Scraping CPPP bid results page ${pageNum}...`)

    try {
      await page.waitForSelector('table tr td', { timeout: 10000 })
    } catch { break }

    const bids = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tr')).filter(r => r.querySelectorAll('td').length >= 4)
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'))
        const link = row.querySelector('a')?.href ?? ''
        return { texts: cells.map(c => c.innerText?.trim() ?? ''), link }
      }).filter(r => r.texts.some(t => t.length > 3))
    })

    for (const { texts, link } of bids) {
      if (texts.length < 3) continue
      const bid = {
        id: `cppp-bid-${Buffer.from(texts[1] || link || String(Math.random())).toString('base64').replace(/[^a-zA-Z0-9]/g,'').slice(0, 30)}`,
        source: 'cppp',
        bid_no: texts[1] || texts[0] || '',
        category: '',
        item_description: texts[2] || '',
        ministry: guessMinistry(texts[3] || ''),
        organization: texts[3] || '',
        state: '',
        l1_price: parseINR(texts[5] || ''),
        l1_seller_name: texts[6] || '',
        estimated_value: parseINR(texts[4] || ''),
        total_bidders: parseInt(texts[7] || '0') || null,
        bid_closing_date: parseDate(texts[4] || ''),
        savings_percent: null,
      }
      if (bid.bid_no || bid.organization) allBids.push(bid)
    }

    const nextBtn = await page.$('a:has-text("Next"), a[title="Next Page"]')
    if (!nextBtn) break
    await nextBtn.click()
    await page.waitForLoadState('networkidle')
    pageNum++
  }

  return allBids
}

function guessMinistry(org) {
  const o = org.toLowerCase()
  if (o.includes('defence') || o.includes('army') || o.includes('navy') || o.includes('air force')) return 'Ministry of Defence'
  if (o.includes('health') || o.includes('aiims') || o.includes('hospital')) return 'Ministry of Health & Family Welfare'
  if (o.includes('railway') || o.includes('rail')) return 'Ministry of Railways'
  if (o.includes('education') || o.includes('school') || o.includes('university') || o.includes('iit') || o.includes('nit')) return 'Ministry of Education'
  if (o.includes('road') || o.includes('highway') || o.includes('nhai')) return 'Ministry of Road Transport'
  if (o.includes('power') || o.includes('electricity') || o.includes('solar') || o.includes('energy')) return 'Ministry of New & Renewable Energy'
  if (o.includes('water') || o.includes('jal')) return 'Ministry of Jal Shakti'
  if (o.includes('police') || o.includes('home')) return 'Ministry of Home Affairs'
  if (o.includes('agriculture') || o.includes('agri') || o.includes('farm')) return 'Ministry of Agriculture'
  if (o.includes('finance') || o.includes('tax') || o.includes('revenue')) return 'Ministry of Finance'
  if (o.includes('it ') || o.includes('technology') || o.includes('meity')) return 'MeitY'
  if (o.includes('urban') || o.includes('municipal') || o.includes('corporation')) return 'Ministry of Housing & Urban Affairs'
  return 'Central Government'
}

// ── Main ─────────────────────────────────────────────────────────────────────
const logId = await log('cppp', {})
let found = 0, upserted = 0, bidsFound = 0, bidsUpserted = 0

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 800 },
})
const page = await ctx.newPage()

try {
  // Active tenders
  const tenders = await scrapeCPPPActiveTenders(page)
  found = tenders.length
  console.log(`\nFound ${found} active tenders. Upserting...`)
  for (const t of tenders) {
    const ok = await upsertTender(t)
    if (ok) upserted++
  }

  // Bid results
  const bids = await scrapeCPPPBidResults(page)
  bidsFound = bids.length
  console.log(`Found ${bidsFound} bid results. Upserting...`)
  for (const b of bids) {
    try {
      const r = await pool.query(`
        INSERT INTO bid_results(id,source,bid_no,category,item_description,ministry,organization,
          state,l1_price,l1_seller_name,estimated_value,total_bidders,bid_closing_date,scraped_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
        ON CONFLICT(bid_no,source) DO UPDATE SET
          l1_price=EXCLUDED.l1_price, l1_seller_name=EXCLUDED.l1_seller_name,
          total_bidders=EXCLUDED.total_bidders, scraped_at=NOW()
      `, [b.id,b.source,b.bid_no,b.category,b.item_description,b.ministry,b.organization,
          b.state,b.l1_price,b.l1_seller_name,b.estimated_value,b.total_bidders,b.bid_closing_date])
      if (r.rowCount > 0) bidsUpserted++
    } catch(e) { /* skip bad row */ }
  }

  console.log(`\n✅ CPPP done: ${upserted}/${found} tenders, ${bidsUpserted}/${bidsFound} bid results`)
  await finishLog(logId, { found, upserted, bidsFound, bidsUpserted })
} catch(e) {
  console.error('❌ Error:', e.message)
  await finishLog(logId, { found, upserted, bidsFound, bidsUpserted, error: e.message })
} finally {
  await browser.close()
  await pool.end()
}
