import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Startup Funding Radar — Track VC Rounds & Investor Activity in India | businessideas.live',
  description:
    'Monitor live funding rounds, active investors, and hot sectors in the Indian startup ecosystem. Find the right investor for your stage and industry.',
  alternates: { canonical: 'https://businessideas.live/funding-radar' },
  openGraph: {
    title: 'Startup Funding Radar — India VC & Investor Tracker',
    description: 'Track live funding activity, investor focus areas, and hot sectors in Indian startups.',
    url: 'https://businessideas.live/funding-radar',
    siteName: 'businessideas.live',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'Startup Funding Radar | businessideas.live',
    description: 'Track VC rounds, active investors, and hot sectors in Indian startups.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
