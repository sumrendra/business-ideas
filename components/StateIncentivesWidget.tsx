'use client'

import { useState, useEffect, useCallback } from 'react'

interface NeonIncentive {
  state: string
  scheme_name: string
  incentive_type: string
  sector: string
  benefit_desc: string
  eligibility: string
  amount_percent: number | null
  portal_url: string | null
  source: string | null
}

const TYPE_META: Record<string, { label: string; color: string }> = {
  capital_subsidy:      { label: 'Capital Subsidy',      color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  interest_subsidy:     { label: 'Interest Subsidy',     color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  startup_grant:        { label: 'Startup Grant',        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  sector_subsidy:       { label: 'Sector Subsidy',       color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  employment_subsidy:   { label: 'Employment Subsidy',   color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  power_subsidy:        { label: 'Power Subsidy',        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  investment_incentive: { label: 'Investment Incentive', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  revival_support:      { label: 'Revival Support',      color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
}

const STATES = [
  'Gujarat', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Karnataka',
  'Uttar Pradesh', 'Madhya Pradesh', 'Telangana', 'Punjab', 'Haryana',
  'Andhra Pradesh',
]

export default function StateIncentivesWidget({
  industry,
  defaultState = '',
}: {
  industry?: string
  defaultState?: string
}) {
  const [state, setState] = useState(defaultState)
  const [incentives, setIncentives] = useState<NeonIncentive[]>([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  const fetchIncentives = useCallback(async (s: string) => {
    if (!s) { setIncentives([]); setFetched(false); return }
    setLoading(true)
    try {
      const params = new URLSearchParams({ state: s, limit: '6' })
      if (industry) params.set('industry', industry)
      const res = await fetch(`/api/neon-incentives?${params}`)
      const data = await res.json()
      setIncentives(data.incentives ?? [])
      setFetched(true)
    } catch {
      setIncentives([])
    } finally {
      setLoading(false)
    }
  }, [industry])

  useEffect(() => {
    if (defaultState) fetchIncentives(defaultState)
  }, [defaultState, fetchIncentives])

  const handleStateChange = (s: string) => {
    setState(s)
    fetchIncentives(s)
  }

  return (
    <section className="mb-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            State Business Incentives
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Capital subsidies, grants &amp; sector incentives available in your state
          </p>
        </div>
        <a
          href="/incentives"
          className="shrink-0 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View all incentives →
        </a>
      </div>

      {/* State picker */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATES.map(s => (
          <button
            key={s}
            onClick={() => handleStateChange(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              state === s
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-700 dark:hover:text-indigo-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-slate-400 dark:text-slate-500">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
          </svg>
          Loading incentives…
        </div>
      )}

      {!loading && !fetched && (
        <p className="py-4 text-sm text-slate-400 dark:text-slate-500">
          Select a state above to see available incentives.
        </p>
      )}

      {!loading && fetched && incentives.length === 0 && (
        <p className="py-4 text-sm text-slate-400 dark:text-slate-500">
          No incentives found for {state}. <a href="/incentives" className="text-indigo-600 dark:text-indigo-400 hover:underline">Browse all states →</a>
        </p>
      )}

      {!loading && incentives.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {incentives.map((inc, i) => {
            const meta = TYPE_META[inc.incentive_type] ?? { label: inc.incentive_type, color: 'bg-slate-100 text-slate-600' }
            return (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
              >
                <div className="flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>
                    {meta.label}
                  </span>
                  {inc.sector && inc.sector !== 'All' && (
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {inc.sector}
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  {inc.scheme_name}
                </p>

                {inc.amount_percent && (
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">
                    {inc.amount_percent}% subsidy
                  </p>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {inc.benefit_desc}
                </p>

                {inc.eligibility && (
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">Who qualifies</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{inc.eligibility}</p>
                  </div>
                )}

                {inc.portal_url && (
                  <a
                    href={inc.portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Apply on portal ↗
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!loading && incentives.length > 0 && (
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          Source: Official state industrial policies · <a href="/incentives" className="hover:underline">See full incentives database →</a>
        </p>
      )}
    </section>
  )
}
