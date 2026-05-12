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
  delivered: { label: 'Delivered',  cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-500' },
  on_track:  { label: 'On Track',   cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',             dot: 'bg-blue-500'  },
  partial:   { label: 'Partial',    cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',         dot: 'bg-amber-500' },
  watch:     { label: '⚠ Watch',    cls: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',     dot: 'bg-orange-500'},
  missed:    { label: 'Missed',     cls: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300',             dot: 'bg-rose-500'  },
  pending:   { label: 'Pending',    cls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',            dot: 'bg-slate-400' },
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
      className={`rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden transition-shadow hover:shadow-md cursor-pointer
        ${p.status === 'missed' ? 'border-rose-200 dark:border-rose-900/50' :
          p.status === 'watch'  ? 'border-orange-200 dark:border-orange-900/50' :
          p.status === 'delivered' ? 'border-emerald-200 dark:border-emerald-900/50' :
          'border-slate-200 dark:border-slate-800'}`}
      onClick={() => setOpen(o => !o)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{p.ticker}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{p.company_name}</span>
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {TYPE_LABELS[p.promise_type] ?? p.promise_type}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
              {p.promise_text}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Announced: <strong>{p.announced_quarter}</strong></span>
              <span>Target: <strong>{p.promised_by}</strong></span>
              {p.promised_amount_cr && <span className="font-semibold text-indigo-600 dark:text-indigo-400">{fmtCr(p.promised_amount_cr)}</span>}
              {p.source && <span className="capitalize">{p.source.replace('_', ' ')}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.cls}`}>{s.label}</span>
            <span className="text-xs text-slate-400">{open ? '▲' : '▼'}</span>
          </div>
        </div>

        {/* Progress bar: actual vs promised amount */}
        {p.promised_amount_cr && p.actual_amount_cr && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-1">
              <span>Actual: {fmtCr(p.actual_amount_cr)}</span>
              <span>{Math.round((p.actual_amount_cr / p.promised_amount_cr) * 100)}% of target</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${p.status === 'missed' ? 'bg-rose-500' : p.status === 'delivered' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(100, (p.actual_amount_cr / p.promised_amount_cr) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-5 pb-5 pt-4 space-y-3">
          {p.promised_metric && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Promised</p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{p.promised_metric}</p>
              </div>
              {p.actual_metric && (
                <div className={`rounded-xl p-3 ${p.status === 'delivered' ? 'bg-emerald-50 dark:bg-emerald-900/20' : p.status === 'missed' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Actual</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{p.actual_metric}</p>
                </div>
              )}
            </div>
          )}
          {p.miss_reason && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 p-3 text-sm text-rose-700 dark:text-rose-300">
              <span className="font-bold">Why missed: </span>{p.miss_reason}
            </div>
          )}
          {p.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
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
    <div className={`rounded-2xl p-4 ${cls}`}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
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
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">Capex & Promise Tracker</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Tools</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
          Capex & Promise Tracker
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Did the ₹500 Cr capex they announced in 2022 actually get spent? Did capacity expand as promised?
          Did margins follow? Track what NSE companies said vs. what happened.
        </p>
      </header>

      {/* Stats */}
      {total > 0 && (
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="Total Tracked" value={total}     cls="bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100" />
          <StatBox label="Delivered"     value={delivered} cls="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300" />
          <StatBox label="Missed / Watch" value={missed}   cls="bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300" />
          <StatBox label="On Track"      value={statMap.on_track ?? 0} cls="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300" />
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search company or keyword…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : STATUS_CONFIG[s]?.label ?? s}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : TYPE_LABELS[t] ?? t}</option>)}
        </select>
        <select value={sector} onChange={e => setSector(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {SECTORS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sectors' : s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {/* Status legend */}
      <div className="mb-5 flex flex-wrap gap-3">
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setStatus(status === k ? 'All' : k)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              status === k ? v.cls + ' ring-2 ring-offset-1 ring-indigo-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
          <span className="inline-block h-5 w-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading promises…</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-6 text-center">
          <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          <button onClick={load} className="mt-3 text-sm text-indigo-600 hover:underline">Retry</button>
        </div>
      )}

      {!loading && !error && promises.length === 0 && (
        <p className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm">No promises match your filters.</p>
      )}

      {!loading && !error && promises.length > 0 && (
        <>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-300">{promises.length} promises</strong> · sorted by risk (missed first) · click any card to expand
          </p>
          <div className="space-y-4">
            {promises.map(p => <PromiseCard key={p.id} p={p} />)}
          </div>
        </>
      )}

      <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">
        Data from public concalls, annual reports and investor presentations · FY22–FY25 · Not investment advice
      </p>
    </div>
  )
}
