/**
 * research-proof-points.mjs
 *
 * Finds real case studies + data sources for every business idea in Sanity,
 * then patches each document with proof_points.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/research-proof-points.mjs
 *
 * Optional — limit to specific slugs:
 *   ANTHROPIC_API_KEY=... node scripts/research-proof-points.mjs home-tiffin-meal-subscription-service solar-panel-installation-maintenance-business
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const cliConfig = JSON.parse(readFileSync(join(process.env.HOME, '.config/sanity/config.json'), 'utf8'))

const sanity = createClient({
  projectId: '5p3rso81',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: cliConfig.authToken,
  useCdn: false,
})

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Fetch ideas from Sanity ────────────────────────────────────────────────
const slugFilter = process.argv.slice(2)

const ideas = await sanity.fetch(
  '*[_type == "businessIdea" && defined(slug.current)]{ _id, title, "slug": slug.current, industry, description }'
)

const targets = slugFilter.length
  ? ideas.filter((i) => slugFilter.includes(i.slug))
  : ideas

console.log(`\nResearching ${targets.length} idea(s)...\n`)

const results = []

for (const idea of targets) {
  console.log(`🔍  ${idea.title}`)

  let proofPoints = []

  try {
    // Use Claude with web_search to find real case studies + data
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [
        {
          role: 'user',
          content: `Find real case studies and credible data sources for this Indian business idea:

Title: "${idea.title}"
Industry: ${idea.industry}
Description: ${idea.description}

Find:
1. 2 real founder stories from YourStory.com, Inc42.com, Economic Times, or Mint — with founder name, city, how much they started with, what revenue/milestone they hit, and the article URL
2. 1 credible market stat from IBEF, MSME Ministry, NASSCOM, or a government report — with the specific number and URL

Return ONLY a valid JSON array in this exact format, no other text:
[
  {
    "type": "Case Study",
    "source": "YourStory",
    "url": "https://...",
    "headline": "article headline",
    "founder": "Name, City",
    "key_stat": "Started with ₹X lakh, now earning ₹Y/month",
    "quote": "optional short quote from the article"
  },
  {
    "type": "Market Data",
    "source": "IBEF",
    "url": "https://...",
    "headline": "brief description of the data",
    "key_stat": "specific number or fact"
  }
]

Only include items where you found a real URL. Do not fabricate. If you find fewer than 3, that is fine.`,
        },
      ],
    })

    // Extract the final text response (after tool use)
    const textBlock = response.content.find((b) => b.type === 'text')
    if (textBlock) {
      const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        proofPoints = parsed.map((p, i) => ({ ...p, _key: `pp_${idea.slug}_${i}` }))
        console.log(`   ✓  ${proofPoints.length} proof point(s) found`)
      }
    }
  } catch (err) {
    console.log(`   ✗  Research failed: ${err.message}`)
  }

  results.push({ slug: idea.slug, _id: idea._id, title: idea.title, proof_points: proofPoints })

  // Patch Sanity immediately
  if (proofPoints.length > 0) {
    try {
      await sanity.patch(idea._id).set({ proof_points: proofPoints }).commit()
      console.log(`   → Patched Sanity\n`)
    } catch (err) {
      console.log(`   ✗  Sanity patch failed: ${err.message}\n`)
    }
  } else {
    console.log(`   → No data to patch\n`)
  }

  // Small delay to avoid rate limits
  await new Promise((r) => setTimeout(r, 1500))
}

// Save full results for review
const outPath = join(process.cwd(), 'scripts', 'proof-points-output.json')
writeFileSync(outPath, JSON.stringify(results, null, 2))
console.log(`\nFull results saved to scripts/proof-points-output.json`)
console.log('Done.')
