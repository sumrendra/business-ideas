'use client'

import { useState, useCallback, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Tender {
  id: string; source: string; bidNo: string; title: string
  organization: string; ministry: string; category: string; state: string
  tenderValue: number | null; bidDeadline: string | null
  status: string; documentUrl: string; itemDescription?: string
  scrapedAt: string
}

interface BidRecord {
  bidId: string; source: string; bidNo: string; category: string
  itemDescription: string; ministry: string; organization: string; state: string
  l1Price: number | null; l1SellerName: string; estimatedValue: number | null
  totalBidders: number | null; bidClosingDate: string | null; savingsPercent: number | null
}

interface VendorRecord {
  sellerName: string; state: string; totalOrders: number
  totalOrderValueINR: number; avgOrderValueINR: number
  topCategories: string[]; topMinistries: string[]
}

interface BidSummary {
  avgL1Price: number; medianL1Price: number; lowestL1Price: number
  totalBids: number; avgBidders: number; avgSavings: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(n: number | null) {
  if (!n) return '—'
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysLeft(d: string | null) {
  if (!d) return null
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  return diff
}

function sourceLabel(s: string) {
  return { gem: 'GeM', cppp: 'CPPP', mahatenders: 'MahaTenders' }[s] || s.toUpperCase()
}

function sourceBadge(s: string) {
  const map: Record<string, string> = {
    gem: 'bg-emerald-100 text-emerald-800',
    cppp: 'bg-blue-100 text-blue-800',
    mahatenders: 'bg-orange-100 text-orange-800',
  }
  return map[s] || 'bg-gray-100 text-gray-800'
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
    </div>
  )
}

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
        ← Prev
      </button>
      <span className="text-sm text-gray-600">Page {page} of {pages}</span>
      <button onClick={() => onPage(page + 1)} disabled={page === pages}
        className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
        Next →
      </button>
    </div>
  )
}

// ── Tab 1: Tender Search ──────────────────────────────────────────────────────
function TenderSearch() {
  const [q, setQ] = useState('')
  const [state, setState] = useState('')
  const [ministry, setMinistry] = useState('')
  const [source, setSource] = useState('')
  const [deadlineDays, setDeadlineDays] = useState('')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState<{ tenders: Tender[]; total: number; pages: number; durationMs: number; dataNote: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = useCallback(async (p = 1) => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (state) params.set('state', state)
      if (ministry) params.set('ministry', ministry)
      if (source) params.set('source', source)
      if (deadlineDays) params.set('deadlineDays', deadlineDays)
      params.set('status', 'active')
      params.set('page', String(p))
      const res = await fetch(`/api/tender-search/search?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Search failed')
      setResults(data)
      setPage(p)
    } catch(e: unknown) {
      setError(e instanceof Error ? e.message : 'Search failed')
    } finally { setLoading(false) }
  }, [q, state, ministry, source, deadlineDays])

  // Initial load
  useEffect(() => { search(1) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search(1)}
            placeholder="Search tenders by keyword, item, or org..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={() => search(1)}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 whitespace-nowrap">
            Search
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <select value={source} onChange={e => setSource(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white">
            <option value="">All Sources</option>
            <option value="gem">GeM</option>
            <option value="cppp">CPPP</option>
            <option value="mahatenders">MahaTenders</option>
          </select>
          <select value={state} onChange={e => setState(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white">
            <option value="">All States</option>
            {['Andhra Pradesh','Bihar','Delhi','Gujarat','Haryana','Karnataka','Kerala',
              'Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu',
              'Telangana','Uttar Pradesh','West Bengal'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input value={ministry} onChange={e => setMinistry(e.target.value)}
            placeholder="Ministry / Dept..."
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          />
          <select value={deadlineDays} onChange={e => setDeadlineDays(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white">
            <option value="">Any deadline</option>
            <option value="7">Closing in 7 days</option>
            <option value="15">Closing in 15 days</option>
            <option value="30">Closing in 30 days</option>
          </select>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-4 mb-4">{error}</div>}

      {loading ? <Spinner /> : results && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{results.total.toLocaleString()}</span> tenders found
              <span className="text-gray-400 ml-2">({results.durationMs}ms)</span>
            </p>
            <p className="text-xs text-gray-400 hidden sm:block">{results.dataNote}</p>
          </div>

          {results.tenders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p>No tenders found. Try different filters or run the scrapers first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.tenders.map(t => {
                const days = daysLeft(t.bidDeadline)
                const urgent = days !== null && days <= 7 && days >= 0
                return (
                  <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sourceBadge(t.source)}`}>
                        {sourceLabel(t.source)}
                      </span>
                      {t.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.category}</span>
                      )}
                      {urgent && (
                        <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">
                          Closes in {days}d
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{t.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{t.organization}{t.state ? ` · ${t.state}` : ''}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                      {t.tenderValue && (
                        <span>💰 <strong>{formatINR(t.tenderValue)}</strong></span>
                      )}
                      <span>📅 <strong>{formatDate(t.bidDeadline)}</strong></span>
                      {t.bidNo && <span className="text-gray-400">{t.bidNo}</span>}
                    </div>
                    {t.documentUrl && t.documentUrl !== 'https://bidplus.gem.gov.in/all-bids' && (
                      <a href={t.documentUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-3 inline-block text-xs text-indigo-600 hover:underline">
                        View Tender →
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <Pagination page={page} pages={results.pages} onPage={p => search(p)} />
        </>
      )}
    </div>
  )
}

// ── Tab 2: Bid History ────────────────────────────────────────────────────────
function BidHistory() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [ministry, setMinistry] = useState('')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState<{ bids: BidRecord[]; total: number; pages: number; summary: BidSummary } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = useCallback(async (p = 1) => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (category) params.set('category', category)
      if (ministry) params.set('ministry', ministry)
      params.set('page', String(p))
      const res = await fetch(`/api/tender-search/bids?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResults(data)
      setPage(p)
    } catch(e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally { setLoading(false) }
  }, [q, category, ministry])

  useEffect(() => { search(1) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search(1)}
            placeholder="Search by item, bid number..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input value={category} onChange={e => setCategory(e.target.value)}
            placeholder="Category..."
            className="w-40 px-3 py-2.5 rounded-lg border border-gray-300 text-sm"
          />
          <input value={ministry} onChange={e => setMinistry(e.target.value)}
            placeholder="Ministry..."
            className="w-40 px-3 py-2.5 rounded-lg border border-gray-300 text-sm"
          />
          <button onClick={() => search(1)}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
            Search
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-4 mb-4">{error}</div>}

      {loading ? <Spinner /> : results && (
        <>
          {/* Summary stats */}
          {results.summary.totalBids > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <StatBox label="Total Results" value={results.summary.totalBids.toLocaleString()} />
              <StatBox label="Sources" value="GeM · CPPP" />
              <StatBox label="Updated" value="Daily" />
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold text-gray-900">{results.total.toLocaleString()}</span> bid results
          </p>

          {results.bids.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">📊</div>
              <p>No bid results yet. Run the scrapers to populate data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Item / Bid No</th>
                    <th className="px-4 py-3 text-left">Ministry / Org</th>
                    <th className="px-4 py-3 text-left">Source</th>
                    <th className="px-4 py-3 text-left">Closed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.bids.map(b => (
                    <tr key={b.bidId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 line-clamp-2 max-w-sm">{b.itemDescription || b.category || '—'}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{b.bidNo}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px]">
                        <div className="line-clamp-1">{b.ministry || b.organization || '—'}</div>
                        {b.state && <div className="text-gray-400">{b.state}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${b.bidNo?.startsWith('GEM') ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {b.bidNo?.startsWith('GEM') ? 'GeM' : 'CPPP'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(b.bidClosingDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination page={page} pages={results.pages} onPage={p => search(p)} />
        </>
      )}
    </div>
  )
}

// ── Tab 3: Vendor Intelligence ─────────────────────────────────────────────────
function VendorIntel() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [state, setState] = useState('')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState<{ vendors: VendorRecord[]; total: number; pages: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = useCallback(async (p = 1) => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (category) params.set('category', category)
      if (state) params.set('state', state)
      params.set('page', String(p))
      const res = await fetch(`/api/tender-search/vendors?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResults(data)
      setPage(p)
    } catch(e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally { setLoading(false) }
  }, [q, category, state])

  useEffect(() => { search(1) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search(1)}
            placeholder="Search vendor / company name..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input value={category} onChange={e => setCategory(e.target.value)}
            placeholder="Category..."
            className="w-40 px-3 py-2.5 rounded-lg border border-gray-300 text-sm"
          />
          <select value={state} onChange={e => setState(e.target.value)}
            className="w-40 px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white">
            <option value="">All States</option>
            {['Delhi','Maharashtra','Karnataka','Gujarat','Tamil Nadu','Telangana',
              'Uttar Pradesh','Rajasthan','Punjab','Haryana','West Bengal'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={() => search(1)}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
            Search
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-4 mb-4">{error}</div>}

      {loading ? <Spinner /> : results && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold text-gray-900">{results.total.toLocaleString()}</span> vendors
          </p>

          {results.vendors.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🏢</div>
              <p>No vendor data yet. Bid results need to be scraped first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.vendors.map((v, idx) => (
                <div key={`${v.sellerName}-${v.state}`} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                        {idx + 1 + (page - 1) * 25}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{v.sellerName}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{v.state || 'State not specified'}</p>
                        {v.topCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {v.topCategories.map(c => (
                              <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-gray-900">{v.totalOrders}</div>
                      <div className="text-xs text-gray-400">orders won</div>
                      <div className="text-sm font-semibold text-indigo-600 mt-1">{formatINR(v.totalOrderValueINR)}</div>
                      <div className="text-xs text-gray-400">total value</div>
                    </div>
                  </div>
                  {v.topMinistries.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">Serves: </span>
                      {v.topMinistries.join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Pagination page={page} pages={results.pages} onPage={p => search(p)} />
        </>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'search',  label: '🔍 Tender Search',      desc: 'Live active tenders' },
  { id: 'bids',    label: '📊 Bid History',          desc: 'Closed bids from GeM & CPPP' },
  { id: 'vendors', label: '🏢 Vendor Intelligence',  desc: 'Who wins govt contracts' },
]

export default function TenderSearchPage() {
  const [tab, setTab] = useState('search')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live data · Updated every 6 hours
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Government Tender Search
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Search live tenders from GeM, CPPP, and MahaTenders. Discover historical bid prices and top vendors winning government contracts.
          </p>
          <div className="flex flex-wrap gap-3 mt-5 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />GeM (Government e-Marketplace)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-blue-400 rounded-full" />CPPP (Central Public Procurement)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-orange-400 rounded-full" />MahaTenders (Maharashtra)
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab bar */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-8 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>

        {/* Active tab desc */}
        <p className="text-sm text-gray-500 mb-5">
          {TABS.find(t => t.id === tab)?.desc}
        </p>

        {/* Tab content */}
        {tab === 'search'  && <TenderSearch />}
        {tab === 'bids'    && <BidHistory />}
        {tab === 'vendors' && <VendorIntel />}
      </div>
    </div>
  )
}
