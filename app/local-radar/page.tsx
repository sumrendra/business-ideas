'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { searchNicCodes, type NicEntry } from '@/lib/local-radar/nic-codes'
import type { RadarResult, DataSource, LocalBusiness } from '@/lib/local-radar/types'

// ── Source config ──────────────────────────────────────────────────────────────
const SOURCE_META: Record<DataSource, { label: string; color: string; badge: string; icon: string }> = {
  google_places: { label: 'Google Places',      color: 'bg-brand-600',     badge: 'bg-brand-600/10 text-brand-600',   icon: '📍' },
  mca21:         { label: 'MCA21 Companies',     color: 'bg-brand-600/80',  badge: 'bg-brand-600/10 text-brand-600', icon: '🏛️' },
  udyam:         { label: 'Udyam (MSME)',        color: 'bg-brand-600/60',  badge: 'bg-brand-600/10 text-brand-600', icon: '🏭' },
  gstin:         { label: 'GSTN Statistics',     color: 'bg-brand-600/40',  badge: 'bg-brand-600/10 text-brand-600',  icon: '📋' },
}

const TREND_CONFIG = {
  Rising:     { cls: 'text-positive', bg: 'bg-positive/10 border-positive/30', icon: '↑' },
  Stable:     { cls: 'text-ink-soft dark:text-paper-dark/70',     bg: 'bg-surface-sunk dark:bg-surface-dark-raised border-line dark:border-line-dark',          icon: '→' },
  Declining:  { cls: 'text-alert',       bg: 'bg-alert/10 border-alert/30',              icon: '↓' },
  Emerging:   { cls: 'text-brand-600',   bg: 'bg-brand-600/10 border-brand-600/30',      icon: '✦' },
  Saturating: { cls: 'text-caution',     bg: 'bg-caution/10 border-caution/30',          icon: '⚠' },
}

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
]

// ── Trajectory bar chart ───────────────────────────────────────────────────────
function TrajectoryChart({ trajectory, bySource }: {
  trajectory: RadarResult['trajectory']
  bySource: RadarResult['trajectoryBySource']
}) {
  const [showSources, setShowSources] = useState(false)

  if (!trajectory.length) return (
    <p className="py-8 text-center text-sm text-ink-soft/70 dark:text-paper-dark/50">
      No trajectory data — Google Places reviews don&apos;t include enough historic dates for this search.
    </p>
  )

  const maxCount = Math.max(...trajectory.map(y => y.count), 1)
  const years    = trajectory.map(t => t.year)
  const minYear  = Math.min(...years)
  const maxYear  = Math.max(...years)

  // Fill missing years with 0
  const full: typeof trajectory = []
  for (let y = Math.max(minYear, 2017); y <= maxYear; y++) {
    full.push(trajectory.find(t => t.year === y) ?? { year: y, count: 0, source: 'google_places' })
  }

  // Per-source data for the breakdown view
  const sourceKeys = Object.keys(bySource).filter(s => bySource[s as DataSource].length > 0) as DataSource[]

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60">
          New Business Entries / Year
        </p>
        {sourceKeys.length > 1 && (
          <button
            onClick={() => setShowSources(v => !v)}
            className="text-xs text-brand-600 dark:text-brand-600 hover:underline min-h-[44px] sm:min-h-0 px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
          >
            {showSources ? 'Show merged' : 'Compare sources'}
          </button>
        )}
      </div>

      {/* Merged bars */}
      {!showSources && (
        <div className="flex items-end gap-2 h-32">
          {full.map((item) => {
            const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0
            const src = SOURCE_META[item.source]
            return (
              <div key={item.year} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-ink-soft dark:text-paper-dark/60 tabular-nums">
                  {item.count > 0 ? item.count : ''}
                </span>
                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                  <div
                    className={`w-full rounded-t transition-all duration-700 ${src.color}`}
                    style={{ height: `${Math.max(pct, item.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="text-[10px] text-ink-soft/70 dark:text-paper-dark/50 rotate-0 tabular-nums">
                  {String(item.year).slice(2)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Per-source breakdown */}
      {showSources && (
        <div className="space-y-4">
          {sourceKeys.map(src => {
            const data = bySource[src]
            const max = Math.max(...data.map(d => d.count), 1)
            const meta = SOURCE_META[src]
            return (
              <div key={src}>
                <p className="text-xs font-semibold text-ink-soft dark:text-paper-dark/60 mb-1 flex items-center gap-1.5">
                  <span>{meta.icon}</span> {meta.label}
                </p>
                <div className="flex items-end gap-1.5 h-16">
                  {data.map(item => (
                    <div key={item.year} className="flex-1 flex flex-col items-center gap-0.5">
                      <span className="text-[9px] text-ink-soft/70 dark:text-paper-dark/50 tabular-nums">{item.count}</span>
                      <div style={{ height: '40px' }} className="w-full flex flex-col justify-end">
                        <div
                          className={`w-full rounded-t ${meta.color}`}
                          style={{ height: `${Math.max((item.count / max) * 100, 3)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-ink-soft/70 dark:text-paper-dark/50 tabular-nums">{String(item.year).slice(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Business list ───────────────────────────────────────────────────────────────
function BusinessCard({ b }: { b: LocalBusiness }) {
  const isClosed = b.status === 'PERMANENTLY_CLOSED'
  return (
    <div className={`flex items-start gap-3 rounded-xl p-3 border transition-all ${isClosed ? 'opacity-50 border-line dark:border-line-dark' : 'border-line dark:border-line-dark hover:border-brand-600/50 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)]'}`}>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-ink dark:text-paper-dark text-sm truncate">{b.name}</p>
        <p className="text-xs text-ink-soft/70 dark:text-paper-dark/50 mt-0.5 truncate">{b.address}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {b.estimatedEntryYear && (
            <span className="text-[11px] bg-brand-600/10 text-brand-600 px-1.5 py-0.5 rounded-full font-semibold tabular-nums">
              Est. {b.estimatedEntryYear}
            </span>
          )}
          {b.rating && (
            <span className="text-[11px] text-caution tabular-nums">
              ★ {b.rating} ({b.totalRatings})
            </span>
          )}
          {isClosed && (
            <span className="text-[11px] bg-alert/10 text-alert px-1.5 py-0.5 rounded-full font-semibold">
              Closed
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────────
export default function LocalRadarPage() {
  const [businessQuery, setBusinessQuery] = useState('')
  const [nicSuggestions, setNicSuggestions] = useState<NicEntry[]>([])
  const [selectedNic, setSelectedNic]   = useState<NicEntry | null>(null)
  const [city, setCity]   = useState('')
  const [state, setState] = useState('')
  const [radius, setRadius] = useState(15)

  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<RadarResult | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'sources'>('overview')

  const handleBusinessSearch = (q: string) => {
    setBusinessQuery(q)
    setSelectedNic(null)
    setNicSuggestions(q.length >= 2 ? searchNicCodes(q) : [])
  }

  const selectNic = (nic: NicEntry) => {
    setSelectedNic(nic)
    setBusinessQuery(nic.label)
    setNicSuggestions([])
  }

  const analyze = useCallback(async () => {
    if (!selectedNic || !city || !state) return
    setLoading(true)
    setError(null)
    setResult(null)
    setActiveTab('overview')
    try {
      const url = `/api/local-radar?nic=${selectedNic.code}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&radius=${radius}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Request failed')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }, [selectedNic, city, state, radius])

  const trend = result ? TREND_CONFIG[result.trend] : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-ink-soft dark:text-paper-dark/60">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-brand-600 dark:hover:text-brand-600">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-ink dark:text-paper-dark">Local Market Radar</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-600">4-Source Intelligence</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-ink dark:text-paper-dark">
          📡 Local Market Radar
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft dark:text-paper-dark/70">
          See how many competitors exist in your city, when they entered, and whether the market is rising or saturating.
          Combines Google Places, MCA21, Udyam MSME data, and GSTN statistics.
        </p>
      </header>

      {/* Search form */}
      <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6 mb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Business type with autocomplete */}
          <div className="relative lg:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60 mb-1.5">
              Business Type
            </label>
            <input
              type="text"
              value={businessQuery}
              onChange={e => handleBusinessSearch(e.target.value)}
              placeholder="e.g. mushroom farming, bakery, gym…"
              className="w-full rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised px-4 py-2.5 min-h-[44px] text-sm text-ink dark:text-paper-dark placeholder-ink-soft/50 dark:placeholder-paper-dark/40 focus:outline-none focus:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/40"
            />
            {nicSuggestions.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] overflow-hidden">
                {nicSuggestions.map(n => (
                  <button
                    key={n.code}
                    onClick={() => selectNic(n)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-2.5 min-h-[44px] text-sm hover:bg-brand-600/10 text-left transition-colors focus:outline-none focus-visible:bg-brand-600/10"
                  >
                    <span>
                      <span className="font-semibold text-ink dark:text-paper-dark">{n.label}</span>
                      <span className="ml-2 text-xs text-ink-soft/70 dark:text-paper-dark/50">{n.divisionName}</span>
                    </span>
                    <span className="font-mono text-[11px] text-ink-soft/70 dark:text-paper-dark/50 flex-shrink-0 tabular-nums">NIC {n.code}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedNic && (
              <p className="mt-1 text-[11px] text-brand-600 dark:text-brand-600 tabular-nums">
                NIC {selectedNic.code} · {selectedNic.divisionName}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60 mb-1.5">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Pune, Bengaluru…"
              className="w-full rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised px-4 py-2.5 min-h-[44px] text-sm text-ink dark:text-paper-dark placeholder-ink-soft/50 dark:placeholder-paper-dark/40 focus:outline-none focus:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/40"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60 mb-1.5">
              State
            </label>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised px-4 py-2.5 min-h-[44px] text-sm text-ink dark:text-paper-dark focus:outline-none focus:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/40"
            >
              <option value="">Select state</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-ink-soft dark:text-paper-dark/60 whitespace-nowrap tabular-nums">Radius: {radius} km</label>
            <input
              type="range" min={5} max={50} step={5} value={radius}
              onChange={e => setRadius(parseInt(e.target.value))}
              aria-label="Search radius in kilometres"
              className="w-28 accent-brand-600"
            />
          </div>
          <button
            onClick={analyze}
            disabled={!selectedNic || !city || !state || loading}
            className="ml-auto rounded-md bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 min-h-[44px] text-sm font-semibold transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-dark"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Scanning…
              </>
            ) : (
              <>📡 Analyze Market</>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-alert/30 bg-alert/10 p-4 text-sm text-alert">
          {error}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Trend hero */}
          <div className={`rounded-2xl border p-6 mb-6 ${trend!.bg}`}>
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60 mb-1 tabular-nums">
                  {result.businessType} in {result.city}, {result.state} ({result.radiusKm}km)
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-4xl font-black ${trend!.cls}`}>
                    {trend!.icon} {result.trend}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-soft dark:text-paper-dark/70">{result.trendReason}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 flex-shrink-0">
                {[
                  { label: 'Active Now',   value: result.currentCount,             sub: 'from Places' },
                  { label: 'Closed',       value: result.closedCount,              sub: 'found closed', cls: result.closedCount > 0 ? 'text-alert' : undefined },
                  { label: 'Survival',     value: `${result.survivalRate}%`,       sub: 'still open' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={`text-2xl font-bold tabular-nums ${s.cls ?? 'text-ink dark:text-paper-dark'}`}>{s.value}</p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60">{s.label}</p>
                    <p className="text-[10px] text-ink-soft/70 dark:text-paper-dark/50">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-2">
            {(['overview', 'businesses', 'sources'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`rounded-full px-4 py-2 min-h-[44px] text-sm font-semibold transition-colors capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                  activeTab === t ? 'bg-brand-600 text-white' : 'bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-paper-dark/60 hover:text-ink dark:hover:text-paper-dark'
                }`}
              >
                {t === 'businesses' ? `Businesses (${result.businesses.length})` : t === 'sources' ? 'Data Sources' : 'Overview'}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Trajectory chart */}
              <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5">
                <TrajectoryChart
                  trajectory={result.trajectory}
                  bySource={result.trajectoryBySource}
                />
              </div>

              {/* MCA21 state context */}
              {result.mcaStateSummary && (
                <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60 mb-3 flex items-center gap-1.5">
                    🏛️ MCA21 — State-wide ({result.state})
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-2xl font-bold text-ink dark:text-paper-dark tabular-nums">
                        {result.mcaStateSummary.activeCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-ink-soft dark:text-paper-dark/60">Active companies</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-alert tabular-nums">
                        {result.mcaStateSummary.struckOffCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-ink-soft dark:text-paper-dark/60">Struck off (failures)</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-positive tabular-nums">
                        {result.mcaStateSummary.survivalRate}%
                      </p>
                      <p className="text-xs text-ink-soft dark:text-paper-dark/60">Sector survival rate</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-ink dark:text-paper-dark tabular-nums">
                        {Object.values(result.mcaStateSummary.incorporationsByYear).at(-1)?.toLocaleString()}
                      </p>
                      <p className="text-xs text-ink-soft dark:text-paper-dark/60">Last year entries</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-ink-soft/70 dark:text-paper-dark/50 tabular-nums">
                    Source: MCA Annual Report + Company Master Data (NIC division {result.mcaStateSummary.nicDivision})
                  </p>
                </div>
              )}

              {/* GSTIN estimate */}
              {result.gstinEstimate && (
                <div className="rounded-2xl border border-caution/30 bg-caution/[0.06] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-caution mb-2 flex items-center gap-1.5">
                    📋 GSTN Statistics · Estimate
                  </p>
                  <p className="text-3xl font-bold text-ink dark:text-paper-dark tabular-nums">
                    ~{result.gstinEstimate.count.toLocaleString()}
                  </p>
                  <p className="text-sm text-ink-soft dark:text-paper-dark/70 mt-0.5">
                    Estimated active GST filers in this sector across {result.gstinEstimate.state}
                  </p>
                  <p className="text-[11px] text-ink-soft/70 dark:text-paper-dark/50 mt-2">
                    {result.gstinEstimate.note}
                  </p>
                </div>
              )}

              {/* Udyam */}
              <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60 mb-2 flex items-center gap-1.5">
                  🏭 Udyam (MSME Registration)
                </p>
                {result.udyamSummary?.source !== 'unavailable' && result.udyamSummary?.totalCount ? (
                  <>
                    <p className="text-3xl font-bold text-ink dark:text-paper-dark tabular-nums">
                      {result.udyamSummary.totalCount.toLocaleString()}
                    </p>
                    <p className="text-sm text-ink-soft dark:text-paper-dark/70 mt-0.5">
                      {result.udyamSummary.note ?? `Udyam registrations in ${result.udyamSummary.district}`}
                    </p>
                  </>
                ) : (
                  <div>
                    <p className="text-sm text-ink-soft dark:text-paper-dark/70">
                      {result.udyamSummary?.note ?? 'Data unavailable for this district/sector.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Businesses */}
          {activeTab === 'businesses' && (
            <div>
              <div className="grid sm:grid-cols-2 gap-3">
                {result.businesses.map(b => <BusinessCard key={b.placeId} b={b} />)}
              </div>
              {result.businesses.length === 0 && (
                <p className="py-12 text-center text-ink-soft dark:text-paper-dark/60 text-sm">
                  No businesses found from Google Places for this search.
                </p>
              )}
              <p className="mt-4 text-xs text-center text-ink-soft/70 dark:text-paper-dark/50">
                "Est. YYYY" is derived from the oldest Google review date — actual entry is typically 3–12 months earlier.
              </p>
            </div>
          )}

          {/* Tab: Sources */}
          {activeTab === 'sources' && (
            <div className="space-y-4">
              {result.sourcesSummary.map(s => {
                const meta = SOURCE_META[s.source]
                const statusColor = s.status === 'live' ? 'text-positive' :
                                    s.status === 'estimated' ? 'text-caution' :
                                    'text-alert'
                const statusLabel = s.status === 'live' ? '● Live' : s.status === 'estimated' ? '◐ Estimated' : '○ Unavailable'
                return (
                  <div key={s.source} className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{meta.icon}</span>
                        <div>
                          <p className="font-semibold text-ink dark:text-paper-dark">{meta.label}</p>
                          <p className="text-xs text-ink-soft dark:text-paper-dark/60 mt-0.5">{s.description}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</p>
                        {s.count !== undefined && (
                          <p className="text-lg font-bold text-ink dark:text-paper-dark mt-0.5 tabular-nums">
                            {s.count.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className="rounded-2xl border border-line dark:border-line-dark p-4 text-xs text-ink-soft/70 dark:text-paper-dark/50">
                <p className="font-semibold text-ink-soft dark:text-paper-dark/60 mb-2">Unlock more data:</p>
                <ul className="space-y-1">
                  <li>• <strong>Udyam district data:</strong> Live via data.gov.in API (preprocessed summary available for major cities)</li>
                  <li>• <strong>MCA21 city-level:</strong> Run <code>node scripts/fetch-mca21.mjs</code> after downloading from mca.gov.in</li>
                  <li>• <strong>GSTN:</strong> No public bulk API available — estimates from published GSTN Annual Statistics</li>
                </ul>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-ink-soft/70 dark:text-paper-dark/50 tabular-nums">
            Generated in {(result.durationMs / 1000).toFixed(1)}s · {new Date(result.generatedAt).toLocaleString('en-IN')}
          </p>
        </>
      )}
    </div>
  )
}
