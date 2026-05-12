#!/usr/bin/env node
/**
 * Scrape unlisted Indian company financials from Zauba Corp
 * (Zauba Corp aggregates public MCA filings — no payment required)
 *
 * Usage:
 *   DATABASE_URL=... node scripts/scrape-unlisted-financials.mjs
 *   DATABASE_URL=... node scripts/scrape-unlisted-financials.mjs --search "Byju"
 *   DATABASE_URL=... node scripts/scrape-unlisted-financials.mjs --cin U80902KA2011PTC057980
 *
 * Requires: playwright installed (npx playwright install chromium)
 */

import pg from 'pg'
import { chromium } from 'playwright'

const { Client } = pg

// ── Target companies — curated list of notable unlisted Indian companies ──────
// CINs are public identifiers from MCA registry
const TARGET_COMPANIES = [
  // EdTech
  { name: "Think & Learn Pvt Ltd (Byju's)", cin: 'U80902KA2011PTC057980', industry: 'EdTech', tags: ['unicorn', 'edtech'] },
  { name: 'Unacademy (Sorting Hat Technologies)', cin: 'U74999KA2015PTC082553', industry: 'EdTech', tags: ['unicorn', 'edtech'] },
  { name: 'upGrad Education', cin: 'U74999MH2015PTC263942', industry: 'EdTech', tags: ['unicorn', 'edtech'] },
  { name: 'Vedantu Innovations', cin: 'U72200KA2011PTC060672', industry: 'EdTech', tags: ['edtech'] },
  { name: 'Eruditus Learning Solutions', cin: 'U80901MH2009PTC191104', industry: 'EdTech', tags: ['unicorn', 'edtech'] },

  // FinTech
  { name: 'Razorpay Software', cin: 'U72200KA2014PTC074780', industry: 'FinTech', tags: ['unicorn', 'fintech', 'payments'] },
  { name: 'BharatPe (Resilient Innovations)', cin: 'U72200DL2018PTC339375', industry: 'FinTech', tags: ['unicorn', 'fintech'] },
  { name: 'Slice (Bengaluru Fintech)', cin: 'U74999KA2016PTC089769', industry: 'FinTech', tags: ['fintech', 'credit'] },
  { name: 'Groww (Nextbillion Technology)', cin: 'U72200KA2016PTC085854', industry: 'FinTech', tags: ['fintech', 'wealthtech'] },
  { name: 'CRED (Dreamplug Technologies)', cin: 'U74999KA2018PTC108076', industry: 'FinTech', tags: ['unicorn', 'fintech'] },
  { name: 'Navi Technologies', cin: 'U65910MH2019PLC320989', industry: 'FinTech', tags: ['unicorn', 'fintech'] },
  { name: 'KreditBee (Krazybee Services)', cin: 'U74999KA2016PTC087501', industry: 'FinTech', tags: ['fintech', 'lending'] },
  { name: 'Jupiter Money (Amica Financial Technologies)', cin: 'U65929MH2019PTC330417', industry: 'FinTech', tags: ['fintech', 'neobank'] },
  { name: 'Perfios Account Aggregation Services', cin: 'U72200KA2008PTC046232', industry: 'FinTech', tags: ['fintech', 'data'] },

  // E-Commerce & D2C
  { name: 'Meesho (Fashnear Technologies)', cin: 'U74999KA2015PTC082553', industry: 'E-Commerce', tags: ['unicorn', 'ecommerce'] },
  { name: 'Lenskart Solutions', cin: 'U52393DL2010PTC205054', industry: 'E-Commerce', tags: ['unicorn', 'd2c'] },
  { name: 'Mamaearth (Honasa Consumer)', cin: 'U74999HR2016PTC063170', industry: 'E-Commerce', tags: ['d2c', 'fmcg'] },
  { name: 'boAt Lifestyle (Imagine Marketing)', cin: 'U51909DL2013PTC252661', industry: 'E-Commerce', tags: ['d2c', 'electronics'] },
  { name: 'Country Delight (Parag Milk)', cin: 'U01403MH2014PTC253428', industry: 'E-Commerce', tags: ['d2c', 'dairy'] },

  // SaaS & B2B Tech
  { name: 'Zoho Corporation', cin: 'U72200TN1996PTC036531', industry: 'SaaS', tags: ['saas', 'b2b', 'bootstrapped'] },
  { name: 'Freshworks (Chennai)', cin: 'U72200TN2010PLC077086', industry: 'SaaS', tags: ['saas', 'listed'] },
  { name: 'Postman (Postdot Technologies)', cin: 'U72200KA2014PTC075217', industry: 'SaaS', tags: ['unicorn', 'saas', 'devtools'] },
  { name: 'Darwinbox (Darwinbox Digital Solutions)', cin: 'U72200TG2015PTC102781', industry: 'SaaS', tags: ['saas', 'hrtech'] },
  { name: 'Druva Data Solutions', cin: 'U72200MH2012PTC235558', industry: 'SaaS', tags: ['unicorn', 'saas', 'cloud'] },
  { name: 'Innovaccer', cin: 'U72900MH2015FTC266617', industry: 'SaaS', tags: ['unicorn', 'saas', 'healthtech'] },
  { name: 'Zenoti Software', cin: 'U72200TG2010PTC068003', industry: 'SaaS', tags: ['unicorn', 'saas', 'spa'] },

  // HealthTech
  { name: 'PharmEasy (API Holdings)', cin: 'U24232MH2014PTC256544', industry: 'HealthTech', tags: ['unicorn', 'healthtech', 'pharma'] },
  { name: 'HealthKart (Bright Lifecare)', cin: 'U51909DL2006PTC148325', industry: 'HealthTech', tags: ['healthtech', 'd2c'] },
  { name: 'Pristyn Care Technologies', cin: 'U72200DL2018PTC335694', industry: 'HealthTech', tags: ['healthtech', 'surgery'] },
  { name: 'Portea Medical', cin: 'U85100KA2013PTC069540', industry: 'HealthTech', tags: ['healthtech', 'homecare'] },

  // Logistics & Mobility
  { name: 'Delhivery (previously Shree Tirupati)', cin: 'U63090HR2011PLC044872', industry: 'Logistics', tags: ['listed', 'logistics'] },
  { name: 'Shiprocket (BigFoot Retail Solutions)', cin: 'U72200DL2011PTC233281', industry: 'Logistics', tags: ['logistics', 'ecommerce'] },
  { name: 'BlackBuck (Zinka Logistics Solutions)', cin: 'U60200KA2015PTC082079', industry: 'Logistics', tags: ['unicorn', 'logistics', 'trucking'] },
  { name: 'OYO Rooms (Oravel Stays)', cin: 'U55101HR2012PTC045591', industry: 'Travel & Hospitality', tags: ['unicorn', 'travel', 'hotels'] },
  { name: 'RedBus (Pilani Softlabs)', cin: 'U72200KA2006PTC040269', industry: 'Travel & Hospitality', tags: ['travel', 'buses'] },
  { name: 'Ola Electric Mobility', cin: 'U34100TN2017PLC118693', industry: 'EV & CleanTech', tags: ['unicorn', 'ev', 'mobility'] },
  { name: 'Ather Energy', cin: 'U31200KA2013PTC068050', industry: 'EV & CleanTech', tags: ['ev', 'mobility'] },
  { name: 'BluSmart Mobility', cin: 'U60200DL2019PTC357985', industry: 'EV & CleanTech', tags: ['ev', 'ridehailing'] },

  // AgriTech & Food
  { name: 'DeHaat (AgRevolution)', cin: 'U01100BR2012PTC018379', industry: 'AgriTech', tags: ['unicorn', 'agritech'] },
  { name: 'Ninjacart', cin: 'U01100KA2015PTC082679', industry: 'AgriTech', tags: ['unicorn', 'agritech', 'supply-chain'] },
  { name: 'Milkbasket (Thinking Hats Consumer Solutions)', cin: 'U74999HR2015PTC056310', industry: 'AgriTech', tags: ['agritech', 'groceries'] },
  { name: 'Rebel Foods (Faasos Food Services)', cin: 'U55101MH2011PTC223008', industry: 'Food & Beverage', tags: ['unicorn', 'cloudkitchen'] },
  { name: 'Swiggy (Bundl Technologies)', cin: 'U63090KA2013PTC152753', industry: 'Food & Beverage', tags: ['unicorn', 'food-delivery'] },

  // Media & Creator Economy
  { name: 'ShareChat (Mohalla Tech)', cin: 'U72200KA2015PTC082291', industry: 'Media & Entertainment', tags: ['unicorn', 'social', 'vernacular'] },
  { name: 'Dailyhunt (Verse Innovation)', cin: 'U72200KA2018PTC108990', industry: 'Media & Entertainment', tags: ['unicorn', 'news', 'social'] },
  { name: 'InMobi Group', cin: 'U72200KA2007PLC041838', industry: 'Media & Entertainment', tags: ['unicorn', 'adtech'] },
  { name: 'Zee Entertainment Enterprise (subsidiary)', cin: 'U74999MH2010PLC207813', industry: 'Media & Entertainment', tags: ['media'] },

  // CleanTech & Infrastructure
  { name: 'ReNew Power Ventures', cin: 'U40106DL2008PLC175831', industry: 'CleanTech', tags: ['cleantech', 'renewables'] },
  { name: 'Greenko Energy Holdings (India)', cin: 'U40100AP2003PLC041022', industry: 'CleanTech', tags: ['cleantech', 'hydro', 'solar'] },
  { name: 'Avaada Energy', cin: 'U40100DL2015PLC286397', industry: 'CleanTech', tags: ['cleantech', 'solar'] },

  // Real Estate & PropTech
  { name: 'NoBroker Technologies (HousingMan)', cin: 'U72200KA2013PTC068078', industry: 'PropTech', tags: ['unicorn', 'proptech', 'rentals'] },
  { name: 'Square Yards Consulting', cin: 'U74900DL2012PTC235907', industry: 'PropTech', tags: ['proptech', 'realtor'] },
  { name: 'Stanza Living (Desktime Technologies)', cin: 'U74999DL2016PTC300059', industry: 'PropTech', tags: ['proptech', 'coliving'] },

  // Large Private Corporates
  { name: 'Tata Sons', cin: 'U65990MH1917PTC000478', industry: 'Conglomerate', tags: ['large', 'tata', 'holding'] },
  { name: 'Reliance Retail Ventures', cin: 'U51900MH2006PLC166166', industry: 'Retail', tags: ['large', 'reliance', 'retail'] },
  { name: 'Cargill India', cin: 'U15142HR1997PLC078400', industry: 'Food & Beverage', tags: ['large', 'agri', 'mnc'] },
  { name: 'Amazon Seller Services', cin: 'U74999MH2012PTC231627', industry: 'E-Commerce', tags: ['large', 'amazon', 'mnc'] },
  { name: 'Flipkart Internet', cin: 'U51109KA2012PTC066107', industry: 'E-Commerce', tags: ['unicorn', 'ecommerce', 'walmart'] },
  { name: 'Walmart India (Best Price)', cin: 'U51220DL2007FTC162210', industry: 'Retail', tags: ['large', 'walmart', 'mnc'] },
  { name: 'IKEA India', cin: 'U52109TG2011FTC073474', industry: 'Retail', tags: ['large', 'ikea', 'mnc'] },
  { name: 'PhonePe (Samara Capital Portfolio)', cin: 'U74999KA2015PTC082411', industry: 'FinTech', tags: ['unicorn', 'fintech', 'upi'] },
  { name: 'Zepto (KiranaKart Technologies)', cin: 'U63090MH2021PTC360722', industry: 'E-Commerce', tags: ['unicorn', 'qcommerce', 'groceries'] },
]

// ── DB helpers ────────────────────────────────────────────────────────────────
let dbClient

async function connectDb() {
  dbClient = new Client({ connectionString: process.env.DATABASE_URL })
  await dbClient.connect()
  console.log('✓ Connected to Neon DB')
}

async function upsertCompany(company) {
  await dbClient.query(`
    INSERT INTO unlisted_companies (cin, name, industry, tags, is_notable, updated_at)
    VALUES ($1, $2, $3, $4, TRUE, NOW())
    ON CONFLICT (cin) DO UPDATE SET
      name = EXCLUDED.name,
      industry = EXCLUDED.industry,
      tags = EXCLUDED.tags,
      is_notable = TRUE,
      updated_at = NOW()
  `, [company.cin, company.name, company.industry, company.tags])
}

async function upsertFinancials(cin, year, data) {
  await dbClient.query(`
    INSERT INTO unlisted_financials
      (cin, fiscal_year, revenue_cr, expenses_cr, pat_cr, net_worth_cr, total_assets_cr, total_debt_cr, data_source, scraped_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'zauba', NOW())
    ON CONFLICT (cin, fiscal_year) DO UPDATE SET
      revenue_cr    = COALESCE(EXCLUDED.revenue_cr, unlisted_financials.revenue_cr),
      expenses_cr   = COALESCE(EXCLUDED.expenses_cr, unlisted_financials.expenses_cr),
      pat_cr        = COALESCE(EXCLUDED.pat_cr, unlisted_financials.pat_cr),
      net_worth_cr  = COALESCE(EXCLUDED.net_worth_cr, unlisted_financials.net_worth_cr),
      total_assets_cr = COALESCE(EXCLUDED.total_assets_cr, unlisted_financials.total_assets_cr),
      total_debt_cr = COALESCE(EXCLUDED.total_debt_cr, unlisted_financials.total_debt_cr),
      data_source   = 'zauba',
      scraped_at    = NOW()
  `, [cin, year, data.revenue, data.expenses, data.pat, data.netWorth, data.totalAssets, data.totalDebt])
}

// ── Parse financial value strings like "₹123.45 Cr" or "1,234.56" ─────────────
function parseCr(str) {
  if (!str || str === '-' || str === 'N/A' || str === '') return null
  // Remove ₹, commas, spaces, handle "Lakh" and "Cr" suffixes
  const clean = str.replace(/[₹,\s]/g, '').toLowerCase()
  const num = parseFloat(clean.replace(/[a-z]/g, ''))
  if (isNaN(num)) return null
  if (clean.includes('lakh')) return Math.round(num / 100 * 100) / 100  // lakh → cr
  return Math.round(num * 100) / 100
}

// ── Scrape one company from Zauba Corp ────────────────────────────────────────
async function scrapeZauba(page, company) {
  const nameSlug = company.name.replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+/g, '-').toUpperCase()
  const url = `https://www.zaubacorp.com/company/${nameSlug}/${company.cin}`

  console.log(`  → ${url}`)

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(1500)

    const content = await page.content()

    // Check for "company not found" or CAPTCHA
    if (content.includes('captcha') || content.includes('Captcha')) {
      console.log('    ⚠ CAPTCHA detected — waiting 30s then retry')
      await page.waitForTimeout(30000)
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(2000)
    }

    // Extract company master data from the page
    const masterData = await page.evaluate(() => {
      const rows = {}
      document.querySelectorAll('table tr').forEach(tr => {
        const cells = tr.querySelectorAll('td')
        if (cells.length >= 2) {
          const key = cells[0].innerText?.trim()
          const val = cells[1].innerText?.trim()
          if (key && val) rows[key.toLowerCase()] = val
        }
      })
      return rows
    })

    // Update company record with master data if found
    const state = masterData['registered state'] || masterData['state'] || null
    const category = masterData['company type'] || masterData['company category'] || null
    const incDate = masterData['date of incorporation'] || masterData['incorporation date'] || null
    const incYear = incDate ? new Date(incDate).getFullYear() : null
    const authCap = parseCr(masterData['authorized capital'] || masterData['authorised capital'])
    const paidUp = parseCr(masterData['paid up capital'])

    if (state || authCap) {
      await dbClient.query(`
        UPDATE unlisted_companies SET
          state = COALESCE($1, state),
          category = COALESCE($2, category),
          incorporation_year = COALESCE($3, incorporation_year),
          authorized_capital_cr = COALESCE($4, authorized_capital_cr),
          paid_up_capital_cr = COALESCE($5, paid_up_capital_cr),
          updated_at = NOW()
        WHERE cin = $6
      `, [state, category, isNaN(incYear) ? null : incYear, authCap, paidUp, company.cin])
    }

    // Extract financial data — Zauba Corp shows P&L in a table
    // Look for years and their values across different table formats
    const financialRows = await page.evaluate(() => {
      const results = []

      // Zauba Corp financial table has headers like "Mar 2024", "Mar 2023" etc.
      const tables = document.querySelectorAll('table')
      for (const table of tables) {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText?.trim())
        const yearHeaders = headers.filter(h => /\d{4}/.test(h))
        if (yearHeaders.length === 0) continue

        const rows = table.querySelectorAll('tr')
        for (const row of rows) {
          const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText?.trim())
          if (cells.length < 2) continue
          const label = cells[0]?.toLowerCase() || ''
          if (
            label.includes('revenue') || label.includes('turnover') ||
            label.includes('profit') || label.includes('loss') ||
            label.includes('net worth') || label.includes('total assets') ||
            label.includes('expenses') || label.includes('debt') ||
            label.includes('borrowing')
          ) {
            results.push({ label: cells[0], yearHeaders, values: cells.slice(1) })
          }
        }
      }
      return results
    })

    // Also try the specific financial summary section Zauba often shows
    const financialSummary = await page.evaluate(() => {
      const summary = {}

      // Look for spans or divs with financial data
      document.querySelectorAll('[class*="financial"], [id*="financial"], .company-financials').forEach(el => {
        const text = el.innerText
        // Revenue patterns
        const revenueMatch = text.match(/(?:Revenue|Turnover)[:\s]+₹?([\d,]+(?:\.\d+)?)\s*(?:Cr|Lakh)/i)
        if (revenueMatch) summary.revenue = revenueMatch[1]
        const patMatch = text.match(/(?:Net Profit|PAT|Profit After Tax)[:\s]+₹?([\d,]+(?:\.\d+)?)\s*(?:Cr|Lakh)/i)
        if (patMatch) summary.pat = patMatch[1]
      })

      return summary
    })

    // Parse what we found
    const yearData = {}
    for (const row of financialRows) {
      const label = row.label?.toLowerCase() || ''
      for (let i = 0; i < row.yearHeaders.length && i < row.values.length; i++) {
        const yearStr = row.yearHeaders[i]
        const yearMatch = yearStr.match(/(\w+)\s+(\d{4})/)
        if (!yearMatch) continue
        const month = yearMatch[1]
        const year = parseInt(yearMatch[2])
        // Convert "Mar 2024" → "2023-24", "Mar 2023" → "2022-23"
        const fy = month === 'Mar' ? `${year - 1}-${String(year).slice(2)}` : `${year}-${String(year + 1).slice(2)}`

        if (!yearData[fy]) yearData[fy] = {}
        const val = parseCr(row.values[i])

        if (label.includes('revenue') || label.includes('turnover')) yearData[fy].revenue = val
        else if (label.includes('net profit') || label.includes('pat')) yearData[fy].pat = val
        else if (label.includes('net worth')) yearData[fy].netWorth = val
        else if (label.includes('total assets')) yearData[fy].totalAssets = val
        else if (label.includes('expenses')) yearData[fy].expenses = val
        else if (label.includes('debt') || label.includes('borrowing')) yearData[fy].totalDebt = val
      }
    }

    const fyCount = Object.keys(yearData).length
    console.log(`    Found ${fyCount} fiscal years of data`)

    for (const [fy, data] of Object.entries(yearData)) {
      await upsertFinancials(company.cin, fy, data)
      console.log(`    ✓ ${fy}: revenue=${data.revenue ?? '?'} Cr, PAT=${data.pat ?? '?'} Cr`)
    }

    // If no tabular data found, try to at least get some summary numbers from page text
    if (fyCount === 0) {
      const pageText = await page.evaluate(() => document.body.innerText)
      const yearPattern = /(?:FY|Mar|March)\s*(\d{4})[^\n]*\n([^\n]*)/gi
      let match
      while ((match = yearPattern.exec(pageText)) !== null) {
        console.log(`    Text match: ${match[0].substring(0, 80)}`)
      }
      console.log(`    ⚠ No structured financial data found — may need to check page manually`)
    }

    return fyCount > 0

  } catch (e) {
    console.error(`    ✗ Error scraping ${company.name}: ${e.message}`)
    return false
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Set DATABASE_URL env var')
    process.exit(1)
  }

  await connectDb()

  const args = process.argv.slice(2)
  const cinFilter = args.includes('--cin') ? args[args.indexOf('--cin') + 1] : null
  const searchFilter = args.includes('--search') ? args[args.indexOf('--search') + 1]?.toLowerCase() : null
  const limitFlag = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : null

  let targets = TARGET_COMPANIES
  if (cinFilter) targets = targets.filter(c => c.cin === cinFilter)
  else if (searchFilter) targets = targets.filter(c => c.name.toLowerCase().includes(searchFilter))
  if (limitFlag) targets = targets.slice(0, limitFlag)

  console.log(`\n=== Unlisted Financials Scraper ===`)
  console.log(`Targets: ${targets.length} companies`)
  console.log(`Source: Zauba Corp (aggregates public MCA filings)\n`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()

  // Suppress noisy resource loads
  await page.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf}', route => route.abort())
  await page.route('**/ads/**', route => route.abort())
  await page.route('**/analytics/**', route => route.abort())

  let success = 0, failed = 0

  for (let i = 0; i < targets.length; i++) {
    const company = targets[i]
    console.log(`[${i + 1}/${targets.length}] ${company.name}`)

    // Upsert company record first
    await upsertCompany(company)

    const ok = await scrapeZauba(page, company)
    if (ok) success++
    else failed++

    // Polite delay between requests (2-4s)
    if (i < targets.length - 1) {
      const delay = 2000 + Math.random() * 2000
      await page.waitForTimeout(delay)
    }
  }

  await browser.close()
  await dbClient.end()

  console.log(`\n✅ Done: ${success} scraped, ${failed} failed/no-data`)
  console.log(`   Run again with --limit 5 to test a subset`)
}

main().catch(e => {
  console.error('Fatal:', e)
  process.exit(1)
})
