/**
 * seed-report-data.mjs
 *
 * Uses Claude Opus 4.7 to generate comprehensive report data for every
 * businessIdea in Sanity: KPIs, risk register, 90-day execution plan,
 * plus all 6 validation metrics (if not already set).
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/seed-report-data.mjs
 *
 * Limit to specific slugs:
 *   ANTHROPIC_API_KEY=... node scripts/seed-report-data.mjs home-tiffin-service
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

const ideas = await sanity.fetch(`
  *[_type == "businessIdea" && defined(slug.current)]{
    _id, title, "slug": slug.current, industry, description,
    budget_range, difficulty_level, pros, cons, things_to_note,
    gross_margin, setup_cost_range, scope_in_india, why_it_works,
    revenue_model, target_audience
  }
`)

const targets = slugFilter.length ? ideas.filter(i => slugFilter.includes(i.slug)) : ideas

console.log(`\nGenerating full report data for ${targets.length} idea(s) using claude-opus-4-7...\n`)

const BUDGET_MAP = {
  under_1l: 'Under ₹1 Lakh', '1l_10l': '₹1L–₹10L',
  '10l_50l': '₹10L–₹50L', '50l_2cr': '₹50L–₹2Cr', '2cr_plus': '₹2 Crore+',
}

const results = []

for (const idea of targets) {
  console.log(`⚙️  ${idea.title}`)

  let data = null

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are a senior Indian business consultant writing a professional launch kit for an aspiring entrepreneur. Generate comprehensive, actionable, India-specific data for this business idea.

Title: "${idea.title}"
Industry: ${idea.industry}
Description: ${idea.description}
Budget: ${BUDGET_MAP[idea.budget_range] || idea.budget_range}
Difficulty: ${idea.difficulty_level}
Gross Margin: ${idea.gross_margin || 'unknown'}
Setup Cost: ${idea.setup_cost_range || 'unknown'}
Pros: ${idea.pros?.join(', ') || 'none listed'}
Cons: ${idea.cons?.join(', ') || 'none listed'}
Risks/Notes: ${idea.things_to_note?.join(', ') || 'none listed'}
Revenue Models: ${idea.revenue_model?.join(', ') || 'unknown'}

Return ONLY a valid JSON object — no markdown, no explanation:
{
  "monthly_revenue_range": "₹X–₹Y/month (realistic at 6 months for a solo/small team in India)",
  "time_to_first_revenue": "X–Y weeks",
  "breakeven_timeline": "X–Y months",
  "demand_signal": "One specific, real data point — search volume, growth trend, government stat, or industry report number",
  "first_step": "The single most concrete action the founder can take this week — name a specific platform, association, or action",
  "licenses_required": ["Only from: GST Registration, FSSAI License, Shop & Establishment Act, MSME / Udyam Registration, Trade License, Import Export Code (IEC), Drug License, BIS Certification, RERA Registration, ISO Certification, No License Required"],

  "kpis": [
    { "metric": "KPI name", "target": "specific number/threshold", "timeframe": "by Month X", "category": "Revenue|Operations|Customer|Marketing|Finance" }
  ],

  "risks_detailed": [
    { "title": "Risk name (specific to this business in India)", "severity": "High|Medium|Low", "impact": "What happens if this risk materialises — be specific", "mitigation": "Concrete steps to prevent or reduce this risk" }
  ],

  "execution_plan": {
    "month_1": ["Action 1 (specific, actionable)", "Action 2", "Action 3", "Action 4", "Action 5"],
    "month_2": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5"],
    "month_3": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5"]
  }
}

Rules:
- kpis: provide exactly 6 KPIs covering revenue, customer, operations, and finance
- risks_detailed: provide exactly 6 risks — 2 High, 2 Medium, 2 Low severity
- execution_plan: exactly 5 specific actions per month; Month 1 = setup & legal, Month 2 = launch & first customers, Month 3 = optimise & scale
- All rupee figures must be realistic for the Indian market, not aspirational
- Be specific: name platforms (IndiaMart, Swiggy, Justdial), cities, associations, regulations
- demand_signal must include a number — not "growing fast" but "3.2M monthly searches" or "₹45,000 crore market growing at 18% CAGR"`,
      }],
    })

    const text = response.content.find(b => b.type === 'text')?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])

      // Add _key fields to array items
      parsed.kpis = (parsed.kpis || []).map((k, i) => ({ ...k, _key: `kpi_${idea.slug}_${i}` }))
      parsed.risks_detailed = (parsed.risks_detailed || []).map((r, i) => ({ ...r, _key: `risk_${idea.slug}_${i}` }))

      data = parsed
      console.log(`   ✓  ${data.kpis?.length || 0} KPIs · ${data.risks_detailed?.length || 0} risks · execution plan generated`)
    } else {
      console.log(`   ✗  Could not parse JSON`)
    }
  } catch (err) {
    console.log(`   ✗  Failed: ${err.message}`)
  }

  results.push({ slug: idea.slug, _id: idea._id, title: idea.title, data })

  if (data) {
    try {
      await sanity.patch(idea._id).set(data).commit()
      console.log(`   → Patched Sanity\n`)
    } catch (err) {
      console.log(`   ✗  Sanity patch failed: ${err.message}\n`)
    }
  } else {
    console.log(`   → Skipped\n`)
  }

  await new Promise(r => setTimeout(r, 1500))
}

const outPath = join(process.cwd(), 'scripts', 'report-data-output.json')
writeFileSync(outPath, JSON.stringify(results, null, 2))
console.log(`\nSaved to scripts/report-data-output.json`)
console.log('Done.')
