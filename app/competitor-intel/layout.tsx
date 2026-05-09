import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Competitor Intelligence — Research Your Competition Before You Launch | businessideas.live',
  description:
    'Analyse competitors in any Indian business sector. Get pricing, positioning, market share, and gap analysis to find where you can win.',
  alternates: { canonical: 'https://businessideas.live/competitor-intel' },
  openGraph: {
    title: 'Competitor Intelligence Tool — Know Your Competition Before You Launch',
    description: 'Deep-dive competitor research for Indian markets: pricing, positioning, gaps, and win strategies.',
    url: 'https://businessideas.live/competitor-intel',
    siteName: 'businessideas.live',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'Competitor Intelligence | businessideas.live',
    description: 'Research pricing, positioning, and market gaps across Indian business sectors.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
