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
  // One Voice Rule: source is a neutral label, not a decorative hue.
  const map: Record<string, string> = {
    gem: 'bg-surface-sunk text-ink-soft',
    cppp: 'bg-surface-sunk text-ink-soft',
    mahatenders: 'bg-surface-sunk text-ink-soft',
  }
  return map[s] || 'bg-surface-sunk text-ink-soft'
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg border border-line p-4 text-center">
      <div className="text-xl font-bold text-ink tabular-nums">{value}</div>
      <div className="text-xs text-ink-soft mt-0.5">{label}</div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
    </div>
  )
}

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        className="px-3 py-2 min-h-[44px] text-sm rounded border border-line disabled:opacity-40 hover:bg-surface-sunk">
        ← Prev
      </button>
      <span className="text-sm text-ink-soft tabular-nums">Page {page} of {pages}</span>
      <button onClick={() => onPage(page + 1)} disabled={page === pages}
        className="px-3 py-2 min-h-[44px] text-sm rounded border border-line disabled:opacity-40 hover:bg-surface-sunk">
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
      <div className="bg-surface rounded-xl border border-line p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search(1)}
            placeholder="Search tenders by keyword, item, or org..."
            className="flex-1 px-4 h-11 rounded-lg border border-line bg-surface text-ink placeholder-ink-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
          <button onClick={() => search(1)}
            className="px-6 h-11 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 whitespace-nowrap">
            Search
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <select value={source} onChange={e => setSource(e.target.value)}
            className="px-3 h-11 rounded-lg border border-line text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-brand-600">
            <option value="">All Sources</option>
            <option value="gem">GeM</option>
            <option value="cppp">CPPP</option>
            <option value="mahatenders">MahaTenders</option>
          </select>
          <select value={state} onChange={e => setState(e.target.value)}
            className="px-3 h-11 rounded-lg border border-line text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-brand-600">
            <option value="">All States</option>
            {['Andhra Pradesh','Bihar','Delhi','Gujarat','Haryana','Karnataka','Kerala',
              'Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu',
              'Telangana','Uttar Pradesh','West Bengal'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input value={ministry} onChange={e => setMinistry(e.target.value)}
            placeholder="Ministry / Dept..."
            className="px-3 h-11 rounded-lg border border-line bg-surface text-ink placeholder-ink-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
          <select value={deadlineDays} onChange={e => setDeadlineDays(e.target.value)}
            className="px-3 h-11 rounded-lg border border-line text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-brand-600">
            <option value="">Any deadline</option>
            <option value="7">Closing in 7 days</option>
            <option value="15">Closing in 15 days</option>
            <option value="30">Closing in 30 days</option>
          </select>
        </div>
      </div>

      {error && <div className="bg-surface-sunk text-alert text-sm rounded-lg p-4 mb-4 border border-line">{error}</div>}

      {loading ? <Spinner /> : results && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-ink-soft">
              <span className="font-semibold text-ink tabular-nums">{results.total.toLocaleString()}</span> tenders found
              <span className="text-ink-soft ml-2 tabular-nums">({results.durationMs}ms)</span>
            </p>
            <p className="text-xs text-caution hidden sm:block">{results.dataNote}</p>
          </div>

          {results.tenders.length === 0 ? (
            <div className="text-center py-16 text-ink-soft">
              <div className="text-4xl mb-3">📋</div>
              <p>No tenders found. Try different filters or run the scrapers first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.tenders.map(t => {
                const days = daysLeft(t.bidDeadline)
                const urgent = days !== null && days <= 7 && days >= 0
                return (
                  <div key={t.id} className="bg-surface rounded-xl border border-line p-5 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] transition-shadow">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sourceBadge(t.source)}`}>
                        {sourceLabel(t.source)}
                      </span>
                      {t.category && (
                        <span className="text-xs bg-surface-sunk text-ink-soft px-2 py-0.5 rounded-full">{t.category}</span>
                      )}
                      {urgent && (
                        <span className="inline-flex items-center gap-1 text-xs bg-surface-sunk text-alert font-medium px-2 py-0.5 rounded-full">
                          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-alert" />Closes in <span className="tabular-nums">{days}d</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-ink text-sm leading-snug mb-1 line-clamp-2">{t.title}</h3>
                    <p className="text-xs text-ink-soft mb-3">{t.organization}{t.state ? ` · ${t.state}` : ''}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-ink-soft">
                      {t.tenderValue && (
                        <span>💰 <strong className="tabular-nums">{formatINR(t.tenderValue)}</strong></span>
                      )}
                      <span>📅 <strong className="tabular-nums">{formatDate(t.bidDeadline)}</strong></span>
                      {t.bidNo && <span className="text-ink-soft tabular-nums">{t.bidNo}</span>}
                    </div>
                    {t.documentUrl && t.documentUrl !== 'https://bidplus.gem.gov.in/all-bids' && (
                      <a href={t.documentUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-3 inline-block text-xs text-brand-600 hover:underline">
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
      <div className="bg-surface rounded-xl border border-line p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search(1)}
            placeholder="Search by item, bid number..."
            className="flex-1 px-4 h-11 rounded-lg border border-line bg-surface text-ink placeholder-ink-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
          <input value={category} onChange={e => setCategory(e.target.value)}
            placeholder="Category..."
            className="w-40 px-3 h-11 rounded-lg border border-line bg-surface text-ink placeholder-ink-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
          <input value={ministry} onChange={e => setMinistry(e.target.value)}
            placeholder="Ministry..."
            className="w-40 px-3 h-11 rounded-lg border border-line bg-surface text-ink placeholder-ink-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
          <button onClick={() => search(1)}
            className="px-6 h-11 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700">
            Search
          </button>
        </div>
      </div>

      {error && <div className="bg-surface-sunk text-alert text-sm rounded-lg p-4 mb-4 border border-line">{error}</div>}

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

          <p className="text-sm text-ink-soft mb-4">
            <span className="font-semibold text-ink tabular-nums">{results.total.toLocaleString()}</span> bid results
          </p>

          {results.bids.length === 0 ? (
            <div className="text-center py-16 text-ink-soft">
              <div className="text-4xl mb-3">📊</div>
              <p>No bid results yet. Run the scrapers to populate data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-surface-sunk text-ink-soft text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Item / Bid No</th>
                    <th className="px-4 py-3 text-left">Ministry / Org</th>
                    <th className="px-4 py-3 text-left">Source</th>
                    <th className="px-4 py-3 text-right">Closed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {results.bids.map(b => (
                    <tr key={b.bidId} className="hover:bg-surface-sunk/60">
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink line-clamp-2 max-w-sm">{b.itemDescription || b.category || '—'}</div>
                        <div className="text-xs text-ink-soft mt-0.5 tabular-nums">{b.bidNo}</div>
                      </td>
                      <td className="px-4 py-3 text-ink-soft text-xs max-w-[200px]">
                        <div className="line-clamp-1">{b.ministry || b.organization || '—'}</div>
                        {b.state && <div className="text-ink-soft">{b.state}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-surface-sunk text-ink-soft">
                          {b.bidNo?.startsWith('GEM') ? 'GeM' : 'CPPP'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-soft text-xs whitespace-nowrap text-right tabular-nums">{formatDate(b.bidClosingDate)}</td>
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
      <div className="bg-surface rounded-xl border border-line p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search(1)}
            placeholder="Search vendor / company name..."
            className="flex-1 px-4 h-11 rounded-lg border border-line bg-surface text-ink placeholder-ink-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
          <input value={category} onChange={e => setCategory(e.target.value)}
            placeholder="Category..."
            className="w-40 px-3 h-11 rounded-lg border border-line bg-surface text-ink placeholder-ink-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
          <select value={state} onChange={e => setState(e.target.value)}
            className="w-40 px-3 h-11 rounded-lg border border-line text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-brand-600">
            <option value="">All States</option>
            {['Delhi','Maharashtra','Karnataka','Gujarat','Tamil Nadu','Telangana',
              'Uttar Pradesh','Rajasthan','Punjab','Haryana','West Bengal'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={() => search(1)}
            className="px-6 h-11 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700">
            Search
          </button>
        </div>
      </div>

      {error && <div className="bg-surface-sunk text-alert text-sm rounded-lg p-4 mb-4 border border-line">{error}</div>}

      {loading ? <Spinner /> : results && (
        <>
          <p className="text-sm text-ink-soft mb-4">
            <span className="font-semibold text-ink tabular-nums">{results.total.toLocaleString()}</span> vendors
          </p>

          {results.vendors.length === 0 ? (
            <div className="text-center py-16 text-ink-soft">
              <div className="text-4xl mb-3">🏢</div>
              <p>No vendor data yet. Bid results need to be scraped first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.vendors.map((v, idx) => (
                <div key={`${v.sellerName}-${v.state}`} className="bg-surface rounded-xl border border-line p-5 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold text-sm flex items-center justify-center tabular-nums">
                        {idx + 1 + (page - 1) * 25}
                      </div>
                      <div>
                        <h3 className="font-semibold text-ink">{v.sellerName}</h3>
                        <p className="text-xs text-ink-soft mt-0.5">{v.state || 'State not specified'}</p>
                        {v.topCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {v.topCategories.map(c => (
                              <span key={c} className="text-xs bg-surface-sunk text-ink-soft px-2 py-0.5 rounded-full">{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-ink tabular-nums">{v.totalOrders}</div>
                      <div className="text-xs text-ink-soft">orders won</div>
                      <div className="text-sm font-semibold text-brand-600 mt-1 tabular-nums">{formatINR(v.totalOrderValueINR)}</div>
                      <div className="text-xs text-ink-soft">total value</div>
                    </div>
                  </div>
                  {v.topMinistries.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-line text-xs text-ink-soft">
                      <span className="font-medium text-ink">Serves: </span>
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
    <div className="min-h-screen bg-paper">
      {/* Hero */}
      <div className="bg-surface border-b border-line">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <div className="inline-flex items-center gap-2 bg-surface-sunk text-positive text-xs font-medium px-3 py-1 rounded-full mb-4">
            <span className="w-2 h-2 bg-positive rounded-full animate-pulse" />
            Live data · Updated every 6 hours
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-3">
            Government Tender Search
          </h1>
          <p className="text-ink-soft text-lg max-w-2xl">
            Search live tenders from GeM, CPPP, and MahaTenders. Discover historical bid prices and top vendors winning government contracts.
          </p>
          <div className="flex flex-wrap gap-3 mt-5 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-ink-soft rounded-full" />GeM (Government e-Marketplace)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-ink-soft rounded-full" />CPPP (Central Public Procurement)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-ink-soft rounded-full" />MahaTenders (Maharashtra)
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab bar */}
        <div className="flex gap-1 bg-surface border border-line rounded-xl p-1 mb-8 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-brand-600 text-white'
                  : 'text-ink-soft hover:bg-surface-sunk'
              }`}>
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>

        {/* Active tab desc */}
        <p className="text-sm text-ink-soft mb-5">
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
