'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/gap-engine/categories'
import { CITY_RENT_PROFILES } from '@/lib/tools/rent-data'

// Use all cities that have rent profiles (they're the major ones)
const CITIES = CITY_RENT_PROFILES.map(c => ({ id: c.cityId, name: c.cityName }))

interface ScanResult {
  id: string; label: string; icon: string
  demandScore: number; supplyCount: number; multilingualCount: number
  supplyScore: number; gapScore: number
  rating: 'high' | 'medium' | 'low' | 'saturated'
}

const RATING_BAR = {
  high:      { width: '85%', cls: 'bg-emerald-400 dark:bg-emerald-500' },
  medium:    { width: '60%', cls: 'bg-amber-400 dark:bg-amber-500' },
  low:       { width: '35%', cls: 'bg-slate-400 dark:bg-slate-500' },
  saturated: { width: '15%', cls: 'bg-red-400 dark:bg-red-500' },
}

const RATING_STYLE = {
  high:      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  medium:    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  low:       'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  saturated: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
}

function MoatBar({ supply, demand }: { supply: number; demand: number }) {
  const incumbentStrength = Math.min(100, supply)
  const gapOpportunity   = Math.max(0, demand - supply)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
        <span>Incumbent strength</span>
        <span>{incumbentStrength}/100</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full bg-rose-400 dark:bg-rose-500 transition-all duration-500" style={{ width: `${incumbentStrength}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-2">
        <span>Gap opportunity</span>
        <span>{gapOpportunity}/100</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full bg-emerald-400 dark:bg-emerald-500 transition-all duration-500" style={{ width: `${gapOpportunity}%` }} />
      </div>
    </div>
  )
}

function EntryDifficulty({ gapScore }: { gapScore: number }) {
  const difficulty = gapScore >= 40 ? 'Easy' : gapScore >= 20 ? 'Moderate' : gapScore >= 5 ? 'Hard' : 'Very Hard'
  const color = gapScore >= 40 ? 'text-emerald-600 dark:text-emerald-400' : gapScore >= 20 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400'
  const dots = gapScore >= 40 ? 1 : gapScore >= 20 ? 2 : gapScore >= 5 ? 3 : 4
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map(d => (
          <div key={d} className={`w-2 h-2 rounded-full ${d <= dots ? 'bg-current opacity-80' : 'bg-current opacity-20'} ${color}`} />
        ))}
      </div>
      <span className={`text-xs font-semibold ${color}`}>{difficulty} to enter</span>
    </div>
  )
}

export default function CompetitorIntelPage() {
  const [cityId, setCityId]   = useState(CITIES[0].id)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ScanResult[]>([])
  const [city, setCity]       = useState('')
  const [error, setError]     = useState('')
  const [sortBy, setSortBy]   = useState<'gap' | 'supply' | 'demand'>('gap')

  const scan = useCallback(async () => {
    setLoading(true)
    setError('')
    setResults([])
    try {
      const params = new URLSearchParams({ city: cityId, radius: '3000' })
      const res = await fetch(`/api/hyperlocal/scan?${params}`)
      if (!res.ok) throw new Error('Scan failed — check console')
      const data = await res.json()
      setResults(data.results ?? [])
      setCity(data.city ?? cityId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [cityId])

  const sorted = [...results].sort((a, b) => {
    if (sortBy === 'gap')    return b.gapScore - a.gapScore
    if (sortBy === 'supply') return b.supplyCount - a.supplyCount
    return b.demandScore - a.demandScore
  })

  const topOpportunity = sorted.filter(r => r.rating === 'high' || r.rating === 'medium').slice(0, 3)
  const saturated      = sorted.filter(r => r.rating === 'saturated').length

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">Competitor Intelligence</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Competitive Analysis</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">Competitor Intelligence</h1>
        <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
          Scan all 15 business categories in any Indian city simultaneously. See incumbent density, demand strength, gap scores, and entry difficulty — data from Google Trends and Google Maps Places API.
        </p>
      </header>

      {/* Scan control */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Select City</label>
            <select
              value={cityId}
              onChange={e => { setCityId(e.target.value); setResults([]) }}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button
            onClick={scan}
            disabled={loading}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 px-8 text-sm transition-colors whitespace-nowrap"
          >
            {loading ? '⚡ Scanning 15 categories…' : '⚡ Scan All Categories'}
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          Runs 15 parallel scans — takes 15–30 seconds. Uses typed search + multilingual keyword classification + umbrella type matching for accurate supply counts.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      {loading && (
        <div className="py-16 flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm">Fetching Google Trends + Places data for all 15 categories in parallel…</p>
          <p className="text-xs text-slate-400">Usually completes in 20–35 seconds</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          {/* Summary */}
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'City scanned', value: city },
              { label: 'Top opportunities', value: topOpportunity.length.toString() },
              { label: 'Saturated markets', value: saturated.toString() },
              { label: 'Avg gap score', value: Math.round(results.reduce((s, r) => s + r.gapScore, 0) / results.length).toString() },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">{s.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Top picks */}
          {topOpportunity.length > 0 && (
            <div className="mb-8 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/10 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-4">Best Entry Opportunities in {city}</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {topOpportunity.map(r => (
                  <div key={r.id} className="rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/50 p-4">
                    <p className="text-2xl mb-2">{r.icon}</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{r.label}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">Gap Score: {r.gapScore}</p>
                    <EntryDifficulty gapScore={r.gapScore} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sort control */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-slate-400 dark:text-slate-500">Sort by:</span>
            {[
              { key: 'gap',    label: 'Gap Score' },
              { key: 'supply', label: 'Competitor Count' },
              { key: 'demand', label: 'Demand Score' },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key as 'gap' | 'supply' | 'demand')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${sortBy === s.key ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Full results grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map(r => {
              const bar = RATING_BAR[r.rating]
              const multiPct = r.supplyCount > 0 ? Math.round((r.multilingualCount / r.supplyCount) * 100) : 0
              return (
                <div key={r.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{r.icon}</span>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-tight">{r.label}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0 ${RATING_STYLE[r.rating]}`}>
                      {r.rating}
                    </span>
                  </div>

                  {/* Gap bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                      <span>Opportunity</span>
                      <span>Gap: {r.gapScore}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full rounded-full transition-all duration-700 ${bar.cls}`} style={{ width: bar.width }} />
                    </div>
                  </div>

                  <MoatBar supply={r.supplyScore} demand={r.demandScore} />

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{r.demandScore}</p>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Demand</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{r.supplyCount}</p>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Competitors</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{multiPct}%</p>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Local-named</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <EntryDifficulty gapScore={r.gapScore} />
                  </div>

                  <Link
                    href={`/hyperlocal-opportunity?city=${cityId}&category=${r.id}`}
                    className="mt-3 block w-full text-center rounded-lg border border-slate-200 dark:border-slate-700 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    View hex map →
                  </Link>
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
            Supply counts use typed search + 3 text keyword searches + umbrella type with multilingual (Hindi/Tamil/Telugu) classification within 3km radius.
            Demand scores from Google Trends state-level interest, blended with Udyam purchasing power index.
          </p>
        </>
      )}
    </div>
  )
}
