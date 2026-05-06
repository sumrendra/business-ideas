'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FUNDING_DEALS, getSummaryStats, SECTORS, CITIES, STAGES, STAGE_LABELS, type Stage } from '@/lib/tools/funding-data'

const STAGE_COLORS: Record<Stage, string> = {
  'pre-seed': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'seed': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'series-a': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'series-b': 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  'series-c': 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  'series-d+': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'ipo-prep': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
}

const SORT_OPTIONS = [
  { value: 'amount-desc', label: 'Largest raises first' },
  { value: 'amount-asc', label: 'Smallest raises first' },
  { value: 'date-desc', label: 'Most recent first' },
  { value: 'date-asc', label: 'Oldest first' },
]

function fmtUSD(m: number) {
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`
  return `$${m}M`
}

function fmtINR(cr: number) {
  if (cr >= 10000) return `₹${(cr / 10000).toFixed(1)}K Cr`
  return `₹${cr.toLocaleString('en-IN')} Cr`
}

export default function FundingRadarPage() {
  const [sector, setSector] = useState('')
  const [stage, setStage]   = useState<Stage | ''>('')
  const [city, setCity]     = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort]     = useState('date-desc')

  const filtered = useMemo(() => {
    let d = FUNDING_DEALS
    if (sector) d = d.filter(x => x.sector === sector)
    if (stage)  d = d.filter(x => x.stage === stage)
    if (city)   d = d.filter(x => x.city === city)
    if (search) {
      const q = search.toLowerCase()
      d = d.filter(x =>
        x.company.toLowerCase().includes(q) ||
        x.tagline.toLowerCase().includes(q) ||
        x.investors.some(i => i.toLowerCase().includes(q))
      )
    }
    return [...d].sort((a, b) => {
      if (sort === 'amount-desc') return b.amountUSD - a.amountUSD
      if (sort === 'amount-asc')  return a.amountUSD - b.amountUSD
      if (sort === 'date-desc')   return b.month.localeCompare(a.month)
      return a.month.localeCompare(b.month)
    })
  }, [sector, stage, city, search, sort])

  const stats = useMemo(() => getSummaryStats(filtered), [filtered])

  const topSector = useMemo(() => {
    const entries = Object.entries(stats.bySector).sort((a, b) => b[1].usd - a[1].usd)
    return entries[0]
  }, [stats])

  const topCity = useMemo(() => {
    const entries = Object.entries(stats.byCity).sort((a, b) => b[1] - a[1])
    return entries[0]
  }, [stats])

  const stageBreakdown = useMemo(() => {
    return STAGES.map(s => ({
      stage: s,
      count: filtered.filter(d => d.stage === s).length,
    })).filter(x => x.count > 0)
  }, [filtered])

  const maxStageCount = Math.max(...stageBreakdown.map(s => s.count), 1)

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">Funding Radar</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Intelligence</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">Startup Funding Radar</h1>
        <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
          {FUNDING_DEALS.length} real Indian startup deals FY2022–FY2024 — by sector, stage, and city. Data from Inc42, VCC Edge, and public disclosures.
        </p>
      </header>

      {/* Summary stats */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Deals shown', value: stats.count.toString() },
          { label: 'Total capital', value: fmtUSD(stats.totalUSD) },
          { label: 'Top sector', value: topSector?.[0] ?? '—' },
          { label: 'Top city', value: topCity?.[0] ?? '—' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Stage breakdown bar */}
      <div className="mb-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Deals by Stage</p>
        <div className="space-y-2">
          {stageBreakdown.map(({ stage: s, count }) => (
            <div key={s} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-slate-500 dark:text-slate-400 text-right">{STAGE_LABELS[s as Stage]}</span>
              <div className="flex-1 h-5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-500"
                  style={{ width: `${(count / maxStageCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-xs font-semibold text-slate-600 dark:text-slate-400">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search company, tagline, investor…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select value={sector} onChange={e => setSector(e.target.value)} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All sectors</option>
          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={stage} onChange={e => setStage(e.target.value as Stage | '')} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All stages</option>
          {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </select>
        <select value={city} onChange={e => setCity(e.target.value)} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {(sector || stage || city || search) && (
          <button onClick={() => { setSector(''); setStage(''); setCity(''); setSearch('') }} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            Clear ✕
          </button>
        )}
      </div>

      {/* Deals grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400">No deals match your filters.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(deal => (
            <div key={deal.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight">{deal.company}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{deal.city} · Est. {deal.founded}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{fmtUSD(deal.amountUSD)}</p>
                  <p className="text-[10px] text-slate-400">{fmtINR(deal.amountINR)}</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{deal.tagline}</p>

              <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STAGE_COLORS[deal.stage]}`}>
                  {STAGE_LABELS[deal.stage]}
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 text-[10px]">
                  {deal.sector}
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 px-2 py-0.5 text-[10px]">
                  {deal.month}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 dark:text-slate-500">
                <span className="font-medium text-slate-500 dark:text-slate-400">Investors: </span>
                {deal.investors.slice(0, 2).join(', ')}{deal.investors.length > 2 ? ` +${deal.investors.length - 2}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
        Data sourced from Inc42, VCC Edge, Tracxn, and public disclosures. Amounts in USD million at approximate INR exchange rates. Not exhaustive.
      </p>
    </div>
  )
}
