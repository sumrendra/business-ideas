#!/usr/bin/env node
/**
 * scripts/ingest-startups/from-tofler.js — STUB / PROOF OF CONCEPT.
 *
 * DO NOT RUN BLINDLY. Read the "Legal & operational notes" block below first
 * and discuss with the user. This file is intentionally a complete-but-paused
 * pipeline: it parses CINs from a CSV, hits tofler.in HTML, extracts revenue
 * + profit + directors, and upserts to Sanity. It is NOT scheduled and NOT
 * wired into any CI workflow.
 *
 * --------------------------------------------------------------------------
 * Legal & operational notes
 * --------------------------------------------------------------------------
 * - Tofler's data originates from MCA filings (public) but is presented under
 *   their own Terms of Service. Scraping at scale violates their ToS. For
 *   production use, get an enterprise quote (support@tofler.in) and use their
 *   API instead of HTML scraping.
 * - data.gov.in MCA Company Master Data (already wired in scripts/fetch-mca21.mjs)
 *   is the only ToS-clean, fully free source for company-level data. It covers
 *   identity + paid-up capital + class, but NOT financial filings (revenue,
 *   profit). For financials there is no free legal source as of 2026.
 * - Recommended path for v1: hand-curate the top ~300 startups in Sanity
 *   (Tier 1 in the plan) and only switch this script on once the user has
 *   approved a paid Tofler / Tracxn agreement.
 * --------------------------------------------------------------------------
 *
 * Usage (once enabled):
 *   node scripts/ingest-startups/from-tofler.js \
 *     --csv data/cins.csv \
 *     --concurrency 2 \
 *     --dry-run
 *
 * CSV format (header row required):
 *   cin,brand_name,industry
 *   U72200KA2010PTC053779,Flipkart,E-commerce
 *
 * Env:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID (required to write back)
 *   NEXT_PUBLIC_SANITY_DATASET    (defaults to "production")
 *   SANITY_API_TOKEN              (must have write access)
 *   TOFLER_RATE_LIMIT_MS          (defaults to 4000 — be polite if/when enabled)
 */

import fs from 'node:fs/promises'
import path from 'node:path'

// Sanity client — same pattern as existing seed-* scripts.
//   import { createClient } from '@sanity/client'
// We declare this lazily so the file parses even before @sanity/client is
// installed at the top level (it's pulled in transitively via next-sanity).
let sanityClient = null
async function getClient() {
  if (sanityClient) return sanityClient
  const { createClient } = await import('@sanity/client')
  sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion:'2024-01-01',
    token:     process.env.SANITY_API_TOKEN,
    useCdn:    false,
  })
  return sanityClient
}

// ── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
function arg(name, fallback = null) {
  const i = args.indexOf(`--${name}`)
  if (i === -1) return fallback
  const next = args[i + 1]
  if (next && !next.startsWith('--')) return next
  return true
}
const CSV_PATH    = arg('csv', 'data/cins.csv')
const CONCURRENCY = parseInt(arg('concurrency', '2'), 10)
const DRY_RUN     = !!arg('dry-run', false)
const RATE_MS     = parseInt(process.env.TOFLER_RATE_LIMIT_MS ?? '4000', 10)

// ── CSV reader (no deps) ────────────────────────────────────────────────────
async function readCsv(file) {
  const raw = await fs.readFile(file, 'utf8')
  const [headerLine, ...lines] = raw.trim().split(/\r?\n/)
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase())
  return lines.filter(Boolean).map((line) => {
    const cells = line.split(',').map((c) => c.trim())
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']))
  })
}

// ── Fetch a Tofler company page by CIN ──────────────────────────────────────
// Tofler URL pattern: https://www.tofler.in/<slug>/company/<CIN>
// We hit the canonical CIN-only URL which always 301s to the slug version.
async function fetchToflerHtml(cin) {
  const url = `https://www.tofler.in/company/${encodeURIComponent(cin)}`
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'BusinessIdeas.live data sync (contact: sharmaharil28@gmail.com)',
      'Accept': 'text/html',
    },
  })
  if (!res.ok) throw new Error(`Tofler HTTP ${res.status} for ${cin}`)
  return await res.text()
}

// ── Parser ──────────────────────────────────────────────────────────────────
// Intentionally regex-based and brittle — Tofler reshapes its DOM regularly.
// When the user upgrades to the paid Tofler API, replace this whole block with
// a JSON shape map.
function parseTofler(html, cin) {
  const out = {
    cin,
    legal_name:  null,
    incorporation_date: null,
    directors:   [],
    financials:  [],
  }

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
  if (titleMatch) out.legal_name = titleMatch[1].split('|')[0].trim()

  // Tofler renders a snapshot table — pick out the latest revenue/profit numbers.
  // Real implementation should use cheerio; using regex here only as a sketch.
  const revenueMatch = html.match(/Operating Revenue[^<]*<[^>]+>[^₹]*₹\s*([\d.,]+)\s*(Cr|L)/i)
  const profitMatch  = html.match(/Net Profit[^<]*<[^>]+>[^₹]*₹\s*(-?[\d.,]+)\s*(Cr|L)/i)
  const fyMatch      = html.match(/Latest Financials \(FY\s*(\d{2,4})\)/i)

  if (revenueMatch || profitMatch) {
    out.financials.push({
      fiscal_year: fyMatch ? `FY${fyMatch[1].slice(-2)}` : 'FY?',
      revenue: revenueMatch ? toINR(revenueMatch[1], revenueMatch[2]) : null,
      profit:  profitMatch  ? toINR(profitMatch[1],  profitMatch[2])  : null,
      source: 'Tofler',
      source_url: `https://www.tofler.in/company/${cin}`,
    })
  }

  // Directors table parsing — illustrative only.
  const dirMatches = [...html.matchAll(/data-din="(\d{8})"[^>]*>([^<]+)</g)]
  for (const m of dirMatches) {
    out.directors.push({ din: m[1], name: m[2].trim() })
  }

  return out
}

function toINR(numStr, unit) {
  const n = parseFloat(numStr.replace(/,/g, ''))
  if (Number.isNaN(n)) return null
  if (/cr/i.test(unit)) return Math.round(n * 1_00_00_000)
  if (/l/i.test(unit))  return Math.round(n * 1_00_000)
  return Math.round(n)
}

// ── Upsert to Sanity ────────────────────────────────────────────────────────
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96)
}

async function upsertStartup(client, row, parsed) {
  const id = `startup-${row.cin.toLowerCase()}`
  const doc = {
    _id: id,
    _type: 'startup',
    name: row.brand_name,
    legal_name: parsed.legal_name ?? row.brand_name,
    cin: row.cin,
    slug: { _type: 'slug', current: slugify(row.brand_name) },
    industry: row.industry || undefined,
    board: parsed.directors.map((d) => ({
      _key: d.din,
      _type: 'object',
      name: d.name,
      din: d.din,
    })),
    financials: parsed.financials.map((f, i) => ({
      _key: `fin-${f.fiscal_year}-${i}`,
      _type: 'financialSnapshot',
      ...f,
    })),
    data_sources: [{
      _key: `tofler-${Date.now()}`,
      _type: 'dataSource',
      source: 'Tofler (auto-ingest)',
      url: `https://www.tofler.in/company/${row.cin}`,
      last_fetched: new Date().toISOString(),
    }],
    last_updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  }

  if (DRY_RUN) {
    console.log('[dry-run] would upsert', id, JSON.stringify({ ...doc, board: doc.board.length, financials: doc.financials.length }))
    return
  }

  // createOrReplace preserves the _id but blows away any manual editor changes.
  // For Tier 2 ingestion the safer approach is `patch().setIfMissing()` so
  // human edits win — to be wired in once schema is locked.
  await client.createOrReplace(doc)
  console.log('upserted', id)
}

// ── Mini concurrency runner ─────────────────────────────────────────────────
async function runPool(items, worker, n) {
  const queue = items.slice()
  const workers = Array.from({ length: n }, async () => {
    while (queue.length) {
      const item = queue.shift()
      try { await worker(item) }
      catch (e) { console.error('worker err for', item?.cin, e.message) }
      await new Promise((r) => setTimeout(r, RATE_MS))
    }
  })
  await Promise.all(workers)
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Reading CIN list from ${CSV_PATH}`)
  const rows = await readCsv(path.resolve(CSV_PATH))
  console.log(`Loaded ${rows.length} CINs. Dry-run=${DRY_RUN}. Concurrency=${CONCURRENCY}. Rate=${RATE_MS}ms`)

  if (!DRY_RUN) {
    if (!process.env.SANITY_API_TOKEN) {
      console.error('SANITY_API_TOKEN required for writes. Re-run with --dry-run to test parsing only.')
      process.exit(1)
    }
  }

  const client = DRY_RUN ? null : await getClient()

  await runPool(rows, async (row) => {
    if (!row.cin) return
    const html   = await fetchToflerHtml(row.cin)
    const parsed = parseTofler(html, row.cin)
    if (client || DRY_RUN) await upsertStartup(client, row, parsed)
  }, CONCURRENCY)

  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
