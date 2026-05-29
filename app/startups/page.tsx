import type { Metadata } from 'next'
import Link from 'next/link'
import { readClient } from '@/lib/sanity/client'
import { STARTUPS_QUERY, STARTUPS_COUNT_QUERY } from '@/lib/sanity/queries'
import type { Startup } from '@/lib/sanity/types'
import {
  STARTUP_STAGE_LABELS,
  STARTUP_STATUS_LABELS,
  BUSINESS_MODEL_LABELS,
  FUNDING_RANGE_OPTIONS,
} from '@/lib/sanity/types'

const STARTUPS_PER_PAGE = 24

export const metadata: Metadata = {
  title: 'Indian Startup Database — Revenue, Funding, Founders | BusinessIdeas.live',
  description:
    'Searchable database of Indian startups. Filter by industry, funding stage, city, and revenue band. Founders, financials, funding rounds, and timelines for every profile.',
  alternates: { canonical: 'https://businessideas.live/startups' },
  openGraph: {
    title: 'Indian Startup Database — Revenue, Funding, Founders',
    description:
      'Filter Indian startups by industry, funding stage, city, and revenue band. Profile pages include financials, funding rounds, and founder stories.',
    url: 'https://businessideas.live/startups',
    type: 'website',
  },
}

interface PageProps {
  searchParams: Promise<{
    industry?: string
    stage?: string
    status?: string
    model?: string
    city?: string
    funding?: string
    foundedFrom?: string
    foundedTo?: string
    tags?: string | string[]
    search?: string
    page?: string
  }>
}

export default async function StartupsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const activeTags = sp.tags
    ? Array.isArray(sp.tags)
      ? sp.tags
      : [sp.tags]
    : []

  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10))
  const from = (currentPage - 1) * STARTUPS_PER_PAGE
  const to = currentPage * STARTUPS_PER_PAGE - 1

  const fundingBand = FUNDING_RANGE_OPTIONS.find((o) => o.value === (sp.funding ?? ''))
  const fundingMin = fundingBand?.min ?? 0
  const fundingMax = fundingBand?.max ?? 0 // 0 → "no upper bound" in GROQ

  const filterParams = {
    industry: sp.industry ?? '',
    stage:    sp.stage    ?? '',
    status:   sp.status   ?? '',
    model:    sp.model    ?? '',
    city:     sp.city     ?? '',
    tags:     activeTags,
    search:   sp.search   ?? '',
    fundingMin,
    fundingMax: fundingMax ?? 0,
    foundedFrom: parseInt(sp.foundedFrom ?? '0', 10) || 0,
    foundedTo:   parseInt(sp.foundedTo   ?? '0', 10) || 0,
  }

  const [startups, count] = await Promise.all([
    readClient.fetch<Startup[]>(
      STARTUPS_QUERY,
      { ...filterParams, from, to },
      { next: { tags: ['startups'] } },
    ),
    readClient.fetch<number>(STARTUPS_COUNT_QUERY, filterParams, {
      next: { tags: ['startups'] },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(count / STARTUPS_PER_PAGE))

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 text-ink dark:text-paper-dark">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600">
          Startup Database
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-paper-dark">
          Indian Startup Database
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft dark:text-slate-400">
          Profiles, funding rounds, revenue snapshots and founder stories for{' '}
          <span className="tabular-nums font-medium text-ink dark:text-paper-dark">{count}</span>
          {count === 1 ? ' Indian startup' : ' Indian startups'}. Filter to find your sector,
          stage, or city. Design polish coming soon — this is the v1 scaffold.
        </p>
      </header>

      {/* Minimal placeholder filter chips — full FilterSidebar component comes in design pass */}
      <div className="mb-6 flex flex-wrap gap-2 text-xs text-ink-soft dark:text-slate-400">
        <span className="rounded-full bg-surface-sunk dark:bg-surface-dark-raised px-3 py-1 tabular-nums">
          Stages: {Object.keys(STARTUP_STAGE_LABELS).length}
        </span>
        <span className="rounded-full bg-surface-sunk dark:bg-surface-dark-raised px-3 py-1 tabular-nums">
          Statuses: {Object.keys(STARTUP_STATUS_LABELS).length}
        </span>
        <span className="rounded-full bg-surface-sunk dark:bg-surface-dark-raised px-3 py-1 tabular-nums">
          Models: {Object.keys(BUSINESS_MODEL_LABELS).length}
        </span>
      </div>

      {startups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line dark:border-line-dark bg-surface-sunk/40 dark:bg-surface-dark/40 py-24 text-center">
          <p className="text-lg font-medium text-ink dark:text-paper-dark">
            No startups in the database yet.
          </p>
          <p className="mt-2 text-sm text-ink-soft dark:text-slate-500">
            Add the first one via the Sanity Studio at <code>/studio</code> → Startups.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {startups.map((s) => (
            <li
              key={s._id}
              className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5 transition-all hover:-translate-y-0.5 hover:border-brand-600/40 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] dark:hover:border-brand-500/40"
            >
              <Link href={`/startups/${s.slug}`} className="block">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[1.0625rem] font-semibold leading-snug text-ink dark:text-paper-dark">
                    {s.name}
                  </h2>
                  {s.stage && (
                    <span className="shrink-0 rounded-full bg-brand-50 dark:bg-brand-600/15 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:text-brand-100">
                      {STARTUP_STAGE_LABELS[s.stage] ?? s.stage}
                    </span>
                  )}
                </div>
                {s.tagline && (
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft dark:text-slate-400 line-clamp-2">
                    {s.tagline}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-ink-soft dark:text-slate-400">
                  {s.industry && <span>{s.industry}</span>}
                  {s.hq_city && <span>· {s.hq_city}</span>}
                  {s.founded_year && (
                    <span>· Est. <span className="tabular-nums">{s.founded_year}</span></span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-between text-sm">
          <span className="text-ink-soft dark:text-slate-400">
            Page <span className="tabular-nums">{currentPage}</span> of{' '}
            <span className="tabular-nums">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/startups?page=${currentPage - 1}`}
                className="rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-1.5 text-ink-soft dark:text-slate-300 transition-colors hover:border-brand-600/40 hover:text-brand-700 dark:hover:text-brand-100"
              >
                ← Prev
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/startups?page=${currentPage + 1}`}
                className="rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-1.5 text-ink-soft dark:text-slate-300 transition-colors hover:border-brand-600/40 hover:text-brand-700 dark:hover:text-brand-100"
              >
                Next →
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  )
}
