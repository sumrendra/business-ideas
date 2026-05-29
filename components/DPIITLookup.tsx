'use client'

import { useState, useEffect } from 'react'
import type { DPIITStartup, FundingStage } from '@/lib/dpiit/startups'

interface Props {
  industry: string
  ideaTitle?: string
}

// One Voice Rule: funding stage is a neutral label, not a decorative hue.
// "Listed" is the one earned-positive milestone.
const NEUTRAL_STAGE = 'bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-slate-400'
const STAGE_COLORS: Record<FundingStage, string> = {
  'Bootstrapped': NEUTRAL_STAGE,
  'Angel':        NEUTRAL_STAGE,
  'Pre-Seed':     NEUTRAL_STAGE,
  'Seed':         NEUTRAL_STAGE,
  'Series A':     NEUTRAL_STAGE,
  'Series B':     NEUTRAL_STAGE,
  'Series C':     NEUTRAL_STAGE,
  'Series D+':    NEUTRAL_STAGE,
  'Series E':     NEUTRAL_STAGE,
  'Series F':     NEUTRAL_STAGE,
  'Series G':     NEUTRAL_STAGE,
  'Listed':       'bg-surface-sunk dark:bg-surface-dark-raised text-positive',
}

interface ScoredStartup extends DPIITStartup { relevanceScore: number }

interface LookupResult {
  sector: string
  matchMode: 'exact' | 'sector-fallback' | 'sector'
  exact: ScoredStartup[]
  sectorResults: ScoredStartup[]
  total: number
}

export default function DPIITLookup({ industry, ideaTitle }: Props) {
  const [open, setOpen]               = useState(false)
  const [data, setData]               = useState<LookupResult | null>(null)
  const [loading, setLoading]         = useState(false)
  const [showSectorFallback, setShowSectorFallback] = useState(false)
  const [stateFilter, setStateFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [query, setQuery]             = useState('')

  useEffect(() => {
    if (!open || data) return
    setLoading(true)
    const params = new URLSearchParams({ industry, limit: '50' })
    if (ideaTitle) params.set('title', ideaTitle)
    fetch(`/api/dpiit-lookup?${params}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [open, industry, ideaTitle, data])

  // Pick which list to show
  const baseList: ScoredStartup[] =
    data
      ? (data.matchMode === 'exact' || data.matchMode === 'sector')
        ? data.exact
        : showSectorFallback ? data.sectorResults : []
      : []

  const filtered = baseList.filter(s => {
    const matchesState = !stateFilter || s.state === stateFilter
    const matchesStage = !stageFilter || s.fundingStage === stageFilter
    const matchesQuery = !query ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.subSector.toLowerCase().includes(query.toLowerCase()) ||
      s.city.toLowerCase().includes(query.toLowerCase())
    return matchesState && matchesStage && matchesQuery
  })

  const allForFilters = data ? [...(data.exact ?? []), ...(data.sectorResults ?? [])] : []
  const states = [...new Set(allForFilters.map(s => s.state))].sort()
  const stages = [...new Set(allForFilters.map(s => s.fundingStage).filter(Boolean))] as FundingStage[]

  const exactCount = data?.exact.length ?? 0

  return (
    <div className="mt-6 rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🏛</span>
          <div>
            <p className="font-semibold text-ink dark:text-slate-100 text-sm sm:text-base">
              DPIIT-Recognised Startups
            </p>
            <p className="text-xs text-ink-soft dark:text-slate-400 mt-0.5">
              Registered startups in the {industry} space — DPIIT recognition database
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {data && (
            <span className="rounded-full bg-brand-600 text-white px-2.5 py-0.5 text-xs font-bold tabular-nums">
              {exactCount}
            </span>
          )}
          <svg
            className={`h-5 w-5 text-ink-soft transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-line dark:border-line-dark">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-soft dark:text-slate-400">
              <svg className="h-4 w-4 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading DPIIT data…
            </div>
          )}

          {!loading && data && (
            <>
              {/* No exact match state */}
              {data.matchMode === 'sector-fallback' && !showSectorFallback && (
                <div className="px-5 py-8 text-center">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm font-semibold text-ink dark:text-slate-300">
                    No funded startups found specifically for this niche
                  </p>
                  <p className="mt-1 text-xs text-ink-soft dark:text-slate-400 max-w-sm mx-auto">
                    This could mean the space is underserved by venture-backed companies — often a good signal for an independent manufacturer.
                  </p>
                  {data.sectorResults.length > 0 && (
                    <button
                      onClick={() => setShowSectorFallback(true)}
                      className="mt-4 text-xs font-medium text-brand-600 dark:text-brand-500 hover:underline"
                    >
                      Show {data.sectorResults.length} broader {data.sector} startups →
                    </button>
                  )}
                </div>
              )}

              {/* Results */}
              {(data.matchMode !== 'sector-fallback' || showSectorFallback) && (
                <>
                  {/* Filters */}
                  <div className="flex flex-wrap gap-2 px-5 py-3 bg-surface-sunk/60 dark:bg-surface-dark-raised/40 border-b border-line dark:border-line-dark">
                    <input
                      type="text"
                      placeholder="Search startups…"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      className="flex-1 min-w-[140px] rounded-lg border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-1.5 text-xs text-ink dark:text-slate-200 placeholder-ink-soft focus:outline-none focus:ring-1 focus:ring-brand-600"
                    />
                    <select
                      value={stateFilter}
                      onChange={e => setStateFilter(e.target.value)}
                      className="rounded-lg border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-2 py-1.5 text-xs text-ink dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-600"
                    >
                      <option value="">All States</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                      value={stageFilter}
                      onChange={e => setStageFilter(e.target.value)}
                      className="rounded-lg border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-2 py-1.5 text-xs text-ink dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-600"
                    >
                      <option value="">All Stages</option>
                      {stages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="self-center text-xs text-ink-soft dark:text-slate-500 ml-auto tabular-nums">
                      {filtered.length} shown
                    </span>
                  </div>

                  {/* Label */}
                  <div className="px-5 pt-3 pb-1 flex items-center justify-between">
                    <p className="text-xs text-ink-soft dark:text-slate-400">
                      {data.matchMode === 'exact'
                        ? <>Matched to <span className="font-semibold text-brand-700 dark:text-brand-500">&ldquo;{ideaTitle}&rdquo;</span> by keyword relevance</>
                        : <>Broader <span className="font-semibold text-brand-700 dark:text-brand-500">{data.sector}</span> startups — no exact niche match found</>
                      }
                    </p>
                    {showSectorFallback && (
                      <button
                        onClick={() => setShowSectorFallback(false)}
                        className="text-[11px] text-ink-soft hover:text-ink dark:hover:text-slate-300"
                      >
                        ← Back
                      </button>
                    )}
                  </div>

                  {filtered.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-ink-soft dark:text-slate-400">
                      No startups matched your filters.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-line dark:border-line-dark bg-surface-sunk dark:bg-surface-dark-raised">
                            <th className="px-5 py-2.5 text-left font-semibold text-ink-soft dark:text-slate-400 uppercase tracking-wide text-[11px]">Startup</th>
                            <th className="px-3 py-2.5 text-left font-semibold text-ink-soft dark:text-slate-400 uppercase tracking-wide text-[11px] hidden sm:table-cell">City / State</th>
                            <th className="px-3 py-2.5 text-left font-semibold text-ink-soft dark:text-slate-400 uppercase tracking-wide text-[11px]">Stage</th>
                            <th className="px-3 py-2.5 text-right font-semibold text-ink-soft dark:text-slate-400 uppercase tracking-wide text-[11px] hidden md:table-cell">Funding</th>
                            <th className="px-3 py-2.5 text-right font-semibold text-ink-soft dark:text-slate-400 uppercase tracking-wide text-[11px] hidden lg:table-cell">Revenue Signal</th>
                            <th className="px-3 py-2.5 text-right font-semibold text-ink-soft dark:text-slate-400 uppercase tracking-wide text-[11px]">Reg.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line dark:divide-line-dark">
                          {filtered.map(s => (
                            <tr key={s.id} className="hover:bg-surface-sunk/60 dark:hover:bg-surface-dark-raised/40 transition-colors">
                              <td className="px-5 py-3">
                                <p className="font-semibold text-ink dark:text-slate-200 leading-snug">{s.name}</p>
                                <p className="text-[11px] text-ink-soft dark:text-slate-500 mt-0.5 leading-snug">{s.subSector}</p>
                                {s.cin && (
                                  <p className="text-[10px] text-ink-soft dark:text-slate-600 mt-0.5 font-mono tabular-nums">CIN: {s.cin}</p>
                                )}
                              </td>
                              <td className="px-3 py-3 text-ink-soft dark:text-slate-400 hidden sm:table-cell whitespace-nowrap">
                                <p>{s.city}</p>
                                <p className="text-[11px] text-ink-soft dark:text-slate-500">{s.state}</p>
                              </td>
                              <td className="px-3 py-3">
                                {s.fundingStage ? (
                                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${STAGE_COLORS[s.fundingStage]}`}>
                                    {s.fundingStage}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="px-3 py-3 text-ink dark:text-slate-400 hidden md:table-cell whitespace-nowrap font-medium text-right tabular-nums">
                                {s.fundingRaised ?? '—'}
                              </td>
                              <td className="px-3 py-3 text-ink-soft dark:text-slate-400 hidden lg:table-cell text-right tabular-nums">
                                {s.estimatedRevenue ?? '—'}
                              </td>
                              <td className="px-3 py-3 text-ink-soft dark:text-slate-500 whitespace-nowrap text-right tabular-nums">
                                {s.registrationYear}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="px-5 py-3 text-[11px] text-caution border-t border-line dark:border-line-dark flex flex-wrap items-center justify-between gap-2">
                    <span>Source: DPIIT Startup Recognition CSV (Dec 2023) · MCA21 CIN registry · Crunchbase public data</span>
                    <a href="/dpiit-lookup" className="text-brand-600 dark:text-brand-500 font-semibold hover:underline">
                      Full Database →
                    </a>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
