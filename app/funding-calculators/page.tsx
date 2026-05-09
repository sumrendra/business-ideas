import type { Metadata } from 'next'
import Link from 'next/link'
import FundingCalculators from '@/components/FundingCalculators'
import Disclaimer from '@/components/Disclaimer'

const BASE = 'https://businessideas.live'

export const metadata: Metadata = {
  title: 'Funding Calculators — MUDRA, CGTMSE, PMEGP & EMI for Indian Businesses',
  description:
    'Free calculators for Indian small business funding: check MUDRA loan eligibility, CGTMSE collateral-free cover, PMEGP subsidy and EMI on any term loan.',
  alternates: { canonical: `${BASE}/funding-calculators` },
  openGraph: {
    title: 'Funding Calculators for Indian Businesses | businessideas.live',
    description:
      'MUDRA, CGTMSE, PMEGP subsidy and EMI calculators — find what you qualify for in seconds.',
    url: `${BASE}/funding-calculators`,
    siteName: 'businessideas.live',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'Funding Calculators for Indian Businesses',
    description: 'MUDRA, CGTMSE, PMEGP & EMI calculators for Indian entrepreneurs.',
  },
}

const FAQ = [
  {
    q: 'What is the difference between MUDRA, CGTMSE and PMEGP?',
    a: 'MUDRA is a direct loan scheme up to ₹20L for micro enterprises. CGTMSE is a credit guarantee that lets banks lend up to ₹5 Cr without collateral. PMEGP is a capital subsidy of 15–35% on new manufacturing or service units, plus a bank loan for the balance.',
  },
  {
    q: 'How much MUDRA loan can I get?',
    a: 'MUDRA covers four tiers: Shishu (up to ₹50,000), Kishor (₹50,001 – ₹5L), Tarun (₹5L – ₹10L), and Tarun Plus (₹10L – ₹20L for existing borrowers). All MUDRA loans are collateral-free and guaranteed by CGFMU.',
  },
  {
    q: 'Is CGTMSE a loan I apply for?',
    a: 'No — CGTMSE is a guarantee, not a loan. You apply for a loan at any CGTMSE member bank or NBFC; the lender then registers the loan under CGTMSE so that no collateral is needed up to ₹5 Cr.',
  },
  {
    q: 'Can I get PMEGP for an existing business?',
    a: 'PMEGP is exclusively for new units. Existing units that have already availed government subsidies are not eligible. The unit must run for 3 years post disbursal for the subsidy to be released from the term-deposit lock-in.',
  },
  {
    q: 'What are typical interest rates on MSME loans in India?',
    a: 'Public sector banks charge around 8.5–11% (RLLR-linked), private banks 10–13%, and NBFCs 13–18%. CGTMSE-covered loans are usually 0.5–1% higher to cover the guarantee fee.',
  },
]

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function FundingCalculatorsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/get-funded" className="hover:text-indigo-600">Get Funded</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">Calculators</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Funding Calculators for Indian Businesses</h1>
          <p className="mt-3 text-lg text-slate-600">
            Quick estimates on what you qualify for under India's main MSME funding schemes — MUDRA, CGTMSE, PMEGP — and a standard EMI calculator for any term loan.
          </p>
        </header>

        <FundingCalculators />

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
            {FAQ.map((f, i) => (
              <details key={i} className="group px-5 py-4">
                <summary className="cursor-pointer text-sm font-medium text-slate-800 marker:content-none">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <Disclaimer className="mt-10" />
      </div>
    </>
  )
}
