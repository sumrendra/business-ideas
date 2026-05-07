'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { STARTUPS, ALL_SECTORS, ALL_STATES, type DPIITStartup, type FundingStage } from '@/lib/dpiit/startups'

const STAGE_COLORS: Record<FundingStage, string> = {
  'Bootstrapped': 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  'Angel':        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  'Pre-Seed':     'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  'Seed':         'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  'Series A':     'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  'Series B':     'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'Series C':     'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  'Series D+':    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  'Series E':     'bg-purple-200 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
  'Series F':     'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  'Series G':     'bg-violet-200 dark:bg-violet-900/50 text-violet-800 dark:text-violet-300',
  'Listed':       'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
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
      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">DPIIT Competitor Lookup</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Competitive Intelligence</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
          🏢 Who&apos;s Already Doing This?
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Search {STARTUPS.length}+ DPIIT-recognized startups by sector, state, and funding stage.
          See active players before you commit to a business idea.
        </p>
        <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
          Data: DPIIT Startup Recognition CSV (Dec 2023) · MCA21 CIN Registry · Crunchbase public profiles
        </p>
      </header>

      {/* Sector breakdown pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSector('')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${!sector ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
          All ({STARTUPS.length})
        </button>
        {sectorCounts.map(([s, count]) => (
          <button
            key={s}
            onClick={() => setSector(sec => sec === s ? '' : s)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${sector === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            {s} ({count})
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
          className="flex-1 min-w-[200px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={state}
          onChange={e => setState(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All States</option>
          {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={stage}
          onChange={e => setStage(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All Stages</option>
          {STAGE_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as typeof sort)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="year">Sort: Newest first</option>
          <option value="name">Sort: A–Z</option>
          <option value="funding">Sort: Funding stage</option>
        </select>
        <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{filtered.length}</span> startups
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 py-16 text-center text-slate-500 dark:text-slate-400">
          <p className="text-lg font-semibold">No startups match your filters</p>
          <p className="mt-1 text-sm">Try clearing some filters</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Startup</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 hidden sm:table-cell">Sector</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 hidden md:table-cell">City / State</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 hidden lg:table-cell">Funding</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 hidden xl:table-cell">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filtered.map(s => (
                <React.Fragment key={s.id}>
                  <tr
                    onClick={() => setExpanded(id => id === s.id ? null : s.id)}
                    className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug max-w-[200px]">{s.subSector}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {s.sector}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell whitespace-nowrap">
                      <p>{s.city}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{s.state}</p>
                    </td>
                    <td className="px-4 py-3">
                      {s.fundingStage ? (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${STAGE_COLORS[s.fundingStage]}`}>
                          {s.fundingStage}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hidden lg:table-cell whitespace-nowrap">
                      {s.fundingRaised ?? <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden xl:table-cell">
                      {s.estimatedRevenue ?? <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500 whitespace-nowrap">{s.registrationYear}</td>
                  </tr>
                  {expanded === s.id && (
                    <tr key={`${s.id}-detail`}>
                      <td colSpan={7} className="px-5 py-4 bg-indigo-50/60 dark:bg-indigo-950/20">
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {s.cin && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">CIN</p>
                              <p className="font-mono text-slate-600 dark:text-slate-400 text-xs">{s.cin}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Sub-Sector</p>
                            <p className="text-slate-700 dark:text-slate-300">{s.subSector}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Location</p>
                            <p className="text-slate-700 dark:text-slate-300">{s.city}, {s.state}</p>
                          </div>
                          {s.employees && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Team Size</p>
                              <p className="text-slate-700 dark:text-slate-300">{s.employees}</p>
                            </div>
                          )}
                          {s.fundingRaised && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Funding Raised</p>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{s.fundingRaised}</p>
                            </div>
                          )}
                          {s.estimatedRevenue && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Revenue Signal</p>
                              <p className="font-semibold text-emerald-700 dark:text-emerald-400">{s.estimatedRevenue}</p>
                            </div>
                          )}
                          <div className="sm:col-span-2 md:col-span-3">
                            <Link
                              href={`/business-ideas?industry=${encodeURIComponent(s.sector)}`}
                              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
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

      <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        Showing curated set of {STARTUPS.length} well-known DPIIT-recognized startups.
        Full DPIIT database has 1,17,254+ startups as of Dec 2023 (available at startupindia.gov.in).
        Funding data from Crunchbase public profiles and news reports.
      </p>
    </div>
  )
}
