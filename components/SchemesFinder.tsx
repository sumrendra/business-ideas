'use client'

import { useState, useMemo } from 'react'

export interface Scheme {
  name: string
  description: string
  eligibility: string
  level: 'national' | 'state'
  state?: string
  types: ('loan' | 'subsidy' | 'grant' | 'equity' | 'training' | 'incubation')[]
  maxFundLakh: number        // max support available in lakhs (for filtering); 0 = varies/not fixed
  forWomen: boolean
  forDisabled: boolean
  forScSt: boolean
  forYouth: boolean
  portal: string
  highlight?: string         // e.g. "Up to ₹10L collateral-free"
}

const SCHEMES: Scheme[] = [
  // ── NATIONAL ──────────────────────────────────────────────────────────────
  {
    name: 'PM MUDRA Yojana',
    description: 'Collateral-free loans for micro/small businesses under Shishu (₹50K), Kishore (₹5L), and Tarun (₹10L) categories.',
    eligibility: 'Non-corporate, non-farm small/micro enterprises. Any Indian citizen.',
    level: 'national',
    types: ['loan'],
    maxFundLakh: 10,
    forWomen: true, forDisabled: true, forScSt: true, forYouth: true,
    portal: 'https://www.mudra.org.in',
    highlight: 'Up to ₹10L — no collateral',
  },
  {
    name: 'PMEGP (PM Employment Generation Programme)',
    description: 'Subsidy of 15–35% of project cost for new manufacturing or service enterprises. Max project cost ₹50L (mfg) / ₹20L (services).',
    eligibility: 'Any individual 18+ years. Only for new units (not existing businesses).',
    level: 'national',
    types: ['subsidy', 'loan'],
    maxFundLakh: 50,
    forWomen: true, forDisabled: false, forScSt: true, forYouth: true,
    portal: 'https://www.kviconline.gov.in/pmegpeportal',
    highlight: 'Up to 35% subsidy on project cost',
  },
  {
    name: 'Stand-Up India',
    description: 'Bank loans of ₹10L to ₹1Cr for setting up a greenfield enterprise in manufacturing, services, or trading.',
    eligibility: 'SC/ST and women entrepreneurs only. At least one per bank branch.',
    level: 'national',
    types: ['loan'],
    maxFundLakh: 100,
    forWomen: true, forDisabled: false, forScSt: true, forYouth: false,
    portal: 'https://www.standupmitra.in',
    highlight: '₹10L–₹1Cr for SC/ST & Women',
  },
  {
    name: 'CGTMSE (Credit Guarantee for MSMEs)',
    description: 'Guarantees collateral-free loans up to ₹2Cr through member lending institutions. Covers up to 85% of loan amount.',
    eligibility: 'New and existing micro/small enterprises. Apply through member banks.',
    level: 'national',
    types: ['loan'],
    maxFundLakh: 200,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://www.cgtmse.in',
    highlight: 'Up to ₹2Cr — no collateral via banks',
  },
  {
    name: 'Startup India Seed Fund Scheme',
    description: 'Grants up to ₹20L for PoC/prototype; debt/convertible notes up to ₹1.5Cr for market entry — disbursed via incubators.',
    eligibility: 'DPIIT-recognised startup, incorporated within 2 years of application.',
    level: 'national',
    types: ['grant', 'loan'],
    maxFundLakh: 150,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://seedfund.startupindia.gov.in',
    highlight: 'Up to ₹20L grant + ₹1.5Cr debt',
  },
  {
    name: 'PM SVANidhi (Street Vendor Loan)',
    description: 'Working capital loans of ₹10K, ₹20K, and ₹50K for street vendors with credit history incentives.',
    eligibility: 'Urban street vendors with LoR/vendor certificate or recommended by TVC.',
    level: 'national',
    types: ['loan'],
    maxFundLakh: 0.5,
    forWomen: true, forDisabled: false, forScSt: true, forYouth: false,
    portal: 'https://pmsvanidhi.mohua.gov.in',
    highlight: 'Up to ₹50K for street vendors',
  },
  {
    name: 'PM Vishwakarma Yojana',
    description: 'Support for artisans and craftspeople: ₹15K toolkit grant, skill training, and collateral-free loans up to ₹3L at 5% interest.',
    eligibility: '18 traditional crafts/trades (carpenter, blacksmith, potter, tailor, etc.). Family-based generational practitioners.',
    level: 'national',
    types: ['loan', 'grant', 'training'],
    maxFundLakh: 3,
    forWomen: true, forDisabled: false, forScSt: true, forYouth: true,
    portal: 'https://pmvishwakarma.gov.in',
    highlight: '₹15K toolkit + loans at 5% interest',
  },
  {
    name: 'CLCSS (Capital Subsidy for Tech Upgradation)',
    description: '15% upfront capital subsidy (max ₹15L) for MSMEs upgrading to proven technology in their sector.',
    eligibility: 'Existing micro/small enterprises applying through scheduled commercial banks.',
    level: 'national',
    types: ['subsidy'],
    maxFundLakh: 15,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://msme.gov.in/clcss',
    highlight: '15% capital subsidy up to ₹15L',
  },
  {
    name: 'Mahila Udyam Nidhi (SIDBI)',
    description: 'Soft loans up to ₹10L to women entrepreneurs setting up new small-scale projects at concessional interest rates.',
    eligibility: 'Women entrepreneurs for small-scale industry projects.',
    level: 'national',
    types: ['loan'],
    maxFundLakh: 10,
    forWomen: true, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://www.sidbi.in',
    highlight: 'Soft loans up to ₹10L for women',
  },
  {
    name: 'NHFDC (National Handicapped Finance)',
    description: 'Subsidised loans for disabled persons to start or expand self-employment ventures. Covers a wide range of business activities.',
    eligibility: 'Persons with disability (40%+ benchmark). Apply via State Channelising Agencies.',
    level: 'national',
    types: ['loan', 'subsidy'],
    maxFundLakh: 30,
    forWomen: false, forDisabled: true, forScSt: false, forYouth: false,
    portal: 'https://www.nhfdc.nic.in',
    highlight: 'Up to ₹30L at subsidised rates for disabled',
  },
  {
    name: 'NSFDC (National SC Finance & Dev Corp)',
    description: 'Term loans and micro-finance at concessional interest (6%) for SC entrepreneurs through SCA/RRBs.',
    eligibility: 'Scheduled Caste individuals below double the poverty line.',
    level: 'national',
    types: ['loan'],
    maxFundLakh: 25,
    forWomen: false, forDisabled: false, forScSt: true, forYouth: false,
    portal: 'https://www.nsfdc.nic.in',
    highlight: 'Loans at 6% for SC entrepreneurs',
  },
  {
    name: 'National SC/ST Hub',
    description: 'Facilitates SC/ST entrepreneurs to participate in public procurement + provides incubation, training, and mentorship.',
    eligibility: 'SC/ST-owned MSMEs with Udyam registration.',
    level: 'national',
    types: ['incubation', 'training'],
    maxFundLakh: 0,
    forWomen: false, forDisabled: false, forScSt: true, forYouth: false,
    portal: 'https://www.scsthub.in',
    highlight: 'Procurement support + mentorship for SC/ST',
  },
  {
    name: 'WEP – Women Entrepreneurship Platform (NITI Aayog)',
    description: 'One-stop platform connecting women entrepreneurs to credit, incubation, mentorship, and market linkages across India.',
    eligibility: 'Women entrepreneurs at any stage of business.',
    level: 'national',
    types: ['incubation', 'training'],
    maxFundLakh: 0,
    forWomen: true, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://wep.gov.in',
    highlight: 'Mentorship, credit access & market linkages for women',
  },
  {
    name: 'Atal Innovation Mission (AIM)',
    description: 'Incubation support via Atal Incubation Centres (AICs) — up to ₹10Cr to AICs for supporting deep-tech startups.',
    eligibility: 'Early-stage startups and innovators. Apply to nearest AIC.',
    level: 'national',
    types: ['incubation', 'grant'],
    maxFundLakh: 0,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://aim.gov.in',
    highlight: 'Deep-tech incubation through 70+ AICs',
  },
  {
    name: 'ASPIRE (Agri-Business Incubation)',
    description: 'Sets up Livelihood Business Incubators (LBIs) and Technology Business Incubators (TBIs) for agri/rural startups.',
    eligibility: 'Agri-based startups and rural entrepreneurs.',
    level: 'national',
    types: ['incubation', 'grant'],
    maxFundLakh: 0,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://msme.gov.in/aspire',
    highlight: 'Incubation + funding for agri-startups',
  },
  {
    name: 'NABARD Venture Capital (VCAF)',
    description: 'Venture capital and soft loans for agribusiness ventures with innovative models in the food & agri value chain.',
    eligibility: 'Companies in agribusiness, food processing, rural industries.',
    level: 'national',
    types: ['equity', 'loan'],
    maxFundLakh: 0,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://www.nabard.org',
    highlight: 'VC funding for agribusiness innovation',
  },
  {
    name: 'PM E-DRIVE EV Charging Subsidy',
    description: '70–80% capital subsidy for setting up EV charging stations under PM E-DRIVE scheme. ₹2,000 crore earmarked.',
    eligibility: 'Any entrepreneur/company setting up public EV charging infra.',
    level: 'national',
    types: ['subsidy'],
    maxFundLakh: 0,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://heavyindustries.gov.in',
    highlight: '70–80% subsidy for EV charging stations',
  },
  {
    name: 'NSIC Marketing & Raw Material Support',
    description: 'Single Point Registration for govt tenders, raw material procurement at lower rates, and marketing assistance for MSMEs.',
    eligibility: 'Micro and small enterprises with Udyam registration.',
    level: 'national',
    types: ['loan', 'training'],
    maxFundLakh: 0,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://www.nsic.co.in',
    highlight: 'Govt tender access + raw material procurement',
  },
  {
    name: 'Startup India Recognition & Tax Benefits',
    description: '3-year income tax holiday, 80IAC exemption, angel tax relief, and self-certification for 9 labour & environmental laws.',
    eligibility: 'Entity incorporated <10 years, turnover <₹100Cr/year, working on innovation/IP.',
    level: 'national',
    types: ['grant'],
    maxFundLakh: 0,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://startupindia.gov.in/content/sih/en/startupgov/recognition.html',
    highlight: '3-year tax holiday + angel tax relief',
  },
  {
    name: 'TUFS (Technology Upgradation Fund – Textiles)',
    description: 'Interest reimbursement and capital subsidy for textile, garment, and technical textile businesses upgrading machinery.',
    eligibility: 'Existing textile sector units upgrading to benchmark technology.',
    level: 'national',
    types: ['subsidy', 'loan'],
    maxFundLakh: 0,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://texmin.nic.in/schemes/atufs',
    highlight: 'Subsidy for textile machinery upgradation',
  },
  {
    name: 'DPIIT-Udyam Registration',
    description: 'Free online MSME registration giving access to all government schemes, priority sector lending, and procurement benefits.',
    eligibility: 'All micro, small, and medium enterprises.',
    level: 'national',
    types: ['training'],
    maxFundLakh: 0,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: false,
    portal: 'https://udyamregistration.gov.in',
    highlight: 'Free — unlocks all MSME scheme benefits',
  },

  // ── STATE ──────────────────────────────────────────────────────────────────
  {
    name: 'Karnataka Elevate 100',
    description: 'Annual competition granting top 100 startups up to ₹50L non-dilutive grant + international market access and mentorship.',
    eligibility: 'Karnataka-based startups in any sector with an innovative product/service.',
    level: 'state', state: 'Karnataka',
    types: ['grant', 'incubation'],
    maxFundLakh: 50,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://elevate.karnataka.gov.in',
    highlight: 'Up to ₹50L non-dilutive grant for top 100 startups',
  },
  {
    name: 'Kerala Startup Mission (KSUM)',
    description: 'Grants up to ₹10L, co-working spaces, incubation support, and investor connect for Kerala-based startups.',
    eligibility: 'Startups incorporated in Kerala, tech or innovation-driven.',
    level: 'state', state: 'Kerala',
    types: ['grant', 'incubation'],
    maxFundLakh: 10,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://startupmission.kerala.gov.in',
    highlight: 'Up to ₹10L grant + incubation in Kerala',
  },
  {
    name: 'Maharashtra Udyog Mitra',
    description: 'Single-window facilitation for entrepreneurs — subsidies on land, power tariff, and stamp duty for new units in Maharashtra.',
    eligibility: 'New industrial/service units setting up in Maharashtra.',
    level: 'state', state: 'Maharashtra',
    types: ['subsidy'],
    maxFundLakh: 0,
    forWomen: true, forDisabled: false, forScSt: true, forYouth: false,
    portal: 'https://udyogmitra.maharashtra.gov.in',
    highlight: 'Land, power & stamp duty subsidies in Maharashtra',
  },
  {
    name: 'Gujarat GUJCOST Innovation Grant',
    description: 'Grants for technology innovation and startup incubation via Gujarat Council on Science & Technology.',
    eligibility: 'Gujarat-based innovators, startups, and MSMEs with R&D/innovation focus.',
    level: 'state', state: 'Gujarat',
    types: ['grant', 'incubation'],
    maxFundLakh: 10,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://gujcost.gujarat.gov.in',
    highlight: 'Grants for innovation-led startups in Gujarat',
  },
  {
    name: 'Tamil Nadu TANSIM (Startup Incubation)',
    description: 'Equity funding, seed grants, and incubation for TN-based startups via the Tamil Nadu Startup and Innovation Mission.',
    eligibility: 'Startups incorporated in Tamil Nadu.',
    level: 'state', state: 'Tamil Nadu',
    types: ['equity', 'grant', 'incubation'],
    maxFundLakh: 25,
    forWomen: true, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://tansim.in',
    highlight: 'Equity + grants for TN startups',
  },
  {
    name: 'Rajasthan iStart Programme',
    description: 'Seed funding, mentorship, co-working, and market access for Rajasthan startups via iStart portal.',
    eligibility: 'Startups registered or willing to register in Rajasthan.',
    level: 'state', state: 'Rajasthan',
    types: ['grant', 'incubation'],
    maxFundLakh: 10,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://istart.rajasthan.gov.in',
    highlight: 'Seed funding + incubation in Rajasthan',
  },
  {
    name: 'Telangana T-Hub Incubation',
    description: "World's largest startup incubator — access to mentors, investors, global corporations, and up to ₹25L in grants.",
    eligibility: 'Startups willing to operate from/register in Telangana.',
    level: 'state', state: 'Telangana',
    types: ['incubation', 'grant'],
    maxFundLakh: 25,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://t-hub.co',
    highlight: 'World-class incubation + grants in Telangana',
  },
  {
    name: 'Delhi Startup Policy 2022',
    description: 'Seed money up to ₹20L, co-working spaces, and marketing support for Delhi-registered startups.',
    eligibility: 'Startups registered in Delhi, less than 7 years old.',
    level: 'state', state: 'Delhi',
    types: ['grant', 'incubation'],
    maxFundLakh: 20,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://dipp.delhi.gov.in',
    highlight: 'Up to ₹20L seed funding for Delhi startups',
  },
  {
    name: 'Uttar Pradesh Startup Policy',
    description: 'Subsidies on patent filing, quality certification, and GST reimbursements + incubation support for UP startups.',
    eligibility: 'Startups incorporated in Uttar Pradesh with DPIIT recognition.',
    level: 'state', state: 'Uttar Pradesh',
    types: ['subsidy', 'incubation'],
    maxFundLakh: 10,
    forWomen: false, forDisabled: false, forScSt: false, forYouth: true,
    portal: 'https://startup.up.gov.in',
    highlight: 'GST reimbursement + patent subsidies in UP',
  },
]

const STATES = [...new Set(SCHEMES.filter((s) => s.state).map((s) => s.state as string))].sort()

const TYPE_LABELS: Record<string, string> = {
  loan: 'Loan',
  subsidy: 'Subsidy',
  grant: 'Grant',
  equity: 'Equity',
  training: 'Training',
  incubation: 'Incubation',
}

const TYPE_COLORS: Record<string, string> = {
  loan: 'bg-blue-100 text-blue-700',
  subsidy: 'bg-amber-100 text-amber-700',
  grant: 'bg-green-100 text-green-700',
  equity: 'bg-purple-100 text-purple-700',
  training: 'bg-teal-100 text-teal-700',
  incubation: 'bg-indigo-100 text-indigo-700',
}

export default function SchemesFinder() {
  const [level, setLevel] = useState<'all' | 'national' | 'state'>('all')
  const [selectedState, setSelectedState] = useState<string>('')
  const [forWomen, setForWomen] = useState(false)
  const [forDisabled, setForDisabled] = useState(false)
  const [forScSt, setForScSt] = useState(false)
  const [fundRange, setFundRange] = useState<'any' | 'under50' | '50to100' | 'above100'>('any')
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())

  const toggleType = (t: string) =>
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      next.has(t) ? next.delete(t) : next.add(t)
      return next
    })

  const filtered = useMemo(() => {
    return SCHEMES.filter((s) => {
      if (level === 'national' && s.level !== 'national') return false
      if (level === 'state') {
        if (s.level !== 'state') return false
        if (selectedState && s.state !== selectedState) return false
      }
      if (forWomen && !s.forWomen) return false
      if (forDisabled && !s.forDisabled) return false
      if (forScSt && !s.forScSt) return false
      if (fundRange === 'under50' && s.maxFundLakh !== 0 && s.maxFundLakh > 50) return false
      if (fundRange === '50to100' && (s.maxFundLakh === 0 || s.maxFundLakh <= 50 || s.maxFundLakh > 100)) return false
      if (fundRange === 'above100' && s.maxFundLakh !== 0 && s.maxFundLakh <= 100) return false
      if (selectedTypes.size > 0 && !s.types.some((t) => selectedTypes.has(t))) return false
      return true
    })
  }, [level, selectedState, forWomen, forDisabled, forScSt, fundRange, selectedTypes])

  return (
    <div className="mt-16">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-lg">🏛️</span>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Government Scheme Finder</h2>
          <p className="text-sm text-slate-500">Filter {SCHEMES.length} national & state schemes to find what fits you</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 mb-6 space-y-5">

        {/* Level */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Scheme Level</p>
          <div className="flex flex-wrap gap-2">
            {(['all', 'national', 'state'] as const).map((v) => (
              <button
                key={v}
                onClick={() => { setLevel(v); setSelectedState('') }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  level === v
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                }`}
              >
                {v === 'all' ? 'All Levels' : v === 'national' ? '🇮🇳 National' : '🗺️ State'}
              </button>
            ))}
            {level === 'state' && (
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">All States</option>
                {STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Beneficiary */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Special Beneficiary</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: '👩 For Women', state: forWomen, setter: setForWomen },
              { label: '♿ For Disabled / Divyang', state: forDisabled, setter: setForDisabled },
              { label: '🔵 For SC/ST', state: forScSt, setter: setForScSt },
            ].map(({ label, state, setter }) => (
              <label key={label} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={state}
                  onChange={(e) => setter(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fund Range */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Maximum Support Available</p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'any', label: 'Any Amount' },
              { value: 'under50', label: 'Up to ₹50L' },
              { value: '50to100', label: '₹50L – ₹1Cr' },
              { value: 'above100', label: 'Above ₹1Cr' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFundRange(value as typeof fundRange)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  fundRange === value
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-green-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Support Type</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggleType(key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedTypes.has(key)
                    ? TYPE_COLORS[key]
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <p className="mb-4 text-sm text-slate-500 font-medium">
        {filtered.length} scheme{filtered.length !== 1 ? 's' : ''} match your filters
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-slate-400">
          No schemes match your current filters. Try broadening your selection.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((s) => (
            <div
              key={s.name}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.level === 'national' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                    {s.level === 'national' ? '🇮🇳 National' : `🗺️ ${s.state}`}
                  </span>
                  {s.forWomen && <span className="inline-flex items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-700">👩 Women</span>}
                  {s.forDisabled && <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">♿ Disabled</span>}
                  {s.forScSt && <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">SC/ST</span>}
                </div>
              </div>

              {/* Title + highlight */}
              <div>
                <p className="font-semibold text-slate-900">{s.name}</p>
                {s.highlight && (
                  <p className="mt-0.5 text-sm font-medium text-green-700">{s.highlight}</p>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>

              {/* Eligibility */}
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Eligibility</p>
                <p className="text-xs text-slate-600">{s.eligibility}</p>
              </div>

              {/* Types + link */}
              <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                <div className="flex flex-wrap gap-1">
                  {s.types.map((t) => (
                    <span key={t} className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[t]}`}>
                      {TYPE_LABELS[t]}
                    </span>
                  ))}
                </div>
                <a
                  href={s.portal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  Apply ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
