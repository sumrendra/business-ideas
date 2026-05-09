import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Market Signal Radar — Early Business Opportunity Signals in India | businessideas.live',
  description:
    'Detect early-stage market signals — rising search trends, new regulations, and demographic shifts — that point to emerging business opportunities in India.',
  alternates: { canonical: 'https://businessideas.live/signal-radar' },
  openGraph: {
    title: 'Market Signal Radar — Spot Emerging Opportunities Early',
    description: 'Catch rising trends, regulatory shifts, and demand signals before they become crowded markets.',
    url: 'https://businessideas.live/signal-radar',
    siteName: 'businessideas.live',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'Market Signal Radar | businessideas.live',
    description: 'Detect emerging business opportunity signals in India before they get crowded.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
