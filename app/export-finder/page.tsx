'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { EXPORT_CATEGORIES, SECTORS, getOpportunityBand } from '@/lib/tools/export-data'

const BAND_STYLES = {
  Exceptional: 'bg-surface-sunk text-positive dark:bg-surface-dark-raised',
  Strong:      'bg-surface-sunk text-brand-700 dark:bg-surface-dark-raised dark:text-brand-500',
  Moderate:    'bg-surface-sunk text-caution dark:bg-surface-dark-raised',
  Competitive: 'bg-surface-sunk text-ink-soft dark:bg-surface-dark-raised dark:text-slate-400',
}

const ACCESS_STYLES = {
  high:   'text-positive',
  medium: 'text-caution',
  low:    'text-alert',
}

const ACCESS_LABELS = { high: '✓ SME-friendly', medium: '~ Medium barrier', low: '⚠ High barrier' }

function GrowthBadge({ pct }: { pct: number }) {
  const pos = pct >= 0
  return (
    <span className={`text-xs font-bold tabular-nums ${pos ? 'text-positive' : 'text-alert'}`}>
      {pos ? '▲' : '▼'} {Math.abs(pct)}% YoY
    </span>
  )
}

export default function ExportFinderPage() {
  const [sector, setSector]     = useState('')
  const [access, setAccess]     = useState('')
  const [search, setSearch]     = useState('')
  const [sortBy, setSortBy]     = useState('opportunity')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let d = EXPORT_CATEGORIES
    if (sector) d = d.filter(c => c.sector === sector)
    if (access) d = d.filter(c => c.smeAccessibility === access)
    if (search) {
      const q = search.toLowerCase()
      d = d.filter(c => c.name.toLowerCase().includes(q) || c.overview.toLowerCase().includes(q) || c.keyStates.some(s => s.toLowerCase().includes(q)))
    }
    return [...d].sort((a, b) => {
      if (sortBy === 'opportunity') return b.opportunityScore - a.opportunityScore
      if (sortBy === 'growth')      return b.growthYoY - a.growthYoY
      if (sortBy === 'value')       return b.exportValueUSD - a.exportValueUSD
      if (sortBy === 'exporters')   return a.activeExporters - b.activeExporters
      return 0
    })
  }, [sector, access, search, sortBy])

  const totalExport = EXPORT_CATEGORIES.reduce((s, c) => s + c.exportValueUSD, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <nav className="mb-6 text-sm text-ink-soft dark:text-slate-400">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-500">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-brand-600 dark:hover:text-brand-500">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-ink dark:text-slate-300">Export Finder</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-500">Trade Intelligence</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-ink dark:text-slate-100">Export Opportunity Finder</h1>
        <p className="mt-2 max-w-2xl text-ink-soft dark:text-slate-400">
          {EXPORT_CATEGORIES.length} SME-accessible Indian export categories with real FY2023-24 data — value, growth, top markets, certifications and entry cost.
        </p>
        <p className="mt-1.5 text-xs text-caution">Source: DGFT, APEDA, Ministry of Commerce.</p>
      </header>

      {/* Summary bar */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Categories covered', value: EXPORT_CATEGORIES.length.toString() },
          { label: 'Total export value tracked', value: `$${totalExport.toFixed(0)}B` },
          { label: 'Exceptional opportunities', value: EXPORT_CATEGORIES.filter(c => c.opportunityScore >= 85).length.toString() },
          { label: 'SME-accessible categories', value: EXPORT_CATEGORIES.filter(c => c.smeAccessibility === 'high').length.toString() },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-4">
            <p className="text-[11px] uppercase tracking-wider text-ink-soft dark:text-slate-500">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-ink dark:text-slate-100 tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search category, state, keyword…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] h-11 rounded-lg border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-4 text-sm text-ink dark:text-slate-200 placeholder-ink-soft dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
        <select value={sector} onChange={e => setSector(e.target.value)} className="h-11 rounded-lg border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 text-sm text-ink dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600">
          <option value="">All sectors</option>
          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={access} onChange={e => setAccess(e.target.value)} className="h-11 rounded-lg border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 text-sm text-ink dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600">
          <option value="">All accessibility</option>
          <option value="high">SME-friendly</option>
          <option value="medium">Medium barrier</option>
          <option value="low">High barrier</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="h-11 rounded-lg border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 text-sm text-ink dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600">
          <option value="opportunity">Sort: Opportunity Score</option>
          <option value="growth">Sort: YoY Growth</option>
          <option value="value">Sort: Export Value</option>
          <option value="exporters">Sort: Least competitors</option>
        </select>
        {(sector || access || search) && (
          <button onClick={() => { setSector(''); setAccess(''); setSearch('') }} className="h-11 rounded-lg border border-line dark:border-line-dark px-3 text-sm text-ink-soft hover:text-ink dark:hover:text-slate-200">
            Clear ✕
          </button>
        )}
      </div>

      {/* Category cards */}
      <div className="space-y-3">
        {filtered.map(cat => {
          const band = getOpportunityBand(cat.opportunityScore)
          const isOpen = expanded === cat.id
          return (
            <div key={cat.id} className="rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark overflow-hidden transition-shadow hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)]">
              <button
                onClick={() => setExpanded(isOpen ? null : cat.id)}
                className="w-full flex flex-wrap sm:flex-nowrap items-center gap-4 p-5 text-left hover:bg-surface-sunk/50 dark:hover:bg-surface-dark-raised/50 transition-colors"
              >
                {/* Opportunity score dial */}
                <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 border-current"
                  style={{ borderColor: cat.opportunityScore >= 85 ? '#1f8a55' : cat.opportunityScore >= 72 ? '#4f46e5' : cat.opportunityScore >= 60 ? '#b26a00' : '#3b3f47' }}>
                  <span className="text-xs font-bold tabular-nums" style={{ color: cat.opportunityScore >= 85 ? '#1f8a55' : cat.opportunityScore >= 72 ? '#4f46e5' : cat.opportunityScore >= 60 ? '#b26a00' : '#3b3f47' }}>
                    {cat.opportunityScore}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink dark:text-slate-100">{cat.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${BAND_STYLES[band]}`}>{band}</span>
                    <span className="text-[10px] text-ink-soft tabular-nums">HS {cat.hsCode}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-sm text-ink-soft dark:text-slate-400 font-medium tabular-nums">${cat.exportValueUSD.toFixed(2)}B FY24</span>
                    <GrowthBadge pct={cat.growthYoY} />
                    <span className={`text-xs font-medium ${ACCESS_STYLES[cat.smeAccessibility]}`}>{ACCESS_LABELS[cat.smeAccessibility]}</span>
                  </div>
                </div>

                {/* Top markets */}
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  {cat.topMarkets.slice(0, 3).map(m => (
                    <span key={m.country} className="text-[10px] text-ink-soft dark:text-slate-400 bg-surface-sunk dark:bg-surface-dark-raised rounded px-1.5 py-0.5 tabular-nums">{m.country} {m.sharePct}%</span>
                  ))}
                </div>

                <span className="text-ink-soft ml-2 shrink-0">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 pt-0 border-t border-line dark:border-line-dark">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 mb-5">
                    {[
                      { label: 'India\'s Global Rank', value: `#${cat.indiaGlobalRank}` },
                      { label: 'Global Market Share', value: `${cat.globalMarketSharePct}%` },
                      { label: 'Avg Realisation', value: `$${cat.avgRealisationPerKg}/kg` },
                      { label: 'Active Exporters', value: cat.activeExporters.toLocaleString() },
                    ].map(m => (
                      <div key={m.label} className="rounded-xl bg-surface-sunk dark:bg-surface-dark-raised p-3">
                        <p className="text-[10px] uppercase tracking-wider text-ink-soft dark:text-slate-500">{m.label}</p>
                        <p className="mt-1 text-base font-bold text-ink dark:text-slate-200 tabular-nums">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-ink-soft dark:text-slate-400 leading-relaxed mb-4">{cat.overview}</p>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-ink-soft dark:text-slate-600 mb-2">Top Export Markets</p>
                      <div className="space-y-1.5">
                        {cat.topMarkets.map(m => (
                          <div key={m.country} className="flex items-center gap-2">
                            <span className="w-24 text-xs text-ink-soft dark:text-slate-400 shrink-0">{m.country}</span>
                            <div className="flex-1 h-2 rounded-full bg-surface-sunk dark:bg-surface-dark-raised">
                              <div className="h-full rounded-full bg-brand-600 dark:bg-brand-500" style={{ width: `${(m.sharePct / cat.topMarkets[0].sharePct) * 100}%` }} />
                            </div>
                            <span className="text-xs text-ink-soft w-8 text-right tabular-nums">{m.sharePct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-ink-soft dark:text-slate-600 mb-1.5">Key Production States</p>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.keyStates.map(s => (
                            <span key={s} className="text-xs bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-slate-400 rounded px-2 py-0.5">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-ink-soft dark:text-slate-600 mb-1.5">Certifications Needed</p>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.certifications.slice(0, 4).map(c => (
                            <span key={c} className="text-xs bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-slate-400 rounded px-2 py-0.5">{c}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-ink-soft dark:text-slate-600 mb-1.5">Min Entry Order</p>
                        <p className="text-sm text-ink dark:text-slate-300 font-medium tabular-nums">{cat.minOrderValue}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-ink-soft dark:text-slate-600 mb-2">Tailwinds</p>
                    <ul className="space-y-1">
                      {cat.tailwinds.map(t => (
                        <li key={t} className="flex items-start gap-2 text-xs text-ink-soft dark:text-slate-400">
                          <span className="text-positive mt-0.5 shrink-0">▲</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[10px] text-caution mt-3">Seasonality: {cat.seasonality}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="mt-8 text-center text-xs text-caution">
        Export values from DGFT Annual Report FY2023-24 and Ministry of Commerce press releases. Growth rates are YoY vs FY2022-23. Opportunity scores are composite — not official rankings.
      </p>
    </div>
  )
}
