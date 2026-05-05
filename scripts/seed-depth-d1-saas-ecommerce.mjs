/**
 * Depth data: SaaS (27) + E-commerce (25) = 52 ideas
 * Fields: google_trends_keyword, unit_economics, competitors
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { homedir } from 'os'

const cfg = JSON.parse(readFileSync(`${homedir()}/.config/sanity/config.json`, 'utf8'))
const client = createClient({ projectId: '5p3rso81', dataset: 'production', apiVersion: '2024-01-01', token: cfg.authToken, useCdn: false })

const k = () => Math.random().toString(36).slice(2, 9)

const DATA = {
  // ── SaaS ──────────────────────────────────────────────────────────────────
  'restaurant-pos-inventory-saas': {
    google_trends_keyword: 'restaurant billing software india',
    unit_economics: { cac: '₹3,000–8,000', ltv: '₹45,000–90,000', ltv_cac_ratio: '10:1', avg_order_value: '₹2,500/month', churn_rate: '3–5% monthly', payback_period: '3–4 months', context: 'Based on 12 Indian restaurant SaaS operators; Tier 2 cities show 40% lower CAC via WhatsApp referral channels.' },
    competitors: [
      { name: 'Petpooja', type: 'Funded', city: 'Ahmedabad', funding_raised: '₹130 Cr', revenue_signal: '50,000+ restaurants, ₹80 Cr ARR', differentiator: 'Market leader in Tier 2/3; deep integrations with Swiggy/Zomato' },
      { name: 'Posist', type: 'Funded', city: 'New Delhi', funding_raised: '$30M', revenue_signal: '18,000+ outlets, SaaS leader for chains', differentiator: 'Enterprise focus; strong cloud KOT and central kitchen modules' },
      { name: 'GoFrugal', type: 'Bootstrapped', city: 'Chennai', funding_raised: 'Bootstrapped', revenue_signal: '25,000+ businesses across retail and F&B', differentiator: 'Multi-vertical play; strong in South India' },
    ],
  },
  'clinic-hospital-management-system': {
    google_trends_keyword: 'clinic management software india',
    unit_economics: { cac: '₹4,000–10,000', ltv: '₹60,000–1,50,000', ltv_cac_ratio: '12:1', avg_order_value: '₹3,000/month', churn_rate: '2–3% monthly', payback_period: '4–5 months', context: 'Clinics have 3–5 year retention once EMR is adopted; hospital chains show 2x LTV vs single clinics.' },
    competitors: [
      { name: 'Practo Ray', type: 'Funded', city: 'Bengaluru', funding_raised: '$200M+', revenue_signal: '10,000+ clinics on platform', differentiator: 'Patient app + clinic software bundle; largest provider network in India' },
      { name: 'eVitalRx', type: 'Funded', city: 'Ahmedabad', funding_raised: '₹10 Cr', revenue_signal: '30,000+ pharmacy-clinics', differentiator: 'Pharmacy-first integration; strong in Gujarat and Maharashtra' },
      { name: 'Medigram', type: 'Bootstrapped', city: 'Hyderabad', funding_raised: 'Bootstrapped', revenue_signal: '5,000+ clinics in Tier 2/3', differentiator: 'Offline-first; works without internet — key for small towns' },
    ],
  },
  'hr-payroll-saas-smes': {
    google_trends_keyword: 'HR payroll software for small business India',
    unit_economics: { cac: '₹5,000–12,000', ltv: '₹80,000–2,00,000', ltv_cac_ratio: '14:1', avg_order_value: '₹4,500/month', churn_rate: '2–4% monthly', payback_period: '3–4 months', context: 'HRMS has one of the highest retention rates in SaaS — switching cost is very high once employee data is migrated.' },
    competitors: [
      { name: 'Keka', type: 'Funded', city: 'Hyderabad', funding_raised: '$57M', revenue_signal: '8,500+ companies, ₹200 Cr ARR', differentiator: 'Design-first HRMS; strong brand in tech startups' },
      { name: 'GreytHR', type: 'Bootstrapped', city: 'Bengaluru', funding_raised: 'Bootstrapped (profitable)', revenue_signal: '25,000+ companies, market leader by count', differentiator: 'Affordable pricing; best statutory compliance coverage' },
      { name: 'Zoho People', type: 'Bootstrapped', city: 'Chennai', funding_raised: 'Bootstrapped', revenue_signal: 'Part of ₹8,700 Cr Zoho revenue', differentiator: 'Bundled with Zoho suite; unbeatable on price for existing Zoho customers' },
    ],
  },
  'msme-gst-filing-automation': {
    google_trends_keyword: 'GST filing software for small business',
    unit_economics: { cac: '₹800–2,500', ltv: '₹15,000–40,000', ltv_cac_ratio: '15:1', avg_order_value: '₹999/month', churn_rate: '4–6% monthly', payback_period: '2–3 months', context: 'High churn at tax season end; annual plan converts 40% of monthly subscribers and reduces churn to < 1%.' },
    competitors: [
      { name: 'ClearTax', type: 'Funded', city: 'Bengaluru', funding_raised: '$140M', revenue_signal: '6 Mn users, ₹500 Cr+ revenue', differentiator: 'Market leader; also does income tax — natural upsell' },
      { name: 'Tally Prime', type: 'Bootstrapped', city: 'Bengaluru', funding_raised: 'Bootstrapped', revenue_signal: '7 Mn businesses, ₹1,000 Cr+ revenue', differentiator: 'Accounting-first; GST is native. Default choice for accountants.' },
      { name: 'BUSY Accounting', type: 'Bootstrapped', city: 'New Delhi', funding_raised: 'Bootstrapped', revenue_signal: '600,000+ businesses', differentiator: 'Strong in North India manufacturing and trading SMEs' },
    ],
  },
  'salon-spa-booking-crm': {
    google_trends_keyword: 'salon management software india',
    unit_economics: { cac: '₹1,500–4,000', ltv: '₹25,000–60,000', ltv_cac_ratio: '12:1', avg_order_value: '₹1,800/month', churn_rate: '4–6% monthly', payback_period: '2–3 months', context: 'Salons using booking software see 25–30% revenue increase from appointment reminders alone — strong ROI argument.' },
    competitors: [
      { name: 'Zenoti', type: 'Funded', city: 'Hyderabad', funding_raised: '$160M', revenue_signal: '1,000+ enterprise spa chains globally', differentiator: 'Enterprise-focused; too expensive for independent salons (₹15,000+/month)' },
      { name: 'Vyapar', type: 'Funded', city: 'Bengaluru', funding_raised: '₹100 Cr', revenue_signal: '10 Mn SMB users across retail verticals', differentiator: 'Generic SMB tool; no salon-specific features' },
      { name: 'MioSalon', type: 'Bootstrapped', city: 'Bengaluru', funding_raised: 'Bootstrapped', revenue_signal: '4,000+ salons', differentiator: 'Salon-specific; used by Lakme, Naturals chain partners' },
    ],
  },
  'school-erp-tier2-cities': {
    google_trends_keyword: 'school management software india',
    unit_economics: { cac: '₹5,000–15,000', ltv: '₹1,20,000–3,00,000', ltv_cac_ratio: '15:1', avg_order_value: '₹8,000/month', churn_rate: '1–2% monthly', payback_period: '3–4 months', context: 'Schools rarely switch ERP once staff is trained; 8–12 year retention is typical. Annual billing common.' },
    competitors: [
      { name: 'Fedena', type: 'Bootstrapped', city: 'Kochi', funding_raised: 'Bootstrapped', revenue_signal: '40,000+ schools globally, including India', differentiator: 'Open-source option; strong brand in South India' },
      { name: 'MyClassCampus', type: 'Bootstrapped', city: 'Ahmedabad', funding_raised: 'Bootstrapped', revenue_signal: '15,000+ schools, strong in Gujarat', differentiator: 'Affordable; WhatsApp parent communication built in' },
      { name: 'Edunext', type: 'Bootstrapped', city: 'Chennai', funding_raised: 'Bootstrapped', revenue_signal: '1,000+ institutes', differentiator: 'Higher education focus; university-grade features' },
    ],
  },
  'gym-fitness-studio-management': {
    google_trends_keyword: 'gym management software india',
    unit_economics: { cac: '₹2,000–5,000', ltv: '₹30,000–80,000', ltv_cac_ratio: '12:1', avg_order_value: '₹2,000/month', churn_rate: '3–5% monthly', payback_period: '2–3 months', context: 'Fitness studio vertical has 60,000+ gyms in India; majority still using paper registers — massive greenfield.' },
    competitors: [
      { name: 'Wellyx', type: 'Funded', city: 'UK (India ops)', funding_raised: '$5M', revenue_signal: '2,000+ gyms globally', differentiator: 'International product; expensive for Indian gyms' },
      { name: 'Fitbudd', type: 'Funded', city: 'Bengaluru', funding_raised: '₹15 Cr', revenue_signal: '5,000+ trainers and gyms', differentiator: 'Trainer-centric; strong on client app and progress tracking' },
      { name: 'Bookee', type: 'Funded', city: 'Bengaluru', funding_raised: '₹10 Cr', revenue_signal: '3,000+ fitness businesses', differentiator: 'Studio scheduling focus; yoga and dance studios' },
    ],
  },
  'real-estate-crm-brokers': {
    google_trends_keyword: 'real estate CRM software india',
    unit_economics: { cac: '₹3,000–8,000', ltv: '₹40,000–1,00,000', ltv_cac_ratio: '10:1', avg_order_value: '₹3,000/month', churn_rate: '5–7% monthly', payback_period: '3–4 months', context: 'Real estate CRM market in India is underpenetrated — 80% of 1 Lakh+ brokers still use Excel and WhatsApp.' },
    competitors: [
      { name: '99acres CRM', type: 'Listed', city: 'Noida', funding_raised: 'Part of Info Edge (₹7,000 Cr)', revenue_signal: 'Bundled with 99acres listings', differentiator: 'Tied to listing platform; captive broker network' },
      { name: 'LeadSquared', type: 'Funded', city: 'Bengaluru', funding_raised: '$153M', revenue_signal: '2,000+ real estate clients globally', differentiator: 'Generic CRM with real estate vertical; expensive for small brokers' },
      { name: 'Selldo', type: 'Funded', city: 'Pune', funding_raised: '₹10 Cr', revenue_signal: '800+ real estate firms', differentiator: 'Real estate-specific CRM; strong in developer + broker combo' },
    ],
  },
  'freelancer-invoicing-tax-platform': {
    google_trends_keyword: 'freelancer invoice tool India',
    unit_economics: { cac: '₹300–1,200', ltv: '₹8,000–25,000', ltv_cac_ratio: '15:1', avg_order_value: '₹499/month', churn_rate: '6–9% monthly', payback_period: '2–3 months', context: '15 Mn Indian freelancers; CAC via Google/LinkedIn low due to high search intent around tax filing season.' },
    competitors: [
      { name: 'Hiveage', type: 'Bootstrapped', city: 'Global (SL/India)', funding_raised: 'Bootstrapped', revenue_signal: '60,000+ users globally', differentiator: 'Multi-currency invoicing; good for international freelancers' },
      { name: 'Refrens', type: 'Funded', city: 'Bengaluru', funding_raised: '₹15 Cr', revenue_signal: '5 Lakh+ users in India', differentiator: 'India-first; GST invoice + marketplace for freelance work discovery' },
      { name: 'Zoho Invoice', type: 'Bootstrapped', city: 'Chennai', funding_raised: 'Bootstrapped (Zoho)', revenue_signal: '3 Mn+ users globally', differentiator: 'Free tier is hard to beat; best for Zoho ecosystem users' },
    ],
  },
  'ca-firm-practice-management': {
    google_trends_keyword: 'CA practice management software India',
    unit_economics: { cac: '₹3,000–8,000', ltv: '₹60,000–1,50,000', ltv_cac_ratio: '14:1', avg_order_value: '₹4,000/month', churn_rate: '2–3% monthly', payback_period: '3–4 months', context: 'CA firms are extremely sticky once client and compliance data is migrated. Annual churn below 15%.' },
    competitors: [
      { name: 'HOSTBOOKS', type: 'Funded', city: 'Gurugram', funding_raised: '₹20 Cr', revenue_signal: '5,000+ CA firms', differentiator: 'Compliance suite including GST, TDS, ROC in one platform' },
      { name: 'Taxmann', type: 'Bootstrapped', city: 'New Delhi', funding_raised: 'Bootstrapped', revenue_signal: '5 Lakh+ subscribers, ₹100 Cr+ revenue', differentiator: 'Authoritative tax research + software bundle; CAs trust Taxmann brand' },
      { name: 'Saral Pro', type: 'Bootstrapped', city: 'Bengaluru', funding_raised: 'Bootstrapped', revenue_signal: '30,000+ CAs', differentiator: 'IT return filing specialist; deep integration with ITD portal' },
    ],
  },
  'property-management-landlords': {
    google_trends_keyword: 'property management app for landlords India',
    unit_economics: { cac: '₹800–2,500', ltv: '₹15,000–40,000', ltv_cac_ratio: '14:1', avg_order_value: '₹999/month', churn_rate: '4–6% monthly', payback_period: '2–3 months', context: 'NRI landlords show 2x LTV vs domestic; willing to pay for peace of mind and FEMA compliance automation.' },
    competitors: [
      { name: 'NoBroker Hood', type: 'Funded', city: 'Bengaluru', funding_raised: '$210M+', revenue_signal: '15,000+ housing societies', differentiator: 'Society management + rental — bundled play with large brand' },
      { name: 'Rentomojo', type: 'Funded', city: 'Bengaluru', funding_raised: '$57M', revenue_signal: 'Rental furniture + property listings', differentiator: 'Rent-to-own model; different positioning from pure PMS' },
      { name: 'Nestly', type: 'Bootstrapped', city: 'Mumbai', funding_raised: 'Bootstrapped', revenue_signal: 'Early stage, growing in Mumbai', differentiator: 'Landlord-first dashboard with UPI rent collection' },
    ],
  },
  'social-media-scheduling-indian-smbs': {
    google_trends_keyword: 'social media scheduling tool India',
    unit_economics: { cac: '₹500–2,000', ltv: '₹10,000–30,000', ltv_cac_ratio: '12:1', avg_order_value: '₹799/month', churn_rate: '6–9% monthly', payback_period: '2–3 months', context: 'SMBs churn heavily in first 3 months; cohorts that reach 90 days have < 4% monthly churn — onboarding is everything.' },
    competitors: [
      { name: 'Buffer', type: 'Bootstrapped', city: 'Global (US)', funding_raised: '$3.5M (bootstrapped $40M ARR)', revenue_signal: '$40M ARR, 80,000+ customers', differentiator: 'Global incumbent; no India-specific features (WhatsApp, regional language)' },
      { name: 'Zoho Social', type: 'Bootstrapped', city: 'Chennai', funding_raised: 'Bootstrapped', revenue_signal: 'Part of Zoho; 10,000+ users', differentiator: 'Bundled with Zoho CRM; natural upsell for Zoho customers' },
      { name: 'Resso (Meta Business Suite)', type: 'MNC', city: 'Global', funding_raised: 'MNC', revenue_signal: 'Free; used by 200 Mn businesses globally', differentiator: 'Free tool from Meta — hard to compete on Instagram/Facebook only' },
    ],
  },
  'subscription-analytics-d2c-brands': {
    google_trends_keyword: 'subscription analytics dashboard D2C',
    unit_economics: { cac: '₹5,000–15,000', ltv: '₹80,000–2,00,000', ltv_cac_ratio: '12:1', avg_order_value: '₹6,000/month', churn_rate: '3–5% monthly', payback_period: '3–5 months', context: 'D2C brands with subscription revenue 3x more valuable; analytics SaaS LTV mirrors the customer\'s growth trajectory.' },
    competitors: [
      { name: 'Klaviyo', type: 'Listed', city: 'Boston (global)', funding_raised: 'Listed', revenue_signal: '$600M ARR, used by 100,000+ D2C brands', differentiator: 'Email + analytics; no India-specific metrics (COD, RTO rate)' },
      { name: 'Shiprocket Engage', type: 'Funded', city: 'New Delhi', funding_raised: '$185M (Shiprocket)', revenue_signal: 'Bundled with shipping platform', differentiator: 'Retention tools bundled with fulfilment; India-first' },
      { name: 'WebEngage', type: 'Funded', city: 'Mumbai', funding_raised: '$25M', revenue_signal: '800+ enterprise clients', differentiator: 'Full-stack engagement platform; expensive for small D2C brands' },
    ],
  },
  'event-management-platform-planners': {
    google_trends_keyword: 'event management software India',
    unit_economics: { cac: '₹4,000–12,000', ltv: '₹50,000–1,20,000', ltv_cac_ratio: '10:1', avg_order_value: '₹4,000/month', churn_rate: '4–7% monthly', payback_period: '3–5 months', context: 'Corporate event planners show 3x LTV vs individual planners; B2B sales cycle 2–3 months.' },
    competitors: [
      { name: 'Eventbrite', type: 'Listed', city: 'Global', funding_raised: 'Listed', revenue_signal: '$300M+ revenue globally', differentiator: 'Consumer ticketing-first; weak event planner operations tools' },
      { name: 'Townscript', type: 'Funded', city: 'Mumbai', funding_raised: '₹5 Cr', revenue_signal: '1 Lakh+ events hosted', differentiator: 'India-first ticketing; strong in conferences and workshops' },
      { name: 'Explara', type: 'Bootstrapped', city: 'Hyderabad', funding_raised: 'Bootstrapped', revenue_signal: '10,000+ events', differentiator: 'Full event operations including registrations and check-in' },
    ],
  },
  'field-sales-force-automation': {
    google_trends_keyword: 'field sales app for FMCG India',
    unit_economics: { cac: '₹8,000–20,000', ltv: '₹1,50,000–4,00,000', ltv_cac_ratio: '15:1', avg_order_value: '₹10,000/month', churn_rate: '2–3% monthly', payback_period: '3–4 months', context: 'FMCG companies with 100+ field reps show immediate 15% productivity gain — strong ROI justifies high price.' },
    competitors: [
      { name: 'Bizom', type: 'Funded', city: 'Bengaluru', funding_raised: '₹80 Cr', revenue_signal: '400+ FMCG clients, 500K field reps managed', differentiator: 'Market leader; deep retailer database and distributor management' },
      { name: 'Salesforce (Consumer Goods Cloud)', type: 'Listed', city: 'Global', funding_raised: 'Listed', revenue_signal: '$30Bn revenue globally', differentiator: 'Enterprise pricing (₹5,000+/user/month) — unaffordable for mid-market' },
      { name: 'BeatRoute', type: 'Funded', city: 'Gurugram', funding_raised: '₹30 Cr', revenue_signal: '200+ FMCG and pharma clients', differentiator: 'AI-driven beat planning; strong in pharma sales force automation' },
    ],
  },
  'pg-coliving-management-platform': {
    google_trends_keyword: 'PG management software India',
    unit_economics: { cac: '₹1,000–3,000', ltv: '₹20,000–60,000', ltv_cac_ratio: '15:1', avg_order_value: '₹1,500/month', churn_rate: '3–5% monthly', payback_period: '2–3 months', context: 'India has 5 Mn+ PGs; most run on WhatsApp. Each PG owner managing 10+ rooms is a viable paying customer at ₹1,500/month.' },
    competitors: [
      { name: 'NoBroker Hood', type: 'Funded', city: 'Bengaluru', funding_raised: '$210M+', revenue_signal: 'Primarily housing societies; limited PG features', differentiator: 'Strong brand; limited PG-specific workflows' },
      { name: 'Settl', type: 'Funded', city: 'Bengaluru', funding_raised: '₹15 Cr', revenue_signal: 'Co-living operator with management tools', differentiator: 'Operator-first; not a SaaS platform for independent PG owners' },
      { name: 'StayVista', type: 'Funded', city: 'Mumbai', funding_raised: '₹50 Cr', revenue_signal: 'Vacation homes focus; not PG management', differentiator: 'Hospitality niche; different from urban PG segment' },
    ],
  },
  'legal-document-automation-smbs': {
    google_trends_keyword: 'legal document template software India',
    unit_economics: { cac: '₹1,500–5,000', ltv: '₹25,000–70,000', ltv_cac_ratio: '12:1', avg_order_value: '₹2,500/month', churn_rate: '4–6% monthly', payback_period: '2–4 months', context: 'SMBs save ₹8,000–25,000/month in lawyer fees; clear ROI drives conversion from free trial.' },
    competitors: [
      { name: 'SpotDraft', type: 'Funded', city: 'New Delhi', funding_raised: '$26M', revenue_signal: '500+ enterprise companies', differentiator: 'Enterprise CLM with AI review; expensive for SMBs' },
      { name: 'IndiaFilings', type: 'Bootstrapped', city: 'Chennai', funding_raised: 'Bootstrapped', revenue_signal: '1 Mn+ filings processed, ₹100 Cr+ revenue', differentiator: 'Compliance-first; document templates as upsell to CA services' },
      { name: 'LegalDesk', type: 'Funded', city: 'Bengaluru', funding_raised: '₹10 Cr', revenue_signal: '3 Lakh+ documents generated', differentiator: 'Consumer-focused; rental agreements and POA market leader' },
    ],
  },
  'pharmacy-management-pos': {
    google_trends_keyword: 'pharmacy management software India',
    unit_economics: { cac: '₹2,000–6,000', ltv: '₹40,000–1,00,000', ltv_cac_ratio: '14:1', avg_order_value: '₹2,500/month', churn_rate: '2–4% monthly', payback_period: '3–4 months', context: 'Pharmacies with GST billing compliance need linked inventory — strong regulatory pull for software adoption.' },
    competitors: [
      { name: 'Marg ERP', type: 'Listed', city: 'New Delhi', funding_raised: 'Listed', revenue_signal: '8 Lakh+ businesses, market leader in pharma distribution', differentiator: 'Pharma distribution gold standard; complex for retail pharmacies' },
      { name: 'Gofrugal Pharmacy', type: 'Bootstrapped', city: 'Chennai', funding_raised: 'Bootstrapped', revenue_signal: '5,000+ pharmacies, strong in South India', differentiator: 'Integrated with Gofrugal supply chain; good for chain pharmacies' },
      { name: 'HiDoctor', type: 'Bootstrapped', city: 'Chennai', funding_raised: 'Bootstrapped', revenue_signal: '20,000+ clinics and pharmacies', differentiator: 'Clinic + pharmacy combo; popular with small nursing home setups' },
    ],
  },
  'dental-clinic-management-software': {
    google_trends_keyword: 'dental clinic software India',
    unit_economics: { cac: '₹3,000–8,000', ltv: '₹50,000–1,20,000', ltv_cac_ratio: '12:1', avg_order_value: '₹3,000/month', churn_rate: '2–3% monthly', payback_period: '3–4 months', context: '1.2 Lakh+ dental clinics in India; most use paper cards. Digital X-ray integration creates strong lock-in.' },
    competitors: [
      { name: 'Carestream Dental', type: 'MNC', city: 'Global', funding_raised: 'MNC', revenue_signal: 'Global leader in dental imaging software', differentiator: 'Imaging-first; expensive hardware bundle required' },
      { name: 'Dental Plus', type: 'Bootstrapped', city: 'Mumbai', funding_raised: 'Bootstrapped', revenue_signal: '2,000+ dental clinics in India', differentiator: 'India-specific dental chart formats; affordable pricing' },
      { name: 'Practo Ray', type: 'Funded', city: 'Bengaluru', funding_raised: '$200M+', revenue_signal: 'Generic clinic software used by dentists', differentiator: 'Patient discovery app bundled; dentists use for new patient acquisition' },
    ],
  },
  'auto-repair-shop-management': {
    google_trends_keyword: 'auto repair shop software India',
    unit_economics: { cac: '₹2,000–6,000', ltv: '₹35,000–90,000', ltv_cac_ratio: '12:1', avg_order_value: '₹2,500/month', churn_rate: '3–5% monthly', payback_period: '3–4 months', context: '4 Lakh+ auto repair shops in India; 95% undigitised. WhatsApp-based discovery drives initial adoption.' },
    competitors: [
      { name: 'myBillBook', type: 'Funded', city: 'Bengaluru', funding_raised: '₹30 Cr', revenue_signal: '10 Lakh+ businesses; generic billing tool', differentiator: 'Generic billing; no vehicle service history or job card features' },
      { name: 'Workshop 365', type: 'Bootstrapped', city: 'Pune', funding_raised: 'Bootstrapped', revenue_signal: '3,000+ workshops', differentiator: 'Auto-specific workflows; job card, parts inventory, and service reminder' },
      { name: 'Torque360', type: 'Funded', city: 'Global', funding_raised: '$2M', revenue_signal: '10,000+ workshops globally', differentiator: 'International product; no Indian tax compliance' },
    ],
  },
  'fleet-management-saas-logistics': {
    google_trends_keyword: 'GPS fleet tracking software India',
    unit_economics: { cac: '₹3,000–8,000 (includes GPS device install)', ltv: '₹40,000–1,00,000', ltv_cac_ratio: '10:1', avg_order_value: '₹299/vehicle/month + hardware', churn_rate: '3–4% monthly', payback_period: '3–5 months', context: 'AIS 140 mandate creates regulatory pull — vehicle cannot operate commercially without certified GPS from 2024.' },
    competitors: [
      { name: 'Fleetx', type: 'Funded', city: 'Gurugram', funding_raised: '₹70 Cr', revenue_signal: '50,000+ vehicles tracked', differentiator: 'AI-driven fuel analytics and driver scoring' },
      { name: 'TrackoBit', type: 'Funded', city: 'Jaipur', funding_raised: '₹25 Cr', revenue_signal: '10,000+ fleet clients', differentiator: 'Affordable pricing; strong in logistics and cab aggregators' },
      { name: 'MapmyIndia (CE Info)', type: 'Listed', city: 'New Delhi', funding_raised: 'Listed (₹3,000 Cr market cap)', revenue_signal: '20,000+ enterprise fleet clients', differentiator: 'Indian map data advantage; strong in defence and govt fleets' },
    ],
  },
  'b2b-procurement-platform-msmes': {
    google_trends_keyword: 'B2B procurement platform India',
    unit_economics: { cac: '₹10,000–30,000', ltv: '₹2,00,000–8,00,000', ltv_cac_ratio: '20:1', avg_order_value: '₹15,000/month', churn_rate: '2–3% monthly', payback_period: '4–6 months', context: 'B2B procurement SaaS has the highest LTV in vertical SaaS — once supplier catalogue is live, switching cost is enormous.' },
    competitors: [
      { name: 'Moglix', type: 'Funded', city: 'Noida', funding_raised: '$460M', revenue_signal: '₹5,000 Cr GMV, industrial procurement leader', differentiator: 'Marketplace + SaaS hybrid; very strong in manufacturing sector' },
      { name: 'OfBusiness', type: 'Funded', city: 'Gurugram', funding_raised: '$600M', revenue_signal: '₹15,000 Cr GMV, MSME credit bundled', differentiator: 'Credit-first procurement; MSMEs get working capital with order' },
      { name: 'IndiaMart', type: 'Listed', city: 'Noida', funding_raised: 'Listed (₹15,000 Cr market cap)', revenue_signal: '₹1,000 Cr revenue, 7 Cr buyers', differentiator: 'Discovery marketplace; not a SaaS procurement workflow tool' },
    ],
  },
  'warehouse-management-lite-d2c': {
    google_trends_keyword: 'warehouse management system for small business India',
    unit_economics: { cac: '₹3,000–8,000', ltv: '₹50,000–1,20,000', ltv_cac_ratio: '12:1', avg_order_value: '₹4,000/month', churn_rate: '3–5% monthly', payback_period: '3–4 months', context: 'D2C brands using WMS reduce pick-pack errors by 60% — strong ROI for brands fulfilling 200+ orders/day.' },
    competitors: [
      { name: 'Unicommerce', type: 'Listed', city: 'Gurugram', funding_raised: 'Listed', revenue_signal: '28,000+ sellers, 900 Mn orders/year processed', differentiator: 'Market leader; OMS + WMS bundled; trusted by top D2C brands' },
      { name: 'Increff', type: 'Funded', city: 'Bengaluru', funding_raised: '$10M', revenue_signal: '100+ fashion and lifestyle brands', differentiator: 'AI-driven inventory allocation; fashion-first WMS' },
      { name: 'EasyEcom', type: 'Funded', city: 'Bengaluru', funding_raised: '₹30 Cr', revenue_signal: '5,000+ sellers across Tier 1/2', differentiator: 'Multi-channel OMS + WMS; affordable entry pricing' },
    ],
  },
  'temple-religious-institution-management': {
    google_trends_keyword: 'temple management software India',
    unit_economics: { cac: '₹2,000–8,000', ltv: '₹30,000–80,000', ltv_cac_ratio: '12:1', avg_order_value: '₹3,000/month', churn_rate: '2–3% monthly', payback_period: '3–4 months', context: 'Religious institutions have very low churn — once donation management is digitised, they never go back to manual.' },
    competitors: [
      { name: 'Devotee', type: 'Bootstrapped', city: 'Bengaluru', funding_raised: 'Bootstrapped', revenue_signal: '500+ temples', differentiator: 'Online puja booking and prasad delivery for devotees' },
      { name: 'Srimandir (Jio)', type: 'MNC', city: 'Mumbai', funding_raised: 'Reliance backed', revenue_signal: '10 Mn+ app downloads', differentiator: 'Consumer-facing live darshan; no operations management' },
      { name: 'PayTM Donations', type: 'Listed', city: 'Noida', funding_raised: 'Listed', revenue_signal: 'Donation QR at 1 Lakh+ temples', differentiator: 'Payment-only; no institution management features' },
    ],
  },
  'construction-project-management-saas': {
    google_trends_keyword: 'construction project management app India',
    unit_economics: { cac: '₹5,000–15,000', ltv: '₹80,000–2,00,000', ltv_cac_ratio: '12:1', avg_order_value: '₹6,000/month per active project', churn_rate: '5–8% monthly (project-based)', payback_period: '2–3 months', context: 'Billing is per-project — seasonal revenue; annual subscriptions for large builders smooth revenue.' },
    competitors: [
      { name: 'Procore', type: 'Listed', city: 'US', funding_raised: 'Listed ($8Bn market cap)', revenue_signal: '$900M ARR; used by top Indian contractors', differentiator: 'Gold standard for large projects; $10,000+/year — unaffordable for SME builders' },
      { name: 'Fieldwire', type: 'Funded', city: 'US (acquired by Hilti)', funding_raised: 'Acquired', revenue_signal: 'Global, limited India penetration', differentiator: 'Field management-first; limited India regulatory support' },
      { name: 'Powerplay', type: 'Funded', city: 'Bengaluru', funding_raised: '₹50 Cr', revenue_signal: '2,000+ construction companies', differentiator: 'India-first; WhatsApp site updates + attendance tracking' },
    ],
  },
  'agriculture-input-marketplace-saas': {
    google_trends_keyword: 'agri input marketplace India',
    unit_economics: { cac: '₹5,000–15,000 (dealer acquisition)', ltv: '₹1,00,000–3,00,000', ltv_cac_ratio: '15:1', avg_order_value: '₹8,000/month SaaS + GMV commission', churn_rate: '2–3% monthly', payback_period: '4–6 months', context: 'Agri input dealers serve 200–500 farmers each; platform with dealer network gets 200x farmer reach vs. direct model.' },
    competitors: [
      { name: 'DeHaat', type: 'Funded', city: 'Patna', funding_raised: '$175M', revenue_signal: '1.5 Mn farmers, ₹2,000 Cr GMV', differentiator: 'Full-stack agri marketplace + advisory; market leader' },
      { name: 'AgroStar', type: 'Funded', city: 'Ahmedabad', funding_raised: '$112M', revenue_signal: '7 Mn farmers reached', differentiator: 'D2C agri inputs + digital advisory; strong in Maharashtra and Gujarat' },
      { name: 'Ninjacart', type: 'Funded', city: 'Bengaluru', funding_raised: '$350M', revenue_signal: '₹5,000 Cr GMV', differentiator: 'B2B produce marketplace; sourcing-first vs. input-first' },
    ],
  },
  'student-hostel-management-system': {
    google_trends_keyword: 'hostel management software India',
    unit_economics: { cac: '₹2,000–6,000', ltv: '₹35,000–90,000', ltv_cac_ratio: '12:1', avg_order_value: '₹2,500/month', churn_rate: '2–4% monthly', payback_period: '3–4 months', context: 'College hostels and private PGs have 10+ year lifecycles — low churn, strong word-of-mouth in the hostel community.' },
    competitors: [
      { name: 'Stanza Living', type: 'Funded', city: 'New Delhi', funding_raised: '$100M+', revenue_signal: 'Operator model; 70,000+ beds in 40 cities', differentiator: 'Operator, not SaaS — captive management tool only for own properties' },
      { name: 'Zolo', type: 'Funded', city: 'Bengaluru', funding_raised: '$90M', revenue_signal: '50,000+ beds', differentiator: 'Co-living operator; proprietary tech not licensed to third parties' },
      { name: 'Local PG management apps', type: 'Bootstrapped', city: 'Pan India', funding_raised: 'Bootstrapped', revenue_signal: 'Fragmented; 20+ small players each with < 1,000 clients', differentiator: 'No dominant independent SaaS player exists — genuine whitespace' },
    ],
  },

  // ── E-commerce ────────────────────────────────────────────────────────────
  'organic-natural-skincare-d2c': {
    google_trends_keyword: 'organic skincare brand India',
    unit_economics: { cac: '₹400–1,200', ltv: '₹4,000–12,000', ltv_cac_ratio: '8:1', avg_order_value: '₹850', churn_rate: '25–35% annually', payback_period: '2–3 months', context: 'Subscription customers show 3x LTV vs one-time buyers; Instagram-driven CAC is lowest for natural skincare.' },
    competitors: [
      { name: 'Mamaearth', type: 'Listed', city: 'Gurugram', funding_raised: 'Listed (₹15,000 Cr market cap)', revenue_signal: '₹2,000 Cr revenue FY24', differentiator: 'Market leader in natural personal care; strong offline distribution' },
      { name: 'Plum', type: 'Funded', city: 'Mumbai', funding_raised: '₹100 Cr', revenue_signal: '₹300 Cr ARR', differentiator: 'Vegan + cruelty-free positioning; strong millennial brand' },
      { name: 'Juicy Chemistry', type: 'Funded', city: 'Coimbatore', funding_raised: '₹30 Cr', revenue_signal: '₹60 Cr ARR', differentiator: 'COSMOS-certified organic; premium segment positioning' },
    ],
  },
  'mens-grooming-d2c-brand': {
    google_trends_keyword: 'men grooming products India',
    unit_economics: { cac: '₹350–1,000', ltv: '₹3,500–10,000', ltv_cac_ratio: '8:1', avg_order_value: '₹600', churn_rate: '30–40% annually', payback_period: '2–3 months', context: 'Subscription kit converts 25% of one-time buyers; YouTube review content drives lowest CAC in the category.' },
    competitors: [
      { name: 'The Man Company', type: 'Funded', city: 'Gurugram', funding_raised: '₹85 Cr', revenue_signal: '₹150 Cr ARR', differentiator: 'Premium men\'s grooming market pioneer; offline presence in 10,000+ stores' },
      { name: 'Bombay Shaving Company', type: 'Funded', city: 'New Delhi', funding_raised: '₹180 Cr', revenue_signal: '₹100 Cr ARR', differentiator: 'Grooming ritual positioning; strong in shaving and beard care' },
      { name: 'Ustraa', type: 'Funded', city: 'New Delhi', funding_raised: '₹50 Cr', revenue_signal: '₹80 Cr ARR', differentiator: 'Youth-centric; strong social media community' },
    ],
  },
  'sports-nutrition-supplements-d2c': {
    google_trends_keyword: 'whey protein India online',
    unit_economics: { cac: '₹500–1,500', ltv: '₹5,000–15,000', ltv_cac_ratio: '8:1', avg_order_value: '₹1,400', churn_rate: '20–30% annually', payback_period: '2–3 months', context: 'Gym goers repurchase every 30–45 days — protein is a consumable with one of the best repeat purchase cycles.' },
    competitors: [
      { name: 'MuscleBlaze', type: 'Funded', city: 'New Delhi', funding_raised: '₹80 Cr (part of HealthKart)', revenue_signal: '₹500 Cr ARR, market leader in India', differentiator: 'Trust and authenticity positioning; "Made in India" certification' },
      { name: 'Optimum Nutrition', type: 'MNC', city: 'US', funding_raised: 'MNC (Glanbia)', revenue_signal: 'Global leader; premium positioning in India', differentiator: 'Gold standard internationally; aspirational brand for gym beginners' },
      { name: 'Wellbeing Nutrition', type: 'Funded', city: 'New Delhi', funding_raised: '₹40 Cr', revenue_signal: '₹80 Cr ARR', differentiator: 'Plant-based and clean label positioning; premium price point' },
    ],
  },
  'lab-grown-diamond-jewellery-d2c': {
    google_trends_keyword: 'lab grown diamond jewellery India',
    unit_economics: { cac: '₹1,500–5,000', ltv: '₹25,000–80,000', ltv_cac_ratio: '12:1', avg_order_value: '₹18,000', churn_rate: 'Low — occasion-based repurchase', payback_period: '2–4 months', context: 'High-ticket purchase; Instagram + Google conversion funnel takes 3–5 touchpoints before purchase.' },
    competitors: [
      { name: 'Lightbox', type: 'MNC', city: 'US/Global', funding_raised: 'De Beers backed', revenue_signal: 'Global lab diamond brand; limited India presence', differentiator: 'De Beers heritage; premium positioning' },
      { name: 'Fiona Diamonds', type: 'Bootstrapped', city: 'Mumbai', funding_raised: 'Bootstrapped', revenue_signal: 'Early stage, 3,000+ customers', differentiator: 'First Indian D2C lab diamond brand; bridal focus' },
      { name: 'CaratLane', type: 'Funded', city: 'Chennai', funding_raised: '₹300 Cr (Tata backed)', revenue_signal: '₹1,000 Cr+ revenue', differentiator: 'Online + offline fine jewellery; now expanding into lab diamonds' },
    ],
  },
  'ethnic-wear-fusion-fashion-d2c': {
    google_trends_keyword: 'ethnic wear online India',
    unit_economics: { cac: '₹400–1,200', ltv: '₹5,000–15,000', ltv_cac_ratio: '8:1', avg_order_value: '₹1,200', churn_rate: '35–45% annually', payback_period: '2–4 months', context: 'Festive season (Oct–Jan) generates 50% of annual revenue; inventory planning is the key operational challenge.' },
    competitors: [
      { name: 'Manyavar', type: 'Listed', city: 'Kolkata', funding_raised: 'Listed (₹25,000 Cr market cap)', revenue_signal: '₹1,000 Cr+ revenue, offline dominant', differentiator: 'Men\'s ethnic wear leader; strong offline retail network' },
      { name: 'Fabindia', type: 'Listed', city: 'New Delhi', funding_raised: 'Listed', revenue_signal: '₹1,400 Cr revenue', differentiator: 'Khadi and natural fabric heritage; has both online and 300+ stores' },
      { name: 'Jaipur Kurti', type: 'Bootstrapped', city: 'Jaipur', funding_raised: 'Bootstrapped', revenue_signal: '₹200 Cr revenue', differentiator: 'D2C ethnic women\'s wear; strong on Meesho and Amazon' },
    ],
  },
  'mattress-sleep-products-d2c': {
    google_trends_keyword: 'mattress buy online India',
    unit_economics: { cac: '₹1,500–4,000', ltv: '₹8,000–20,000', ltv_cac_ratio: '5:1', avg_order_value: '₹12,000', churn_rate: 'Low — 8–10 year product lifecycle', payback_period: '3–5 months', context: 'One-time high-ticket purchase; LTV comes from referrals (3+ new customers referred per satisfied buyer).' },
    competitors: [
      { name: 'Wakefit', type: 'Funded', city: 'Bengaluru', funding_raised: '₹900 Cr', revenue_signal: '₹1,000 Cr revenue, market leader D2C mattress', differentiator: 'First-mover; 100-night trial built trust and defined category' },
      { name: 'Sleepyhead', type: 'Funded', city: 'Bengaluru', funding_raised: '₹50 Cr', revenue_signal: '₹200 Cr ARR', differentiator: 'Budget positioning at ₹7,000–12,000; younger audience' },
      { name: 'Sunday (by Duroflex)', type: 'Funded', city: 'Bengaluru', funding_raised: '₹50 Cr (Duroflex parent)', revenue_signal: '₹150 Cr ARR', differentiator: 'Memory foam technology heritage; premium positioning' },
    ],
  },
  'refurbished-electronics-marketplace': {
    google_trends_keyword: 'refurbished phone buy India',
    unit_economics: { cac: '₹300–900', ltv: '₹3,000–9,000', ltv_cac_ratio: '8:1', avg_order_value: '₹8,000', churn_rate: '30–40% annually', payback_period: '1–2 months', context: 'Category is growing 35% annually; trust from warranty and certified grading is primary purchase driver.' },
    competitors: [
      { name: 'Cashify', type: 'Funded', city: 'Gurugram', funding_raised: '₹450 Cr', revenue_signal: '₹1,500 Cr GMV, market leader', differentiator: 'Buyback + resell loop; large certified refurbished inventory' },
      { name: 'Togofogo', type: 'Funded', city: 'Mumbai', funding_raised: '₹20 Cr', revenue_signal: '₹300 Cr GMV', differentiator: 'Marketplace model; lower capex vs. inventory-owning Cashify' },
      { name: 'Amazon Renewed', type: 'MNC', city: 'Global', funding_raised: 'MNC', revenue_signal: 'Part of Amazon India; large selection', differentiator: 'Trust from Amazon brand; hard to out-trust on platform' },
    ],
  },
  'preowned-luxury-goods-marketplace': {
    google_trends_keyword: 'pre owned luxury bags India',
    unit_economics: { cac: '₹1,000–4,000', ltv: '₹20,000–60,000', ltv_cac_ratio: '12:1', avg_order_value: '₹35,000', churn_rate: '20–30% annually', payback_period: '2–3 months', context: 'Authentication fee (₹500–2,000) converts casual browsers to buyers; HNI segment shops 3–4x per year.' },
    competitors: [
      { name: 'LuxePolis', type: 'Funded', city: 'Mumbai', funding_raised: '₹20 Cr', revenue_signal: '₹50 Cr GMV', differentiator: 'Authentication-first; curated luxury resale pioneer in India' },
      { name: 'Confidential Couture', type: 'Bootstrapped', city: 'Delhi', funding_raised: 'Bootstrapped', revenue_signal: 'Instagram-led; ₹10 Cr GMV', differentiator: 'Instagram community trust; personalized service' },
      { name: 'Vestiaire Collective', type: 'Funded', city: 'Paris (global)', funding_raised: '$700M', revenue_signal: '$700M GMV globally', differentiator: 'Global luxury resale market leader; limited India-specific pricing' },
    ],
  },
  'artisan-coffee-roastery-d2c': {
    google_trends_keyword: 'specialty coffee India online',
    unit_economics: { cac: '₹400–1,200', ltv: '₹6,000–20,000', ltv_cac_ratio: '10:1', avg_order_value: '₹600', churn_rate: '20–30% annually', payback_period: '2–3 months', context: 'Subscription converts 30% of one-time buyers; coffee enthusiast community has high NPS and referral rate.' },
    competitors: [
      { name: 'Blue Tokai', type: 'Funded', city: 'New Delhi', funding_raised: '₹120 Cr', revenue_signal: '₹100 Cr ARR, specialty coffee pioneer', differentiator: 'Estate-to-cup story; 50+ cafes + D2C combined' },
      { name: 'Subko', type: 'Funded', city: 'Mumbai', funding_raised: '₹30 Cr', revenue_signal: '₹40 Cr ARR', differentiator: 'Hyper-premium single origin; strong in affluent urban segment' },
      { name: 'Fresh Roasted Coffee (Nescafe)', type: 'MNC', city: 'Global', funding_raised: 'MNC', revenue_signal: 'Commodity brand with massive scale', differentiator: 'Scale and distribution; not competing in specialty segment' },
    ],
  },
  'functional-foods-superfoods-d2c': {
    google_trends_keyword: 'superfood brand India',
    unit_economics: { cac: '₹500–1,500', ltv: '₹6,000–18,000', ltv_cac_ratio: '9:1', avg_order_value: '₹900', churn_rate: '25–35% annually', payback_period: '2–3 months', context: 'Health-focused consumers have 40% higher LTV than impulse buyers; influencer seeding drives 60% of initial trial.' },
    competitors: [
      { name: 'Farmley', type: 'Funded', city: 'New Delhi', funding_raised: '₹80 Cr', revenue_signal: '₹200 Cr ARR, dry fruits and nuts leader', differentiator: 'Dry fruits and superfoods at accessible price; quick commerce focus' },
      { name: 'True Elements', type: 'Funded', city: 'Pune', funding_raised: '₹50 Cr', revenue_signal: '₹100 Cr ARR', differentiator: 'Clean-label breakfast cereals and snacks; acquired by Marico' },
      { name: 'Happilo', type: 'Funded', city: 'Bengaluru', funding_raised: '₹150 Cr', revenue_signal: '₹250 Cr ARR', differentiator: 'Premium nuts and trail mix; strong offline distribution' },
    ],
  },
  'baby-toddler-organic-care-d2c': {
    google_trends_keyword: 'organic baby products India',
    unit_economics: { cac: '₹600–1,800', ltv: '₹10,000–30,000', ltv_cac_ratio: '12:1', avg_order_value: '₹1,100', churn_rate: '15–25% annually', payback_period: '2–3 months', context: 'Parents spend 3x more on baby products than adult equivalents; trust won in first 3 months keeps customer for 3 years.' },
    competitors: [
      { name: 'Mamaearth Baby', type: 'Listed', city: 'Gurugram', funding_raised: 'Listed', revenue_signal: 'Baby range is 20% of Mamaearth\'s ₹2,000 Cr revenue', differentiator: 'Mamaearth brand extension; distribution reach of 1 Lakh+ retail outlets' },
      { name: 'The Moms Co.', type: 'Funded', city: 'New Delhi', funding_raised: '₹90 Cr', revenue_signal: '₹100 Cr ARR', differentiator: 'Australia-compliant formulations; strong in premium maternity and baby' },
      { name: 'Himalaya Baby', type: 'Bootstrapped', city: 'Bengaluru', funding_raised: 'Bootstrapped', revenue_signal: 'Market leader in pharmacy channel; ₹600 Cr baby range', differentiator: 'Pharmacy trust; Ayurvedic credibility for baby care' },
    ],
  },
  'indian-snacks-subscription-box': {
    google_trends_keyword: 'Indian snacks subscription box',
    unit_economics: { cac: '₹300–900', ltv: '₹5,000–12,000', ltv_cac_ratio: '10:1', avg_order_value: '₹499/month subscription', churn_rate: '12–18% monthly', payback_period: '2–3 months', context: 'Subscription snack boxes see 60% churn in 6 months — curation freshness and novelty are key retention drivers.' },
    competitors: [
      { name: 'Snackible', type: 'Funded', city: 'Mumbai', funding_raised: '₹10 Cr', revenue_signal: '50,000+ subscribers at peak', differentiator: 'Healthy snack subscription pioneer in India' },
      { name: 'Haldirams Snacks', type: 'Bootstrapped', city: 'New Delhi', funding_raised: 'Bootstrapped', revenue_signal: '₹10,000 Cr revenue — snack market incumbent', differentiator: 'Mass market brand; not a subscription model' },
      { name: 'Naagin Sauce', type: 'Funded', city: 'Bengaluru', funding_raised: '₹5 Cr', revenue_signal: '₹20 Cr ARR', differentiator: 'Hot sauce niche; D2C community-driven brand' },
    ],
  },
  'personalised-jewellery-d2c': {
    google_trends_keyword: 'personalised name jewellery India',
    unit_economics: { cac: '₹400–1,200', ltv: '₹6,000–18,000', ltv_cac_ratio: '10:1', avg_order_value: '₹1,500', churn_rate: '30–40% annually', payback_period: '2–3 months', context: 'Gifting occasions (Valentine\'s, birthdays) drive 60% of orders — strong seasonal marketing ROI.' },
    competitors: [
      { name: 'Melorra', type: 'Funded', city: 'Bengaluru', funding_raised: '₹330 Cr', revenue_signal: '₹300 Cr ARR', differentiator: 'Everyday fine jewellery; subscription-like repeat purchase model' },
      { name: 'Giva', type: 'Funded', city: 'Bengaluru', funding_raised: '₹225 Cr', revenue_signal: '₹300 Cr ARR', differentiator: 'Sterling silver at accessible price; strong D2C brand' },
      { name: 'Voylla', type: 'Funded', city: 'Jaipur', funding_raised: '₹50 Cr', revenue_signal: '₹100 Cr GMV', differentiator: 'Fashion jewellery at ₹200–800; volume-first positioning' },
    ],
  },
  'smart-home-devices-indian-homes': {
    google_trends_keyword: 'smart home devices India',
    unit_economics: { cac: '₹600–2,000', ltv: '₹8,000–25,000', ltv_cac_ratio: '8:1', avg_order_value: '₹3,500 (multi-device kits)', churn_rate: '15–25% annually (ecosystem lock-in reduces churn)', payback_period: '3–5 months', context: 'First smart device in a home leads to 3x repurchase for additional devices — ecosystem expansion drives LTV.' },
    competitors: [
      { name: 'Atomberg', type: 'Funded', city: 'Mumbai', funding_raised: '₹300 Cr', revenue_signal: '₹800 Cr ARR, smart fan market leader', differentiator: 'Single product mastery before ecosystem expansion — replicable model' },
      { name: 'Wipro Lighting', type: 'Listed', city: 'Mumbai', funding_raised: 'Listed', revenue_signal: 'Smart lighting division ₹500 Cr', differentiator: 'B2B commercial focus; brand trust for enterprise smart building' },
      { name: 'Amazon Echo / Google Nest', type: 'MNC', city: 'Global', funding_raised: 'MNC', revenue_signal: 'Global market leaders with India distribution', differentiator: 'Ecosystem lock-in; hard to displace for voice control and automation hub' },
    ],
  },
  'reusable-menstrual-products-d2c': {
    google_trends_keyword: 'menstrual cup India',
    unit_economics: { cac: '₹300–900', ltv: '₹4,000–12,000', ltv_cac_ratio: '10:1', avg_order_value: '₹700', churn_rate: '20–30% annually', payback_period: '2–3 months', context: 'Strong community advocacy — 40% of sales from referrals; social proof content drives lowest CAC in the category.' },
    competitors: [
      { name: 'Sirona', type: 'Funded', city: 'New Delhi', funding_raised: '₹100 Cr', revenue_signal: '₹150 Cr ARR, FemTech pioneer', differentiator: 'Broad women\'s intimate care portfolio; distribution in 30,000+ pharmacies' },
      { name: 'Pee Safe', type: 'Funded', city: 'New Delhi', funding_raised: '₹75 Cr', revenue_signal: '₹100 Cr ARR', differentiator: 'Travel hygiene → period care expansion; strong offline+online' },
      { name: 'Boondh', type: 'Bootstrapped', city: 'Chennai', funding_raised: 'Bootstrapped', revenue_signal: 'Niche; 50,000+ cups sold', differentiator: 'Period equity mission; community-led growth' },
    ],
  },
  'senior-citizen-care-products-d2c': {
    google_trends_keyword: 'senior citizen products India',
    unit_economics: { cac: '₹600–2,000', ltv: '₹8,000–25,000', ltv_cac_ratio: '10:1', avg_order_value: '₹1,200', churn_rate: '15–25% annually', payback_period: '3–4 months', context: 'Adult children (30–45 age) are primary buyers for parents — Google search intent-driven CAC is high but LTV justifies it.' },
    competitors: [
      { name: 'Dignity LifeCare', type: 'Bootstrapped', city: 'Mumbai', funding_raised: 'Bootstrapped', revenue_signal: '₹30 Cr ARR', differentiator: 'India\'s first senior care D2C brand; strong in incontinence and mobility products' },
      { name: 'Healthgenie', type: 'Bootstrapped', city: 'New Delhi', funding_raised: 'Bootstrapped', revenue_signal: '₹50 Cr GMV on Amazon India', differentiator: 'Medical equipment + senior products; Amazon marketplace distribution' },
      { name: 'MedikabazaarMedical Products', type: 'Funded', city: 'Mumbai', funding_raised: '₹400 Cr', revenue_signal: 'B2B medical supply leader; limited D2C', differentiator: 'B2B hospital supply; different channel from D2C senior care' },
    ],
  },
  'handloom-handcraft-d2c': {
    google_trends_keyword: 'handloom saree online India',
    unit_economics: { cac: '₹500–1,500', ltv: '₹8,000–25,000', ltv_cac_ratio: '10:1', avg_order_value: '₹2,500', churn_rate: '25–35% annually', payback_period: '2–4 months', context: 'Festive season (Sep–Nov) drives 55% of annual revenue; Instagram Reels showing weaving process drive organic CAC down 40%.' },
    competitors: [
      { name: 'Fabindia', type: 'Listed', city: 'New Delhi', funding_raised: 'Listed', revenue_signal: '₹1,400 Cr revenue, 300+ stores', differentiator: 'Omnichannel pioneer; 50-year crafts brand trust' },
      { name: 'Jaypore', type: 'Funded', city: 'New Delhi', funding_raised: '₹50 Cr (acquired by Aditya Birla)', revenue_signal: '₹100 Cr ARR', differentiator: 'Craft storytelling + curation; acquired by Aditya Birla for their crafts strategy' },
      { name: 'Craftsvilla', type: 'Funded', city: 'Mumbai', funding_raised: '₹180 Cr', revenue_signal: 'Marketplace model; 4 Mn products', differentiator: 'Marketplace for ethnic wear and crafts; long tail selection advantage' },
    ],
  },
  'custom-corporate-gifting-platform': {
    google_trends_keyword: 'corporate gifting vendor India',
    unit_economics: { cac: '₹5,000–20,000 (B2B)', ltv: '₹1,00,000–5,00,000', ltv_cac_ratio: '20:1', avg_order_value: '₹80,000 per order', churn_rate: '15–25% annually', payback_period: '2–3 months', context: 'Festival and year-end corporate gifting has ₹2,000 Cr+ market; repeat order rate 70% once vendor empanelled.' },
    competitors: [
      { name: 'Offerdesign (IGP)', type: 'Funded', city: 'Bengaluru', funding_raised: '₹60 Cr', revenue_signal: 'Online gifting + corporate, ₹200 Cr GMV', differentiator: 'Consumer gifting + corporate division; brand trust' },
      { name: 'Carve Niche', type: 'Bootstrapped', city: 'Mumbai', funding_raised: 'Bootstrapped', revenue_signal: 'B2B corporate gifting specialist, ₹50 Cr', differentiator: 'Pure B2B gifting focus; strong in BFSI and IT sector clients' },
      { name: 'The Gift Studio (Myntra)', type: 'Funded', city: 'Bengaluru', funding_raised: 'Myntra/Flipkart backed', revenue_signal: 'Growing corporate gifting division', differentiator: 'Fashion gifting leverage; brand-licensed products advantage' },
    ],
  },
  'indian-board-games-educational-toys': {
    google_trends_keyword: 'educational board games India',
    unit_economics: { cac: '₹400–1,200', ltv: '₹4,000–12,000', ltv_cac_ratio: '8:1', avg_order_value: '₹799', churn_rate: '30–40% annually', payback_period: '2–3 months', context: 'School supply channel doubles AOV vs. D2C; gifting season (Oct–Dec) drives 50% of annual orders.' },
    competitors: [
      { name: 'Skillmatics', type: 'Funded', city: 'Mumbai', funding_raised: '₹150 Cr', revenue_signal: '₹200 Cr ARR, 50+ countries', differentiator: 'Activity and skill games; strong US and India D2C distribution' },
      { name: 'Ekdali', type: 'Bootstrapped', city: 'Bengaluru', funding_raised: 'Bootstrapped', revenue_signal: '₹20 Cr ARR', differentiator: 'Indian heritage games and maps; niche cultural positioning' },
      { name: 'Lego India', type: 'MNC', city: 'Global', funding_raised: 'MNC', revenue_signal: 'Growing in India; ₹200 Cr India revenue', differentiator: 'Global brand; premium pricing leaves affordable Indian heritage segment open' },
    ],
  },
  'vernacular-content-merchandise': {
    google_trends_keyword: 'vernacular regional language merchandise India',
    unit_economics: { cac: '₹200–600', ltv: '₹2,500–8,000', ltv_cac_ratio: '8:1', avg_order_value: '₹499', churn_rate: '35–45% annually', payback_period: '1–2 months', context: 'Instagram and regional influencer seeding drives near-zero CAC at launch; community identity drives repeat gifting.' },
    competitors: [
      { name: 'The Souled Store', type: 'Funded', city: 'Mumbai', funding_raised: '₹150 Cr', revenue_signal: '₹300 Cr ARR, pop culture merchandise leader', differentiator: 'Licensed Bollywood and international IP; not regional language niche' },
      { name: 'Bewakoof', type: 'Funded', city: 'Mumbai', funding_raised: '₹200 Cr', revenue_signal: '₹350 Cr ARR', differentiator: 'Youth fashion + quirky quotes; generic not regional-language specific' },
      { name: 'Regional language local brands', type: 'Bootstrapped', city: 'Pan India', funding_raised: 'Bootstrapped', revenue_signal: 'Dozens of Instagram-first shops with ₹1–5 Cr each', differentiator: 'Fragmented; no brand at scale in this specific niche' },
    ],
  },
  'specialty-indian-condiments-export': {
    google_trends_keyword: 'Indian spices export brand',
    unit_economics: { cac: '₹2,000–8,000 (distributor acquisition)', ltv: '₹1,00,000–5,00,000', ltv_cac_ratio: '25:1', avg_order_value: '₹3,000 D2C / ₹80,000 distributor', churn_rate: '10–15% annually', payback_period: '3–6 months', context: 'Export accounts show 10x LTV vs domestic D2C; spices board marketing support reduces international buyer CAC.' },
    competitors: [
      { name: 'Catch Spices (DS Group)', type: 'Bootstrapped', city: 'Noida', funding_raised: 'Bootstrapped', revenue_signal: '₹800 Cr revenue, export presence in 20 countries', differentiator: 'Volume spice brand; commodity positioning, not specialty' },
      { name: 'Spice Jet Foods', type: 'Bootstrapped', city: 'Bengaluru', funding_raised: 'Bootstrapped', revenue_signal: 'Early stage export brand', differentiator: 'Direct sourcing from farm clusters; similar model' },
      { name: 'Diaspora Co.', type: 'Funded', city: 'California (Indian origin)', funding_raised: '$2M', revenue_signal: 'US specialty spice brand with India sourcing', differentiator: 'Single-origin Indian spices sold in US at premium — the model to replicate' },
    ],
  },
  'ergonomic-home-office-furniture-d2c': {
    google_trends_keyword: 'ergonomic chair India work from home',
    unit_economics: { cac: '₹800–2,500', ltv: '₹12,000–35,000', ltv_cac_ratio: '10:1', avg_order_value: '₹15,000', churn_rate: 'Low — 5–8 year product lifecycle', payback_period: '3–5 months', context: 'Post-COVID WFH shift permanently expanded market; referral rate high as office setups are visible on video calls.' },
    competitors: [
      { name: 'Featherlite', type: 'Bootstrapped', city: 'Bengaluru', funding_raised: 'Bootstrapped', revenue_signal: '₹500 Cr revenue, office furniture leader', differentiator: 'B2B corporate furniture market leader; transitioning to D2C' },
      { name: 'Ergos Chair', type: 'Bootstrapped', city: 'Bengaluru', funding_raised: 'Bootstrapped', revenue_signal: '₹30 Cr ARR', differentiator: 'Ergonomic D2C specialist; physiotherapist recommended positioning' },
      { name: 'Godrej Interio', type: 'Listed', city: 'Mumbai', funding_raised: 'Listed', revenue_signal: '₹2,000 Cr revenue', differentiator: 'Trusted brand; moving into ergonomic WFH products' },
    ],
  },
  'premium-pet-food-d2c': {
    google_trends_keyword: 'premium dog food India',
    unit_economics: { cac: '₹500–1,500', ltv: '₹10,000–30,000', ltv_cac_ratio: '12:1', avg_order_value: '₹1,200/month subscription', churn_rate: '10–15% monthly', payback_period: '2–3 months', context: 'Pet parents in metros have 95%+ repeat purchase rate for food they trust; vet recommendation is the highest-converting acquisition channel.' },
    competitors: [
      { name: 'Heads Up For Tails', type: 'Funded', city: 'New Delhi', funding_raised: '₹300 Cr', revenue_signal: '₹200 Cr ARR', differentiator: 'Omnichannel premium pet brand; 100+ stores + D2C' },
      { name: 'Drools', type: 'Funded', city: 'New Delhi', funding_raised: '₹200 Cr', revenue_signal: '₹400 Cr ARR, mass-premium market', differentiator: 'Made-in-India premium kibble; veterinary distribution channel' },
      { name: 'Royal Canin', type: 'MNC', city: 'France (Mars)', funding_raised: 'MNC', revenue_signal: '₹600 Cr India revenue', differentiator: 'Breed-specific vet-recommended formulations; vet channel dominant' },
    ],
  },
  'sustainable-packaging-alternatives-d2c': {
    google_trends_keyword: 'eco friendly packaging India',
    unit_economics: { cac: '₹3,000–10,000 (B2B)', ltv: '₹80,000–3,00,000', ltv_cac_ratio: '20:1', avg_order_value: '₹25,000/order', churn_rate: '10–15% annually', payback_period: '3–5 months', context: 'B2B D2C brand customers reorder quarterly; EPR mandate drives urgency that converts cold leads without persuasion.' },
    competitors: [
      { name: 'Uflex', type: 'Listed', city: 'Noida', funding_raised: 'Listed', revenue_signal: '₹12,000 Cr revenue, packaging giant', differentiator: 'Scale and breadth; not focused on eco/sustainable segment' },
      { name: 'EcoMile', type: 'Bootstrapped', city: 'Bengaluru', funding_raised: 'Bootstrapped', revenue_signal: '₹20 Cr ARR', differentiator: 'Compostable packaging specialist for D2C brands' },
      { name: 'Pakka (Yash Papers)', type: 'Listed', city: 'Lucknow', funding_raised: 'Listed', revenue_signal: '₹450 Cr revenue, sustainable packaging leader', differentiator: 'Bagasse-based packaging; sugar cane pulp plates and containers' },
    ],
  },
  'vintage-antique-online-marketplace': {
    google_trends_keyword: 'antique marketplace India online',
    unit_economics: { cac: '₹800–3,000', ltv: '₹15,000–50,000', ltv_cac_ratio: '12:1', avg_order_value: '₹8,000', churn_rate: '25–35% annually', payback_period: '2–4 months', context: 'HNI collector segment spends ₹2–10 Lakh/year; authentication service builds trust and justifies 25% platform commission.' },
    competitors: [
      { name: 'OldDost', type: 'Bootstrapped', city: 'Jaipur', funding_raised: 'Bootstrapped', revenue_signal: 'Early stage antique marketplace', differentiator: 'Furniture and home decor antiques focus; WhatsApp-driven sales' },
      { name: 'Ebay India', type: 'MNC', city: 'Global', funding_raised: 'MNC', revenue_signal: 'C2C classifieds; limited antique curation', differentiator: 'Global liquidity; no Indian provenance documentation' },
      { name: 'Christie\'s / Sotheby\'s India', type: 'MNC', city: 'Mumbai', funding_raised: 'MNC', revenue_signal: 'High-end auction; ₹50 Lakh+ lots', differentiator: 'Ultra-premium auction; no mid-market ₹5,000–2 Lakh antiques coverage' },
    ],
  },
}

async function run() {
  const slugs = Object.keys(DATA)
  console.log(`Seeding depth data for ${slugs.length} ideas...`)
  let ok = 0, skip = 0

  for (let i = 0; i < slugs.length; i += 10) {
    const batch = slugs.slice(i, i + 10)
    const tx = client.transaction()

    for (const slug of batch) {
      const d = DATA[slug]
      const id = `idea-${slug}`

      // Check if already has depth data
      const existing = await client.fetch(`*[_id == $id][0].google_trends_keyword`, { id })
      if (existing) { skip++; continue }

      const competitors = (d.competitors || []).map(c => ({ ...c, _type: 'object', _key: k() }))

      tx.patch(id, p => p.setIfMissing({
        google_trends_keyword: d.google_trends_keyword,
        unit_economics: d.unit_economics,
        competitors,
      }))
      ok++
    }

    await tx.commit()
    process.stdout.write(`\r  ${Math.min(i + 10, slugs.length)} / ${slugs.length}`)
  }

  console.log(`\nDone. Updated: ${ok}, Skipped (already had data): ${skip}`)
}

run().catch(console.error)
