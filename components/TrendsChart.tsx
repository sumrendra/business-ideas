'use client'

import { useState, useEffect } from 'react'
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
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function direction(values: number[]): { label: 'Growing' | 'Stable' | 'Declining' | 'Seasonal'; arrow: string } {
  if (values.length < 4) return { label: 'Stable', arrow: '→' }
  const recent = values.slice(-6)
  const older  = values.slice(-18, -12)
  const avg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0
  const recentAvg = avg(recent)
  const olderAvg  = avg(older)

  // Check seasonal: high variance but similar year-over-year
  const max = Math.max(...values)
  const min = Math.min(...values.filter(v => v > 0))
  const isVolatile = max > 0 && (max - min) / max > 0.6

  if (isVolatile && Math.abs(recentAvg - olderAvg) / (olderAvg || 1) < 0.3) {
    return { label: 'Seasonal', arrow: '~' }
  }
  if (olderAvg > 0 && recentAvg / olderAvg > 1.2) return { label: 'Growing',  arrow: '↑' }
  if (olderAvg > 0 && recentAvg / olderAvg < 0.8) return { label: 'Declining', arrow: '↓' }
  return { label: 'Stable', arrow: '→' }
}

const DIR_STYLE = {
  Growing:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Stable:    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  Declining: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  Seasonal:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
}

export default function TrendsChart({ keyword, trendsUrl }: Props) {
  const [data, setData]       = useState<TrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`/api/trends?keyword=${encodeURIComponent(keyword)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [keyword])

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden animate-pulse">
        <div className="flex items-center gap-3 px-5 pt-4 pb-2">
          <div className="h-7 w-7 rounded-md bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="ml-auto h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="px-5 pb-3">
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 rounded-sm bg-slate-100 dark:bg-slate-800"
                style={{ height: `${20 + Math.random() * 36}px` }} />
            ))}
          </div>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-2.5 flex gap-5">
          <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    )
  }

  // ── Error / no data state ────────────────────────────────────────────────
  if (error || !data || !data.values.length) {
    return (
      <Link href={trendsUrl} target="_blank" rel="noopener noreferrer"
        className="block rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-6 text-center hover:border-indigo-300 transition-colors">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Not enough search data for this niche in India.{' '}
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">View on Google Trends →</span>
        </p>
      </Link>
    )
  }

  const { bestKeyword, allTried, values, cities } = data
  const max       = Math.max(...values, 1)
  const last12    = values.slice(-12)
  const current   = last12[last12.length - 1] ?? 0
  const yearAgo   = last12[0] ?? 0
  const changePct = yearAgo > 0 ? Math.round(((current - yearAgo) / yearAgo) * 100) : 0
  const { label: dir, arrow } = direction(values)

  // Label every ~6 months for the bar chart
  const now = new Date()
  const monthLabels = values.map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (values.length - 1 - i), 1)
    return { month: MONTHS[d.getMonth()], year: d.getFullYear() }
  })

  const cityMax = cities.length ? Math.max(...cities.map(c => c.value), 1) : 1
  const bestTrendsUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(bestKeyword)}&geo=IN&date=today%205-y`

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/30">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">"{bestKeyword}"</span>
            <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">· India · 5 years</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${DIR_STYLE[dir]}`}>
            {arrow} {dir}
          </span>
          <Link href={bestTrendsUrl} target="_blank" rel="noopener noreferrer"
            className="text-slate-400 hover:text-indigo-500 transition-colors" title="Open in Google Trends">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Bar chart — 5-year monthly */}
      <div className="px-5 pb-1">
        <div className="flex items-end gap-px h-20">
          {values.map((v, i) => {
            const heightPct = Math.max((v / max) * 100, v > 0 ? 3 : 0)
            const isPeak = v === max
            const isRecent = i >= values.length - 6
            return (
              <div key={i} className="flex flex-1 justify-center items-end h-full group/bar relative">
                <div
                  className={`w-full rounded-sm transition-colors ${
                    isPeak   ? 'bg-indigo-500' :
                    isRecent ? 'bg-indigo-400' :
                               'bg-indigo-200 dark:bg-indigo-900/60'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/bar:flex
                  bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10">
                  {v}/100 · {monthLabels[i]?.month} {monthLabels[i]?.year}
                </div>
              </div>
            )
          })}
        </div>
        {/* X-axis: every ~12 bars */}
        <div className="flex gap-px mt-1">
          {monthLabels.map((m, i) => (
            <div key={i} className="flex-1 text-center">
              {i % 12 === 0 && (
                <span className="text-[9px] text-slate-400 dark:text-slate-600">{m.year}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-slate-100 dark:border-slate-800 px-5 py-2.5">
        <div>
          <span className="text-xs text-slate-400">Interest now </span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{current}/100</span>
        </div>
        <div>
          <span className="text-xs text-slate-400">12-month change </span>
          <span className={`text-xs font-bold ${changePct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {changePct >= 0 ? '+' : ''}{changePct}%
          </span>
        </div>
        {allTried.length > 1 && allTried[0] !== bestKeyword && (
          <div className="ml-auto">
            <span className="text-[10px] text-slate-400">
              Best of {allTried.length} variants tried
            </span>
          </div>
        )}
      </div>

      {/* City / state breakdown */}
      {cities.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
            Search demand by state
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {cities.map(c => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 w-24 truncate shrink-0">{c.name}</span>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-indigo-400 dark:bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: `${(c.value / cityMax) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 w-6 text-right shrink-0">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
