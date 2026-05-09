import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Supply Chain Flow — Map Suppliers, Manufacturers & Distributors in India | businessideas.live',
  description:
    'Visualise the supply chain for any product category in India. Find raw material suppliers, manufacturers, and last-mile distributors before you launch.',
  alternates: { canonical: 'https://businessideas.live/supply-chain' },
  openGraph: {
    title: 'Supply Chain Flow — India Product Supply Chain Mapper',
    description: 'Map the full supply chain for any product in India — from raw materials to last-mile delivery.',
    url: 'https://businessideas.live/supply-chain',
    siteName: 'businessideas.live',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'Supply Chain Flow | businessideas.live',
    description: 'Map suppliers, manufacturers, and distributors for any product in India.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
