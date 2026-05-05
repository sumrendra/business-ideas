import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ThemeProvider from '@/components/ThemeProvider'

const GA_ID = 'G-47YBE53LVP'

export const metadata: Metadata = {
  metadataBase: new URL('https://businessideas.live'),
  title: {
    default: 'Business Suggestions in India – Low Investment, High Profit & Startup Guides 2026 | Business Ideas',
    template: '%s | businessideas.live',
  },
  description:
    'Discover 300+ business ideas in India with filters by investment, profit, and difficulty. Get cost, setup steps, and funding options to start today. Business ideas for small business. Enquire Today',
  keywords: [
    'business ideas',
    'business suggestions',
    'bijnes idea',
    'small business ideas',
    'little business ideas',
    'business ideas for small business',
    'small entrepreneur ideas',
    'small company ideas',
    'small it business ideas',
    'small biz ideas',
    'small business suggestions',
    'tiny business ideas',
    'best business ideas',
    'great business ideas',
    'new business ideas',
    'latest business ideas',
    'business ideas for women',
    'business ideas India',
    'startup ideas India',
    'low investment business ideas',
  ],
  authors: [{ name: 'BusinessIdeas.live', url: 'https://businessideas.live' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'BusinessIdeas.live',
    url: 'https://businessideas.live',
    images: [{ url: '/logo.png', width: 800, height: 600 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
  },
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BusinessIdeas.live',
  url: 'https://businessideas.live/',
  logo: 'https://businessideas.live/logo.png',
  sameAs: [],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Business Ideas India',
  url: 'https://businessideas.live/',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://businessideas.live/business-ideas?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
