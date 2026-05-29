'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FUNDING_DEALS, getSummaryStats, SECTORS, CITIES, STAGES, STAGE_LABELS, type Stage } from '@/lib/tools/funding-data'

const STAGE_COLORS: Record<Stage, string> = {
  'pre-seed': 'bg-surface-sunk text-ink-soft dark:bg-surface-dark-raised dark:text-paper-dark',
  'seed': 'bg-surface-sunk text-ink-soft dark:bg-surface-dark-raised dark:text-paper-dark',
  'series-a': 'bg-surface-sunk text-ink-soft dark:bg-surface-dark-raised dark:text-paper-dark',
  'series-b': 'bg-surface-sunk text-ink-soft dark:bg-surface-dark-raised dark:text-paper-dark',
  'series-c': 'bg-surface-sunk text-ink-soft dark:bg-surface-dark-raised dark:text-paper-dark',
  'series-d+': 'bg-surface-sunk text-ink-soft dark:bg-surface-dark-raised dark:text-paper-dark',
  'ipo-prep': 'bg-surface-sunk text-ink-soft dark:bg-surface-dark-raised dark:text-paper-dark',
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
      <nav className="mb-6 text-sm text-ink-soft dark:text-paper-dark">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-brand-600 dark:hover:text-brand-600">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-ink dark:text-paper-dark">Funding Radar</span>
      </nav>

      <header className="mb-8">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-600">Intelligence</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-ink dark:text-paper-dark">Startup Funding Radar</h1>
        <p className="mt-2 max-w-2xl text-ink-soft dark:text-paper-dark">
          <span className="tabular-nums">{FUNDING_DEALS.length}</span> real Indian startup deals FY2022–FY2024 — by sector, stage, and city. Data from Inc42, VCC Edge, and public disclosures.
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
          <div key={s.label} className="rounded-lg border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-4">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark">{s.label}</p>
            <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-ink dark:text-paper-dark truncate">{s.value}</p>
            <p className="mt-1 text-[10px] tabular-nums text-ink-soft dark:text-paper-dark">FY22–24</p>
          </div>
        ))}
      </div>

      {/* Stage breakdown bar */}
      <div className="mb-8 rounded-lg border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark mb-4">Deals by Stage</p>
        <div className="space-y-2">
          {stageBreakdown.map(({ stage: s, count }) => (
            <div key={s} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-ink-soft dark:text-paper-dark text-right">{STAGE_LABELS[s as Stage]}</span>
              <div className="flex-1 h-5 rounded-full bg-surface-sunk dark:bg-surface-dark-raised overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all duration-500"
                  style={{ width: `${(count / maxStageCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-xs font-semibold tabular-nums text-right text-ink dark:text-paper-dark">{count}</span>
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
          className="flex-1 min-w-[200px] min-h-[44px] rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-4 py-2.5 text-sm text-ink dark:text-paper-dark placeholder-ink-soft dark:placeholder-paper-dark focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/40"
        />
        <select value={sector} onChange={e => setSector(e.target.value)} className="min-h-[44px] rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-2.5 text-sm text-ink-soft dark:text-paper-dark focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/40">
          <option value="">All sectors</option>
          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={stage} onChange={e => setStage(e.target.value as Stage | '')} className="min-h-[44px] rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-2.5 text-sm text-ink-soft dark:text-paper-dark focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/40">
          <option value="">All stages</option>
          {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </select>
        <select value={city} onChange={e => setCity(e.target.value)} className="min-h-[44px] rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-2.5 text-sm text-ink-soft dark:text-paper-dark focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/40">
          <option value="">All cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="min-h-[44px] rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-2.5 text-sm text-ink-soft dark:text-paper-dark focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/40">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {(sector || stage || city || search) && (
          <button onClick={() => { setSector(''); setStage(''); setCity(''); setSearch('') }} className="min-h-[44px] rounded-md border border-line dark:border-line-dark px-3 py-2.5 text-sm text-ink-soft hover:text-ink dark:hover:text-paper-dark focus:outline-none focus:ring-2 focus:ring-brand-600/40">
            Clear ✕
          </button>
        )}
      </div>

      {/* Deals grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-ink-soft dark:text-paper-dark">No deals match your filters.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(deal => (
            <div key={deal.id} className="rounded-lg border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5 flex flex-col gap-3 transition-shadow hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-ink dark:text-paper-dark text-base leading-tight">{deal.company}</p>
                  <p className="text-xs text-ink-soft dark:text-paper-dark mt-0.5 tabular-nums">{deal.city} · Est. {deal.founded}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold tabular-nums text-ink dark:text-paper-dark">{fmtUSD(deal.amountUSD)}</p>
                  <p className="text-[10px] tabular-nums text-ink-soft dark:text-paper-dark">{fmtINR(deal.amountINR)}</p>
                </div>
              </div>

              <p className="text-xs text-ink-soft dark:text-paper-dark leading-relaxed">{deal.tagline}</p>

              <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-line dark:border-line-dark">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STAGE_COLORS[deal.stage]}`}>
                  {STAGE_LABELS[deal.stage]}
                </span>
                <span className="rounded-full bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-paper-dark px-2 py-0.5 text-[10px]">
                  {deal.sector}
                </span>
                <span className="rounded-full bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-paper-dark px-2 py-0.5 text-[10px] tabular-nums">
                  {deal.month}
                </span>
              </div>

              <div className="text-[11px] text-ink-soft dark:text-paper-dark">
                <span className="font-medium text-ink dark:text-paper-dark">Investors: </span>
                {deal.investors.slice(0, 2).join(', ')}{deal.investors.length > 2 ? ` +${deal.investors.length - 2}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-ink-soft dark:text-paper-dark">
        Data sourced from Inc42, VCC Edge, Tracxn, and public disclosures. Amounts in USD million at approximate INR exchange rates. Not exhaustive.
      </p>
    </div>
  )
}
