#!/usr/bin/env node
/**
 * scripts/ingest-startups/run-all.mjs
 *
 * Phase 3: Orchestrator. Runs the seven source scripts in order and prints
 * a single summary table at the end.
 *
 * Order (deliberate):
 *   1. Wikidata    — establishes identity + founders + base patches
 *   2. Wikipedia   — adds short_description, long_story, milestones, logos
 *   3. Crunchbase  — total funding (known + ODM)
 *   4. NSE/BSE     — market cap for listed startups
 *   5. News RSS    — append recent-news milestones
 *   6. GitHub      — tags + OSS metadata for tech startups
 *   7. DPIIT       — tag DPIIT-recognized startups
 *
 * Flags forwarded to every child: --dry-run, --limit N, --only <slug,slug>
 *
 * Each script is its own process so we get clean output AND so one failure
 * doesn't pull down the rest of the pipeline. Status is parsed from each
 * script's final `[name] Done. { hit:N, miss:N, ... }` line.
 */

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { loadEnv, parseArgs, printTable } from './_lib.mjs'

loadEnv()
const args = parseArgs()
const DRY = !!args['dry-run']
const LIMIT = args.limit ? `--limit ${args.limit}` : ''
const ONLY = args.only ? `--only ${args.only}` : ''
const SKIP = args.skip ? new Set(String(args.skip).split(',').map((s) => s.trim())) : new Set()

const __dirname = dirname(fileURLToPath(import.meta.url))

const PIPELINE = [
  { name: 'Wikidata',     script: 'from-wikidata.mjs' },
  { name: 'Wikipedia',    script: 'from-wikipedia.mjs' },
  { name: 'Crunchbase',   script: 'from-crunchbase-odm.mjs' },
  { name: 'NSE/BSE',      script: 'from-nse-bse.mjs' },
  { name: 'News RSS',     script: 'enrich-from-news-rss.mjs' },
  { name: 'GitHub',       script: 'enrich-from-github.mjs' },
  { name: 'DPIIT',        script: 'from-dpiit.mjs' },
]

function runScript(script) {
  return new Promise((resolve) => {
    const argv = [join(__dirname, script)]
    if (DRY) argv.push('--dry-run')
    if (LIMIT) argv.push(...LIMIT.split(' '))
    if (ONLY) argv.push(...ONLY.split(' '))
    const child = spawn('node', argv, { stdio: ['inherit', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => { const s = d.toString(); stdout += s; process.stdout.write(s) })
    child.stderr.on('data', (d) => { const s = d.toString(); stderr += s; process.stderr.write(s) })
    child.on('exit', (code) => resolve({ code, stdout, stderr }))
  })
}

// Parse the final "Done. { ... }" line from each script's stdout
function parseDone(stdout) {
  const lines = stdout.trim().split('\n')
  // Walk backwards looking for "Done."
  for (let i = lines.length - 1; i >= 0; i--) {
    const ln = lines[i]
    if (ln.includes('Done.')) {
      const m = ln.match(/\{([^}]+)\}/)
      if (!m) return {}
      const out = {}
      for (const pair of m[1].split(',')) {
        const [k, v] = pair.split(':').map((s) => s.trim())
        if (!k) continue
        // Strip trailing quotes / parse numbers
        const cleanV = v?.replace(/['"`]/g, '').replace(/^([0-9]+).*/, '$1')
        out[k] = isNaN(+cleanV) ? cleanV : +cleanV
      }
      return out
    }
  }
  return {}
}

async function main() {
  console.log('═'.repeat(60))
  console.log('Indian Startup Database Ingestion Pipeline')
  console.log(`Mode: ${DRY ? 'DRY-RUN (no Sanity writes)' : 'LIVE'}`)
  if (LIMIT) console.log(`Limit: ${args.limit}`)
  if (ONLY) console.log(`Only: ${args.only}`)
  console.log('═'.repeat(60))

  const results = []
  for (const stage of PIPELINE) {
    if (SKIP.has(stage.name)) {
      console.log(`\n▶ SKIP   ${stage.name}`)
      results.push({ Source: stage.name, Hit: '-', Miss: '-', Skipped: 'skip', Errors: '-' })
      continue
    }
    console.log(`\n▶ STAGE  ${stage.name}  (${stage.script})\n${'-'.repeat(60)}`)
    const { code, stdout } = await runScript(stage.script)
    const parsed = parseDone(stdout)
    results.push({
      Source: stage.name,
      Hit:    parsed.hit ?? parsed.matched_items ?? '-',
      Miss:   parsed.miss ?? '-',
      Skipped:parsed.skipped ?? parsed.skipped_dupes ?? '-',
      Errors: parsed.errors ?? (code === 0 ? 0 : 'crash'),
    })
  }

  console.log('\n' + '═'.repeat(60))
  console.log('Summary')
  console.log('═'.repeat(60))
  printTable(results)
  console.log()
}

main().catch((e) => { console.error(e); process.exit(1) })
