/**
 * Scrapes active tenders from MahaTenders (mahatenders.gov.in)
 * Run: DATABASE_URL=... node scripts/scrape-mahatenders.mjs
 */

import { chromium } from 'playwright'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const BASE = 'https://mahatenders.gov.in'
const MAX_PAGES = 20

function parseINR(str) {
  if (!str) return null
  const clean = String(str).replace(/[₹,\s]/g, '').replace(/lakhs?/i, '00000').replace(/crores?/i, '0000000')
  const n = parseFloat(clean)
  return isNaN(n) || n === 0 ? null : n
}

function parseDate(str) {
  if (!str) return null
  // Handle DD-MM-YYYY or DD/MM/YYYY
  const m = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
  if (m) {
    try { return new Date(`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`).toISOString() } catch { return null }
  }
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
        category=EXCLUDED.category, tender_value=EXCLUDED.tender_value,
        bid_deadline=EXCLUDED.bid_deadline, status=EXCLUDED.status,
        item_description=EXCLUDED.item_description, scraped_at=NOW()
    `, [t.id,t.source,t.bid_no,t.title,t.organization,t.ministry,t.department,t.category,
        t.state,t.tender_value,t.bid_deadline,t.published_at,t.status,t.document_url,
        t.item_description,t.quantity])
    return r.rowCount > 0
  } catch { return false }
}

async function scrapeMahaTenders(page) {
  console.log('Navigating to MahaTenders...')
  await page.goto(`${BASE}/nicgep/app?page=FrontEndLatestActiveTenders&service=page`, {
    waitUntil: 'networkidle', timeout: 30000
  })

  const allTenders = []
  let pageNum = 1

  while (pageNum <= MAX_PAGES) {
    console.log(`  MahaTenders page ${pageNum}...`)

    try {
      await page.waitForSelector('table tr td, .tender-list, [class*="tender"]', { timeout: 10000 })
    } catch { break }

    await page.waitForTimeout(800)

    const tenders = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tr')).filter(r => r.querySelectorAll('td').length >= 3)
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'))
        const link = row.querySelector('a')?.href ?? ''
        return { texts: cells.map(c => c.innerText?.trim() ?? ''), link }
      }).filter(r => r.texts.some(t => t.length > 5))
    })

    for (const { texts, link } of tenders) {
      if (texts.length < 3) continue
      // MahaTenders columns: Sr No | Ref No | Title | Org | Closing Date | Value
      const bidNo = texts[1] || texts[0] || ''
      if (!bidNo || bidNo === 'Sr No' || bidNo === 'S.No') continue

      const t = {
        id: `maha-${Buffer.from(bidNo).toString('base64').slice(0, 16)}-${Date.now()}`,
        source: 'mahatenders',
        bid_no: bidNo,
        title: texts[2] || texts[1] || 'Maharashtra Tender',
        organization: texts[3] || '',
        ministry: 'Government of Maharashtra',
        department: texts[3] || '',
        category: '',
        state: 'Maharashtra',
        tender_value: parseINR(texts[5] || texts[4] || ''),
        bid_deadline: parseDate(texts[4] || texts[5] || ''),
        published_at: new Date().toISOString(),
        status: 'active',
        document_url: link || `${BASE}/nicgep/app`,
        item_description: texts.slice(0, 4).join(' | '),
        quantity: '',
      }
      if (t.bid_no && t.bid_no.length > 3) allTenders.push(t)
    }

    const nextBtn = await page.$('a:has-text("Next"), a[title="Next Page"], input[value="Next"]')
    if (!nextBtn) break
    await nextBtn.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    pageNum++
  }

  return allTenders
}

// ── Main ─────────────────────────────────────────────────────────────────────
const logRow = await pool.query(`INSERT INTO scrape_log(source,status) VALUES('mahatenders','running') RETURNING id`)
const logId = logRow.rows[0].id
let found = 0, upserted = 0

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
})
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 900 },
})
const page = await ctx.newPage()

try {
  const tenders = await scrapeMahaTenders(page)
  found = tenders.length
  console.log(`\nFound ${found} MahaTenders. Upserting...`)
  for (const t of tenders) {
    const ok = await upsertTender(t)
    if (ok) upserted++
  }
  console.log(`✅ MahaTenders done: ${upserted}/${found}`)
  await pool.query(
    `UPDATE scrape_log SET finished_at=NOW(),tenders_found=$1,tenders_upserted=$2,status='ok' WHERE id=$3`,
    [found, upserted, logId]
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
