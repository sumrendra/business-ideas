'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Company {
  ticker: string
  name: string
  sector: string
  sub_sector: string | null
  market_cap_cr: number | null
  metrics: Record<string, number | null>
  quarter: string
  data_source: string
}

type SortDir = 'asc' | 'desc'

// ─── Sector config ────────────────────────────────────────────────────────────

const SECTORS = [
  { id: 'banks',          label: 'Banks',             icon: '🏦' },
  { id: 'nbfcs',          label: 'NBFCs',              icon: '💰' },
  { id: 'insurance',      label: 'Insurance',          icon: '🛡️' },
  { id: 'hotels_airlines',label: 'Hotels & Airlines',  icon: '✈️' },
  { id: 'realestate',     label: 'Real Estate',        icon: '🏗️' },
  { id: 'retail',         label: 'Retail',             icon: '🛍️' },
  { id: 'pharma',         label: 'Pharma',             icon: '💊' },
]

// Column definitions per sector
// direction: 'up' = higher is better, 'down' = lower is better
interface ColDef {
  key: string
  label: string
  unit: string
  direction: 'up' | 'down'
  fmt?: (v: number) => string
  thresholds?: [number, number] // [good, ok] — anything worse is red
}

const fmt1 = (v: number) => v.toFixed(1)
const fmt0 = (v: number) => Math.round(v).toLocaleString('en-IN')
const fmtCr = (v: number) => `₹${Math.round(v).toLocaleString('en-IN')}`

const SECTOR_COLS: Record<string, ColDef[]> = {
  banks: [
    { key:'gnpa',        label:'GNPA',        unit:'%',  direction:'down', fmt:fmt1, thresholds:[2,4] },
    { key:'nnpa',        label:'NNPA',        unit:'%',  direction:'down', fmt:fmt1, thresholds:[0.5,1.5] },
    { key:'nim',         label:'NIM',         unit:'%',  direction:'up',   fmt:fmt1, thresholds:[4,3] },
    { key:'casa',        label:'CASA',        unit:'%',  direction:'up',   fmt:fmt1, thresholds:[40,30] },
    { key:'pcr',         label:'PCR',         unit:'%',  direction:'up',   fmt:fmt1, thresholds:[75,60] },
    { key:'crar',        label:'CRAR',        unit:'%',  direction:'up',   fmt:fmt1, thresholds:[17,14] },
    { key:'roe',         label:'ROE',         unit:'%',  direction:'up',   fmt:fmt1, thresholds:[15,10] },
    { key:'credit_cost', label:'Credit Cost', unit:'%',  direction:'down', fmt:fmt1, thresholds:[0.5,1.5] },
  ],
  nbfcs: [
    { key:'aum_growth',  label:'AUM Growth',  unit:'%',  direction:'up',   fmt:fmt1, thresholds:[20,10] },
    { key:'borrow_cost', label:'Borrow Cost', unit:'%',  direction:'down', fmt:fmt1, thresholds:[7.5,9] },
    { key:'spread',      label:'Spread',      unit:'%',  direction:'up',   fmt:fmt1, thresholds:[6,3] },
    { key:'opex_aum',    label:'OpEx/AUM',    unit:'%',  direction:'down', fmt:fmt1, thresholds:[2,4] },
    { key:'gnpa',        label:'GNPA',        unit:'%',  direction:'down', fmt:fmt1, thresholds:[2,4] },
    { key:'roe',         label:'ROE',         unit:'%',  direction:'up',   fmt:fmt1, thresholds:[18,12] },
  ],
  insurance: [
    { key:'vnb_margin',      label:'VNB Margin',      unit:'%',  direction:'up',   fmt:fmt1, thresholds:[25,15] },
    { key:'persistency_13m', label:'Persistency 13M', unit:'%',  direction:'up',   fmt:fmt1, thresholds:[85,75] },
    { key:'claims_ratio',    label:'Claims Ratio',    unit:'%',  direction:'down', fmt:fmt1, thresholds:[70,85] },
    { key:'combined_ratio',  label:'Combined Ratio',  unit:'%',  direction:'down', fmt:fmt1, thresholds:[100,110] },
    { key:'solvency',        label:'Solvency',        unit:'%',  direction:'up',   fmt:fmt0, thresholds:[200,150] },
    { key:'premium_growth',  label:'Premium Growth',  unit:'%',  direction:'up',   fmt:fmt1, thresholds:[15,5] },
  ],
  hotels_airlines: [
    { key:'revpar',       label:'RevPAR',      unit:'₹',   direction:'up',   fmt:fmt0,  thresholds:[6000,3000] },
    { key:'occupancy',    label:'Occupancy',   unit:'%',   direction:'up',   fmt:fmt1,  thresholds:[72,60] },
    { key:'arr',          label:'ARR',         unit:'₹',   direction:'up',   fmt:fmt0,  thresholds:[8000,4000] },
    { key:'load_factor',  label:'Load Factor', unit:'%',   direction:'up',   fmt:fmt1,  thresholds:[83,75] },
    { key:'rask',         label:'RASK',        unit:'p',   direction:'up',   fmt:fmt0,  thresholds:[480,420] },
    { key:'cask',         label:'CASK',        unit:'p',   direction:'down', fmt:fmt0,  thresholds:[450,500] },
    { key:'ebitda_margin',label:'EBITDA',      unit:'%',   direction:'up',   fmt:fmt1,  thresholds:[15,5] },
  ],
  realestate: [
    { key:'pre_sales',      label:'Pre-Sales',    unit:'Cr',  direction:'up',   fmt:fmtCr, thresholds:[10000,3000] },
    { key:'collections',    label:'Collections',  unit:'Cr',  direction:'up',   fmt:fmtCr, thresholds:[8000,2000] },
    { key:'unsold_inv',     label:'Unsold Inv',   unit:'Cr',  direction:'down', fmt:fmtCr, thresholds:[20000,50000] },
    { key:'net_debt_equity',label:'Net D/E',      unit:'x',   direction:'down', fmt:fmt1,  thresholds:[0.3,0.7] },
  ],
  retail: [
    { key:'sssg',          label:'SSSG',         unit:'%',  direction:'up',   fmt:fmt1,  thresholds:[10,0] },
    { key:'rev_per_sqft',  label:'Rev/Sq.Ft',    unit:'₹',  direction:'up',   fmt:fmt0,  thresholds:[30000,15000] },
    { key:'gross_margin',  label:'Gross Margin', unit:'%',  direction:'up',   fmt:fmt1,  thresholds:[35,20] },
    { key:'ebitda_margin', label:'EBITDA',       unit:'%',  direction:'up',   fmt:fmt1,  thresholds:[12,5] },
  ],
  pharma: [
    { key:'anda_filed',    label:'ANDAs Filed',  unit:'',   direction:'up',   fmt:fmt0,  thresholds:[200,50] },
    { key:'us_pct',        label:'US Rev',       unit:'%',  direction:'up',   fmt:fmt1,  thresholds:[30,15] },
    { key:'eu_pct',        label:'EU Rev',       unit:'%',  direction:'up',   fmt:fmt1,  thresholds:[15,5] },
    { key:'rd_pct',        label:'R&D',          unit:'%',  direction:'up',   fmt:fmt1,  thresholds:[6,3] },
    { key:'ebitda_margin', label:'EBITDA',       unit:'%',  direction:'up',   fmt:fmt1,  thresholds:[25,15] },
  ],
}

// ─── Cell colour ──────────────────────────────────────────────────────────────

function cellColor(col: ColDef, value: number | null | undefined): string {
  if (value == null) return 'text-slate-400 dark:text-slate-500'
  const [good, ok] = col.thresholds ?? [Infinity, Infinity]
  const isGood = col.direction === 'up' ? value >= good : value <= good
  const isOk   = col.direction === 'up' ? value >= ok   : value <= ok
  if (isGood) return 'text-emerald-600 dark:text-emerald-400 font-semibold'
  if (isOk)   return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
}

function fmtMarketCap(v: number | null): string {
  if (!v) return '—'
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L Cr`
  return `₹${Math.round(v / 1000)}K Cr`
}

// ─── Table ────────────────────────────────────────────────────────────────────

function ScreenerTable({ companies, cols }: { companies: Company[]; cols: ColDef[] }) {
  const [sortKey, setSortKey] = useState<string>('market_cap_cr')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = [...companies].sort((a, b) => {
    const av = sortKey === 'market_cap_cr' ? (a.market_cap_cr ?? 0) : (a.metrics[sortKey] ?? -Infinity)
    const bv = sortKey === 'market_cap_cr' ? (b.market_cap_cr ?? 0) : (b.metrics[sortKey] ?? -Infinity)
    return sortDir === 'asc' ? av - bv : bv - av
  })

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const arrow = (key: string) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap sticky left-0 bg-slate-50 dark:bg-slate-900/60 z-10">
              Company
            </th>
            <th
              onClick={() => toggleSort('market_cap_cr')}
              className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 select-none"
            >
              Mkt Cap{arrow('market_cap_cr')}
            </th>
            {cols.map(col => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 select-none"
              >
                {col.label}{col.unit ? ` (${col.unit})` : ''}{arrow(col.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {sorted.map(c => (
            <tr key={c.ticker} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td className="px-4 py-3 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 z-10">
                <div className="font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  {c.name}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <span className="font-mono">{c.ticker}</span>
                  {c.sub_sector && (
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] capitalize">
                      {c.sub_sector.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {fmtMarketCap(c.market_cap_cr)}
              </td>
              {cols.map(col => {
                const v = c.metrics[col.key]
                const display = v == null ? '—' : (col.fmt ? col.fmt(v) : String(v))
                return (
                  <td key={col.key} className={`px-4 py-3 text-right whitespace-nowrap tabular-nums ${cellColor(col, v)}`}>
                    {display}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />Good</span>
      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />Average</span>
      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />Weak</span>
      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300 inline-block" />N/A</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScreenerPage() {
  const [sector, setSector] = useState('banks')
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quarter, setQuarter] = useState('')

  const load = useCallback(async (s: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/screener?sector=${s}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setCompanies(data.companies ?? [])
      setQuarter(data.companies?.[0]?.quarter ?? '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(sector) }, [sector, load])

  const cols = SECTOR_COLS[sector] ?? []
  const sectorLabel = SECTORS.find(s => s.id === sector)?.label ?? sector

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">KPI Screener</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Tools</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
          India KPI Screener
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Sector-specific KPIs for listed Indian companies — the metrics that actually matter, not just PE and ROE.
          Sort any column to rank instantly.
        </p>
      </header>

      {/* Sector tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {SECTORS.map(s => (
          <button
            key={s.id}
            onClick={() => setSector(s.id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              sector === s.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Column legend */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-300">{companies.length} companies</strong>
            {quarter && <> · Data: {quarter} · Source: Annual Reports / Quarterly Results</>}
          </p>
        </div>
        <Legend />
      </div>

      {/* KPI glossary for current sector */}
      {sector === 'banks' && (
        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
          <span><b>GNPA</b> Gross NPA ratio</span>
          <span><b>NNPA</b> Net NPA ratio</span>
          <span><b>NIM</b> Net interest margin</span>
          <span><b>CASA</b> Current + savings deposits</span>
          <span><b>PCR</b> Provision coverage ratio</span>
          <span><b>CRAR</b> Capital adequacy</span>
        </div>
      )}
      {sector === 'nbfcs' && (
        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
          <span><b>Spread</b> Lending rate − borrow cost</span>
          <span><b>OpEx/AUM</b> Operating expense as % of assets</span>
          <span><b>AUM Growth</b> Year-on-year asset growth</span>
        </div>
      )}
      {sector === 'insurance' && (
        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
          <span><b>VNB Margin</b> Value of new business margin (life only)</span>
          <span><b>Persistency 13M</b> % policies still active after 13 months</span>
          <span><b>Combined Ratio</b> Claims + expense ratio (general; &lt;100% = profitable)</span>
        </div>
      )}
      {sector === 'hotels_airlines' && (
        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
          <span><b>RevPAR</b> Revenue per available room (hotels)</span>
          <span><b>ARR</b> Average room rate (hotels)</span>
          <span><b>RASK/CASK</b> Revenue/Cost per available seat km in paise (airlines)</span>
          <span><b>Load Factor</b> Seat fill rate (airlines)</span>
        </div>
      )}
      {sector === 'realestate' && (
        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
          <span><b>Pre-Sales</b> Bookings value in FY</span>
          <span><b>Collections</b> Cash collected from sold units</span>
          <span><b>Unsold Inv</b> Completed but unsold inventory value</span>
          <span><b>Net D/E</b> Net debt-to-equity</span>
        </div>
      )}
      {sector === 'retail' && (
        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
          <span><b>SSSG</b> Same-store sales growth year-on-year</span>
          <span><b>Rev/Sq.Ft</b> Annual revenue per square foot of retail space</span>
        </div>
      )}
      {sector === 'pharma' && (
        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
          <span><b>ANDAs Filed</b> Cumulative US drug applications</span>
          <span><b>US/EU Rev</b> % of revenue from regulated markets</span>
          <span><b>R&D</b> R&D spend as % of revenue</span>
        </div>
      )}

      {/* Table */}
      {loading && (
        <div className="py-20 text-center">
          <span className="inline-block h-5 w-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading {sectorLabel} data…</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-6 text-center">
          <p className="text-sm text-rose-700 dark:text-rose-400">Failed to load: {error}</p>
          <button onClick={() => load(sector)} className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && companies.length === 0 && (
        <p className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm">
          No data yet for {sectorLabel}. Run <code className="bg-slate-100 dark:bg-slate-800 px-1.5 rounded">node scripts/seed-screener.mjs</code> to seed.
        </p>
      )}

      {!loading && !error && companies.length > 0 && (
        <ScreenerTable companies={companies} cols={cols} />
      )}

      <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        Data: FY25 Annual Reports &amp; Q4FY25 quarterly results · Colour thresholds are sector-specific benchmarks · Not investment advice
      </p>
    </div>
  )
}
