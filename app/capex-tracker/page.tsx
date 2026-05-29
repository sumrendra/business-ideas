'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Promise_ {
  id: number
  ticker: string
  company_name: string
  sector: string
  promise_type: string
  promise_text: string
  promised_amount_cr: number | null
  promised_metric: string | null
  promised_by: string
  announced_quarter: string
  actual_amount_cr: number | null
  actual_metric: string | null
  status: string
  miss_reason: string | null
  source: string | null
  notes: string | null
}

interface Stat { status: string; count: number }

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  delivered: { label: '✓ Delivered', cls: 'bg-positive/10 text-positive',                            dot: 'bg-positive' },
  on_track:  { label: '→ On Track',  cls: 'bg-brand-600/10 text-brand-600',                           dot: 'bg-brand-600' },
  partial:   { label: '◐ Partial',   cls: 'bg-caution/10 text-caution',                               dot: 'bg-caution'  },
  watch:     { label: '⚠ Watch',     cls: 'bg-caution/10 text-caution',                               dot: 'bg-caution'  },
  missed:    { label: '✕ Missed',    cls: 'bg-alert/10 text-alert',                                   dot: 'bg-alert'    },
  pending:   { label: '· Pending',   cls: 'bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-paper-dark/70', dot: 'bg-ink-soft/40' },
}

const TYPE_LABELS: Record<string, string> = {
  capex:'Capex', capacity:'Capacity', margin:'Margin', revenue:'Revenue',
  debt:'Debt Reduction', expansion:'Expansion', hiring:'Hiring',
}

const SECTORS = [
  'All', 'steel', 'cement', 'energy', 'telecom', 'auto', 'power',
  'oil_gas', 'it', 'banks', 'fmcg', 'retail', 'pharma', 'infra',
  'capital_goods', 'metals', 'mining', 'aviation', 'chemicals', 'realestate',
]

const STATUSES = ['All', 'missed', 'watch', 'partial', 'on_track', 'delivered', 'pending']
const TYPES    = ['All', 'capex', 'capacity', 'margin', 'revenue', 'expansion', 'hiring', 'debt']

function fmtCr(v: number | null): string {
  if (!v) return ''
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L Cr`
  if (v >= 1000)   return `₹${Math.round(v / 1000)}K Cr`
  return `₹${v} Cr`
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function PromiseCard({ p }: { p: Promise_ }) {
  const [open, setOpen] = useState(false)
  const s = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.pending

  return (
    <div
      className={`rounded-2xl border bg-surface dark:bg-surface-dark overflow-hidden transition-shadow hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] cursor-pointer
        ${p.status === 'missed' ? 'border-alert/40' :
          p.status === 'watch'  ? 'border-caution/40' :
          p.status === 'delivered' ? 'border-positive/40' :
          'border-line dark:border-line-dark'}`}
      onClick={() => setOpen(o => !o)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-brand-600 tabular-nums">{p.ticker}</span>
              <span className="text-xs text-ink-soft dark:text-paper-dark/70">{p.company_name}</span>
              <span className="rounded bg-surface-sunk dark:bg-surface-dark-raised px-1.5 py-0.5 text-[10px] text-ink-soft dark:text-paper-dark/70 capitalize">
                {TYPE_LABELS[p.promise_type] ?? p.promise_type}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink dark:text-paper-dark leading-snug line-clamp-2">
              {p.promise_text}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-soft dark:text-paper-dark/70">
              <span>Announced: <strong className="tabular-nums">{p.announced_quarter}</strong></span>
              <span>Target: <strong className="tabular-nums">{p.promised_by}</strong></span>
              {p.promised_amount_cr && <span className="font-semibold text-brand-600 tabular-nums">{fmtCr(p.promised_amount_cr)}</span>}
              {p.source && <span className="capitalize">{p.source.replace('_', ' ')}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.cls}`}>{s.label}</span>
            <span className="text-xs text-ink-soft/50 dark:text-paper-dark/40">{open ? '▲' : '▼'}</span>
          </div>
        </div>

        {/* Progress bar: actual vs promised amount */}
        {p.promised_amount_cr && p.actual_amount_cr && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-ink-soft/70 dark:text-paper-dark/50 mb-1 tabular-nums">
              <span>Actual: {fmtCr(p.actual_amount_cr)}</span>
              <span>{Math.round((p.actual_amount_cr / p.promised_amount_cr) * 100)}% of target</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-sunk dark:bg-surface-dark-raised overflow-hidden">
              <div
                className={`h-full rounded-full ${p.status === 'missed' ? 'bg-alert' : p.status === 'delivered' ? 'bg-positive' : 'bg-brand-600'}`}
                style={{ width: `${Math.min(100, (p.actual_amount_cr / p.promised_amount_cr) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-line dark:border-line-dark px-5 pb-5 pt-4 space-y-3">
          {p.promised_metric && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface-sunk dark:bg-surface-dark-raised p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft/70 dark:text-paper-dark/50">Promised</p>
                <p className="mt-1 text-sm font-semibold text-ink dark:text-paper-dark tabular-nums">{p.promised_metric}</p>
              </div>
              {p.actual_metric && (
                <div className={`rounded-xl p-3 ${p.status === 'delivered' ? 'bg-positive/10' : p.status === 'missed' ? 'bg-alert/10' : 'bg-caution/10'}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft/70 dark:text-paper-dark/50">Actual</p>
                  <p className="mt-1 text-sm font-semibold text-ink dark:text-paper-dark tabular-nums">{p.actual_metric}</p>
                </div>
              )}
            </div>
          )}
          {p.miss_reason && (
            <div className="rounded-xl bg-alert/10 p-3 text-sm text-alert">
              <span className="font-bold">Why missed: </span>{p.miss_reason}
            </div>
          )}
          {p.notes && (
            <p className="text-xs text-ink-soft dark:text-paper-dark/70 leading-relaxed">
              📌 {p.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Stat box ─────────────────────────────────────────────────────────────────

function StatBox({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CapexTrackerPage() {
  const [promises, setPromises] = useState<Promise_[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sector, setSector] = useState('All')
  const [status, setStatus] = useState('All')
  const [type,   setType]   = useState('All')
  const [q,      setQ]      = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams()
      if (sector !== 'All') params.set('sector', sector)
      if (status !== 'All') params.set('status', status)
      if (type   !== 'All') params.set('type',   type)
      if (q.trim())         params.set('q',      q.trim())
      const res = await fetch(`/api/capex-tracker?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setPromises(data.promises ?? [])
      setStats(data.stats ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }, [sector, status, type, q])

  useEffect(() => { load() }, [load])

  const statMap = Object.fromEntries(stats.map(s => [s.status, s.count]))
  const total = stats.reduce((a, s) => a + s.count, 0)
  const delivered = (statMap.delivered ?? 0)
  const missed    = (statMap.missed ?? 0) + (statMap.watch ?? 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 text-ink dark:text-paper-dark">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-ink-soft dark:text-paper-dark/70">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-brand-600 dark:hover:text-brand-600">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-ink dark:text-paper-dark">Capex & Promise Tracker</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Tools</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-ink dark:text-paper-dark">
          Capex & Promise Tracker
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft dark:text-paper-dark/70">
          Did the ₹500 Cr capex they announced in 2022 actually get spent? Did capacity expand as promised?
          Did margins follow? Track what NSE companies said vs. what happened.
        </p>
      </header>

      {/* Stats */}
      {total > 0 && (
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="Total Tracked" value={total}     cls="border-line dark:border-line-dark bg-surface-sunk dark:bg-surface-dark-raised text-ink dark:text-paper-dark" />
          <StatBox label="Delivered"     value={delivered} cls="border-positive/30 bg-positive/10 text-positive" />
          <StatBox label="Missed / Watch" value={missed}   cls="border-alert/30 bg-alert/10 text-alert" />
          <StatBox label="On Track"      value={statMap.on_track ?? 0} cls="border-brand-600/30 bg-brand-600/10 text-brand-600" />
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search company or keyword…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="flex-1 min-h-[44px] rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-4 py-2 text-sm text-ink dark:text-paper-dark placeholder-ink-soft/50 dark:placeholder-paper-dark/40 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/40"
        />
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="min-h-[44px] rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-ink-soft dark:text-paper-dark/70 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/40">
          {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : STATUS_CONFIG[s]?.label ?? s}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)}
          className="min-h-[44px] rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-ink-soft dark:text-paper-dark/70 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/40">
          {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : TYPE_LABELS[t] ?? t}</option>)}
        </select>
        <select value={sector} onChange={e => setSector(e.target.value)}
          className="min-h-[44px] rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-ink-soft dark:text-paper-dark/70 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/40">
          {SECTORS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sectors' : s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {/* Status legend */}
      <div className="mb-5 flex flex-wrap gap-3">
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setStatus(status === k ? 'All' : k)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 min-h-[44px] text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
              status === k ? v.cls + ' ring-2 ring-offset-1 ring-brand-600' : 'bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-paper-dark/70 hover:bg-line dark:hover:bg-line-dark'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
            {v.label}
            {statMap[k] ? ` (${statMap[k]})` : ''}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-20 text-center">
          <span className="inline-block h-5 w-5 rounded-full border-2 border-brand-600/30 border-t-brand-600 animate-spin" />
          <p className="mt-3 text-sm text-ink-soft dark:text-paper-dark/70">Loading promises…</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-alert/30 bg-alert/5 dark:bg-alert/10 p-6 text-center">
          <p className="text-sm text-alert">{error}</p>
          <button onClick={load} className="mt-3 text-sm text-brand-600 hover:underline">Retry</button>
        </div>
      )}

      {!loading && !error && promises.length === 0 && (
        <p className="py-16 text-center text-ink-soft dark:text-paper-dark/70 text-sm">No promises match your filters.</p>
      )}

      {!loading && !error && promises.length > 0 && (
        <>
          <p className="mb-4 text-sm text-ink-soft dark:text-paper-dark/70">
            <strong className="text-ink dark:text-paper-dark tabular-nums">{promises.length} promises</strong> · sorted by risk (missed first) · click any card to expand
          </p>
          <div className="space-y-4">
            {promises.map(p => <PromiseCard key={p.id} p={p} />)}
          </div>
        </>
      )}

      <p className="mt-10 text-center text-xs text-ink-soft/70 dark:text-paper-dark/50">
        Data from public concalls, annual reports and investor presentations · FY22–FY25 · Not investment advice
      </p>
    </div>
  )
}
