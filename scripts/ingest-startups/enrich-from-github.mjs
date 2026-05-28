#!/usr/bin/env node
/**
 * scripts/ingest-startups/enrich-from-github.mjs
 *
 * Phase 2 (f): GitHub public-org enrichment for tech startups.
 *
 * For each startup in seed-list with a `github_org`, hit
 *   GET https://api.github.com/orgs/{org}
 *   GET https://api.github.com/orgs/{org}/repos?per_page=100&sort=updated
 *
 * Without a GITHUB_TOKEN we get the unauthenticated tier: 60 req/hr/IP. The
 * seed list has ~25 github_org entries, well under the limit.
 *
 * What we append to the startup doc:
 *   - tags[]: `OSS: <top language>`, `GitHub: <N> repos`, `GitHub: <K>★ on <repoName>`
 *   - data_sources[]: GitHub URL of the org
 *
 * Flags: --dry-run --limit N --only <slug,slug>
 */

import {
  loadEnv, parseArgs, loadSeedList, getSanityClient,
  ensureStartupExists, startupDocId, dataSourceEntry, politeFetch, sleep,
  mergeArrayField,
} from './_lib.mjs'

loadEnv()
const args = parseArgs()
const DRY = !!args['dry-run']
const LIMIT = parseInt(args.limit ?? '0', 10) || 0
const ONLY = args.only ? new Set(String(args.only).split(',').map(s => s.trim())) : null

const GH_TOKEN = process.env.GITHUB_TOKEN || ''
const ghHeaders = {
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'BusinessIdeas-Ingest/1.0',
  ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
}

async function ghFetch(url) {
  const res = await politeFetch(url, { accept: 'application/vnd.github+json', headers: ghHeaders, allowNotOk: true })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`)
  return res.json()
}

async function run() {
  const seedList = loadSeedList(LIMIT)
  let targets = ONLY ? seedList.filter((s) => ONLY.has(s.slug)) : seedList
  targets = targets.filter((s) => s.github_org)

  console.log(`[github] Processing ${targets.length} orgs (dry=${DRY}, auth=${!!GH_TOKEN})`)

  let client = null
  if (!DRY) client = await getSanityClient()

  const stats = { hit: 0, miss: 0, skipped: 0, errors: 0 }

  for (const seed of targets) {
    try {
      const org = await ghFetch(`https://api.github.com/orgs/${seed.github_org}`)
      if (!org) {
        console.log(`  MISS  ${seed.name} (gh: ${seed.github_org} not found)`)
        stats.miss++
        await sleep(400)
        continue
      }
      const repos = await ghFetch(`https://api.github.com/orgs/${seed.github_org}/repos?per_page=100&sort=updated`) || []
      const publicRepos = org.public_repos ?? repos.length
      const totalStars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0)
      const langTally = {}
      for (const r of repos) {
        if (r.language) langTally[r.language] = (langTally[r.language] || 0) + 1
      }
      const topLang = Object.entries(langTally).sort((a, b) => b[1] - a[1])[0]?.[0]
      const topRepo = repos.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))[0]

      const newTags = [
        topLang ? `OSS: ${topLang}` : null,
        `GitHub: ${publicRepos} repos`,
        totalStars > 100 ? `GitHub: ${totalStars}★ total` : null,
        topRepo ? `Top OSS: ${topRepo.name} (${topRepo.stargazers_count}★)` : null,
      ].filter(Boolean)

      console.log(`  HIT   ${seed.name}: ${publicRepos} repos, ${totalStars}★ total, top=${topRepo?.name || '?'}`)
      if (DRY) { stats.hit++; await sleep(400); continue }

      await ensureStartupExists(client, seed, 'seed-list + GitHub')
      const docId = startupDocId(seed.slug)
      // Merge tags: read existing, dedupe.
      const existing = await client.fetch('*[_id == $id][0]{ tags }', { id: docId })
      const existingTags = new Set(existing?.tags || [])
      const tags = [...existingTags, ...newTags.filter((t) => !existingTags.has(t))]

      await client.patch(docId).set({ tags, last_updated_at: new Date().toISOString() }).commit()
      await mergeArrayField(client, docId, 'data_sources', [
        dataSourceEntry({ source: 'GitHub API', url: `https://github.com/${seed.github_org}` }),
      ], 'source')
      stats.hit++
      await sleep(500)
    } catch (e) {
      console.log(`  ERROR ${seed.name}: ${e.message}`)
      stats.errors++
    }
  }

  console.log('\n[github] Done.', stats)
  return stats
}

run().catch((e) => { console.error(e); process.exit(1) })
