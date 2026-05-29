'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Props {
  keyword: string
  trendsUrl: string
}

interface TrendsData {
  bestKeyword: string
  allTried: string[]
  values: number[]
  labels: string[]
  cities: { name: string; value: number }[]
  seasonalInsight: string | null
  rateLimited?: boolean
  stale?: boolean
}

type Period = '1y' | '2y' | '5y'

const INDIA_STATES: { code: string; name: string }[] = [
  { code: 'IN-AP', name: 'Andhra Pradesh' },
  { code: 'IN-AR', name: 'Arunachal Pradesh' },
  { code: 'IN-AS', name: 'Assam' },
  { code: 'IN-BR', name: 'Bihar' },
  { code: 'IN-CT', name: 'Chhattisgarh' },
  { code: 'IN-GA', name: 'Goa' },
  { code: 'IN-GJ', name: 'Gujarat' },
  { code: 'IN-HR', name: 'Haryana' },
  { code: 'IN-HP', name: 'Himachal Pradesh' },
  { code: 'IN-JH', name: 'Jharkhand' },
  { code: 'IN-KA', name: 'Karnataka' },
  { code: 'IN-KL', name: 'Kerala' },
  { code: 'IN-MP', name: 'Madhya Pradesh' },
  { code: 'IN-MH', name: 'Maharashtra' },
  { code: 'IN-MN', name: 'Manipur' },
  { code: 'IN-ML', name: 'Meghalaya' },
  { code: 'IN-MZ', name: 'Mizoram' },
  { code: 'IN-NL', name: 'Nagaland' },
  { code: 'IN-OR', name: 'Odisha' },
  { code: 'IN-PB', name: 'Punjab' },
  { code: 'IN-RJ', name: 'Rajasthan' },
  { code: 'IN-SK', name: 'Sikkim' },
  { code: 'IN-TN', name: 'Tamil Nadu' },
  { code: 'IN-TG', name: 'Telangana' },
  { code: 'IN-TR', name: 'Tripura' },
  { code: 'IN-UP', name: 'Uttar Pradesh' },
  { code: 'IN-UT', name: 'Uttarakhand' },
  { code: 'IN-WB', name: 'West Bengal' },
  { code: 'IN-DL', name: 'Delhi' },
]

function direction(values: number[]): { label: 'Growing' | 'Stable' | 'Declining' | 'Seasonal'; arrow: string } {
  if (values.length < 4) return { label: 'Stable', arrow: '→' }
  const recent = values.slice(-6)
  const older  = values.slice(-18, -12)
  const avg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0
  const recentAvg = avg(recent)
  const olderAvg  = avg(older)
  const max = Math.max(...values)
  const min = Math.min(...values.filter(v => v > 0))
  const isVolatile = max > 0 && (max - min) / max > 0.6
  if (isVolatile && Math.abs(recentAvg - olderAvg) / (olderAvg || 1) < 0.3) return { label: 'Seasonal', arrow: '~' }
  if (olderAvg > 0 && recentAvg / olderAvg > 1.2) return { label: 'Growing',  arrow: '↑' }
  if (olderAvg > 0 && recentAvg / olderAvg < 0.8) return { label: 'Declining', arrow: '↓' }
  return { label: 'Stable', arrow: '→' }
}

const DIR_STYLE = {
  Growing:   'bg-positive/10 text-positive',
  Stable:    'bg-brand-600/10 text-brand-600',
  Declining: 'bg-alert/10 text-alert',
  Seasonal:  'bg-caution/10 text-caution',
}

function LineChart({ values, labels }: { values: number[]; labels: string[] }) {
  const W = 600
  const H = 80
  const PAD = { top: 6, right: 4, bottom: 4, left: 4 }
  const max = Math.max(...values, 1)
  const n = values.length

  if (n < 2) return null

  const x = (i: number) => PAD.left + (i / (n - 1)) * (W - PAD.left - PAD.right)
  const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom)

  // Build smooth SVG path using cubic bezier
  let d = `M ${x(0)} ${y(values[0])}`
  for (let i = 1; i < n; i++) {
    const cpx = (x(i - 1) + x(i)) / 2
    d += ` C ${cpx} ${y(values[i - 1])}, ${cpx} ${y(values[i])}, ${x(i)} ${y(values[i])}`
  }

  // Area fill path
  const area = `${d} L ${x(n - 1)} ${H} L ${x(0)} ${H} Z`

  // Peak index
  const peakIdx = values.indexOf(Math.max(...values))

  // Tick marks: every 12 points
  const ticks: number[] = []
  for (let i = 0; i < n; i++) { if (i % 12 === 0) ticks.push(i) }

  return (
    <div className="relative w-full" style={{ paddingBottom: '14%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Area */}
        <path d={area} fill="url(#trendGrad)" />
        {/* Line */}
        <path d={d} fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {/* Peak dot */}
        <circle cx={x(peakIdx)} cy={y(values[peakIdx])} r="3" fill="#6366f1" vectorEffect="non-scaling-stroke" />
        {/* Hover targets */}
        {values.map((v, i) => (
          <g key={i} className="group/pt">
            <line x1={x(i)} y1={PAD.top} x2={x(i)} y2={H - PAD.bottom}
              stroke="transparent" strokeWidth="12" className="cursor-crosshair" />
            <circle cx={x(i)} cy={y(v)} r="3.5" fill="#6366f1"
              className="opacity-0 group-hover/pt:opacity-100 transition-opacity" vectorEffect="non-scaling-stroke" />
            <foreignObject
              x={Math.min(x(i) - 36, W - 80)} y={y(v) - 34}
              width="80" height="26"
              className="opacity-0 group-hover/pt:opacity-100 pointer-events-none transition-opacity overflow-visible"
            >
              <div className="bg-ink dark:bg-surface-dark-raised text-paper dark:text-paper-dark text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap w-fit tabular-nums">
                {v}/100 · {labels[i]}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>
      {/* Year axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex pointer-events-none" style={{ height: '14%' }}>
        {values.map((_, i) => (
          <div key={i} className="flex-1 flex justify-center">
            {i % 12 === 0 && (
              <span className="text-[9px] text-ink-soft/60 dark:text-paper-dark/40 leading-none tabular-nums">
                {labels[i]?.split(' ')[1]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TrendsChart({ keyword, trendsUrl }: Props) {
  const [data, setData]       = useState<TrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [period, setPeriod]   = useState<Period>('5y')
  const [geo, setGeo]         = useState('IN')

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    setData(null)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 35000)
    const params = new URLSearchParams({ keyword, geo, period })
    fetch(`/api/trends?${params}`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
      .finally(() => clearTimeout(timer))
    return () => { controller.abort(); clearTimeout(timer) }
  }, [keyword, geo, period, retryKey])

  useEffect(() => {
    return load()
  }, [load])

  const geoLabel = geo === 'IN' ? 'India' : (INDIA_STATES.find(s => s.code === geo)?.name ?? geo)
  const locationLabel = geo === 'IN' ? 'India' : `${geoLabel} · 5 yrs`
  const cleanKeyword = keyword.replace(/\s+india\s*$/i, '').trim()
  const fallbackTrendsUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(cleanKeyword)}&geo=${geo}&date=today%205-y`

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark overflow-hidden animate-pulse">
        <div className="flex items-center gap-3 px-5 pt-4 pb-2">
          <div className="h-7 w-7 rounded-md bg-surface-sunk dark:bg-surface-dark-raised" />
          <div className="h-4 w-48 rounded bg-surface-sunk dark:bg-surface-dark-raised" />
          <div className="ml-auto h-6 w-20 rounded-full bg-surface-sunk dark:bg-surface-dark-raised" />
        </div>
        <div className="px-5 pb-4">
          <div className="w-full bg-surface-sunk dark:bg-surface-dark-raised rounded" style={{ height: 80 }} />
        </div>
        <div className="border-t border-line dark:border-line-dark px-5 py-2.5 flex gap-5">
          <div className="h-3 w-24 rounded bg-surface-sunk dark:bg-surface-dark-raised" />
          <div className="h-3 w-24 rounded bg-surface-sunk dark:bg-surface-dark-raised" />
        </div>
      </div>
    )
  }

  // ── Error / no data state ────────────────────────────────────────────────
  if (error || !data || !data.values.length || data.rateLimited) {
    return (
      <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-3 flex-wrap">
          <GeoSelector geo={geo} setGeo={setGeo} />
          <div className="ml-auto">
            <PeriodSelector period={period} setPeriod={setPeriod} />
          </div>
        </div>
        <div className="px-5 pb-6 text-center space-y-3">
          <p className="text-sm text-ink-soft dark:text-paper-dark/70">
            {(error || data?.rateLimited)
              ? 'Google Trends is temporarily rate-limited.'
              : `Not enough search data for ${geoLabel}.`}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setRetryKey(k => k + 1)}
              className="rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 min-h-[44px] sm:min-h-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-dark"
            >
              Retry
            </button>
            <Link href={fallbackTrendsUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-brand-600 dark:text-brand-600 font-semibold hover:underline">
              View on Google Trends →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { bestKeyword, allTried, values, labels, cities, seasonalInsight, stale } = data
  const max        = Math.max(...values, 1)
  const last12     = values.slice(-12)
  const current    = last12[last12.length - 1] ?? 0
  const yearAgo    = last12[0] ?? 0
  const changePct  = yearAgo > 0 ? Math.round(((current - yearAgo) / yearAgo) * 100) : 0
  const { label: dir, arrow } = direction(values)
  const cityMax    = cities.length ? Math.max(...cities.map(c => c.value), 1) : 1
  const bestTrendsUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(bestKeyword)}&geo=${geo}&date=today%205-y`
  const regionLabel = geo === 'IN' ? 'Search demand by state' : 'Search demand by city'

  return (
    <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark overflow-hidden">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-sunk dark:bg-surface-dark-raised">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-ink dark:text-paper-dark truncate">"{bestKeyword}"</span>
            <span className="ml-1.5 text-xs text-ink-soft/70 dark:text-paper-dark/50">· {locationLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${DIR_STYLE[dir]}`}>
            {arrow} {dir}
          </span>
          <Link href={bestTrendsUrl} target="_blank" rel="noopener noreferrer"
            className="text-ink-soft/60 dark:text-paper-dark/50 hover:text-brand-600 transition-colors" title="Open in Google Trends">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 px-5 pb-3 flex-wrap">
        <GeoSelector geo={geo} setGeo={setGeo} />
        <div className="ml-auto">
          <PeriodSelector period={period} setPeriod={setPeriod} />
        </div>
      </div>

      {/* Line chart */}
      <div className="px-5 pb-2">
        <LineChart values={values} labels={labels} />
      </div>

      {/* Seasonal insight */}
      {seasonalInsight && (
        <div className="mx-5 mb-3 flex items-start gap-2 rounded-lg bg-caution/10 border border-caution/30 px-3 py-2">
          <span className="text-caution text-sm mt-px shrink-0">◐</span>
          <p className="text-xs text-caution leading-snug">{seasonalInsight}</p>
        </div>
      )}

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line dark:border-line-dark px-5 py-2.5">
        <div>
          <span className="text-xs text-ink-soft/70 dark:text-paper-dark/50">Interest now </span>
          <span className="text-xs font-bold text-ink dark:text-paper-dark tabular-nums">{current}/100</span>
        </div>
        <div>
          <span className="text-xs text-ink-soft/70 dark:text-paper-dark/50">12-month change </span>
          <span className={`text-xs font-bold tabular-nums ${changePct >= 0 ? 'text-positive' : 'text-alert'}`}>
            {changePct >= 0 ? '+' : ''}{changePct}%
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {stale && (
            <span className="text-[10px] text-caution bg-caution/10 border border-caution/30 rounded-full px-2 py-0.5">
              cached · live unavailable
            </span>
          )}
          {allTried.length > 1 && allTried[0] !== bestKeyword && (
            <span className="text-[10px] text-ink-soft/60 dark:text-paper-dark/40 tabular-nums">Best of {allTried.length} variants</span>
          )}
        </div>
      </div>

      {/* Regional breakdown */}
      {cities.length > 0 && (
        <div className="border-t border-line dark:border-line-dark px-5 py-3">
          <p className="text-[11px] font-bold text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-[0.12em] mb-2">
            {regionLabel}
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {cities.map(c => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="text-xs text-ink-soft dark:text-paper-dark/70 w-24 truncate shrink-0">{c.name}</span>
                <div className="flex-1 bg-surface-sunk dark:bg-surface-dark-raised rounded-full h-1.5">
                  <div className="bg-brand-600 h-1.5 rounded-full"
                    style={{ width: `${(c.value / cityMax) * 100}%` }} />
                </div>
                <span className="text-[10px] text-ink-soft/70 dark:text-paper-dark/50 w-6 text-right shrink-0 tabular-nums">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GeoSelector({ geo, setGeo }: { geo: string; setGeo: (g: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft/70 dark:text-paper-dark/50">Region</span>
      <select
        value={geo}
        onChange={e => setGeo(e.target.value)}
        className="rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised px-2 py-1.5 text-xs text-ink dark:text-paper-dark focus:outline-none focus:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/40"
      >
        <option value="IN">All India</option>
        <optgroup label="States">
          {INDIA_STATES.map(s => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </optgroup>
      </select>
    </label>
  )
}

function PeriodSelector({ period, setPeriod }: { period: Period; setPeriod: (p: Period) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft/70 dark:text-paper-dark/50">Period</span>
      <div className="flex rounded-md border border-line dark:border-line-dark overflow-hidden text-xs">
        {(['1y', '2y', '5y'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 font-semibold tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600 ${
              period === p
                ? 'bg-brand-600 text-white'
                : 'bg-surface dark:bg-surface-dark-raised text-ink-soft dark:text-paper-dark/70 hover:bg-surface-sunk dark:hover:bg-line-dark'
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>
    </label>
  )
}
