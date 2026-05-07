'use client'

import { useEffect, useState, useMemo } from 'react'
import type { SectorPulse, SectorPulseResponse, Signal, Lifecycle, SectorCategory } from '@/lib/sector-pulse/types'

// ─── Sparkline (inline SVG) ───────────────────────────────────────────────────
function Sparkline({ data, color = '#6366f1' }: { data: { year: number; count: number }[]; color?: string }) {
  if (data.length < 2) return <div className="w-20 h-8 flex items-center text-xs text-slate-500">No data</div>
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
  const trend = counts[counts.length - 1] > counts[0]
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * W} cy={H - ((counts[counts.length - 1] - min) / range) * (H - 4) - 2} r="2.5" fill={trend ? '#22c55e' : '#ef4444'} />
    </svg>
  )
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono w-7 text-right text-slate-300">{score}</span>
    </div>
  )
}

// ─── Signal pill ──────────────────────────────────────────────────────────────
function SignalDot({ signal, label }: { signal: Signal; label: string }) {
  const color = signal.score >= 65 ? 'bg-emerald-500' : signal.score >= 45 ? 'bg-amber-500' : 'bg-red-500'
  const ring = signal.isEstimated ? 'ring-1 ring-slate-500' : ''
  return (
    <div className="flex flex-col items-center gap-0.5" title={`${label}: ${signal.score}/100\n${signal.note}`}>
      <div className={`w-2.5 h-2.5 rounded-full ${color} ${ring}`} />
      <span className="text-[9px] text-slate-500 leading-none">{label}</span>
    </div>
  )
}

// ─── Lifecycle badge ──────────────────────────────────────────────────────────
const LIFECYCLE_STYLES: Record<Lifecycle, string> = {
  Accelerating: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Emerging:     'bg-teal-500/20 text-teal-300 border-teal-500/30',
  Maturing:     'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Contested:    'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Declining:    'bg-red-500/20 text-red-300 border-red-500/30',
  Transforming: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
}
const LIFECYCLE_ICONS: Record<Lifecycle, string> = {
  Accelerating: '↑', Emerging: '◎', Maturing: '→',
  Contested: '⚡', Declining: '↓', Transforming: '↻',
}

function LifecycleBadge({ lc }: { lc: Lifecycle }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${LIFECYCLE_STYLES[lc]}`}>
      {LIFECYCLE_ICONS[lc]} {lc}
    </span>
  )
}

// ─── Signal detail panel ──────────────────────────────────────────────────────
function SignalRow({ icon, label, signal }: { icon: string; label: string; signal: Signal }) {
  const bar = signal.score >= 65 ? 'bg-emerald-500' : signal.score >= 45 ? 'bg-amber-500' : 'bg-red-500'
  const dirIcon = signal.direction === 'up' ? '↑' : signal.direction === 'down' ? '↓' : '→'
  const dirColor = signal.direction === 'up' ? 'text-emerald-400' : signal.direction === 'down' ? 'text-red-400' : 'text-slate-400'
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-800 last:border-0">
      <span className="text-lg w-6 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-300">{label}</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${dirColor}`}>{dirIcon} {signal.label}</span>
            <span className="text-xs font-mono text-slate-400">{signal.score}/100</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1.5">
          <div className={`h-full rounded-full ${bar}`} style={{ width: `${signal.score}%` }} />
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">{signal.note}</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Source: {signal.source}{signal.isEstimated ? ' (modelled)' : ''}</p>
      </div>
    </div>
  )
}

// ─── Sector detail drawer ─────────────────────────────────────────────────────
function SectorDrawer({ sector, onClose }: { sector: SectorPulse; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-slate-900 border-l border-slate-700 overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-5 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{sector.icon}</span>
              <div>
                <h2 className="text-lg font-bold text-white">{sector.label}</h2>
                <p className="text-xs text-slate-400">NIC {sector.nicCode} · {sector.category}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-2">{sector.description}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl ml-4 mt-1">✕</button>
        </div>

        <div className="p-5 space-y-6">
          {/* Composite scores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-emerald-400">{sector.opportunityScore}</div>
              <div className="text-xs text-slate-400 mt-1">Opportunity Score</div>
              <div className="mt-2"><ScoreBar score={sector.opportunityScore} color="bg-emerald-500" /></div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-red-400">{sector.riskScore}</div>
              <div className="text-xs text-slate-400 mt-1">Risk Score</div>
              <div className="mt-2"><ScoreBar score={sector.riskScore} color="bg-red-500" /></div>
            </div>
          </div>

          {/* Lifecycle + stats */}
          <div className="bg-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Market Stage</span>
              <LifecycleBadge lc={sector.lifecycle} />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700">
              <div className="text-center">
                <div className="text-base font-bold text-white">{sector.activeCompanies > 0 ? (sector.activeCompanies / 1000).toFixed(0) + 'K' : '—'}</div>
                <div className="text-[10px] text-slate-500">Active cos.</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-white">{sector.totalMsmeRegistrations > 0 ? (sector.totalMsmeRegistrations / 100000).toFixed(1) + 'L' : '—'}</div>
                <div className="text-[10px] text-slate-500">MSME registrations</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-white">{sector.activeCompanies + sector.struckOffCompanies > 0 ? Math.round(sector.activeCompanies / (sector.activeCompanies + sector.struckOffCompanies) * 100) + '%' : '—'}</div>
                <div className="text-[10px] text-slate-500">Survival rate</div>
              </div>
            </div>
          </div>

          {/* Formation sparkline */}
          {sector.formationTrend.length >= 2 && (
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-300">New Business Formation Trend</span>
                <span className="text-[10px] text-slate-500">MCA21 + Udyam</span>
              </div>
              <div className="flex items-end gap-1">
                {sector.formationTrend.map((t, i) => {
                  const max = Math.max(...sector.formationTrend.map(d => d.count))
                  const h = Math.round((t.count / max) * 60) + 4
                  const isRecent = t.year >= 2022
                  return (
                    <div key={t.year} className="flex-1 flex flex-col items-center gap-1" title={`${t.year}: ${t.count.toLocaleString()}`}>
                      <div
                        className={`w-full rounded-sm ${isRecent ? 'bg-indigo-500' : 'bg-slate-600'}`}
                        style={{ height: `${h}px` }}
                      />
                      <span className="text-[8px] text-slate-500 rotate-0">{String(t.year).slice(2)}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-slate-600 mt-2">Blue = Udyam era (2022+); Grey = MCA21 historical</p>
            </div>
          )}

          {/* All 8 signals */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">8-Signal Breakdown</h3>
            <SignalRow icon="🚀" label="Formation Velocity"    signal={sector.formationVelocity} />
            <SignalRow icon="🛡️" label="Survival Gradient"     signal={sector.survivalGradient} />
            <SignalRow icon="📋" label="Formalization Gap"     signal={sector.formalizationRate} />
            <SignalRow icon="🏦" label="Credit Momentum"       signal={sector.creditMomentum} />
            <SignalRow icon="🌐" label="Trade Exposure"        signal={sector.tradeExposure} />
            <SignalRow icon="👥" label="Employment Absorption" signal={sector.employmentAbsorption} />
            <SignalRow icon="🔍" label="Search Demand"         signal={sector.searchDemand} />
            <SignalRow icon="📜" label="Policy Tailwind"       signal={sector.policyScore} />
          </div>

          {/* McKinsey read */}
          <div className="bg-indigo-950/50 border border-indigo-800/40 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-300 mb-2 uppercase tracking-wider">Consultant's Read</p>
            <p className="text-sm text-slate-300 leading-relaxed">
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

// ─── Sector row (table) ───────────────────────────────────────────────────────
function SectorRow({ sector, onClick }: { sector: SectorPulse; onClick: () => void }) {
  const signals = [
    sector.formationVelocity, sector.survivalGradient, sector.formalizationRate,
    sector.creditMomentum, sector.tradeExposure, sector.employmentAbsorption,
    sector.searchDemand, sector.policyScore,
  ]
  const dotLabels = ['Frm', 'Srv', 'Fmt', 'Crd', 'Trd', 'Emp', 'Srch', 'Pol']

  return (
    <tr
      className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors group"
      onClick={onClick}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{sector.icon}</span>
          <div>
            <div className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{sector.label}</div>
            <div className="text-[10px] text-slate-500">NIC {sector.nicCode} · {sector.category}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 hidden md:table-cell">
        <LifecycleBadge lc={sector.lifecycle} />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="text-xl font-black text-emerald-400">{sector.opportunityScore}</div>
          <div className="w-16 hidden lg:block"><ScoreBar score={sector.opportunityScore} color="bg-emerald-500" /></div>
        </div>
      </td>
      <td className="px-3 py-3 hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <div className="text-xl font-black text-red-400">{sector.riskScore}</div>
          <div className="w-16 hidden lg:block"><ScoreBar score={sector.riskScore} color="bg-red-500" /></div>
        </div>
      </td>
      <td className="px-3 py-3 hidden xl:table-cell">
        <div className="flex gap-2">
          {signals.map((sig, i) => <SignalDot key={i} signal={sig} label={dotLabels[i]} />)}
        </div>
      </td>
      <td className="px-3 py-3 hidden lg:table-cell">
        <Sparkline data={sector.formationTrend} color={sector.lifecycle === 'Declining' ? '#ef4444' : '#6366f1'} />
      </td>
      <td className="px-3 py-3 text-slate-500 text-lg">›</td>
    </tr>
  )
}

// ─── Summary stat card ────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs font-medium text-slate-300 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}

// ─── Lifecycle legend ─────────────────────────────────────────────────────────
const LC_ALL = ['Accelerating', 'Emerging', 'Maturing', 'Contested', 'Declining', 'Transforming'] as Lifecycle[]

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SectorPulsePage() {
  const [data, setData]             = useState<SectorPulseResponse | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState<SectorCategory | 'All'>('All')
  const [lcFilter, setLcFilter]     = useState<Lifecycle | 'All'>('All')
  const [sortBy, setSortBy]         = useState<'opportunity' | 'risk' | 'label'>('opportunity')
  const [selected, setSelected]     = useState<SectorPulse | null>(null)

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
    if (search) s = s.filter(x => x.label.toLowerCase().includes(search.toLowerCase()) || x.description.toLowerCase().includes(search.toLowerCase()) || x.nicCode.includes(search))
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
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Computing sector signals across 8 data sources…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl px-6 py-4">
          Error: {error ?? 'Failed to load sector data'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇮🇳</span>
              <h1 className="text-xl font-black text-white">India Sector Pulse</h1>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-600 rounded-full font-medium">BETA</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">8-signal economic vitality index · {data.sectors.length} sectors · MCA21 + Udyam + RBI + DGFT + EPFO</p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-500">Data as of</div>
            <div className="text-xs text-slate-400">{new Date(data.summary.dataAsOf).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Sectors Tracked" value={data.summary.totalSectors} sub="NIC 2-digit divisions" color="text-white" />
          <StatCard label="Accelerating" value={data.summary.accelerating} sub="Strong growth signals" color="text-emerald-400" />
          <StatCard label="Top Opportunity" value={data.summary.topOpportunity.split(' ')[0]} sub={data.summary.topOpportunity} color="text-indigo-400" />
          <StatCard label="Highest Risk" value={data.summary.topRisk.split(' ')[0]} sub={data.summary.topRisk} color="text-red-400" />
        </div>

        {/* Lifecycle heatmap */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Market Stage Distribution</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {LC_ALL.map(lc => {
              const sectors = topByLifecycle[lc] ?? []
              return (
                <button
                  key={lc}
                  onClick={() => setLcFilter(lcFilter === lc ? 'All' : lc)}
                  className={`rounded-lg p-3 text-left border transition-all ${lcFilter === lc ? LIFECYCLE_STYLES[lc] + ' border-opacity-100' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}
                >
                  <div className="text-lg font-black">{sectors.length}</div>
                  <div className={`text-[11px] font-medium ${lcFilter === lc ? '' : 'text-slate-400'}`}>{LIFECYCLE_ICONS[lc]} {lc}</div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate">{sectors[0]?.label ?? '—'}</div>
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
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48"
          />
          <div className="flex gap-1 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${catFilter === c ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="text-xs text-slate-500 mr-1">Sort:</span>
            {(['opportunity', 'risk', 'label'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-2 py-1 rounded text-xs capitalize transition-colors ${sortBy === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
                {s === 'opportunity' ? '↑ Opp.' : s === 'risk' ? '↑ Risk' : 'A–Z'}
              </button>
            ))}
          </div>
        </div>

        {/* Main table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sector</th>
                <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Stage</th>
                <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Opp.</th>
                <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Risk</th>
                <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden xl:table-cell">Signals</th>
                <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Formation</th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(sector => (
                <SectorRow key={sector.nicCode} sector={sector} onClick={() => setSelected(sector)} />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500 text-sm">No sectors match filters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Signal legend */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Signal Legend</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-slate-400">
            {[
              ['🚀', 'Frm', 'Formation Velocity', 'MCA21 + Udyam: new business registrations YoY growth'],
              ['🛡️', 'Srv', 'Survival Gradient', 'MCA21: active vs struck-off ratio (higher = healthier)'],
              ['📋', 'Fmt', 'Formalization Gap', 'Informal economy remaining (higher = more white space)'],
              ['🏦', 'Crd', 'Credit Momentum', 'RBI sectoral bank credit growth'],
              ['🌐', 'Trd', 'Trade Exposure', 'DGFT export strength (higher = export-led)'],
              ['👥', 'Emp', 'Employment Absorption', 'EPFO: quality of job creation'],
              ['🔍', 'Srch', 'Search Demand', 'Google Trends 5yr direction'],
              ['📜', 'Pol', 'Policy Tailwind', 'PLI + Budget 2024-25 incentives'],
            ].map(([icon, code, name, desc]) => (
              <div key={code} className="flex items-start gap-2">
                <span>{icon}</span>
                <div>
                  <span className="font-mono font-bold text-slate-300">{code}</span>
                  <span className="text-slate-400"> — {name}</span>
                  <p className="text-slate-600 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-700/50 text-[11px] text-slate-500">
            <span>Signal dots: <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 align-middle" /> ≥65 strong &nbsp; <span className="inline-block w-2 h-2 rounded-full bg-amber-500 align-middle" /> 45–64 moderate &nbsp; <span className="inline-block w-2 h-2 rounded-full bg-red-500 align-middle" /> &lt;45 weak</span>
            <span>Ringed dot = modelled estimate</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-600 text-center pb-4">
          Opportunity score = weighted composite of Formation Velocity, Formalization Gap, Search Demand, Policy Tailwind, Trade Exposure.
          Risk score = weighted composite of Survival Gradient (inverted), Credit Momentum (inverted), Employment Absorption (inverted).
          Static signals calibrated from RBI/DGFT/EPFO annual reports 2023-24. Live signals from MCA21 Company Master (31 states) + Udyam MSME registry (46 cities).
        </p>
      </div>

      {/* Detail drawer */}
      {selected && <SectorDrawer sector={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
