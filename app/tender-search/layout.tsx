import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Government Tender Search — Live GeM & CPPP Tenders | BusinessIdeas.live',
  description: 'Search live Indian government tenders from GeM, CPPP, and MahaTenders. Filter by state, ministry, category, and value. View historical bid data and top vendors.',
  alternates: { canonical: 'https://businessideas.live/tender-search' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Government Tender Search — Live GeM & CPPP Tenders',
    description: 'Search live government tenders from GeM, CPPP, and MahaTenders with historical bid intelligence.',
    url: 'https://businessideas.live/tender-search',
    siteName: 'BusinessIdeas.live',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'Government Tender Search — Live GeM & CPPP Tenders',
    description: 'Search live government tenders from GeM, CPPP, and MahaTenders with historical bid intelligence.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
