import type { Metadata } from 'next'
import IncentiveFinder from '@/components/IncentiveFinder'
import { INCENTIVES, ALL_STATES } from '@/lib/incentives'

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
    site: '@businessideaslv',
    title: 'State Business Incentives India | businessideas.live',
    description: `${INCENTIVES.length} incentives across ${ALL_STATES.length} states for Indian MSMEs and startups.`,
  },
}

export default function IncentivesPage() {
  return (
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
    </div>
  )
}
