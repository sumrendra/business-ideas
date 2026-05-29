'use client'

import { useEffect, useState, useMemo } from 'react'
import type { SectorPulse, SectorPulseResponse, Signal, Lifecycle, SectorCategory } from '@/lib/sector-pulse/types'

// ─── Sparkline (inline SVG) ───────────────────────────────────────────────────
function Sparkline({ data }: { data: { year: number; count: number }[] }) {
  if (data.length < 2) return <div className="w-20 h-8 flex items-center text-xs text-ink-soft/60 dark:text-paper-dark/40">—</div>
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
      <polyline points={pts} fill="none" stroke="#3b3f47" strokeWidth="1.5" strokeLinejoin="round" />
      <circle
        cx={(data.length - 1) / (data.length - 1) * W}
        cy={H - ((counts[counts.length - 1] - min) / range) * (H - 4) - 2}
        r="2.5"
        fill={trending ? '#1f8a55' : '#c0362c'}
      />
    </svg>
  )
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score, accent }: { score: number; accent: 'blue' | 'slate' }) {
  const fill = accent === 'blue' ? 'bg-brand-600' : 'bg-ink-soft/50 dark:bg-paper-dark/40'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-surface-sunk dark:bg-line-dark rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono w-7 text-right text-ink-soft/70 dark:text-paper-dark/50 tabular-nums">{score}</span>
    </div>
  )
}

// ─── Signal status dot ────────────────────────────────────────────────────────
function SignalDot({ signal, label }: { signal: Signal; label: string }) {
  const dot = signal.score >= 65 ? 'bg-positive' : signal.score >= 45 ? 'bg-caution' : 'bg-alert'
  const ring = signal.isEstimated ? 'ring-1 ring-ink-soft/50 dark:ring-paper-dark/40 ring-offset-1 ring-offset-surface dark:ring-offset-surface-dark' : ''
  return (
    <div className="flex flex-col items-center gap-0.5" title={`${label}: ${signal.score}/100\n${signal.note}`}>
      <div className={`w-2 h-2 rounded-full ${dot} ${ring}`} />
      <span className="text-[9px] font-mono text-ink-soft/60 dark:text-paper-dark/40 leading-none">{label}</span>
    </div>
  )
}

// ─── Lifecycle badge ──────────────────────────────────────────────────────────
const LIFECYCLE_DOT: Record<Lifecycle, string> = {
  Accelerating: 'bg-positive',
  Emerging:     'bg-brand-600',
  Maturing:     'bg-ink-soft/50 dark:bg-paper-dark/40',
  Contested:    'bg-caution',
  Declining:    'bg-alert',
  Transforming: 'bg-brand-600/60',
}

function LifecycleBadge({ lc }: { lc: Lifecycle }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.12em] uppercase bg-surface-sunk dark:bg-surface-dark-raised border border-line dark:border-line-dark text-ink-soft dark:text-paper-dark/70">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${LIFECYCLE_DOT[lc]}`} />
      {lc}
    </span>
  )
}

// ─── Signal detail row ────────────────────────────────────────────────────────
function SignalRow({ code, label, signal }: { code: string; label: string; signal: Signal }) {
  const bar = signal.score >= 65 ? 'bg-positive' : signal.score >= 45 ? 'bg-caution' : 'bg-alert'
  const dirColor = signal.direction === 'up' ? 'text-positive' : signal.direction === 'down' ? 'text-alert' : 'text-ink-soft/70 dark:text-paper-dark/50'
  const dirArrow = signal.direction === 'up' ? '↑' : signal.direction === 'down' ? '↓' : '→'
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-line dark:border-line-dark last:border-0">
      <span className="text-[10px] font-mono font-bold text-ink-soft dark:text-paper-dark/70 bg-surface-sunk dark:bg-surface-dark-raised border border-line dark:border-line-dark rounded px-1.5 py-0.5 w-8 text-center shrink-0 mt-0.5">{code}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-ink dark:text-paper-dark">{label}</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${dirColor}`}>{dirArrow} {signal.label}</span>
            <span className="text-xs font-mono text-ink-soft/70 dark:text-paper-dark/50 tabular-nums">{signal.score}/100</span>
          </div>
        </div>
        <div className="w-full h-1 bg-surface-sunk dark:bg-line-dark rounded-full overflow-hidden mb-1.5">
          <div className={`h-full rounded-full ${bar}`} style={{ width: `${signal.score}%` }} />
        </div>
        <p className="text-[11px] text-ink-soft dark:text-paper-dark/60 leading-snug">{signal.note}</p>
        <p className="text-[10px] text-ink-soft/60 dark:text-paper-dark/40 mt-0.5">Source: {signal.source}{signal.isEstimated ? ' · modelled' : ''}</p>
      </div>
    </div>
  )
}

// ─── Sector detail drawer ─────────────────────────────────────────────────────
function SectorDrawer({ sector, onClose }: { sector: SectorPulse; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/60 dark:bg-ink-dark/70" />
      <div
        className="relative w-full max-w-lg bg-surface dark:bg-surface-dark border-l border-line dark:border-line-dark overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface dark:bg-surface-dark border-b border-line dark:border-line-dark px-6 py-5 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div>
                <h2 className="text-lg font-bold text-ink dark:text-paper-dark tracking-tight">{sector.label}</h2>
                <p className="text-xs text-ink-soft/70 dark:text-paper-dark/50 font-mono mt-0.5 tabular-nums">NIC {sector.nicCode} · {sector.category}</p>
              </div>
            </div>
            <p className="text-sm text-ink-soft dark:text-paper-dark/70 mt-2 leading-relaxed">{sector.description}</p>
          </div>
          <button onClick={onClose} className="text-ink-soft/70 dark:text-paper-dark/50 hover:text-ink dark:hover:text-paper-dark text-sm font-medium ml-6 mt-1 shrink-0 min-h-[44px] sm:min-h-0 flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded">
            Close ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Composite scores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-sunk dark:bg-surface-dark-raised border border-line dark:border-line-dark rounded-lg p-4 text-center">
              <div className="text-3xl font-black text-ink dark:text-paper-dark tabular-nums">{sector.opportunityScore}</div>
              <div className="text-[11px] text-ink-soft dark:text-paper-dark/60 mt-1 uppercase tracking-[0.12em]">Opportunity</div>
              <div className="mt-2"><ScoreBar score={sector.opportunityScore} accent="blue" /></div>
            </div>
            <div className="bg-surface-sunk dark:bg-surface-dark-raised border border-line dark:border-line-dark rounded-lg p-4 text-center">
              <div className="text-3xl font-black text-ink dark:text-paper-dark tabular-nums">{sector.riskScore}</div>
              <div className="text-[11px] text-ink-soft dark:text-paper-dark/60 mt-1 uppercase tracking-[0.12em]">Risk</div>
              <div className="mt-2"><ScoreBar score={sector.riskScore} accent="slate" /></div>
            </div>
          </div>

          {/* Lifecycle + stats */}
          <div className="bg-surface-sunk dark:bg-surface-dark-raised border border-line dark:border-line-dark rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-ink-soft dark:text-paper-dark/60 uppercase tracking-[0.12em]">Market Stage</span>
              <LifecycleBadge lc={sector.lifecycle} />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-line dark:border-line-dark">
              <div className="text-center">
                <div className="text-base font-bold text-ink dark:text-paper-dark tabular-nums">{sector.activeCompanies > 0 ? (sector.activeCompanies / 1000).toFixed(0) + 'K' : '—'}</div>
                <div className="text-[10px] text-ink-soft/70 dark:text-paper-dark/50 mt-0.5">Active cos.</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-ink dark:text-paper-dark tabular-nums">{sector.totalMsmeRegistrations > 0 ? (sector.totalMsmeRegistrations / 100000).toFixed(1) + 'L' : '—'}</div>
                <div className="text-[10px] text-ink-soft/70 dark:text-paper-dark/50 mt-0.5">MSME reg.</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-ink dark:text-paper-dark tabular-nums">{sector.activeCompanies + sector.struckOffCompanies > 0 ? Math.round(sector.activeCompanies / (sector.activeCompanies + sector.struckOffCompanies) * 100) + '%' : '—'}</div>
                <div className="text-[10px] text-ink-soft/70 dark:text-paper-dark/50 mt-0.5">Survival rate</div>
              </div>
            </div>
          </div>

          {/* Formation bar chart */}
          {sector.formationTrend.length >= 2 && (
            <div className="bg-surface-sunk dark:bg-surface-dark-raised border border-line dark:border-line-dark rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-ink-soft dark:text-paper-dark/60 uppercase tracking-[0.12em]">New Business Formation</span>
                <span className="text-[10px] text-ink-soft/60 dark:text-paper-dark/40 font-mono tabular-nums">MCA21 + Udyam</span>
              </div>
              <div className="flex items-end gap-1">
                {sector.formationTrend.map(t => {
                  const max = Math.max(...sector.formationTrend.map(d => d.count))
                  const h = Math.round((t.count / max) * 56) + 4
                  const isRecent = t.year >= 2022
                  return (
                    <div key={t.year} className="flex-1 flex flex-col items-center gap-1" title={`${t.year}: ${t.count.toLocaleString()}`}>
                      <div
                        className={`w-full rounded-sm ${isRecent ? 'bg-brand-600' : 'bg-brand-600/30 dark:bg-brand-600/40'}`}
                        style={{ height: `${h}px` }}
                      />
                      <span className="text-[8px] font-mono text-ink-soft/60 dark:text-paper-dark/40 tabular-nums">{String(t.year).slice(2)}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-ink-soft/70 dark:text-paper-dark/50 mt-2">Solid = Udyam era (2022+) · Faded = MCA21 historical</p>
            </div>
          )}

          {/* 8-signal breakdown */}
          <div className="bg-surface-sunk dark:bg-surface-dark-raised border border-line dark:border-line-dark rounded-lg p-4">
            <h3 className="text-[11px] font-bold text-ink-soft dark:text-paper-dark/60 mb-3 uppercase tracking-[0.12em]">8-Signal Breakdown</h3>
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
          <div className="pl-1 py-1">
            <p className="text-[11px] font-bold text-brand-600 mb-2 uppercase tracking-[0.12em]">Analysis</p>
            <p className="text-sm text-ink-soft dark:text-paper-dark/70 leading-relaxed">
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
      className="border-b border-line dark:border-line-dark hover:bg-surface-sunk dark:hover:bg-surface-dark-raised cursor-pointer transition-colors group"
      onClick={onClick}
    >
      <td className="px-4 py-3 text-ink-soft/60 dark:text-paper-dark/40 font-mono text-xs w-8 text-right tabular-nums">{rank}</td>
      <td className="px-2 py-3">
        <div>
          <div className="text-sm font-medium text-ink dark:text-paper-dark group-hover:text-brand-600 dark:group-hover:text-brand-600 transition-colors">{sector.label}</div>
          <div className="text-[10px] font-mono text-ink-soft/60 dark:text-paper-dark/40 mt-0.5 tabular-nums">NIC {sector.nicCode} · {sector.category}</div>
        </div>
      </td>
      <td className="px-3 py-3 hidden md:table-cell">
        <LifecycleBadge lc={sector.lifecycle} />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-ink dark:text-paper-dark tabular-nums">{sector.opportunityScore}</span>
          <div className="w-14 hidden lg:block"><ScoreBar score={sector.opportunityScore} accent="blue" /></div>
        </div>
      </td>
      <td className="px-3 py-3 hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-ink-soft dark:text-paper-dark/60 tabular-nums">{sector.riskScore}</span>
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
      <td className="px-3 py-3 text-ink-soft/50 dark:text-paper-dark/40 text-sm">›</td>
    </tr>
  )
}

// ─── Summary stat card ────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-surface dark:bg-surface-dark border border-line dark:border-line-dark rounded-lg p-4">
      <div className="text-2xl font-black text-ink dark:text-paper-dark tabular-nums">{value}</div>
      <div className="text-[11px] font-bold text-ink-soft dark:text-paper-dark/60 mt-1 uppercase tracking-[0.12em]">{label}</div>
      {sub && <div className="text-[10px] text-ink-soft/70 dark:text-paper-dark/40 mt-1">{sub}</div>}
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
      <div className="min-h-screen bg-paper dark:bg-ink-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-ink-soft dark:text-paper-dark/60 text-sm">Computing signals across 8 data sources…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-paper dark:bg-ink-dark flex items-center justify-center">
        <div className="text-alert text-sm bg-alert/10 border border-alert/30 rounded-lg px-6 py-4">
          Error: {error ?? 'Failed to load sector data'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-dark text-ink dark:text-paper-dark">
      {/* Page header */}
      <div className="border-b border-line dark:border-line-dark bg-paper dark:bg-ink-dark">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-brand-600 uppercase tracking-[0.12em] mb-1">India · Economic Intelligence</p>
            <h1 className="text-2xl font-black text-ink dark:text-paper-dark tracking-tight">Sector Pulse</h1>
            <p className="text-sm text-ink-soft dark:text-paper-dark/60 mt-1 tabular-nums">{data.sectors.length} sectors · 8-signal vitality index · MCA21 + Udyam + RBI + DGFT + EPFO</p>
          </div>
          <div className="text-right hidden sm:block pb-0.5">
            <div className="text-[10px] text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-[0.12em]">Data as of</div>
            <div className="text-xs text-ink-soft dark:text-paper-dark/70 font-mono tabular-nums">{new Date(data.summary.dataAsOf).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
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
        <div className="bg-surface dark:bg-surface-dark border border-line dark:border-line-dark rounded-2xl p-5">
          <h2 className="text-[11px] font-bold text-ink-soft dark:text-paper-dark/60 uppercase tracking-[0.12em] mb-4">Market Stage Distribution</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {LC_ALL.map(lc => {
              const sectors = topByLifecycle[lc] ?? []
              const isActive = lcFilter === lc
              return (
                <button
                  key={lc}
                  onClick={() => setLcFilter(isActive ? 'All' : lc)}
                  className={`rounded-lg p-3 text-left border min-h-[44px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-dark ${
                    isActive
                      ? 'bg-brand-600/10 border-brand-600'
                      : 'bg-surface-sunk dark:bg-surface-dark-raised border-line dark:border-line-dark hover:border-brand-600/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${LIFECYCLE_DOT[lc]}`} />
                    <span className="text-lg font-black text-ink dark:text-paper-dark tabular-nums">{sectors.length}</span>
                  </div>
                  <div className="text-[10px] font-bold text-ink-soft dark:text-paper-dark/60 uppercase tracking-[0.12em]">{lc}</div>
                  <div className="text-[10px] text-ink-soft/70 dark:text-paper-dark/40 mt-1 truncate">{sectors[0]?.label ?? '—'}</div>
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
            aria-label="Search sectors"
            className="bg-surface dark:bg-surface-dark border border-line dark:border-line-dark rounded-md px-3 py-2 min-h-[44px] text-sm text-ink dark:text-paper-dark placeholder-ink-soft/50 dark:placeholder-paper-dark/40 focus:outline-none focus:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/40 w-44"
          />
          <div className="flex gap-1 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-3 py-2 min-h-[44px] rounded-full text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                  catFilter === c
                    ? 'bg-brand-600/10 text-brand-600 border border-brand-600'
                    : 'bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-paper-dark/60 border border-line dark:border-line-dark hover:text-ink dark:hover:text-paper-dark'
                }`}>
                {c}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="text-[11px] text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-[0.12em] mr-1">Sort</span>
            {(['opportunity', 'risk', 'label'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-3 py-2 min-h-[44px] rounded-md text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                  sortBy === s
                    ? 'bg-brand-600/10 text-brand-600 border border-brand-600'
                    : 'bg-surface dark:bg-surface-dark text-ink-soft dark:text-paper-dark/60 border border-line dark:border-line-dark hover:text-ink dark:hover:text-paper-dark'
                }`}>
                {s === 'opportunity' ? 'Opp.' : s === 'risk' ? 'Risk' : 'A–Z'}
              </button>
            ))}
          </div>
        </div>

        {/* Main table */}
        <div className="bg-surface dark:bg-surface-dark border border-line dark:border-line-dark rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line dark:border-line-dark text-left bg-surface-sunk dark:bg-surface-dark-raised">
                <th className="px-4 py-3 text-[10px] font-bold text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-[0.12em] w-8 text-right">#</th>
                <th className="px-2 py-3 text-[10px] font-bold text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-[0.12em]">Sector</th>
                <th className="px-3 py-3 text-[10px] font-bold text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-[0.12em] hidden md:table-cell">Stage</th>
                <th className="px-3 py-3 text-[10px] font-bold text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-[0.12em]">Opp.</th>
                <th className="px-3 py-3 text-[10px] font-bold text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-[0.12em] hidden sm:table-cell">Risk</th>
                <th className="px-3 py-3 text-[10px] font-bold text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-[0.12em] hidden xl:table-cell">Signals</th>
                <th className="px-3 py-3 text-[10px] font-bold text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-[0.12em] hidden lg:table-cell">Formation</th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((sector, i) => (
                <SectorRow key={sector.nicCode} sector={sector} rank={i + 1} onClick={() => setSelected(sector)} />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-ink-soft/70 dark:text-paper-dark/50 text-sm">No sectors match filters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Signal legend */}
        <div className="bg-surface dark:bg-surface-dark border border-line dark:border-line-dark rounded-2xl p-5">
          <h3 className="text-[11px] font-bold text-ink-soft dark:text-paper-dark/60 uppercase tracking-[0.12em] mb-4">Signal Key</h3>
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
                <span className="text-[10px] font-mono font-bold text-ink-soft dark:text-paper-dark/70 bg-surface-sunk dark:bg-surface-dark-raised border border-line dark:border-line-dark rounded px-1.5 py-0.5 shrink-0">{code}</span>
                <div>
                  <span className="font-medium text-ink dark:text-paper-dark">{name}</span>
                  <p className="text-ink-soft/70 dark:text-paper-dark/50 mt-0.5 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-5 mt-4 pt-4 border-t border-line dark:border-line-dark text-[11px] text-ink-soft/70 dark:text-paper-dark/50">
            <span className="tabular-nums">Signal dots:&nbsp;
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-positive align-middle" /> ≥65 strong &nbsp;
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-caution align-middle" /> 45–64 moderate &nbsp;
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-alert align-middle" /> &lt;45 weak
            </span>
            <span>Ringed dot = modelled estimate</span>
          </div>
        </div>

        <p className="text-[10px] text-ink-soft/60 dark:text-paper-dark/40 text-center pb-4">
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
