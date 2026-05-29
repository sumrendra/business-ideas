import type { Metadata } from 'next'
import Link from 'next/link'
import SchemesFinder from '@/components/SchemesFinder'
import Disclaimer from '@/components/Disclaimer'
import { INCENTIVES, ALL_STATES } from '@/lib/incentives'

const BASE = 'https://businessideas.live'

export const metadata: Metadata = {
  title: 'Get Funded — Government Schemes, Bank Loans & Grants for Indian Startups',
  description:
    'Explore MUDRA loans, Startup India grants, CGTMSE, and other government schemes to fund your business idea in India. Find the right funding for your budget.',
  alternates: {
    canonical: `${BASE}/get-funded`,
  },
  openGraph: {
    title: 'Get Funded — Government Schemes & Startup Grants | businessideas.live',
    description:
      'MUDRA loans, Startup India grants, CGTMSE, and more — find the right government funding scheme for your Indian business idea.',
    url: `${BASE}/get-funded`,
    siteName: 'businessideas.live',
    images: [{ url: `${BASE}/og-default.png`, width: 1200, height: 630, alt: 'Get Funded — Startup Funding in India' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'Get Funded — Government Schemes & Startup Grants | businessideas.live',
    description:
      'MUDRA loans, Startup India grants, CGTMSE, and more — find the right government funding scheme for your Indian business idea.',
    images: [`${BASE}/og-default.png`],
  },
}

const RESOURCES = [
  {
    name: 'MUDRA Loan',
    description: 'Loans up to ₹10L for micro and small enterprises under Pradhan Mantri MUDRA Yojana.',
    tag: 'Government',
    href: 'https://mudra.org.in',
  },
  {
    name: 'Startup India',
    description: 'Flagship initiative offering tax benefits, fast-track IPR, and a fund-of-funds for startups.',
    tag: 'Government',
    href: 'https://startupindia.gov.in',
  },
  {
    name: 'CGTMSE',
    description: 'Credit Guarantee Fund scheme for MSMEs — collateral-free loans up to ₹2Cr through member banks.',
    tag: 'Government',
    href: 'https://cgtmse.in',
  },
  {
    name: 'SBI SME Loan',
    description: 'Flexible business loans for small and medium enterprises with competitive interest rates.',
    tag: 'Bank Loan',
    href: 'https://sbi.co.in',
  },
  {
    name: 'Razorpay Rize',
    description: 'Early-stage funding, banking, and compliance support for Indian startups.',
    tag: 'Startup',
    href: 'https://razorpay.com/rize',
  },
  {
    name: 'iCreate',
    description: 'International Centre for Entrepreneurship & Technology — grants and incubation for innovators.',
    tag: 'Incubator',
    href: 'https://icreate.org.in',
  },
]

const TAG_COLOR: Record<string, string> = {
  Government: 'bg-brand-50 text-brand-700',
  'Bank Loan': 'bg-brand-50 text-brand-700',
  Startup:    'bg-brand-50 text-brand-700',
  Incubator:  'bg-brand-50 text-brand-700',
}

export default function GetFundedPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink dark:text-white">Get Funded</h1>
        <p className="mt-2 text-ink-soft dark:text-slate-400">
          Government schemes, bank loans, and startup programs to help you launch your business idea in India.
        </p>
      </div>

      {/* State Incentives CTA */}
      <Link
        href="/incentives"
        className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] dark:border-line-dark dark:bg-surface-dark"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-1">New</p>
          <p className="text-lg font-bold text-ink dark:text-white">State-wise Business Incentive Database</p>
          <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
            <span className="tabular-nums">{INCENTIVES.length}</span> incentives across <span className="tabular-nums">{ALL_STATES.length}</span> states — capital subsidies, GST reimbursements, stamp duty waivers & more
          </p>
        </div>
        <span className="shrink-0 text-2xl text-brand-600">→</span>
      </Link>

      {/* Quick Links */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-ink mb-4 dark:text-slate-200">Quick Links</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((r) => (
            <a
              key={r.name}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 transition-all hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] dark:border-line-dark dark:bg-surface-dark"
            >
              <div className="flex items-center justify-between">
                <span className={`badge text-xs ${TAG_COLOR[r.tag] ?? 'bg-surface-sunk text-ink-soft'}`}>
                  {r.tag}
                </span>
                <span className="text-xs text-ink-soft group-hover:text-brand-600 transition-colors dark:text-slate-500">↗</span>
              </div>
              <div>
                <p className="font-semibold text-ink group-hover:text-brand-600 transition-colors dark:text-white">
                  {r.name}
                </p>
                <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">{r.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Scheme Finder Tool */}
      <SchemesFinder />

      {/* Funding Calculators CTA */}
      <Link
        href="/funding-calculators"
        className="mt-10 block rounded-2xl border border-line bg-surface p-6 transition-all hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] dark:border-line-dark dark:bg-surface-dark"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-1">Calculators</p>
            <p className="text-lg font-bold text-ink dark:text-white">Check what you qualify for in seconds</p>
            <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">MUDRA · CGTMSE · PMEGP · EMI — instant estimates</p>
          </div>
          <span className="text-2xl text-brand-600">→</span>
        </div>
      </Link>

      <Disclaimer variant="finance" className="mt-8" />
    </div>
  )
}
