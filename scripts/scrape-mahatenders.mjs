/**
 * Scrapes active tenders from MahaTenders (mahatenders.gov.in)
 *
 * Uses the same GePNIC/Tapestry architecture as CPPP — same date tab approach,
 * no CAPTCHA for the active tenders listing.
 *
 * Run: DATABASE_URL=... node scripts/scrape-mahatenders.mjs
 */

import { chromium } from 'playwright'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const BASE = 'https://mahatenders.gov.in/nicgep/app'
const MAX_PAGES = 30

function parseDate(str) {
  if (!str) return null
  const m1 = str.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/)
  if (m1) {
    const months = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 }
    const month = months[m1[2]]
    if (month) {
      try { return new Date(`${m1[3]}-${String(month).padStart(2,'0')}-${m1[1].padStart(2,'0')}`).toISOString() } catch {}
    }
  }
  const m2 = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
  if (m2) {
    try { return new Date(`${m2[3]}-${m2[2].padStart(2,'0')}-${m2[1].padStart(2,'0')}`).toISOString() } catch {}
  }
  try { return new Date(str).toISOString() } catch { return null }
}

function parseTitleCell(cell) {
  if (!cell) return { title: '', bidNo: '', refNo: '' }
  const tidMatch = cell.match(/\[(\d{4}_[A-Z][A-Za-z0-9_]+)\]\s*$/)
  const bidNo = tidMatch ? tidMatch[1] : ''
  const brackets = []
  const bRe = /\[([^\]]+)\]/g
  let m
  while ((m = bRe.exec(cell)) !== null) {
    if (m[1] !== bidNo) brackets.push(m[1].trim())
  }
  const firstBracket = brackets[0] || ''
  const isDescriptive = firstBracket.length > 10 && /\s/.test(firstBracket) && !/^[A-Z0-9\/\-]+$/.test(firstBracket)
  const title = isDescriptive ? firstBracket : (brackets[brackets.length - 1] || bidNo)
  const refNo = isDescriptive ? (brackets[1] || brackets[0] || '') : (brackets[0] || '')
  return { title, bidNo, refNo }
}

async function upsertTender(t) {
  try {
    const r = await pool.query(`
      INSERT INTO tenders(id,source,bid_no,title,organization,ministry,department,category,state,
        tender_value,bid_deadline,published_at,status,document_url,item_description,scraped_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())
      ON CONFLICT(bid_no,source) DO UPDATE SET
        title=EXCLUDED.title, organization=EXCLUDED.organization,
        bid_deadline=EXCLUDED.bid_deadline, status=EXCLUDED.status,
        item_description=EXCLUDED.item_description, scraped_at=NOW()
    `, [t.id,t.source,t.bid_no,t.title,t.organization,t.ministry,t.department,t.category,
        t.state,t.tender_value,t.bid_deadline,t.published_at,t.status,t.document_url,t.item_description])
    return r.rowCount > 0
  } catch { return false }
}

async function extractRows(page) {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('table tr')).filter(row => {
      const cells = row.querySelectorAll('td')
      return cells.length >= 5 && /^\d+\.$/.test(cells[0]?.innerText?.trim())
    }).map(row => {
      const cells = Array.from(row.querySelectorAll('td'))
      return {
        published: cells[1]?.innerText?.trim() ?? '',
        closing:   cells[2]?.innerText?.trim() ?? '',
        titleCell: cells[4]?.innerText?.trim() ?? '',
        orgChain:  cells[5]?.innerText?.trim() ?? '',
        link:      row.querySelector('a')?.href ?? '',
      }
    })
  })
}

async function scrapeTab(page, submitName, label) {
  console.log(`\n  Tab: ${label}`)
  await page.evaluate((name) => tapestry.form.submit('ListTendersbyDate', name), submitName)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1200)

  const tenders = []
  let pageNum = 1

  while (pageNum <= MAX_PAGES) {
    const rows = await extractRows(page)
    console.log(`    Page ${pageNum}: ${rows.length} rows`)
    if (!rows.length) break

    for (const row of rows) {
      const { title, bidNo, refNo } = parseTitleCell(row.titleCell)
      if (!bidNo && !refNo) continue

      const id = `maha-${bidNo || refNo}`.replace(/[^a-zA-Z0-9\-]/g, '-').slice(0, 64)
      const orgParts = row.orgChain.split(/\|\|/)
      const organization = orgParts.filter(Boolean).join(' > ')

      tenders.push({
        id,
        source: 'mahatenders',
        bid_no: bidNo || refNo,
        title: title || refNo || bidNo,
        organization,
        ministry: 'Government of Maharashtra',
        department: orgParts[0] || '',
        category: '',
        state: 'Maharashtra',
        tender_value: null,
        bid_deadline: parseDate(row.closing),
        published_at: parseDate(row.published) || new Date().toISOString(),
        status: 'active',
        document_url: row.link || BASE,
        item_description: row.titleCell,
      })
    }

    const nextBtn = await page.$('a:text-matches("Next|>|»"), input[value*="Next"]')
    if (!nextBtn) break
    await nextBtn.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    pageNum++
  }

  return tenders
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
  console.log('Navigating to MahaTenders by Closing Date...')
  await page.goto(`${BASE}?page=FrontEndListTendersbyDate&service=page`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(1500)

  const allTenders = []

  const todayTenders = await scrapeTab(page, 'tabByClosingToday', 'Closing Today')
  allTenders.push(...todayTenders)

  await page.goto(`${BASE}?page=FrontEndListTendersbyDate&service=page`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(1000)
  const week7Tenders = await scrapeTab(page, 'LinkSubmit_0', 'Closing within 7 days')
  allTenders.push(...week7Tenders)

  await page.goto(`${BASE}?page=FrontEndListTendersbyDate&service=page`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(1000)
  const week14Tenders = await scrapeTab(page, 'LinkSubmit_1', 'Closing within 14 days')
  allTenders.push(...week14Tenders)

  // Deduplicate
  const seen = new Set()
  const unique = allTenders.filter(t => {
    if (seen.has(t.bid_no)) return false
    seen.add(t.bid_no)
    return true
  })

  found = unique.length
  console.log(`\nFound ${found} unique MahaTenders. Upserting...`)
  for (const t of unique) { if (await upsertTender(t)) upserted++ }

  console.log(`✅ MahaTenders done: ${upserted}/${found}`)
  await pool.query(
    `UPDATE scrape_log SET finished_at=NOW(),tenders_found=$1,tenders_upserted=$2,status='ok' WHERE id=$3`,
    [found, upserted, logId]
  )
} catch(e) {
  console.error('❌ Error:', e.message)
  await pool.query(`UPDATE scrape_log SET finished_at=NOW(),status='error',error=$1 WHERE id=$2`, [e.message, logId])
} finally {
  await browser.close()
  await pool.end()
}
