'use client'

import { useState, useCallback } from 'react'
import { CITIES, TIER_LABELS, type PopulationTier } from '@/lib/gap-engine/cities'
import { CATEGORIES } from '@/lib/gap-engine/categories'

interface GapResult {
  city: { id: string; name: string; state: string; tier: string }
  category: { id: string; label: string; icon: string }
  demand: {
    score: number
    trendsScore: number
    purchasingPower: number
    geo: string
    keyword: string
  }
  supply: {
    score: number
    placesCount: number
    placesRadius: number
    udyamDensity: number
    stateCode: string
  }
  gapScore: number
  rating: 'high' | 'medium' | 'low' | 'saturated'
  note: string
}

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1000 },
  { label: '3 km', value: 3000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
]

const RATING_META: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  high:      { label: 'High Opportunity', color: 'text-positive', bg: 'bg-surface dark:bg-surface-dark border-line dark:border-line-dark', desc: 'Strong demand, low supply — a genuine gap exists.' },
  medium:    { label: 'Moderate Opportunity', color: 'text-caution', bg: 'bg-surface dark:bg-surface-dark border-line dark:border-line-dark', desc: 'Demand exceeds supply but competition is growing.' },
  low:       { label: 'Low Gap', color: 'text-ink-soft dark:text-slate-300', bg: 'bg-surface dark:bg-surface-dark border-line dark:border-line-dark', desc: 'Market is reasonably supplied for this demand level.' },
  saturated: { label: 'Saturated', color: 'text-alert', bg: 'bg-surface dark:bg-surface-dark border-line dark:border-line-dark', desc: 'High supply relative to search demand — tough to enter.' },
}

const TIER_ORDER: PopulationTier[] = ['metro', 'tier1', 'tier2', 'tier3']

function ScoreBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-ink-soft dark:text-slate-400 text-right">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-surface-sunk dark:bg-surface-dark-raised overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-xs font-semibold tabular-nums text-ink dark:text-slate-300">{value}</span>
    </div>
  )
}

export default function OpportunityFinder() {
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedRadius, setSelectedRadius] = useState(3000)
  const [result, setResult] = useState<GapResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tierFilter, setTierFilter] = useState<PopulationTier | 'all'>('all')

  const filteredCities = tierFilter === 'all'
    ? CITIES
    : CITIES.filter(c => c.tier === tierFilter)

  const analyze = useCallback(async () => {
    if (!selectedCity || !selectedCategory) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const url = `/api/gap-engine?city=${selectedCity}&category=${selectedCategory}&radius=${selectedRadius}`
      const res = await fetch(url)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      const data: GapResult = await res.json()
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [selectedCity, selectedCategory, selectedRadius])

  const meta = result ? RATING_META[result.rating] : null

  return (
    <div className="space-y-8">

      {/* Controls */}
      <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6 space-y-5">
        <h2 className="text-base font-semibold text-ink dark:text-slate-100">Configure your search</h2>

        {/* City selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink dark:text-slate-300">
            City
          </label>
          {/* Tier filter chips */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(['all', ...TIER_ORDER] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTierFilter(t); setSelectedCity('') }}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                  tierFilter === t
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-600'
                    : 'border-line dark:border-line-dark text-ink-soft dark:text-slate-300 hover:border-indigo-400 hover:text-brand-600'
                }`}
              >
                {tierFilter === t && (
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.3 3.29 6.79-6.79a1 1 0 0 1 1.41 0Z" clipRule="evenodd" /></svg>
                )}
                {t === 'all' ? 'All cities' : TIER_LABELS[t].split(' ')[0]}
              </button>
            ))}
          </div>
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="w-full min-h-[44px] rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised px-3 py-2.5 text-sm text-ink dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="">Select a city…</option>
            {filteredCities.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.state} ({c.tier})
              </option>
            ))}
          </select>
        </div>

        {/* Category selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink dark:text-slate-300">
            Business Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative flex min-h-[44px] flex-col items-center gap-1.5 rounded-md border p-3 text-center text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                    : 'border-line bg-surface-sunk dark:border-line-dark dark:bg-surface-dark-raised text-ink-soft dark:text-slate-300 hover:border-indigo-400'
                }`}
              >
                {selectedCategory === cat.id && (
                  <svg className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-brand-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.3 3.29 6.79-6.79a1 1 0 0 1 1.41 0Z" clipRule="evenodd" /></svg>
                )}
                <span className="text-xl">{cat.icon}</span>
                <span className="leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Radius selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink dark:text-slate-300">
            Search radius <span className="text-ink-soft font-normal">(for supply count)</span>
          </label>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map(r => (
              <button
                key={r.value}
                onClick={() => setSelectedRadius(r.value)}
                className={`inline-flex min-h-[44px] items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium tabular-nums transition-colors ${
                  selectedRadius === r.value
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-600'
                    : 'border-line dark:border-line-dark text-ink-soft dark:text-slate-400 hover:border-indigo-400'
                }`}
              >
                {selectedRadius === r.value && (
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.3 3.29 6.79-6.79a1 1 0 0 1 1.41 0Z" clipRule="evenodd" /></svg>
                )}
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={analyze}
          disabled={!selectedCity || !selectedCategory || loading}
          className="w-full min-h-[44px] rounded-md bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Analysing…' : 'Analyse Opportunity Gap'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-alert bg-surface dark:bg-surface-dark p-4 text-sm text-alert">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6 space-y-4 animate-pulse">
          <div className="h-4 bg-surface-sunk dark:bg-surface-dark-raised rounded w-1/3" />
          <div className="h-3 bg-surface-sunk dark:bg-surface-dark-raised rounded w-2/3" />
          <div className="h-2 bg-surface-sunk dark:bg-surface-dark-raised rounded-full" />
          <div className="h-2 bg-surface-sunk dark:bg-surface-dark-raised rounded-full w-3/4" />
          <div className="h-2 bg-surface-sunk dark:bg-surface-dark-raised rounded-full w-1/2" />
        </div>
      )}

      {/* Results */}
      {result && meta && !loading && (
        <div className="space-y-4">

          {/* Rating card */}
          <div className={`rounded-2xl border p-6 ${meta.bg}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-slate-400 mb-1">
                  {result.city.name}, {result.city.state} · {result.category.icon} {result.category.label}
                </p>
                <p className={`text-2xl font-bold ${meta.color}`}>{meta.label}</p>
                <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">{meta.desc}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-slate-400 mb-0.5">Gap score</p>
                <p className={`text-4xl font-black tabular-nums ${meta.color}`}>{result.gapScore}</p>
                <p className="text-xs text-ink-soft dark:text-slate-500">out of 100</p>
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6 space-y-4">
            <h3 className="text-sm font-semibold text-ink dark:text-slate-100">Score breakdown</h3>
            <ScoreBar value={result.demand.score}  label="Demand"  color="bg-indigo-500" />
            <ScoreBar value={result.supply.score}  label="Supply"  color="bg-amber-500" />
            <ScoreBar value={result.gapScore}       label="Gap"     color="bg-emerald-500" />
          </div>

          {/* Data detail cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5 space-y-2">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-brand-600 dark:text-indigo-400">Demand Signal</p>
              <div className="space-y-1 text-sm text-ink-soft dark:text-slate-300">
                <p><span className="font-medium text-ink dark:text-slate-200">Trends score:</span> <span className="tabular-nums">{result.demand.trendsScore} / 100</span></p>
                <p><span className="font-medium text-ink dark:text-slate-200">Purchasing power:</span> <span className="tabular-nums">{result.demand.purchasingPower} / 100</span></p>
                <p><span className="font-medium text-ink dark:text-slate-200">Region:</span> {result.demand.geo}</p>
                <p className="text-ink-soft dark:text-slate-500 text-xs">Keyword: "{result.demand.keyword}"</p>
              </div>
            </div>

            <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5 space-y-2">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-brand-600 dark:text-indigo-400">Supply Signal</p>
              <div className="space-y-1 text-sm text-ink-soft dark:text-slate-300">
                <p><span className="font-medium text-ink dark:text-slate-200">Nearby businesses:</span> <span className="tabular-nums">{result.supply.placesCount}</span> (within <span className="tabular-nums">{(result.supply.placesRadius / 1000).toFixed(0)} km</span>)</p>
                <p><span className="font-medium text-ink dark:text-slate-200">State MSME density:</span> <span className="tabular-nums">{result.supply.udyamDensity} / 100</span></p>
                <p><span className="font-medium text-ink dark:text-slate-200">State:</span> {result.supply.stateCode}</p>
                <p className="text-ink-soft dark:text-slate-500 text-xs">Via Google Maps + Udyam data</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-ink-soft dark:text-slate-500 text-center px-4">
            {result.note} Google Trends data is at state-level; Places count is within your chosen radius.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-line dark:border-line-dark p-12 text-center">
          <p className="text-3xl mb-3">🗺️</p>
          <p className="text-sm font-medium text-ink-soft dark:text-slate-400">Select a city and category, then click Analyse</p>
          <p className="mt-1 text-xs text-ink-soft dark:text-slate-500">
            We'll cross-reference Google Trends demand with Maps supply data to surface the gap score.
          </p>
        </div>
      )}
    </div>
  )
}
