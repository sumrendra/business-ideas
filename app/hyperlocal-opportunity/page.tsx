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
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-500">Supply-Demand Gap Engine</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-ink dark:text-paper-dark">
            Hyperlocal Opportunity
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft dark:text-paper-dark/70 max-w-2xl">
            Interactive heatmap of search demand vs. business supply across any Indian city.
            <span className="text-caution font-medium"> Demand zones</span> = high demand ·
            <span className="text-brand-600 dark:text-brand-500 font-medium"> Indigo clusters</span> = existing businesses ·
            <span className="text-positive font-medium"> Gap zones</span> = opportunity gaps.
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
              className="flex items-center gap-1.5 rounded-full border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-1 text-xs font-medium text-ink-soft dark:text-paper-dark/70"
            >
              <span aria-hidden>{d.icon}</span>{d.src}
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
            className="flex gap-3 rounded-lg border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-4"
          >
            <span aria-hidden className="text-xl shrink-0 mt-0.5">{s.icon}</span>
            <div>
              <p className="text-sm font-semibold text-ink dark:text-paper-dark">{s.title}</p>
              <p className="mt-0.5 text-xs text-ink-soft dark:text-paper-dark/60 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-center text-ink-soft/70 dark:text-paper-dark/50">
        Demand heatmap is an estimate based on state-level Trends data and population density modelling. It is not a substitute for a primary market study.
        Supply data reflects Google Maps listings and may be incomplete.
      </p>
    </div>
  )
}
