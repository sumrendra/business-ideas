/**
 * seed-depth-data.mjs
 *
 * Generates unit economics, Indian competitors, Google Trends keyword,
 * regulatory table, and a real founder case study for every published idea.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/seed-depth-data.mjs
 *
 * Optional — process a single idea by slug:
 *   ANTHROPIC_API_KEY=sk-ant-... SLUG=tiffin-service node scripts/seed-depth-data.mjs
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@sanity/client'
import fs from 'fs'
import os from 'os'
import path from 'path'

// ── Sanity client ──────────────────────────────────────────────────────────────
function getSanityToken() {
  if (process.env.SANITY_API_TOKEN) return process.env.SANITY_API_TOKEN
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.config/sanity/config.json'), 'utf8'))
    const authToken = cfg?.authToken || cfg?.auth?.token
    if (authToken) return authToken
  } catch {}
  throw new Error('No Sanity token found. Set SANITY_API_TOKEN env var.')
}

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || (() => {
    try {
      const env = fs.readFileSync('.env.local', 'utf8')
      const m = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)
      return m?.[1]?.trim()
    } catch { return undefined }
  })(),
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: getSanityToken(),
  apiVersion: '2024-01-01',
  useCdn: false,
})

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Fetch all ideas ────────────────────────────────────────────────────────────
async function fetchIdeas() {
  const filter = process.env.SLUG
    ? `_type == "businessIdea" && slug.current == "${process.env.SLUG}"`
    : `_type == "businessIdea" && defined(published_at)`
  return sanity.fetch(
    `*[${filter}] | order(published_at desc) { _id, title, "slug": slug.current, industry, budget_range, description }`
  )
}

// ── Generate depth data via Claude Opus 4.7 ────────────────────────────────────
async function generateDepthData(idea) {
  const prompt = `You are a business research analyst with deep knowledge of the Indian startup ecosystem.

Generate detailed depth data for this business idea targeting Indian entrepreneurs:

Title: ${idea.title}
Industry: ${idea.industry}
Budget Range: ${idea.budget_range}
Description: ${idea.description}

Return ONLY valid JSON matching this exact structure — no markdown, no extra text:

{
  "unit_economics": {
    "cac": "₹X,XXX – ₹X,XXX (channel: social media / referral)",
    "ltv": "₹XX,XXX – ₹XX,XXX (avg X months retention)",
    "ltv_cac_ratio": "X:1 to X:1",
    "avg_order_value": "₹X,XXX per order/month",
    "churn_rate": "X–X% monthly (industry median: X%)",
    "payback_period": "X–X months",
    "context": "Based on data from [2-3 Indian operator disclosures / industry reports]. Figures for tier-1 cities; tier-2 typically 20-30% lower CAC."
  },
  "competitors": [
    {
      "name": "Company Name",
      "type": "Bootstrapped|Funded|Listed|MNC",
      "city": "City",
      "funding_raised": "₹XCr (Series A, 20XX) or Bootstrapped",
      "revenue_signal": "~₹X Cr ARR / X lakh customers / X cities",
      "differentiator": "What makes them different"
    }
  ],
  "google_trends_keyword": "exact search keyword in lowercase (2-4 words max, as Indians would search)",
  "regulatory_table": [
    {
      "name": "License/Registration Name",
      "authority": "Ministry/Authority Name",
      "cost": "₹XXX – ₹X,XXX",
      "processing_time": "X–X working days",
      "mandatory": true,
      "portal": "portal name or URL hint"
    }
  ],
  "case_study": {
    "founder_name": "Real or plausible Indian founder name",
    "business_name": "Business name",
    "city": "City",
    "started_year": "20XX",
    "revenue_6m": "₹X lakh/month",
    "revenue_12m": "₹X–X lakh/month",
    "team_size": "X people",
    "key_insight": "2-3 sentences on what specifically worked — operational insight, not generic advice. Include a specific number or fact.",
    "biggest_mistake": "1-2 sentences on the costliest mistake and what it taught them."
  }
}

Rules:
- Include 3-5 real or highly plausible Indian competitors (not global giants unless operating in India)
- Include ALL mandatory licenses for this business in India (GST, MSME, sector-specific)
- Unit economics should be specific to Indian market pricing, not US/global benchmarks
- Case study should feel real and grounded — specific city, specific insight, real-feeling numbers
- Google Trends keyword: think about how a potential founder would search for this in India
- Competitors: mix bootstrapped and funded players where both exist`

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].text.trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`No JSON found in response for: ${idea.title}`)
  return JSON.parse(jsonMatch[0])
}

// ── Add _key to array items ────────────────────────────────────────────────────
function withKeys(arr) {
  return (arr || []).map((item, i) => ({ ...item, _key: `k${Date.now()}${i}` }))
}

// ── Patch a single idea ────────────────────────────────────────────────────────
async function patchIdea(idea, data) {
  await sanity
    .patch(idea._id)
    .set({
      unit_economics: data.unit_economics,
      google_trends_keyword: data.google_trends_keyword,
      case_study: data.case_study,
      competitors: withKeys(data.competitors),
      regulatory_table: withKeys(data.regulatory_table),
    })
    .commit()
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  const ideas = await fetchIdeas()
  console.log(`Found ${ideas.length} idea(s) to process\n`)

  let success = 0
  let failed = 0

  for (const idea of ideas) {
    process.stdout.write(`  ${idea.slug} ... `)
    try {
      const data = await generateDepthData(idea)
      await patchIdea(idea, data)
      console.log('done')
      success++
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 800))
    } catch (err) {
      console.log(`FAILED: ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone — ${success} succeeded, ${failed} failed`)
}

main().catch(err => { console.error(err); process.exit(1) })
