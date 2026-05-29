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
  high:      { width: '85%', cls: 'bg-positive' },
  medium:    { width: '60%', cls: 'bg-caution' },
  low:       { width: '35%', cls: 'bg-ink-soft/50 dark:bg-paper-dark/40' },
  saturated: { width: '15%', cls: 'bg-alert' },
}

const RATING_STYLE = {
  high:      'bg-positive/10 text-positive',
  medium:    'bg-caution/10 text-caution',
  low:       'bg-surface-sunk text-ink-soft dark:bg-surface-dark-raised dark:text-paper-dark/70',
  saturated: 'bg-alert/10 text-alert',
}

function MoatBar({ supply, demand }: { supply: number; demand: number }) {
  const incumbentStrength = Math.min(100, supply)
  const gapOpportunity   = Math.max(0, demand - supply)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] text-ink-soft/70 dark:text-paper-dark/50">
        <span>Incumbent strength</span>
        <span className="tabular-nums">{incumbentStrength}/100</span>
      </div>
      <div className="h-2 rounded-full bg-surface-sunk dark:bg-line-dark">
        <div className="h-full rounded-full bg-alert transition-all duration-500" style={{ width: `${incumbentStrength}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-ink-soft/70 dark:text-paper-dark/50 mt-2">
        <span>Gap opportunity</span>
        <span className="tabular-nums">{gapOpportunity}/100</span>
      </div>
      <div className="h-2 rounded-full bg-surface-sunk dark:bg-line-dark">
        <div className="h-full rounded-full bg-positive transition-all duration-500" style={{ width: `${gapOpportunity}%` }} />
      </div>
    </div>
  )
}

function EntryDifficulty({ gapScore }: { gapScore: number }) {
  const difficulty = gapScore >= 40 ? 'Easy' : gapScore >= 20 ? 'Moderate' : gapScore >= 5 ? 'Hard' : 'Very Hard'
  const color = gapScore >= 40 ? 'text-positive' : gapScore >= 20 ? 'text-caution' : 'text-alert'
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
      <nav className="mb-6 text-sm text-ink-soft dark:text-paper-dark/60">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-brand-600 dark:hover:text-brand-600">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-ink dark:text-paper-dark">Competitor Intelligence</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-600">Competitive Analysis</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-ink dark:text-paper-dark">Competitor Intelligence</h1>
        <p className="mt-2 max-w-2xl text-ink-soft dark:text-paper-dark/70">
          Scan all 15 business categories in any Indian city simultaneously. See incumbent density, demand strength, gap scores, and entry difficulty — data from Google Trends and Google Maps Places API.
        </p>
      </header>

      {/* Scan control */}
      <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60 mb-2">Select City</label>
            <select
              value={cityId}
              onChange={e => { setCityId(e.target.value); setResults([]) }}
              className="w-full rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised px-3 py-2.5 min-h-[44px] text-sm text-ink dark:text-paper-dark focus:outline-none focus:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/40"
            >
              {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button
            onClick={scan}
            disabled={loading}
            className="rounded-md bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2.5 px-8 min-h-[44px] text-sm transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-dark"
          >
            {loading ? '⚡ Scanning 15 categories…' : '⚡ Scan All Categories'}
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-soft/70 dark:text-paper-dark/50 tabular-nums">
          Runs 15 parallel scans — takes 15–30 seconds. Uses typed search + multilingual keyword classification + umbrella type matching for accurate supply counts.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-alert/30 bg-alert/10 p-4 text-sm text-alert">{error}</div>
      )}

      {loading && (
        <div className="py-16 flex flex-col items-center gap-4 text-ink-soft dark:text-paper-dark/60">
          <div className="w-10 h-10 border-4 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-sm">Fetching Google Trends + Places data for all 15 categories in parallel…</p>
          <p className="text-xs text-ink-soft/70 dark:text-paper-dark/50 tabular-nums">Usually completes in 20–35 seconds</p>
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
              <div key={s.label} className="rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft/70 dark:text-paper-dark/50">{s.label}</p>
                <p className="mt-1 text-xl font-bold text-ink dark:text-paper-dark truncate tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Top picks */}
          {topOpportunity.length > 0 && (
            <div className="mb-8 rounded-2xl border border-positive/30 bg-positive/[0.06] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-positive mb-4">Best Entry Opportunities in {city}</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {topOpportunity.map(r => (
                  <div key={r.id} className="rounded-xl bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-4">
                    <p className="text-2xl mb-2">{r.icon}</p>
                    <p className="font-bold text-ink dark:text-paper-dark text-sm">{r.label}</p>
                    <p className="text-xs text-positive mt-1 font-semibold tabular-nums">Gap Score: {r.gapScore}</p>
                    <EntryDifficulty gapScore={r.gapScore} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sort control */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-[0.12em]">Sort by:</span>
            {[
              { key: 'gap',    label: 'Gap Score' },
              { key: 'supply', label: 'Competitor Count' },
              { key: 'demand', label: 'Demand Score' },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key as 'gap' | 'supply' | 'demand')}
                className={`text-xs px-3 py-2 min-h-[44px] rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${sortBy === s.key ? 'bg-brand-600/10 text-brand-600' : 'text-ink-soft dark:text-paper-dark/60 hover:text-ink dark:hover:text-paper-dark'}`}
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
                <div key={r.id} className="rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5 transition-shadow hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)]">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{r.icon}</span>
                      <p className="font-semibold text-sm text-ink dark:text-slate-200 leading-tight">{r.label}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0 ${RATING_STYLE[r.rating]}`}>
                      {r.rating}
                    </span>
                  </div>

                  {/* Gap bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-ink-soft dark:text-slate-500 mb-1">
                      <span>Opportunity</span>
                      <span>Gap: <span className="tabular-nums">{r.gapScore}</span>/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-sunk dark:bg-surface-dark-raised">
                      <div className={`h-full rounded-full transition-all duration-700 ${bar.cls}`} style={{ width: bar.width }} />
                    </div>
                  </div>

                  <MoatBar supply={r.supplyScore} demand={r.demandScore} />

                  <div className="mt-4 pt-3 border-t border-line dark:border-line-dark grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-ink dark:text-slate-100 tabular-nums">{r.demandScore}</p>
                      <p className="text-[9px] uppercase tracking-wider text-ink-soft dark:text-slate-500">Demand</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-ink dark:text-slate-100 tabular-nums">{r.supplyCount}</p>
                      <p className="text-[9px] uppercase tracking-wider text-ink-soft dark:text-slate-500">Competitors</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-ink dark:text-slate-100 tabular-nums">{multiPct}%</p>
                      <p className="text-[9px] uppercase tracking-wider text-ink-soft dark:text-slate-500">Local-named</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <EntryDifficulty gapScore={r.gapScore} />
                  </div>

                  <Link
                    href={`/hyperlocal-opportunity?city=${cityId}&category=${r.id}`}
                    className="mt-3 block w-full text-center rounded-lg border border-line dark:border-line-dark py-1.5 text-xs font-medium text-ink-soft dark:text-slate-400 hover:border-brand-600 hover:text-brand-600 dark:hover:border-brand-500 dark:hover:text-brand-500 transition-colors"
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
