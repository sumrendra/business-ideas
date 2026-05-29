import type { Metadata } from 'next'
import IncentiveFinder, { type NormalizedIncentive } from '@/components/IncentiveFinder'
import { INCENTIVES, ALL_STATES, TYPE_META } from '@/lib/incentives'
import { Ld, breadcrumbSchema, faqSchema } from '@/lib/jsonld'
import { getNeonPool } from '@/lib/neon'

const BASE = 'https://businessideas.live'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'State Business Incentives India — Capital Subsidy, GST Reimbursement & More | businessideas.live',
  description:
    `Find state-wise business incentives across ${ALL_STATES.length} Indian states — capital subsidies, interest subvention, GST reimbursement, stamp duty waivers, and electricity concessions for MSMEs and startups.`,
  alternates: { canonical: `${BASE}/incentives` },
  openGraph: {
    title: 'State Business Incentives India | businessideas.live',
    description: `${INCENTIVES.length} incentives across ${ALL_STATES.length} states — capital subsidy, GST reimbursement, stamp duty waiver, electricity concession for Indian businesses.`,
    url: `${BASE}/incentives`,
    siteName: 'businessideas.live',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'State Business Incentives India | businessideas.live',
    description: `${INCENTIVES.length} incentives across ${ALL_STATES.length} states for Indian MSMEs and startups.`,
  },
}

const breadcrumb = breadcrumbSchema([
  { name: 'Home', url: 'https://businessideas.live/' },
  { name: 'State Incentives', url: 'https://businessideas.live/incentives' },
])

const faq = faqSchema([
  { q: 'Which Indian states offer the best business incentives?', a: 'Gujarat, Telangana, Karnataka, Tamil Nadu, and Maharashtra consistently offer the strongest MSME incentive packages — including capital subsidies up to 25%, GST reimbursements, and electricity concessions.' },
  { q: 'What is a capital subsidy for new businesses?', a: 'A capital subsidy is a one-time grant from the state government covering a percentage (typically 10–25%) of your plant and machinery investment, reducing your upfront setup cost.' },
  { q: 'Who is eligible for PM Surya Ghar subsidy?', a: 'All residential households across India are eligible. The subsidy is ₹30,000/kW for first 2 kW and ₹18,000/kW for 2–3 kW, with a maximum of ₹78,000 per household.' },
  { q: 'How do I apply for state MSME incentives?', a: 'Most states require you to register on the state Single Window Portal and submit your project report after obtaining a factory/MSME registration. Each incentive card links to the official application portal.' },
])

interface NeonIncentive {
  state: string
  scheme_name: string
  incentive_type: string
  sector: string
  benefit_desc: string
  amount_percent: number | null
  portal_url: string | null
}

async function fetchNeonIncentives(): Promise<NeonIncentive[]> {
  try {
    const pool = getNeonPool()
    const { rows } = await pool.query<NeonIncentive>(
      `SELECT state, scheme_name, incentive_type, sector, benefit_desc, amount_percent, portal_url
       FROM state_incentives
       ORDER BY amount_percent DESC NULLS LAST`
    )
    return rows
  } catch {
    return []
  }
}

// Map the Neon `incentive_type` enum to the curated IncentiveType keys when we can,
// fall back to 'other' so the existing TYPE_META styling still applies.
const NEON_TYPE_MAP: Record<string, keyof typeof TYPE_META> = {
  capital_subsidy:      'capital-subsidy',
  interest_subsidy:     'interest-subsidy',
  startup_grant:        'other',
  sector_subsidy:       'capital-subsidy',
  employment_subsidy:   'employment',
  power_subsidy:        'electricity',
  investment_incentive: 'capital-subsidy',
  revival_support:      'other',
}

function normalizeNeon(rows: NeonIncentive[]): NormalizedIncentive[] {
  return rows.map((r, i) => ({
    id: `neon-${i}`,
    state: r.state,
    name: r.scheme_name,
    type: NEON_TYPE_MAP[r.incentive_type] ?? 'other',
    rawTypeLabel: r.incentive_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    amount: r.amount_percent ? `${r.amount_percent}% subsidy` : r.benefit_desc,
    eligibility: r.benefit_desc,
    duration: '—',
    sector: r.sector && r.sector !== 'All' && r.sector !== 'General' ? r.sector : undefined,
    enterpriseSize: [],
    newOnly: false,
    forWomen: false,
    forScSt: false,
    policyName: 'State industrial policy',
    sourceUrl: r.portal_url ?? '',
    amountPercent: r.amount_percent,
    source: 'live',
  }))
}

function normalizeCurated(): NormalizedIncentive[] {
  return INCENTIVES.map(i => ({
    id: i.id,
    state: i.state,
    name: i.name,
    type: i.type,
    amount: i.amount,
    eligibility: i.eligibility,
    duration: i.duration,
    sector: i.sectors[0] && i.sectors[0] !== 'all' ? i.sectors[0] : undefined,
    enterpriseSize: i.enterpriseSize,
    newOnly: i.newOnly,
    forWomen: i.forWomen,
    forScSt: i.forScSt,
    policyName: i.policyName,
    sourceUrl: i.sourceUrl,
    amountPercent: null,
    source: 'curated',
  }))
}

export default async function IncentivesPage() {
  const neonIncentives = await fetchNeonIncentives()
  const all: NormalizedIncentive[] = [
    ...normalizeCurated(),
    ...normalizeNeon(neonIncentives),
  ]
  const totalSchemes = all.length
  const totalStates = new Set(all.map(i => i.state)).size

  return (
    <>
      <Ld data={breadcrumb} />
      <Ld data={faq} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16" style={{ scrollPaddingTop: '160px' }}>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <header className="mb-8 max-w-3xl">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-500">
            State Incentives
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink dark:text-paper-dark sm:text-4xl">
            State-wise Business Incentive Database
          </h1>
          <p className="mt-3 text-base text-ink-soft dark:text-paper-dark/70 sm:text-lg">
            <span className="font-semibold tabular-nums text-ink dark:text-paper-dark">{totalSchemes} verified schemes</span>{' '}
            across <span className="font-semibold tabular-nums text-ink dark:text-paper-dark">{totalStates} states</span>{' '}
            — capital subsidies, GST reimbursements, stamp duty waivers and electricity concessions, sourced from official state industrial policies.
          </p>
        </header>

        {/* ── Featured central scheme strip ────────────────────────────── */}
        <a
          id="pm-surya-ghar"
          href="https://pmsuryaghar.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-10 flex flex-col gap-3 rounded-lg border border-line bg-surface p-5 transition-all hover:border-brand-300 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] dark:border-line-dark dark:bg-surface-dark dark:hover:border-brand-600/50 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-caution/10 text-caution ring-1 ring-inset ring-caution/20 dark:bg-caution/15 dark:ring-caution/25">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-caution">Featured · Central scheme</p>
              <p className="text-sm font-semibold text-ink dark:text-paper-dark sm:text-base">PM Surya Ghar: Muft Bijli Yojana</p>
            </div>
          </div>
          <div className="flex-1 text-sm text-ink-soft dark:text-paper-dark/70">
            Up to <span className="font-semibold tabular-nums text-ink dark:text-paper-dark">₹78,000 subsidy</span> on residential rooftop solar (up to 3&nbsp;kW) plus 300 free units/month for 25 years.
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-600 group-hover:text-brand-700 dark:text-brand-500 dark:group-hover:text-brand-200">
            Apply on portal
            <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </span>
        </a>

        {/* ── Unified finder ───────────────────────────────────────────── */}
        <IncentiveFinder incentives={all} />

        {/* ── Disclaimer ───────────────────────────────────────────────── */}
        <p className="mt-10 text-xs text-ink-soft/70 dark:text-paper-dark/50">
          Incentive details are based on publicly available policy documents and may change.
          Verify eligibility and current terms with the respective State Industries Department or DIC before applying.
          Zone- and district-specific rates may vary.
        </p>
      </div>
    </>
  )
}
