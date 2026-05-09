import type { Metadata } from 'next'
import IncentiveFinder from '@/components/IncentiveFinder'
import { INCENTIVES, ALL_STATES } from '@/lib/incentives'
import { Ld, breadcrumbSchema, faqSchema } from '@/lib/jsonld'

const BASE = 'https://businessideas.live'

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

export default function IncentivesPage() {
  return (
    <>
    <Ld data={breadcrumb} />
    <Ld data={faq} />
    <div className="mx-auto max-w-7xl px-4 py-14">
      {/* Header */}
      <header className="mb-10 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">State Incentives</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
          State-wise Business Incentive Database
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
          {INCENTIVES.length} verified incentives across {ALL_STATES.length} states — capital subsidies, GST reimbursements,
          stamp duty waivers, electricity concessions, and more. All sourced from official state industrial policies.
        </p>

        {/* How it works */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: '🗺️', title: 'Pick your state', desc: 'Select from 20 states covered' },
            { icon: '⚙️', title: 'Filter by type',  desc: 'Capital subsidy, GST, electricity, and more' },
            { icon: '📋', title: 'Apply directly',  desc: 'Each card links to the official policy' },
          ].map(s => (
            <div key={s.title} className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </header>

      <IncentiveFinder />

      {/* ── Central Government Schemes ──────────────────────────────────────── */}
      <section className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-12">
        <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-slate-100">Central Government Solar Schemes</h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">National schemes from the Ministry of New and Renewable Energy (MNRE)</p>

        <div id="pm-surya-ghar" className="scroll-mt-24 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300 mb-2">Central Scheme · MNRE</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">PM Surya Ghar: Muft Bijli Yojana</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                India's largest rooftop solar subsidy scheme. Provides up to ₹78,000 subsidy on residential rooftop solar installations (up to 3 kW), plus 300 units free electricity per month for 25 years. Budget: ₹75,021 crore. Target: 1 crore households by 2027.
              </p>
            </div>
            <a
              href="https://pmsuryaghar.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              Apply on Portal ↗
            </a>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Subsidy (up to 2 kW)', value: '₹30,000 / kW' },
              { label: 'Subsidy (2–3 kW)', value: '₹18,000 / kW' },
              { label: 'Max Subsidy', value: '₹78,000' },
              { label: 'Free Electricity', value: '300 units / month' },
              { label: 'Loan Available', value: 'Collateral-free up to ₹2L' },
              { label: 'Eligible', value: 'All residential households' },
            ].map(r => (
              <div key={r.label} className="rounded-xl border border-amber-100 dark:border-amber-800/40 bg-white dark:bg-slate-900 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{r.label}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.value}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            Source: <a href="https://mnre.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">mnre.gov.in</a> · <a href="https://pmsuryaghar.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">pmsuryaghar.gov.in</a>
          </p>
        </div>
      </section>
    </div>
    </>
  )
}
