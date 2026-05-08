'use client'

import { useState, useEffect } from 'react'
import type { MSMECompany, MSMECategory } from '@/lib/msme/companies'

interface Props {
  industry: string
  ideaTitle?: string
}

const CATEGORY_COLORS: Record<MSMECategory, string> = {
  'Micro':  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  'Small':  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  'Medium': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
}

interface LookupResult {
  sector: string
  total: number
  companies: MSMECompany[]
  dataSource: string
}

const DEFAULT_VISIBLE = 5

export default function MSMELookup({ industry, ideaTitle }: Props) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<LookupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [stateFilter, setStateFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!open || data) return
    setLoading(true)
    const params = new URLSearchParams({ industry, limit: '50' })
    if (ideaTitle) params.set('title', ideaTitle)
    fetch(`/api/msme-lookup?${params}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [open, industry, ideaTitle, data])

  // Reset "show all" whenever filters change so the count stays meaningful
  const resetShowAll = () => setShowAll(false)

  const filtered = data?.companies.filter(c => {
    const matchesState    = !stateFilter    || c.state === stateFilter
    const matchesCategory = !categoryFilter || c.category === categoryFilter
    const matchesQuery    = !query || c.name.toLowerCase().includes(query.toLowerCase()) ||
                             c.subSector.toLowerCase().includes(query.toLowerCase()) ||
                             c.city.toLowerCase().includes(query.toLowerCase())
    return matchesState && matchesCategory && matchesQuery
  }) ?? []

  const states     = data ? [...new Set(data.companies.map(c => c.state))].sort() : []
  const categories = data ? [...new Set(data.companies.map(c => c.category))] as MSMECategory[] : []

  return (
    <div className="mt-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🏭</span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              Manufacturers &amp; Suppliers in India
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              MSMEs and established players operating in this space
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {data && (
            <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-xs font-bold">
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

      {open && (
        <div className="border-t border-emerald-200 dark:border-emerald-900/50">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500 dark:text-slate-400">
              <svg className="h-4 w-4 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading MSME data…
            </div>
          )}

          {!loading && data && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 px-5 py-3 bg-white/60 dark:bg-slate-900/40 border-b border-emerald-100 dark:border-emerald-900/40">
                <input
                  type="text"
                  placeholder="Search companies…"
                  value={query}
                  onChange={e => { setQuery(e.target.value); resetShowAll() }}
                  className="flex-1 min-w-[140px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <select
                  value={stateFilter}
                  onChange={e => { setStateFilter(e.target.value); resetShowAll() }}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">All States</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={categoryFilter}
                  onChange={e => { setCategoryFilter(e.target.value); resetShowAll() }}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="self-center text-xs text-slate-400 dark:text-slate-500 ml-auto">
                  {filtered.length} of {data.total} shown
                </span>
              </div>

              {/* Sector label */}
              <div className="px-5 pt-3 pb-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Matched to MSME sector: <span className="font-semibold text-emerald-700 dark:text-emerald-300">{data.sector}</span>
                  {ideaTitle && <span> for &ldquo;{ideaTitle}&rdquo;</span>}
                </p>
              </div>

              {filtered.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No companies matched your filters.
                </p>
              ) : (() => {
                const visible = showAll ? filtered : filtered.slice(0, DEFAULT_VISIBLE)
                const hidden  = filtered.length - DEFAULT_VISIBLE
                return (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-emerald-100 dark:border-emerald-900/40 bg-white/40 dark:bg-slate-900/30">
                            <th className="px-5 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px]">Company</th>
                            <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px] hidden sm:table-cell">Location</th>
                            <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px]">Size</th>
                            <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px]">Est.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50 dark:divide-emerald-950/40">
                          {visible.map(c => (
                            <tr key={c.id} className="hover:bg-white/60 dark:hover:bg-slate-900/40 transition-colors">
                              <td className="px-5 py-3">
                                <a
                                  href={`https://www.google.com/search?q=${encodeURIComponent(c.name + ' India official website')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 leading-snug hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                                >
                                  {c.name}
                                  <svg className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{c.subSector}</p>
                                {c.clusterNote && (
                                  <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5 leading-snug">{c.clusterNote}</p>
                                )}
                              </td>
                              <td className="px-3 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell whitespace-nowrap">
                                <p>{c.city}</p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">{c.state}</p>
                              </td>
                              <td className="px-3 py-3">
                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${CATEGORY_COLORS[c.category]}`}>
                                  {c.category}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                {c.registeredYear ?? '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filtered.length > DEFAULT_VISIBLE && (
                      <div className="border-t border-emerald-100 dark:border-emerald-900/40 px-5 py-3">
                        <button
                          onClick={() => setShowAll(v => !v)}
                          className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          {showAll
                            ? 'Show less ↑'
                            : `Show ${hidden} more companies ↓`}
                        </button>
                      </div>
                    )}
                  </>
                )
              })()}

              <div className="px-5 py-3 text-[11px] text-slate-400 dark:text-slate-500 border-t border-emerald-100 dark:border-emerald-900/40 flex flex-wrap items-center justify-between gap-2">
                <span>Source: {data.dataSource}</span>
                <span className="text-emerald-600 dark:text-emerald-500 font-medium">
                  Size: Micro &lt;₹5Cr · Small ₹5–50Cr · Medium ₹50–250Cr annual turnover
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
