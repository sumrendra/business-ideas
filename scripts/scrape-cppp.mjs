/**
 * Scrapes active tenders + bid awards from CPPP (eprocure.gov.in)
 *
 * Active tenders: "Tenders by Closing Date" page — NO CAPTCHA via date tabs.
 * Bid Awards: "ResultOfTenders" page — CAPTCHA solved with Tesseract.js.
 *   The solver removes dot-separators between chars before OCR.
 *
 * Run: DATABASE_URL=... node scripts/scrape-cppp.mjs
 */

import { chromium } from 'playwright'
import pg from 'pg'
import { solveCaptchaFromElement, terminateSolver } from './solve-captcha.mjs'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const BASE = 'https://eprocure.gov.in/eprocure/app'
const MAX_PAGES = 30
const MAX_CAPTCHA_ATTEMPTS = 6

function parseDate(str) {
  if (!str) return null
  // DD-Mon-YYYY HH:MM AM/PM  (e.g. "29-Apr-2026 03:00 PM")
  const m1 = str.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/)
  if (m1) {
    const months = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 }
    const month = months[m1[2]]
    if (month) {
      try {
        return new Date(`${m1[3]}-${String(month).padStart(2,'0')}-${m1[1].padStart(2,'0')}`).toISOString()
      } catch { return null }
    }
  }
  // DD/MM/YYYY or DD-MM-YYYY
  const m2 = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
  if (m2) {
    try { return new Date(`${m2[3]}-${m2[2].padStart(2,'0')}-${m2[1].padStart(2,'0')}`).toISOString() }
    catch { return null }
  }
  try { return new Date(str).toISOString() } catch { return null }
}

function guessMinistry(org) {
  const o = (org || '').toLowerCase()
  if (o.includes('defence') || o.includes('army') || o.includes('navy') || o.includes('air force') || o.includes('drdo')) return 'Ministry of Defence'
  if (o.includes('health') || o.includes('aiims') || o.includes('hospital') || o.includes('medical') || o.includes('dispensary')) return 'Ministry of Health & Family Welfare'
  if (o.includes('railway') || o.includes('rail')) return 'Ministry of Railways'
  if (o.includes('education') || o.includes('school') || o.includes('university') || o.includes('iit') || o.includes('nit') || o.includes('kendriya vidyalaya')) return 'Ministry of Education'
  if (o.includes('road') || o.includes('highway') || o.includes('nhai')) return 'Ministry of Road Transport'
  if (o.includes('power') || o.includes('electricity') || o.includes('solar') || o.includes('energy') || o.includes('ntpc') || o.includes('nhpc')) return 'Ministry of Power'
  if (o.includes('water') || o.includes('jal') || o.includes('irrigation')) return 'Ministry of Jal Shakti'
  if (o.includes('police') || o.includes('home') || o.includes('crpf') || o.includes('cisf') || o.includes('bsf')) return 'Ministry of Home Affairs'
  if (o.includes('agriculture') || o.includes('agri') || o.includes('farm')) return 'Ministry of Agriculture'
  if (o.includes('finance') || o.includes('tax') || o.includes('revenue') || o.includes('income tax')) return 'Ministry of Finance'
  if (o.includes('urban') || o.includes('municipal') || o.includes('corporation') || o.includes('smart city')) return 'Ministry of Housing & Urban Affairs'
  if (o.includes('shipping') || o.includes('port') || o.includes('harbor')) return 'Ministry of Ports, Shipping & Waterways'
  if (o.includes('atomic') || o.includes('nuclear') || o.includes('barc') || o.includes('npcil')) return 'Department of Atomic Energy'
  if (o.includes('space') || o.includes('isro') || o.includes('dos')) return 'Department of Space'
  if (o.includes('petroleum') || o.includes('oil') || o.includes('gas') || o.includes('ongc') || o.includes('iocl')) return 'Ministry of Petroleum'
  if (o.includes('steel') || o.includes('sail') || o.includes('mining') || o.includes('coal')) return 'Ministry of Steel / Mines'
  if (o.includes('telecom') || o.includes('bsnl') || o.includes('mtnl') || o.includes('communication')) return 'Ministry of Communications'
  return 'Central Government'
}

/**
 * Parse the "Title and Ref.No./Tender ID" cell.
 * Format: "[ Title ] [RefNo][TenderID]" OR "[RefNo] [RefNo][TenderID]"
 * Returns { title, bidNo, refNo }
 */
function parseTitleCell(cell) {
  if (!cell) return { title: '', bidNo: '', refNo: '' }

  // Extract the last bracket content as Tender ID (format: YYYY_ABC_NNNNN_N)
  const tidMatch = cell.match(/\[(\d{4}_[A-Z][A-Za-z0-9_]+)\]\s*$/)
  const bidNo = tidMatch ? tidMatch[1] : ''

  // Extract all bracket groups
  const brackets = []
  const bRe = /\[([^\]]+)\]/g
  let m
  while ((m = bRe.exec(cell)) !== null) {
    if (m[1] !== bidNo) brackets.push(m[1].trim())
  }

  // If first bracket looks like a descriptive title (contains spaces and non-slash chars), use it
  const firstBracket = brackets[0] || ''
  const isDescriptive = firstBracket.length > 10 && /\s/.test(firstBracket) && !/^[A-Z0-9\/\-]+$/.test(firstBracket)
  const title = isDescriptive ? firstBracket : (brackets[brackets.length - 1] || bidNo)
  const refNo = isDescriptive ? (brackets[1] || brackets[0] || '') : (brackets[0] || '')

  return { title, bidNo, refNo }
}

async function upsertTender(t) {
  try {
    const r = await pool.query(`
      INSERT INTO tenders(id,source,bid_no,title,organization,ministry,category,state,
        tender_value,bid_deadline,published_at,status,document_url,description,scraped_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
      ON CONFLICT(bid_no,source) DO UPDATE SET
        title=EXCLUDED.title, organization=EXCLUDED.organization,
        ministry=EXCLUDED.ministry, tender_value=EXCLUDED.tender_value,
        bid_deadline=EXCLUDED.bid_deadline, status=EXCLUDED.status,
        document_url=EXCLUDED.document_url, description=EXCLUDED.description,
        scraped_at=NOW()
    `, [t.id,t.source,t.bid_no,t.title,t.organization,t.ministry,t.category,t.state,
        t.tender_value,t.bid_deadline,t.published_at,t.status,t.document_url,t.description])
    return r.rowCount > 0
  } catch(e) {
    console.error('  upsert error:', e.message.slice(0, 80))
    return false
  }
}

/**
 * Extract real tender rows from the current page.
 * The table header is: S.No | e-Published Date | Bid Submission Closing Date | Tender Opening Date | Title and Ref.No./Tender ID | Organisation Chain
 */
async function extractCPPPRows(page) {
  return page.evaluate(() => {
    // Find all TR elements that look like data rows (first cell is a number like "1.", "2." etc.)
    const rows = Array.from(document.querySelectorAll('table tr'))
    const dataRows = []
    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll('td'))
      if (cells.length < 5) continue
      const firstCell = cells[0]?.innerText?.trim() ?? ''
      // Data rows start with a serial number like "1." or "10."
      if (!/^\d+\.$/.test(firstCell)) continue
      const link = row.querySelector('a')?.href ?? ''
      dataRows.push({
        sNo: firstCell,
        published: cells[1]?.innerText?.trim() ?? '',
        closing: cells[2]?.innerText?.trim() ?? '',
        opening: cells[3]?.innerText?.trim() ?? '',
        titleCell: cells[4]?.innerText?.trim() ?? '',
        orgChain: cells[5]?.innerText?.trim() ?? '',
        link,
      })
    }
    return dataRows
  })
}

/**
 * Scrape one tab of the Tenders by Closing Date page.
 * submitName: 'tabByClosingToday' | 'LinkSubmit_0' | 'LinkSubmit_1'
 */
async function scrapeTab(page, submitName, label) {
  console.log(`\n  Clicking tab: ${label}`)
  await page.evaluate((name) => {
    tapestry.form.submit('ListTendersbyDate', name)
  }, submitName)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)

  const tenders = []
  let pageNum = 1

  while (pageNum <= MAX_PAGES) {
    const rows = await extractCPPPRows(page)
    console.log(`    Page ${pageNum}: ${rows.length} tender rows`)
    if (rows.length === 0) break

    for (const row of rows) {
      const { title, bidNo, refNo } = parseTitleCell(row.titleCell)
      if (!bidNo && !refNo) continue

      const id = `cppp-${bidNo || refNo}`.replace(/[^a-zA-Z0-9\-]/g, '-').slice(0, 64)
      const orgParts = row.orgChain.split(/\|\|/)
      const organization = orgParts.filter(Boolean).join(' > ')
      const ministry = orgParts.find(p => /ministry/i.test(p)) || guessMinistry(organization)

      tenders.push({
        id,
        source: 'cppp',
        bid_no: bidNo || refNo,
        title: title || refNo || bidNo,
        organization,
        ministry,
        category: '',
        state: '',
        tender_value: null,
        bid_deadline: parseDate(row.closing),
        published_at: parseDate(row.published) || new Date().toISOString(),
        status: 'active',
        document_url: row.link || BASE,
        description: row.titleCell,
      })
    }

    // Pagination: look for "Next >" link
    const nextBtn = await page.$('a:text-matches("Next|>|»"), input[value*="Next"]')
    if (!nextBtn) break
    await nextBtn.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    pageNum++
  }

  return tenders
}

async function upsertBidResult(b) {
  try {
    const r = await pool.query(`
      INSERT INTO bid_results(id,source,bid_no,category,item_description,ministry,organization,
        state,l1_price,l1_seller_name,estimated_value,total_bidders,award_date,savings_percent,scraped_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
      ON CONFLICT(bid_no,source) DO UPDATE SET
        l1_price=EXCLUDED.l1_price, l1_seller_name=EXCLUDED.l1_seller_name,
        total_bidders=EXCLUDED.total_bidders, award_date=EXCLUDED.award_date,
        savings_percent=EXCLUDED.savings_percent, scraped_at=NOW()
    `, [b.id,b.source,b.bid_no,b.category,b.item_description,b.ministry,b.organization,
        b.state,b.l1_price,b.l1_seller_name,b.estimated_value,b.total_bidders,
        b.award_date,b.savings_percent])
    return r.rowCount > 0
  } catch(e) {
    console.error('  bid upsert error:', e.message.slice(0, 80))
    return false
  }
}

// CPPP ResultOfTenders returns max 100 rows per keyword search (no pagination).
// We search multiple keywords to maximise coverage. The CAPTCHA must be solved
// BEFORE touching any other field — typing in Keyword triggers a Tapestry AJAX
// event that refreshes the server-side CAPTCHA token (but not the DOM image),
// so filling keyword first makes subsequent CAPTCHA solves incorrect.
// Solution: solve CAPTCHA first, fill captchaText, then set keyword via JS
// (no DOM events) so the CAPTCHA session stays valid.

const BID_KEYWORDS = [
  'supply', 'work', 'service', 'civil', 'repair', 'electrical',
  'equipment', 'vehicle', 'medical', 'computer', 'construction',
  'maintenance', 'purchase', 'installation', 'contract',
]

async function searchBidAwards(page, keyword) {
  await page.goto(`${BASE}?page=ResultOfTenders&service=page`, {
    waitUntil: 'networkidle', timeout: 30000
  })
  await page.waitForTimeout(1000)

  for (let attempt = 1; attempt <= MAX_CAPTCHA_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForTimeout(800)
    }

    const captchaEl = await page.$('#captchaImage')
    if (!captchaEl) { console.log('  No CAPTCHA — submitting directly'); break }

    let solved = ''
    try { solved = await solveCaptchaFromElement(page, '#captchaImage') }
    catch(e) { console.log(`  Screenshot failed: ${e.message}`); continue }

    if (!solved || solved.length < 4 || solved.length > 10) {
      console.log(`  Bad length "${solved}", retrying`)
      continue
    }

    // Fill captchaText FIRST (before any other field interaction)
    const captchaInput = await page.$('input[name="captchaText"]')
    if (!captchaInput) { console.log('  No captchaText input'); break }
    await captchaInput.fill(solved)

    // Set keyword via JS (no DOM events) so CAPTCHA session stays valid
    await page.evaluate((kw) => {
      const el = document.querySelector('input[name="Keyword"]')
      if (el) el.value = kw
    }, keyword)

    const submitBtn = await page.$('input[name="Search"]')
    if (!submitBtn) { console.log('  No Search button'); break }
    await submitBtn.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const body = await page.evaluate(() => document.body.innerText.toLowerCase())
    const hasError = body.includes('invalid captcha') || body.includes('wrong captcha') ||
        body.includes('captcha mismatch') || body.includes('incorrect captcha')

    if (hasError) {
      console.log(`  CAPTCHA rejected ("${solved}"), retrying...`)
      continue
    }

    // Extract rows (CPPP shows max 100 per search, no pagination)
    const rows = await page.evaluate(() =>
      Array.from(document.querySelectorAll('table tr')).map(row => {
        const cells = Array.from(row.querySelectorAll('td'))
        return { texts: cells.map(c => c.innerText?.trim() ?? '') }
      }).filter(r => /^\d+\.$/.test(r.texts[0] || ''))
    )
    console.log(`  [${keyword}] CAPTCHA accepted ("${solved}") → ${rows.length} rows`)
    return rows
  }

  console.log(`  [${keyword}] Gave up after ${MAX_CAPTCHA_ATTEMPTS} attempts`)
  return []
}

// ── Scrape CPPP Bid Awards (AOC = Award of Contract, L1 winner data) ──────────
async function scrapeCPPPBidAwards(page) {
  console.log('\nNavigating to CPPP Bid Awards...')

  const seen = new Set()
  const allBids = []

  for (const keyword of BID_KEYWORDS) {
    const rows = await searchBidAwards(page, keyword)
    for (const { texts } of rows) {
      if (texts.length < 4) continue
      const { title, bidNo } = parseTitleCell(texts[3])
      if (!bidNo || seen.has(bidNo)) continue
      seen.add(bidNo)

      const orgParts = (texts[4] || '').split(/\|\|/)
      const organization = orgParts.filter(Boolean).join(' > ')
      const ministry = orgParts.find(p => /ministry/i.test(p)) || guessMinistry(organization)

      allBids.push({
        id: `cppp-bid-${bidNo}`.replace(/[^a-zA-Z0-9\-]/g, '-').slice(0, 64),
        source: 'cppp',
        bid_no: bidNo,
        category: '',
        item_description: title,
        ministry,
        organization,
        state: '',
        l1_price: null,
        l1_seller_name: '',
        estimated_value: null,
        total_bidders: null,
        award_date: parseDate(texts[1]),
        savings_percent: null,
      })
    }
  }

  return allBids
}

// ── Main ─────────────────────────────────────────────────────────────────────
const logRow = await pool.query(`INSERT INTO scrape_log(source,status) VALUES('cppp','running') RETURNING id`)
const logId = logRow.rows[0].id
let found = 0, upserted = 0, bidsFound = 0, bidsUpserted = 0

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
})
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 900 },
})
const page = await ctx.newPage()
page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text().slice(0, 60)) })

try {
  console.log('Navigating to CPPP Tenders by Closing Date...')
  await page.goto(`${BASE}?page=FrontEndListTendersbyDate&service=page`, {
    waitUntil: 'networkidle', timeout: 30000
  })
  await page.waitForTimeout(1500)

  // Scrape all three date tabs in sequence (no CAPTCHA)
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

  const seen = new Set()
  const unique = allTenders.filter(t => {
    if (seen.has(t.bid_no)) return false
    seen.add(t.bid_no)
    return true
  })

  found = unique.length
  console.log(`\nFound ${found} unique CPPP tenders. Upserting...`)
  for (const t of unique) {
    if (await upsertTender(t)) upserted++
  }

  // Scrape Bid Awards (CAPTCHA-gated, uses Tesseract solver)
  const bids = await scrapeCPPPBidAwards(page)
  bidsFound = bids.length
  console.log(`\nFound ${bidsFound} CPPP bid awards. Upserting...`)
  for (const b of bids) {
    if (await upsertBidResult(b)) bidsUpserted++
  }

  console.log(`\n✅ CPPP done: ${upserted}/${found} tenders, ${bidsUpserted}/${bidsFound} bid awards`)
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
  await terminateSolver()
  await browser.close()
  await pool.end()
}
