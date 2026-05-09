import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DPIIT Startup Lookup — Search DPIIT-Recognised Startups in India | businessideas.live',
  description:
    'Search and filter DPIIT-recognised startups by sector, stage, and state. Use it to validate your idea, find gaps, or identify potential partners and acqui-hires.',
  alternates: { canonical: 'https://businessideas.live/dpiit-lookup' },
  openGraph: {
    title: 'DPIIT Startup Lookup — Search India\'s Recognised Startup Registry',
    description: 'Filter DPIIT-recognised startups by sector, state, and stage to find gaps and validate ideas.',
    url: 'https://businessideas.live/dpiit-lookup',
    siteName: 'businessideas.live',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'DPIIT Startup Lookup | businessideas.live',
    description: 'Search the DPIIT startup registry by sector, state, and stage.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
