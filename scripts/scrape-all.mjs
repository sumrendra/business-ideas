/**
 * Orchestrator: runs all tender scrapers sequentially.
 * Run: DATABASE_URL=... node scripts/scrape-all.mjs
 */

import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const scrapers = [
  { name: 'GeM',         file: 'scrape-gem.mjs' },
  { name: 'CPPP',        file: 'scrape-cppp.mjs' },
  { name: 'MahaTenders', file: 'scrape-mahatenders.mjs' },
]

const DB = process.env.DATABASE_URL
if (!DB) { console.error('❌ DATABASE_URL not set'); process.exit(1) }

for (const { name, file } of scrapers) {
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  Running ${name} scraper...`)
  console.log('═'.repeat(60))
  try {
    execSync(`node ${path.join(__dirname, file)}`, {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: DB },
      timeout: 10 * 60 * 1000,  // 10 min per scraper
    })
    console.log(`✅ ${name} done`)
  } catch(e) {
    console.error(`❌ ${name} failed: ${e.message}`)
    // continue with next scraper
  }
}

console.log('\n✅ All scrapers complete.')
