'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface Company {
  cin: string
  name: string
  industry: string
  sub_sector: string | null
  state: string | null
  category: string | null
  incorporation_year: number | null
  authorized_capital_cr: number | null
  paid_up_capital_cr: number | null
  is_notable: boolean
  tags: string[] | null
  fiscal_year: string | null
  revenue_cr: number | null
  expenses_cr: number | null
  pat_cr: number | null
  net_worth_cr: number | null
  total_assets_cr: number | null
  total_debt_cr: number | null
  data_source: string | null
  scraped_at: string | null
}

const INDUSTRIES = [
  'All Sectors',
  'FinTech', 'EdTech', 'E-Commerce', 'SaaS', 'HealthTech',
  'Logistics', 'AgriTech', 'Food & Beverage', 'EV & CleanTech',
  'PropTech', 'Media & Entertainment', 'Travel & Hospitality',
  'CleanTech', 'Retail', 'Conglomerate',
]

const SORT_OPTIONS = [
  { value: 'revenue', label: 'Revenue' },
  { value: 'pat', label: 'PAT' },
  { value: 'networth', label: 'Net Worth' },
  { value: 'assets', label: 'Total Assets' },
  { value: 'name', label: 'Name (A-Z)' },
]

function fmt(val: number | null, decimals = 0) {
  if (val === null || val === undefined) return '—'
  if (Math.abs(val) >= 1000) return `₹${(val / 1000).toFixed(1)}K Cr`
  if (Math.abs(val) >= 1) return `₹${val.toFixed(decimals)} Cr`
  return `₹${(val * 100).toFixed(0)} L`
}

function patColor(pat: number | null) {
  if (pat === null) return 'text-slate-400'
  if (pat > 0) return 'text-emerald-600 dark:text-emerald-400'
  return 'text-rose-600 dark:text-rose-400'
}

function Tag({ label }: { label: string }) {
  const colors: Record<string, string> = {
    unicorn: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    saas: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    fintech: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    mnc: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    large: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    d2c: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    ev: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  }
  const cls = colors[label] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${cls}`}>
      {label}
    </span>
  )
}

function CompanyRow({ c, expanded, onToggle }: {
  c: Company
  expanded: boolean
  onToggle: () => void
}) {
  const hasMismatch = c.revenue_cr !== null && c.expenses_cr !== null &&
    Math.abs((c.revenue_cr - c.expenses_cr) - (c.pat_cr ?? 0)) > 10

  return (
    <>
      <tr
        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="font-medium text-sm text-slate-900 dark:text-slate-100 leading-tight">
            {c.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            {c.cin}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
          <div>{c.industry ?? '—'}</div>
          {c.state && <div className="text-xs text-slate-400">{c.state}</div>}
        </td>
        <td className="px-4 py-3 text-sm font-mono text-right text-slate-900 dark:text-slate-100">
          {c.fiscal_year
            ? <><div>{fmt(c.revenue_cr)}</div><div className="text-xs text-slate-400">FY{c.fiscal_year}</div></>
            : <span className="text-slate-400 text-xs">No data yet</span>
          }
        </td>
        <td className={`px-4 py-3 text-sm font-mono text-right ${patColor(c.pat_cr)}`}>
          {fmt(c.pat_cr)}
        </td>
        <td className="px-4 py-3 text-sm font-mono text-right text-slate-700 dark:text-slate-300">
          {fmt(c.net_worth_cr)}
        </td>
        <td className="px-4 py-3 text-sm font-mono text-right text-slate-600 dark:text-slate-400">
          {fmt(c.total_assets_cr)}
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {c.tags?.slice(0, 3).map(t => <Tag key={t} label={t} />)}
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-slate-400 text-center">
          {expanded ? '▲' : '▼'}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50 dark:bg-slate-800/30">
          <td colSpan={8} className="px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Revenue</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{fmt(c.revenue_cr, 1)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">PAT</p>
                <p className={`font-semibold ${patColor(c.pat_cr)}`}>{fmt(c.pat_cr, 1)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Net Worth</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{fmt(c.net_worth_cr, 1)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Total Debt</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{fmt(c.total_debt_cr, 1)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Total Assets</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{fmt(c.total_assets_cr, 1)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Auth. Capital</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{fmt(c.authorized_capital_cr, 1)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Paid-up Capital</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{fmt(c.paid_up_capital_cr, 1)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Incorporated</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{c.incorporation_year ?? '—'}</p>
              </div>
            </div>
            {c.fiscal_year && (
              <p className="mt-3 text-xs text-slate-400">
                Latest FY: {c.fiscal_year} · Source: {c.data_source ?? 'zauba'} (MCA public filings) ·{' '}
                <a
                  href={`https://www.zaubacorp.com/company/${c.name.replace(/[^a-zA-Z0-9]+/g, '-').toUpperCase()}/${c.cin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  View on Zauba Corp →
                </a>
              </p>
            )}
            {!c.fiscal_year && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                <span>⚠</span>
                <span>
                  No financial data scraped yet. Run{' '}
                  <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">
                    node scripts/scrape-unlisted-financials.mjs --cin {c.cin}
                  </code>{' '}
                  to fetch.
                </span>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export default function UnlistedFinancialsPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [stats, setStats] = useState<{ total_companies: number; with_data: number; industries: number; states: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  const q        = searchParams.get('q') ?? ''
  const industry = searchParams.get('industry') ?? ''
  const sortBy   = searchParams.get('sort') ?? 'revenue'

  const setParam = useCallback((key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (val) params.set(key, val)
    else params.delete(key)
    router.push(`/unlisted-financials?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ q, industry, sort: sortBy, limit: '100' })
    fetch(`/api/unlisted-financials?${params}`)
      .then(r => r.json())
      .then(data => {
        setCompanies(data.companies ?? [])
        setStats(data.stats ?? null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [q, industry, sortBy])

  const withData = companies.filter(c => c.fiscal_year !== null)
  const withoutData = companies.filter(c => c.fiscal_year === null)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">Unlisted Financials</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Intelligence</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
          Unlisted Company Financials
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Revenue, PAT, and net worth for Indian unicorns, soonicorns, and large private companies.
          Sourced from public MCA filings via Zauba Corp — no paywalls.
        </p>
      </header>

      {/* Stats */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Companies Tracked', value: stats.total_companies },
            { label: 'With Financial Data', value: stats.with_data },
            { label: 'Sectors', value: stats.industries },
            { label: 'States', value: stats.states },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value ?? '—'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Data source note */}
      <div className="mb-6 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 p-4 text-sm text-amber-800 dark:text-amber-300">
        <strong>Data source:</strong> MCA21 public filings (via Zauba Corp). Financials are extracted from annual returns and balance sheets filed with the Registrar of Companies — same data MCA charges ₹50-200/doc for directly.
        Run <code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded text-xs">node scripts/scrape-unlisted-financials.mjs</code> to refresh.
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search company name..."
          value={q}
          onChange={e => setParam('q', e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-60"
        />
        <select
          value={industry}
          onChange={e => setParam('industry', e.target.value === 'All Sectors' ? '' : e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={e => setParam('sort', e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="inline-block h-8 w-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-lg font-semibold">No companies found</p>
          <p className="mt-2 text-sm">Run the scraper to populate financial data.</p>
          <code className="mt-4 block bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto">
            node scripts/scrape-unlisted-financials.mjs
          </code>
        </div>
      ) : (
        <>
          {/* Companies with data */}
          {withData.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                {withData.length} companies with financial data
              </h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Sector</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">PAT</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Net Worth</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Assets</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                    {withData.map(c => (
                      <CompanyRow
                        key={c.cin}
                        c={c}
                        expanded={expanded === c.cin}
                        onToggle={() => setExpanded(expanded === c.cin ? null : c.cin)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Companies pending scrape */}
          {withoutData.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                {withoutData.length} companies — financial data not yet scraped
              </h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {withoutData.map(c => (
                  <div key={c.cin} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight">{c.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{c.industry} · {c.cin.slice(-10)}</p>
                    </div>
                    <a
                      href={`https://www.zaubacorp.com/company/${c.name.replace(/[^a-zA-Z0-9]+/g, '-').toUpperCase()}/${c.cin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:underline ml-3 whitespace-nowrap"
                    >
                      View →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
