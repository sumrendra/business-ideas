/**
 * scripts/ingest-startups/_lib.mjs
 *
 * Shared utilities for the startup ingestion pipeline.
 * All ingest-startups/*.mjs scripts import from this file.
 *
 * Loaded by every script. Keep it dependency-light: only @sanity/client
 * (already a transitive dep of next-sanity).
 */

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(__dirname, '..', '..')
export const SEED_LIST_PATH = join(__dirname, 'seed-list.json')

// ────────────────────────────────────────────────────────────────────────────
// .env.local loader (no dotenv dep). Mirrors seed-ideas.mjs.
// Caller may also pass --env-file=.env.local to node, but we run unprivileged
// from run-all.mjs without that flag, so this fallback keeps things robust.
// ────────────────────────────────────────────────────────────────────────────
let _envLoaded = false
export function loadEnv() {
  if (_envLoaded) return process.env
  const envPath = join(ROOT, '.env.local')
  if (existsSync(envPath)) {
    readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) {
        const k = m[1].trim()
        const v = m[2].trim().replace(/^["']|["']$/g, '')
        if (!process.env[k]) process.env[k] = v
      }
    })
  }
  _envLoaded = true
  return process.env
}

// ────────────────────────────────────────────────────────────────────────────
// CLI args. Lightweight; supports --flag value and --flag=value and --bool.
// ────────────────────────────────────────────────────────────────────────────
export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const eq = a.indexOf('=')
      if (eq !== -1) {
        out[a.slice(2, eq)] = a.slice(eq + 1)
      } else {
        const next = argv[i + 1]
        if (next && !next.startsWith('--')) {
          out[a.slice(2)] = next
          i++
        } else {
          out[a.slice(2)] = true
        }
      }
    } else {
      out._.push(a)
    }
  }
  return out
}

// ────────────────────────────────────────────────────────────────────────────
// Seed list loader. Optional --limit cap.
// ────────────────────────────────────────────────────────────────────────────
export function loadSeedList(limit) {
  const raw = JSON.parse(readFileSync(SEED_LIST_PATH, 'utf-8'))
  const all = raw.startups ?? []
  if (limit && limit > 0) return all.slice(0, limit)
  return all
}

// ────────────────────────────────────────────────────────────────────────────
// Sanity client. Lazy.
// ────────────────────────────────────────────────────────────────────────────
let _client = null
export async function getSanityClient() {
  if (_client) return _client
  loadEnv()
  const { createClient } = await import('@sanity/client')
  _client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    // Prefer write-scope token, fall back to read-scope (which fails create-ops).
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
    useCdn: false,
  })
  return _client
}

// ────────────────────────────────────────────────────────────────────────────
// Deterministic Sanity document ids. createOrReplace is safer with stable ids.
// ────────────────────────────────────────────────────────────────────────────
export function startupDocId(slug) { return `startup.${slug}` }
export function founderDocId(slug) { return `founder.${slug}` }

// ────────────────────────────────────────────────────────────────────────────
// slugify — same algorithm Sanity Studio uses for the slug input. Stable.
// ────────────────────────────────────────────────────────────────────────────
export function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

// ────────────────────────────────────────────────────────────────────────────
// Random short key for Sanity arrays.
// ────────────────────────────────────────────────────────────────────────────
export function rkey(prefix = '') {
  return (prefix ? prefix + '-' : '') + Math.random().toString(36).slice(2, 10)
}

// ────────────────────────────────────────────────────────────────────────────
// Portable Text helpers. Mirrors seed-ideas.mjs.
// ────────────────────────────────────────────────────────────────────────────
export function pt(text) {
  return {
    _type: 'block',
    _key: rkey('b'),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: rkey('s'), text: String(text || ''), marks: [] }],
  }
}

export function ptParagraphs(...paragraphs) {
  return paragraphs.filter(Boolean).map((text) => pt(text))
}

// ────────────────────────────────────────────────────────────────────────────
// Em-dash scrubber. Brand rule: no em dashes in user-facing copy.
// Em (—), En (–), and minus-like double hyphen (--) all get replaced with ", ".
// Safe to run on any plain string.
// ────────────────────────────────────────────────────────────────────────────
export function noEmDash(s) {
  if (typeof s !== 'string') return s
  return s
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s--\s/g, ', ')
}

// ────────────────────────────────────────────────────────────────────────────
// Polite fetch. Sets a real User-Agent (sites that block default node ones).
// Retries 429 / 503 with exponential backoff. Throws on other non-2xx.
// ────────────────────────────────────────────────────────────────────────────
export const UA = 'BusinessIdeasLive-Ingest/1.0 (+https://businessideas.live; contact: sharmaharil28@gmail.com)'

export async function politeFetch(url, opts = {}) {
  const maxAttempts = opts.maxAttempts ?? 4
  const baseDelay = opts.baseDelay ?? 800
  const headers = {
    'User-Agent': UA,
    'Accept': opts.accept ?? 'application/json, text/html;q=0.9, */*;q=0.5',
    ...(opts.headers || {}),
  }
  let lastErr = null
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: opts.method ?? 'GET',
        headers,
        body: opts.body,
        redirect: 'follow',
      })
      if (res.status === 429 || res.status === 503) {
        const wait = baseDelay * Math.pow(2, attempt)
        await sleep(wait)
        continue
      }
      if (!res.ok && opts.allowNotOk !== true) {
        throw new Error(`HTTP ${res.status} ${url}`)
      }
      return res
    } catch (e) {
      lastErr = e
      await sleep(baseDelay * Math.pow(2, attempt))
    }
  }
  throw lastErr || new Error(`fetch failed: ${url}`)
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// ────────────────────────────────────────────────────────────────────────────
// Source provenance row. Appends to startup.data_sources[].
// ────────────────────────────────────────────────────────────────────────────
export function dataSourceEntry({ source, url }) {
  return {
    _key: rkey('src'),
    _type: 'dataSource',
    source,
    url,
    last_fetched: new Date().toISOString(),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Patch helpers. Pattern: for each script, we want to setIfMissing fields
// that exist on the doc and merge into array fields. Editor edits win.
// ────────────────────────────────────────────────────────────────────────────
export async function ensureStartupExists(client, seed, sourceLabel = 'seed-list') {
  const id = startupDocId(seed.slug)
  const base = {
    _id: id,
    _type: 'startup',
    name: seed.name,
    slug: { _type: 'slug', current: seed.slug },
    legal_name: seed.legal_name,
    cin: seed.cin,
    website: seed.website,
    industry: seed.industry,
    sub_industry: seed.sub_industry,
    business_model: seed.business_model,
    stage: seed.stage,
    hq_city: seed.hq_city,
    hq_state: seed.hq_state,
    country: 'India',
    founded_year: seed.founded_year,
    status: 'active',
    verified: false,
    featured: false,
    published_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString(),
    data_sources: [dataSourceEntry({ source: sourceLabel, url: 'scripts/ingest-startups/seed-list.json' })],
  }
  // createIfNotExists is the safe primitive: never overwrites existing fields.
  return client.createIfNotExists(base)
}

export async function patchStartup(client, slug, patcher) {
  const id = startupDocId(slug)
  const tx = client.patch(id)
  patcher(tx)
  return tx.commit({ autoGenerateArrayKeys: true })
}

/**
 * Atomically merge an array of items into a startup doc's array field.
 *
 * Sanity's patch builder collapses multiple .setIfMissing() calls and reorders
 * setIfMissing AFTER insert (append), which means appending to a field that
 * doesn't yet exist silently no-ops. The workaround used across the ingest
 * scripts is to read-modify-write with `set`: fetch existing array, concat
 * new entries (already deduped by the caller), and write the full array back.
 *
 * `dedupeKey` is an optional string key on each item used to skip duplicates
 * already present in the existing array. Set to null to disable dedup.
 */
export async function mergeArrayField(client, docId, field, newItems, dedupeKey = null) {
  if (!newItems || newItems.length === 0) return 0
  const existing = await client.fetch(`*[_id == $id][0]{ "f": ${field} }`, { id: docId })
  const have = existing?.f || []
  let toAdd = newItems
  if (dedupeKey) {
    const haveKeys = new Set(have.map((x) => (x?.[dedupeKey] ?? '').toString().trim().toLowerCase()))
    toAdd = newItems.filter((x) => !haveKeys.has((x?.[dedupeKey] ?? '').toString().trim().toLowerCase()))
  }
  if (toAdd.length === 0) return 0
  await client.patch(docId).set({ [field]: [...have, ...toAdd] }).commit({ autoGenerateArrayKeys: true })
  return toAdd.length
}

// ────────────────────────────────────────────────────────────────────────────
// Status table printer. Used by orchestrator.
// ────────────────────────────────────────────────────────────────────────────
export function printTable(rows) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const widths = headers.map((h) => Math.max(h.length, ...rows.map((r) => String(r[h] ?? '').length)))
  const fmt = (cells) => cells.map((c, i) => String(c ?? '').padEnd(widths[i], ' ')).join(' | ')
  console.log(fmt(headers))
  console.log(widths.map((w) => '-'.repeat(w)).join('-+-'))
  for (const r of rows) console.log(fmt(headers.map((h) => r[h])))
}
