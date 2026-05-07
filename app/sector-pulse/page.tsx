'use client'

import { useEffect, useState, useMemo } from 'react'
import type { SectorPulse, SectorPulseResponse, Signal, Lifecycle, SectorCategory } from '@/lib/sector-pulse/types'

// ─── Sparkline (inline SVG) ───────────────────────────────────────────────────
function Sparkline({ data }: { data: { year: number; count: number }[] }) {
  if (data.length < 2) return <div className="w-20 h-8 flex items-center text-xs text-slate-500">—</div>
  const counts = data.map(d => d.count)
  const max = Math.max(...counts)
  const min = Math.min(...counts)
  const range = max - min || 1
  const W = 80, H = 30
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((d.count - min) / range) * (H - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const trending = counts[counts.length - 1] > counts[0]
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline points={pts} fill="none" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round" />
      <circle
        cx={(data.length - 1) / (data.length - 1) * W}
        cy={H - ((counts[counts.length - 1] - min) / range) * (H - 4) - 2}
        r="2.5"
        fill={trending ? '#22c55e' : '#ef4444'}
      />
    </svg>
  )
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score, accent }: { score: number; accent: 'blue' | 'slate' }) {
  const fill = accent === 'blue' ? 'bg-blue-500' : 'bg-slate-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono w-7 text-right text-slate-400 tabular-nums">{score}</span>
    </div>
  )
}

// ─── Signal status dot ────────────────────────────────────────────────────────
function SignalDot({ signal, label }: { signal: Signal; label: string }) {
  const dot = signal.score >= 65 ? 'bg-emerald-500' : signal.score >= 45 ? 'bg-amber-400' : 'bg-red-500'
  const ring = signal.isEstimated ? 'ring-1 ring-slate-500 ring-offset-1 ring-offset-slate-900' : ''
  return (
    <div className="flex flex-col items-center gap-0.5" title={`${label}: ${signal.score}/100\n${signal.note}`}>
      <div className={`w-2 h-2 rounded-full ${dot} ${ring}`} />
      <span className="text-[9px] font-mono text-slate-600 leading-none">{label}</span>
    </div>
  )
}

// ─── Lifecycle badge ──────────────────────────────────────────────────────────
const LIFECYCLE_DOT: Record<Lifecycle, string> = {
  Accelerating: 'bg-emerald-500',
  Emerging:     'bg-sky-400',
  Maturing:     'bg-slate-400',
  Contested:    'bg-amber-400',
  Declining:    'bg-red-500',
  Transforming: 'bg-violet-400',
}

function LifecycleBadge({ lc }: { lc: Lifecycle }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest uppercase bg-slate-800 border border-slate-700 text-slate-300">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${LIFECYCLE_DOT[lc]}`} />
      {lc}
    </span>
  )
}

// ─── Signal detail row ────────────────────────────────────────────────────────
function SignalRow({ code, label, signal }: { code: string; label: string; signal: Signal }) {
  const bar = signal.score >= 65 ? 'bg-emerald-500' : signal.score >= 45 ? 'bg-amber-400' : 'bg-red-500'
  const dirColor = signal.direction === 'up' ? 'text-emerald-400' : signal.direction === 'down' ? 'text-red-400' : 'text-slate-500'
  const dirArrow = signal.direction === 'up' ? '↑' : signal.direction === 'down' ? '↓' : '→'
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 w-8 text-center shrink-0 mt-0.5">{code}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-300">{label}</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${dirColor}`}>{dirArrow} {signal.label}</span>
            <span className="text-xs font-mono text-slate-500 tabular-nums">{signal.score}/100</span>
          </div>
        </div>
        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mb-1.5">
          <div className={`h-full rounded-full ${bar}`} style={{ width: `${signal.score}%` }} />
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">{signal.note}</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Source: {signal.source}{signal.isEstimated ? ' · modelled' : ''}</p>
      </div>
    </div>
  )
}

// ─── Sector detail drawer ─────────────────────────────────────────────────────
function SectorDrawer({ sector, onClose }: { sector: SectorPulse; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-5 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">{sector.label}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">NIC {sector.nicCode} · {sector.category}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{sector.description}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-sm font-medium ml-6 mt-1 shrink-0">
            Close ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Composite scores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-black text-white tabular-nums">{sector.opportunityScore}</div>
              <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">Opportunity</div>
              <div className="mt-2"><ScoreBar score={sector.opportunityScore} accent="blue" /></div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-black text-white tabular-nums">{sector.riskScore}</div>
              <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">Risk</div>
              <div className="mt-2"><ScoreBar score={sector.riskScore} accent="slate" /></div>
            </div>
          </div>

          {/* Lifecycle + stats */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Market Stage</span>
              <LifecycleBadge lc={sector.lifecycle} />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/50">
              <div className="text-center">
                <div className="text-base font-bold text-white tabular-nums">{sector.activeCompanies > 0 ? (sector.activeCompanies / 1000).toFixed(0) + 'K' : '—'}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Active cos.</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-white tabular-nums">{sector.totalMsmeRegistrations > 0 ? (sector.totalMsmeRegistrations / 100000).toFixed(1) + 'L' : '—'}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">MSME reg.</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-white tabular-nums">{sector.activeCompanies + sector.struckOffCompanies > 0 ? Math.round(sector.activeCompanies / (sector.activeCompanies + sector.struckOffCompanies) * 100) + '%' : '—'}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Survival rate</div>
              </div>
            </div>
          </div>

          {/* Formation bar chart */}
          {sector.formationTrend.length >= 2 && (
            <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">New Business Formation</span>
                <span className="text-[10px] text-slate-600 font-mono">MCA21 + Udyam</span>
              </div>
              <div className="flex items-end gap-1">
                {sector.formationTrend.map(t => {
                  const max = Math.max(...sector.formationTrend.map(d => d.count))
                  const h = Math.round((t.count / max) * 56) + 4
                  const isRecent = t.year >= 2022
                  return (
                    <div key={t.year} className="flex-1 flex flex-col items-center gap-1" title={`${t.year}: ${t.count.toLocaleString()}`}>
                      <div
                        className={`w-full rounded-sm ${isRecent ? 'bg-blue-600' : 'bg-slate-700'}`}
                        style={{ height: `${h}px` }}
                      />
                      <span className="text-[8px] font-mono text-slate-600">{String(t.year).slice(2)}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-slate-600 mt-2">Blue = Udyam era (2022+) · Grey = MCA21 historical</p>
            </div>
          )}

          {/* 8-signal breakdown */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-4">
            <h3 className="text-[11px] font-semibold text-slate-500 mb-3 uppercase tracking-widest">8-Signal Breakdown</h3>
            <SignalRow code="FV" label="Formation Velocity"    signal={sector.formationVelocity} />
            <SignalRow code="SG" label="Survival Gradient"     signal={sector.survivalGradient} />
            <SignalRow code="FG" label="Formalization Gap"     signal={sector.formalizationRate} />
            <SignalRow code="CM" label="Credit Momentum"       signal={sector.creditMomentum} />
            <SignalRow code="TE" label="Trade Exposure"        signal={sector.tradeExposure} />
            <SignalRow code="EA" label="Employment Absorption" signal={sector.employmentAbsorption} />
            <SignalRow code="SD" label="Search Demand"         signal={sector.searchDemand} />
            <SignalRow code="PT" label="Policy Tailwind"       signal={sector.policyScore} />
          </div>

          {/* Consultant's read */}
          <div className="border-l-2 border-blue-700 pl-4 py-1">
            <p className="text-[11px] font-semibold text-blue-400 mb-2 uppercase tracking-wider">Analysis</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              {sector.lifecycle === 'Accelerating' && `${sector.label} is in a strong growth phase. High formation rates, healthy survival, and credit flowing suggest durable demand. Entry window is open but competition is rising — first-mover advantage still achievable in underserved geographies.`}
              {sector.lifecycle === 'Emerging' && `${sector.label} shows early-stage signals with rising formation but unproven survival rates. The informal economy gap is large — the biggest opportunity is building the formal market infrastructure that doesn't exist yet.`}
              {sector.lifecycle === 'Maturing' && `${sector.label} has stabilized. Competition is high, margins are compressing, and differentiation is the only moat. New entrants need a clear cost or product wedge. Geographic white spaces (tier 2/3 cities) remain.`}
              {sector.lifecycle === 'Contested' && `${sector.label} has high entry AND high exit — both sides of the funnel are active. Incumbents are being disrupted while new players are also failing at pace. Capital intensity is high; survival requires defensible positioning.`}
              {sector.lifecycle === 'Declining' && `${sector.label} shows deteriorating formation rates. Legacy players face structural headwinds. Exit planning or pivot toward adjacent growth segments is the priority action.`}
              {sector.lifecycle === 'Transforming' && `${sector.label} is mid-disruption — old business models declining while new ones emerge. The data shows incumbent stress alongside startup formation. The window for category-defining entry is now, before the new structure solidifies.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sector table row ─────────────────────────────────────────────────────────
function SectorRow({ sector, rank, onClick }: { sector: SectorPulse; rank: number; onClick: () => void }) {
  const signals = [
    sector.formationVelocity, sector.survivalGradient, sector.formalizationRate,
    sector.creditMomentum, sector.tradeExposure, sector.employmentAbsorption,
    sector.searchDemand, sector.policyScore,
  ]
  const dotLabels = ['FV', 'SG', 'FG', 'CM', 'TE', 'EA', 'SD', 'PT']

  return (
    <tr
      className="border-b border-slate-800/60 hover:bg-slate-800/30 cursor-pointer transition-colors group"
      onClick={onClick}
    >
      <td className="px-4 py-3 text-slate-600 font-mono text-xs w-8 tabular-nums">{rank}</td>
      <td className="px-2 py-3">
        <div>
          <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{sector.label}</div>
          <div className="text-[10px] font-mono text-slate-600 mt-0.5">NIC {sector.nicCode} · {sector.category}</div>
        </div>
      </td>
      <td className="px-3 py-3 hidden md:table-cell">
        <LifecycleBadge lc={sector.lifecycle} />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-white tabular-nums">{sector.opportunityScore}</span>
          <div className="w-14 hidden lg:block"><ScoreBar score={sector.opportunityScore} accent="blue" /></div>
        </div>
      </td>
      <td className="px-3 py-3 hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-slate-400 tabular-nums">{sector.riskScore}</span>
          <div className="w-14 hidden lg:block"><ScoreBar score={sector.riskScore} accent="slate" /></div>
        </div>
      </td>
      <td className="px-3 py-3 hidden xl:table-cell">
        <div className="flex gap-1.5">
          {signals.map((sig, i) => <SignalDot key={i} signal={sig} label={dotLabels[i]} />)}
        </div>
      </td>
      <td className="px-3 py-3 hidden lg:table-cell">
        <Sparkline data={sector.formationTrend} />
      </td>
      <td className="px-3 py-3 text-slate-600 text-sm">›</td>
    </tr>
  )
}

// ─── Summary stat card ────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="text-2xl font-black text-white tabular-nums">{value}</div>
      <div className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">{label}</div>
      {sub && <div className="text-[10px] text-slate-600 mt-1">{sub}</div>}
    </div>
  )
}

const LC_ALL = ['Accelerating', 'Emerging', 'Maturing', 'Contested', 'Declining', 'Transforming'] as Lifecycle[]

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SectorPulsePage() {
  const [data, setData]           = useState<SectorPulseResponse | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState<SectorCategory | 'All'>('All')
  const [lcFilter, setLcFilter]   = useState<Lifecycle | 'All'>('All')
  const [sortBy, setSortBy]       = useState<'opportunity' | 'risk' | 'label'>('opportunity')
  const [selected, setSelected]   = useState<SectorPulse | null>(null)

  useEffect(() => {
    fetch('/api/sector-pulse')
      .then(r => r.json())
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    if (!data) return []
    return ['All', ...Array.from(new Set(data.sectors.map(s => s.category)))] as (SectorCategory | 'All')[]
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    let s = data.sectors
    if (catFilter !== 'All') s = s.filter(x => x.category === catFilter)
    if (lcFilter !== 'All') s = s.filter(x => x.lifecycle === lcFilter)
    if (search) s = s.filter(x =>
      x.label.toLowerCase().includes(search.toLowerCase()) ||
      x.description.toLowerCase().includes(search.toLowerCase()) ||
      x.nicCode.includes(search)
    )
    if (sortBy === 'risk') s = [...s].sort((a, b) => b.riskScore - a.riskScore)
    else if (sortBy === 'label') s = [...s].sort((a, b) => a.label.localeCompare(b.label))
    return s
  }, [data, catFilter, lcFilter, search, sortBy])

  const topByLifecycle = useMemo(() => {
    if (!data) return {} as Record<Lifecycle, SectorPulse[]>
    return LC_ALL.reduce((acc, lc) => {
      acc[lc] = data.sectors.filter(s => s.lifecycle === lc)
      return acc
    }, {} as Record<Lifecycle, SectorPulse[]>)
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm">Computing signals across 8 data sources…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-6 py-4">
          Error: {error ?? 'Failed to load sector data'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Page header */}
      <div className="border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">India · Economic Intelligence</p>
            <h1 className="text-2xl font-black text-white tracking-tight">Sector Pulse</h1>
            <p className="text-sm text-slate-500 mt-1">{data.sectors.length} sectors · 8-signal vitality index · MCA21 + Udyam + RBI + DGFT + EPFO</p>
          </div>
          <div className="text-right hidden sm:block pb-0.5">
            <div className="text-[10px] text-slate-600 uppercase tracking-wider">Data as of</div>
            <div className="text-xs text-slate-400 font-mono">{new Date(data.summary.dataAsOf).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Sectors tracked" value={data.summary.totalSectors} sub="NIC 2-digit divisions" />
          <StatCard label="Accelerating" value={data.summary.accelerating} sub="Strong growth signals" />
          <StatCard label="Top opportunity" value={data.summary.topOpportunity.split(' ')[0]} sub={data.summary.topOpportunity} />
          <StatCard label="Highest risk" value={data.summary.topRisk.split(' ')[0]} sub={data.summary.topRisk} />
        </div>

        {/* Lifecycle distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Market Stage Distribution</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {LC_ALL.map(lc => {
              const sectors = topByLifecycle[lc] ?? []
              const isActive = lcFilter === lc
              return (
                <button
                  key={lc}
                  onClick={() => setLcFilter(isActive ? 'All' : lc)}
                  className={`rounded-lg p-3 text-left border transition-all ${
                    isActive
                      ? 'bg-slate-700 border-slate-600'
                      : 'bg-slate-800/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${LIFECYCLE_DOT[lc]}`} />
                    <span className="text-lg font-black text-white tabular-nums">{sectors.length}</span>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{lc}</div>
                  <div className="text-[10px] text-slate-600 mt-1 truncate">{sectors[0]?.label ?? '—'}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search sectors…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 w-44"
          />
          <div className="flex gap-1 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  catFilter === c
                    ? 'bg-slate-700 text-slate-100 border border-slate-600'
                    : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                }`}>
                {c}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="text-[11px] text-slate-600 uppercase tracking-wider mr-1">Sort</span>
            {(['opportunity', 'risk', 'label'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  sortBy === s
                    ? 'bg-slate-700 text-slate-100 border border-slate-600'
                    : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                }`}>
                {s === 'opportunity' ? 'Opp.' : s === 'risk' ? 'Risk' : 'A–Z'}
              </button>
            ))}
          </div>
        </div>

        {/* Main table */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider w-8">#</th>
                <th className="px-2 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Sector</th>
                <th className="px-3 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">Stage</th>
                <th className="px-3 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Opp.</th>
                <th className="px-3 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Risk</th>
                <th className="px-3 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider hidden xl:table-cell">Signals</th>
                <th className="px-3 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Formation</th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((sector, i) => (
                <SectorRow key={sector.nicCode} sector={sector} rank={i + 1} onClick={() => setSelected(sector)} />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-600 text-sm">No sectors match filters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Signal legend */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Signal Key</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            {[
              ['FV', 'Formation Velocity',    'MCA21 + Udyam: new business registrations YoY growth'],
              ['SG', 'Survival Gradient',     'MCA21: active vs struck-off ratio (higher = healthier)'],
              ['FG', 'Formalization Gap',     'Informal economy remaining (higher = more white space)'],
              ['CM', 'Credit Momentum',       'RBI sectoral bank credit growth'],
              ['TE', 'Trade Exposure',        'DGFT export strength (higher = export-led)'],
              ['EA', 'Employment Absorption', 'EPFO: quality of job creation'],
              ['SD', 'Search Demand',         'Google Trends 5yr direction'],
              ['PT', 'Policy Tailwind',       'PLI + Budget 2024-25 incentives'],
            ].map(([code, name, desc]) => (
              <div key={code} className="flex items-start gap-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 shrink-0">{code}</span>
                <div>
                  <span className="font-medium text-slate-300">{name}</span>
                  <p className="text-slate-600 mt-0.5 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-600">
            <span>Signal dots:&nbsp;
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 align-middle" /> ≥65 strong &nbsp;
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 align-middle" /> 45–64 moderate &nbsp;
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 align-middle" /> &lt;45 weak
            </span>
            <span>Ringed dot = modelled estimate</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-700 text-center pb-4">
          Opportunity = weighted composite of Formation Velocity, Formalization Gap, Search Demand, Policy Tailwind, Trade Exposure.
          Risk = weighted composite of Survival Gradient (inverted), Credit Momentum (inverted), Employment Absorption (inverted).
          Static signals calibrated from RBI/DGFT/EPFO annual reports 2023-24.
          Live signals from MCA21 Company Master (31 states) + Udyam MSME registry (46 cities).
        </p>
      </div>

      {selected && <SectorDrawer sector={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
