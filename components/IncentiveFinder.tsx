'use client'

import { useState, useMemo } from 'react'
import {
  INCENTIVES, ALL_STATES, TYPE_META, SIZE_META,
  type Incentive, type IncentiveType, type EnterpriseSizeKey,
} from '@/lib/incentives'

const STATE_REGIONS: Record<string, string[]> = {
  'West & South-West':  ['Maharashtra', 'Gujarat', 'Goa'],
  'South':              ['Karnataka', 'Tamil Nadu', 'Telangana', 'Andhra Pradesh', 'Kerala'],
  'North':              ['Uttar Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Delhi', 'Himachal Pradesh', 'Uttarakhand'],
  'Central':            ['Madhya Pradesh', 'Chhattisgarh'],
  'East':               ['West Bengal', 'Bihar', 'Jharkhand', 'Odisha'],
  'North-East':         ['Assam'],
}

const ALL_TYPES = Object.keys(TYPE_META) as IncentiveType[]
const ALL_SIZES = Object.keys(SIZE_META) as EnterpriseSizeKey[]

function IncentiveCard({ incentive: i }: { incentive: Incentive }) {
  const type = TYPE_META[i.type]
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
      {/* Type badge + special tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${type.color}`}>
          {type.icon} {type.label}
        </span>
        {i.newOnly && (
          <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">New units only</span>
        )}
        {i.forWomen && (
          <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">👩 Women</span>
        )}
        {i.forScSt && (
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">SC/ST</span>
        )}
      </div>

      {/* Name + amount */}
      <div>
        <p className="font-semibold text-slate-900 dark:text-slate-100">{i.name}</p>
        <p className="mt-0.5 text-sm font-medium text-green-700 dark:text-green-400">{i.amount}</p>
      </div>

      {/* Eligibility */}
      <div className="rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Who qualifies</p>
        <p className="text-xs text-slate-600 dark:text-slate-300">{i.eligibility}</p>
      </div>

      {/* Duration + sizes */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Duration</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">{i.duration}</p>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {i.enterpriseSize.map(s => (
            <span key={s} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${SIZE_META[s].color}`}>
              {SIZE_META[s].label}
            </span>
          ))}
        </div>
      </div>

      {/* Policy + link */}
      <div className="flex items-end justify-between gap-2 mt-auto pt-1 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic truncate">{i.policyName}</p>
        <a
          href={i.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
        >
          View policy ↗
        </a>
      </div>
    </div>
  )
}

export default function IncentiveFinder() {
  const [selectedState, setSelectedState] = useState<string>('')
  const [selectedTypes, setSelectedTypes] = useState<Set<IncentiveType>>(new Set())
  const [selectedSizes, setSelectedSizes] = useState<Set<EnterpriseSizeKey>>(new Set())
  const [forWomen, setForWomen] = useState(false)
  const [forScSt, setForScSt] = useState(false)
  const [newOnly, setNewOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'state' | 'type'>('state')
  const [showFilters, setShowFilters] = useState(true)

  const toggleType = (t: IncentiveType) =>
    setSelectedTypes(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n })

  const toggleSize = (s: EnterpriseSizeKey) =>
    setSelectedSizes(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n })

  const filtered = useMemo(() => {
    let results = INCENTIVES.filter(i => {
      if (selectedState && i.state !== selectedState) return false
      if (selectedTypes.size > 0 && !selectedTypes.has(i.type)) return false
      if (selectedSizes.size > 0 && !i.enterpriseSize.some(s => selectedSizes.has(s))) return false
      if (forWomen && !i.forWomen) return false
      if (forScSt && !i.forScSt) return false
      if (newOnly && !i.newOnly) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (
          !i.name.toLowerCase().includes(q) &&
          !i.amount.toLowerCase().includes(q) &&
          !i.eligibility.toLowerCase().includes(q) &&
          !i.state.toLowerCase().includes(q) &&
          !i.policyName.toLowerCase().includes(q)
        ) return false
      }
      return true
    })

    if (sortBy === 'state') {
      results = [...results].sort((a, b) => a.state.localeCompare(b.state))
    } else {
      results = [...results].sort((a, b) => a.type.localeCompare(b.type))
    }
    return results
  }, [selectedState, selectedTypes, selectedSizes, forWomen, forScSt, newOnly, search, sortBy])

  // Group by state for display
  const grouped = useMemo(() => {
    if (sortBy !== 'state') return null
    const map = new Map<string, Incentive[]>()
    for (const i of filtered) {
      if (!map.has(i.state)) map.set(i.state, [])
      map.get(i.state)!.push(i)
    }
    return map
  }, [filtered, sortBy])

  const activeFilterCount = [
    selectedState ? 1 : 0,
    selectedTypes.size,
    selectedSizes.size,
    forWomen ? 1 : 0,
    forScSt ? 1 : 0,
    newOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  function clearAll() {
    setSelectedState('')
    setSelectedTypes(new Set())
    setSelectedSizes(new Set())
    setForWomen(false)
    setForScSt(false)
    setNewOnly(false)
    setSearch('')
  }

  return (
    <div>
      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'States Covered', value: ALL_STATES.length },
          { label: 'Total Incentives', value: INCENTIVES.length },
          { label: 'Incentive Types', value: ALL_TYPES.length },
          { label: 'Women-specific', value: INCENTIVES.filter(i => i.forWomen).length },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{s.value}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── State selector ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Select a State</p>
          {selectedState && (
            <button onClick={() => setSelectedState('')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              Clear selection
            </button>
          )}
        </div>
        <div className="space-y-3">
          {Object.entries(STATE_REGIONS).map(([region, states]) => {
            const availableStates = states.filter(st => ALL_STATES.includes(st))
            if (availableStates.length === 0) return null
            return (
              <div key={region}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{region}</p>
                <div className="flex flex-wrap gap-2">
                  {availableStates.map(st => {
                    const count = INCENTIVES.filter(i => i.state === st).length
                    return (
                      <button
                        key={st}
                        onClick={() => setSelectedState(prev => prev === st ? '' : st)}
                        className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                          selectedState === st
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                        }`}
                      >
                        {st}
                        <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                          selectedState === st ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Search + filter toggle ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by incentive name, amount, state, or policy…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              showFilters
                ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2" />
            </svg>
            Filters {activeFilterCount > 0 && <span className="rounded-full bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5">{activeFilterCount}</span>}
          </button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="state">Group by State</option>
            <option value="type">Group by Type</option>
          </select>
        </div>
      </div>

      {/* ── Filter panel ───────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 mb-5 space-y-5">

          {/* Incentive type */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Incentive Type</p>
            <div className="flex flex-wrap gap-2">
              {ALL_TYPES.map(t => {
                const meta = TYPE_META[t]
                return (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedTypes.has(t) ? meta.color : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {meta.icon} {meta.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Enterprise size */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Enterprise Size</p>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map(s => {
                const meta = SIZE_META[s]
                return (
                  <button
                    key={s}
                    onClick={() => toggleSize(s)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                      selectedSizes.has(s) ? meta.color : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {meta.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Special category + new-only */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Special Filters</p>
            <div className="flex flex-wrap gap-4">
              {[
                { label: '👩 For Women entrepreneurs',    state: forWomen, setter: setForWomen },
                { label: '🔵 For SC/ST entrepreneurs',   state: forScSt,  setter: setForScSt },
                { label: '🌱 New businesses only',        state: newOnly,  setter: setNewOnly },
              ].map(({ label, state, setter }) => (
                <label key={label} className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={state} onChange={e => setter(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-indigo-600" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button onClick={clearAll} className="text-xs font-medium text-rose-500 hover:underline">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Results count ──────────────────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{filtered.length}</span>
          {' '}of {INCENTIVES.length} incentives
          {selectedState && <span className="ml-1 font-semibold text-indigo-600 dark:text-indigo-400">in {selectedState}</span>}
        </p>
        {filtered.length !== INCENTIVES.length && (
          <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:underline">
            Show all
          </button>
        )}
      </div>

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 py-16 text-center">
          <p className="text-slate-400 dark:text-slate-500">No incentives match your filters.</p>
          <button onClick={clearAll} className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Clear filters</button>
        </div>
      ) : grouped ? (
        <div className="space-y-10">
          {[...grouped.entries()].map(([state, items]) => (
            <div key={state}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{state}</h3>
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  {items.length} incentive{items.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(i => <IncentiveCard key={i.id} incentive={i} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(i => <IncentiveCard key={i.id} incentive={i} />)}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-10 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          <strong>Note:</strong> Incentive details are based on publicly available policy documents and may change. Verify eligibility and current terms with the respective State Industries Department or DIC before applying. Zone/district-specific rates may vary.
        </p>
      </div>
    </div>
  )
}
