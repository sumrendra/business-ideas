'use client'

import { useState, useEffect } from 'react'
import type { DPIITStartup, FundingStage } from '@/lib/dpiit/startups'

interface Props {
  industry: string
  ideaTitle?: string
}

const STAGE_COLORS: Record<FundingStage, string> = {
  'Bootstrapped': 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  'Angel':        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  'Pre-Seed':     'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  'Seed':         'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  'Series A':     'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  'Series B':     'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'Series C':     'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  'Series D+':    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  'Series E':     'bg-purple-200 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
  'Series F':     'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  'Series G':     'bg-violet-200 dark:bg-violet-900/50 text-violet-800 dark:text-violet-300',
  'Listed':       'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
}

interface LookupResult {
  sector: string
  total: number
  startups: DPIITStartup[]
}

export default function DPIITLookup({ industry, ideaTitle }: Props) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<LookupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [stateFilter, setStateFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open || data) return
    setLoading(true)
    fetch(`/api/dpiit-lookup?industry=${encodeURIComponent(industry)}&limit=50`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [open, industry, data])

  const filtered = data?.startups.filter(s => {
    const matchesState = !stateFilter || s.state === stateFilter
    const matchesStage = !stageFilter || s.fundingStage === stageFilter
    const matchesQuery = !query || s.name.toLowerCase().includes(query.toLowerCase()) ||
                         s.subSector.toLowerCase().includes(query.toLowerCase()) ||
                         s.city.toLowerCase().includes(query.toLowerCase())
    return matchesState && matchesStage && matchesQuery
  }) ?? []

  const states = data ? [...new Set(data.startups.map(s => s.state))].sort() : []
  const stages = data ? [...new Set(data.startups.map(s => s.fundingStage).filter(Boolean))] as FundingStage[] : []

  return (
    <div className="mt-6 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🏢</span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              Who&apos;s Already Doing This?
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              DPIIT-recognized startups in the {industry} space
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {data && (
            <span className="rounded-full bg-indigo-600 text-white px-2.5 py-0.5 text-xs font-bold">
              {data.total}
            </span>
          )}
          <svg
            className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-indigo-200 dark:border-indigo-900/60">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500 dark:text-slate-400">
              <svg className="h-4 w-4 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading DPIIT data…
            </div>
          )}

          {!loading && data && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 px-5 py-3 bg-white/60 dark:bg-slate-900/40 border-b border-indigo-100 dark:border-indigo-900/40">
                <input
                  type="text"
                  placeholder="Search startups…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 min-w-[140px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <select
                  value={stateFilter}
                  onChange={e => setStateFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                >
                  <option value="">All States</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={stageFilter}
                  onChange={e => setStageFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                >
                  <option value="">All Stages</option>
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="self-center text-xs text-slate-400 dark:text-slate-500 ml-auto">
                  {filtered.length} of {data.total} shown
                </span>
              </div>

              {/* Sector label */}
              <div className="px-5 pt-3 pb-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Matched to DPIIT sector: <span className="font-semibold text-indigo-700 dark:text-indigo-300">{data.sector}</span>
                  {ideaTitle && (
                    <span> for &ldquo;{ideaTitle}&rdquo;</span>
                  )}
                </p>
              </div>

              {/* Table */}
              {filtered.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No startups matched your filters.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-indigo-100 dark:border-indigo-900/40 bg-white/40 dark:bg-slate-900/30">
                        <th className="px-5 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px]">Startup</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] hidden sm:table-cell">City / State</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px]">Stage</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] hidden md:table-cell">Funding</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] hidden lg:table-cell">Revenue Signal</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px]">Reg.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50 dark:divide-indigo-950/40">
                      {filtered.map(s => (
                        <tr key={s.id} className="hover:bg-white/60 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="px-5 py-3">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{s.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{s.subSector}</p>
                            {s.cin && (
                              <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5 font-mono">CIN: {s.cin}</p>
                            )}
                          </td>
                          <td className="px-3 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell whitespace-nowrap">
                            <p>{s.city}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{s.state}</p>
                          </td>
                          <td className="px-3 py-3">
                            {s.fundingStage ? (
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${STAGE_COLORS[s.fundingStage]}`}>
                                {s.fundingStage}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-3 py-3 text-slate-600 dark:text-slate-400 hidden md:table-cell whitespace-nowrap font-medium">
                            {s.fundingRaised ?? '—'}
                          </td>
                          <td className="px-3 py-3 text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                            {s.estimatedRevenue ?? '—'}
                          </td>
                          <td className="px-3 py-3 text-slate-400 dark:text-slate-500 whitespace-nowrap">
                            {s.registrationYear}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="px-5 py-3 text-[11px] text-slate-400 dark:text-slate-500 border-t border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-2">
                <span>Source: DPIIT Startup Recognition CSV (Dec 2023) · MCA21 CIN registry · Crunchbase public data</span>
                <a
                  href="/dpiit-lookup"
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Full Database →
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
