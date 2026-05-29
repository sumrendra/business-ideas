import type { Metadata } from 'next'
import Link from 'next/link'

const BASE = 'https://businessideas.live'

export const metadata: Metadata = {
  title: 'Tools — Funding Calculators, Scheme Finder & Idea Filters',
  description:
    'Free tools for Indian entrepreneurs: MUDRA / CGTMSE / PMEGP funding calculators, government scheme finder, and idea filters by budget and difficulty.',
  alternates: { canonical: `${BASE}/tools` },
  openGraph: {
    title: 'Tools — Funding Calculators & Scheme Finder | businessideas.live',
    description: 'Calculators and finders to figure out the right funding and the right idea for your situation.',
    url: `${BASE}/tools`,
    type: 'website',
  },
}

const TOOLS = [
  {
    href: '/funding-calculators',
    label: 'Funding Calculators',
    description: 'MUDRA loan, CGTMSE cover, PMEGP subsidy and EMI — instant estimates.',
    badge: 'Calculators',
  },
  {
    href: '/get-funded',
    label: 'Scheme Finder',
    description: 'Match yourself to government schemes based on budget, sector and category.',
    badge: 'Funding',
  },
  {
    href: '/funding-radar',
    label: 'Startup Funding Radar',
    description: '65+ real Indian startup deals FY2022–24 — filter by sector, stage, and city. See where capital is flowing.',
    badge: 'Intelligence',
  },
  {
    href: '/compliance-map',
    label: 'License & Compliance Map',
    description: 'Every license you need, what it costs, and how long it takes — for 9 common Indian business types.',
    badge: 'Regulatory',
  },
  {
    href: '/competitor-intel',
    label: 'Competitor Intelligence',
    description: 'Scan all 15 business categories in any Indian city. See incumbent density, gap scores, and entry difficulty side by side.',
    badge: 'Competitive',
  },
  {
    href: '/export-finder',
    label: 'Export Opportunity Finder',
    description: '25 SME-accessible export categories with FY24 data — value, growth, top markets, certifications, and opportunity score.',
    badge: 'Trade',
  },
  {
    href: '/supply-chain',
    label: 'Supply Chain Flow — Solar Maintenance',
    description: 'Interactive supply chain map: click any node to reveal suppliers, real costs, margins, common pitfalls, and tools at each stage.',
    badge: 'Visual',
  },
  {
    href: '/signal-radar',
    label: 'Signal Radar',
    description: 'Live intelligence from 20+ sources — YourStory, Inc42, Reddit, HN and more — scored by velocity to surface what\'s heating up right now.',
    badge: 'Live',
  },
  {
    href: '/dpiit-lookup',
    label: 'DPIIT Competitor Lookup',
    description: '300+ DPIIT-recognized startups — filter by sector, state, and funding stage. See who\'s already in any space before you start.',
    badge: 'Intelligence',
  },
  {
    href: '/local-radar',
    label: 'Local Market Radar',
    description: 'City-level market intelligence: how many businesses exist in your area, historical trajectory (1yr/2yr/3yr), survival rates, and entry velocity — powered by Google Places, MCA21, Udyam, and GSTIN.',
    badge: 'Live',
  },
  {
    href: '/sector-pulse',
    label: 'India Sector Pulse',
    description: 'McKinsey-style 8-signal economic vitality index for 30 sectors — formation velocity, survival rates, credit momentum, trade exposure, employment absorption, policy tailwind and more. Updated from MCA21, Udyam, RBI, DGFT, and EPFO data.',
    badge: 'New',
  },
  {
    href: '/tender-search',
    label: 'Government Tender Search',
    description: 'Live tenders from GeM, CPPP, and MahaTenders. Search active government contracts, view historical L1 bid prices, and identify top vendors winning government work.',
    badge: 'Live',
  },
  {
    href: '/screener',
    label: 'India KPI Screener',
    description: 'Sector-specific KPIs for 75+ listed Indian companies — GNPA/NIM for banks, VNB margin for insurance, RevPAR for hotels, ANDA filings for pharma. Sort any column instantly.',
    badge: 'New',
  },
  {
    href: '/capex-tracker',
    label: 'Capex & Promise Tracker',
    description: 'Did the ₹500 Cr capex they announced actually get spent? Track what NSE-listed companies promised in concalls and annual reports — vs. what actually happened. Delivered, missed, or watch.',
    badge: 'New',
  },
]

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-ink-soft dark:text-slate-400">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-ink dark:text-slate-300">Tools</span>
      </nav>

      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-600">Tools</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-ink dark:text-slate-100">Practical tools for founders</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft dark:text-slate-400">
          Calculators, finders and filters built around the funding schemes and idea data on this site.
          Free to use, no sign-up.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className="group flex flex-col rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised p-5 transition duration-150 ease-out hover:-translate-y-0.5 hover:border-brand-600 dark:hover:border-brand-600 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)]"
          >
            <span className="self-start rounded-full bg-surface-sunk dark:bg-surface-dark px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft dark:text-slate-400">
              {t.badge}
            </span>
            <p className="mt-3 text-base font-semibold text-ink dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-600 transition-colors">
              {t.label}
            </p>
            <p className="mt-1 flex-1 text-sm text-ink-soft dark:text-slate-400 leading-relaxed">
              {t.description}
            </p>
            <span className="mt-4 text-xs font-semibold text-brand-600 dark:text-brand-600">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
