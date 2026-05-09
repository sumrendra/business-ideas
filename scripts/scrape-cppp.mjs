/**
 * Scrapes active tenders + bid results from CPPP (eprocure.gov.in)
 * Uses Tesseract.js to solve the image CAPTCHA — no external service needed.
 * Run: DATABASE_URL=... node scripts/scrape-cppp.mjs
 */

import { chromium } from 'playwright'
import pg from 'pg'
import { solveCaptchaFromElement, terminateSolver } from './solve-captcha.mjs'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const BASE = 'https://eprocure.gov.in/eprocure/app'
const MAX_PAGES = 20
const MAX_CAPTCHA_ATTEMPTS = 5

function parseINR(str) {
  if (!str) return null
  const clean = str.replace(/[₹,\s]/g, '').replace(/lakhs?/i, '00000').replace(/crores?/i, '0000000')
  const n = parseFloat(clean)
  return isNaN(n) ? null : n
}

function parseDate(str) {
  if (!str) return null
  // Handle DD/MM/YYYY or DD-MM-YYYY
  const m = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
  if (m) {
    try { return new Date(`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`).toISOString() }
    catch { return null }
  }
  try { return new Date(str).toISOString() } catch { return null }
}

function guessMinistry(org) {
  const o = (org || '').toLowerCase()
  if (o.includes('defence') || o.includes('army') || o.includes('navy') || o.includes('air force')) return 'Ministry of Defence'
  if (o.includes('health') || o.includes('aiims') || o.includes('hospital')) return 'Ministry of Health & Family Welfare'
  if (o.includes('railway') || o.includes('rail')) return 'Ministry of Railways'
  if (o.includes('education') || o.includes('school') || o.includes('university') || o.includes('iit') || o.includes('nit')) return 'Ministry of Education'
  if (o.includes('road') || o.includes('highway') || o.includes('nhai')) return 'Ministry of Road Transport'
  if (o.includes('power') || o.includes('electricity') || o.includes('solar') || o.includes('energy')) return 'Ministry of Power'
  if (o.includes('water') || o.includes('jal')) return 'Ministry of Jal Shakti'
  if (o.includes('police') || o.includes('home')) return 'Ministry of Home Affairs'
  if (o.includes('agriculture') || o.includes('agri') || o.includes('farm')) return 'Ministry of Agriculture'
  if (o.includes('finance') || o.includes('tax') || o.includes('revenue')) return 'Ministry of Finance'
  if (o.includes('urban') || o.includes('municipal') || o.includes('corporation')) return 'Ministry of Housing & Urban Affairs'
  return 'Central Government'
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
  } catch { return false }
}

async function upsertBidResult(b) {
  try {
    const r = await pool.query(`
      INSERT INTO bid_results(id,source,bid_no,category,item_description,ministry,organization,
        state,l1_price,l1_seller_name,estimated_value,total_bidders,bid_closing_date,savings_percent,scraped_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
      ON CONFLICT(bid_no,source) DO UPDATE SET
        l1_price=EXCLUDED.l1_price, l1_seller_name=EXCLUDED.l1_seller_name,
        total_bidders=EXCLUDED.total_bidders, savings_percent=EXCLUDED.savings_percent,
        scraped_at=NOW()
    `, [b.id,b.source,b.bid_no,b.category,b.item_description,b.ministry,b.organization,
        b.state,b.l1_price,b.l1_seller_name,b.estimated_value,b.total_bidders,
        b.bid_closing_date,b.savings_percent])
    return r.rowCount > 0
  } catch { return false }
}

// ── Submit search form with CAPTCHA solving + retry ───────────────────────────
async function submitSearchWithCaptcha(page, endpoint) {
  for (let attempt = 1; attempt <= MAX_CAPTCHA_ATTEMPTS; attempt++) {
    console.log(`  Solving CAPTCHA (attempt ${attempt})...`)

    // Reload CAPTCHA if this is a retry
    if (attempt > 1) {
      const refreshBtn = await page.$('button[name="captcha"], a[onclick*="captcha"], img[src*="refresh"]')
      if (refreshBtn) await refreshBtn.click()
      else await page.reload({ waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
    }

    // Solve the CAPTCHA image
    let captchaText = ''
    try {
      captchaText = await solveCaptchaFromElement(page, '#captchaImage')
    } catch(e) {
      console.log(`  CAPTCHA element not found: ${e.message}`)
      continue
    }

    if (!captchaText || captchaText.length < 3) {
      console.log(`  CAPTCHA solve returned empty/short result, retrying...`)
      continue
    }

    // Fill CAPTCHA field and submit
    const captchaInput = await page.$('input[name="captchaText"], input[id*="captcha"]:not([type="hidden"])')
    if (!captchaInput) { console.log('  No CAPTCHA input found'); break }
    await captchaInput.fill(captchaText)
    await page.waitForTimeout(300)

    // Click search
    const submitBtn = await page.$('input[value="Search"], button[type="submit"]')
    if (!submitBtn) { console.log('  No submit button found'); break }
    await submitBtn.click()
    await page.waitForTimeout(2000)

    // Check if CAPTCHA was accepted — look for results table or error
    const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase())
    if (bodyText.includes('invalid captcha') || bodyText.includes('captcha mismatch') ||
        bodyText.includes('wrong captcha') || bodyText.includes('enter captcha')) {
      console.log(`  CAPTCHA rejected ("${captchaText}"), retrying...`)
      // Go back to the search page
      await page.goto(`${BASE}?page=${endpoint}&service=page`, { waitUntil: 'networkidle', timeout: 20000 })
      await page.waitForTimeout(1000)
      continue
    }

    console.log(`  CAPTCHA accepted: "${captchaText}"`)
    return true
  }

  console.log(`  Failed to solve CAPTCHA after ${MAX_CAPTCHA_ATTEMPTS} attempts`)
  return false
}

// ── Extract tender rows from CPPP results table ───────────────────────────────
async function extractTenderRows(page) {
  return page.evaluate(() => {
    // CPPP renders results in a table — find rows with actual tender ref numbers
    const rows = Array.from(document.querySelectorAll('table tr'))
      .filter(r => r.querySelectorAll('td').length >= 4)
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td'))
      const link = row.querySelector('a[href*="TenderRef"], a[href*="epid"], a[href*="tender"]')?.href ?? ''
      const texts = cells.map(c => c.innerText?.trim() ?? '')
      return { texts, link }
    }).filter(r => {
      // Only rows where first or second cell looks like a tender ref number
      return r.texts.some(t => /\d{4}[\-\/]\d/.test(t) || t.length > 10)
    })
  })
}

// ── Scrape CPPP active tenders ────────────────────────────────────────────────
async function scrapeCPPPActiveTenders(page) {
  console.log('\nNavigating to CPPP active tenders...')
  await page.goto(`${BASE}?page=FrontEndLatestActiveTenders&service=page`, {
    waitUntil: 'networkidle', timeout: 30000
  })
  await page.waitForTimeout(1500)

  const accepted = await submitSearchWithCaptcha(page, 'FrontEndLatestActiveTenders')
  if (!accepted) return []

  const allTenders = []
  let pageNum = 1

  while (pageNum <= MAX_PAGES) {
    console.log(`  CPPP tenders page ${pageNum}...`)

    try {
      await page.waitForSelector('table tr td', { timeout: 10000 })
    } catch { console.log('  No table found, stopping'); break }

    const rows = await extractTenderRows(page)
    console.log(`    Found ${rows.length} rows`)

    for (const { texts, link } of rows) {
      if (texts.length < 3) continue
      // Typical CPPP columns: Sr | Ref No | Title | Org | Closing Date | Value
      const bidNo = texts[1] || texts[0] || ''
      if (!bidNo || bidNo.toLowerCase().includes('tender ref') || bidNo === 'S.No' || bidNo === 'Sr No') continue

      const t = {
        id: `cppp-${Buffer.from(bidNo).toString('base64').replace(/[^a-zA-Z0-9]/g,'').slice(0,28)}`,
        source: 'cppp',
        bid_no: bidNo,
        title: texts[2] || texts[1] || 'CPPP Tender',
        organization: texts[3] || '',
        ministry: guessMinistry(texts[3]),
        category: '',
        state: '',
        tender_value: parseINR(texts[5] || texts[4] || ''),
        bid_deadline: parseDate(texts[4] || texts[5] || ''),
        published_at: new Date().toISOString(),
        status: 'active',
        document_url: link || BASE,
        description: texts.slice(0, 6).join(' | '),
      }
      if (t.bid_no.length > 3 && t.title.length > 3) allTenders.push(t)
    }

    // Pagination: CPPP uses a "Next" button after results are loaded
    const nextBtn = await page.$('a:has-text("Next"), a[title="Next Page"], input[value="Next >"]')
    if (!nextBtn) break
    await nextBtn.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    pageNum++
  }

  return allTenders
}

// ── Scrape CPPP Bid Awards (historic L1 winners) ─────────────────────────────
async function scrapeCPPPBidAwards(page) {
  console.log('\nNavigating to CPPP Bid Awards...')
  await page.goto(`${BASE}?page=ResultOfTenders&service=page`, {
    waitUntil: 'networkidle', timeout: 30000
  })
  await page.waitForTimeout(1500)

  // Check if this page has a search form + CAPTCHA
  const hasCaptcha = await page.$('#captchaImage')
  if (hasCaptcha) {
    const accepted = await submitSearchWithCaptcha(page, 'ResultOfTenders')
    if (!accepted) return []
  }

  const allBids = []
  let pageNum = 1

  while (pageNum <= MAX_PAGES) {
    console.log(`  CPPP bid awards page ${pageNum}...`)

    try {
      await page.waitForSelector('table tr td', { timeout: 10000 })
    } catch { break }

    const results = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tr'))
        .filter(r => r.querySelectorAll('td').length >= 4)
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'))
        const link = row.querySelector('a')?.href ?? ''
        return { texts: cells.map(c => c.innerText?.trim() ?? ''), link }
      })
    })

    for (const { texts } of results) {
      if (texts.length < 4) continue
      const bidNo = texts[1] || texts[0] || ''
      if (!bidNo || bidNo.length < 4 || /^(sr|s\.no|ref)/i.test(bidNo)) continue

      // Typical CPPP award columns: Sr | Ref No | Title | Org | Winner | L1 Price | Est Value | Bidders | Date
      const l1Price = parseINR(texts[5] || texts[4] || '')
      const estValue = parseINR(texts[6] || texts[5] || '')
      const savings = l1Price && estValue && estValue > 0
        ? Math.round(((estValue - l1Price) / estValue) * 100 * 10) / 10
        : null

      const b = {
        id: `cppp-bid-${Buffer.from(bidNo).toString('base64').replace(/[^a-zA-Z0-9]/g,'').slice(0,28)}`,
        source: 'cppp',
        bid_no: bidNo,
        category: '',
        item_description: texts[2] || '',
        ministry: guessMinistry(texts[3]),
        organization: texts[3] || '',
        state: '',
        l1_price: l1Price,
        l1_seller_name: texts[4] || '',
        estimated_value: estValue,
        total_bidders: parseInt(texts[7] || '0') || null,
        bid_closing_date: parseDate(texts[8] || texts[7] || ''),
        savings_percent: savings,
      }
      if (b.bid_no.length > 3) allBids.push(b)
    }

    const nextBtn = await page.$('a:has-text("Next"), a[title="Next Page"]')
    if (!nextBtn) break
    await nextBtn.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    pageNum++
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
  // Active tenders
  const tenders = await scrapeCPPPActiveTenders(page)
  found = tenders.length
  console.log(`\nFound ${found} active CPPP tenders. Upserting...`)
  for (const t of tenders) { if (await upsertTender(t)) upserted++ }

  // Historic bid awards (L1 winner data)
  const bids = await scrapeCPPPBidAwards(page)
  bidsFound = bids.length
  console.log(`Found ${bidsFound} CPPP bid awards. Upserting...`)
  for (const b of bids) { if (await upsertBidResult(b)) bidsUpserted++ }

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
