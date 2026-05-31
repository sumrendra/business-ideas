/**
 * scripts/ingest-startups/backfill-logos.mjs
 *
 * Backfill startup logos. For every startup that has a `website` but no `logo`,
 * fetch the site's icon and upload it to Sanity, then set startup.logo.
 *
 * Logo source: Google's favicon service `s2/favicons?domain=<host>&sz=256`.
 * (Clearbit's logo API is unreachable from this environment.) The icon is a
 * clean square PNG that works well as a small card/avatar logo.
 *
 * Idempotent: skips any startup that already has a logo. Re-runnable.
 *
 * Usage:
 *   node scripts/ingest-startups/backfill-logos.mjs            # all missing
 *   node scripts/ingest-startups/backfill-logos.mjs --limit 40 # cap this run
 *   node scripts/ingest-startups/backfill-logos.mjs --dry      # list, don't write
 */

import {
  loadEnv, parseArgs, getSanityClient, startupDocId, dataSourceEntry,
  mergeArrayField, sleep, UA,
} from './_lib.mjs'

loadEnv()
const args = parseArgs()
const LIMIT = args.limit ? parseInt(args.limit, 10) : 0
const DRY = !!args.dry

function hostFromUrl(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return null }
}

async function fetchIcon(host) {
  // sz=256 gives the largest icon Google will return; many resolve to 128 but
  // it's still a crisp square. PNG with transparency.
  const url = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=256`
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
  if (!res.ok) throw new Error(`favicon HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  // Google returns a 16x16 globe placeholder (~?? bytes) when it has nothing.
  // Reject tiny payloads so we don't upload generic globes.
  if (buf.length < 600) throw new Error(`icon too small (${buf.length}b) — likely placeholder`)
  return buf
}

async function main() {
  const client = await getSanityClient()
  const targets = await client.fetch(
    `*[_type=="startup" && defined(website) && !defined(logo)]|order(name asc){ "slug": slug.current, name, website }`
  )
  const list = LIMIT > 0 ? targets.slice(0, LIMIT) : targets
  console.log(`backfill-logos: ${targets.length} missing logos; processing ${list.length}${DRY ? ' [DRY]' : ''}`)

  let ok = 0, skip = 0, fail = 0
  for (const s of list) {
    const host = hostFromUrl(s.website)
    if (!host) { console.log(`  ${s.slug.padEnd(32)} skip (bad url)`); skip++; continue }
    try {
      const buf = await fetchIcon(host)
      if (DRY) { console.log(`  ${s.slug.padEnd(32)} would upload (${buf.length}b from ${host})`); ok++; continue }
      const asset = await client.assets.upload('image', buf, {
        filename: `${s.slug}-logo.png`,
        contentType: 'image/png',
      })
      const id = startupDocId(s.slug)
      await client.patch(id).setIfMissing({
        logo: { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, alt: `${s.name} logo` },
      }).commit()
      await mergeArrayField(client, id, 'data_sources',
        [dataSourceEntry({ source: 'favicon', url: `https://${host}` })], 'url')
      console.log(`  ${s.slug.padEnd(32)} ✓ logo (${buf.length}b)`) ; ok++
    } catch (e) {
      console.log(`  ${s.slug.padEnd(32)} ✗ ${e.message}`); fail++
    }
    await sleep(250) // be polite to the favicon service
  }
  console.log(`\nDone. uploaded=${ok} skipped=${skip} failed=${fail}`)
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1) })
