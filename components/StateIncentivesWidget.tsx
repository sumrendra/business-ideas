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

const BADGE_CLASS = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'


const TYPE_META: Record<string, { label: string; color: string }> = {
  capital_subsidy:      { label: 'Capital Subsidy',      color: BADGE_CLASS },
  interest_subsidy:     { label: 'Interest Subsidy',     color: BADGE_CLASS },
  startup_grant:        { label: 'Startup Grant',        color: BADGE_CLASS },
  sector_subsidy:       { label: 'Sector Subsidy',       color: BADGE_CLASS },
  employment_subsidy:   { label: 'Employment Subsidy',   color: BADGE_CLASS },
  power_subsidy:        { label: 'Power Subsidy',        color: BADGE_CLASS },
  investment_incentive: { label: 'Investment Incentive', color: BADGE_CLASS },
  revival_support:      { label: 'Revival Support',      color: BADGE_CLASS },
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
          <h2 className="text-xl font-bold text-ink dark:text-slate-100">
            State Business Incentives
          </h2>
          <p className="mt-0.5 text-sm text-ink-soft dark:text-slate-400">
            Capital subsidies, grants &amp; sector incentives available in your state
          </p>
        </div>
        <a
          href="/incentives"
          className="shrink-0 text-xs font-medium text-brand-600 dark:text-indigo-400 hover:underline"
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
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              state === s
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-600'
                : 'border-line dark:border-line-dark text-ink-soft dark:text-slate-400 hover:border-indigo-400 hover:text-brand-600 dark:hover:border-indigo-700 dark:hover:text-indigo-300'
            }`}
          >
            {state === s && (
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.3 3.29 6.79-6.79a1 1 0 0 1 1.41 0Z" clipRule="evenodd" /></svg>
            )}
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-ink-soft dark:text-slate-500">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
          </svg>
          Loading incentives…
        </div>
      )}

      {!loading && !fetched && (
        <p className="py-4 text-sm text-ink-soft dark:text-slate-500">
          Select a state above to see available incentives.
        </p>
      )}

      {!loading && fetched && incentives.length === 0 && (
        <p className="py-4 text-sm text-ink-soft dark:text-slate-500">
          No incentives found for {state}. <a href="/incentives" className="text-brand-600 dark:text-indigo-400 hover:underline">Browse all states →</a>
        </p>
      )}

      {!loading && incentives.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {incentives.map((inc, i) => {
            const meta = TYPE_META[inc.incentive_type] ?? { label: inc.incentive_type, color: BADGE_CLASS }
            return (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-4 transition-shadow hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)]"
              >
                <div className="flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>
                    {meta.label}
                  </span>
                  {inc.sector && inc.sector !== 'All' && (
                    <span className="rounded-full bg-surface-sunk dark:bg-surface-dark-raised px-2.5 py-0.5 text-xs text-ink-soft dark:text-slate-400">
                      {inc.sector}
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-ink dark:text-slate-100 leading-snug">
                  {inc.scheme_name}
                </p>

                {inc.amount_percent && (
                  <p className="text-sm font-bold tabular-nums text-positive">
                    {inc.amount_percent}% subsidy
                  </p>
                )}

                <p className="text-xs text-ink-soft dark:text-slate-400 line-clamp-2">
                  {inc.benefit_desc}
                </p>

                {inc.eligibility && (
                  <div className="rounded-lg bg-surface-sunk dark:bg-surface-dark-raised px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft mb-0.5">Who qualifies</p>
                    <p className="text-xs text-ink-soft dark:text-slate-300 line-clamp-2">{inc.eligibility}</p>
                  </div>
                )}

                {inc.portal_url && (
                  <a
                    href={inc.portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-indigo-400 hover:underline"
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
        <p className="mt-3 text-xs text-ink-soft dark:text-slate-500">
          Source: Official state industrial policies · <a href="/incentives" className="hover:underline">See full incentives database →</a>
        </p>
      )}
    </section>
  )
}
