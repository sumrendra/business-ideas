#!/usr/bin/env node
/**
 * scripts/ingest-startups/seed-base-docs.mjs
 *
 * Ensure a base startup doc exists in Sanity for EVERY entry in seed-list.json.
 * Uses createIfNotExists so existing docs are not overwritten. Cheap to re-run.
 *
 * Run this before any from-* scripts to guarantee that scripts which only call
 * ensureStartupExists conditionally (e.g. Wikipedia for the wikipedia_title-set
 * subset) still leave a record for the long tail with no wiki article.
 */

import { loadEnv, loadSeedList, getSanityClient, ensureStartupExists } from './_lib.mjs'

loadEnv()

async function run() {
  const seedList = loadSeedList(0)
  const client = await getSanityClient()
  console.log(`[seed-base] Ensuring base docs for ${seedList.length} startups`)
  let ok = 0, err = 0
  for (const seed of seedList) {
    try {
      await ensureStartupExists(client, seed, 'seed-list')
      ok++
    } catch (e) {
      console.log(`  ERROR ${seed.slug}: ${e.message}`)
      err++
    }
  }
  console.log(`[seed-base] Done. { ok: ${ok}, errors: ${err} }`)
}

run().catch((e) => { console.error(e); process.exit(1) })
