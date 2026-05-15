import type { Metadata } from 'next'
import HyperlocalMapWrapper from '@/components/HyperlocalMapWrapper'
import { CITIES } from '@/lib/gap-engine/cities'
import { CATEGORIES } from '@/lib/gap-engine/categories'

const BASE = 'https://businessideas.live'

export const metadata: Metadata = {
  title: 'Hyperlocal Opportunity — Demand vs Supply Gap Map for Indian Cities | businessideas.live',
  description: `Interactive heatmap showing where search demand outpaces business supply across ${CITIES.length} Indian cities and ${CATEGORIES.length} categories. Powered by Google Trends, Maps & Udyam data.`,
  alternates: { canonical: `${BASE}/hyperlocal-opportunity` },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Hyperlocal Opportunity Map | businessideas.live',
    description: 'See demand heatmaps, supply clusters, and gap zones for any Indian city — all on one interactive map.',
    url: `${BASE}/hyperlocal-opportunity`,
    siteName: 'businessideas.live',
    images: [{ url: `${BASE}/og-default.png`, width: 1200, height: 630, alt: 'Hyperlocal Opportunity Heatmap' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'Hyperlocal Opportunity Map | businessideas.live',
    description: 'Interactive demand-supply gap maps for Indian cities. Find where to start your business.',
    images: [`${BASE}/og-default.png`],
  },
}

export default function HyperlocalOpportunityPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Supply-Demand Gap Engine</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Hyperlocal Opportunity
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Interactive heatmap of search demand vs. business supply across any Indian city.
            <span className="text-indigo-600 dark:text-indigo-400 font-medium"> Orange zones</span> = high demand ·
            <span className="text-indigo-600 dark:text-indigo-400 font-medium"> Indigo clusters</span> = existing businesses ·
            <span className="text-green-600 dark:text-green-400 font-medium"> Green zones</span> = opportunity gaps.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {[
            { src: 'Google Trends', icon: '📈' },
            { src: 'Google Maps Places', icon: '🗺️' },
            { src: 'Udyam MSME', icon: '🏭' },
          ].map(d => (
            <span
              key={d.src}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              <span>{d.icon}</span>{d.src}
            </span>
          ))}
        </div>
      </div>

      {/* Map */}
      <HyperlocalMapWrapper />

      {/* How to read */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: '🌡️',
            title: 'Demand heatmap',
            desc: 'Generated from Google Trends state-level search interest, blended with purchasing power. Peaks at simulated commercial zones within the city.',
          },
          {
            icon: '🏪',
            title: 'Supply clusters',
            desc: 'Real businesses fetched from Google Maps Places API within your selected radius. Zoom in to expand clusters and see individual business names.',
          },
          {
            icon: '✅',
            title: 'Gap zones',
            desc: 'Areas where demand intensity is high (> 35%) but no businesses exist within the search radius — these are the opportunity windows.',
          },
        ].map(s => (
          <div
            key={s.title}
            className="flex gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
          >
            <span className="text-xl shrink-0 mt-0.5">{s.icon}</span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.title}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-center text-slate-400 dark:text-slate-500">
        Demand heatmap is an estimate based on state-level Trends data and population density modelling. It is not a substitute for a primary market study.
        Supply data reflects Google Maps listings and may be incomplete.
      </p>
    </div>
  )
}
