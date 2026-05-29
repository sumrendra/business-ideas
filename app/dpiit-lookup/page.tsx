'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { STARTUPS, ALL_SECTORS, ALL_STATES, type DPIITStartup, type FundingStage } from '@/lib/dpiit/startups'

// One Voice Rule: funding stage is a neutral label, not a decorative hue.
// "Listed" is the one earned-positive milestone.
const NEUTRAL_STAGE = 'bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-slate-400'
const STAGE_COLORS: Record<FundingStage, string> = {
  'Bootstrapped': NEUTRAL_STAGE,
  'Angel':        NEUTRAL_STAGE,
  'Pre-Seed':     NEUTRAL_STAGE,
  'Seed':         NEUTRAL_STAGE,
  'Series A':     NEUTRAL_STAGE,
  'Series B':     NEUTRAL_STAGE,
  'Series C':     NEUTRAL_STAGE,
  'Series D+':    NEUTRAL_STAGE,
  'Series E':     NEUTRAL_STAGE,
  'Series F':     NEUTRAL_STAGE,
  'Series G':     NEUTRAL_STAGE,
  'Listed':       'bg-surface-sunk dark:bg-surface-dark-raised text-positive',
}

const STAGE_ORDER: FundingStage[] = ['Bootstrapped', 'Angel', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Series E', 'Series F', 'Series G', 'Listed']

export default function DPIITLookupPage() {
  const [query, setQuery]   = useState('')
  const [sector, setSector] = useState('')
  const [state, setState]   = useState('')
  const [stage, setStage]   = useState('')
  const [sort, setSort]     = useState<'name' | 'year' | 'funding'>('year')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    let list = STARTUPS.filter(s => {
      const matchQ = !q || s.name.toLowerCase().includes(q) ||
                     s.subSector.toLowerCase().includes(q) ||
                     s.city.toLowerCase().includes(q)
      const matchSector = !sector || s.sector === sector
      const matchState  = !state  || s.state === state
      const matchStage  = !stage  || s.fundingStage === stage
      return matchQ && matchSector && matchState && matchStage
    })

    list = [...list].sort((a, b) => {
      if (sort === 'name')    return a.name.localeCompare(b.name)
      if (sort === 'year')    return b.registrationYear - a.registrationYear
      if (sort === 'funding') return (STAGE_ORDER.indexOf(b.fundingStage ?? 'Bootstrapped') - STAGE_ORDER.indexOf(a.fundingStage ?? 'Bootstrapped'))
      return 0
    })

    return list
  }, [query, sector, state, stage, sort])

  // Sector breakdown for summary
  const sectorCounts = useMemo(() => {
    const map: Record<string, number> = {}
    STARTUPS.forEach(s => { map[s.sector] = (map[s.sector] ?? 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-ink-soft dark:text-slate-400">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-500">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-brand-600 dark:hover:text-brand-500">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-ink dark:text-slate-300">DPIIT Competitor Lookup</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-500">Competitive Intelligence</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-ink dark:text-slate-100">
          🏢 Who&apos;s Already Doing This?
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft dark:text-slate-400">
          Search {STARTUPS.length}+ DPIIT-recognized startups by sector, state, and funding stage.
          See active players before you commit to a business idea.
        </p>
        <p className="mt-2 text-sm text-caution">
          Data: DPIIT Startup Recognition CSV (Dec 2023) · MCA21 CIN Registry · Crunchbase public profiles
        </p>
      </header>

      {/* Sector breakdown pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSector('')}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${!sector ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-500' : 'bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-slate-400 hover:bg-line dark:hover:bg-surface-dark'}`}
        >
          {!sector && <span aria-hidden>✓</span>}All (<span className="tabular-nums">{STARTUPS.length}</span>)
        </button>
        {sectorCounts.map(([s, count]) => (
          <button
            key={s}
            onClick={() => setSector(sec => sec === s ? '' : s)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${sector === s ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-500' : 'bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-slate-400 hover:bg-line dark:hover:bg-surface-dark'}`}
          >
            {sector === s && <span aria-hidden>✓</span>}{s} (<span className="tabular-nums">{count}</span>)
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="mb-5 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name, niche, city…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 min-w-[200px] h-11 rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-4 text-sm text-ink dark:text-slate-200 placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
        <select
          value={state}
          onChange={e => setState(e.target.value)}
          className="h-11 rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 text-sm text-ink dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          <option value="">All States</option>
          {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={stage}
          onChange={e => setStage(e.target.value)}
          className="h-11 rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 text-sm text-ink dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          <option value="">All Stages</option>
          {STAGE_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as typeof sort)}
          className="h-11 rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 text-sm text-ink dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          <option value="year">Sort: Newest first</option>
          <option value="name">Sort: A–Z</option>
          <option value="funding">Sort: Funding stage</option>
        </select>
        <span className="text-sm text-ink-soft dark:text-slate-400 ml-auto">
          <span className="font-semibold text-ink dark:text-slate-200 tabular-nums">{filtered.length}</span> startups
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line dark:border-line-dark py-16 text-center text-ink-soft dark:text-slate-400">
          <p className="text-lg font-semibold">No startups match your filters</p>
          <p className="mt-1 text-sm">Try clearing some filters</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-line dark:border-line-dark overflow-hidden bg-surface dark:bg-surface-dark">
          <table className="w-full text-sm">
            <thead className="border-b border-line dark:border-line-dark bg-surface-sunk dark:bg-surface-dark-raised">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-ink-soft">Startup</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-ink-soft hidden sm:table-cell">Sector</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-ink-soft hidden md:table-cell">City / State</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-ink-soft">Stage</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-ink-soft hidden lg:table-cell">Funding</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-ink-soft hidden xl:table-cell">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-ink-soft">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-line-dark">
              {filtered.map(s => (
                <React.Fragment key={s.id}>
                  <tr
                    onClick={() => setExpanded(id => id === s.id ? null : s.id)}
                    className="hover:bg-surface-sunk/60 dark:hover:bg-surface-dark-raised/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="font-semibold text-ink dark:text-slate-200">{s.name}</p>
                      <p className="text-[11px] text-ink-soft dark:text-slate-500 mt-0.5 leading-snug max-w-[200px]">{s.subSector}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft dark:text-slate-400 hidden sm:table-cell">
                      <span className="rounded-full bg-surface-sunk dark:bg-surface-dark-raised px-2 py-0.5 text-[11px] font-medium text-ink-soft dark:text-slate-400 whitespace-nowrap">
                        {s.sector}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft dark:text-slate-400 hidden md:table-cell whitespace-nowrap">
                      <p>{s.city}</p>
                      <p className="text-[11px] text-ink-soft dark:text-slate-500">{s.state}</p>
                    </td>
                    <td className="px-4 py-3">
                      {s.fundingStage ? (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${STAGE_COLORS[s.fundingStage]}`}>
                          {s.fundingStage}
                        </span>
                      ) : (
                        <span className="text-ink-soft dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink dark:text-slate-300 hidden lg:table-cell whitespace-nowrap text-right tabular-nums">
                      {s.fundingRaised ?? <span className="text-ink-soft dark:text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-soft dark:text-slate-400 hidden xl:table-cell text-right tabular-nums">
                      {s.estimatedRevenue ?? <span className="text-ink-soft dark:text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-soft dark:text-slate-500 whitespace-nowrap text-right tabular-nums">{s.registrationYear}</td>
                  </tr>
                  {expanded === s.id && (
                    <tr key={`${s.id}-detail`}>
                      <td colSpan={7} className="px-5 py-4 bg-surface-sunk/60 dark:bg-surface-dark-raised/40">
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {s.cin && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-ink-soft mb-1">CIN</p>
                              <p className="font-mono text-ink-soft dark:text-slate-400 text-xs tabular-nums">{s.cin}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-ink-soft mb-1">Sub-Sector</p>
                            <p className="text-ink dark:text-slate-300">{s.subSector}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-ink-soft mb-1">Location</p>
                            <p className="text-ink dark:text-slate-300">{s.city}, {s.state}</p>
                          </div>
                          {s.employees && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-ink-soft mb-1">Team Size</p>
                              <p className="text-ink dark:text-slate-300 tabular-nums">{s.employees}</p>
                            </div>
                          )}
                          {s.fundingRaised && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-ink-soft mb-1">Funding Raised</p>
                              <p className="font-semibold text-ink dark:text-slate-200 tabular-nums">{s.fundingRaised}</p>
                            </div>
                          )}
                          {s.estimatedRevenue && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-ink-soft mb-1">Revenue Signal</p>
                              <p className="font-semibold text-positive tabular-nums">{s.estimatedRevenue}</p>
                            </div>
                          )}
                          <div className="sm:col-span-2 md:col-span-3">
                            <Link
                              href={`/business-ideas?industry=${encodeURIComponent(s.sector)}`}
                              className="text-xs text-brand-600 dark:text-brand-500 hover:underline"
                            >
                              See business ideas in {s.sector} →
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-caution">
        Showing curated set of {STARTUPS.length} well-known DPIIT-recognized startups.
        Full DPIIT database has 1,17,254+ startups as of Dec 2023 (available at startupindia.gov.in).
        Funding data from Crunchbase public profiles and news reports.
      </p>
    </div>
  )
}
