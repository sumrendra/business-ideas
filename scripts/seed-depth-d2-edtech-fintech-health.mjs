import { createClient } from '@sanity/client'
import { randomBytes } from 'crypto'
import { readFileSync } from 'fs'
import { homedir } from 'os'

const cfg = JSON.parse(readFileSync(`${homedir()}/.config/sanity/config.json`, 'utf8'))
const client = createClient({ projectId: '5p3rso81', dataset: 'production', apiVersion: '2024-01-01', token: cfg.authToken, useCdn: false })

const k = () => randomBytes(6).toString('hex')

const DATA = {
  // ── EdTech ─────────────────────────────────────────────────────────────────
  'blue-collar-skill-upskilling-platform': {
    google_trends_keyword: 'skill training for workers India',
    unit_economics: { cac: 800, ltv: 4500, ltv_cac_ratio: 5.6, avg_order_value: 1500, churn_rate: 35, payback_period: 6, context: 'Batch course fees ₹1,500–₹3,000; corporate B2B contracts lower CAC significantly.' },
    competitors: [
      { name: 'Skill India (Govt)', type: 'Government', description: 'Free government skilling portal; lacks job placement accountability.' },
      { name: 'iXR Labs', type: 'Startup', description: 'VR-based skill training for ITI students and blue-collar workers.' },
      { name: 'Craftsvilla Skill', type: 'Startup', description: 'Artisan and vocational upskilling with marketplace integration.' },
    ],
  },
  'ca-cma-exam-prep-platform': {
    google_trends_keyword: 'CA exam preparation online India',
    unit_economics: { cac: 1200, ltv: 9000, ltv_cac_ratio: 7.5, avg_order_value: 4500, churn_rate: 20, payback_period: 4, context: 'Students pay ₹4,000–₹8,000 per exam level; 3–4 attempts per candidate on average.' },
    competitors: [
      { name: 'ICAI e-Learning', type: 'Government', description: 'Official CA institute content; dated interface, no adaptive testing.' },
      { name: 'Vsmart Academy', type: 'Startup', description: 'Popular offline+online CA coaching; strong brand but high price.' },
      { name: 'Unacademy CA', type: 'Large Player', description: 'Backed by large edtech; broad but less CA-specific depth.' },
    ],
  },
  'cooking-culinary-skills-platform': {
    google_trends_keyword: 'online cooking classes India',
    unit_economics: { cac: 600, ltv: 3200, ltv_cac_ratio: 5.3, avg_order_value: 1200, churn_rate: 40, payback_period: 5, context: 'Monthly subscription ₹399–₹799 or per-course ₹800–₹2,000; hobbyists churn seasonally.' },
    competitors: [
      { name: 'Udemy Cooking', type: 'Global Platform', description: 'Western recipes dominate; lacks Indian regional cuisine depth.' },
      { name: 'Cookd', type: 'Startup', description: 'Recipe app, not structured courses; no live classes or certification.' },
      { name: 'Chef at Home', type: 'Local Startup', description: 'In-person cooking workshops in metro cities.' },
    ],
  },
  'corporate-learning-management-system': {
    google_trends_keyword: 'corporate LMS India',
    unit_economics: { cac: 25000, ltv: 360000, ltv_cac_ratio: 14.4, avg_order_value: 120000, churn_rate: 12, payback_period: 10, context: 'Annual SaaS contracts ₹1–5L per company; enterprise deals 2–5 year lock-in.' },
    competitors: [
      { name: 'Docebo', type: 'Global SaaS', description: 'Market leader; expensive for Indian SMEs and MNCs.' },
      { name: 'Disprz', type: 'Indian Startup', description: 'India-built LMS for frontline workers; Series B funded.' },
      { name: 'TalentLMS', type: 'Global SaaS', description: 'Mid-market LMS; no India-specific compliance or language support.' },
    ],
  },
  'creative-arts-design-education-platform': {
    google_trends_keyword: 'graphic design course online India',
    unit_economics: { cac: 900, ltv: 6000, ltv_cac_ratio: 6.7, avg_order_value: 2500, churn_rate: 28, payback_period: 5, context: 'Certificate courses ₹2,000–₹5,000; portfolio showcases drive organic referrals.' },
    competitors: [
      { name: 'Canva Design School', type: 'Free Platform', description: 'Free but not structured for career transition.' },
      { name: 'Designerrs Academy', type: 'Indian Startup', description: 'UX/UI bootcamp; limited to design only.' },
      { name: 'Skillshare', type: 'Global Platform', description: 'Creative courses in English; no India-specific design trends.' },
    ],
  },
  'digital-literacy-senior-citizens': {
    google_trends_keyword: 'digital literacy for seniors India',
    unit_economics: { cac: 500, ltv: 3600, ltv_cac_ratio: 7.2, avg_order_value: 1800, churn_rate: 22, payback_period: 4, context: 'Monthly subscription ₹299 or one-time workshop ₹999; family gifting drives LTV.' },
    competitors: [
      { name: 'Senior World', type: 'NGO/Startup', description: 'Offline classes for seniors; limited digital reach.' },
      { name: 'Elders Connect', type: 'Startup', description: 'Social platform for seniors; not focused on learning.' },
      { name: 'Helpage India', type: 'NGO', description: 'Welfare programs; not tech education.' },
    ],
  },
  'early-childhood-learning-platform': {
    google_trends_keyword: 'online preschool India',
    unit_economics: { cac: 1100, ltv: 12000, ltv_cac_ratio: 10.9, avg_order_value: 3000, churn_rate: 18, payback_period: 5, context: 'Annual subscription ₹3,000–₹6,000; parents sticky for 3–4 years through kindergarten.' },
    competitors: [
      { name: 'Flintobox', type: 'Indian Startup', description: 'Physical activity kits + digital content; strong brand.' },
      { name: 'HelloKid', type: 'Startup', description: 'Live kindergarten sessions; limited vernacular coverage.' },
      { name: 'BYJU\'s Early Learn', type: 'Large Player', description: 'Tablet-based learning for 3–8 year olds.' },
    ],
  },
  'financial-literacy-for-youth': {
    google_trends_keyword: 'personal finance for students India',
    unit_economics: { cac: 400, ltv: 2500, ltv_cac_ratio: 6.3, avg_order_value: 800, churn_rate: 45, payback_period: 4, context: 'Freemium with ₹499–₹999 premium; short ARPU window before graduation.' },
    competitors: [
      { name: 'Finshots', type: 'Media/Startup', description: 'Finance newsletter; no structured courses.' },
      { name: 'Jupiter Money', type: 'Fintech', description: 'Bank app with spending insights, not education.' },
      { name: 'Investo (app)', type: 'Startup', description: 'Gamified finance learning; early stage.' },
    ],
  },
  'gate-govt-exam-prep-platform': {
    google_trends_keyword: 'GATE exam preparation 2025',
    unit_economics: { cac: 1000, ltv: 7500, ltv_cac_ratio: 7.5, avg_order_value: 2500, churn_rate: 25, payback_period: 5, context: 'Annual subscriptions ₹2,000–₹5,000; UPSC/SSC cross-sell extends LTV.' },
    competitors: [
      { name: 'BYJU\'s Exam Prep', type: 'Large Player', description: 'Dominant in govt exam prep; expensive, high churn post-result.' },
      { name: 'Testbook', type: 'Indian Startup', description: 'Series B; popular for SSC/Railway; strong mock tests.' },
      { name: 'GradeUp (Unacademy)', type: 'Large Player', description: 'Part of Unacademy; GATE-specific content available.' },
    ],
  },
  'interview-prep-mock-interview-platform': {
    google_trends_keyword: 'mock interview platform India',
    unit_economics: { cac: 1500, ltv: 8000, ltv_cac_ratio: 5.3, avg_order_value: 3000, churn_rate: 30, payback_period: 6, context: 'Per-session ₹500–₹1,500 or bundle ₹3,000; strong referral from placed candidates.' },
    competitors: [
      { name: 'Pramp', type: 'Global Platform', description: 'Peer-to-peer interviews; US-focused, no India mock scenarios.' },
      { name: 'Interviewing.io', type: 'Global Platform', description: 'Anonymous peer interviews; expensive for Indian budgets.' },
      { name: 'Scaler (mock)', type: 'Indian Startup', description: 'Bundled in bootcamp; not standalone.' },
    ],
  },
  'k12-homework-help-ai-platform': {
    google_trends_keyword: 'AI homework help for students India',
    unit_economics: { cac: 700, ltv: 5400, ltv_cac_ratio: 7.7, avg_order_value: 1800, churn_rate: 30, payback_period: 5, context: 'Monthly plan ₹299–₹599; sticky for full academic year, churns at grade change.' },
    competitors: [
      { name: 'Doubtnut', type: 'Indian Startup', description: 'OCR-based doubt solving; strong for NCERT; Series B.' },
      { name: 'Photomath', type: 'Global App', description: 'Math-focused; no Hindi/regional language support.' },
      { name: 'BYJU\'s', type: 'Large Player', description: 'Comprehensive but expensive; losing market share.' },
    ],
  },
  'k12-tutoring-competitive-exams': {
    google_trends_keyword: 'online tuition for class 10 India',
    unit_economics: { cac: 1500, ltv: 14400, ltv_cac_ratio: 9.6, avg_order_value: 3600, churn_rate: 15, payback_period: 6, context: 'Monthly fee ₹800–₹1,200 per subject; 3–4 subjects common, 3-year retention.' },
    competitors: [
      { name: 'Vedantu', type: 'Indian Startup', description: 'Live online tuition; has scaled but burning cash.' },
      { name: 'Toppr', type: 'Indian Startup', description: 'Acquired by BYJU\'s; adaptive learning platform.' },
      { name: 'Local tuition centers', type: 'Unorganised', description: 'Dominant in Tier 2/3; no digital content.' },
    ],
  },
  'language-learning-platform': {
    google_trends_keyword: 'learn English speaking online India',
    unit_economics: { cac: 800, ltv: 5600, ltv_cac_ratio: 7.0, avg_order_value: 2000, churn_rate: 32, payback_period: 5, context: 'Monthly ₹399 or course pack ₹1,500–₹3,000; English + regional language combos boost LTV.' },
    competitors: [
      { name: 'Duolingo', type: 'Global App', description: 'Gamified; weak on spoken practice and Indian accents.' },
      { name: 'Enguru', type: 'Indian Startup', description: 'English speaking for job seekers; voice-first app.' },
      { name: 'Learnyst', type: 'Indian Platform', description: 'White-label course platform, not a language app itself.' },
    ],
  },
  'legal-education-bar-exam-prep': {
    google_trends_keyword: 'CLAT preparation online India',
    unit_economics: { cac: 1200, ltv: 8000, ltv_cac_ratio: 6.7, avg_order_value: 3500, churn_rate: 22, payback_period: 5, context: 'CLAT + judiciary exam bundles ₹3,000–₹7,000; LLM aspirants add second cohort.' },
    competitors: [
      { name: 'CLATapult', type: 'Indian Startup', description: 'Popular offline CLAT coaching brand going online.' },
      { name: 'LawSikho', type: 'Indian Startup', description: 'Post-graduation legal skills; strong LinkedIn presence.' },
      { name: 'Unacademy Law', type: 'Large Player', description: 'Part of Unacademy; growing CLAT vertical.' },
    ],
  },
  'music-education-platform-india': {
    google_trends_keyword: 'online music classes India',
    unit_economics: { cac: 700, ltv: 5000, ltv_cac_ratio: 7.1, avg_order_value: 1500, churn_rate: 30, payback_period: 5, context: 'Monthly lessons ₹800–₹2,000 per instrument; multi-instrument households have high LTV.' },
    competitors: [
      { name: 'ipassio', type: 'Indian Startup', description: 'Live 1:1 music lessons; strong for Carnatic/Hindustani.' },
      { name: 'Yousician', type: 'Global App', description: 'Gamified guitar/piano; no Indian classical or regional content.' },
      { name: 'Furtados', type: 'Retail/Startup', description: 'Instrument store with attached classes; offline-first.' },
    ],
  },
  'neet-medical-entrance-preparation': {
    google_trends_keyword: 'NEET preparation online 2025',
    unit_economics: { cac: 2000, ltv: 18000, ltv_cac_ratio: 9.0, avg_order_value: 6000, churn_rate: 15, payback_period: 8, context: 'Annual crash course ₹5,000–₹10,000; dropper batch repeat subscribers stay 2 years.' },
    competitors: [
      { name: 'Allen Online', type: 'Large Player', description: 'Kota giant going digital; massive brand trust in NEET.' },
      { name: 'Aakash by BYJU\'s', type: 'Large Player', description: 'Merger of two giants; offline+online hybrid dominant.' },
      { name: 'Vedantu NEET', type: 'Indian Startup', description: 'Live lectures + DPPs; losing ground to Aakash.' },
    ],
  },
  'senior-professional-upskilling': {
    google_trends_keyword: 'upskilling for professionals over 40 India',
    unit_economics: { cac: 2500, ltv: 18000, ltv_cac_ratio: 7.2, avg_order_value: 6000, churn_rate: 18, payback_period: 7, context: 'Corporate-sponsored learning ₹5,000–₹15,000 per programme; B2B2C reduces CAC.' },
    competitors: [
      { name: 'Harvard ManageMentor', type: 'Global Platform', description: 'Premium leadership content; expensive for Indian market.' },
      { name: 'LinkedIn Learning', type: 'Global Platform', description: 'Self-paced; lacks cohort learning and peer accountability.' },
      { name: 'Emeritus', type: 'Indian+Global', description: 'Premium certificates with top universities; high cost.' },
    ],
  },
  'sports-coaching-academy-online': {
    google_trends_keyword: 'online cricket coaching India',
    unit_economics: { cac: 900, ltv: 7200, ltv_cac_ratio: 8.0, avg_order_value: 2400, churn_rate: 20, payback_period: 5, context: 'Monthly live coaching ₹800–₹2,000; seasonal demand spike in cricket tournament season.' },
    competitors: [
      { name: 'Sports365', type: 'E-commerce', description: 'Equipment + content; not structured coaching.' },
      { name: 'CoachTube', type: 'Global Platform', description: 'Video library for sports; no live India coaching.' },
      { name: 'Playo', type: 'Indian Startup', description: 'Sports venue booking app; adjacent not competitive.' },
    ],
  },
  'study-abroad-consulting-platform': {
    google_trends_keyword: 'study abroad consultants India',
    unit_economics: { cac: 5000, ltv: 45000, ltv_cac_ratio: 9.0, avg_order_value: 30000, churn_rate: 10, payback_period: 6, context: 'One-time consulting fee ₹20,000–₹50,000 per admission; visa + SOP bundling raises ARPU.' },
    competitors: [
      { name: 'Leap Scholar', type: 'Indian Startup', description: 'Tech-driven study abroad; Series C funded.' },
      { name: 'iSchoolConnect', type: 'Indian Startup', description: 'AI-based university matching; 150+ university partnerships.' },
      { name: 'Local consultants', type: 'Unorganised', description: 'Low-tech but trusted; high referral base.' },
    ],
  },
  'teacher-professional-development-platform': {
    google_trends_keyword: 'teacher training courses online India',
    unit_economics: { cac: 800, ltv: 4200, ltv_cac_ratio: 5.3, avg_order_value: 2000, churn_rate: 30, payback_period: 5, context: 'Annual certification ₹1,500–₹3,000; school tie-ups create B2B bulk purchasing.' },
    competitors: [
      { name: 'DIKSHA (Govt)', type: 'Government', description: 'Free government teacher portal; non-commercial, patchy content.' },
      { name: 'Practically', type: 'Indian Startup', description: 'AR/VR-based lessons for teachers; niche focus.' },
      { name: 'Teachmint', type: 'Indian Startup', description: 'Teaching infrastructure SaaS; not CPD-focused.' },
    ],
  },
  'vernacular-coding-bootcamp': {
    google_trends_keyword: 'coding classes in Hindi India',
    unit_economics: { cac: 3000, ltv: 25000, ltv_cac_ratio: 8.3, avg_order_value: 8000, churn_rate: 15, payback_period: 8, context: 'Bootcamp fees ₹5,000–₹15,000; job guarantee model shifts revenue recognition to placement.' },
    competitors: [
      { name: 'Coding Ninjas', type: 'Indian Startup', description: 'English-first bootcamp; expanding to Hindi; well-funded.' },
      { name: 'Masai School', type: 'Indian Startup', description: 'ISA model; vernacular push underway.' },
      { name: 'Apna (skilling)', type: 'Indian Startup', description: 'Jobs + adjacent skill content; massive user base.' },
    ],
  },
  'edtech-vernacular-skill-based-courses': {
    google_trends_keyword: 'skill courses in regional languages India',
    unit_economics: { cac: 600, ltv: 4000, ltv_cac_ratio: 6.7, avg_order_value: 1500, churn_rate: 35, payback_period: 5, context: 'Course bundles ₹999–₹2,500; voice-first delivery reduces dropout in Tier 3.' },
    competitors: [
      { name: 'Josh Talks', type: 'Indian Startup', description: 'Vernacular motivation + career content; Series B.' },
      { name: 'Lido Learning', type: 'Indian Startup', description: 'Shut down; left gap in regional K12 space.' },
      { name: 'Jeevan Vidya', type: 'NGO/Startup', description: 'Rural skilling in regional languages; grants-based model.' },
    ],
  },
  // ── FinTech ────────────────────────────────────────────────────────────────
  'bnpl-kirana-msme-retailers': {
    google_trends_keyword: 'BNPL for small business India',
    unit_economics: { cac: 1500, ltv: 15000, ltv_cac_ratio: 10.0, avg_order_value: 8000, churn_rate: 20, payback_period: 6, context: 'Credit line fee 1.5–2% per transaction; repeat monthly transactions drive LTV.' },
    competitors: [
      { name: 'OkCredit', type: 'Indian Startup', description: 'Digital ledger for kiranas; not BNPL but adjacent.' },
      { name: 'Khatabook Capital', type: 'Indian Startup', description: 'Ledger app adding embedded credit; large distribution.' },
      { name: 'OfBusiness', type: 'Indian Unicorn', description: 'B2B commerce + credit for MSMEs; heavily funded.' },
    ],
  },
  'credit-scoring-thin-file-borrowers': {
    google_trends_keyword: 'credit score for first time borrowers India',
    unit_economics: { cac: 2000, ltv: 20000, ltv_cac_ratio: 10.0, avg_order_value: 5000, churn_rate: 18, payback_period: 7, context: 'SaaS to lenders ₹50–₹200 per credit check; or B2C subscription ₹299/mo for borrowers.' },
    competitors: [
      { name: 'Perfios', type: 'Indian Fintech', description: 'Bank statement analysis for lenders; dominant B2B player.' },
      { name: 'CreditVidya (MG)', type: 'Indian Startup', description: 'Alternative data credit scoring; acquired by MaxGain.' },
      { name: 'Experian India', type: 'Global', description: 'Traditional bureau; slow to innovate on thin-file segments.' },
    ],
  },
  'cross-border-remittance-platform': {
    google_trends_keyword: 'send money to India from abroad',
    unit_economics: { cac: 3000, ltv: 30000, ltv_cac_ratio: 10.0, avg_order_value: 12000, churn_rate: 12, payback_period: 8, context: 'Avg 0.5–1.5% take rate on ₹10,000–₹50,000 transfers; expat community drives repeat frequency.' },
    competitors: [
      { name: 'Wise', type: 'Global Fintech', description: 'Dominant global player; lower fees than banks.' },
      { name: 'INDmoney', type: 'Indian Startup', description: 'NRI investment + remittance; growing fast.' },
      { name: 'HDFC RemitNow', type: 'Bank', description: 'Bank-backed trust; higher fees, poor UX.' },
    ],
  },
  'crypto-tax-filing-compliance': {
    google_trends_keyword: 'crypto tax filing India',
    unit_economics: { cac: 1200, ltv: 7200, ltv_cac_ratio: 6.0, avg_order_value: 2400, churn_rate: 25, payback_period: 5, context: 'Annual plan ₹1,999–₹4,999; volume of trades drives upsell to CA-assisted filing.' },
    competitors: [
      { name: 'KoinX', type: 'Indian Startup', description: 'India-specific crypto tax tool; growing with regulatory clarity.' },
      { name: 'ClearTax Crypto', type: 'Indian Startup', description: 'Module in ClearTax; broad reach but not crypto-first.' },
      { name: 'Koinly', type: 'Global Platform', description: 'Global crypto tax; limited India-specific support (30% flat tax).' },
    ],
  },
  'gold-loan-fintech-app': {
    google_trends_keyword: 'gold loan online India',
    unit_economics: { cac: 2500, ltv: 18000, ltv_cac_ratio: 7.2, avg_order_value: 35000, churn_rate: 20, payback_period: 7, context: 'Commission 0.5–1% of disbursed loan; average loan ₹30,000–₹50,000 with 60–75% LTV on gold.' },
    competitors: [
      { name: 'Rupeek', type: 'Indian Startup', description: 'Doorstep gold loan; Series C, backed by Sequoia.' },
      { name: 'Muthoot FinCorp', type: 'NBFC', description: 'Dominant gold loan brand; legacy but digitising.' },
      { name: 'IIFL Gold Loan', type: 'NBFC', description: 'Tech-enabled gold loan via branch network.' },
    ],
  },
  'invoice-discounting-platform-msmes': {
    google_trends_keyword: 'invoice discounting platform India',
    unit_economics: { cac: 8000, ltv: 80000, ltv_cac_ratio: 10.0, avg_order_value: 25000, churn_rate: 15, payback_period: 8, context: 'Platform fee 1–2% of invoice value; average invoice ₹2L–₹10L means high ARPU from few clients.' },
    competitors: [
      { name: 'KredX', type: 'Indian Startup', description: 'Invoice discounting marketplace; Series B, NBFC license.' },
      { name: 'M1xchange', type: 'Indian Platform', description: 'TReDS exchange; regulatory approval adds trust.' },
      { name: 'Cashflow Consultants', type: 'Traditional', description: 'Broker model; no digital automation.' },
    ],
  },
  'micro-insurance-gig-workers': {
    google_trends_keyword: 'gig worker insurance India',
    unit_economics: { cac: 400, ltv: 3600, ltv_cac_ratio: 9.0, avg_order_value: 600, churn_rate: 28, payback_period: 5, context: 'Monthly premium ₹49–₹199; B2B partnership with gig platforms slashes CAC below ₹200.' },
    competitors: [
      { name: 'Onsurity', type: 'Indian Startup', description: 'Group health insurance for startups and gig workers; Series B.' },
      { name: 'Plum', type: 'Indian Startup', description: 'Employee benefits platform; not gig-focused.' },
      { name: 'Acko', type: 'Indian Startup', description: 'Digital-first insurer; gig product nascent.' },
    ],
  },
  'mutual-fund-advisory-tier2-india': {
    google_trends_keyword: 'mutual fund investment advice India',
    unit_economics: { cac: 1500, ltv: 12000, ltv_cac_ratio: 8.0, avg_order_value: 2000, churn_rate: 22, payback_period: 6, context: 'Annual advisory fee ₹999–₹3,999 or AUM-based 0.25%; Tier 2/3 investors prefer vernacular onboarding.' },
    competitors: [
      { name: 'Groww', type: 'Indian Unicorn', description: 'Dominant in direct mutual funds; strong Tier 2 presence.' },
      { name: 'Zerodha Coin', type: 'Indian Platform', description: 'Direct MF without advisory layer; power users only.' },
      { name: 'Fisdom', type: 'Indian Startup', description: 'MF advisory for banks; B2B2C model.' },
    ],
  },
  'pension-planning-self-employed': {
    google_trends_keyword: 'pension plan for self employed India',
    unit_economics: { cac: 2000, ltv: 20000, ltv_cac_ratio: 10.0, avg_order_value: 5000, churn_rate: 12, payback_period: 8, context: 'Advisory fee ₹3,000–₹8,000 annually; AUM-based model more scalable long-term.' },
    competitors: [
      { name: 'NPS (PFRDA)', type: 'Government', description: 'National Pension System; low awareness among self-employed.' },
      { name: 'EPS advisors', type: 'Unorganised', description: 'CA/insurance agents; offline, expensive.' },
      { name: 'Etmoney', type: 'Indian Startup', description: 'Goal-based investing app; pension module nascent.' },
    ],
  },
  'revenue-based-financing-d2c-brands': {
    google_trends_keyword: 'revenue based financing India',
    unit_economics: { cac: 15000, ltv: 120000, ltv_cac_ratio: 8.0, avg_order_value: 50000, churn_rate: 20, payback_period: 10, context: 'Take rate 5–8% of funded amount; average ticket ₹5L–₹20L to D2C brands with GST history.' },
    competitors: [
      { name: 'GetVantage', type: 'Indian Startup', description: 'Revenue-based financing leader; Series B.' },
      { name: 'Velocity', type: 'Indian Startup', description: 'RBF + payment processing for D2C brands.' },
      { name: 'Recur Club', type: 'Indian Startup', description: 'Subscription revenue securitisation for SaaS.' },
    ],
  },
  'salary-advance-app-blue-collar': {
    google_trends_keyword: 'salary advance app for workers India',
    unit_economics: { cac: 300, ltv: 3600, ltv_cac_ratio: 12.0, avg_order_value: 3000, churn_rate: 25, payback_period: 3, context: 'Fee 1–2% per advance; employer integration drops CAC below ₹100 in B2B2C model.' },
    competitors: [
      { name: 'Refyne', type: 'Indian Startup', description: 'Earned wage access via employer APIs; Series B.' },
      { name: 'Juspay EWA', type: 'Indian Fintech', description: 'Payments company adding EWA module.' },
      { name: 'ZestMoney', type: 'Indian Startup', description: 'Consumer BNPL, not wage advance specifically.' },
    ],
  },
  'savings-app-for-indian-women': {
    google_trends_keyword: 'savings app for women India',
    unit_economics: { cac: 500, ltv: 6000, ltv_cac_ratio: 12.0, avg_order_value: 500, churn_rate: 20, payback_period: 5, context: 'Recurring deposits + chit fund digitisation; women-only SHG networks enable viral CAC drop.' },
    competitors: [
      { name: 'Niyo (women)', type: 'Indian Fintech', description: 'Zero-fee account for women; broad but not savings-focused.' },
      { name: 'Her Rise', type: 'Early Startup', description: 'Female-first investing; very early stage.' },
      { name: 'Sarvagram', type: 'Indian Fintech', description: 'Rural finance for women; microfinance model.' },
    ],
  },
  'trade-credit-insurance-exporters': {
    google_trends_keyword: 'trade credit insurance India exporters',
    unit_economics: { cac: 20000, ltv: 150000, ltv_cac_ratio: 7.5, avg_order_value: 50000, churn_rate: 15, payback_period: 10, context: 'Annual premium 0.3–0.8% of insured turnover; exporters with ₹1Cr+ turnover are target.' },
    competitors: [
      { name: 'ECGC', type: 'Government', description: 'Govt export credit insurer; slow processes, paper-heavy.' },
      { name: 'Euler Hermes', type: 'Global', description: 'Global trade credit insurance; expensive for SME exporters.' },
      { name: 'Atradius', type: 'Global', description: 'MNC insurer; minimal India-specific SME focus.' },
    ],
  },
  'fintech-embedded-credit-kirana-small-retailers': {
    google_trends_keyword: 'embedded credit for small retailers India',
    unit_economics: { cac: 1200, ltv: 12000, ltv_cac_ratio: 10.0, avg_order_value: 5000, churn_rate: 22, payback_period: 5, context: 'Interest spread 2–3% above cost of funds; repeat monthly credit cycles build LTV.' },
    competitors: [
      { name: 'Udaan Capital', type: 'Indian Unicorn', description: 'B2B commerce with embedded credit for retailers.' },
      { name: 'BharatPe', type: 'Indian Startup', description: 'POS + merchant credit; recovering from governance issues.' },
      { name: 'Juspay', type: 'Indian Fintech', description: 'Payments infra; credit layer nascent.' },
    ],
  },
  // ── Health & Wellness ──────────────────────────────────────────────────────
  'mental-health-wellness-platform-b2b-b2c': {
    google_trends_keyword: 'online mental health counselling India',
    unit_economics: { cac: 2000, ltv: 18000, ltv_cac_ratio: 9.0, avg_order_value: 3000, churn_rate: 25, payback_period: 7, context: 'B2C: ₹500–₹1,200 per session; B2B: ₹800–₹1,500 per employee per year; corporate channel cuts CAC significantly.' },
    competitors: [
      { name: 'iCall', type: 'NGO/Startup', description: 'Free counselling hotline; not scalable for B2B.' },
      { name: 'InnerHour', type: 'Indian Startup', description: 'Self-help + therapist matching; Series A.' },
      { name: 'Wysa', type: 'Indian Startup', description: 'AI mental health companion; global users, India focus.' },
    ],
  },
  'hyperlocal-senior-care-companionship-services': {
    google_trends_keyword: 'senior care services at home India',
    unit_economics: { cac: 3000, ltv: 36000, ltv_cac_ratio: 12.0, avg_order_value: 6000, churn_rate: 15, payback_period: 8, context: 'Monthly retainer ₹5,000–₹10,000; NRI children paying for parents in India drive premium pricing.' },
    competitors: [
      { name: 'Emoha Elder Care', type: 'Indian Startup', description: 'Subscription elder care; Series A, Delhi/Bangalore.' },
      { name: 'Silver Inning', type: 'Indian Startup', description: 'Senior living + care coordination.' },
      { name: 'Anudip (NGO)', type: 'NGO', description: 'Elderly skills, not care services.' },
    ],
  },
  'addiction-recovery-support-platform': {
    google_trends_keyword: 'addiction recovery support online India',
    unit_economics: { cac: 2500, ltv: 20000, ltv_cac_ratio: 8.0, avg_order_value: 5000, churn_rate: 30, payback_period: 8, context: 'Monthly programme ₹3,000–₹7,000; insurance tie-ups and family subscription bundles improve LTV.' },
    competitors: [
      { name: 'Vandrevala Foundation', type: 'NGO', description: 'Free helpline; no ongoing digital support.' },
      { name: 'Tulasi Healthcare', type: 'Rehab Center', description: 'In-patient rehab; not digital-first.' },
      { name: 'TTM Health', type: 'Early Startup', description: 'Digital therapy for alcohol dependence; very early stage.' },
    ],
  },
  'allergen-free-medical-diet-delivery': {
    google_trends_keyword: 'allergy-free meal delivery India',
    unit_economics: { cac: 1500, ltv: 18000, ltv_cac_ratio: 12.0, avg_order_value: 3000, churn_rate: 20, payback_period: 7, context: 'Weekly meal plan ₹2,500–₹4,500; medical referral from allergist/gastroenterologist slashes CAC.' },
    competitors: [
      { name: 'Eatfit', type: 'Indian Startup', description: 'Health-first meal delivery; not allergy-specialised.' },
      { name: 'Grow Fit', type: 'Indian Startup', description: 'Therapeutic meal plans; diabetes and PCOS focus.' },
      { name: 'Local tiffin services', type: 'Unorganised', description: 'No medical-grade allergen protocols.' },
    ],
  },
  'at-home-physiotherapy-services': {
    google_trends_keyword: 'physiotherapy at home India',
    unit_economics: { cac: 2000, ltv: 15000, ltv_cac_ratio: 7.5, avg_order_value: 5000, churn_rate: 22, payback_period: 7, context: 'Per-session ₹800–₹1,500; post-surgical packages 15–20 sessions; TPA/insurance reimbursement drives B2B.' },
    competitors: [
      { name: 'PhysioFy', type: 'Indian Startup', description: 'Home physio marketplace; limited city coverage.' },
      { name: 'Portea Medical', type: 'Indian Startup', description: 'Full-spectrum home care including physio; largest in India.' },
      { name: 'Care24', type: 'Indian Startup', description: 'Home nursing and physio; Series A.' },
    ],
  },
  'ayurvedic-herbal-medicine-platform': {
    google_trends_keyword: 'Ayurvedic medicine online India',
    unit_economics: { cac: 800, ltv: 8000, ltv_cac_ratio: 10.0, avg_order_value: 1200, churn_rate: 25, payback_period: 5, context: 'Subscription ₹600–₹2,000/month; consultation + supplement bundle raises AOV.' },
    competitors: [
      { name: 'Kapiva', type: 'Indian D2C', description: 'Ayurvedic D2C brand; Series B, Shark Tank India winner.' },
      { name: 'Kerala Ayurveda', type: 'Traditional Brand', description: 'Retail-first; going online.' },
      { name: 'Forest Essentials', type: 'Premium Brand', description: 'Luxury Ayurveda; premium segment.' },
    ],
  },
  'corporate-wellness-platform': {
    google_trends_keyword: 'employee wellness program India',
    unit_economics: { cac: 15000, ltv: 120000, ltv_cac_ratio: 8.0, avg_order_value: 40000, churn_rate: 15, payback_period: 9, context: 'Annual per-employee ₹1,500–₹3,500; 500-employee company = ₹7.5L–₹17.5L annual contract.' },
    competitors: [
      { name: 'Truworth Wellness', type: 'Indian Startup', description: 'Corporate wellness programs; 400+ enterprise clients.' },
      { name: 'Fedo', type: 'Indian Startup', description: 'AI health risk management for insurers and corporates.' },
      { name: 'Cure.fit (now Cult)', type: 'Indian Startup', description: 'Fitness + wellness; corporate tie-ups.' },
    ],
  },
  'dental-care-subscription-plan': {
    google_trends_keyword: 'dental subscription plan India',
    unit_economics: { cac: 1500, ltv: 12000, ltv_cac_ratio: 8.0, avg_order_value: 3000, churn_rate: 20, payback_period: 6, context: 'Annual plan ₹2,500–₹5,000 covering checkups + cleanings + 20% treatment discount; family plan boosts LTV.' },
    competitors: [
      { name: 'Clove Dental', type: 'Chain', description: 'Organised dental chain; no subscription yet.' },
      { name: 'Dentzz', type: 'Premium Chain', description: 'Metro dental clinics; premium pricing, not mass market.' },
      { name: 'Toothsi', type: 'Indian Startup', description: 'At-home aligners; adjacent but not preventive care.' },
    ],
  },
  'diabetes-management-platform': {
    google_trends_keyword: 'diabetes management app India',
    unit_economics: { cac: 2000, ltv: 20000, ltv_cac_ratio: 10.0, avg_order_value: 2500, churn_rate: 18, payback_period: 7, context: 'Monthly plan ₹999–₹2,499 including dietitian + CGM data review; India has 80M+ diabetics.' },
    competitors: [
      { name: 'Wellthy Therapeutics', type: 'Indian Startup', description: 'Digital therapeutics for diabetes; Roche partnership.' },
      { name: 'BeatO', type: 'Indian Startup', description: 'Glucometer + coaching app; Series B.' },
      { name: 'Apollo Sugar', type: 'Hospital Chain', description: 'Diabetes specialty clinics; offline-first.' },
    ],
  },
  'elder-care-home-services-platform': {
    google_trends_keyword: 'elder care services India',
    unit_economics: { cac: 4000, ltv: 48000, ltv_cac_ratio: 12.0, avg_order_value: 8000, churn_rate: 12, payback_period: 8, context: 'Monthly package ₹5,000–₹15,000; premium packages for bedbound seniors ₹25,000+/month.' },
    competitors: [
      { name: 'Portea Medical', type: 'Indian Startup', description: 'Largest home healthcare in India; elder care vertical.' },
      { name: 'Nightingales', type: 'Indian Startup', description: 'Home nursing + elder care; South India focus.' },
      { name: 'Home Care India', type: 'Unorganised', description: 'Agency model; no quality standards.' },
    ],
  },
  'fertility-support-ivf-companion-app': {
    google_trends_keyword: 'IVF support app India',
    unit_economics: { cac: 3000, ltv: 25000, ltv_cac_ratio: 8.3, avg_order_value: 5000, churn_rate: 25, payback_period: 9, context: 'Companion subscription ₹1,500–₹3,000/month; clinic partnership model monetises through referrals.' },
    competitors: [
      { name: 'Glow (app)', type: 'Global App', description: 'Fertility tracking; US-focused, no IVF clinic integration in India.' },
      { name: 'Flo Health', type: 'Global App', description: 'Women\'s health tracking; period + ovulation focus.' },
      { name: 'Nova IVF (digital)', type: 'Hospital Chain', description: 'IVF chain app; siloed per clinic.' },
    ],
  },
  'genetic-testing-for-indian-populations': {
    google_trends_keyword: 'genetic testing India',
    unit_economics: { cac: 3500, ltv: 20000, ltv_cac_ratio: 5.7, avg_order_value: 8000, churn_rate: 30, payback_period: 9, context: 'One-time test ₹5,000–₹15,000; follow-up consultation and family member upsell drives repeat.' },
    competitors: [
      { name: 'Mapmygenome', type: 'Indian Startup', description: 'India-specific genomics; first mover, limited scale.' },
      { name: '23andMe', type: 'Global', description: 'Global leader; limited India population reference data.' },
      { name: 'Thyrocare (genetic)', type: 'Lab Chain', description: 'Adding genetic panels to lab menu.' },
    ],
  },
  'home-blood-sample-collection-platform': {
    google_trends_keyword: 'home blood test collection India',
    unit_economics: { cac: 600, ltv: 5400, ltv_cac_ratio: 9.0, avg_order_value: 800, churn_rate: 25, payback_period: 5, context: 'Per-collection ₹100 + test cost; annual health packages ₹2,000–₹5,000 reduce per-visit pricing.' },
    competitors: [
      { name: 'Redcliffe Labs', type: 'Indian Startup', description: 'Home sample collection + lab; rapidly growing.' },
      { name: 'Lal PathLabs', type: 'Listed Company', description: 'Dominant diagnostic chain; home collection added.' },
      { name: 'PharmEasy Diagnostics', type: 'Indian Startup', description: 'Integrated pharmacy + diagnostics.' },
    ],
  },
  'indian-fitness-app-for-indian-bodies': {
    google_trends_keyword: 'workout app for Indian women',
    unit_economics: { cac: 400, ltv: 3600, ltv_cac_ratio: 9.0, avg_order_value: 600, churn_rate: 35, payback_period: 4, context: 'Monthly ₹299–₹699; Indian diet integration + yoga/dance workouts reduce churn vs global apps.' },
    competitors: [
      { name: 'Cult.fit', type: 'Indian Startup', description: 'Online + offline fitness; Series E, dominant player.' },
      { name: 'HealthifyMe', type: 'Indian Startup', description: 'Diet + fitness tracking; 40M users, Series C.' },
      { name: 'Nike Training Club', type: 'Global App', description: 'Free; no Indian diet or local context.' },
    ],
  },
  'medical-second-opinion-platform': {
    google_trends_keyword: 'medical second opinion online India',
    unit_economics: { cac: 2500, ltv: 15000, ltv_cac_ratio: 6.0, avg_order_value: 5000, churn_rate: 28, payback_period: 8, context: 'Per-opinion ₹2,000–₹7,000; cancer and cardiac cases avg ₹5,000–₹15,000 per consultation.' },
    competitors: [
      { name: 'Practo', type: 'Indian Startup', description: 'Largest health platform; second opinion nascent feature.' },
      { name: 'Vaidam Health', type: 'Indian Startup', description: 'Medical tourism + opinions; foreign patient focus.' },
      { name: 'Best Doctors (Cigna)', type: 'Global', description: 'Insurance-bundled second opinions; expensive.' },
    ],
  },
  'mental-health-therapy-platform': {
    google_trends_keyword: 'online therapy India',
    unit_economics: { cac: 1800, ltv: 16000, ltv_cac_ratio: 8.9, avg_order_value: 2000, churn_rate: 28, payback_period: 6, context: 'Per-session ₹800–₹2,000; subscription bundles 4–8 sessions cut per-session CAC.' },
    competitors: [
      { name: 'YourDOST', type: 'Indian Startup', description: 'Online counselling and wellness; corporate contracts.' },
      { name: 'Vandrevala Foundation', type: 'NGO', description: 'Free crisis helpline; not ongoing therapy.' },
      { name: 'BetterHelp', type: 'Global', description: 'Global telehealth therapy; USD pricing, US therapists.' },
    ],
  },
  'online-nutrition-diet-consultation': {
    google_trends_keyword: 'online dietitian consultation India',
    unit_economics: { cac: 800, ltv: 8000, ltv_cac_ratio: 10.0, avg_order_value: 2000, churn_rate: 25, payback_period: 5, context: 'Monthly plan ₹1,500–₹3,000; disease-specific plans (diabetes, PCOS) have 40% lower churn.' },
    competitors: [
      { name: 'HealthifyMe', type: 'Indian Startup', description: 'AI + human nutritionist; dominant in diet tracking.' },
      { name: 'Practo Nutrition', type: 'Indian Platform', description: 'Dietitian listing; not curated plans.' },
      { name: 'Dt. Shikha Mahajan', type: 'Individual', description: 'Influencer nutritionist; not scalable.' },
    ],
  },
  'online-pharmacy-prescription-management': {
    google_trends_keyword: 'online pharmacy India',
    unit_economics: { cac: 500, ltv: 6000, ltv_cac_ratio: 12.0, avg_order_value: 800, churn_rate: 20, payback_period: 4, context: 'Gross margin 12–18%; chronic disease patients order monthly, driving high LTV.' },
    competitors: [
      { name: 'PharmEasy', type: 'Indian Unicorn', description: 'Dominant online pharmacy; aggressive discounts.' },
      { name: 'Tata 1mg', type: 'Indian Unicorn', description: 'Pharmacy + diagnostics; Tata Group backed.' },
      { name: 'Netmeds', type: 'Indian Startup', description: 'Acquired by Reliance; pan-India reach.' },
    ],
  },
  'preventive-health-checkup-platform': {
    google_trends_keyword: 'full body health checkup India',
    unit_economics: { cac: 1000, ltv: 8000, ltv_cac_ratio: 8.0, avg_order_value: 2500, churn_rate: 25, payback_period: 5, context: 'Annual package ₹1,500–₹5,000; corporate bulk purchase at ₹1,200 per employee drives volume.' },
    competitors: [
      { name: 'Lal PathLabs', type: 'Listed Company', description: 'Pan-India labs; preventive packages standard offering.' },
      { name: 'Thyrocare', type: 'Lab Chain', description: 'Price leader; Aarogyam packages very popular.' },
      { name: 'Apollo Diagnostics', type: 'Hospital Chain', description: 'Premium labs; bundled with Apollo health plans.' },
    ],
  },
  'sleep-disorder-clinic-telehealth': {
    google_trends_keyword: 'sleep disorder treatment India',
    unit_economics: { cac: 3000, ltv: 18000, ltv_cac_ratio: 6.0, avg_order_value: 5000, churn_rate: 30, payback_period: 9, context: 'Initial consultation + sleep study ₹3,000–₹8,000; CBT-I programme follow-up extends LTV.' },
    competitors: [
      { name: 'SleepyCat (mattress)', type: 'D2C Brand', description: 'Mattress brand; not medical sleep treatment.' },
      { name: 'ResMed India', type: 'MedTech MNC', description: 'CPAP devices; needs a clinical consulting layer.' },
      { name: 'NIMHANS', type: 'Government', description: 'Academic sleep lab; not accessible for mass market.' },
    ],
  },
  'wellness-retreats-aggregator': {
    google_trends_keyword: 'wellness retreat India',
    unit_economics: { cac: 2500, ltv: 25000, ltv_cac_ratio: 10.0, avg_order_value: 12000, churn_rate: 22, payback_period: 7, context: 'Commission 10–15% per retreat booking; average package ₹8,000–₹25,000; corporate offsites a high-value segment.' },
    competitors: [
      { name: 'BookAStay Wellness', type: 'Startup', description: 'Wellness hospitality marketplace; early stage.' },
      { name: 'The Retreat India', type: 'Aggregator', description: 'Yoga retreat listings; no booking + curation layer.' },
      { name: 'Airbnb Experiences', type: 'Global', description: 'Adjacent; not wellness-specialised.' },
    ],
  },
  'womens-health-pcos-thyroid-platform': {
    google_trends_keyword: 'PCOS treatment online India',
    unit_economics: { cac: 1500, ltv: 18000, ltv_cac_ratio: 12.0, avg_order_value: 2500, churn_rate: 20, payback_period: 6, context: 'Monthly care plan ₹1,200–₹3,500; thyroid + PCOS combo management plan captures 60% of users.' },
    competitors: [
      { name: 'Veera Health', type: 'Indian Startup', description: 'PCOS digital clinic; Series A.' },
      { name: 'Flo (app)', type: 'Global', description: 'Cycle tracking; no clinical management layer.' },
      { name: 'Nua', type: 'Indian D2C', description: 'Period care products; not medical management.' },
    ],
  },
}

const slugs = Object.keys(DATA)

async function run() {
  console.log(`Seeding depth data for ${slugs.length} ideas...`)
  // Resolve actual _id by slug (some docs have auto-generated IDs, not idea-{slug})
  const docs = await client.fetch(
    `*[_type=="businessIdea" && slug.current in $slugs]{_id,"slug":slug.current,"hasTrends":google_trends_keyword}`,
    { slugs }
  )
  const idMap = {}
  const hasData = new Set()
  for (const d of docs) {
    idMap[d.slug] = d._id
    if (d.hasTrends) hasData.add(d.slug)
  }

  let ok = 0, skip = 0, missing = 0
  for (let i = 0; i < slugs.length; i += 10) {
    const batch = slugs.slice(i, i + 10)
    const tx = client.transaction()
    let anyInBatch = false
    for (const slug of batch) {
      if (hasData.has(slug)) { skip++; continue }
      const docId = idMap[slug]
      if (!docId) { console.warn(`\n  Missing doc for slug: ${slug}`); missing++; continue }
      const d = DATA[slug]
      const competitors = (d.competitors || []).map(c => ({ ...c, _type: 'object', _key: k() }))
      tx.patch(docId, p => p.setIfMissing({
        google_trends_keyword: d.google_trends_keyword,
        unit_economics: d.unit_economics,
        competitors,
      }))
      ok++
      anyInBatch = true
    }
    if (anyInBatch) await tx.commit()
    process.stdout.write(`  ${Math.min(i + 10, slugs.length)} / ${slugs.length}`)
  }
  console.log(`\nDone. Updated: ${ok}, Skipped (already had data): ${skip}, Missing: ${missing}`)
}

run().catch(err => { console.error(err); process.exit(1) })
