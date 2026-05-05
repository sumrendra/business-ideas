import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { homedir } from 'os'

const cfg = JSON.parse(readFileSync(`${homedir()}/.config/sanity/config.json`, 'utf8'))
const client = createClient({ projectId: '5p3rso81', dataset: 'production', apiVersion: '2024-01-01', token: cfg.authToken, useCdn: false })

const docs = await client.fetch(
  `*[_type=="businessIdea" && !defined(case_study.founder_name)]{
    "slug": slug.current, industry
  } | order(industry asc, slug asc)`
)
console.log(`Total without case study: ${docs.length}`)
const byIndustry = {}
for (const d of docs) {
  const ind = d.industry || 'Unknown'
  byIndustry[ind] = byIndustry[ind] || []
  byIndustry[ind].push(d.slug)
}
for (const [ind, slugs] of Object.entries(byIndustry)) {
  console.log(`\n// ── ${ind} (${slugs.length}) ──`)
  for (const s of slugs) console.log(`  '${s}',`)
}
