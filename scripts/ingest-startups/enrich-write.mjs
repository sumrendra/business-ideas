/**
 * scripts/ingest-startups/enrich-write.mjs
 *
 * Idempotent writer for LLM-researched startup enrichment.
 *
 * Reads a JSON payload file (default: scripts/ingest-startups/_enrich-batch.json)
 * shaped as { "<startup-slug>": { ...cited fields... }, ... } and merges the data
 * into the existing startup docs in Sanity. Safe to re-run: scalar fields use
 * setIfMissing (never clobber editor/existing values), array fields are merged
 * with dedup, founders become real startupFounder docs + references.
 *
 * CITE-OR-BLANK: a company is skipped entirely unless it has a non-empty
 * `sources` array. Individual array items that carry their own source_url are
 * preferred; the company-level sources also append to data_sources[].
 *
 * Payload shape per slug (every field optional EXCEPT sources):
 * {
 *   "tagline": "string (<=160)",
 *   "short_description": "2-3 sentences (<=400)",
 *   "long_story": ["para 1", "para 2", ...],            // plain strings → portable text
 *   "total_funding_raised": 12500000000,                // INR number
 *   "latest_valuation": 80000000000,                    // INR number
 *   "status": "active|acquired|shutdown|ipo|...",        // optional
 *   "founders": [
 *     { "name": "Deepinder Goyal", "short_bio": "...", "linkedin_url": "...",
 *       "twitter_handle": "deepigoyal", "background": ["IIT Delhi"], "hometown": "Muktsar",
 *       "source_url": "https://..." }
 *   ],
 *   "funding_rounds": [
 *     { "date": "2021-02-01", "round_type": "Series A", "amount": 0, "amount_usd": 250000000,
 *       "lead_investor": "Tiger Global", "all_investors": ["..."], "valuation_at_round": 0,
 *       "source_url": "https://..." }
 *   ],
 *   "financials": [
 *     { "fiscal_year": "FY24", "revenue": 0, "profit": 0, "ebitda": 0, "employee_count": 0,
 *       "valuation": 0, "source": "MCA AOC-4", "source_url": "https://..." }
 *   ],
 *   "milestones": [
 *     { "date": "2008-07-01", "title": "Founded as Foodiebay", "description": "...", "source_url": "https://..." }
 *   ],
 *   "sources": [ { "source": "Wikipedia", "url": "https://..." }, ... ]
 * }
 *
 * Usage:
 *   node scripts/ingest-startups/enrich-write.mjs --file scripts/ingest-startups/_enrich-batch.json
 *   node scripts/ingest-startups/enrich-write.mjs --file <path> --dry        # print, don't write
 */

import { readFileSync } from 'node:fs'
import {
  loadEnv, parseArgs, getSanityClient, startupDocId, founderDocId, slugify,
  rkey, ptParagraphs, noEmDash, dataSourceEntry, mergeArrayField,
} from './_lib.mjs'

loadEnv()
const args = parseArgs()
const FILE = args.file || 'scripts/ingest-startups/_enrich-batch.json'
const DRY = !!args.dry

const clamp = (s, n) => (typeof s === 'string' ? noEmDash(s).slice(0, n) : undefined)
const num = (v) => (typeof v === 'number' && isFinite(v) && v > 0 ? Math.round(v) : undefined)

function founderRef(name, sourceUrl) {
  const fslug = slugify(name)
  return { id: founderDocId(fslug), slug: fslug, name: noEmDash(name), sourceUrl }
}

async function upsertFounderDoc(client, f) {
  const ref = founderRef(f.name, f.source_url)
  const doc = {
    _id: ref.id,
    _type: 'startupFounder',
    name: ref.name,
    slug: { _type: 'slug', current: ref.slug },
    verified: false,
    last_updated_at: new Date().toISOString(),
  }
  if (DRY) return ref
  // createIfNotExists never clobbers an existing founder; then setIfMissing the
  // soft fields so re-runs fill gaps without overwriting edits.
  await client.createIfNotExists(doc)
  const set = {}
  if (clamp(f.short_bio, 400)) set.short_bio = clamp(f.short_bio, 400)
  if (f.linkedin_url) set.linkedin_url = f.linkedin_url
  if (f.twitter_handle) set.twitter_handle = String(f.twitter_handle).replace(/^@/, '')
  if (f.personal_site) set.personal_site = f.personal_site
  if (Array.isArray(f.background) && f.background.length) set.background = f.background
  if (f.hometown) set.hometown = f.hometown
  if (Object.keys(set).length) {
    await client.patch(ref.id).setIfMissing(set).commit()
  }
  if (f.source_url) {
    await mergeArrayField(client, ref.id, 'data_sources',
      [dataSourceEntry({ source: 'research', url: f.source_url })], 'url')
  }
  return ref
}

async function enrichOne(client, slug, data, stats) {
  if (!data.sources || !Array.isArray(data.sources) || data.sources.length === 0) {
    stats.skippedNoSource++
    return { slug, status: 'skip (no sources)' }
  }
  const id = startupDocId(slug)
  const exists = await client.fetch('*[_id==$id][0]._id', { id })
  if (!exists) { stats.notFound++; return { slug, status: 'skip (not in DB)' } }

  const touched = []

  // ── Scalar / text fields: setIfMissing so we never clobber existing data ──
  const setIfMissing = {}
  if (clamp(data.tagline, 160)) setIfMissing.tagline = clamp(data.tagline, 160)
  if (clamp(data.short_description, 400)) setIfMissing.short_description = clamp(data.short_description, 400)
  if (num(data.total_funding_raised)) setIfMissing.total_funding_raised = num(data.total_funding_raised)
  if (num(data.latest_valuation)) setIfMissing.latest_valuation = num(data.latest_valuation)
  if (data.status) setIfMissing.status = data.status
  if (Array.isArray(data.long_story) && data.long_story.length) {
    setIfMissing.long_story = ptParagraphs(...data.long_story.map((p) => noEmDash(p)))
  }
  if (Object.keys(setIfMissing).length) {
    touched.push(...Object.keys(setIfMissing))
    if (!DRY) await client.patch(id).setIfMissing(setIfMissing).commit({ autoGenerateArrayKeys: true })
  }

  // ── Founders: create docs + link references (dedup by _ref) ──
  if (Array.isArray(data.founders) && data.founders.length) {
    const refs = []
    for (const f of data.founders) {
      if (!f?.name) continue
      const r = await upsertFounderDoc(client, f)
      refs.push({ _type: 'reference', _key: rkey('fr'), _ref: r.id })
    }
    if (refs.length && !DRY) {
      const added = await mergeArrayField(client, id, 'founders', refs, '_ref')
      if (added) touched.push(`founders+${added}`)
    } else if (refs.length) touched.push(`founders~${refs.length}`)
  }

  // ── Funding rounds (dedup by date+round_type) ──
  if (Array.isArray(data.funding_rounds) && data.funding_rounds.length) {
    const rounds = data.funding_rounds
      .filter((r) => r?.date)
      .map((r) => ({
        _type: 'fundingRound', _key: rkey('rd'),
        date: r.date,
        round_type: r.round_type,
        amount: num(r.amount),
        amount_usd: num(r.amount_usd),
        lead_investor: r.lead_investor ? noEmDash(r.lead_investor) : undefined,
        all_investors: Array.isArray(r.all_investors) ? r.all_investors : undefined,
        valuation_at_round: num(r.valuation_at_round),
        source_url: r.source_url,
      }))
    if (rounds.length && !DRY) {
      // dedup by round date (two rounds on the same calendar date are vanishingly rare)
      const added = await mergeArrayField(client, id, 'funding_rounds', rounds, 'date')
      if (added) touched.push(`rounds+${added}`)
    } else if (rounds.length) touched.push(`rounds~${rounds.length}`)
  }

  // ── Financials (dedup by fiscal_year) ──
  if (Array.isArray(data.financials) && data.financials.length) {
    const fins = data.financials
      .filter((f) => f?.fiscal_year)
      .map((f) => ({
        _type: 'financialSnapshot', _key: rkey('fy'),
        fiscal_year: String(f.fiscal_year),
        revenue: num(f.revenue),
        profit: typeof f.profit === 'number' ? Math.round(f.profit) : undefined, // profit may be negative
        ebitda: typeof f.ebitda === 'number' ? Math.round(f.ebitda) : undefined,
        employee_count: num(f.employee_count),
        valuation: num(f.valuation),
        currency: 'INR',
        source: f.source || 'research',
        source_url: f.source_url,
      }))
    if (fins.length && !DRY) {
      const added = await mergeArrayField(client, id, 'financials', fins, 'fiscal_year')
      if (added) touched.push(`fin+${added}`)
    } else if (fins.length) touched.push(`fin~${fins.length}`)
  }

  // ── Milestones (dedup by title) ──
  if (Array.isArray(data.milestones) && data.milestones.length) {
    const ms = data.milestones
      .filter((m) => m?.title)
      .map((m) => ({
        _type: 'object', _key: rkey('ms'),
        date: m.date,
        title: noEmDash(m.title),
        description: m.description ? noEmDash(m.description) : undefined,
        source_url: m.source_url,
      }))
    if (ms.length && !DRY) {
      const added = await mergeArrayField(client, id, 'milestones', ms, 'title')
      if (added) touched.push(`ms+${added}`)
    } else if (ms.length) touched.push(`ms~${ms.length}`)
  }

  // ── Provenance + mark enriched ──
  if (!DRY) {
    const srcRows = data.sources.map((s) => dataSourceEntry({ source: s.source || 'research', url: s.url }))
    await mergeArrayField(client, id, 'data_sources', srcRows, 'url')
    await client.patch(id).set({ last_updated_at: new Date().toISOString() }).commit()
  }

  stats.enriched++
  return { slug, status: touched.length ? touched.join(' ') : 'nothing new' }
}

async function main() {
  const payload = JSON.parse(readFileSync(FILE, 'utf-8'))
  const slugs = Object.keys(payload)
  console.log(`enrich-write: ${slugs.length} companies from ${FILE}${DRY ? ' [DRY RUN]' : ''}`)
  const client = await getSanityClient()
  const stats = { enriched: 0, skippedNoSource: 0, notFound: 0 }
  const rows = []
  for (const slug of slugs) {
    try {
      rows.push(await enrichOne(client, slug, payload[slug], stats))
    } catch (e) {
      rows.push({ slug, status: `ERROR: ${e.message}` })
    }
  }
  for (const r of rows) console.log(`  ${r.slug.padEnd(34)} ${r.status}`)
  console.log(`\nDone. enriched=${stats.enriched} skippedNoSource=${stats.skippedNoSource} notFound=${stats.notFound}`)
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1) })
