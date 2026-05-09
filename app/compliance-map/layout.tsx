import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'License & Compliance Map — Business Registration Requirements in India | businessideas.live',
  description:
    'Look up every license, permit, and compliance requirement to start a business in India. Filter by business type, state, and sector to get a complete checklist.',
  alternates: { canonical: 'https://businessideas.live/compliance-map' },
  openGraph: {
    title: 'License & Compliance Map — India Business Registration Guide',
    description: 'Every license and permit needed to legally start your business in India, by sector and state.',
    url: 'https://businessideas.live/compliance-map',
    siteName: 'businessideas.live',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'License & Compliance Map | businessideas.live',
    description: 'Business licenses and compliance requirements for every sector in India.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
