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
    href: '/business-ideas',
    label: 'Idea Filters',
    description: 'Filter 298 ideas by budget, sector, difficulty and tags to find what fits.',
    badge: 'Discovery',
  },
  {
    href: '/hyperlocal-opportunity',
    label: 'Hyperlocal Opportunity Map',
    description: 'Interactive heatmap — demand vs. supply gap across any Indian city. See gap zones, supply clusters and Trends data on one map.',
    badge: 'New',
  },
]

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">Tools</span>
      </nav>

      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Tools</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">Practical tools for founders</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Calculators, finders and filters built around the funding schemes and idea data on this site.
          Free to use, no sign-up.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-colors"
          >
            <span className="self-start rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
              {t.badge}
            </span>
            <p className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
              {t.label}
            </p>
            <p className="mt-1 flex-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.description}
            </p>
            <span className="mt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
