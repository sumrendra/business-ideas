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
  high:      { label: 'High Opportunity', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800', desc: 'Strong demand, low supply — a genuine gap exists.' },
  medium:    { label: 'Moderate Opportunity', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', desc: 'Demand exceeds supply but competition is growing.' },
  low:       { label: 'Low Gap', color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700', desc: 'Market is reasonably supplied for this demand level.' },
  saturated: { label: 'Saturated', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800', desc: 'High supply relative to search demand — tough to enter.' },
}

const TIER_ORDER: PopulationTier[] = ['metro', 'tier1', 'tier2', 'tier3']

function ScoreBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-slate-500 dark:text-slate-400 text-right">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-xs font-semibold text-slate-700 dark:text-slate-300">{value}</span>
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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Configure your search</h2>

        {/* City selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            City
          </label>
          {/* Tier filter chips */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(['all', ...TIER_ORDER] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTierFilter(t); setSelectedCity('') }}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  tierFilter === t
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-700'
                }`}
              >
                {t === 'all' ? 'All cities' : TIER_LABELS[t].split(' ')[0]}
              </button>
            ))}
          </div>
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Business Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : `${cat.color} dark:border-slate-700 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-indigo-300`
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Radius selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Search radius <span className="text-slate-400 font-normal">(for supply count)</span>
          </label>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map(r => (
              <button
                key={r.value}
                onClick={() => setSelectedRadius(r.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedRadius === r.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={analyze}
          disabled={!selectedCity || !selectedCategory || loading}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Analysing…' : 'Analyse Opportunity Gap'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4 animate-pulse">
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full" />
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4" />
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2" />
        </div>
      )}

      {/* Results */}
      {result && meta && !loading && (
        <div className="space-y-4">

          {/* Rating card */}
          <div className={`rounded-2xl border p-6 ${meta.bg}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                  {result.city.name}, {result.city.state} · {result.category.icon} {result.category.label}
                </p>
                <p className={`text-2xl font-bold ${meta.color}`}>{meta.label}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{meta.desc}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Gap score</p>
                <p className={`text-4xl font-black ${meta.color}`}>{result.gapScore}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">out of 100</p>
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Score breakdown</h3>
            <ScoreBar value={result.demand.score}  label="Demand"  color="bg-indigo-500" />
            <ScoreBar value={result.supply.score}  label="Supply"  color="bg-rose-400" />
            <ScoreBar value={result.gapScore}       label="Gap"     color="bg-green-500" />
          </div>

          {/* Data detail cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 p-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Demand Signal</p>
              <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <p><span className="font-medium">Trends score:</span> {result.demand.trendsScore} / 100</p>
                <p><span className="font-medium">Purchasing power:</span> {result.demand.purchasingPower} / 100</p>
                <p><span className="font-medium">Region:</span> {result.demand.geo}</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs">Keyword: "{result.demand.keyword}"</p>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 p-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">Supply Signal</p>
              <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <p><span className="font-medium">Nearby businesses:</span> {result.supply.placesCount} (within {(result.supply.placesRadius / 1000).toFixed(0)} km)</p>
                <p><span className="font-medium">State MSME density:</span> {result.supply.udyamDensity} / 100</p>
                <p><span className="font-medium">State:</span> {result.supply.stateCode}</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs">Via Google Maps + Udyam data</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center px-4">
            {result.note} Google Trends data is at state-level; Places count is within your chosen radius.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
          <p className="text-3xl mb-3">🗺️</p>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Select a city and category, then click Analyse</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            We'll cross-reference Google Trends demand with Maps supply data to surface the gap score.
          </p>
        </div>
      )}
    </div>
  )
}
