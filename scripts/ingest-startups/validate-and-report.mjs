#!/usr/bin/env node
/**
 * scripts/ingest-startups/validate-and-report.mjs
 *
 * Reads every startup + startupFounder doc from Sanity and emits a markdown
 * coverage report:
 *   - totals
 *   - per-source hit table
 *   - top 10 most complete profiles
 *   - bottom 10 least complete profiles
 *   - per-industry × stage coverage table
 *
 * Also flags startups with <5 populated fields as featured:false + verified:false
 * (won't delete; editorial decision lives with the human).
 *
 * Flags: --dry-run --flag-thin (default: report-only; set --flag-thin to write)
 */

import { loadEnv, parseArgs, getSanityClient, printTable } from './_lib.mjs'

loadEnv()
const args = parseArgs()
const DRY = !!args['dry-run']
const FLAG_THIN = !!args['flag-thin']

const FIELDS_TO_COUNT = [
  'name', 'slug', 'legal_name', 'cin', 'website', 'industry', 'sub_industry',
  'business_model', 'stage', 'hq_city', 'hq_state', 'founded_year',
  'tagline', 'short_description', 'long_story', 'milestones', 'founders',
  'key_executives', 'tags', 'financials', 'funding_rounds',
  'total_funding_raised', 'latest_valuation', 'logo', 'data_sources',
]

function countFields(doc) {
  let n = 0
  for (const f of FIELDS_TO_COUNT) {
    const v = doc[f]
    if (v == null) continue
    if (Array.isArray(v)) { if (v.length > 0) n++ }
    else if (typeof v === 'string') { if (v.trim()) n++ }
    else if (typeof v === 'object') { if (Object.keys(v).length) n++ }
    else n++
  }
  return n
}

async function run() {
  const client = await getSanityClient()

  console.log('Fetching startups…')
  const startups = await client.fetch(`*[_type == "startup"]{
    _id, name, slug, legal_name, cin, website, industry, sub_industry,
    business_model, stage, hq_city, hq_state, founded_year,
    tagline, short_description, long_story, milestones, founders,
    key_executives, tags, financials, funding_rounds,
    total_funding_raised, latest_valuation, logo, data_sources, verified, featured
  }`)
  const founders = await client.fetch(`*[_type == "startupFounder"]{ _id, name }`)

  console.log(`\nTotal startups in Sanity: ${startups.length}`)
  console.log(`Total founders in Sanity: ${founders.length}`)

  // ── Coverage ─────────────────────────────────────────────────────────────
  const withRevenue = startups.filter((s) => (s.financials || []).some((f) => f.revenue && f.revenue > 0)).length
  const withProfit = startups.filter((s) => (s.financials || []).some((f) => f.profit != null)).length
  const withFounders = startups.filter((s) => (s.founders || []).length > 0).length
  const withFunding = startups.filter((s) => (s.funding_rounds || []).length > 0 || s.total_funding_raised).length
  const withStory = startups.filter((s) => (s.long_story || []).length >= 3).length
  const withLogo = startups.filter((s) => s.logo?.asset).length
  const withMilestones = startups.filter((s) => (s.milestones || []).length > 0).length
  const verified = startups.filter((s) => s.verified).length

  const pct = (n) => startups.length ? `${((n / startups.length) * 100).toFixed(0)}%` : '0%'

  console.log('\nCoverage:')
  console.log(`  Revenue (any FY):     ${withRevenue} / ${startups.length} (${pct(withRevenue)})`)
  console.log(`  Profit (any FY):      ${withProfit} / ${startups.length} (${pct(withProfit)})`)
  console.log(`  Founders ≥1:          ${withFounders} / ${startups.length} (${pct(withFounders)})`)
  console.log(`  Funding (any signal): ${withFunding} / ${startups.length} (${pct(withFunding)})`)
  console.log(`  Long-form story ≥3p:  ${withStory} / ${startups.length} (${pct(withStory)})`)
  console.log(`  Logo:                 ${withLogo} / ${startups.length} (${pct(withLogo)})`)
  console.log(`  Milestones ≥1:        ${withMilestones} / ${startups.length} (${pct(withMilestones)})`)
  console.log(`  Editor-verified:      ${verified} / ${startups.length} (${pct(verified)})`)

  // ── Per-source breakdown ─────────────────────────────────────────────────
  const sourceCounts = {}
  for (const s of startups) {
    for (const ds of s.data_sources || []) {
      const k = ds.source || '(unknown)'
      sourceCounts[k] = (sourceCounts[k] || 0) + 1
    }
  }
  console.log('\nPer-source hit table:')
  printTable(
    Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([source, hits]) => ({ Source: source, Hits: hits, Coverage: pct(hits) }))
  )

  // ── Best / worst profiles ────────────────────────────────────────────────
  const ranked = startups.map((s) => ({
    name: s.name,
    slug: s.slug?.current || s._id.replace(/^startup\./, ''),
    fields: countFields(s),
    industry: s.industry,
    revenue_years: (s.financials || []).filter((f) => f.revenue).length,
    founders: (s.founders || []).length,
    rounds: (s.funding_rounds || []).length,
    story: (s.long_story || []).length,
  }))

  ranked.sort((a, b) => b.fields - a.fields)
  console.log('\nTop 10 most complete profiles:')
  printTable(ranked.slice(0, 10).map((r) => ({
    Name: r.name, Fields: `${r.fields}/${FIELDS_TO_COUNT.length}`,
    FYs: r.revenue_years, Founders: r.founders, Rounds: r.rounds, StoryP: r.story,
  })))

  console.log('\nBottom 10 thinnest profiles:')
  const thin = ranked.slice().sort((a, b) => a.fields - b.fields).slice(0, 10)
  printTable(thin.map((r) => ({
    Name: r.name, Slug: r.slug, Fields: `${r.fields}/${FIELDS_TO_COUNT.length}`,
    Industry: r.industry,
  })))

  // ── Per-industry × stage matrix ──────────────────────────────────────────
  const matrix = {}
  for (const r of ranked) {
    const ind = r.industry || 'Unknown'
    if (!matrix[ind]) matrix[ind] = { count: 0, total_fields: 0 }
    matrix[ind].count++
    matrix[ind].total_fields += r.fields
  }
  console.log('\nIndustry coverage:')
  printTable(
    Object.entries(matrix)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([k, v]) => ({
        Industry: k,
        Startups: v.count,
        AvgFields: (v.total_fields / v.count).toFixed(1),
      }))
  )

  // ── Flag thin profiles ───────────────────────────────────────────────────
  const FLAG_THRESHOLD = 5
  const toFlag = ranked.filter((r) => r.fields < FLAG_THRESHOLD)
  console.log(`\nThin profiles (<${FLAG_THRESHOLD} fields): ${toFlag.length}`)

  if (FLAG_THIN && !DRY && toFlag.length) {
    console.log(`Flagging ${toFlag.length} as featured:false, verified:false`)
    let i = 0
    for (const r of toFlag) {
      try {
        await client.patch(`startup.${r.slug}`)
          .set({ verified: false, featured: false })
          .commit()
        i++
      } catch (e) {
        console.log(`  flag failed ${r.slug}: ${e.message}`)
      }
    }
    console.log(`Flagged: ${i}`)
  } else if (toFlag.length) {
    console.log(`(skipped; pass --flag-thin to actually flag)`)
  }
}

run().catch((e) => { console.error(e); process.exit(1) })
