import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Export Opportunity Finder — Discover India\'s Best Products to Export | businessideas.live',
  description:
    'Find high-demand export products from India. Filter by margin, competition, and target markets. Get real data on HS codes, key buyers, and compliance requirements.',
  alternates: { canonical: 'https://businessideas.live/export-finder' },
  openGraph: {
    title: 'Export Opportunity Finder — India\'s Best Products to Export',
    description: 'Discover high-margin export products from India with real buyer data and compliance guidance.',
    url: 'https://businessideas.live/export-finder',
    siteName: 'businessideas.live',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'Export Opportunity Finder | businessideas.live',
    description: 'Find high-demand export products from India with margin and compliance data.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
