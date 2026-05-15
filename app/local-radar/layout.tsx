import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Local Market Radar — Find Untapped Business Opportunities Near You | businessideas.live',
  description:
    'Scan your local market for gaps and underserved demand. Get hyperlocal business opportunity scores by category, competition density, and foot-traffic signals.',
  alternates: { canonical: 'https://businessideas.live/local-radar' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Local Market Radar — Hyperlocal Business Opportunity Scanner',
    description: 'Find underserved local demand and business gaps in your area with real market signals.',
    url: 'https://businessideas.live/local-radar',
    siteName: 'businessideas.live',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'Local Market Radar | businessideas.live',
    description: 'Scan your local market for business gaps and underserved demand.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
