'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface Article {
  title: string
  link: string
  source: string
  sourceName: string
  pubDate: string
  isPainPoint: boolean
}

interface Signal {
  categoryId: string
  label: string
  icon: string
  color: string
  ideaQuery: string
  articles: Article[]
  articleCount: number
  sourceCount: number
  score: number
  velocity: number
  trend: 'rising' | 'stable' | 'declining'
  topKeywords: string[]
}

interface RadarData {
  generatedAt: string
  durationMs: number
  articleCount: number
  sourcesSummary: {
    fetched: string[]
    failed: string[]
    reddit: { name: string; count: number }[]
    hn: string
  }
  signals: Signal[]
  painPoints: {
    title: string
    link: string
    source: string
    pubDate: string
  }[]
}

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  blue:    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  lime:    'bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-300 border-lime-200 dark:border-lime-800',
  rose:    'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  violet:  'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  orange:  'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  pink:    'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  indigo:  'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  slate:   'bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  teal:    'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  amber:   'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  yellow:  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
}

const TREND_CONFIG = {
  rising:   { label: '↑ Rising',   cls: 'text-emerald-600 dark:text-emerald-400 font-bold' },
  stable:   { label: '→ Stable',   cls: 'text-slate-500 dark:text-slate-400' },
  declining:{ label: '↓ Declining',cls: 'text-rose-500 dark:text-rose-400' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1)  return `${Math.floor(diff / 60000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.min(100, (score / max) * 100)
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <div
        className="h-full rounded-full bg-indigo-500 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function SignalCard({ signal, maxScore, expanded, onToggle }: {
  signal: Signal
  maxScore: number
  expanded: boolean
  onToggle: () => void
}) {
  const colorCls = COLOR_MAP[signal.color] ?? COLOR_MAP.slate
  const trend = TREND_CONFIG[signal.trend]

  return (
    <div className={`rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden transition-shadow hover:shadow-md ${colorCls.split(' ').filter(c => c.startsWith('border')).join(' ')}`}>
      <button
        className="w-full text-left p-5"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl flex-shrink-0">{signal.icon}</span>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{signal.label}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {signal.articleCount} articles · {signal.sourceCount} sources
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{signal.score}</span>
            <span className={`text-xs ${trend.cls}`}>{trend.label}</span>
          </div>
        </div>

        <div className="mt-3">
          <ScoreBar score={signal.score} max={maxScore} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {signal.topKeywords.slice(0, 5).map(kw => (
            <span key={kw} className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${colorCls}`}>
              {kw}
            </span>
          ))}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-5 pb-5">
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Recent Articles
            </p>
            <Link
              href={signal.ideaQuery}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              onClick={e => e.stopPropagation()}
            >
              See related ideas →
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {signal.articles.slice(0, 8).map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                <div className="min-w-0">
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 leading-snug"
                  >
                    {a.title}
                  </a>
                  <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                    {a.sourceName} · {timeAgo(a.pubDate)}
                    {a.isPainPoint && (
                      <span className="ml-1.5 rounded-full bg-rose-100 dark:bg-rose-900/30 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        Pain Point
                      </span>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {signal.articleCount > 8 && (
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
              + {signal.articleCount - 8} more articles in this category
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function SignalRadarPage() {
  const [data, setData] = useState<RadarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'all' | 'rising' | 'pain'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showSources, setShowSources] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/signal-radar')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const signals = data?.signals ?? []
  const filtered = tab === 'rising'
    ? signals.filter(s => s.trend === 'rising')
    : tab === 'pain'
    ? signals.filter(s => s.articles.some(a => a.isPainPoint))
    : signals

  const maxScore = signals[0]?.score ?? 1

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">Signal Radar</span>
      </nav>

      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Live Intelligence</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
              📡 Signal Radar
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Real-time signals from 20+ Indian and global sources — startups, policy, Reddit,
              Hacker News — scored by velocity and volume to surface what&apos;s actually heating up.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex-shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 text-sm font-semibold transition-colors"
          >
            {loading ? 'Fetching…' : '↻ Refresh'}
          </button>
        </div>

        {data && (
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Articles</p>
              <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-slate-100">{data.articleCount}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Signals</p>
              <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-slate-100">{signals.length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Rising</p>
              <p className="mt-0.5 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {signals.filter(s => s.trend === 'rising').length}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Fetched in</p>
              <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-slate-100">{(data.durationMs / 1000).toFixed(1)}s</p>
            </div>
            <button
              onClick={() => setShowSources(v => !v)}
              className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Sources</p>
              <p className="mt-0.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {data.sourcesSummary.fetched.length + data.sourcesSummary.reddit.filter(r => r.count > 0).length} live {showSources ? '▲' : '▼'}
              </p>
            </button>
          </div>
        )}

        {showSources && data && (
          <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 text-sm">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">✅ Fetched ({data.sourcesSummary.fetched.length})</p>
                <ul className="space-y-1">
                  {data.sourcesSummary.fetched.map(s => (
                    <li key={s} className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                {data.sourcesSummary.failed.length > 0 && (
                  <>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">⚠️ Failed ({data.sourcesSummary.failed.length})</p>
                    <ul className="space-y-1 mb-4">
                      {data.sourcesSummary.failed.map(s => (
                        <li key={s} className="text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">📱 Reddit Communities</p>
                <ul className="space-y-1 mb-4">
                  {data.sourcesSummary.reddit.map(s => (
                    <li key={s.name} className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${s.count > 0 ? 'bg-orange-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      {s.name}
                      {s.count > 0 && (
                        <span className="ml-auto text-[11px] font-semibold text-orange-600 dark:text-orange-400">{s.count} posts</span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  {data.sourcesSummary.hn}
                </p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['all', 'rising', 'pain'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t === 'all' && `All Signals (${signals.length})`}
            {t === 'rising' && `↑ Rising (${signals.filter(s => s.trend === 'rising').length})`}
            {t === 'pain' && `🔴 Pain Points (${data?.painPoints.length ?? 0})`}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-20 text-center">
          <div className="inline-flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span className="inline-block h-5 w-5 flex-shrink-0 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
            <span className="text-sm font-medium">Scanning 20+ sources across India and the web…</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Usually takes 2–5 seconds</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-6 text-center">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">Failed to load signals: {error}</p>
          <button onClick={load} className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            Try again
          </button>
        </div>
      )}

      {/* Pain Points Tab */}
      {!loading && !error && tab === 'pain' && data && (
        <div className="space-y-3">
          {data.painPoints.length === 0 ? (
            <p className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              No pain point signals found in this batch.
            </p>
          ) : (
            data.painPoints.map((p, i) => (
              <a
                key={i}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-2xl border border-rose-100 dark:border-rose-900/50 bg-white dark:bg-slate-900 p-4 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-sm transition-all"
              >
                <span className="mt-0.5 h-2 w-2 rounded-full bg-rose-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                    {p.title}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    {p.source} · {timeAgo(p.pubDate)}
                  </p>
                </div>
              </a>
            ))
          )}
        </div>
      )}

      {/* Signal Cards */}
      {!loading && !error && tab !== 'pain' && (
        <>
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              No {tab} signals in this batch.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {filtered.map(signal => (
                <SignalCard
                  key={signal.categoryId}
                  signal={signal}
                  maxScore={maxScore}
                  expanded={expandedId === signal.categoryId}
                  onToggle={() => setExpandedId(id => id === signal.categoryId ? null : signal.categoryId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Footer note */}
      {data && !loading && (
        <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">
          Generated {new Date(data.generatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} ·
          Cached for 1 hour · Scores based on velocity × recency × source diversity
        </p>
      )}
    </div>
  )
}
