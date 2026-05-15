import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'India Sector Pulse — Live Growth Metrics Across Business Sectors | businessideas.live',
  description:
    'Track growth rates, funding activity, and saturation levels across Indian business sectors. Identify which industries are heating up and which are cooling down.',
  alternates: { canonical: 'https://businessideas.live/sector-pulse' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'India Sector Pulse — Real-Time Business Sector Growth Tracker',
    description: 'Live growth metrics, funding signals, and saturation scores for every major Indian business sector.',
    url: 'https://businessideas.live/sector-pulse',
    siteName: 'businessideas.live',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'India Sector Pulse | businessideas.live',
    description: 'Track real-time growth and saturation across Indian business sectors.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
