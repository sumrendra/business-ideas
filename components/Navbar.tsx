'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'
import SearchTrigger from './search/SearchTrigger'

/**
 * Grouped global navigation.
 *
 * Five top-level destinations; every page on the site is reachable in one
 * hover (desktop) or one tap (mobile). All hrefs point to EXISTING routes —
 * no URL, sitemap, or tag changes (Google indexing in progress).
 *
 * See DESIGN.md → Components → Navigation.
 */

type Leaf = { href: string; label: string; note?: string }
type Group = { heading: string; links: Leaf[] }

interface NavItem {
  label: string
  href: string
  groups?: Group[]
}

const NAV: NavItem[] = [
  {
    label: 'Ideas',
    href: '/business-ideas',
    groups: [
      {
        heading: 'Browse',
        links: [
          { href: '/business-ideas', label: 'All business ideas', note: '298 validated, with real numbers' },
          { href: '/sectors', label: 'By sector' },
          { href: '/business-ideas/under-1-lakh', label: 'Under ₹1 lakh' },
          { href: '/opportunity-finder', label: 'Opportunity finder' },
        ],
      },
    ],
  },
  {
    label: 'Startups',
    href: '/startups',
    groups: [
      {
        heading: 'Database',
        links: [
          { href: '/startups', label: 'Startup database', note: 'Revenue, funding, founders' },
        ],
      },
    ],
  },
  {
    label: 'Insights',
    href: '/blog',
    groups: [
      {
        heading: 'Read',
        links: [
          { href: '/blog', label: 'Blog', note: 'Guides & market analysis' },
          { href: '/policy-pulse', label: 'Policy Pulse', note: 'Opportunities from the news' },
        ],
      },
    ],
  },
  {
    label: 'Tools',
    href: '/tools',
    groups: [
      {
        heading: 'Funding',
        links: [
          { href: '/funding-calculators', label: 'Funding calculators' },
          { href: '/get-funded', label: 'Scheme finder' },
          { href: '/funding-radar', label: 'Startup funding radar' },
        ],
      },
      {
        heading: 'Intelligence',
        links: [
          { href: '/sector-pulse', label: 'India sector pulse' },
          { href: '/signal-radar', label: 'Signal radar' },
          { href: '/screener', label: 'KPI screener' },
          { href: '/capex-tracker', label: 'Capex & promise tracker' },
          { href: '/competitor-intel', label: 'Competitor intelligence' },
          { href: '/dpiit-lookup', label: 'DPIIT lookup' },
        ],
      },
      {
        heading: 'Local & regulatory',
        links: [
          { href: '/local-radar', label: 'Local market radar' },
          { href: '/hyperlocal-opportunity', label: 'Opportunity map' },
          { href: '/incentives', label: 'State incentives' },
          { href: '/compliance-map', label: 'License & compliance map' },
          { href: '/export-finder', label: 'Export finder' },
          { href: '/tender-search', label: 'Government tender search' },
          { href: '/supply-chain', label: 'Supply chain flow' },
        ],
      },
    ],
  },
]

function Chevron({ open = false }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={`h-2.5 w-2.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  return (
    <header className="sticky top-0 z-50 border-b border-line dark:border-line-dark bg-paper/85 dark:bg-ink-dark/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="businessideas.live"
            width={192}
            height={192}
            quality={100}
            className="h-10 w-auto"
          />
          <span className="font-bold text-ink dark:text-slate-100 text-base sm:text-lg">
            <span className="text-brand-600 dark:text-brand-500">Business</span> Ideas
          </span>
        </Link>

        {/* Desktop primary nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV.map((item) => (
            <div key={item.label} className="group relative">
              <Link
                href={item.href}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface-sunk hover:text-brand-600 dark:text-slate-300 dark:hover:bg-surface-dark-raised dark:hover:text-brand-500 transition-colors"
              >
                {item.label}
                {item.groups && <Chevron />}
              </Link>

              {item.groups && (
                <div
                  className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-all duration-150
                             group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                >
                  <div
                    className={`rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-3 shadow-[0_12px_40px_-12px_rgba(22,24,29,0.25)]
                               ${item.groups.length > 1 ? 'grid grid-cols-3 gap-x-6 gap-y-1 w-[640px]' : 'w-72'}`}
                  >
                    {item.groups.map((g) => (
                      <div key={g.heading} className="min-w-0">
                        <p className="px-2 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest text-ink-soft/60 dark:text-slate-500">
                          {g.heading}
                        </p>
                        <ul>
                          {g.links.map((l) => (
                            <li key={l.href}>
                              <Link
                                href={l.href}
                                className="block rounded-lg px-2 py-1.5 hover:bg-surface-sunk dark:hover:bg-surface-dark-raised transition-colors"
                              >
                                <span className="block text-sm font-medium text-ink dark:text-slate-100">{l.label}</span>
                                {l.note && (
                                  <span className="block text-xs text-ink-soft/70 dark:text-slate-400">{l.note}</span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2 shrink-0">
          <SearchTrigger />
          <Link
            href="/get-funded"
            className="hidden sm:inline-flex items-center rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            Get Funded
          </Link>
          <ThemeToggle />
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line dark:border-line-dark text-ink-soft dark:text-slate-300"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
              {mobileOpen ? (
                <path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu — real accordion sheet, not a hidden scroll-row */}
      {mobileOpen && (
        <div className="md:hidden border-t border-line dark:border-line-dark bg-paper dark:bg-ink-dark max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-3">
            {NAV.map((item) => {
              const isOpen = openGroup === item.label
              return (
                <div key={item.label} className="border-b border-line/60 dark:border-line-dark/60 last:border-0">
                  {item.groups ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setOpenGroup(isOpen ? null : item.label)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between py-3 text-left text-base font-semibold text-ink dark:text-slate-100"
                      >
                        {item.label}
                        <Chevron open={isOpen} />
                      </button>
                      {isOpen && (
                        <div className="pb-3">
                          {item.groups.map((g) => (
                            <div key={g.heading} className="mb-2">
                              <p className="px-1 pb-1 text-[11px] font-bold uppercase tracking-widest text-ink-soft/60 dark:text-slate-500">
                                {g.heading}
                              </p>
                              <ul className="grid grid-cols-2 gap-x-3">
                                {g.links.map((l) => (
                                  <li key={l.href}>
                                    <Link
                                      href={l.href}
                                      onClick={() => setMobileOpen(false)}
                                      className="block rounded-lg px-2 py-2 text-sm text-ink-soft dark:text-slate-300 hover:bg-surface-sunk dark:hover:bg-surface-dark-raised"
                                    >
                                      {l.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 text-base font-semibold text-ink dark:text-slate-100"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              )
            })}
            <Link
              href="/get-funded"
              onClick={() => setMobileOpen(false)}
              className="mt-4 mb-2 inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Get Funded
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
