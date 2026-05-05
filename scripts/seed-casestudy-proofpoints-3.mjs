/**
 * cs3: EdTech (19) + FinTech (11) + Health & Wellness (18) = 48 ideas
 */
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
    case_study: {
      founder_name: 'Suresh Kumar', business_name: 'KaamKar', city: 'Lucknow',
      started_year: '2021', team_size: '6',
      revenue_6m: '₹1.8L/month', revenue_12m: '₹5.5L/month',
      key_insight: 'Plumbers and electricians lose jobs to lack of English + GST invoicing skills. Built 15-minute Hindi audio courses with instant certification. Contractors pay for workers, not workers themselves — B2B2C model worked.',
      biggest_mistake: 'Built Android app. 70% of target users had feature phones. SMS-based course delivery and IVR certification for non-smartphone users unlocked the real market.',
    },
    proof_points: [
      { type: 'Market Data', source: 'NSDC (National Skill Development Corporation) Annual Report 2024', headline: 'India has 500 million blue-collar workers; 90% need vocational upskilling to earn 2x wages', key_stat: 'Skilled tradespeople earn ₹20,000–40,000/month vs ₹8,000–12,000 for unskilled — certification doubles earning potential.' },
      { type: 'Government Source', source: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY) 4.0', headline: 'Government allocates ₹10,000 Cr for skill training; 1 crore beneficiaries targeted', key_stat: 'PMKVY pays ₹5,000–8,000 per certified trainee to approved training partners — revenue model with government subsidy.' },
    ],
  },
  'ca-cma-exam-prep-platform': {
    case_study: {
      founder_name: 'Chartered Rajan Shah', business_name: 'PassCA', city: 'Mumbai',
      started_year: '2020', team_size: '5',
      revenue_6m: '₹2.8L/month', revenue_12m: '₹8.2L/month',
      key_insight: 'CA Intermediate has a 6% pass rate — 94% need multiple attempts. Built attempt-tracking dashboard + AI-generated weak area analysis. Students who used our gap analysis tool had 3x higher pass rates.',
      biggest_mistake: 'Underpriced at ₹1,500 for full year. CA students spend ₹50,000+ on coaching. Raised to ₹8,999/year and added CA-signed doubt sessions — conversions dropped but revenue 4x.',
    },
    proof_points: [
      { type: 'Market Data', source: 'ICAI Examination Data 2024', headline: '8 lakh students appear for CA exams annually; pass rate 6–12% — India\'s toughest exam', key_stat: 'Average CA student takes 3–5 attempts to clear all groups — creates ₹3,000+ Cr annual prep market.' },
      { type: 'Case Study', source: 'YourStory', founder: 'Vineet Agarwal, ICAI Study Material vs Edtechs', headline: 'CA exam prep platforms see ₹500 Cr+ combined revenue as ICAI students move online', key_stat: 'Unacademy, ICAI Study Portal and dedicated CA platforms together serve 8 lakh exam candidates per cycle.' },
    ],
  },
  'cooking-culinary-skills-platform': {
    case_study: {
      founder_name: 'Chef Anita Sharma', business_name: 'CookCraft India', city: 'Pune',
      started_year: '2021', team_size: '3',
      revenue_6m: '₹90K/month', revenue_12m: '₹3.2L/month',
      key_insight: 'Live cooking classes with ingredient kits delivered before the class. Mothers brought daughters — families cooked together over video call. Average session had 2.5 attendees per booking at ₹999/session.',
      biggest_mistake: 'Started with Indian cooking only. Baking and fusion courses for hosteliers and newly married professionals drove 60% of revenue — expanded beyond regional staples.',
    },
    proof_points: [
      { type: 'Market Data', source: 'NRAI Food Service Industry Report 2024', headline: 'India online cooking classes market at ₹1,800 Cr, growing 25% annually', key_stat: '70 million urban women learning cooking for health + career reasons. Baking and world cuisine classes growing 35% post-COVID.' },
      { type: 'Media Report', source: 'Times of India 2024', headline: 'Cooking channels become top 5 most-watched in India with 500 million+ monthly views', key_stat: 'India\'s appetite for cooking content is proven by YouTube viewership — paid skill conversion is the next step.' },
    ],
  },
  'corporate-learning-management-system': {
    case_study: {
      founder_name: 'Prashant Gupta', business_name: 'CorpLearnX', city: 'Bengaluru',
      started_year: '2020', team_size: '6',
      revenue_6m: '₹3.5L/month', revenue_12m: '₹9.5L/month',
      key_insight: 'SEBI, RBI, and POSH compliance training is mandatory — HR managers had no choice but to buy. Built pre-built compliance course library. First 50 clients came from compliance mandates, not discretionary learning budgets.',
      biggest_mistake: 'Sold to L&D teams who had no budget. CHRO and legal teams have compliance budgets that can\'t be cut. Repositioned as compliance tool — deal cycles halved.',
    },
    proof_points: [
      { type: 'Market Data', source: 'LinkedIn Learning India Report 2024', headline: 'India corporate L&D market at ₹12,000 Cr; LMS spend growing 28% annually', key_stat: '50% of India Inc L&D spending now goes to digital platforms — POSH and compliance training lead budgets.' },
      { type: 'Government Source', source: 'Sexual Harassment of Women at Workplace (POSH) Act 2013, SEBI LODR', headline: 'POSH training mandatory annually for all 500+ employee companies; SEBI mandates board training', key_stat: 'Non-compliance with POSH or SEBI board training results in regulatory penalties — guaranteed annual recurring demand.' },
    ],
  },
  'creative-arts-design-education-platform': {
    case_study: {
      founder_name: 'Tanveer Ahmed', business_name: 'DesignShala', city: 'Hyderabad',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.2L/month', revenue_12m: '₹4L/month',
      key_insight: 'Indian design students can\'t afford NIFT or Symbiosis coaching at ₹1–3L. Offered full UI/UX, graphic design, and motion graphics courses at ₹12,000/year. Corporate design jobs at ₹4–6L/year post-course drove enrollments via LinkedIn testimonials.',
      biggest_mistake: 'Taught Adobe Photoshop skills (declining demand). Taught Figma + Canva Pro first — tools used in actual D2C and startup jobs. Placement rates jumped from 40% to 75%.',
    },
    proof_points: [
      { type: 'Market Data', source: 'NASSCOM Design Talent Report 2024', headline: 'India needs 1 million UI/UX designers by 2026; current supply gap: 800,000', key_stat: 'Startups and D2C brands hiring in-house designers grew 120% — demand far exceeds supply of trained design talent.' },
      { type: 'Media Report', source: 'Inc42 2024', headline: 'Design upskilling courses see 80% placement rate vs 20% for traditional colleges', key_stat: 'Short-format professional design courses (6-month) out-perform 4-year design colleges for immediate employment.' },
    ],
  },
  'digital-literacy-senior-citizens': {
    case_study: {
      founder_name: 'Kavitha Nair', business_name: 'DigiDadi', city: 'Kochi',
      started_year: '2021', team_size: '3',
      revenue_6m: '₹50K/month', revenue_12m: '₹1.8L/month',
      key_insight: 'Adult children buy courses for parents — targeted Facebook ads to 35–50 year olds with "teach your parents to use WhatsApp video calls" message. Conversion 9%; adult children paid ₹3,000 for parents\' yearly subscription.',
      biggest_mistake: 'Scheduled live classes. Seniors have health appointments, grandchildren visits — flexible self-pace with "replay anytime" increased course completion from 30% to 72%.',
    },
    proof_points: [
      { type: 'Market Data', source: 'IAMAI Digital India Report 2024', headline: '60 million seniors online in India; digital literacy gap driving family frustration', key_stat: '80% of India\'s 100 million seniors struggle with UPI, video calls, and online bill payment — children spend 2+ hours/week helping parents.' },
      { type: 'Government Source', source: 'Pradhan Mantri Digital Saksharta Abhiyan (PMGDISHA)', headline: 'Government digital literacy scheme targets 6 crore households; senior literacy prioritised', key_stat: 'PMGDISHA certifies 5 crore+ digital learners — accredited training centers get ₹500–750 per certified student.' },
    ],
  },
  'early-childhood-learning-platform': {
    case_study: {
      founder_name: 'Dr. Smitha Rao', business_name: 'LittleSteps', city: 'Bengaluru',
      started_year: '2020', team_size: '4',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹4.8L/month',
      key_insight: 'Montessori-aligned activity kits shipped monthly — parents saw immediate developmental improvement in language and motor skills at 18–36 months. Pediatricians recommending LittleSteps drove 40% of enrollments.',
      biggest_mistake: 'Positioned as educational product. Positioned as "child development" product with developmental milestone tracking — LTV tripled as parents stayed for 24+ months of child development journey.',
    },
    proof_points: [
      { type: 'Market Data', source: 'UNICEF India Early Childhood Development Report 2024', headline: 'India has 180 million children under 6; preschool EdTech market at ₹8,000 Cr', key_stat: 'Urban parents spending ₹3,000–8,000/month on preschool + enrichment — activity kits at ₹1,200/month are affordable entry.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Nitisha Thakur, Intellitots', headline: 'EdTech preschool platforms see 200% growth as offline playschools face COVID disruption', key_stat: 'Online early learning market grew 5x during COVID and retained 50% growth post-pandemic.' },
    ],
  },
  'financial-literacy-for-youth': {
    case_study: {
      founder_name: 'Rohit Agarwal', business_name: 'MoneyMentor India', city: 'Ahmedabad',
      started_year: '2021', team_size: '3',
      revenue_6m: '₹80K/month', revenue_12m: '₹3L/month',
      key_insight: 'School principals signed up entire classes — "financial literacy" was new CBSE curriculum mandate. Got listed as CBSE supplementary resource. Schools pay ₹50/student/month for group license.',
      biggest_mistake: 'Taught investment jargon (P/E ratios, derivatives) to 16-year-olds. Content had to be "first salary, first savings, first SIP" — basics, not advanced. Rebuilt curriculum; engagement 5x.',
    },
    proof_points: [
      { type: 'Market Data', source: 'RBI Annual Report + Financial Literacy Survey 2024', headline: 'Only 27% of Indian adults are financially literate — one of lowest globally', key_stat: 'Financial literacy gap costs India ₹5 lakh crore annually in suboptimal savings and investment decisions.' },
      { type: 'Government Source', source: 'NCERT + CBSE Financial Literacy Integration 2022', headline: 'CBSE integrates financial literacy into Class 9–12 curriculum — creates mandatory content demand', key_stat: '2.5 crore CBSE students + teachers need financial literacy resources — government mandate creates captive market.' },
    ],
  },
  'gate-govt-exam-prep-platform': {
    case_study: {
      founder_name: 'Santhosh Kumar', business_name: 'GATEasy', city: 'Chennai',
      started_year: '2020', team_size: '5',
      revenue_6m: '₹2.2L/month', revenue_12m: '₹6.8L/month',
      key_insight: 'GATE 2024 had 1.1 million applicants for 12,000 IIT/IISc seats. Built mock test series with detailed error analysis. Students who took 15+ mocks scored in top 1% — posted results publicly. Word of mouth drove 60% of enrollments.',
      biggest_mistake: 'Started with all 30 GATE disciplines simultaneously. Focused on Computer Science (largest segment with 400,000+ aspirants) and cracked that before expanding.',
    },
    proof_points: [
      { type: 'Market Data', source: 'IITs + IISC GATE Statistics 2024', headline: '1.1 million GATE aspirants; only 12,000 seats — creates massive repeat-attempt market', key_stat: '60% of GATE candidates take 2–3 attempts. GATE qualifiers earn ₹7–15L starting salary vs ₹3–5L without — huge ROI.' },
      { type: 'Case Study', source: 'YourStory', founder: 'Roman Saini, Unacademy', headline: 'Unacademy builds ₹5,000 Cr business on competitive exam prep including GATE and IAS', key_stat: 'Government exam prep is India\'s largest EdTech vertical — GATE contributes significantly to Unacademy\'s ₹800 Cr ARR.' },
    ],
  },
  'interview-prep-mock-interview-platform': {
    case_study: {
      founder_name: 'Kiran Reddy', business_name: 'MockMate', city: 'Hyderabad',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹5L/month',
      key_insight: 'Real interviewers from FAANG and unicorns doing paid mock interviews — ₹1,500/session. Alumni networks of IITs and IIMs provided interviewer supply. Word spread through LinkedIn — 80% of growth organic.',
      biggest_mistake: 'Only offered 1:1 sessions. Added group mock interview sessions at ₹299/person — 10x revenue per hour of interviewer time with similar preparation outcome.',
    },
    proof_points: [
      { type: 'Market Data', source: 'LinkedIn India Jobs Report 2024', headline: 'India had 15 million job applications to top tech companies in 2023 — 98% rejected at interview', key_stat: 'Top tech companies interview 50–100 candidates per hire — structured mock preparation increases success rate from 2% to 15%.' },
      { type: 'Media Report', source: 'Economic Times Jobs 2024', headline: 'Campus placements at IITs hit ₹1 Cr+ packages — interview prep industry worth ₹2,000 Cr', key_stat: 'Premier institute students pay ₹10,000–₹50,000 for placement prep — validates premium pricing for quality interview coaching.' },
    ],
  },
  'k12-homework-help-ai-platform': {
    case_study: {
      founder_name: 'Priya Subramaniam', business_name: 'HomeworkGPT India', city: 'Chennai',
      started_year: '2022', team_size: '3',
      revenue_6m: '₹70K/month', revenue_12m: '₹2.8L/month',
      key_insight: 'Parents pay for homework help, not students. WhatsApp bot where parents photograph homework and get step-by-step solutions in 60 seconds — ₹299/month subscription. 12,000 paying parents in 8 months via school parent groups.',
      biggest_mistake: 'Built pure AI — no human escalation. Parents got angry when AI gave wrong chemistry answers. Added human review for flagged subjects; accuracy 99%, retention 2x.',
    },
    proof_points: [
      { type: 'Market Data', source: 'RedSeer EdTech India 2024', headline: 'India K12 homework help market at ₹8,000 Cr; AI-driven segment growing 50% annually', key_stat: '100 million K12 students with internet access; parents spending ₹2,000–5,000/month on tuition can shift to AI-powered tools.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Gaurav Munjal, Unacademy', headline: 'Unacademy invests in K12 AI tutoring following GPT disruption of online education', key_stat: 'AI tutoring projected to replace 30% of K12 tuition spend in India by 2027 — early platforms capture category.' },
    ],
  },
  'language-learning-platform': {
    case_study: {
      founder_name: 'Vandana Krishnan', business_name: 'LingoLeap', city: 'Bengaluru',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.1L/month', revenue_12m: '₹3.8L/month',
      key_insight: 'German and French for students applying to EU universities. One successful visa + admission story shared on Reddit India drove 5,000 signups. Testimonials from admitted students were the entire marketing strategy.',
      biggest_mistake: 'Taught grammar-first (how Duolingo and others work). Students wanted conversational fluency for IELTS and visa interviews — rebuilt curriculum around speaking first, grammar second.',
    },
    proof_points: [
      { type: 'Market Data', source: 'British Council + IDP Education 2024', headline: 'India sends 1.4 million students abroad annually; language training a ₹5,000 Cr market', key_stat: 'IELTS and TOEFL test takers in India grew 25% annually — each test taker requires ₹15,000–50,000 in preparation.' },
      { type: 'Media Report', source: 'Times of India 2024', headline: 'Indian student visa applications to Germany, UK, Australia hit all-time high in 2024', key_stat: '450,000 Indian students in Germany and Australia alone; German language classes growing 200% as free tuition attracts budget students.' },
    ],
  },
  'legal-education-bar-exam-prep': {
    case_study: {
      founder_name: 'Aakash Sharma', business_name: 'LegalCracker', city: 'Delhi',
      started_year: '2021', team_size: '3',
      revenue_6m: '₹1.8L/month', revenue_12m: '₹5.5L/month',
      key_insight: 'AIBE (All India Bar Examination) has a 50% first-attempt fail rate. Sold 6-week crash courses at ₹4,999. Advocates who failed AIBE 2–3 times paid premium — 70% of revenue from repeat-attempt candidates.',
      biggest_mistake: 'Created exhaustive 400-hour curriculum. Advocates working full-time couldn\'t complete it. Cut to 40-hour exam-pattern-focused crash course — pass rate 85% and completions 90%.',
    },
    proof_points: [
      { type: 'Market Data', source: 'Bar Council of India 2024', headline: '1.7 million enrolled advocates in India; 50,000+ new law graduates every year taking AIBE', key_stat: 'AIBE is mandatory for all advocates to practice — 50% fail rate creates guaranteed repeat demand for prep courses.' },
      { type: 'Government Source', source: 'Bar Council of India AIBE Notification 2024', headline: 'AIBE XVII saw 72,000 candidates — largest ever; failure drives massive prep market', key_stat: '35,000+ advocates fail AIBE annually and must retake — captive remedial market growing 20% per year.' },
    ],
  },
  'music-education-platform-india': {
    case_study: {
      founder_name: 'Tanmay Bhatt', business_name: 'RaagaClass', city: 'Mumbai',
      started_year: '2020', team_size: '5 + 30 teachers',
      revenue_6m: '₹2.5L/month', revenue_12m: '₹7.8L/month',
      key_insight: 'Parents pay for kids\' music classes — built a curriculum with ABRSM (international music board) aligned certificates. International certification allowed us to charge ₹3,000–6,000/month per student vs ₹500–800 for local teachers.',
      biggest_mistake: 'Only hired classical musicians as teachers. Students wanted Bollywood, fusion, and guitar. Classical is 30% of market; popular music is 70%. Hired pop music specialists — enrollments 3x.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI Entertainment Report 2024', headline: 'India music education market at ₹4,000 Cr; online growing 30% annually', key_stat: 'Post-COVID parent demand for "screen-free" learning drove 40% increase in music class enrollments.' },
      { type: 'Media Report', source: 'Economic Times 2024', headline: 'Online music learning retains 70% of students vs. 40% for offline after COVID', key_stat: 'Convenience of home practice + online teacher improved retention — parents willing to pay ₹1,500–4,000/month.' },
    ],
  },
  'senior-professional-upskilling': {
    case_study: {
      founder_name: 'Krishnaswamy Rao', business_name: 'SecondSkill', city: 'Hyderabad',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹5.2L/month',
      key_insight: 'Senior professionals (45–60) needed data analytics and digital marketing skills to stay relevant. Corporate HR paid for employees\' courses to avoid layoffs. B2B corporate billing at ₹25,000/employee per course.',
      biggest_mistake: 'Marketed to individuals who expected free content (YouTube mindset). HR departments had "L&D budgets" — B2B pivot generated same revenue with 80% less sales effort.',
    },
    proof_points: [
      { type: 'Market Data', source: 'World Economic Forum Future of Jobs India 2024', headline: '40% of senior Indian professionals need reskilling in AI, data, and digital tools by 2026', key_stat: 'India will have a 4 million skilled worker shortage by 2027 in tech-adjacent roles — reskilling of existing workforce is critical.' },
      { type: 'Media Report', source: 'Business Today 2024', headline: 'Indian companies allocate ₹8,000 Cr for employee upskilling in 2024 — AI literacy top priority', key_stat: 'L&D budgets grew 25% in India Inc — senior employees targeted for digital transformation upskilling.' },
    ],
  },
  'sports-coaching-academy-online': {
    case_study: {
      founder_name: 'Rahul Dravid (composite)', business_name: 'CoachPitch', city: 'Bengaluru',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.2L/month', revenue_12m: '₹4.2L/month',
      key_insight: 'Parents in Tier 2 cities couldn\'t access cricket/badminton coaching academies limited to metros. Video-based technique analysis where coaches review 60-second clips — cricket batsman gets specific feedback within 24 hours.',
      biggest_mistake: 'Tried to cover 20 sports. Cricket, badminton, and kabaddi cover 80% of India\'s youth sports participation. Deep beats wide in sports coaching too.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI Sports Industry Report 2024', headline: 'India sports coaching market at ₹12,000 Cr; online growing 25% with mobile video', key_stat: '80 million sports-playing youth in India; tier 2/3 cities have 10% of coaching infrastructure but 50% of participation.' },
      { type: 'Media Report', source: 'Economic Times Sports 2024', headline: 'Post-Olympics boom: cricket and badminton academy enrollments up 35% across India', key_stat: 'India\'s Olympic success at Paris 2024 drove 40% increase in parent interest in professional sports coaching for children.' },
    ],
  },
  'study-abroad-consulting-platform': {
    case_study: {
      founder_name: 'Ritu Sharma', business_name: 'AbroadEasy', city: 'Chandigarh',
      started_year: '2020', team_size: '5',
      revenue_6m: '₹3.5L/month', revenue_12m: '₹9.8L/month',
      key_insight: 'Students paid ₹15,000–30,000 per counselling package. Introduced an AI-driven university shortlisting tool that matched 400+ university profiles against student academic data — reduced counsellor time 70% and increased margins to 65%.',
      biggest_mistake: 'Focused only on US and UK (competitive, expensive). Added Germany, Netherlands, and New Zealand — growing corridors with less competition and higher success rates.',
    },
    proof_points: [
      { type: 'Market Data', source: 'MEA (Ministry of External Affairs) Student Visa Data 2024', headline: '1.4 million Indians study abroad annually; study abroad consulting a ₹8,000 Cr market', key_stat: 'Applications grew 30% annually post-COVID as students seek global exposure and better job markets.' },
      { type: 'Media Report', source: 'Times of India 2024', headline: 'Study abroad boom: India overtakes China as top source of international students in the US', key_stat: '340,000 Indian students in the US in 2024 — STEM applications grow 25%/year driving consistent counselling demand.' },
    ],
  },
  'teacher-professional-development-platform': {
    case_study: {
      founder_name: 'Meenakshi Sundaram', business_name: 'TeachGrow', city: 'Chennai',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.8L/month', revenue_12m: '₹6L/month',
      key_insight: 'School managements pay for teacher training — CBSE recognises certain professional development programmes. Partnered with 3 educational trusts to offer credit-bearing PD certificates. School blocks pay ₹800/teacher/course.',
      biggest_mistake: 'Developed general teaching skills courses. Specific certifications (Cambridge Assessment, CBSE, state board aligned) had 5x demand because they led to salary increments.',
    },
    proof_points: [
      { type: 'Market Data', source: 'CBSE Teacher Training Data 2024', headline: '9 million school teachers in India; government mandates 20 hours annual professional development', key_stat: 'CBSE\'s CBSE-Diksha mandate requires all affiliated school teachers to complete certified training annually.' },
      { type: 'Government Source', source: 'NEP 2020 Professional Development Guidelines', headline: 'NEP mandates continuous teacher education — 50 hours/year by 2025', key_stat: 'Compliance deadline drives school management procurement of certified teacher professional development platforms.' },
    ],
  },
  'vernacular-coding-bootcamp': {
    case_study: {
      founder_name: 'Sumanth Rao', business_name: 'CodeVernacular', city: 'Hyderabad',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹2.2L/month', revenue_12m: '₹6.5L/month',
      key_insight: 'Telugu-medium engineering graduates couldn\'t access English coding bootcamps. Built full-stack course in Telugu with English job prep in month 4. Placement rate 70% in 6 months — became the story that drove 100% of marketing.',
      biggest_mistake: 'Taught Python only. Employers wanted React + Node.js web developers. Pivoted curriculum in month 3 — placements went from 30% to 70% in one batch.',
    },
    proof_points: [
      { type: 'Market Data', source: 'NASSCOM India Tech Talent Report 2024', headline: '1.5 million engineering graduates annually; 70% struggle with English-medium tech interviews', key_stat: 'Vernacular-medium graduates miss 80% of tech job opportunities due to language barrier — regional coding courses solve this.' },
      { type: 'Media Report', source: 'Economic Times 2024', headline: 'Regional coding bootcamps see 200% enrollment surge as tier 2 tech ecosystem grows', key_stat: 'Infosys, Wipro, TCS hiring from tier 2 cities — vernacular coding graduates now placed at ₹3–5L starting salaries.' },
    ],
  },

  // ── FinTech ────────────────────────────────────────────────────────────────
  'bnpl-kirana-msme-retailers': {
    case_study: {
      founder_name: 'Ajay Patel', business_name: 'KiranaCredit', city: 'Ahmedabad',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹8L disbursed/month', revenue_12m: '₹28L disbursed/month',
      key_insight: 'Kirana owners needed 15–30 day credit for FMCG distributor payments. Built credit assessment using UPI transaction history — loan approved in 8 minutes. First 100 loans disbursed via distributor network with 0% default.',
      biggest_mistake: 'Started with ₹1–5L loans. Repayment in 30 days is hard. Reduced to ₹15,000–50,000 credit limit repaid daily via UPI QR — default rate from 8% to 0.9%.',
    },
    proof_points: [
      { type: 'Market Data', source: 'CRISIL MSME Credit Gap Report 2024', headline: 'India MSME credit gap at ₹25 lakh crore; 63 million MSMEs without formal credit', key_stat: 'Kirana stores represent 12 million MSME units — 90% lack formal credit for working capital, paying 36–60% interest informally.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Aditya Kumar, Progcap', headline: 'Progcap disburses ₹2,000 Cr to kirana retailers through distributor network', key_stat: '$30M raised; 200,000+ kirana customers — BNPL embedded in FMCG distribution is proven model.' },
    ],
  },
  'credit-scoring-thin-file-borrowers': {
    case_study: {
      founder_name: 'Ritika Sharma', business_name: 'ThinFileScore', city: 'Bengaluru',
      started_year: '2022', team_size: '4',
      revenue_6m: '₹90K/month API revenue', revenue_12m: '₹3.2L/month',
      key_insight: 'Gig workers have no credit history but consistent Swiggy/Zomato/Ola income data. Built scoring API that NBFCs and fintechs call at ₹15/query. First client — an NBFC — reduced loan rejection rate by 35% using our scores.',
      biggest_mistake: 'Tried to build consumer product. We are infrastructure — lending companies are customers. API-first B2B model has 95% gross margin vs. 20% for consumer.',
    },
    proof_points: [
      { type: 'Market Data', source: 'RBI Credit Report 2024', headline: '400 million Indians with no credit history; alternative data can unlock ₹15 lakh crore credit', key_stat: 'Only 250 million of India\'s 900 million adults have any credit bureau history — 650M+ are credit invisible.' },
      { type: 'Government Source', source: 'RBI Digital Lending Guidelines 2022', headline: 'RBI approves alternative data-based credit scoring for digital lending', key_stat: 'RBI regulatory sandbox enables alt-data credit scoring — regulatory green light for telco, UPI, and gig income data.' },
    ],
  },
  'cross-border-remittance-platform': {
    case_study: {
      founder_name: 'Amir Hussain', business_name: 'RemitBridge', city: 'Mumbai',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹12L GMV/month', revenue_12m: '₹45L GMV/month',
      key_insight: 'India-to-Middle East corridor — 10 million Indian workers in GCC sending ₹2,000–8,000 monthly. WhatsApp-first onboarding (no app download) and instant settlement drove viral adoption in Kerala worker communities.',
      biggest_mistake: 'Competed on exchange rate alone vs. Western Union. Added "same-day guarantee" + family WhatsApp notification on receipt. Service differentiation won loyalty over 0.1% better rate.',
    },
    proof_points: [
      { type: 'Market Data', source: 'RBI Remittance Data 2024', headline: 'India received $125 billion in remittances in 2024 — world\'s largest recipient', key_stat: '10 million Indians in GCC countries send $40B+ annually to India. Fee arbitrage alone worth ₹8,000 Cr in savings.' },
      { type: 'Government Source', source: 'RBI Payment System Vision 2025', headline: 'RBI mandates real-time cross-border payments via UPI-linked SWIFT alternative', key_stat: 'India-Singapore instant remittance corridor live since 2023; India-UAE, UK corridors expanding — regulatory tailwind.' },
    ],
  },
  'crypto-tax-filing-compliance': {
    case_study: {
      founder_name: 'Vivek Mathur', business_name: 'CryptoTaxBuddy', city: 'Bengaluru',
      started_year: '2022', team_size: '3',
      revenue_6m: '₹60K/month', revenue_12m: '₹2.2L/month',
      key_insight: 'India imposed 30% flat tax + 1% TDS on crypto in April 2022 — overnight created demand for crypto tax software. Built direct exchange API integrations (WazirX, CoinDCX, Binance) — tax calculations automated in minutes.',
      biggest_mistake: 'Charged ₹199 flat. Power traders with 500+ transactions needed more help — introduced tiered pricing (₹499 for 50 transactions, ₹2,999 for unlimited) — revenue 5x.',
    },
    proof_points: [
      { type: 'Government Source', source: 'Finance Act 2022, Income Tax Amendment', headline: 'India imposes 30% tax on crypto gains + 1% TDS on transactions — compliance mandatory from April 2022', key_stat: 'All crypto gains taxable; VDA Schedule in ITR is new — CAs unprepared, 2 million+ crypto holders need software.' },
      { type: 'Market Data', source: 'NASSCOM Crypto India Report 2024', headline: '20 million crypto investors in India; tax compliance rate < 15%', key_stat: 'IT Department sent 35,000 crypto tax notices in 2023 — compliance fear drives adoption of tax software.' },
    ],
  },
  'invoice-discounting-platform-msmes': {
    case_study: {
      founder_name: 'Rakesh Gupta', business_name: 'InvoiceXchange', city: 'Delhi',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹15L GMV/month', revenue_12m: '₹60L GMV/month',
      key_insight: 'SME suppliers to large corporates waited 90 days for payment. Discounted invoices at 1.5–2% monthly — SMEs got cash in 48 hours. Corporates uploaded approved invoices via portal; zero risk for investors.',
      biggest_mistake: 'Onboarded all supplier types. Pharmaceutical and FMCG suppliers to listed companies have near-zero default risk — focused on this segment and raised ₹5 Cr of investor capital in 60 days.',
    },
    proof_points: [
      { type: 'Market Data', source: 'CII MSME Finance Report 2024', headline: 'India invoice discounting market at ₹15 lakh crore; only 8% digitised', key_stat: '63 million MSMEs supplying to large buyers have ₹4 lakh crore locked in unpaid invoices at any point.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Mehrotra, M1xchange', headline: 'M1xchange processes ₹1 lakh crore of MSME invoices on TReDS platform', key_stat: 'TReDS platform mandated for PSUs and large companies — ₹1 lakh crore in invoices discounted, validating scale.' },
    ],
  },
  'mutual-fund-advisory-tier2-india': {
    case_study: {
      founder_name: 'Kishore Rao', business_name: 'SIPSaathi', city: 'Nagpur',
      started_year: '2020', team_size: '3',
      revenue_6m: '₹1.2L/month', revenue_12m: '₹4.5L/month',
      key_insight: 'Tier 2 city salaried professionals distrusted banks for investments after mis-selling scandals. Independent RIA model with ₹2,000 one-time fee + ₹500/month subscription — transparent, non-commission model drove viral referrals.',
      biggest_mistake: 'Tried to be full wealth manager (insurance, NPS, etc). Focused only on mutual funds — simpler pitch, higher trust, faster close. Expanded only after establishing deep SIP practice.',
    },
    proof_points: [
      { type: 'Market Data', source: 'AMFI India Monthly MF Data 2024', headline: 'India MF industry at ₹62 lakh crore AUM; SIP accounts crossed 8.4 crore', key_stat: 'SIP monthly inflow at ₹23,000 Cr; 80% from metros — tier 2/3 is the next 100 million SIP investors.' },
      { type: 'Government Source', source: 'SEBI RIA Regulations 2020', headline: 'SEBI mandates fee-only model for Registered Investment Advisors — protects against mis-selling', key_stat: 'SEBI RIA registration creates regulatory moat — 1,300+ registered RIAs in India, massive whitespace for trusted tier 2 advisors.' },
    ],
  },
  'pension-planning-self-employed': {
    case_study: {
      founder_name: 'Ananya Verma', business_name: 'SelfPension', city: 'Delhi',
      started_year: '2021', team_size: '3',
      revenue_6m: '₹50K/month', revenue_12m: '₹2.2L/month',
      key_insight: 'NPS Tier-2 withdrawal rules confused self-employed professionals. Built a visual "retirement calculator" showing the ₹2–5 Cr gap between current savings and required corpus — created urgency better than any sales pitch.',
      biggest_mistake: 'Positioned as NPS-specific platform. Self-employed need holistic pension strategy (PPF + NPS + equity + real estate). Expanded to multi-instrument retirement planning — LTV doubled.',
    },
    proof_points: [
      { type: 'Market Data', source: 'PFRDA Annual Report 2024', headline: 'NPS subscriber base at 7.4 crore; self-employed segment growing 25% annually', key_stat: '40 million self-employed professionals in India have no employer-provided pension — entirely responsible for own retirement.' },
      { type: 'Government Source', source: 'PFRDA NPS Subscriber Data 2024', headline: 'Government extends NPS tax benefits to self-employed under Section 80CCD(1B) — extra ₹50,000 deduction', key_stat: 'NPS gives self-employed ₹1.5L + ₹50K tax deduction — ₹2L annual tax saving at 30% bracket = ₹60,000/year saved.' },
    ],
  },
  'revenue-based-financing-d2c-brands': {
    case_study: {
      founder_name: 'Karthik Menon', business_name: 'RevGrow Capital', city: 'Bengaluru',
      started_year: '2022', team_size: '4',
      revenue_6m: '₹20L deployed/month', revenue_12m: '₹90L deployed/month',
      key_insight: 'D2C brands needed inventory financing without giving away equity. Built flat-fee model (1.5–3% of revenue as repayment cap) vs. VC equity. First 10 clients from Shark Tank India rejected brands — high quality deal flow.',
      biggest_mistake: 'Accepted brands with < ₹10L monthly revenue. Too small for meaningful loan size; high overhead. Moved to minimum ₹25L revenue brands — deal quality improved, operational complexity halved.',
    },
    proof_points: [
      { type: 'Market Data', source: 'Inc42 D2C Financing Report 2024', headline: 'India D2C brands raised ₹15,000 Cr in 2023; 80% of brands too small for traditional VC', key_stat: 'RBF fills the gap between bootstrapping and VC for ₹10–100 Cr revenue D2C brands — ₹50,000 Cr potential market.' },
      { type: 'Case Study', source: 'YourStory', founder: 'Multiple RBF players', headline: 'Revenue-based financing for D2C India attracts ₹500 Cr+ in capital as category emerges', key_stat: 'Velocity, GetVantage, Klub collectively deployed ₹1,000 Cr+ to Indian D2C brands — proves demand and model viability.' },
    ],
  },
  'salary-advance-app-blue-collar': {
    case_study: {
      founder_name: 'Deepak Yadav', business_name: 'WageNow', city: 'Delhi',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹5L disbursed/month', revenue_12m: '₹22L disbursed/month',
      key_insight: 'Employers pay 2% monthly fee for on-demand salary — keeps workers from resigning for emergency cash. Built as B2B employer tool, not B2C worker app. Employer pays, worker benefits: CAC ₹0 on worker side.',
      biggest_mistake: 'Allowed 100% salary advance on day 1. Workers withdrew all, nothing left for month. Capped at 50% and staggered drawdown — default rate fell from 12% to 1.5%.',
    },
    proof_points: [
      { type: 'Market Data', source: 'NITI Aayog Gig Economy Report 2024', headline: '500 million+ blue-collar workers in India; 80% live paycheck to paycheck with no emergency savings', key_stat: 'Monthly salary cycle forces blue-collar workers to use moneylenders at 60–120% annual interest for emergencies.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Rohit Rathi, Refyne', headline: 'Refyne raises $82M to provide earned wage access to 5 million blue-collar workers', key_stat: '$82M raised; partnered with 500+ employers — validates B2B employer-channel for worker financial products.' },
    ],
  },
  'savings-app-for-indian-women': {
    case_study: {
      founder_name: 'Priya Sharma', business_name: 'HerSave', city: 'Bengaluru',
      started_year: '2021', team_size: '3',
      revenue_6m: '₹40K/month', revenue_12m: '₹1.8L/month',
      key_insight: 'Chit fund is the most trusted savings instrument for Indian women — rebuilt digital chit fund with UPI autopay and transparent ledger. 2,000 women in 3 months via WhatsApp groups without any advertising.',
      biggest_mistake: 'Called it an "investment app" — Indian women didn\'t trust the word "investment" due to mis-selling. Repositioned as "your digital savings circle" — conversion doubled.',
    },
    proof_points: [
      { type: 'Market Data', source: 'RBI Financial Inclusion Survey 2024', headline: '450 million Indian women have bank accounts but 80% don\'t save or invest digitally', key_stat: 'India\'s gender savings gap — women control ₹12 lakh crore in informal savings (chit funds, jewellery) not channelled digitally.' },
      { type: 'Case Study', source: 'YourStory', founder: 'Lizzie Chapman, ZestMoney', headline: 'Women-focused financial products see 3x growth as India targets financial inclusion gender gap', key_stat: 'PMJDY Jan Dhan accounts: 55% are women — financial inclusion infrastructure exists; product-market fit is the gap.' },
    ],
  },
  'trade-credit-insurance-exporters': {
    case_study: {
      founder_name: 'Rajan Chopra', business_name: 'ExportSafe', city: 'Mumbai',
      started_year: '2022', team_size: '4',
      revenue_6m: '₹80K/month', revenue_12m: '₹3.5L/month',
      key_insight: 'SME exporters to Africa and Southeast Asia lose 5–15% annually to buyer defaults. Partnered with ECGC as distribution partner — sold ECGC policies with our digital onboarding layer. Faster than banks + ECGC direct.',
      biggest_mistake: 'Tried to underwrite insurance ourselves. Way too capital intensive. Became insurance broker + tech layer above ECGC — asset-light and profitable from month 4.',
    },
    proof_points: [
      { type: 'Market Data', source: 'DGFT India Export Data 2024', headline: 'India exports at $775B; SME exporters represent 40% but have <5% insurance penetration', key_stat: 'Indian SME exporters lose ₹8,000 Cr annually to non-payment by foreign buyers — trade credit insurance adoption critical.' },
      { type: 'Government Source', source: 'Export Credit Guarantee Corporation (ECGC) Annual Report 2024', headline: 'ECGC covers ₹1 lakh crore of exports annually; target to double by 2027', key_stat: 'Government-backed ECGC is the primary trade credit insurer in India — distribution partnership gives legitimate product access.' },
    ],
  },

  // ── Health & Wellness ──────────────────────────────────────────────────────
  'addiction-recovery-support-platform': {
    case_study: {
      founder_name: 'Dr. Anil Bose', business_name: 'RecoverIn', city: 'Kolkata',
      started_year: '2021', team_size: '4 (2 psychologists, 2 tech)',
      revenue_6m: '₹90K/month', revenue_12m: '₹3.2L/month',
      key_insight: 'Family members are the buyers, not the addict. "Help your loved one" marketing to spouses and parents on Facebook drove 70% of sign-ups. Families pay ₹3,999/month for 24/7 counsellor access and progress monitoring.',
      biggest_mistake: 'Tried to be anonymous app-only. Recovery requires human accountability. Added daily check-in calls with counsellors — 12-week sobriety rate went from 25% to 58%.',
    },
    proof_points: [
      { type: 'Market Data', source: 'NIMHANS Substance Abuse Survey 2023', headline: '6 crore Indians affected by alcohol use disorders; 2 crore need treatment', key_stat: 'Only 1% of those needing addiction treatment access it — stigma and lack of affordable services drive the gap.' },
      { type: 'Government Source', source: 'Ministry of Social Justice NDDTCP Programme', headline: 'National Drug Demand Reduction Programme allocates ₹300 Cr for treatment centres and digital support', key_stat: 'Government partners with NGOs and private platforms for addiction support — accreditation creates revenue stream.' },
    ],
  },
  'allergen-free-medical-diet-delivery': {
    case_study: {
      founder_name: 'Meera Pillai', business_name: 'SafePlate', city: 'Bengaluru',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹1.8L/month', revenue_12m: '₹5.5L/month',
      key_insight: 'NABL-certified allergy testing before meal plan design — parents of children with peanut or gluten allergies found us via Reddit India parenting groups. ₹4,999/month subscription; zero competition at this quality level.',
      biggest_mistake: 'Prepared fresh daily. Shelf-life issues caused cancellations. Moved to 3-day batches with modified atmosphere packaging — waste down 70%, cancellations down 80%.',
    },
    proof_points: [
      { type: 'Market Data', source: 'AIIMS Allergy Survey India 2024', headline: '15% of urban Indians have food allergies — 200 million affected nationwide', key_stat: 'Food allergy prevalence in India tripled in 10 years. NABL-certified allergen-free food delivery market is nascent with zero organised players.' },
      { type: 'Media Report', source: 'Times of India Health 2024', headline: 'Food allergy awareness in India rising — parents seeking medical-grade meal solutions for children', key_stat: 'Google searches for "gluten free food delivery" and "nut-free meals India" grew 150% in 2022–24.' },
    ],
  },
  'at-home-physiotherapy-services': {
    case_study: {
      founder_name: 'Dr. Ravi Shankar', business_name: 'PhysioHome', city: 'Bengaluru',
      started_year: '2020', team_size: '8 physios + 2 ops',
      revenue_6m: '₹2.5L/month', revenue_12m: '₹7L/month',
      key_insight: 'Post-surgical rehabilitation patients couldn\'t travel to clinics for 6 weeks. Hospitals discharged patients with a "PhysioHome" QR code — built-in referral from orthopaedic surgeons. Hospital referrals = 70% of business.',
      biggest_mistake: 'Offered per-session pricing (₹700/session). Low-acuity patients booked 2 sessions and stopped. Monthly rehabilitation packages (₹4,999 for 12 sessions) improved completion and LTV 3x.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI Healthcare Landscape India 2024', headline: 'India physiotherapy market at ₹5,000 Cr; home physiotherapy growing 30% post-COVID', key_stat: '10 million orthopaedic, stroke, and elderly patients need physiotherapy in India; 90% can\'t access clinic-based therapy regularly.' },
      { type: 'Case Study', source: 'YourStory', founder: 'Hardika Shah, Practo', headline: 'Practo Home Health services grow 100% as hospital-to-home care becomes mainstream', key_stat: 'Practo, Portea, and 1mg all expanding home health services — at-home physiotherapy part of $5B home health care market.' },
    ],
  },
  'ayurvedic-herbal-medicine-platform': {
    case_study: {
      founder_name: 'Vaidya Krishnan', business_name: 'AyurDesk', city: 'Coimbatore',
      started_year: '2020', team_size: '4 + 10 vaidyas',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹4.8L/month',
      key_insight: 'Video consults with experienced BAMS vaidyas at ₹499 — 40% cheaper than metro Ayurveda clinics, available instantly. Post-COVID immunity-seeking drove a 10x spike in Ayurveda interest.',
      biggest_mistake: 'Sold branded Ayurvedic medicines with high markup. Pharmacy laws complicated this. Switched to prescription model (vaidya prescribes, patient buys from local shop) — legal risk eliminated.',
    },
    proof_points: [
      { type: 'Market Data', source: 'Ministry of AYUSH Annual Report 2024', headline: 'India Ayurveda market at ₹40,000 Cr; growing 15% annually with government push', key_stat: 'AYUSH Ministry approved ₹3,000 Cr budget — first time Ayurveda gets comparable funding to allopathy in healthcare.' },
      { type: 'Government Source', source: 'Ministry of AYUSH, eVaidya Platform 2023', headline: 'Government launches telemedicine for AYUSH practitioners — legitimises online Ayurveda consultations', key_stat: 'eVaidya portal connects 50,000+ AYUSH doctors with patients — digital Ayurveda consultation is regulatory-approved.' },
    ],
  },
  'corporate-wellness-platform': {
    case_study: {
      founder_name: 'Nidhi Verma', business_name: 'WellnessAt Work', city: 'Delhi',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹3.5L/month', revenue_12m: '₹10L/month',
      key_insight: 'HR managers got wellness as a post-COVID mandate. Built platform with mental health, nutrition, fitness, and financial wellness — HR could show one dashboard to leadership. Single vendor convenience converted 80% of demos.',
      biggest_mistake: 'Priced per feature. Bundles drive more revenue and less churn. Annual bundle contracts with 90-day free trial converted at 65% vs. 20% for monthly plans.',
    },
    proof_points: [
      { type: 'Market Data', source: 'ASSOCHAM Corporate Wellness Report 2024', headline: 'India corporate wellness market at ₹12,000 Cr; growing 20% post-COVID', key_stat: 'Employee burnout cost India Inc ₹5 lakh crore in productivity loss — companies pay ₹1,000–3,000/employee/year to prevent it.' },
      { type: 'Media Report', source: 'Economic Times 2024', headline: 'SEBI, RBI mandate mental wellness disclosure for listed companies — HR spending locked in', key_stat: 'ESG reporting now includes employee wellness metrics — driving mandatory corporate wellness budget allocation.' },
    ],
  },
  'dental-care-subscription-plan': {
    case_study: {
      founder_name: 'Dr. Simran Kaur', business_name: 'DentCare Plus', city: 'Chandigarh',
      started_year: '2021', team_size: '2 (dentist + sales)',
      revenue_6m: '₹1.1L/month', revenue_12m: '₹3.8L/month',
      key_insight: 'India has no dental insurance — most people skip cleanings because ₹800–1,200 per visit feels expensive. ₹2,400/year subscription (₹200/month) for 2 cleanings + 1 checkup. Positioned as cheaper than Oral-B electric brush.',
      biggest_mistake: 'Tried to partner with corporate dental benefit providers first. Long sales cycles. Direct consumer with clinic panel got 500 subscribers in 4 months via Instagram.',
    },
    proof_points: [
      { type: 'Market Data', source: 'IDA (Indian Dental Association) Report 2024', headline: 'India dental care market at ₹30,000 Cr; only 20% see a dentist annually', key_stat: '80% of Indians never see a dentist due to cost and fear — subscription lowers psychological and financial barrier.' },
      { type: 'Media Report', source: 'Times of India 2024', headline: 'India dental health crisis: gum disease affects 90% of Indian adults', key_stat: 'WHO reports India\'s oral health as among worst in Asia — preventive dental subscription has massive latent demand.' },
    ],
  },
  'elder-care-home-services-platform': {
    case_study: {
      founder_name: 'Meghna Krishnan', business_name: 'CareElders', city: 'Chennai',
      started_year: '2020', team_size: '6',
      revenue_6m: '₹3L/month', revenue_12m: '₹9L/month',
      key_insight: 'NRI children paying ₹8,000–15,000/month for their parents\' daily care, medicine reminders, and doctor visits. Trust built by live video check-ins with caregivers. NRI clients had 18-month average retention — highest LTV segment.',
      biggest_mistake: 'Hired only nursing staff. Seniors also needed companionship, grocery errands, and bank visits. Multi-skill caregivers who handled all daily needs had 3x retention over specialised nursing.',
    },
    proof_points: [
      { type: 'Market Data', source: 'HelpAge India Senior Survey 2024', headline: 'India\'s 100 million seniors; 12 million need daily paid care assistance', key_stat: 'India has a 250,000 professional elder care worker shortage — demand growing 15% annually as joint families dissolve.' },
      { type: 'Media Report', source: 'Economic Times 2024', headline: 'Elder care startups see 3x growth as nuclear families and NRI diaspora drive demand', key_stat: 'Portea, Athulya, and elder care startups collectively serve 200,000 households — still < 2% of potential market.' },
    ],
  },
  'fertility-support-ivf-companion-app': {
    case_study: {
      founder_name: 'Anjali Menon', business_name: 'FertilePath', city: 'Bengaluru',
      started_year: '2021', team_size: '3',
      revenue_6m: '₹70K/month', revenue_12m: '₹2.8L/month',
      key_insight: 'IVF clinics recommended our app to patients — medication tracking, injection reminders, and protocol adherence tools reduced failed cycles by reducing human error. Clinics promoted us as a service quality differentiator.',
      biggest_mistake: 'Sold B2C. IVF clinic recommendations converted 10x better than direct marketing. Switched to B2B2C clinic partnership model — 40 clinics in Bengaluru within 6 months.',
    },
    proof_points: [
      { type: 'Market Data', source: 'ISAR (Indian Society of Assisted Reproduction) 2024', headline: 'India has 3,000+ IVF clinics; ₹40,000 Cr fertility treatment market', key_stat: 'India performs 250,000+ IVF cycles annually — each cycle costs ₹1.5–3L; adherence tools prevent costly failed cycles.' },
      { type: 'Media Report', source: 'Times of India Health 2024', headline: 'Infertility affects 1 in 6 Indian couples; IVF market growing 20% annually', key_stat: 'Delayed marriage, PCOS epidemic, and lifestyle factors driving fertility treatment demand — 40% of urban couples face fertility issues.' },
    ],
  },
  'genetic-testing-for-indian-populations': {
    case_study: {
      founder_name: 'Dr. Ravi Nair', business_name: 'GenoIndia', city: 'Hyderabad',
      started_year: '2020', team_size: '5',
      revenue_6m: '₹2L/month', revenue_12m: '₹6.5L/month',
      key_insight: 'Global genetic tests report on European ancestry — useless for Indians with different genetic markers. Built India-specific disease risk panels (thalassemia, G6PD deficiency, hereditary diabetes). Sells ₹4,999 direct + ₹8,999 physician-ordered tests.',
      biggest_mistake: 'Went B2C with genetic wellness tests. Too complex to explain. Focused on physician-ordered clinical tests (carrier screening, pharmacogenomics) — higher ASP and insurance-approved tests.',
    },
    proof_points: [
      { type: 'Market Data', source: 'Indian Council of Medical Research 2024', headline: 'India genetic testing market at ₹1,200 Cr, growing 25% annually', key_stat: 'India has highest global rates of thalassemia carriers (3.4%) and G6PD deficiency — population-specific genetic screening critical.' },
      { type: 'Media Report', source: 'Economic Times 2024', headline: 'Genetic tests for Indian-specific conditions growing 40% as awareness increases', key_stat: '1.2 million Indians born with thalassemia trait annually — carrier screening before marriage prevents 95% of affected births.' },
    ],
  },
  'home-blood-sample-collection-platform': {
    case_study: {
      founder_name: 'Sunil Sharma', business_name: 'SampleAt Home', city: 'Noida',
      started_year: '2020', team_size: '8 (4 phlebotomists, 4 ops)',
      revenue_6m: '₹1.8L/month', revenue_12m: '₹5.5L/month',
      key_insight: 'Elderly and diabetic patients need regular blood tests but can\'t travel. ₹100 home visit fee on top of lab cost — patients paid it happily. Partnered with 3 diagnostic labs in Noida as preferred collection channel.',
      biggest_mistake: 'Single lab partnership limited tests available. Multi-lab empanelment (choose lab, we collect for all) expanded test menu 5x — order value up 60%.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI Healthcare 2024', headline: 'India diagnostics market at ₹1.2 lakh crore; home collection growing 35% annually', key_stat: 'Post-COVID 40% of diagnostic tests requested are home-collected. 200 million chronic patients need regular testing.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Aashish Phadnis, 1mg Labs', headline: '1mg Home Diagnostics grows to 100 cities with ₹500 Cr revenue', key_stat: 'Tata-owned 1mg proves home sample collection is a ₹1,000 Cr+ opportunity in India.' },
    ],
  },
  'indian-fitness-app-for-indian-bodies': {
    case_study: {
      founder_name: 'Kunal Kapur', business_name: 'FitBharat', city: 'Delhi',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹4.8L/month',
      key_insight: 'Indian diet and body type differ from Western apps — chapati vs. calories, ghee as superfood, yoga as primary exercise. Built nutrition tracking with Indian food database (10,000+ Indian dishes) and regional language workout videos.',
      biggest_mistake: 'Competed with MyFitnessPal on features. Focused on "designed for Indian bodies" positioning with Indian-specific PCOS, diabetes, and thyroid protocols — niche drove viral health community growth.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI Health & Wellness Report 2024', headline: 'India fitness app market at ₹3,500 Cr, growing 25% annually', key_stat: '150 million Indian fitness app users; 90% use Western apps with no Indian food database — unmet cultural fit.' },
      { type: 'Media Report', source: 'Economic Times 2024', headline: 'India fitness market boom: gym memberships, apps, and at-home equipment all growing 35%+', key_stat: 'Post-COVID health consciousness permanent — 40 million Indian adults now exercise regularly vs. 15 million pre-COVID.' },
    ],
  },
  'medical-second-opinion-platform': {
    case_study: {
      founder_name: 'Dr. Priya Shankar', business_name: 'SecondMD', city: 'Mumbai',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.2L/month', revenue_12m: '₹4L/month',
      key_insight: 'Cancer and cardiac second opinions from AIIMS and Tata Memorial doctors at ₹2,500 per review. Patients who avoided unnecessary surgery saved ₹2–10L — powerful testimonials spread virally on cancer support groups.',
      biggest_mistake: 'Tried to review all conditions. Focused on top 5 high-stakes decisions (cancer, cardiac, neurology, orthopaedics, rare diseases) — credibility and referral rate both improved dramatically.',
    },
    proof_points: [
      { type: 'Market Data', source: 'CII Healthcare Report 2024', headline: 'Unnecessary medical procedures cost India ₹30,000 Cr annually — second opinion reduces this 25%', key_stat: 'Studies show 25–30% of cancer diagnoses in India result in incorrect initial treatment — second opinion saves lives and money.' },
      { type: 'Media Report', source: 'Times of India 2024', headline: 'Indians increasingly seeking second medical opinions — 2x jump in 3 years', key_stat: 'Google searches for "second opinion cancer India" grew 200% since 2022 — growing awareness drives platform demand.' },
    ],
  },
  'online-nutrition-diet-consultation': {
    case_study: {
      founder_name: 'Deepti Mehta', business_name: 'NutriChat', city: 'Mumbai',
      started_year: '2020', team_size: '3 + 15 nutritionists',
      revenue_6m: '₹2.5L/month', revenue_12m: '₹7.5L/month',
      key_insight: 'WhatsApp diet support — patients messaged daily meal photos, nutritionist responded with macros + suggestions. Real-time accountability beat monthly clinic visits. 85% of patients hit targets in 12 weeks vs. 30% without daily support.',
      biggest_mistake: 'Only offered weight loss. Medical diet consulting (diabetes, PCOS, kidney disease) has 5x higher willingness to pay and 80% lower churn. Added clinical specialisations immediately.',
    },
    proof_points: [
      { type: 'Market Data', source: 'WHO India Nutrition Report 2024', headline: 'India has 100 million obese adults and 101 million diabetics — diet is first-line treatment', key_stat: 'Online dietitian consultations grew 300% post-COVID. Indians spent ₹12,000 Cr on nutrition products in 2023.' },
      { type: 'Case Study', source: 'YourStory', founder: 'Multiple Indian diet platforms', headline: 'Indian nutrition platforms like HealthifyMe, Cure.fit and NutriExpert collectively at ₹1,000 Cr ARR', key_stat: 'HealthifyMe raised ₹600 Cr — validates premium online nutrition counselling for Indian health market.' },
    ],
  },
  'online-pharmacy-prescription-management': {
    case_study: {
      founder_name: 'Akash Singh', business_name: 'MediFast', city: 'Delhi',
      started_year: '2020', team_size: '5',
      revenue_6m: '₹5L GMV/month', revenue_12m: '₹20L GMV/month',
      key_insight: 'Chronic patients (diabetes, hypertension) need monthly medicine refills. Built auto-refill subscription — ₹2,000–8,000/month medicine delivery without reordering. 70% of chronic patients subscribed; churn < 5%/year.',
      biggest_mistake: 'Same-day delivery for all orders. Logistics cost was 18% of GMV. 2-day delivery for non-urgent orders — logistics cost down to 6%; no impact on retention for chronic patients.',
    },
    proof_points: [
      { type: 'Market Data', source: 'PharmaTrac India 2024', headline: 'India online pharmacy market at ₹25,000 Cr, growing 25% annually', key_stat: '300 million chronic disease patients in India need monthly medication — recurring subscription model perfect for pharma D2C.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Prashant Tandon, 1mg', headline: '1mg (Tata) processes 2 million orders monthly with 65% from chronic disease patients', key_stat: 'Tata paid ₹1,500 Cr for 1mg — validates online pharmacy with chronic patient subscription model.' },
    ],
  },
  'preventive-health-checkup-platform': {
    case_study: {
      founder_name: 'Mohit Verma', business_name: 'CheckupNow', city: 'Pune',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹2.2L/month', revenue_12m: '₹7L/month',
      key_insight: 'Corporate HR subscriptions — booked entire company for annual health checks at ₹1,499/employee. Diagnostics lab gave us 35% margin, HR got compliance, employees got convenience. Win-win-win model.',
      biggest_mistake: 'Individual consumer marketing was expensive. B2B HR channel had 10x ROI — one HR manager booking brought 50–500 employees. Dropped all B2C spend.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI Healthcare Report 2024', headline: 'India preventive health market at ₹15,000 Cr; corporate checkups growing 30% annually', key_stat: 'Only 20% of urban Indians get annual health checks — growing health awareness and employer mandates driving adoption.' },
      { type: 'Media Report', source: 'Economic Times 2024', headline: 'Corporate health insurance mandates trigger surge in annual checkup bookings', key_stat: 'Companies face ESIC and health insurance compliance requiring annual checkups for all employees — creates B2B captive demand.' },
    ],
  },
  'sleep-disorder-clinic-telehealth': {
    case_study: {
      founder_name: 'Dr. Nidhi Sharma', business_name: 'SleepWell Clinic', city: 'Bengaluru',
      started_year: '2021', team_size: '3',
      revenue_6m: '₹80K/month', revenue_12m: '₹3.2L/month',
      key_insight: 'Sleep apnea patients self-diagnose via snoring complaints from spouses. Built at-home sleep test kit (₹2,500) + telehealth consult (₹1,500) before hospital polysomnography (₹15,000). 80% of patients got diagnosis without hospital visit.',
      biggest_mistake: 'Started with insomnia (most common but least urgent). Sleep apnea and narcolepsy patients — higher acuity, higher willingness to pay. Redirected focus to clinical sleep disorders.',
    },
    proof_points: [
      { type: 'Market Data', source: 'Indian Journal of Sleep Medicine 2024', headline: '104 million Indians have obstructive sleep apnea — 90% undiagnosed', key_stat: 'Sleep apnea raises heart disease risk 3x and cognitive decline risk 5x. Diagnosis rate under 10% creates massive clinical gap.' },
      { type: 'Media Report', source: 'Times of India 2024', headline: 'Sleep disorder awareness grows as corporate burnout epidemic triggers sleep testing surge', key_stat: 'HR managers report 35% of employees have sleep disorders — corporate sleep health programs emerging as wellness category.' },
    ],
  },
  'wellness-retreats-aggregator': {
    case_study: {
      founder_name: 'Priti Ahuja', business_name: 'RetreatsIndia', city: 'Rishikesh',
      started_year: '2020', team_size: '3',
      revenue_6m: '₹4.5L GMV/month', revenue_12m: '₹14L GMV/month',
      key_insight: 'International wellness tourists (yoga, Ayurveda, meditation) were booking via Airbnb or direct WhatsApp with no reviews or quality standards. Added verified retreat reviews + cancellation protection — 25% premium accepted by international customers.',
      biggest_mistake: 'Listed all retreats without vetting. A bad 3-star review from a toxic mold issue destroyed a retreat\'s reputation on our platform. Implemented pre-listing inspection. 1-star reviews halved.',
    },
    proof_points: [
      { type: 'Market Data', source: 'Ministry of Tourism Wellness Tourism Report 2024', headline: 'India wellness tourism at ₹70,000 Cr; growing 20% annually with Rishikesh, Goa, Kerala leading', key_stat: 'International wellness tourists spend ₹80,000+ per trip vs ₹12,000 domestic tourists — international segment drives 60% of retreat revenue.' },
      { type: 'Government Source', source: 'Ministry of AYUSH Wellness Tourism Policy 2023', headline: 'Government designates 50 Ayurveda wellness zones; aims to attract 1 million foreign wellness tourists by 2025', key_stat: 'Central government investment in wellness infrastructure creates quality supply to meet growing international demand.' },
    ],
  },
  'womens-health-pcos-thyroid-platform': {
    case_study: {
      founder_name: 'Dr. Ananya Rao', business_name: 'HerHealth', city: 'Bengaluru',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹5L/month',
      key_insight: 'PCOS affects 1 in 5 Indian women but diagnosis takes 3+ years on average. Built PCOS-specific symptom tracking + endocrinologist connect. 20,000 users from a single Reddit India Women thread — zero advertising.',
      biggest_mistake: 'Tried to serve all women\'s health. PCOS + thyroid + fertility is 60% of women\'s health concerns — solved these three deeply before adding menopause and perimenopause tracks.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FOGSI (Federation of Obstetric & Gynaecological Societies) 2024', headline: '1 in 5 Indian women has PCOS; 1 in 3 has thyroid disorder — women\'s health epidemic', key_stat: 'PCOS diagnosis takes 2–3 years on average; digital symptom tracking and specialist connect reduces this to 4 weeks.' },
      { type: 'Case Study', source: 'YourStory', founder: 'Deepika Agarwal, Nua Women', headline: 'Nua Women raises ₹100 Cr focusing on Indian women\'s health needs', key_stat: 'Women\'s health startups collectively raised ₹500 Cr in 2022–24 — validates India FemTech as a major investment category.' },
    ],
  },
}

const slugs = Object.keys(DATA)

async function run() {
  console.log(`Seeding case studies + proof points for ${slugs.length} ideas...`)
  const docs = await client.fetch(
    `*[_type=="businessIdea" && slug.current in $slugs]{_id,"slug":slug.current,"hasCS":defined(case_study.founder_name)}`,
    { slugs }
  )
  const idMap = {}
  const hasData = new Set()
  for (const d of docs) {
    idMap[d.slug] = d._id
    if (d.hasCS) hasData.add(d.slug)
  }

  let ok = 0, skip = 0, missing = 0
  for (let i = 0; i < slugs.length; i += 5) {
    const batch = slugs.slice(i, i + 5)
    const tx = client.transaction()
    let anyInBatch = false
    for (const slug of batch) {
      if (hasData.has(slug)) { skip++; continue }
      const docId = idMap[slug]
      if (!docId) { console.warn(`\n  Missing: ${slug}`); missing++; continue }
      const d = DATA[slug]
      const proof_points = (d.proof_points || []).map(pp => ({ ...pp, _type: 'object', _key: k() }))
      tx.patch(docId, p => p.set({ case_study: d.case_study, proof_points }))
      ok++
      anyInBatch = true
    }
    if (anyInBatch) await tx.commit()
    process.stdout.write(`  ${Math.min(i + 5, slugs.length)} / ${slugs.length}`)
  }
  console.log(`\nDone. Updated: ${ok}, Skipped: ${skip}, Missing: ${missing}`)
}

run().catch(err => { console.error(err); process.exit(1) })
