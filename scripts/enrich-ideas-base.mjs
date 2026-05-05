/**
 * enrich-ideas-base.mjs
 *
 * Fills missing base fields (pros, cons, gross_margin, monthly_revenue_range,
 * setup_cost_range, breakeven_timeline, first_step) for all ideas that are
 * missing them, using industry lookups + data already on each idea.
 *
 * Run: node scripts/enrich-ideas-base.mjs
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { homedir } from 'os'

const cfg = JSON.parse(readFileSync(`${homedir()}/.config/sanity/config.json`, 'utf8'))
const client = createClient({
  projectId: '5p3rso81',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: cfg.authToken,
  useCdn: false,
})

// ── Helper: extract plain text from Portable Text array or return string as-is ─
function extractText(field) {
  if (!field) return ''
  if (typeof field === 'string') return field
  if (Array.isArray(field)) {
    return field
      .filter(b => b._type === 'block')
      .map(b => (b.children || []).map(c => c.text || '').join(''))
      .join(' ')
  }
  return ''
}

// ── Industry lookup tables ─────────────────────────────────────────────────────
const INDUSTRY_DATA = {
  saas: {
    gross_margin: '70–85%',
    first_step: 'Validate with 5 paying beta customers before building the full product. Use a no-code prototype (Bubble, Glide) or manual concierge approach.',
    pros_generic: ['Recurring revenue with high retention once product-market fit is achieved', 'Scales without proportional headcount increase'],
    cons_generic: ['Long sales cycles for enterprise; high churn in early months without strong onboarding', 'Cloud infrastructure costs compound as you scale'],
    monthly_by_budget: { 'under_1l': '₹50K–3L', '1l_10l': '₹2L–15L', '10l_50l': '₹10L–50L', '50l_2cr': '₹30L–1Cr', '2cr_plus': '₹75L–3Cr' },
    setup_by_budget: { 'under_1l': '₹20K–80K', '1l_10l': '₹1L–8L', '10l_50l': '₹8L–40L', '50l_2cr': '₹40L–1.5Cr', '2cr_plus': '₹1.5Cr–5Cr' },
    breakeven_by_diff: { beginner: '6–9 months', intermediate: '9–15 months', advanced: '12–18 months', expert: '18–24 months' },
  },
  ecommerce: {
    gross_margin: '35–55%',
    first_step: 'List 10 SKUs on an existing marketplace (Amazon, Meesho) and get 50 orders before investing in your own website or inventory.',
    pros_generic: ['Large existing customer base on marketplaces reduces CAC at launch', 'Inventory-light dropshipping model available for initial validation'],
    cons_generic: ['Marketplace dependency creates margin pressure and visibility risk from algorithm changes', 'Returns and logistics costs can erode margin to single digits'],
    monthly_by_budget: { 'under_1l': '₹30K–2L', '1l_10l': '₹1.5L–10L', '10l_50l': '₹8L–40L', '50l_2cr': '₹25L–80L', '2cr_plus': '₹60L–2Cr' },
    setup_by_budget: { 'under_1l': '₹15K–70K', '1l_10l': '₹80K–8L', '10l_50l': '₹7L–40L', '50l_2cr': '₹35L–1.5Cr', '2cr_plus': '₹1Cr–4Cr' },
    breakeven_by_diff: { beginner: '3–6 months', intermediate: '6–12 months', advanced: '9–15 months', expert: '12–18 months' },
  },
  health: {
    gross_margin: '55–70%',
    first_step: 'Get ABDM (Ayushman Bharat Digital Mission) health ID integration done early — it opens B2B doors with hospitals and insurance companies.',
    pros_generic: ['High emotional willingness-to-pay in health — users spend more than on lifestyle apps', 'Government ABDM and NHA digital health stack reduces integration cost'],
    cons_generic: ['Health data regulations (DPDP Act) require legal counsel from day one', 'Clinical validation and doctor advisory needed to build user trust'],
    monthly_by_budget: { 'under_1l': '₹40K–2.5L', '1l_10l': '₹2L–12L', '10l_50l': '₹10L–45L', '50l_2cr': '₹30L–1Cr', '2cr_plus': '₹80L–3Cr' },
    setup_by_budget: { 'under_1l': '₹25K–80K', '1l_10l': '₹1L–9L', '10l_50l': '₹8L–45L', '50l_2cr': '₹40L–1.8Cr', '2cr_plus': '₹1.5Cr–5Cr' },
    breakeven_by_diff: { beginner: '6–12 months', intermediate: '9–15 months', advanced: '12–20 months', expert: '18–30 months' },
  },
  edtech: {
    gross_margin: '60–75%',
    first_step: 'Run a live cohort on WhatsApp with 20 paying students before building any platform. Validate content and willingness-to-pay first.',
    pros_generic: ['India has 600M+ students and working professionals — massive addressable market', 'Content created once can be sold thousands of times with minimal marginal cost'],
    cons_generic: ['Completion rates on online courses average 3–8% — engagement is the core product problem', 'Intense price competition from free YouTube content and subsidised government platforms'],
    monthly_by_budget: { 'under_1l': '₹30K–2L', '1l_10l': '₹1.5L–10L', '10l_50l': '₹8L–35L', '50l_2cr': '₹25L–80L', '2cr_plus': '₹60L–2Cr' },
    setup_by_budget: { 'under_1l': '₹10K–60K', '1l_10l': '₹60K–7L', '10l_50l': '₹6L–40L', '50l_2cr': '₹35L–1.5Cr', '2cr_plus': '₹1Cr–4Cr' },
    breakeven_by_diff: { beginner: '3–6 months', intermediate: '6–12 months', advanced: '9–15 months', expert: '12–18 months' },
  },
  fintech: {
    gross_margin: '40–65%',
    first_step: 'Partner with an existing NBFC or bank under a co-lending or BC (Business Correspondent) arrangement before applying for your own licence — reduces time to revenue by 18 months.',
    pros_generic: ['UPI and Account Aggregator infrastructure has reduced fintech build cost by 80% vs. 5 years ago', 'High LTV from financial products — a loan customer retained for 3 years is worth 8–12x a SaaS subscriber'],
    cons_generic: ['RBI licensing requirements (NBFC, PA, PPI) require 12–18 months and ₹2Cr+ minimum net worth', 'Credit risk and loan defaults directly impact P&L unlike software businesses'],
    monthly_by_budget: { 'under_1l': '₹50K–3L', '1l_10l': '₹2L–15L', '10l_50l': '₹12L–50L', '50l_2cr': '₹40L–1.5Cr', '2cr_plus': '₹1Cr–4Cr' },
    setup_by_budget: { 'under_1l': '₹30K–90K', '1l_10l': '₹1L–9L', '10l_50l': '₹9L–45L', '50l_2cr': '₹45L–1.8Cr', '2cr_plus': '₹1.5Cr–6Cr' },
    breakeven_by_diff: { beginner: '6–9 months', intermediate: '9–18 months', advanced: '15–24 months', expert: '24–36 months' },
  },
  'local-services': {
    gross_margin: '45–65%',
    first_step: 'Sign up your first 10 service providers manually and personally handle the first 50 bookings to understand every pain point before building software.',
    pros_generic: ['Hyperlocal moat — once you own supply density in a neighbourhood, competitors face the same cold-start problem', 'Cash-positive from day one with no inventory requirement'],
    cons_generic: ['Unit economics require density — unprofitable until bookings per provider per day reach 3+', 'Service quality variance from individual providers is hard to standardise at scale'],
    monthly_by_budget: { 'under_1l': '₹20K–1.5L', '1l_10l': '₹1L–8L', '10l_50l': '₹6L–30L', '50l_2cr': '₹20L–70L', '2cr_plus': '₹50L–1.5Cr' },
    setup_by_budget: { 'under_1l': '₹10K–50K', '1l_10l': '₹60K–7L', '10l_50l': '₹6L–35L', '50l_2cr': '₹30L–1.5Cr', '2cr_plus': '₹1Cr–4Cr' },
    breakeven_by_diff: { beginner: '3–6 months', intermediate: '6–9 months', advanced: '9–15 months', expert: '12–20 months' },
  },
  climate: {
    gross_margin: '30–55%',
    first_step: 'Apply for MNRE or state DISCOM empanelment before acquiring customers — government channel gives first 20 projects with subsidised demand.',
    pros_generic: ['Government FAME, PM-KUSUM, and PLI schemes de-risk capex with 30–50% subsidies', 'Recurring revenue from maintenance contracts extends LTV well beyond initial installation'],
    cons_generic: ['Policy changes can crater demand overnight — PM-KUSUM subsidy delays stalled 40% of solar installers in 2023', 'Long project cycles (2–6 months) create working capital pressure'],
    monthly_by_budget: { 'under_1l': '₹30K–2L', '1l_10l': '₹1.5L–10L', '10l_50l': '₹8L–40L', '50l_2cr': '₹30L–1Cr', '2cr_plus': '₹80L–3Cr' },
    setup_by_budget: { 'under_1l': '₹20K–80K', '1l_10l': '₹80K–8L', '10l_50l': '₹7L–40L', '50l_2cr': '₹40L–1.8Cr', '2cr_plus': '₹1.5Cr–6Cr' },
    breakeven_by_diff: { beginner: '6–12 months', intermediate: '9–18 months', advanced: '12–24 months', expert: '18–36 months' },
  },
  'ai-ml': {
    gross_margin: '65–80%',
    first_step: 'Build a single verticalized AI feature (not a platform) and get 3 lighthouse enterprise customers paying before widening scope.',
    pros_generic: ['AI-first product is 10x faster to build than traditional software for equivalent functionality', 'India-specific training data (vernacular languages, local regulations) is a durable moat global AI companies lack'],
    cons_generic: ['LLM API costs are unpredictable at scale — a pricing change by OpenAI/Anthropic can compress margin by 30%', 'Hallucinations in regulated domains (legal, medical, financial) require expensive human review loops'],
    monthly_by_budget: { 'under_1l': '₹40K–3L', '1l_10l': '₹2L–15L', '10l_50l': '₹10L–50L', '50l_2cr': '₹40L–1.5Cr', '2cr_plus': '₹1Cr–4Cr' },
    setup_by_budget: { 'under_1l': '₹15K–70K', '1l_10l': '₹80K–8L', '10l_50l': '₹7L–40L', '50l_2cr': '₹40L–1.5Cr', '2cr_plus': '₹1.5Cr–5Cr' },
    breakeven_by_diff: { beginner: '6–9 months', intermediate: '9–15 months', advanced: '12–18 months', expert: '15–24 months' },
  },
  agritech: {
    gross_margin: '35–60%',
    first_step: 'Partner with one FPO (Farmer Producer Organisation) of 200+ members as your first distribution channel — they eliminate individual farmer CAC entirely.',
    pros_generic: ['Government AgriStack digital infrastructure provides land record APIs, farmer IDs, and PM-KISAN data for free', 'First-mover advantage is durable — farmer trust, once won, has near-zero churn'],
    cons_generic: ['Monsoon seasonality creates 4–5 months of very low activity requiring working capital reserves', 'Last-mile distribution in rural areas requires boots-on-ground field teams — hard to scale cheaply'],
    monthly_by_budget: { 'under_1l': '₹20K–1.5L', '1l_10l': '₹1L–8L', '10l_50l': '₹6L–30L', '50l_2cr': '₹20L–70L', '2cr_plus': '₹50L–2Cr' },
    setup_by_budget: { 'under_1l': '₹15K–70K', '1l_10l': '₹70K–8L', '10l_50l': '₹7L–40L', '50l_2cr': '₹35L–1.8Cr', '2cr_plus': '₹1.5Cr–5Cr' },
    breakeven_by_diff: { beginner: '6–12 months', intermediate: '9–18 months', advanced: '12–24 months', expert: '18–36 months' },
  },
  food: {
    gross_margin: '55–70%',
    first_step: 'Get FSSAI Basic Registration (₹100, 7 days) and start selling to 10 neighbours or colleagues before investing in packaging or a commercial kitchen.',
    pros_generic: ['Food is a daily repeat purchase — retention is habit-driven, not feature-driven', 'Word-of-mouth from satisfied customers is the most effective and cheapest acquisition channel for food businesses'],
    cons_generic: ['Perishability creates daily operational pressure — no buffer for supply chain issues', 'Food safety incidents can permanently damage brand reputation with no recovery path'],
    monthly_by_budget: { 'under_1l': '₹25K–2L', '1l_10l': '₹1.5L–10L', '10l_50l': '₹8L–40L', '50l_2cr': '₹25L–80L', '2cr_plus': '₹60L–2Cr' },
    setup_by_budget: { 'under_1l': '₹10K–60K', '1l_10l': '₹60K–7L', '10l_50l': '₹6L–35L', '50l_2cr': '₹30L–1.5Cr', '2cr_plus': '₹1Cr–4Cr' },
    breakeven_by_diff: { beginner: '2–4 months', intermediate: '4–8 months', advanced: '6–12 months', expert: '9–18 months' },
  },
  manufacturing: {
    gross_margin: '25–45%',
    first_step: 'Secure one anchor B2B customer (who will give you a purchase order) before investing in machinery — use that PO to get equipment financing from a bank.',
    pros_generic: ["PLI scheme incentives of 4–6% on incremental production reduce effective capex payback by 30–40%", 'B2B manufacturing contracts are typically 1–3 years — very low churn once you pass vendor qualification'],
    cons_generic: ['High upfront capex in machinery and tooling creates long payback period before profitability', 'Input commodity price volatility (steel, aluminium, plastics) directly compresses margin in fixed-price contracts'],
    monthly_by_budget: { 'under_1l': '₹20K–1.5L', '1l_10l': '₹1L–8L', '10l_50l': '₹6L–30L', '50l_2cr': '₹20L–80L', '2cr_plus': '₹60L–2.5Cr' },
    setup_by_budget: { 'under_1l': '₹20K–80K', '1l_10l': '₹1L–9L', '10l_50l': '₹8L–45L', '50l_2cr': '₹40L–1.8Cr', '2cr_plus': '₹1.5Cr–6Cr' },
    breakeven_by_diff: { beginner: '6–12 months', intermediate: '12–18 months', advanced: '18–24 months', expert: '24–36 months' },
  },
  travel: {
    gross_margin: '20–40%',
    first_step: 'List your first 5–10 properties or experiences on an existing OTA (MakeMyTrip, Airbnb) to prove demand before building your own booking platform.',
    pros_generic: ['Post-COVID revenge travel has permanently expanded the market — domestic travel grew 40% and is still growing', 'B2B2C distribution through travel agents and corporate travel desks reduces CAC vs direct consumer acquisition'],
    cons_generic: ['Highly seasonal — revenue concentrated in 3–4 peak periods with fixed costs year-round', 'COVID-style demand destruction can occur with no warning — cash reserves of 6+ months are essential'],
    monthly_by_budget: { 'under_1l': '₹20K–1.5L', '1l_10l': '₹1L–8L', '10l_50l': '₹5L–25L', '50l_2cr': '₹15L–60L', '2cr_plus': '₹50L–2Cr' },
    setup_by_budget: { 'under_1l': '₹10K–60K', '1l_10l': '₹60K–8L', '10l_50l': '₹6L–40L', '50l_2cr': '₹35L–1.8Cr', '2cr_plus': '₹1.5Cr–5Cr' },
    breakeven_by_diff: { beginner: '3–6 months', intermediate: '6–12 months', advanced: '9–18 months', expert: '12–24 months' },
  },
  'b2b-services': {
    gross_margin: '50–70%',
    first_step: 'Close your first 3 clients through personal network at a 40% discount in exchange for a detailed case study — that case study becomes your primary sales asset.',
    pros_generic: ['B2B contracts are multi-month or annual — predictable revenue with very low churn once embedded in client workflow', 'Indian B2B market is severely under-served by software — almost every vertical has a workflow still running on Excel and WhatsApp'],
    cons_generic: ['B2B sales cycles are 3–6 months for SME and 6–12 months for enterprise — requires significant runway before revenue', 'Key-person dependency — losing one senior consultant or salesperson can cost 20–30% of revenue'],
    monthly_by_budget: { 'under_1l': '₹30K–2L', '1l_10l': '₹1.5L–12L', '10l_50l': '₹10L–45L', '50l_2cr': '₹35L–1.2Cr', '2cr_plus': '₹80L–3Cr' },
    setup_by_budget: { 'under_1l': '₹10K–60K', '1l_10l': '₹60K–7L', '10l_50l': '₹7L–40L', '50l_2cr': '₹35L–1.5Cr', '2cr_plus': '₹1Cr–4Cr' },
    breakeven_by_diff: { beginner: '3–6 months', intermediate: '6–12 months', advanced: '9–18 months', expert: '12–24 months' },
  },
  proptech: {
    gross_margin: '40–65%',
    first_step: 'List 50 verified properties with physically inspected photos before launch — supply quality is the single biggest trust driver for real estate platforms.',
    pros_generic: ['Real estate is India\'s #1 household asset — any platform that reduces friction in a ₹50L+ transaction commands high willingness-to-pay', 'RERA digital mandate creates institutional pull for property management software from developers and agents'],
    cons_generic: ['Real estate transactions are infrequent — high CAC must be recovered from one or two transactions per customer per year', 'Regulatory changes (stamp duty, RERA amendments) can alter business model economics with 60-day notice'],
    monthly_by_budget: { 'under_1l': '₹25K–1.5L', '1l_10l': '₹1L–8L', '10l_50l': '₹6L–30L', '50l_2cr': '₹20L–70L', '2cr_plus': '₹50L–2Cr' },
    setup_by_budget: { 'under_1l': '₹10K–60K', '1l_10l': '₹60K–8L', '10l_50l': '₹7L–40L', '50l_2cr': '₹35L–1.5Cr', '2cr_plus': '₹1Cr–4Cr' },
    breakeven_by_diff: { beginner: '6–9 months', intermediate: '9–15 months', advanced: '12–20 months', expert: '15–30 months' },
  },
  petcare: {
    gross_margin: '45–65%',
    first_step: 'Start with one city, get 100 paying pet owners, and talk to every single one of them before expanding — the pet owner community is tight-knit and drives all early growth through word-of-mouth.',
    pros_generic: ["India's pet population is growing 20%+ annually with deepening human-animal bond driving premium spending", 'Pet owners have very high brand loyalty — a trusted vet, groomer, or food brand retains customers for 5–10 years'],
    cons_generic: ['Pet services market is extremely local — national scaling requires city-by-city supply buildout with no shortcut', 'Pet safety incidents create outsized reputational damage in communities with strong social media sharing'],
    monthly_by_budget: { 'under_1l': '₹20K–1.5L', '1l_10l': '₹1L–7L', '10l_50l': '₹5L–25L', '50l_2cr': '₹15L–60L', '2cr_plus': '₹40L–1.5Cr' },
    setup_by_budget: { 'under_1l': '₹10K–50K', '1l_10l': '₹50K–7L', '10l_50l': '₹6L–35L', '50l_2cr': '₹30L–1.5Cr', '2cr_plus': '₹1Cr–4Cr' },
    breakeven_by_diff: { beginner: '3–6 months', intermediate: '6–12 months', advanced: '9–15 months', expert: '12–20 months' },
  },
  logistics: {
    gross_margin: '20–40%',
    first_step: 'Sign anchor contracts with 2–3 e-commerce sellers or manufacturers before buying vehicles or leasing warehouse space — demand certainty before supply investment.',
    pros_generic: ['India\'s e-commerce logistics grew 35% in 2023 and is still growing — market pulls the business rather than requiring expensive demand creation', 'Asset-light marketplace models can reach breakeven at very low GMV by avoiding vehicle capex'],
    cons_generic: ['Fuel price volatility directly hits margin — every ₹5/litre increase compresses per-delivery economics by ₹2–4', 'Last-mile delivery economics require booking density — unprofitable until a truck is making 15+ drops per day per route'],
    monthly_by_budget: { 'under_1l': '₹20K–1.5L', '1l_10l': '₹1L–8L', '10l_50l': '₹6L–30L', '50l_2cr': '₹20L–80L', '2cr_plus': '₹60L–2.5Cr' },
    setup_by_budget: { 'under_1l': '₹15K–70K', '1l_10l': '₹80K–8L', '10l_50l': '₹7L–40L', '50l_2cr': '₹35L–1.8Cr', '2cr_plus': '₹1.5Cr–5Cr' },
    breakeven_by_diff: { beginner: '3–6 months', intermediate: '6–12 months', advanced: '9–18 months', expert: '12–24 months' },
  },
  export: {
    gross_margin: '25–50%',
    first_step: 'Get an IEC (Import Export Code) from DGFT in 2 days (₹500 online) and register on the India Export Portal — these are the minimum prerequisites for any export business.',
    pros_generic: ['RODTEP and drawback incentives add 0.5–4.3% to export margin — a free subsidy most exporters leave unclaimed', 'Export customers pay in USD/EUR — natural hedge against INR depreciation that inflates domestic costs'],
    cons_generic: ['Working capital cycle is 90–120 days (production + shipping + payment) — requires 3–4 months of operating expenses in cash', 'Buyer concentration risk — losing one export customer who accounts for 30%+ of revenue can be existential'],
    monthly_by_budget: { 'under_1l': '₹20K–1.5L', '1l_10l': '₹1L–8L', '10l_50l': '₹6L–30L', '50l_2cr': '₹20L–80L', '2cr_plus': '₹60L–2.5Cr' },
    setup_by_budget: { 'under_1l': '₹10K–60K', '1l_10l': '₹60K–8L', '10l_50l': '₹7L–40L', '50l_2cr': '₹35L–1.8Cr', '2cr_plus': '₹1.5Cr–6Cr' },
    breakeven_by_diff: { beginner: '6–12 months', intermediate: '9–18 months', advanced: '12–24 months', expert: '18–36 months' },
  },
}

const FALLBACK = {
  gross_margin: '35–55%',
  first_step: 'Register your business (GST + MSME/Udyam, free online) and acquire your first 5 paying customers before investing further.',
  pros_generic: ['Established demand in a growing Indian market', 'Low regulatory barriers to entry for early-stage validation'],
  cons_generic: ['Customer acquisition cost can be high before brand recognition is established', 'Scaling beyond initial traction requires systematic processes and hired team'],
  monthly_by_budget: { 'under_1l': '₹20K–1.5L', '1l_10l': '₹1L–8L', '10l_50l': '₹6L–30L', '50l_2cr': '₹20L–80L', '2cr_plus': '₹60L–2Cr' },
  setup_by_budget: { 'under_1l': '₹15K–70K', '1l_10l': '₹70K–8L', '10l_50l': '₹7L–40L', '50l_2cr': '₹35L–1.5Cr', '2cr_plus': '₹1Cr–5Cr' },
  breakeven_by_diff: { beginner: '4–8 months', intermediate: '6–12 months', advanced: '9–18 months', expert: '12–24 months' },
}

function lookup(industry) {
  const key = (industry || '').toLowerCase().replace(/[^a-z-]/g, '-').replace(/-+/g, '-')
  return INDUSTRY_DATA[key] || FALLBACK
}

function toPros(idea, data) {
  const whyText = extractText(idea.why_it_works)
  const pros = [...data.pros_generic]
  if (whyText && whyText.length > 20) pros.unshift(whyText)
  return pros.slice(0, 3)
}

function toCons(idea, data) {
  const risks = idea.things_to_note
  const cons = [...data.cons_generic]
  if (Array.isArray(risks) && risks.length > 0) {
    cons.unshift(typeof risks[0] === 'string' ? risks[0] : extractText(risks[0]))
  }
  return cons.slice(0, 3)
}

async function run() {
  const ideas = await client.fetch(`
    *[_type == "businessIdea" && !defined(pros)]{
      _id, title, industry, budget_range, difficulty_level,
      why_it_works, things_to_note, time_to_first_revenue
    }
  `)
  console.log(`Enriching ${ideas.length} ideas...`)

  let done = 0
  for (let i = 0; i < ideas.length; i += 25) {
    const batch = ideas.slice(i, i + 25)
    const tx = client.transaction()

    for (const idea of batch) {
      const d = lookup(idea.industry)
      const diff = idea.difficulty_level || 'intermediate'
      const budget = idea.budget_range || 'under_1l'

      tx.patch(idea._id, p => p.setIfMissing({
        pros: toPros(idea, d),
        cons: toCons(idea, d),
        gross_margin: d.gross_margin,
        monthly_revenue_range: d.monthly_by_budget[budget] || '₹50K–5L',
        setup_cost_range: d.setup_by_budget[budget] || '₹50K–5L',
        breakeven_timeline: d.breakeven_by_diff[diff] || '6–12 months',
        first_step: d.first_step,
      }))
    }

    await tx.commit()
    done += batch.length
    console.log(`  ${done} / ${ideas.length}`)
  }
  console.log('Done.')
}

run().catch(console.error)
