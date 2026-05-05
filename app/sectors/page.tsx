import type { Metadata } from 'next'
import Link from 'next/link'
import { INDUSTRIES } from '@/lib/sanity/types'

const BASE = 'https://businessideas.live'

export const metadata: Metadata = {
  title: 'Business Ideas by Industry Sector — Food, Tech, Retail, Agriculture & More',
  description:
    'Explore curated business ideas by industry sector — Food & Beverage, Technology, Retail, Agriculture, Manufacturing, and more. Find the right sector for your Indian startup.',
  alternates: {
    canonical: `${BASE}/sectors`,
  },
  openGraph: {
    title: 'Business Ideas by Industry Sector | businessideas.live',
    description:
      'Browse 298 vetted Indian business ideas by sector — Food & Beverage, Technology, Retail, Agriculture, Manufacturing, and more.',
    url: `${BASE}/sectors`,
    siteName: 'businessideas.live',
    images: [{ url: `${BASE}/og-default.png`, width: 1200, height: 630, alt: 'Browse Business Ideas by Sector' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslv',
    title: 'Business Ideas by Industry Sector | businessideas.live',
    description:
      'Browse 298 vetted Indian business ideas by sector — Food & Beverage, Technology, Retail, Agriculture, Manufacturing, and more.',
    images: [`${BASE}/og-default.png`],
  },
}

const SECTOR_ICONS: Record<string, string> = {
  'Food & Beverage':  '🍽️',
  'Technology':       '💻',
  'Retail & FMCG':    '🛍️',
  'Agriculture':      '🌾',
  'Manufacturing':    '🏭',
  'Education':        '📚',
  'Healthcare':       '🏥',
  'Finance':          '💰',
  'Ecommerce':        '🛒',
  'Other':            '💡',
}

export default function SectorsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Browse by Sector</h1>
        <p className="mt-2 text-slate-500">
          Explore business ideas across industries tailored for the Indian market
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INDUSTRIES.filter((ind) => ind !== 'Other').map((industry) => (
          <Link
            key={industry}
            href={`/business-ideas?industry=${encodeURIComponent(industry)}`}
            className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
          >
            <span className="text-3xl">{SECTOR_ICONS[industry] ?? '💡'}</span>
            <div>
              <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                {industry}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Browse ideas →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
