/**
 * seed-idea-metrics.mjs
 *
 * Uses Claude to generate the 6 new validation metrics for every businessIdea
 * in Sanity, then patches each document.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/seed-idea-metrics.mjs
 *
 * Optional — limit to specific slugs:
 *   ANTHROPIC_API_KEY=... node scripts/seed-idea-metrics.mjs home-tiffin-service solar-panel-business
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

const slugFilter = process.argv.slice(2)

const ideas = await sanity.fetch(
  `*[_type == "businessIdea" && defined(slug.current)]{
    _id, title, "slug": slug.current, industry, description,
    budget_range, difficulty_level, pros, cons, things_to_note
  }`
)

const targets = slugFilter.length
  ? ideas.filter((i) => slugFilter.includes(i.slug))
  : ideas

console.log(`\nGenerating metrics for ${targets.length} idea(s)...\n`)

const results = []

const BUDGET_MAP = {
  under_1l:  'Under ₹1 Lakh',
  '1l_10l':  '₹1L–₹10L',
  '10l_50l': '₹10L–₹50L',
  '50l_2cr': '₹50L–₹2Cr',
  '2cr_plus':'₹2 Crore+',
}

for (const idea of targets) {
  console.log(`⚙️  ${idea.title}`)

  let metrics = null

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content: `You are a business analyst for Indian small businesses. Generate realistic validation metrics for this Indian business idea.

Title: "${idea.title}"
Industry: ${idea.industry}
Description: ${idea.description}
Budget: ${BUDGET_MAP[idea.budget_range] || idea.budget_range}
Difficulty: ${idea.difficulty_level}
${idea.pros?.length ? `Pros: ${idea.pros.join(', ')}` : ''}
${idea.cons?.length ? `Cons: ${idea.cons.join(', ')}` : ''}

Return ONLY a valid JSON object — no other text, no markdown:
{
  "monthly_revenue_range": "₹X–₹Y/month (at 6 months of operation, realistic for a solo/small team, in Indian rupees)",
  "time_to_first_revenue": "X–Y weeks/months (how quickly can a founder earn their first rupee)",
  "breakeven_timeline": "X–Y months (to recover the setup investment)",
  "demand_signal": "One real and specific market fact — Google Trends movement, monthly search volume, industry growth rate, or a government stat. Must be specific, not generic.",
  "first_step": "A single concrete action the founder can take this week to start — be specific about what to do, where, and what outcome to expect",
  "licenses_required": ["Pick ONLY from this exact list based on what's legally required: GST Registration, FSSAI License, Shop & Establishment Act, MSME / Udyam Registration, Trade License, Import Export Code (IEC), Drug License, BIS Certification, RERA Registration, ISO Certification, No License Required"]
}

Rules:
- Revenue ranges should be realistic, not aspirational — based on real Indian market rates
- licenses_required must only contain items from the provided list
- first_step must name a specific platform, association, or action (e.g. "Register on IndiaMart as a supplier", not "research the market")
- demand_signal must cite a specific number or trend, not a vague statement`,
        },
      ],
    })

    const text = response.content.find((b) => b.type === 'text')?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      metrics = JSON.parse(jsonMatch[0])
      console.log(`   ✓  Metrics generated`)
    } else {
      console.log(`   ✗  Could not parse JSON response`)
    }
  } catch (err) {
    console.log(`   ✗  Generation failed: ${err.message}`)
  }

  results.push({ slug: idea.slug, _id: idea._id, title: idea.title, metrics })

  if (metrics) {
    try {
      await sanity.patch(idea._id).set(metrics).commit()
      console.log(`   → Patched Sanity\n`)
    } catch (err) {
      console.log(`   ✗  Sanity patch failed: ${err.message}\n`)
    }
  } else {
    console.log(`   → Skipped (no metrics)\n`)
  }

  await new Promise((r) => setTimeout(r, 1000))
}

const outPath = join(process.cwd(), 'scripts', 'idea-metrics-output.json')
writeFileSync(outPath, JSON.stringify(results, null, 2))
console.log(`\nFull results saved to scripts/idea-metrics-output.json`)
console.log('Done.')
