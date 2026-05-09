import type { Metadata } from 'next'
import OpportunityFinder from '@/components/OpportunityFinder'
import { CITIES } from '@/lib/gap-engine/cities'
import { CATEGORIES } from '@/lib/gap-engine/categories'

const BASE = 'https://businessideas.live'

export const metadata: Metadata = {
  title: 'Opportunity Finder — Supply-Demand Gap Engine for Indian Cities | businessideas.live',
  description:
    `Discover where demand is high but supply is low across ${CITIES.length} Indian cities and ${CATEGORIES.length} business categories. Powered by Google Trends, Google Maps, and Udyam MSME data.`,
  alternates: { canonical: `${BASE}/opportunity-finder` },
  openGraph: {
    title: 'Opportunity Finder — Supply-Demand Gap Engine | businessideas.live',
    description: 'Cross-reference Google Trends demand with Google Maps supply data to find untapped business opportunities in any Indian city.',
    url: `${BASE}/opportunity-finder`,
    siteName: 'businessideas.live',
    images: [{ url: `${BASE}/og-default.png`, width: 1200, height: 630, alt: 'Opportunity Finder — Gap Engine' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'Opportunity Finder — Supply-Demand Gap Engine | businessideas.live',
    description: 'Find where demand outstrips supply in your city. Powered by Google Trends + Maps data.',
    images: [`${BASE}/og-default.png`],
  },
}

export default function OpportunityFinderPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* Header */}
      <header className="mb-10 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Supply-Demand Gap Engine</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
          Opportunity Finder
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
          Pick a city and a business category. We cross-reference Google Trends search demand with
          Google Maps business count and Udyam MSME registration density to surface where genuine
          gaps exist — high demand, low supply.
        </p>

        {/* How it works */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: '📈',
              title: 'Demand signal',
              desc: 'Google Trends search interest by state, blended with purchasing power index',
            },
            {
              icon: '🏪',
              title: 'Supply signal',
              desc: 'Google Maps nearby business count within your radius + Udyam MSME density',
            },
            {
              icon: '🎯',
              title: 'Gap score',
              desc: 'Demand minus supply (0–100). Higher = bigger opportunity window',
            },
          ].map(s => (
            <div
              key={s.title}
              className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
            >
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Data sources badge strip */}
        <div className="mt-4 flex flex-wrap gap-2">
          {['Google Trends', 'Google Maps Places API', 'Udyam Registration (MSME)', 'RBI State Finance Data'].map(src => (
            <span key={src} className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              {src}
            </span>
          ))}
        </div>
      </header>

      <OpportunityFinder />
    </div>
  )
}
