#!/usr/bin/env node
/**
 * scripts/ingest-startups/enrich-from-news-rss.mjs
 *
 * Phase 2 (e): Recent news → milestones[]
 *
 * Fetches the latest items from 3 startup-ecosystem RSS feeds:
 *   - Inc42      https://inc42.com/feed/
 *   - YourStory  https://yourstory.com/feed
 *   - Entrackr   https://entrackr.com/feed
 *
 * For each item, fuzzy-matches the title against the seed-list company names.
 * If matched, appends a milestone entry to that startup's `milestones[]`
 * (date, title, description, source_url). Dedupes by title hash against
 * any existing milestones on the doc.
 *
 * No LLM extraction: v1 just attaches the article verbatim. Future passes can
 * use Claude to extract structured "raised $X" / "acquired Y" facts.
 *
 * Flags: --dry-run --limit N --only <slug,slug> --feeds N (per-feed item cap)
 *
 * RSS feeds 403 without a User-Agent — politeFetch sets one already.
 */

import {
  loadEnv, parseArgs, loadSeedList, getSanityClient,
  ensureStartupExists, startupDocId, dataSourceEntry, politeFetch, sleep, rkey, noEmDash,
  mergeArrayField,
} from './_lib.mjs'

loadEnv()
const args = parseArgs()
const DRY = !!args['dry-run']
const LIMIT = parseInt(args.limit ?? '0', 10) || 0
const ONLY = args.only ? new Set(String(args.only).split(',').map(s => s.trim())) : null
const FEED_LIMIT = parseInt(args.feeds ?? '60', 10)

const FEEDS = [
  { name: 'Inc42',     url: 'https://inc42.com/feed/' },
  { name: 'YourStory', url: 'https://yourstory.com/feed' },
  { name: 'Entrackr',  url: 'https://entrackr.com/feed' },
]

// ────────────────────────────────────────────────────────────────────────────
// Naive RSS parser. Supports both RSS 2.0 <item> and Atom <entry>.
// Returns [{title, link, pubDate, description}]
// ────────────────────────────────────────────────────────────────────────────
function parseRss(xml) {
  const items = []
  const tag = (block, name) => {
    // CDATA-aware
    const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i')
    const m = block.match(re)
    if (!m) return ''
    return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
  }

  // Match <item>…</item> (RSS 2.0) and <entry>…</entry> (Atom)
  const itemRe = /<item\b[\s\S]*?<\/item>|<entry\b[\s\S]*?<\/entry>/gi
  for (const m of xml.matchAll(itemRe)) {
    const block = m[0]
    const title = tag(block, 'title')
    let link = tag(block, 'link')
    // Atom uses <link href="..."/>; pluck href
    if (!link) {
      const hrefM = block.match(/<link[^>]+href="([^"]+)"/i)
      if (hrefM) link = hrefM[1]
    }
    const pubDate = tag(block, 'pubDate') || tag(block, 'published') || tag(block, 'updated')
    const description = tag(block, 'description') || tag(block, 'summary') || tag(block, 'content')
    items.push({
      title: stripHtml(title),
      link: link.trim(),
      pubDate: pubDate.trim(),
      description: stripHtml(description).slice(0, 280),
    })
  }
  return items
}

function stripHtml(s) {
  return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function isoDate(s) {
  if (!s) return new Date().toISOString().slice(0, 10)
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10)
  return d.toISOString().slice(0, 10)
}

// ────────────────────────────────────────────────────────────────────────────
// Name matcher. Build a regex per seed (case-insensitive, word-boundary).
// A match counts if the brand name appears as a standalone token in the title.
// Aliases handle apostrophes / casing quirks.
// ────────────────────────────────────────────────────────────────────────────
function buildMatchers(seedList) {
  return seedList.map((seed) => {
    const aliases = [seed.name, seed.name.replace(/'/g, '')]
    // Some explicit aliases
    if (seed.slug === 'byjus') aliases.push("BYJU's", 'Byjus', "Byju's")
    if (seed.slug === 'physicswallah') aliases.push('PhysicsWallah', 'PW Learning')
    if (seed.slug === 'tata-1mg') aliases.push('1mg', 'Tata 1mg')
    if (seed.slug === 'cultfit') aliases.push('Cult.fit', 'cure.fit', 'curefit')
    if (seed.slug === 'boat') aliases.push('boAt', 'boAt Lifestyle')
    const escaped = aliases.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    return {
      seed,
      re: new RegExp('(?:^|[^A-Za-z0-9])(' + escaped.join('|') + ')(?:[^A-Za-z0-9]|$)', 'i'),
    }
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────
async function run() {
  const seedList = loadSeedList(LIMIT)
  const candidates = ONLY ? seedList.filter((s) => ONLY.has(s.slug)) : seedList
  const matchers = buildMatchers(candidates)

  console.log(`[news-rss] Fetching ${FEEDS.length} feeds (per-feed cap ${FEED_LIMIT})`)

  const allItems = []
  for (const feed of FEEDS) {
    try {
      const res = await politeFetch(feed.url, { accept: 'application/rss+xml, application/xml, text/xml' })
      const xml = await res.text()
      const items = parseRss(xml).slice(0, FEED_LIMIT)
      console.log(`  ${feed.name}: ${items.length} items`)
      for (const it of items) allItems.push({ ...it, feed: feed.name })
      await sleep(400)
    } catch (e) {
      console.log(`  ${feed.name}: ERROR ${e.message}`)
    }
  }

  // Match items to startups
  const byStartup = new Map() // slug → milestones[]
  for (const item of allItems) {
    for (const m of matchers) {
      if (m.re.test(item.title)) {
        const list = byStartup.get(m.seed.slug) || []
        list.push({
          _key: rkey('m'),
          _type: 'object',
          date: isoDate(item.pubDate),
          title: noEmDash(item.title).slice(0, 160),
          description: noEmDash(`[${item.feed}] ${item.description || ''}`).slice(0, 400),
          source_url: item.link,
        })
        byStartup.set(m.seed.slug, list)
      }
    }
  }

  const stats = { matched_items: 0, startups_touched: byStartup.size, skipped_dupes: 0, errors: 0 }
  for (const v of byStartup.values()) stats.matched_items += v.length

  console.log(`\n[news-rss] Matched ${stats.matched_items} items to ${byStartup.size} startups`)

  if (DRY) {
    for (const [slug, ms] of byStartup) {
      console.log(`  [dry] ${slug}: +${ms.length} milestone(s)`)
    }
    return stats
  }

  const client = await getSanityClient()
  for (const [slug, milestones] of byStartup) {
    try {
      const seed = candidates.find((s) => s.slug === slug)
      if (!seed) continue
      await ensureStartupExists(client, seed, 'seed-list + News RSS')
      const docId = startupDocId(slug)
      const existing = await client.fetch('*[_id == $id][0]{ milestones }', { id: docId })
      const existingTitles = new Set((existing?.milestones || []).map((m) => (m.title || '').trim().toLowerCase()))
      const toAdd = milestones.filter((m) => !existingTitles.has(m.title.trim().toLowerCase()))
      const dup = milestones.length - toAdd.length
      stats.skipped_dupes += dup

      if (!toAdd.length) {
        console.log(`  ${slug}: 0 new (skipped ${dup})`)
        continue
      }
      await client.patch(docId).set({ last_updated_at: new Date().toISOString() }).commit()
      const addedMs = await mergeArrayField(client, docId, 'milestones', toAdd, 'title')
      await mergeArrayField(client, docId, 'data_sources', [
        dataSourceEntry({ source: 'News RSS (Inc42 / YourStory / Entrackr)', url: 'https://inc42.com/feed/' }),
      ], 'source')
      console.log(`  ${slug}: +${addedMs} (skipped ${dup})`)
    } catch (e) {
      console.log(`  ${slug}: ERROR ${e.message}`)
      stats.errors++
    }
  }

  console.log('\n[news-rss] Done.', stats)
  return stats
}

run().catch((e) => { console.error(e); process.exit(1) })
