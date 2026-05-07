'use client'

import { useState, useMemo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type SchemeType = 'loan' | 'subsidy' | 'grant' | 'equity' | 'training' | 'incubation'
type SchemeSector =
  | 'all'
  | 'food'
  | 'manufacturing'
  | 'technology'
  | 'agriculture'
  | 'retail'
  | 'services'
  | 'textile'
  | 'healthcare'
  | 'education'
  | 'energy'
  | 'rural'

export interface Scheme {
  name: string
  description: string
  eligibility: string
  level: 'national' | 'state'
  state?: string
  sectors: SchemeSector[]        // 'all' means applies to any sector
  types: SchemeType[]
  newOnly: boolean               // true = new/greenfield businesses only
  maxFundLakh: number            // 0 = varies/not fixed
  forWomen: boolean
  forDisabled: boolean
  forScSt: boolean
  forYouth: boolean
  portal: string
  highlight: string
}

// ─── Scheme Data ──────────────────────────────────────────────────────────────

const SCHEMES: Scheme[] = [
  // ── National — General ────────────────────────────────────────────────────
  {
    name: 'PM MUDRA Yojana',
    description: 'Collateral-free loans for micro/small businesses under three tiers: Shishu (up to ₹50K), Kishore (up to ₹5L), and Tarun (up to ₹10L).',
    eligibility: 'Non-corporate, non-farm small/micro enterprises. Any Indian citizen 18+.',
    level: 'national', sectors: ['all'], types: ['loan'], newOnly: false,
    maxFundLakh: 10, forWomen: true, forDisabled: true, forScSt: true, forYouth: true,
    portal: 'https://www.mudra.org.in',
    highlight: 'Up to ₹10L — zero collateral',
  },
  {
    name: 'PMEGP',
    description: 'Capital subsidy of 15–35% of project cost for new manufacturing or service enterprises. Max project cost ₹50L (manufacturing) / ₹20L (services).',
    eligibility: 'Any individual 18+. Only for new units — not for existing businesses.',
    level: 'national', sectors: ['all'], types: ['subsidy', 'loan'], newOnly: true,
    maxFundLakh: 50, forWomen: true, forDisabled: false, forScSt: true, forYouth: true,
    portal: 'https://www.kviconline.gov.in/pmegpeportal',
    highlight: 'Up to 35% subsidy on project cost',
  },
  {
    name: 'Stand-Up India',
    description: 'Bank loans of ₹10L to ₹1Cr for setting up a greenfield enterprise in manufacturing, services, or trading. At least one loan per bank branch.',
    eligibility: 'SC/ST and women entrepreneurs only.',
    level: 'national', sectors: ['all'], types: ['loan'], newOnly: true,
    maxFundLakh: 100, forWomen: true, forDisabled: false, forScSt: true, forYouth: false,
    portal: 'https://www.standupmitra.in',
    highlight: '₹10L–₹1Cr for SC/ST & Women',
  },
  {
    name: 'CGTMSE',
    description: 'Credit guarantee for collateral-free loans up to ₹5Cr through member lending institutions. Covers up to 85% of the loan amount.',
    eligibility: 'New and existing micro/small enterprises. Apply through member banks.',
    level: 'national', sectors: ['all'], types: ['loan'], newOnly: false,
    maxFundLakh: 500, forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://www.cgtmse.in',
    highlight: 'Up to ₹5Cr — no collateral via banks',
  },
  {
    name: 'Startup India Seed Fund',
    description: 'Grants up to ₹20L for PoC/prototype; debt/convertible notes up to ₹1.5Cr for market entry — disbursed via empanelled incubators.',
    eligibility: 'DPIIT-recognised startup, incorporated within 2 years of application.',
    level: 'national', sectors: ['all'], types: ['grant', 'loan'], newOnly: true,
    maxFundLakh: 150, forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://seedfund.startupindia.gov.in',
    highlight: 'Up to ₹20L grant + ₹1.5Cr debt via incubators',
  },
  {
    name: 'Startup India Recognition & Tax Holiday',
    description: '3-year income tax holiday (80-IAC), angel tax relief, self-certification for 9 labour laws, and a fast-track IPR filing scheme.',
    eligibility: 'Incorporated <10 years, annual turnover <₹100Cr, working on innovation/scalable model.',
    level: 'national', sectors: ['technology', 'all'], types: ['grant'], newOnly: true,
    maxFundLakh: 0, forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://startupindia.gov.in/content/sih/en/startupgov/recognition.html',
    highlight: '3-year tax holiday + angel tax relief',
  },
  {
    name: 'PM SVANidhi',
    description: 'Working capital micro-loans of ₹10K → ₹20K → ₹50K for street vendors with interest subsidy and credit score benefits.',
    eligibility: 'Urban street vendors with Letter of Recommendation or vendor certificate from TVC.',
    level: 'national', sectors: ['retail', 'food'], types: ['loan'], newOnly: false,
    maxFundLakh: 0.5, forWomen: true, forDisabled: false, forScSt: true, forYouth: false,
    portal: 'https://pmsvanidhi.mohua.gov.in',
    highlight: 'Up to ₹50K for street vendors',
  },
  {
    name: 'PM Vishwakarma Yojana',
    description: '₹15K toolkit grant, skill training stipend, and collateral-free loans up to ₹3L at 5% interest for 18 traditional crafts/trades.',
    eligibility: 'Artisans/craftspeople in 18 trades (carpenter, blacksmith, potter, tailor, weaver, etc.). Family-based generational practitioners.',
    level: 'national', sectors: ['manufacturing', 'textile', 'rural'], types: ['loan', 'grant', 'training'], newOnly: false,
    maxFundLakh: 3, forWomen: true, forDisabled: false, forScSt: true, forYouth: true,
    portal: 'https://pmvishwakarma.gov.in',
    highlight: '₹15K toolkit + loans at 5% interest',
  },
  {
    name: 'CLCSS — Capital Subsidy for Tech Upgrade',
    description: '15% upfront capital subsidy (max ₹15L) for MSMEs upgrading to proven technology in their sector.',
    eligibility: 'Existing micro/small enterprises applying through scheduled commercial banks.',
    level: 'national', sectors: ['manufacturing', 'textile'], types: ['subsidy'], newOnly: false,
    maxFundLakh: 15, forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://msme.gov.in/clcss',
    highlight: '15% capital subsidy — max ₹15L',
  },
  {
    name: 'Mahila Udyam Nidhi (SIDBI)',
    description: 'Soft loans up to ₹10L at concessional interest rates for women setting up new small-scale projects.',
    eligibility: 'Women entrepreneurs for small-scale industry projects (new units).',
    level: 'national', sectors: ['all'], types: ['loan'], newOnly: true,
    maxFundLakh: 10, forWomen: true, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://www.sidbi.in',
    highlight: 'Soft loans up to ₹10L for women',
  },
  {
    name: 'NHFDC',
    description: 'Subsidised loans for persons with disability to start or expand self-employment ventures across a wide range of business activities.',
    eligibility: 'Persons with disability (40%+ benchmark). Apply via State Channelising Agencies.',
    level: 'national', sectors: ['all'], types: ['loan', 'subsidy'], newOnly: false,
    maxFundLakh: 30, forWomen: false, forDisabled: true, forScSt: false, forYouth: false,
    portal: 'https://www.nhfdc.nic.in',
    highlight: 'Up to ₹30L at subsidised rates for Divyang',
  },
  {
    name: 'NSFDC',
    description: 'Term loans and microfinance at concessional 6% interest for SC entrepreneurs through State Channelising Agencies and RRBs.',
    eligibility: 'Scheduled Caste individuals with income below double the poverty line.',
    level: 'national', sectors: ['all'], types: ['loan'], newOnly: false,
    maxFundLakh: 25, forWomen: false, forDisabled: false, forScSt: true, forYouth: false,
    portal: 'https://www.nsfdc.nic.in',
    highlight: 'Loans at 6% for SC entrepreneurs',
  },
  {
    name: 'National SC/ST Hub',
    description: 'Facilitates SC/ST-owned MSMEs to participate in government procurement + incubation, training, and mentorship support.',
    eligibility: 'SC/ST-owned MSMEs with Udyam registration.',
    level: 'national', sectors: ['all'], types: ['incubation', 'training'], newOnly: false,
    maxFundLakh: 0, forWomen: false, forDisabled: false, forScSt: true, forYouth: false,
    portal: 'https://www.scsthub.in',
    highlight: 'Govt procurement access + mentorship for SC/ST',
  },
  {
    name: 'WEP — Women Entrepreneurship Platform',
    description: 'NITI Aayog platform connecting women entrepreneurs to credit, incubation, mentorship, and market linkages across India.',
    eligibility: 'Women entrepreneurs at any stage of business.',
    level: 'national', sectors: ['all'], types: ['incubation', 'training'], newOnly: false,
    maxFundLakh: 0, forWomen: true, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://wep.gov.in',
    highlight: 'Mentorship + credit access for women',
  },
  {
    name: 'Atal Innovation Mission (AIM)',
    description: 'Incubation support via 70+ Atal Incubation Centres across India for deep-tech and innovation-led startups.',
    eligibility: 'Early-stage startups and innovators. Apply to your nearest AIC.',
    level: 'national', sectors: ['technology', 'all'], types: ['incubation', 'grant'], newOnly: true,
    maxFundLakh: 0, forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://aim.gov.in',
    highlight: 'Deep-tech incubation via 70+ AICs',
  },
  {
    name: 'NABARD Venture Capital (VCAF)',
    description: 'Venture capital and soft loans for agribusiness, food processing, and rural value-chain enterprises with innovative models.',
    eligibility: 'Companies in agribusiness, food processing, or rural industries.',
    level: 'national', sectors: ['agriculture', 'food'], types: ['equity', 'loan'], newOnly: false,
    maxFundLakh: 0, forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://www.nabard.org',
    highlight: 'VC funding for agri & food innovation',
  },
  {
    name: 'NSIC Raw Material & Tender Support',
    description: 'Single Point Registration for government tenders, raw material procurement at lower rates, and marketing assistance for MSMEs.',
    eligibility: 'Micro and small enterprises with Udyam registration.',
    level: 'national', sectors: ['manufacturing', 'retail', 'all'], types: ['loan', 'training'], newOnly: false,
    maxFundLakh: 0, forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://www.nsic.co.in',
    highlight: 'Govt tender access + raw material procurement',
  },
  {
    name: 'TUFS — Textile Machinery Subsidy',
    description: 'Interest reimbursement and capital subsidy for textile, garment, and technical textile units upgrading to benchmark machinery.',
    eligibility: 'Existing textile sector units upgrading technology.',
    level: 'national', sectors: ['textile'], types: ['subsidy', 'loan'], newOnly: false,
    maxFundLakh: 0, forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://texmin.nic.in/schemes/atufs',
    highlight: 'Subsidy on textile machinery upgradation',
  },
  {
    name: 'Udyam Registration (Free)',
    description: 'Free online MSME registration unlocking all government scheme benefits, priority sector lending, and procurement preferences.',
    eligibility: 'All micro, small, and medium enterprises — mandatory first step.',
    level: 'national', sectors: ['all'], types: ['training'], newOnly: false,
    maxFundLakh: 0, forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://udyamregistration.gov.in',
    highlight: 'Free — unlocks all MSME scheme benefits',
  },

  // ── National — Sector-specific ─────────────────────────────────────────────
  {
    name: 'PMFME — Food Processing Scheme',
    description: 'Credit-linked capital subsidy of 35% (max ₹10L) for upgrading existing food processing units + seed capital of ₹40K for SHG members.',
    eligibility: 'Existing micro food processing enterprises; FPOs, SHGs, cooperatives.',
    level: 'national', sectors: ['food', 'agriculture'], types: ['subsidy', 'loan'], newOnly: false,
    maxFundLakh: 10, forWomen: true, forDisabled: false, forScSt: true, forYouth: false,
    portal: 'https://pmfme.mofpi.gov.in',
    highlight: '35% subsidy for food processing units',
  },
  {
    name: 'ASPIRE — Agri-Business Incubation',
    description: 'Sets up Livelihood Business Incubators (LBIs) and Technology Business Incubators (TBIs) to support agri and rural startups.',
    eligibility: 'Agri-based startups and rural entrepreneurs.',
    level: 'national', sectors: ['agriculture', 'food', 'rural'], types: ['incubation', 'grant'], newOnly: true,
    maxFundLakh: 0, forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://msme.gov.in/aspire',
    highlight: 'Incubation + funding for agri-startups',
  },
  {
    name: 'PM E-DRIVE — EV Charging Subsidy',
    description: '70–80% capital subsidy for setting up public EV charging stations under PM E-DRIVE scheme. ₹2,000 crore earmarked.',
    eligibility: 'Any entrepreneur or company setting up public EV charging infrastructure.',
    level: 'national', sectors: ['energy', 'services'], types: ['subsidy'], newOnly: true,
    maxFundLakh: 0, forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://heavyindustries.gov.in',
    highlight: '70–80% subsidy for EV charging stations',
  },
  {
    name: 'SFURTI — Cluster Development',
    description: 'Upgrades traditional industry clusters (khadi, coir, handicrafts, etc.) with common facility centres, technology, and market access.',
    eligibility: 'Traditional industry clusters — apply through NGOs, institutions, or government bodies.',
    level: 'national', sectors: ['manufacturing', 'textile', 'rural'], types: ['grant', 'training'], newOnly: false,
    maxFundLakh: 0, forWomen: true, forDisabled: false, forScSt: true, forYouth: false,
    portal: 'https://msme.gov.in/sfurti',
    highlight: 'Cluster upgradation — common facility + market access',
  },
  {
    name: 'ZED Certification Scheme',
    description: 'Subsidised quality certification (Zero Defect Zero Effect) for MSMEs — up to 80% cost reimbursement for certification fees.',
    eligibility: 'Micro, small, and medium enterprises in manufacturing.',
    level: 'national', sectors: ['manufacturing'], types: ['subsidy'], newOnly: false,
    maxFundLakh: 5, forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://zed.org.in',
    highlight: 'Up to 80% subsidy on quality certification',
  },
  {
    name: 'PLI — Production Linked Incentive',
    description: 'Production-linked incentive of 4–20% on incremental sales for 14 sectors including food processing, pharma, textiles, and electronics.',
    eligibility: 'Companies meeting minimum investment and production thresholds (varies by sector).',
    level: 'national', sectors: ['manufacturing', 'food', 'healthcare', 'textile', 'technology'], types: ['subsidy'], newOnly: false,
    maxFundLakh: 0, forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://dpiit.gov.in/schemes/production-linked-incentive-scheme',
    highlight: '4–20% incentive on incremental production',
  },
  {
    name: 'DPIIT Udyog Aadhar — IP Fast Track',
    description: '80% rebate on patent filing fees and 50% rebate on trademark fees for DPIIT-recognised startups.',
    eligibility: 'DPIIT-recognised startups during their recognition period.',
    level: 'national', sectors: ['technology', 'all'], types: ['subsidy'], newOnly: false,
    maxFundLakh: 0, forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://startupindia.gov.in',
    highlight: '80% off patent fees for recognised startups',
  },
  {
    name: 'NRLM — Rural Livelihood Mission',
    description: 'Self-Help Group financing, skill training, and market linkages for rural women entrepreneurs through bank linkage programmes.',
    eligibility: 'Rural households — primarily women. SHG members enrolled under NRLM/DAY-NRLM.',
    level: 'national', sectors: ['rural', 'food', 'retail'], types: ['loan', 'training'], newOnly: false,
    maxFundLakh: 3, forWomen: true, forDisabled: false, forScSt: true, forYouth: false,
    portal: 'https://aajeevika.gov.in',
    highlight: 'SHG bank linkage + market access for rural women',
  },

  // ── State Schemes ─────────────────────────────────────────────────────────
  {
    name: 'Karnataka Elevate 100',
    description: 'Annual competition granting the top 100 startups up to ₹50L non-dilutive grant plus international market access and mentorship.',
    eligibility: 'Karnataka-based startups in any sector with an innovative product/service.',
    level: 'state', state: 'Karnataka', sectors: ['technology', 'all'], types: ['grant', 'incubation'], newOnly: true,
    maxFundLakh: 50, forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://elevate.karnataka.gov.in',
    highlight: 'Up to ₹50L non-dilutive grant — Karnataka',
  },
  {
    name: 'Kerala Startup Mission (KSUM)',
    description: 'Grants up to ₹10L, co-working spaces, incubation support, and investor connect for Kerala-based startups.',
    eligibility: 'Startups incorporated in Kerala, technology or innovation-driven.',
    level: 'state', state: 'Kerala', sectors: ['technology', 'all'], types: ['grant', 'incubation'], newOnly: true,
    maxFundLakh: 10, forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://startupmission.kerala.gov.in',
    highlight: 'Up to ₹10L grant + incubation — Kerala',
  },
  {
    name: 'Maharashtra Udyog Mitra',
    description: 'Single-window facilitation for new industrial/service units — subsidies on land, power tariff, and stamp duty.',
    eligibility: 'New industrial or service units setting up in Maharashtra.',
    level: 'state', state: 'Maharashtra', sectors: ['manufacturing', 'services', 'all'], types: ['subsidy'], newOnly: true,
    maxFundLakh: 0, forWomen: true, forDisabled: false, forScSt: true, forYouth: false,
    portal: 'https://udyogmitra.maharashtra.gov.in',
    highlight: 'Land, power & stamp duty subsidies — Maharashtra',
  },
  {
    name: 'Gujarat GUJCOST Innovation Grant',
    description: 'Grants for technology innovation and startup incubation via Gujarat Council on Science & Technology.',
    eligibility: 'Gujarat-based innovators, startups, and MSMEs with R&D or innovation focus.',
    level: 'state', state: 'Gujarat', sectors: ['technology', 'all'], types: ['grant', 'incubation'], newOnly: true,
    maxFundLakh: 10, forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://gujcost.gujarat.gov.in',
    highlight: 'Innovation grants for Gujarat startups',
  },
  {
    name: 'Tamil Nadu TANSIM',
    description: 'Equity funding, seed grants, and incubation for TN-based startups via the Tamil Nadu Startup and Innovation Mission.',
    eligibility: 'Startups incorporated in Tamil Nadu.',
    level: 'state', state: 'Tamil Nadu', sectors: ['technology', 'all'], types: ['equity', 'grant', 'incubation'], newOnly: true,
    maxFundLakh: 25, forWomen: true, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://tansim.in',
    highlight: 'Equity + grants for Tamil Nadu startups',
  },
  {
    name: 'Rajasthan iStart Programme',
    description: 'Seed funding, mentorship, co-working, and market access for Rajasthan startups via the iStart portal.',
    eligibility: 'Startups registered or willing to register in Rajasthan.',
    level: 'state', state: 'Rajasthan', sectors: ['technology', 'all'], types: ['grant', 'incubation'], newOnly: true,
    maxFundLakh: 10, forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://istart.rajasthan.gov.in',
    highlight: 'Seed funding + incubation — Rajasthan',
  },
  {
    name: 'Telangana T-Hub',
    description: "World's largest startup incubator — access to global mentors, investors, and corporations, plus up to ₹25L in grants.",
    eligibility: 'Startups willing to operate from or register in Telangana.',
    level: 'state', state: 'Telangana', sectors: ['technology', 'all'], types: ['incubation', 'grant'], newOnly: true,
    maxFundLakh: 25, forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://t-hub.co',
    highlight: 'World-class incubation + grants — Telangana',
  },
  {
    name: 'Delhi Startup Policy 2022',
    description: 'Seed money up to ₹20L, co-working spaces, and marketing support for Delhi-registered startups.',
    eligibility: 'Startups registered in Delhi, less than 7 years old.',
    level: 'state', state: 'Delhi', sectors: ['technology', 'all'], types: ['grant', 'incubation'], newOnly: true,
    maxFundLakh: 20, forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://dipp.delhi.gov.in',
    highlight: 'Up to ₹20L seed — Delhi',
  },
  {
    name: 'Uttar Pradesh Startup Policy',
    description: 'Patent filing subsidies, quality certification reimbursements, GST refunds, and incubation for UP startups.',
    eligibility: 'Startups incorporated in Uttar Pradesh with DPIIT recognition.',
    level: 'state', state: 'Uttar Pradesh', sectors: ['technology', 'all'], types: ['subsidy', 'incubation'], newOnly: true,
    maxFundLakh: 10, forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://startup.up.gov.in',
    highlight: 'GST reimbursement + patent subsidies — UP',
  },
  {
    name: 'Punjab Ghar Ghar Rozgar',
    description: 'Skill training, placement assistance, and self-employment support for Punjab youth under various skill verticals.',
    eligibility: 'Punjab residents aged 18–35 years looking for employment or self-employment.',
    level: 'state', state: 'Punjab', sectors: ['services', 'all'], types: ['training'], newOnly: false,
    maxFundLakh: 0, forWomen: true, forDisabled: false, forScSt: true, forYouth: true,
    portal: 'https://pgrkam.com',
    highlight: 'Skill training + self-employment support — Punjab',
  },
  {
    name: 'MP Startup Policy',
    description: 'Seed grants up to ₹20L, 100% electricity duty exemption for 5 years, and stamp duty waiver for MP-registered startups.',
    eligibility: 'Startups registered in Madhya Pradesh within 7 years of incorporation.',
    level: 'state', state: 'Madhya Pradesh', sectors: ['technology', 'all'], types: ['grant', 'subsidy'], newOnly: true,
    maxFundLakh: 20, forWomen: true, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://mpidicindia.com/startup',
    highlight: 'Up to ₹20L + electricity duty exemption — MP',
  },
  {
    name: 'Haryana Startup Policy',
    description: 'Seed funding up to ₹15L, incubation support, SGST reimbursement, and power tariff subsidy for Haryana startups.',
    eligibility: 'Startups registered in Haryana, DPIIT-recognised or state-recognised.',
    level: 'state', state: 'Haryana', sectors: ['technology', 'all'], types: ['grant', 'subsidy', 'incubation'], newOnly: true,
    maxFundLakh: 15, forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://startupharyana.gov.in',
    highlight: 'Up to ₹15L + SGST reimbursement — Haryana',
  },
]

// ─── Static maps ──────────────────────────────────────────────────────────────

const STATES = [...new Set(SCHEMES.filter(s => s.state).map(s => s.state as string))].sort()

const TYPE_META: Record<SchemeType, { label: string; color: string }> = {
  loan:       { label: 'Loan',       color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  subsidy:    { label: 'Subsidy',    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  grant:      { label: 'Grant',      color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  equity:     { label: 'Equity',     color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  training:   { label: 'Training',   color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  incubation: { label: 'Incubation', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
}

const SECTOR_META: { value: SchemeSector; label: string }[] = [
  { value: 'all',           label: 'Any / General'       },
  { value: 'food',          label: 'Food & Beverage'     },
  { value: 'agriculture',   label: 'Agriculture / Agri'  },
  { value: 'manufacturing', label: 'Manufacturing'       },
  { value: 'technology',    label: 'Tech / SaaS / AI'    },
  { value: 'retail',        label: 'Retail / E-commerce' },
  { value: 'services',      label: 'Services / B2B'      },
  { value: 'textile',       label: 'Textile / Garments'  },
  { value: 'healthcare',    label: 'Healthcare'          },
  { value: 'education',     label: 'Education / EdTech'  },
  { value: 'energy',        label: 'Energy / EV / Solar' },
  { value: 'rural',         label: 'Rural / Handicrafts' },
]

// ─── Wizard Steps ─────────────────────────────────────────────────────────────

type WizardStep = 'sector' | 'stage' | 'amount' | 'category' | 'location'

const WIZARD_STEPS: { id: WizardStep; title: string; subtitle: string }[] = [
  { id: 'sector',   title: 'What sector is your business in?',     subtitle: 'We\'ll match schemes relevant to your industry' },
  { id: 'stage',    title: 'Is this a new or existing business?',  subtitle: 'Some schemes are only for new ventures' },
  { id: 'amount',   title: 'How much funding are you looking for?', subtitle: 'We\'ll filter by the maximum support available' },
  { id: 'category', title: 'Do any of these apply to you?',        subtitle: 'Special categories unlock additional schemes' },
  { id: 'location', title: 'Which state are you in?',              subtitle: 'Shows national schemes + your state\'s schemes' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function SchemesFinder() {
  // Mode
  const [mode, setMode] = useState<'wizard' | 'browse'>('wizard')

  // Wizard state
  const [wizardStep, setWizardStep] = useState(0)
  const [wizardDone, setWizardDone] = useState(false)
  const [wSector, setWSector] = useState<SchemeSector>('all')
  const [wStage, setWStage] = useState<'any' | 'new' | 'existing'>('any')
  const [wAmount, setWAmount] = useState<'any' | 'under50' | '50to100' | 'above100'>('any')
  const [wWomen, setWWomen] = useState(false)
  const [wDisabled, setWDisabled] = useState(false)
  const [wScSt, setWScSt] = useState(false)
  const [wYouth, setWYouth] = useState(false)
  const [wState, setWState] = useState<string>('')

  // Browse state
  const [bSearch, setBSearch] = useState('')
  const [bLevel, setBLevel] = useState<'all' | 'national' | 'state'>('all')
  const [bState, setBState] = useState('')
  const [bSector, setBSector] = useState<SchemeSector | ''>('')
  const [bTypes, setBTypes] = useState<Set<SchemeType>>(new Set())
  const [bWomen, setBWomen] = useState(false)
  const [bDisabled, setBDisabled] = useState(false)
  const [bScSt, setBScSt] = useState(false)

  // Sort
  const [sortBy, setSortBy] = useState<'relevance' | 'amount'>('relevance')

  const toggleType = (t: SchemeType) =>
    setBTypes(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n })

  // ── Filter logic ────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const isWizard = mode === 'wizard' && wizardDone
    const results = SCHEMES.filter(s => {
      // Sector match: scheme must cover 'all' OR the selected sector
      const sector = isWizard ? wSector : (bSector as SchemeSector || 'all')
      if (sector !== 'all' && !s.sectors.includes('all') && !s.sectors.includes(sector)) return false

      if (isWizard) {
        if (wStage === 'new' && !s.newOnly && s.newOnly !== false) return false
        if (wStage === 'existing' && s.newOnly) return false
        if (wAmount === 'under50'  && s.maxFundLakh !== 0 && s.maxFundLakh > 50)   return false
        if (wAmount === '50to100'  && s.maxFundLakh !== 0 && (s.maxFundLakh <= 50 || s.maxFundLakh > 100)) return false
        if (wAmount === 'above100' && s.maxFundLakh !== 0 && s.maxFundLakh <= 100) return false
        if (wWomen    && !s.forWomen)    return false
        if (wDisabled && !s.forDisabled) return false
        if (wScSt     && !s.forScSt)    return false
        if (wYouth    && !s.forYouth)   return false
        if (wState) {
          if (s.level === 'state' && s.state !== wState) return false
        }
      } else {
        if (bLevel === 'national' && s.level !== 'national') return false
        if (bLevel === 'state') {
          if (s.level !== 'state') return false
          if (bState && s.state !== bState) return false
        }
        if (bTypes.size > 0 && !s.types.some(t => bTypes.has(t))) return false
        if (bWomen    && !s.forWomen)    return false
        if (bDisabled && !s.forDisabled) return false
        if (bScSt     && !s.forScSt)    return false
        if (bSearch.trim()) {
          const q = bSearch.toLowerCase()
          if (
            !s.name.toLowerCase().includes(q) &&
            !s.description.toLowerCase().includes(q) &&
            !s.eligibility.toLowerCase().includes(q) &&
            !(s.state?.toLowerCase().includes(q))
          ) return false
        }
      }
      return true
    })

    if (sortBy === 'amount') {
      return [...results].sort((a, b) => {
        const av = a.maxFundLakh === 0 ? 9999 : a.maxFundLakh
        const bv = b.maxFundLakh === 0 ? 9999 : b.maxFundLakh
        return bv - av
      })
    }
    return results
  }, [mode, wizardDone, wSector, wStage, wAmount, wWomen, wDisabled, wScSt, wYouth, wState,
      bSearch, bLevel, bState, bSector, bTypes, bWomen, bDisabled, bScSt, sortBy])

  // ── Wizard navigation ───────────────────────────────────────────────────────

  const currentStep = WIZARD_STEPS[wizardStep]

  function resetWizard() {
    setWizardStep(0); setWizardDone(false)
    setWSector('all'); setWStage('any'); setWAmount('any')
    setWWomen(false); setWDisabled(false); setWScSt(false); setWYouth(false); setWState('')
  }

  // ── Render helpers ──────────────────────────────────────────────────────────

  function SchemeCard({ s }: { s: Scheme }) {
    return (
      <div className="group flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            s.level === 'national'
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
          }`}>
            {s.level === 'national' ? 'National' : s.state ?? 'State'}
          </span>
          {s.newOnly && (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
              New business only
            </span>
          )}
          {s.forWomen    && <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">Women</span>}
          {s.forDisabled && <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">Divyang</span>}
          {s.forScSt     && <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">SC/ST</span>}
          {s.forYouth    && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Youth</span>}
        </div>

        {/* Name + highlight */}
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-base">{s.name}</p>
          <p className="mt-0.5 text-sm font-medium text-green-700 dark:text-green-400">{s.highlight}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.description}</p>

        {/* Eligibility */}
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Who can apply</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">{s.eligibility}</p>
        </div>

        {/* Types + CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex flex-wrap gap-1">
            {s.types.map(t => (
              <span key={t} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${TYPE_META[t].color}`}>
                {TYPE_META[t].label}
              </span>
            ))}
          </div>
          <a
            href={s.portal}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          >
            Apply ↗
          </a>
        </div>
      </div>
    )
  }

  // ── Step content ─────────────────────────────────────────────────────────────

  function WizardStepContent() {
    if (currentStep.id === 'sector') {
      return (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
          {SECTOR_META.map(s => (
            <button
              key={s.value}
              onClick={() => { setWSector(s.value); setWizardStep(1) }}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all
                ${wSector === s.value
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-300'
                }`}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )
    }

    if (currentStep.id === 'stage') {
      const opts = [
        { value: 'new',      label: 'Starting fresh',  sub: 'New / greenfield business' },
        { value: 'existing', label: 'Already running', sub: 'Existing business' },
        { value: 'any',      label: 'Not sure yet',    sub: 'Show me everything' },
      ] as const
      return (
        <div className="grid gap-3 sm:grid-cols-3">
          {opts.map(o => (
            <button
              key={o.value}
              onClick={() => { setWStage(o.value); setWizardStep(2) }}
              className={`flex flex-col items-center gap-1 rounded-xl border px-4 py-5 text-center transition-all
                ${wStage === o.value
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
                }`}
            >
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{o.label}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{o.sub}</span>
            </button>
          ))}
        </div>
      )
    }

    if (currentStep.id === 'amount') {
      const opts = [
        { value: 'under50',  label: 'Up to ₹50L'   },
        { value: '50to100',  label: '₹50L – ₹1Cr'  },
        { value: 'above100', label: 'Above ₹1Cr'   },
        { value: 'any',      label: 'Any amount'   },
      ] as const
      return (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {opts.map(o => (
            <button
              key={o.value}
              onClick={() => { setWAmount(o.value); setWizardStep(3) }}
              className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-5 text-center transition-all
                ${wAmount === o.value
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
                }`}
            >
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{o.label}</span>
            </button>
          ))}
        </div>
      )
    }

    if (currentStep.id === 'category') {
      return (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'I am a woman entrepreneur', state: wWomen, setter: setWWomen },
              { label: 'I am a person with disability (Divyang)', state: wDisabled, setter: setWDisabled },
              { label: 'I belong to SC or ST community', state: wScSt, setter: setWScSt },
              { label: 'I am a youth entrepreneur (18–35 years)', state: wYouth, setter: setWYouth },
            ].map(({ label, state, setter }) => (
              <label key={label} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all
                ${state
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
                }`}>
                <input
                  type="checkbox" checked={state}
                  onChange={e => setter(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
              </label>
            ))}
          </div>
          <button
            onClick={() => setWizardStep(4)}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Continue →
          </button>
        </div>
      )
    }

    if (currentStep.id === 'location') {
      return (
        <div className="space-y-4">
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 max-h-72 overflow-y-auto pr-1">
            {['', ...STATES].map(st => (
              <button
                key={st || '__all'}
                onClick={() => setWState(st)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium text-left transition-all
                  ${wState === st
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-300'
                  }`}
              >
                {st || 'All India / Any State'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setWizardDone(true)}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Show my schemes →
          </button>
        </div>
      )
    }
    return null
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <div className="mt-16">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Funding</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Government Scheme Finder</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {SCHEMES.length} national & state schemes — find what fits you in seconds
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden self-start">
          {(['wizard', 'browse'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {m === 'wizard' ? 'Guided' : 'Browse All'}
            </button>
          ))}
        </div>
      </div>

      {/* ── WIZARD MODE ────────────────────────────────────────────────────── */}
      {mode === 'wizard' && !wizardDone && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${((wizardStep + 1) / WIZARD_STEPS.length) * 100}%` }}
            />
          </div>

          <div className="p-6 sm:p-8">
            {/* Step counter */}
            <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 mb-1">
              Step {wizardStep + 1} of {WIZARD_STEPS.length}
            </p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {currentStep.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{currentStep.subtitle}</p>

            <WizardStepContent />

            {/* Back */}
            {wizardStep > 0 && (
              <button
                onClick={() => setWizardStep(s => s - 1)}
                className="mt-4 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── WIZARD RESULTS ─────────────────────────────────────────────────── */}
      {mode === 'wizard' && wizardDone && (
        <>
          {/* Summary bar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 px-4 py-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">Your profile:</span>
              <span className="rounded-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 px-2.5 py-0.5 text-slate-600 dark:text-slate-300">
                {SECTOR_META.find(s => s.value === wSector)?.label ?? 'Any sector'}
              </span>
              {wStage !== 'any' && (
                <span className="rounded-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 px-2.5 py-0.5 text-slate-600 dark:text-slate-300">
                  {wStage === 'new' ? 'New business' : 'Existing business'}
                </span>
              )}
              {wState && (
                <span className="rounded-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 px-2.5 py-0.5 text-slate-600 dark:text-slate-300">
                  {wState}
                </span>
              )}
              {wWomen    && <span className="rounded-full bg-pink-100 dark:bg-pink-900/40 px-2.5 py-0.5 text-pink-700 dark:text-pink-300">Women</span>}
              {wScSt     && <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-blue-700 dark:text-blue-300">SC/ST</span>}
              {wDisabled && <span className="rounded-full bg-orange-100 dark:bg-orange-900/40 px-2.5 py-0.5 text-orange-700 dark:text-orange-300">Divyang</span>}
              {wYouth    && <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 text-emerald-700 dark:text-emerald-300">Youth</span>}
            </div>
            <button
              onClick={resetWizard}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              ← Redo quiz
            </button>
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{filtered.length}</span>
              {' '}scheme{filtered.length !== 1 ? 's' : ''} match your profile
            </p>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="amount">Sort: Max amount</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 py-16 text-center">
              <p className="text-slate-400 dark:text-slate-500">No schemes match your exact profile.</p>
              <button onClick={resetWizard} className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                Try broadening your answers
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map(s => <SchemeCard key={s.name} s={s} />)}
            </div>
          )}
        </>
      )}

      {/* ── BROWSE MODE ────────────────────────────────────────────────────── */}
      {mode === 'browse' && (
        <>
          {/* Search + Sort */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search schemes by name, keyword, or state…"
                value={bSearch}
                onChange={e => setBSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="relevance">Sort: Default</option>
              <option value="amount">Sort: Max amount</option>
            </select>
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 mb-5 space-y-5">

            {/* Sector */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sector</p>
              <div className="flex flex-wrap gap-2">
                {[{ value: '', label: 'All Sectors' }, ...SECTOR_META.filter(s => s.value !== 'all').map(s => ({ value: s.value, label: s.label }))].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setBSector(opt.value as SchemeSector | '')}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      bSector === opt.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Scheme Level</p>
              <div className="flex flex-wrap gap-2">
                {(['all', 'national', 'state'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => { setBLevel(v); setBState('') }}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                      bLevel === v
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {v === 'all' ? 'All' : v === 'national' ? 'National' : 'State-specific'}
                  </button>
                ))}
                {bLevel === 'state' && (
                  <select
                    value={bState}
                    onChange={e => setBState(e.target.value)}
                    className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">All States</option>
                    {STATES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* Type */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Support Type</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(TYPE_META) as [SchemeType, typeof TYPE_META[SchemeType]][]).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => toggleType(key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      bTypes.has(key) ? meta.color : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Beneficiary */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Special Category</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'Women', state: bWomen, setter: setBWomen },
                  { label: 'Divyang', state: bDisabled, setter: setBDisabled },
                  { label: 'SC/ST', state: bScSt, setter: setBScSt },
                ].map(({ label, state, setter }) => (
                  <label key={label} className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={state} onChange={e => setter(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-indigo-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Results count */}
          <p className="mb-4 text-sm font-medium text-slate-600 dark:text-slate-400">
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{filtered.length}</span>
            {' '}of {SCHEMES.length} schemes shown
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 py-16 text-center">
              <p className="text-slate-400 dark:text-slate-500">No schemes match your filters. Try widening your selection.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map(s => <SchemeCard key={s.name} s={s} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
