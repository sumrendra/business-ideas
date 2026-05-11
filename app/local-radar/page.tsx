'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { searchNicCodes, type NicEntry } from '@/lib/local-radar/nic-codes'
import type { RadarResult, DataSource, LocalBusiness } from '@/lib/local-radar/types'

// ── Source config ──────────────────────────────────────────────────────────────
const SOURCE_META: Record<DataSource, { label: string; color: string; badge: string; icon: string }> = {
  google_places: { label: 'Google Places',      color: 'bg-blue-500',   badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',   icon: '📍' },
  mca21:         { label: 'MCA21 Companies',     color: 'bg-indigo-500', badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300', icon: '🏛️' },
  udyam:         { label: 'Udyam (MSME)',        color: 'bg-emerald-500',badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', icon: '🏭' },
  gstin:         { label: 'GSTN Statistics',     color: 'bg-amber-500',  badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',  icon: '📋' },
}

const TREND_CONFIG = {
  Rising:     { cls: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800', icon: '↑' },
  Stable:     { cls: 'text-slate-600 dark:text-slate-400',     bg: 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700',          icon: '→' },
  Declining:  { cls: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800',              icon: '↓' },
  Emerging:   { cls: 'text-violet-600 dark:text-violet-400',   bg: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800',      icon: '✦' },
  Saturating: { cls: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',          icon: '⚠' },
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
    <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
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
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          New Business Entries / Year
        </p>
        {sourceKeys.length > 1 && (
          <button
            onClick={() => setShowSources(v => !v)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
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
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  {item.count > 0 ? item.count : ''}
                </span>
                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                  <div
                    className={`w-full rounded-t transition-all duration-700 ${src.color} opacity-80`}
                    style={{ height: `${Math.max(pct, item.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 rotate-0">
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
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <span>{meta.icon}</span> {meta.label}
                </p>
                <div className="flex items-end gap-1.5 h-16">
                  {data.map(item => (
                    <div key={item.year} className="flex-1 flex flex-col items-center gap-0.5">
                      <span className="text-[9px] text-slate-400">{item.count}</span>
                      <div style={{ height: '40px' }} className="w-full flex flex-col justify-end">
                        <div
                          className={`w-full rounded-t ${meta.color} opacity-70`}
                          style={{ height: `${Math.max((item.count / max) * 100, 3)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400">{String(item.year).slice(2)}</span>
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
    <div className={`flex items-start gap-3 rounded-xl p-3 border ${isClosed ? 'opacity-50 border-slate-100 dark:border-slate-800' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'}`}>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">{b.name}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{b.address}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {b.estimatedEntryYear && (
            <span className="text-[11px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-semibold">
              Est. {b.estimatedEntryYear}
            </span>
          )}
          {b.rating && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400">
              ★ {b.rating} ({b.totalRatings})
            </span>
          )}
          {isClosed && (
            <span className="text-[11px] bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-semibold">
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
      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">Local Market Radar</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">4-Source Intelligence</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
          📡 Local Market Radar
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          See how many competitors exist in your city, when they entered, and whether the market is rising or saturating.
          Combines Google Places, MCA21, Udyam MSME data, and GSTN statistics.
        </p>
      </header>

      {/* Search form */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 mb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Business type with autocomplete */}
          <div className="relative lg:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
              Business Type
            </label>
            <input
              type="text"
              value={businessQuery}
              onChange={e => handleBusinessSearch(e.target.value)}
              placeholder="e.g. mushroom farming, bakery, gym…"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {nicSuggestions.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
                {nicSuggestions.map(n => (
                  <button
                    key={n.code}
                    onClick={() => selectNic(n)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-left transition-colors"
                  >
                    <span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{n.label}</span>
                      <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">{n.divisionName}</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0">NIC {n.code}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedNic && (
              <p className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400">
                NIC {selectedNic.code} · {selectedNic.divisionName}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Pune, Bengaluru…"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
              State
            </label>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select state</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Radius: {radius} km</label>
            <input
              type="range" min={5} max={50} step={5} value={radius}
              onChange={e => setRadius(parseInt(e.target.value))}
              className="w-28 accent-indigo-600"
            />
          </div>
          <button
            onClick={analyze}
            disabled={!selectedNic || !city || !state || loading}
            className="ml-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2"
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
        <div className="mb-6 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-4 text-sm text-rose-700 dark:text-rose-400">
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
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                  {result.businessType} in {result.city}, {result.state} ({result.radiusKm}km)
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-4xl font-black ${trend!.cls}`}>
                    {trend!.icon} {result.trend}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{result.trendReason}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 flex-shrink-0">
                {[
                  { label: 'Active Now',   value: result.currentCount,             sub: 'from Places' },
                  { label: 'Closed',       value: result.closedCount,              sub: 'found closed', cls: result.closedCount > 0 ? 'text-rose-600 dark:text-rose-400' : undefined },
                  { label: 'Survival',     value: `${result.survivalRate}%`,       sub: 'still open' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={`text-2xl font-bold ${s.cls ?? 'text-slate-900 dark:text-slate-100'}`}>{s.value}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{s.label}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{s.sub}</p>
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
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors capitalize ${
                  activeTab === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <TrajectoryChart
                  trajectory={result.trajectory}
                  bySource={result.trajectoryBySource}
                />
              </div>

              {/* MCA21 state context */}
              {result.mcaStateSummary && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    🏛️ MCA21 — State-wide ({result.state})
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {result.mcaStateSummary.activeCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Active companies</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                        {result.mcaStateSummary.struckOffCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Struck off (failures)</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {result.mcaStateSummary.survivalRate}%
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Sector survival rate</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {Object.values(result.mcaStateSummary.incorporationsByYear).at(-1)?.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Last year entries</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Source: MCA Annual Report + Company Master Data (NIC division {result.mcaStateSummary.nicDivision})
                  </p>
                </div>
              )}

              {/* GSTIN estimate */}
              {result.gstinEstimate && (
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                    📋 GSTN Statistics
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    ~{result.gstinEstimate.count.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Estimated active GST filers in this sector across {result.gstinEstimate.state}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                    {result.gstinEstimate.note}
                  </p>
                </div>
              )}

              {/* Udyam */}
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                  🏭 Udyam (MSME Registration)
                </p>
                {result.udyamSummary?.source !== 'unavailable' && result.udyamSummary?.totalCount ? (
                  <>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {result.udyamSummary.totalCount.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      {result.udyamSummary.note ?? `Udyam registrations in ${result.udyamSummary.district}`}
                    </p>
                  </>
                ) : (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
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
                <p className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No businesses found from Google Places for this search.
                </p>
              )}
              <p className="mt-4 text-xs text-center text-slate-400 dark:text-slate-500">
                "Est. YYYY" is derived from the oldest Google review date — actual entry is typically 3–12 months earlier.
              </p>
            </div>
          )}

          {/* Tab: Sources */}
          {activeTab === 'sources' && (
            <div className="space-y-4">
              {result.sourcesSummary.map(s => {
                const meta = SOURCE_META[s.source]
                const statusColor = s.status === 'live' ? 'text-emerald-600 dark:text-emerald-400' :
                                    s.status === 'estimated' ? 'text-amber-600 dark:text-amber-400' :
                                    'text-rose-500 dark:text-rose-400'
                const statusLabel = s.status === 'live' ? '● Live' : s.status === 'estimated' ? '◐ Estimated' : '○ Unavailable'
                return (
                  <div key={s.source} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{meta.icon}</span>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{meta.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.description}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</p>
                        {s.count !== undefined && (
                          <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                            {s.count.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 text-xs text-slate-400 dark:text-slate-500">
                <p className="font-semibold text-slate-500 dark:text-slate-400 mb-2">Unlock more data:</p>
                <ul className="space-y-1">
                  <li>• <strong>Udyam district data:</strong> Live via data.gov.in API (preprocessed summary available for major cities)</li>
                  <li>• <strong>MCA21 city-level:</strong> Run <code>node scripts/fetch-mca21.mjs</code> after downloading from mca.gov.in</li>
                  <li>• <strong>GSTN:</strong> No public bulk API available — estimates from published GSTN Annual Statistics</li>
                </ul>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
            Generated in {(result.durationMs / 1000).toFixed(1)}s · {new Date(result.generatedAt).toLocaleString('en-IN')}
          </p>
        </>
      )}
    </div>
  )
}
