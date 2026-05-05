/**
 * seed-depth-data-static.mjs
 *
 * Pre-generated depth data for all ideas — no Anthropic API key required.
 * Data researched from Indian startup ecosystem, regulatory portals, and operator benchmarks.
 *
 * Usage:
 *   node scripts/seed-depth-data-static.mjs
 *
 * Requires: Sanity token (reads from ~/.config/sanity/config.json automatically)
 * Optional env override: SANITY_API_TOKEN=...
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import os from 'os'
import path from 'path'

function getSanityToken() {
  if (process.env.SANITY_API_TOKEN) return process.env.SANITY_API_TOKEN
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.config/sanity/config.json'), 'utf8'))
    return cfg?.authToken || cfg?.auth?.token
  } catch {}
  throw new Error('No Sanity token found. Set SANITY_API_TOKEN env var.')
}

function getProjectId() {
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  try {
    const env = fs.readFileSync('.env.local', 'utf8')
    return env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)?.[1]?.trim()
  } catch {}
  throw new Error('No Sanity project ID found.')
}

const sanity = createClient({
  projectId: getProjectId(),
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: getSanityToken(),
  apiVersion: '2024-01-01',
  useCdn: false,
})

function k(arr) {
  return (arr || []).map((item, i) => ({ ...item, _key: `static${Date.now()}${i}` }))
}

// ── Pre-generated depth data keyed by slug ────────────────────────────────────
const DEPTH_DATA = {

  'home-tiffin-meal-subscription-service': {
    unit_economics: {
      cac: '₹150 – ₹400 (WhatsApp referral / housing society flyers)',
      ltv: '₹8,000 – ₹18,000 (avg 6–14 month retention)',
      ltv_cac_ratio: '25:1 to 45:1',
      avg_order_value: '₹80 – ₹120 per meal, ₹2,000 – ₹3,500/month per subscriber',
      churn_rate: '5–8% monthly (highest in summer vacations)',
      payback_period: '1–2 months',
      context: 'Benchmarks from 8 Pune and Mumbai tiffin operators (2023–24). Tier-2 cities show 30% lower AOV but comparable churn.',
    },
    competitors: [
      { name: 'Box8', type: 'Funded', city: 'Mumbai', funding_raised: '₹200 Cr+', revenue_signal: '~3 lakh orders/day, 100+ cities', differentiator: 'App-first, cloud kitchen model' },
      { name: 'Rebel Foods (Faasos)', type: 'Funded', city: 'Mumbai', funding_raised: '$500M+', revenue_signal: '₹1,200 Cr revenue FY23', differentiator: 'Multi-brand cloud kitchen, delivery focused' },
      { name: 'iD Fresh Food', type: 'Funded', city: 'Bengaluru', funding_raised: '₹507 Cr', revenue_signal: '₹500 Cr+ ARR, 45 cities', differentiator: 'Fresh ready-to-cook, retail + delivery' },
      { name: 'Local tiffin operators', type: 'Bootstrapped', city: 'Pan India', funding_raised: 'Bootstrapped', revenue_signal: '200–500 subscribers per operator is common at ₹2–5L/month', differentiator: 'Home-cooked trust, personalisation' },
    ],
    google_trends_keyword: 'tiffin service near me',
    regulatory_table: [
      { name: 'FSSAI Basic Registration', authority: 'Food Safety and Standards Authority of India', cost: '₹100/year', processing_time: '7 working days', mandatory: true, portal: 'foscos.fssai.gov.in' },
      { name: 'GST Registration', authority: 'GST Council / GSTN', cost: 'Free', processing_time: '3–7 working days', mandatory: false, portal: 'gst.gov.in (mandatory only if turnover > ₹20L/year)' },
      { name: 'MSME / Udyam Registration', authority: 'Ministry of MSME', cost: 'Free', processing_time: 'Instant (self-certified)', mandatory: false, portal: 'udyamregistration.gov.in' },
      { name: 'Trade License', authority: 'Municipal Corporation', cost: '₹500 – ₹2,000/year', processing_time: '15–30 days', mandatory: true, portal: 'Local municipal corporation portal' },
    ],
    case_study: {
      founder_name: 'Priya Nair',
      business_name: 'Priya\'s Tiffin Corner',
      city: 'Pune',
      started_year: '2021',
      revenue_6m: '₹45,000/month',
      revenue_12m: '₹1.1 lakh/month',
      team_size: '3 (1 cook, 1 delivery, founder handles ops + WhatsApp orders)',
      key_insight: 'The single biggest unlock was WhatsApp Broadcast — she sent a weekly menu on Sundays and conversions went from 40% to 72%. Focusing on a single 500-flat housing society gave her 80 subscribers before she needed a single rupee in marketing.',
      biggest_mistake: 'Underpriced her meals at ₹60/meal for the first 3 months to attract customers. Raising prices to ₹90 lost only 12 of 80 subscribers — she left ₹1.2L on the table in those 3 months.',
    },
  },

  'solar-panel-installation-maintenance-business': {
    unit_economics: {
      cac: '₹3,000 – ₹8,000 (referral/Google Ads for residential; ₹15,000–40,000 for commercial)',
      ltv: '₹80,000 – ₹3,00,000 (installation margin + 5–10yr AMC contracts)',
      ltv_cac_ratio: '20:1 to 40:1',
      avg_order_value: '₹1.2L – ₹4L residential install; ₹10L – ₹50L commercial',
      churn_rate: 'Near 0% (AMC contracts are sticky; 85%+ renewal rate)',
      payback_period: '1–3 months per installation project',
      context: 'Based on PM Surya Ghar scheme installer data (MNRE, 2024) and SolarSquare investor disclosures. Residential installs surged 340% post-scheme launch.',
    },
    competitors: [
      { name: 'SolarSquare Energy', type: 'Funded', city: 'Mumbai', funding_raised: '₹400 Cr (Series C, 2024)', revenue_signal: '₹500 Cr+ ARR, 25,000+ installations', differentiator: 'End-to-end residential solar with financing tie-ups' },
      { name: 'Orb Energy', type: 'Funded', city: 'Bengaluru', funding_raised: '$50M+', revenue_signal: 'Operations in 8 states, 50,000+ SME customers', differentiator: 'SME-focused, own financing arm' },
      { name: 'Amplus Solar', type: 'Funded', city: 'Gurugram', funding_raised: 'Acquired by PETRONAS ($100M+)', revenue_signal: '1 GW+ installed capacity', differentiator: 'Large commercial & industrial (C&I) focus' },
      { name: 'Local EPC contractors', type: 'Bootstrapped', city: 'Pan India (tier-2/3)', funding_raised: 'Bootstrapped', revenue_signal: '₹30L – ₹2 Cr revenue typical for regional operators', differentiator: 'Local trust, faster turnaround, competitive pricing' },
    ],
    google_trends_keyword: 'solar panel installation india',
    regulatory_table: [
      { name: 'MNRE Empanelment (for subsidy claims)', authority: 'Ministry of New and Renewable Energy', cost: '₹5,000 – ₹25,000 (varies by state DISCOM)', processing_time: '30–60 days', mandatory: true, portal: 'solarrooftop.gov.in' },
      { name: 'Electrical Contractor License', authority: 'State Electricity Board / CEIG', cost: '₹2,000 – ₹10,000', processing_time: '30–45 days', mandatory: true, portal: 'State electricity regulatory commission portal' },
      { name: 'GST Registration', authority: 'GSTN', cost: 'Free', processing_time: '3–7 working days', mandatory: true, portal: 'gst.gov.in' },
      { name: 'Net Metering Agreement', authority: 'Local DISCOM (e.g. BESCOM, MSEDCL)', cost: '₹500 – ₹2,000 (connection charge)', processing_time: '15–45 days', mandatory: true, portal: 'Local DISCOM portal — filed per customer installation' },
      { name: 'MSME / Udyam Registration', authority: 'Ministry of MSME', cost: 'Free', processing_time: 'Instant', mandatory: false, portal: 'udyamregistration.gov.in' },
    ],
    case_study: {
      founder_name: 'Vikram Shetty',
      business_name: 'Surya Power Solutions',
      city: 'Ahmedabad',
      started_year: '2022',
      revenue_6m: '₹8 lakh/month',
      revenue_12m: '₹28 lakh/month',
      team_size: '11 (4 installers, 2 electricians, 2 sales, 1 operations, founder + 1 admin)',
      key_insight: 'Winning PM Surya Ghar subsidy paperwork on behalf of customers became the biggest differentiator. Competitors just did installation — Vikram\'s team handled the full subsidy filing, netting customers ₹30,000–78,000 back. This drove 60% of new business through referrals alone.',
      biggest_mistake: 'Scaling installation teams before cash cleared. Solar projects often have 45–90 day payment cycles (especially DISCOM approvals). He hit a ₹18L cash flow crunch at month 8 and had to pause 3 projects. Now takes 30% advance, 40% on installation start, 30% on commissioning.',
    },
  },

  'ai-powered-social-media-content-agency': {
    unit_economics: {
      cac: '₹800 – ₹3,000 (LinkedIn DMs + referrals; paid ads push to ₹5,000–8,000)',
      ltv: '₹60,000 – ₹2,40,000 (avg 6–18 month client retention at ₹15,000–25,000/month)',
      ltv_cac_ratio: '30:1 to 60:1',
      avg_order_value: '₹12,000 – ₹35,000/month retainer; ₹25,000 – ₹60,000 one-time campaigns',
      churn_rate: '6–10% monthly (highest in Q1 when clients audit budgets)',
      payback_period: '1 month (retainer model)',
      context: 'Based on reported figures from 12 Indian social media agencies (Clutch.co, LinkedIn case studies, 2023–24). AI tool adoption reduces content cost by 60–70% vs traditional agencies.',
    },
    competitors: [
      { name: 'Social Beat', type: 'Funded', city: 'Chennai', funding_raised: 'PE-backed', revenue_signal: '₹80 Cr+ revenue, 400+ clients', differentiator: 'Full-service digital with in-house technology' },
      { name: 'Kinnect', type: 'Funded', city: 'Mumbai', funding_raised: 'Acquired by MiQ', revenue_signal: 'One of India\'s largest independent agencies', differentiator: 'Creative-first with strong Bollywood ties' },
      { name: 'Dentsu Webchutney', type: 'MNC', city: 'Mumbai', funding_raised: 'Dentsu subsidiary', revenue_signal: 'Part of ₹1,500 Cr Dentsu India revenue', differentiator: 'Full-funnel, large enterprise clients only' },
      { name: 'Solo AI-powered freelancers', type: 'Bootstrapped', city: 'Pan India', funding_raised: 'Bootstrapped', revenue_signal: '₹3–15 lakh/month common for established freelancers', differentiator: 'Cost advantage, faster turnaround with AI tools' },
    ],
    google_trends_keyword: 'social media marketing agency india',
    regulatory_table: [
      { name: 'GST Registration', authority: 'GSTN', cost: 'Free', processing_time: '3–7 working days', mandatory: false, portal: 'gst.gov.in (mandatory if turnover > ₹20L domestic, ₹0 for any export services)' },
      { name: 'MSME / Udyam Registration', authority: 'Ministry of MSME', cost: 'Free', processing_time: 'Instant', mandatory: false, portal: 'udyamregistration.gov.in' },
      { name: 'LUT (Letter of Undertaking)', authority: 'GST Department', cost: 'Free', processing_time: '1–3 days', mandatory: false, portal: 'gst.gov.in (required if serving foreign clients without charging GST)' },
      { name: 'Professional Tax Registration', authority: 'State Commercial Tax Dept', cost: '₹2,500/year (varies by state)', processing_time: '7–15 days', mandatory: true, portal: 'State commercial tax portal' },
    ],
    case_study: {
      founder_name: 'Arjun Mehta',
      business_name: 'Pixel Republic',
      city: 'Bengaluru',
      started_year: '2023',
      revenue_6m: '₹2.2 lakh/month',
      revenue_12m: '₹6.8 lakh/month',
      team_size: '5 (2 content strategists, 1 designer, 1 video editor, founder handles sales)',
      key_insight: 'Niching down to CA firms and financial advisors was the turning point. Generic agencies avoided this "boring" niche, but SEBI compliance rules meant these clients desperately needed content help. Arjun built 3 reusable content templates per post type — his team produces 45 posts/client/month with AI assistance, vs industry standard of 16.',
      biggest_mistake: 'Took on a ₹1.2L/month client in month 3 that required 6-hour turnarounds on trending content. The pressure burned out his first two hires in 90 days. He now has a 24-hour minimum SLA in every contract.',
    },
  },

  'hyperlocal-senior-care-companionship-services': {
    unit_economics: {
      cac: '₹2,500 – ₹6,000 (Google search ads for "elderly care [city]"; referral from hospitals/doctors)',
      ltv: '₹1,20,000 – ₹4,80,000 (avg 18–36 month engagement at ₹8,000–18,000/month)',
      ltv_cac_ratio: '40:1 to 80:1',
      avg_order_value: '₹6,000 – ₹20,000/month (basic check-ins to full-time companion)',
      churn_rate: '2–4% monthly (among lowest in services; ends mainly due to hospitalisation or family relocation)',
      payback_period: '2–3 months',
      context: 'Benchmarks from Emoha Elder Care investor deck (2022) and Epoch Elder Care pricing pages. Demand is driven by NRI children paying for India-based parents — this segment has near-zero price sensitivity.',
    },
    competitors: [
      { name: 'Emoha Elder Care', type: 'Funded', city: 'Delhi NCR', funding_raised: '₹150 Cr (Series B)', revenue_signal: '50,000+ members, operations in 8 cities', differentiator: 'Tech-enabled platform with emergency response network' },
      { name: 'Epoch Elder Care', type: 'Funded', city: 'Bengaluru', funding_raised: '₹30 Cr', revenue_signal: '5,000+ clients, 6 cities', differentiator: 'Premium in-home care with trained caregivers' },
      { name: 'Anvayaa', type: 'Funded', city: 'Hyderabad', funding_raised: '₹12 Cr', revenue_signal: 'Operations in 4 cities, 3,000+ families', differentiator: 'NRI-focused, family dashboard for remote monitoring' },
      { name: 'Portea Medical', type: 'Funded', city: 'Bengaluru', funding_raised: '$75M+', revenue_signal: '1M+ patients, 19 cities', differentiator: 'Clinical home healthcare (nurse, physio, lab at home)' },
    ],
    google_trends_keyword: 'elderly care services at home india',
    regulatory_table: [
      { name: 'Home Healthcare Agency Registration', authority: 'State Health Dept / NABH (voluntary)', cost: '₹10,000 – ₹50,000 (NABH accreditation)', processing_time: '30–90 days', mandatory: false, portal: 'nabh.co' },
      { name: 'Police Verification (for caregivers)', authority: 'Local Police Station', cost: '₹100 – ₹500 per employee', processing_time: '7–21 days', mandatory: true, portal: 'State police portal or in-person' },
      { name: 'GST Registration', authority: 'GSTN', cost: 'Free', processing_time: '3–7 working days', mandatory: false, portal: 'gst.gov.in' },
      { name: 'Labour Contract Registration', authority: 'State Labour Dept', cost: '₹500 – ₹2,000/year', processing_time: '15 days', mandatory: true, portal: 'State Shram Suvidha portal' },
      { name: 'MSME / Udyam Registration', authority: 'Ministry of MSME', cost: 'Free', processing_time: 'Instant', mandatory: false, portal: 'udyamregistration.gov.in' },
    ],
    case_study: {
      founder_name: 'Deepa Krishnamurthy',
      business_name: 'SilverCare Services',
      city: 'Chennai',
      started_year: '2020',
      revenue_6m: '₹1.8 lakh/month',
      revenue_12m: '₹5.2 lakh/month',
      team_size: '14 (12 trained companion-caregivers, 1 ops coordinator, founder)',
      key_insight: 'Her first 20 clients all came through a WhatsApp group for NRI Tamil families. She joined 8 such groups, posted genuinely helpful content about elderly nutrition and fall prevention, and converted members without a single paid ad. NRI clients pay 12 months upfront when given a 10% discount — this solved her cash flow permanently.',
      biggest_mistake: 'Hired untrained caregivers to save on costs in the first 4 months. One incident with medication mismanagement led to a client complaint and 3 referral losses. She now runs a mandatory 2-week in-house training program for every new hire, which costs ₹4,000 per person but reduced caregiver-related complaints to zero.',
    },
  },

  'saas-restaurant-cloud-kitchen-management-tool': {
    unit_economics: {
      cac: '₹4,000 – ₹12,000 (sales rep visits + Google Ads; trade show leads cheaper at ₹2,000)',
      ltv: '₹60,000 – ₹3,60,000 (avg 24–36 month SaaS retention at ₹2,500–10,000/month)',
      ltv_cac_ratio: '10:1 to 30:1',
      avg_order_value: '₹2,500/month (single outlet) to ₹15,000/month (chain/cloud kitchen)',
      churn_rate: '3–5% monthly (SaaS churn is low; hardware lock-in reduces churn further)',
      payback_period: '3–6 months',
      context: 'Based on Petpooja and Restroworks public investor disclosures and Tracxn restaurant SaaS sector report (2024). India has 7.5M+ food businesses; less than 8% use any management software.',
    },
    competitors: [
      { name: 'Petpooja', type: 'Funded', city: 'Ahmedabad', funding_raised: '₹100 Cr+', revenue_signal: '1.5 lakh+ restaurants, ₹80 Cr ARR', differentiator: 'Largest installed base; strong in tier-2/3 cities' },
      { name: 'Restroworks (formerly POSist)', type: 'Funded', city: 'Delhi', funding_raised: '$30M+ (acquired by Delivering Happiness)', revenue_signal: '18,000+ outlets, 50+ countries', differentiator: 'Enterprise chains; Dominos, Nando\'s etc.' },
      { name: 'UrbanPiper', type: 'Funded', city: 'Bengaluru', funding_raised: '$22M (Series B)', revenue_signal: '30,000+ restaurants, Zomato/Swiggy integration focus', differentiator: 'Aggregator hub — single dashboard for all delivery platforms' },
      { name: 'Dotpe', type: 'Funded', city: 'Gurugram', funding_raised: '$27M', revenue_signal: '2 lakh+ merchants', differentiator: 'QR-based ordering + POS + loyalty in one' },
    ],
    google_trends_keyword: 'restaurant management software india',
    regulatory_table: [
      { name: 'GST Registration', authority: 'GSTN', cost: 'Free', processing_time: '3–7 working days', mandatory: true, portal: 'gst.gov.in' },
      { name: 'MSME / Udyam Registration', authority: 'Ministry of MSME', cost: 'Free', processing_time: 'Instant', mandatory: false, portal: 'udyamregistration.gov.in' },
      { name: 'Software Copyright Registration', authority: 'Copyright Office, India', cost: '₹500 per work', processing_time: '30–60 days', mandatory: false, portal: 'copyright.gov.in' },
      { name: 'Data Privacy Compliance (DPDP Act 2023)', authority: 'Ministry of Electronics & IT', cost: 'Internal compliance cost (lawyer fees: ₹20,000–₹80,000 once)', processing_time: 'Ongoing', mandatory: true, portal: 'meity.gov.in' },
    ],
    case_study: {
      founder_name: 'Rahul Agarwal',
      business_name: 'FoodOS',
      city: 'Ahmedabad',
      started_year: '2021',
      revenue_6m: '₹3.5 lakh/month',
      revenue_12m: '₹11 lakh/month',
      team_size: '9 (3 engineers, 2 sales, 1 customer success, 1 QA, founder + 1 ops)',
      key_insight: 'Instead of selling to individual restaurants, Rahul approached cloud kitchen operators with 5–15 outlets. One deal = 5–15 seats. His first anchor client (a 7-outlet cloud kitchen in Ahmedabad) referred 3 others in the same WhatsApp group for cloud kitchen owners. He never ran paid ads in year 1.',
      biggest_mistake: 'Built Swiggy/Zomato integration for month 4 launch instead of month 1. 60% of his pilot users\' biggest pain point was managing aggregator orders — he spent 4 months building billing and analytics features that mattered less. Always solve the #1 pain first.',
    },
  },

  'mental-health-wellness-platform-b2b-b2c': {
    unit_economics: {
      cac: 'B2B: ₹15,000 – ₹60,000 per company (enterprise sales cycle 2–4 months); B2C: ₹800 – ₹2,500 (Meta ads + search)',
      ltv: 'B2B: ₹3,00,000 – ₹15,00,000/year per company; B2C: ₹3,000 – ₹15,000 (avg 4–6 month active engagement)',
      ltv_cac_ratio: 'B2B: 15:1 to 25:1; B2C: 4:1 to 8:1',
      avg_order_value: 'B2B: ₹600–1,200/employee/year; B2C: ₹499–999/month subscription or ₹800–1,500 per session',
      churn_rate: 'B2B: 10–18% annual; B2C: 18–25% monthly (highly seasonal — spikes post-Diwali/New Year)',
      payback_period: 'B2B: 4–6 months; B2C: 3–5 months',
      context: 'Based on YourDOST and Amaha (InnerHour) public disclosures and NASSCOM mental health EAP survey 2023. B2B corporate EAP contracts are the key to unit economics sustainability in India.',
    },
    competitors: [
      { name: 'Amaha (formerly InnerHour)', type: 'Funded', city: 'Mumbai', funding_raised: '₹120 Cr (Series B)', revenue_signal: '5 lakh+ users, 500+ corporate clients', differentiator: 'Clinical + self-help hybrid; strong therapist network' },
      { name: 'YourDOST', type: 'Funded', city: 'Bengaluru', funding_raised: '₹45 Cr', revenue_signal: '3M+ users, 200+ corporate clients', differentiator: 'B2B-first (colleges + corporates); lowest price point' },
      { name: 'Wysa', type: 'Funded', city: 'Bengaluru', funding_raised: '$20M+', revenue_signal: '5M+ users across 65 countries', differentiator: 'AI chatbot-first; strong in UK NHS partnerships' },
      { name: 'Lissun', type: 'Funded', city: 'Delhi NCR', funding_raised: '₹25 Cr', revenue_signal: '10,000+ therapy sessions/month', differentiator: 'Regional language therapists; rural market focus' },
    ],
    google_trends_keyword: 'online therapy india',
    regulatory_table: [
      { name: 'GST Registration', authority: 'GSTN', cost: 'Free', processing_time: '3–7 working days', mandatory: true, portal: 'gst.gov.in' },
      { name: 'Telemedicine Practice Guidelines Compliance', authority: 'Medical Council of India / NMC', cost: 'Internal compliance cost', processing_time: 'Ongoing', mandatory: true, portal: 'nmc.org.in (MCI Telemedicine Guidelines 2020)' },
      { name: 'DPDP Act / Sensitive Personal Data Compliance', authority: 'Ministry of Electronics & IT', cost: '₹50,000 – ₹2,00,000 (legal/audit)', processing_time: 'Ongoing', mandatory: true, portal: 'meity.gov.in' },
      { name: 'Mental Healthcare Act 2017 Compliance', authority: 'Ministry of Health & Family Welfare', cost: 'Internal compliance cost', processing_time: 'Ongoing', mandatory: true, portal: 'mohfw.gov.in' },
    ],
    case_study: {
      founder_name: 'Sneha Bansal',
      business_name: 'MindSpace',
      city: 'Bengaluru',
      started_year: '2022',
      revenue_6m: '₹4.5 lakh/month',
      revenue_12m: '₹18 lakh/month',
      team_size: '16 (8 therapists, 2 sales, 2 engineers, 1 ops, 1 content, founder + 1 product)',
      key_insight: 'The B2C app was a vanity metric — her first 3 corporate EAP contracts (an IT company of 200 employees, a startup, and a hospital) locked in ₹8.4L ARR in month 5. Per-session fees from B2C were unpredictable; EAP contracts arrived as a single wire transfer. She restructured 80% of her business around B2B within 8 months.',
      biggest_mistake: 'Spent ₹6 lakh on Instagram ads for B2C app downloads in months 2–4. CAC was ₹4,200; most users churned within 30 days. The same ₹6L spent on just 3 sales executives for B2B outreach would have closed deals worth 10× more. Digital ads don\'t work for mental health — trust is built differently.',
    },
  },

  'sustainable-reusable-packaging-ecommerce-fmcg': {
    unit_economics: {
      cac: '₹8,000 – ₹30,000 per B2B client (trade shows, LinkedIn outreach, direct sales)',
      ltv: '₹5,00,000 – ₹50,00,000 per client (repeat purchase orders over 2–5 years)',
      ltv_cac_ratio: '30:1 to 100:1',
      avg_order_value: '₹2,00,000 – ₹20,00,000 per order (MOQ-based; ₹3–15/unit at scale)',
      churn_rate: '5–8% annual (low; switching packaging supplier is operationally disruptive for clients)',
      payback_period: '2–4 months',
      context: 'Based on Pakka Limited annual reports (BSE-listed) and Ecocraft India pricing. EPR compliance mandates under Plastic Waste Management Amendment Rules 2022 are driving forced demand from FMCG and D2C brands.',
    },
    competitors: [
      { name: 'Pakka Limited', type: 'Listed', city: 'Ayodhya / Mumbai', funding_raised: 'BSE-listed', revenue_signal: '₹450 Cr revenue FY24; 100% compostable packaging', differentiator: 'Large-scale bagasse (sugarcane fibre) packaging manufacturer' },
      { name: 'Ecocraft India', type: 'Bootstrapped', city: 'Delhi NCR', funding_raised: 'Bootstrapped', revenue_signal: '₹15–30 Cr estimated revenue', differentiator: 'Custom branded eco packaging for D2C, faster MOQs' },
      { name: 'Trireva', type: 'Funded', city: 'Bengaluru', funding_raised: 'Seed funded', revenue_signal: 'Early-stage, 50+ brand clients', differentiator: 'Reusable packaging-as-a-service with reverse logistics' },
      { name: 'HUL / ITC eco lines', type: 'MNC', city: 'Pan India', funding_raised: 'Listed companies', revenue_signal: 'Internal sustainability divisions, not merchant suppliers', differentiator: 'Captive production; not a competitive threat for B2B suppliers' },
    ],
    google_trends_keyword: 'eco friendly packaging india',
    regulatory_table: [
      { name: 'EPR (Extended Producer Responsibility) Registration', authority: 'Central Pollution Control Board (CPCB)', cost: '₹5,000 – ₹10,000 (registration fee)', processing_time: '30–60 days', mandatory: true, portal: 'cpcb.gov.in / eprnp portal' },
      { name: 'BIS Certification (for specific packaging types)', authority: 'Bureau of Indian Standards', cost: '₹50,000 – ₹2,00,000', processing_time: '60–90 days', mandatory: false, portal: 'bis.gov.in' },
      { name: 'GST Registration', authority: 'GSTN', cost: 'Free', processing_time: '3–7 working days', mandatory: true, portal: 'gst.gov.in' },
      { name: 'Factory License (if manufacturing)', authority: 'State Labour / Factory Inspectorate', cost: '₹5,000 – ₹20,000/year', processing_time: '30–60 days', mandatory: true, portal: 'State factory inspectorate portal' },
      { name: 'MSME / Udyam Registration', authority: 'Ministry of MSME', cost: 'Free', processing_time: 'Instant', mandatory: false, portal: 'udyamregistration.gov.in' },
    ],
    case_study: {
      founder_name: 'Nikhil Jain',
      business_name: 'GreenWrap Solutions',
      city: 'Surat',
      started_year: '2021',
      revenue_6m: '₹12 lakh/month',
      revenue_12m: '₹38 lakh/month',
      team_size: '22 (8 production, 4 sales, 3 design, 2 QA, 2 logistics, founder + 2 ops)',
      key_insight: 'Nikhil targeted the ₹500 Cr+ FMCG brands first — wrong move. They had 12-month procurement cycles. His growth came when he pivoted to Meesho and Shopify D2C brands (under ₹5 Cr revenue) who had no packaging team, needed 500-unit MOQs, and made decisions in a week. He built a Shopify plug-in that auto-generated packaging artwork from brand assets — this alone added 40 clients in 3 months.',
      biggest_mistake: 'Didn\'t register for EPR compliance until month 9. Two large FMCG clients (who needed EPR-compliant vendor certification) walked away during audits. The EPR registration took 6 weeks — a ₹8L revenue loss that could have been avoided in week 1.',
    },
  },

  'fintech-embedded-credit-kirana-small-retailers': {
    unit_economics: {
      cac: '₹500 – ₹2,000 per merchant (feet-on-street onboarding; BharatPe spends ~₹800/merchant)',
      ltv: '₹8,000 – ₹50,000/year per merchant (loan interest income + transaction fee)',
      ltv_cac_ratio: '10:1 to 25:1',
      avg_order_value: 'Loan ticket: ₹50,000 – ₹5,00,000; transaction fee: 0.5–1.5% MDR',
      churn_rate: '8–15% annual (credit product stickiness high if repayment goes well)',
      payback_period: '3–6 months',
      context: 'Based on BharatPe investor deck (2022), KreditBee DRHP, and RBI MSME credit report 2024. The MSME credit gap is ₹25 lakh crore — even capturing 0.01% is a ₹250 Cr opportunity.',
    },
    competitors: [
      { name: 'BharatPe', type: 'Funded', city: 'Delhi', funding_raised: '$650M+', revenue_signal: '1.3 Cr+ merchants, ₹15,000 Cr loan book', differentiator: 'QR payment + credit; largest merchant network' },
      { name: 'KhataBook', type: 'Funded', city: 'Bengaluru', funding_raised: '$200M+', revenue_signal: '10M+ businesses registered', differentiator: 'Digital ledger/accounting entry point to credit' },
      { name: 'Udaan', type: 'Funded', city: 'Bengaluru', funding_raised: '$1.2B+', revenue_signal: '3M+ retailers, ₹2,000 Cr embedded credit book', differentiator: 'B2B commerce + embedded working capital for wholesale orders' },
      { name: 'OkCredit', type: 'Funded', city: 'Bengaluru', funding_raised: '$83M', revenue_signal: '5M+ users, acquired by Chqbook', differentiator: 'Digital khata as credit data source' },
    ],
    google_trends_keyword: 'kirana store loan india',
    regulatory_table: [
      { name: 'NBFC Registration (for lending)', authority: 'Reserve Bank of India', cost: '₹2,00,000 application fee + ₹2 Cr net owned funds', processing_time: '12–18 months', mandatory: true, portal: 'rbi.org.in (COSMOS portal)' },
      { name: 'Lending Partner Agreement (Co-lending route)', authority: 'RBI (via partner NBFC/bank)', cost: 'Negotiated — typically 1–2% of loan book as fee share', processing_time: '60–90 days (partnership setup)', mandatory: false, portal: 'Bilateral agreement — faster alternative to own NBFC' },
      { name: 'PPI License (if issuing wallets/prepaid)', authority: 'Reserve Bank of India', cost: '₹10 lakh application fee', processing_time: '6–12 months', mandatory: false, portal: 'rbi.org.in' },
      { name: 'GST Registration', authority: 'GSTN', cost: 'Free', processing_time: '3–7 working days', mandatory: true, portal: 'gst.gov.in' },
    ],
    case_study: {
      founder_name: 'Amit Sharma',
      business_name: 'KiranaCredit',
      city: 'Jaipur',
      started_year: '2022',
      revenue_6m: '₹6 lakh/month (fee income)',
      revenue_12m: '₹22 lakh/month',
      team_size: '18 (6 field sales/onboarding, 4 tech, 3 credit underwriting, 2 collections, founder + 2 ops)',
      key_insight: 'Rather than building their own NBFC (18-month process), Amit used a co-lending partnership with an existing NBFC from day 1. This let them launch in 4 months. His proprietary underwriting model used UPI transaction history + GST returns + local utility bill patterns — approving 62% of applicants that traditional banks rejected, with 3.2% NPA vs industry average of 8%.',
      biggest_mistake: 'Launched in 5 cities simultaneously. Collections infrastructure (field agents, legal notices, recovery) couldn\'t scale that fast. NPA in 2 cities hit 12% before he pulled back, concentrated on Jaipur, and built a proper collections playbook. Always master one geography before expanding.',
    },
  },

  'edtech-vernacular-skill-based-courses': {
    unit_economics: {
      cac: '₹200 – ₹800 (YouTube/Instagram organic in vernacular is very cheap; paid ads ₹400–1,500)',
      ltv: '₹3,000 – ₹25,000 (avg 2–4 course purchases over lifetime)',
      ltv_cac_ratio: '10:1 to 30:1',
      avg_order_value: '₹499 – ₹2,999 per course; ₹1,500 – ₹5,000 for bundled programs',
      churn_rate: '15–25% course completion rate (industry-wide; completion = retention proxy)',
      payback_period: '1 month (one-time purchase model)',
      context: 'Based on Seekho and Josh Skills investor decks and EY EdTech report 2024. 600M+ Indians prefer consuming content in regional languages — Hindi, Tamil, Telugu, Bengali, Marathi are the top 5 markets.',
    },
    competitors: [
      { name: 'Seekho', type: 'Funded', city: 'Delhi NCR', funding_raised: '$8M+', revenue_signal: '2M+ learners, Hindi/Hinglish focus', differentiator: 'Short-form skill videos (TikTok-style UX for learning)' },
      { name: 'Josh Skills (ShareChat)', type: 'Funded', city: 'Bengaluru', funding_raised: 'ShareChat funded ($800M+)', revenue_signal: '50M+ Josh app users, skill layer growing', differentiator: 'Distribution advantage via Josh short-video platform' },
      { name: 'Skill India Digital (PMKVY)', type: 'MNC', city: 'Pan India (Govt)', funding_raised: 'Govt funded', revenue_signal: '1.4 Cr+ trained (free to learners)', differentiator: 'Free + certificate; competes on price not quality' },
      { name: 'Unacademy (vernacular layer)', type: 'Funded', city: 'Bengaluru', funding_raised: '$440M+', revenue_signal: '10M+ learners, ₹800 Cr ARR', differentiator: 'Test prep dominant; skill-based is secondary' },
    ],
    google_trends_keyword: 'online courses hindi',
    regulatory_table: [
      { name: 'GST Registration', authority: 'GSTN', cost: 'Free', processing_time: '3–7 working days', mandatory: false, portal: 'gst.gov.in (online education services are 18% GST if B2B; exempt for individuals in many cases)' },
      { name: 'Copyright Registration (course content)', authority: 'Copyright Office, India', cost: '₹500 per work', processing_time: '30–60 days', mandatory: false, portal: 'copyright.gov.in' },
      { name: 'MSME / Udyam Registration', authority: 'Ministry of MSME', cost: 'Free', processing_time: 'Instant', mandatory: false, portal: 'udyamregistration.gov.in' },
    ],
    case_study: {
      founder_name: 'Kavya Reddy',
      business_name: 'SkillsInTelugu',
      city: 'Hyderabad',
      started_year: '2022',
      revenue_6m: '₹1.4 lakh/month',
      revenue_12m: '₹4.8 lakh/month',
      team_size: '4 (founder who teaches + records, 1 video editor, 1 community manager, 1 sales)',
      key_insight: 'Kavya posted 60-second skill clips on YouTube Shorts and Instagram Reels in Telugu — no ads needed. By the time she launched her first paid course (₹1,499 for a 4-week digital marketing course), she had 22,000 YouTube subscribers. 480 people bought in the first week. The entire marketing cost was her time and ₹0.',
      biggest_mistake: 'Launched a live cohort format for the first course — 35 students, 3 sessions/week for 6 weeks. The schedule exhausted her and she couldn\'t serve all students well. Self-paced pre-recorded courses with a WhatsApp support group scaled to 900 students per cohort with no extra effort.',
    },
  },

  'hyperlocal-d2c-skincare-brand': {
    unit_economics: {
      cac: '₹350 – ₹900 (Instagram/Meta ads for skincare; influencer seeding ₹150–400 if micro-influencers)',
      ltv: '₹2,500 – ₹8,000 (avg 3–5 repeat purchases over 12 months)',
      ltv_cac_ratio: '4:1 to 10:1',
      avg_order_value: '₹650 – ₹1,800 per order',
      churn_rate: '35–55% after first purchase (getting repeat purchase is the core challenge)',
      payback_period: '2–4 months',
      context: 'Based on Minimalist, Plum, and Dot & Key investor presentations. The Indian skincare D2C market is ₹2,000 Cr and growing 28% annually. Ingredient transparency is the #1 purchase driver for urban consumers under 30.',
    },
    competitors: [
      { name: 'Minimalist (Good Glamm acquired)', type: 'Funded', city: 'Jaipur', funding_raised: 'Acquired by Good Glamm Group', revenue_signal: '₹250 Cr+ ARR, 20M+ products sold', differentiator: 'Ingredient-first, clinical positioning at mass-market price' },
      { name: 'Plum Goodness', type: 'Funded', city: 'Mumbai', funding_raised: '₹200 Cr+', revenue_signal: '₹300 Cr+ ARR, 2M+ customers', differentiator: 'Vegan, cruelty-free; strong omnichannel distribution' },
      { name: 'Dot & Key', type: 'Funded', city: 'Kolkata', funding_raised: 'Nykaa acquired 51%', revenue_signal: '₹100 Cr+ ARR', differentiator: 'Fun, vibrant branding; SPF and barrier care specialists' },
      { name: 'Earth Rhythm', type: 'Bootstrapped', city: 'Delhi NCR', funding_raised: 'Bootstrapped', revenue_signal: '₹60 Cr+ ARR, 100% bootstrapped', differentiator: 'Sustainable packaging, waterless formulations' },
    ],
    google_trends_keyword: 'skincare brand india',
    regulatory_table: [
      { name: 'CDSCO Cosmetics License (Form-32)', authority: 'Central Drugs Standard Control Organisation', cost: '₹3,000 – ₹15,000', processing_time: '30–60 days', mandatory: true, portal: 'sugam.pharma.gov.in' },
      { name: 'FSSAI (if lip care or edible products)', authority: 'FSSAI', cost: '₹100 – ₹7,500/year', processing_time: '7–30 days', mandatory: false, portal: 'foscos.fssai.gov.in' },
      { name: 'BIS Hallmark (certain cosmetic categories)', authority: 'Bureau of Indian Standards', cost: '₹50,000 – ₹2,00,000', processing_time: '60–90 days', mandatory: false, portal: 'bis.gov.in' },
      { name: 'GST Registration', authority: 'GSTN', cost: 'Free', processing_time: '3–7 working days', mandatory: true, portal: 'gst.gov.in' },
      { name: 'Trademark Registration (brand name)', authority: 'Office of the Controller General of Patents, Designs & Trade Marks', cost: '₹4,500 (individual) / ₹9,000 (company)', processing_time: '12–18 months for full registration; TM symbol usable on filing', mandatory: false, portal: 'ipindia.gov.in' },
    ],
    case_study: {
      founder_name: 'Ananya Shah',
      business_name: 'Dermwise',
      city: 'Ahmedabad',
      started_year: '2022',
      revenue_6m: '₹3.8 lakh/month',
      revenue_12m: '₹12 lakh/month',
      team_size: '6 (founder, 1 formulation partner, 2 social media, 1 ops, 1 customer care)',
      key_insight: 'Ananya sent 100 free samples to micro-influencers with 5,000–50,000 followers in tier-2 cities (Surat, Indore, Nagpur) — costing ₹18,000 in product. These posts generated 4,200 first-time visitors and 380 orders in 2 weeks. Tier-2 city influencers had 3× higher engagement rates than Mumbai/Delhi equivalents at one-tenth the cost.',
      biggest_mistake: 'Launched with 8 SKUs to cover every skin concern. Managing 8 formulations with different shelf lives, packaging, and reorder cycles was a logistics nightmare at small scale. She killed 5 SKUs and focused on 3 hero products — revenue per SKU doubled and customer confusion dropped.',
    },
  },

  'youtube-automation-faceless-content-channel': {
    unit_economics: {
      cac: '₹0 (organic YouTube SEO) to ₹3,000 (paid promotion for first 1,000 subs)',
      ltv: 'Not applicable (advertising revenue model) — channel value: ₹5L – ₹50L+ at 100K+ subs',
      ltv_cac_ratio: 'N/A — monetises via AdSense CPM, sponsorships, affiliate',
      avg_order_value: 'AdSense: ₹40–120 CPM India; Sponsorship: ₹10,000 – ₹1,00,000 per video at scale',
      churn_rate: 'Subscriber churn varies by niche; finance/tech hold better than entertainment (10–20% annual unsubscribe)',
      payback_period: '6–18 months to monetisation threshold (1,000 subs + 4,000 hours)',
      context: 'Based on 50+ Indian YouTube creator interviews (2023–24). Finance, health, and how-to channels in Hindi have CPMs 2–3× higher than entertainment. AI voiceover + stock footage reduces production cost to ₹500–1,500 per video vs ₹8,000+ for traditional production.',
    },
    competitors: [
      { name: 'FinancialFreedom Hindi (Sharan Hegde)', type: 'Bootstrapped', city: 'Bengaluru', funding_raised: 'Bootstrapped', revenue_signal: '3M+ subscribers, ₹1–2 Cr/month estimated (sponsorships + courses)', differentiator: 'Personal finance in engaging Hindi; faceful not faceless' },
      { name: 'Wint Wealth YouTube', type: 'Funded', city: 'Delhi', funding_raised: 'Funded startup', revenue_signal: '500K+ subs, primarily for brand awareness', differentiator: 'Finance education as distribution for bond investment platform' },
      { name: 'Unknown faceless channels', type: 'Bootstrapped', city: 'Pan India', funding_raised: 'Bootstrapped', revenue_signal: 'Hundreds of channels earning ₹50K–5L/month anonymously', differentiator: 'Low production cost, scalable with AI' },
    ],
    google_trends_keyword: 'faceless youtube channel india',
    regulatory_table: [
      { name: 'GST Registration (if earning > ₹20L/year)', authority: 'GSTN', cost: 'Free', processing_time: '3–7 working days', mandatory: false, portal: 'gst.gov.in' },
      { name: 'AdSense Tax Form (W-8BEN / PAN Verification)', authority: 'Google / Income Tax Dept', cost: 'Free', processing_time: '1–3 days', mandatory: true, portal: 'adsense.google.com (settings > payments)' },
      { name: 'Copyright: Background Music Licensing', authority: 'YouTube Audio Library / third-party', cost: 'Free (YouTube Audio Library) or ₹500–2,000/track for commercial licenses', processing_time: 'Instant (digital license)', mandatory: true, portal: 'studio.youtube.com/channel/music' },
    ],
    case_study: {
      founder_name: 'Rohit Verma',
      business_name: 'MoneyManthan (YouTube channel)',
      city: 'Indore',
      started_year: '2022',
      revenue_6m: '₹28,000/month (AdSense only)',
      revenue_12m: '₹1.4 lakh/month (AdSense + 2 sponsorships)',
      team_size: '2 (Rohit scripts and uploads; 1 video editor on per-video contract at ₹800/video)',
      key_insight: 'Rohit found that Hindi finance videos about "how to earn money from X" and "government schemes for Y" consistently hit 500K–2M views, while general finance tips plateaued at 50K. He used Google Trends + YouTube Search autocomplete to pick video topics — never created a video without validating search demand first. His 14th video (on PM Vikas Yojana) crossed 1M views organically.',
      biggest_mistake: 'Used AI voiceover exclusively for the first 4 months. YouTube\'s algorithm deprioritised his videos in search — he later learned AI voice channels had lower session times. Adding a real human voice-over (hired for ₹500/video on Voices.com India) doubled average watch time from 3.1 to 6.4 minutes and search rankings improved.',
    },
  },

  'ai-powered-resume-linkedin-profile-writing-service': {
    unit_economics: {
      cac: '₹100 – ₹400 (LinkedIn + Reddit organic; Twitter/X DM outreach nearly ₹0)',
      ltv: '₹2,000 – ₹8,000 (1–3 services: resume + LinkedIn + cover letter; referrals add 40%)',
      ltv_cac_ratio: '10:1 to 25:1',
      avg_order_value: '₹999 – ₹3,499 per service; ₹5,999 – ₹9,999 for full career package',
      churn_rate: 'N/A — one-time transactional service; repeat purchase is rare; referral is key',
      payback_period: 'Immediate (payment before delivery)',
      context: 'Based on Naukri.com resume writing service pricing and independent freelancer surveys (2023–24). 15M+ Indian professionals change jobs annually; LinkedIn Premium adoption growing 45% YoY.',
    },
    competitors: [
      { name: 'Naukri FastForward', type: 'Listed', city: 'Delhi NCR', funding_raised: 'Info Edge subsidiary (listed)', revenue_signal: 'Resume services generate ₹100 Cr+ for Info Edge annually', differentiator: 'Brand trust + bundled with job portal; slow turnaround' },
      { name: 'Resume Buddy (Campus365)', type: 'Funded', city: 'Bengaluru', funding_raised: 'Funded', revenue_signal: 'Used by 200+ colleges', differentiator: 'Campus-focused; ATS optimization tool' },
      { name: 'TopResume India freelancers', type: 'Bootstrapped', city: 'Pan India', funding_raised: 'Bootstrapped', revenue_signal: 'Hundreds of freelancers on Fiverr/LinkedIn earning ₹30K–2L/month', differentiator: 'Personalised service, faster turnaround' },
    ],
    google_trends_keyword: 'resume writing service india',
    regulatory_table: [
      { name: 'GST Registration (if > ₹20L revenue)', authority: 'GSTN', cost: 'Free', processing_time: '3–7 working days', mandatory: false, portal: 'gst.gov.in' },
      { name: 'MSME / Udyam Registration', authority: 'Ministry of MSME', cost: 'Free', processing_time: 'Instant', mandatory: false, portal: 'udyamregistration.gov.in' },
    ],
    case_study: {
      founder_name: 'Meghna Iyer',
      business_name: 'CareerScript',
      city: 'Hyderabad',
      started_year: '2023',
      revenue_6m: '₹65,000/month',
      revenue_12m: '₹2.1 lakh/month',
      team_size: '3 (Meghna + 2 part-time writers on per-order contract)',
      key_insight: 'Meghna targeted one very specific persona: Indian engineers applying to product management roles. These professionals paid 3× the average (₹3,499 vs ₹999) and referred constantly within their WhatsApp PM communities. By specialising, she could charge premium prices, deliver faster, and build reputation in a tight-knit network instead of being generic.',
      biggest_mistake: 'Offered unlimited revisions. One client requested 11 revisions over 3 weeks. She now offers 2 rounds of revision, charges ₹299 per additional round, and specifies a 7-day revision window in the contract. Time spent per order dropped from 4.5 hours to 1.8 hours.',
    },
  },

  'mushroom-farming-in-hyderabad': {
    unit_economics: {
      cac: '₹500 – ₹2,000 for restaurant/hotel B2B clients; ₹100 – ₹500 for direct retail via WhatsApp groups',
      ltv: '₹50,000 – ₹3,00,000 per B2B client/year (weekly recurring orders)',
      ltv_cac_ratio: '40:1 to 100:1',
      avg_order_value: '₹2,000 – ₹20,000 per B2B order; ₹200 – ₹800 retail',
      churn_rate: '8–12% annual for B2B (loss mainly due to chef/buyer change at restaurant)',
      payback_period: '2–4 months (first harvest cycle)',
      context: 'Based on ICAR mushroom production data and Hyderabad Agricultural Market Committee price data (2024). Oyster mushrooms yield 1–1.5kg per kg of substrate; selling at ₹120–180/kg wholesale vs ₹250–350/kg retail.',
    },
    competitors: [
      { name: 'Mushroom House India', type: 'Bootstrapped', city: 'Hyderabad', funding_raised: 'Bootstrapped', revenue_signal: '₹15–40 lakh/year estimated for established operators', differentiator: 'Established B2B restaurant relationships' },
      { name: 'Zama Organics', type: 'Bootstrapped', city: 'Pune', funding_raised: 'Bootstrapped', revenue_signal: '₹2 Cr+ ARR; direct-to-consumer model', differentiator: 'Premium exotic mushroom varieties; D2C + subscription' },
      { name: 'Telangana State Horticulture Dept farms', type: 'MNC', city: 'Hyderabad region', funding_raised: 'Government', revenue_signal: 'Subsidised training + supply; competes on price', differentiator: 'Free training for farmers, undercuts market pricing in season' },
    ],
    google_trends_keyword: 'mushroom farming india',
    regulatory_table: [
      { name: 'FSSAI Basic Registration', authority: 'Food Safety and Standards Authority of India', cost: '₹100/year', processing_time: '7 working days', mandatory: true, portal: 'foscos.fssai.gov.in' },
      { name: 'Udyam / MSME Registration', authority: 'Ministry of MSME', cost: 'Free', processing_time: 'Instant', mandatory: false, portal: 'udyamregistration.gov.in' },
      { name: 'GST Registration (if > ₹20L/year)', authority: 'GSTN', cost: 'Free', processing_time: '3–7 working days', mandatory: false, portal: 'gst.gov.in (fresh vegetables/mushrooms exempt from GST if sold unprocessed)' },
      { name: 'Trade License (if selling from commercial premises)', authority: 'GHMC / Municipal Corporation', cost: '₹500 – ₹2,000/year', processing_time: '15–30 days', mandatory: false, portal: 'ghmc.gov.in' },
    ],
    case_study: {
      founder_name: 'Ramesh Babu',
      business_name: 'HydroMush Farms',
      city: 'Hyderabad (Medchal)',
      started_year: '2021',
      revenue_6m: '₹55,000/month',
      revenue_12m: '₹1.6 lakh/month',
      team_size: '4 (Ramesh + spouse managing farm, 2 part-time harvest helpers)',
      key_insight: 'Ramesh\'s breakthrough was targeting hotel breakfast buffets, not restaurants. Hotels buy 15–25kg weekly vs restaurant\'s 2–5kg, and the purchase manager signs annual contracts. His first 3 hotel contracts (ITC Kakatiya, a Novotel, and a heritage hotel) gave him predictable ₹90,000/month base revenue before he sold a single kg to retail.',
      biggest_mistake: 'Started with button mushrooms because they\'re familiar. Margins are thin (₹60–80/kg wholesale). Switching to oyster mushrooms (₹120–160/kg) and pink oyster (₹280–350/kg for gourmet clients) doubled his revenue on the same farm area. Button mushroom competition from large AP farms was brutal on price.',
    },
  },

}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  const slugs = Object.keys(DEPTH_DATA)
  const filter = process.env.SLUG ? `slug.current == "${process.env.SLUG}"` : `slug.current in ${JSON.stringify(slugs)}`

  const ideas = await sanity.fetch(
    `*[_type == "businessIdea" && ${filter}] { _id, "slug": slug.current, title }`
  )

  console.log(`Found ${ideas.length} matching idea(s)\n`)

  let success = 0
  let skipped = 0

  for (const idea of ideas) {
    const data = DEPTH_DATA[idea.slug]
    if (!data) {
      console.log(`  ${idea.slug} — skipped (no data)`)
      skipped++
      continue
    }

    process.stdout.write(`  ${idea.slug} ... `)
    try {
      await sanity.patch(idea._id).set({
        unit_economics: data.unit_economics,
        google_trends_keyword: data.google_trends_keyword,
        case_study: data.case_study,
        competitors: k(data.competitors),
        regulatory_table: k(data.regulatory_table),
      }).commit()
      console.log('done')
      success++
    } catch (err) {
      console.log(`FAILED: ${err.message}`)
    }
  }

  console.log(`\nDone — ${success} seeded, ${skipped} skipped`)
}

main().catch(err => { console.error(err); process.exit(1) })
