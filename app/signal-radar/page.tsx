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

// Category hues carry no good/bad meaning, so they collapse to the single indigo
// accent (The One Voice Rule). Signal intensity/velocity meaning is carried by the
// score, ScoreBar ramp and trend colors instead — not by the category chip hue.
const SIGNAL_CHIP = 'bg-brand-600/10 text-brand-600 border-brand-600/20'
const COLOR_MAP: Record<string, string> = {
  emerald: SIGNAL_CHIP,
  blue:    SIGNAL_CHIP,
  lime:    SIGNAL_CHIP,
  rose:    SIGNAL_CHIP,
  violet:  SIGNAL_CHIP,
  orange:  SIGNAL_CHIP,
  pink:    SIGNAL_CHIP,
  indigo:  SIGNAL_CHIP,
  slate:   SIGNAL_CHIP,
  teal:    SIGNAL_CHIP,
  amber:   SIGNAL_CHIP,
  yellow:  SIGNAL_CHIP,
}

const TREND_CONFIG = {
  rising:   { label: '↑ Rising',   cls: 'text-positive font-bold' },
  stable:   { label: '→ Stable',   cls: 'text-ink-soft dark:text-paper-dark/70' },
  declining:{ label: '↓ Declining',cls: 'text-alert' },
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
    <div className="h-1.5 w-full rounded-full bg-surface-sunk dark:bg-surface-dark-raised overflow-hidden">
      <div
        className="h-full rounded-full bg-brand-600 transition-all duration-700"
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
    <div className={`rounded-2xl border bg-surface dark:bg-surface-dark overflow-hidden transition-shadow hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] ${colorCls.split(' ').filter(c => c.startsWith('border')).join(' ')}`}>
      <button
        className="w-full text-left p-5"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl flex-shrink-0">{signal.icon}</span>
            <div className="min-w-0">
              <p className="font-semibold text-ink dark:text-paper-dark truncate">{signal.label}</p>
              <p className="mt-0.5 text-xs text-ink-soft dark:text-paper-dark/70 tabular-nums">
                {signal.articleCount} articles · {signal.sourceCount} sources
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-lg font-bold text-brand-600 tabular-nums">{signal.score}</span>
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
        <div className="border-t border-line dark:border-line-dark px-5 pb-5">
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft dark:text-paper-dark/70">
              Recent Articles
            </p>
            <Link
              href={signal.ideaQuery}
              className="text-xs font-semibold text-brand-600 hover:underline"
              onClick={e => e.stopPropagation()}
            >
              See related ideas →
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {signal.articles.slice(0, 8).map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand-600 flex-shrink-0" />
                <div className="min-w-0">
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink dark:text-paper-dark hover:text-brand-600 dark:hover:text-brand-600 line-clamp-2 leading-snug"
                  >
                    {a.title}
                  </a>
                  <p className="mt-0.5 text-[11px] text-ink-soft/70 dark:text-paper-dark/50">
                    {a.sourceName} · {timeAgo(a.pubDate)}
                    {a.isPainPoint && (
                      <span className="ml-1.5 rounded-full bg-alert/10 px-1.5 py-0.5 text-[10px] font-bold text-alert">
                        Pain Point
                      </span>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {signal.articleCount > 8 && (
            <p className="mt-3 text-xs text-ink-soft/70 dark:text-paper-dark/50 tabular-nums">
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
    <div className="mx-auto max-w-5xl px-4 py-14 text-ink dark:text-paper-dark">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-ink-soft dark:text-paper-dark/70">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-brand-600 dark:hover:text-brand-600">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-ink dark:text-paper-dark">Signal Radar</span>
      </nav>

      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Live Intelligence</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-ink dark:text-paper-dark">
              📡 Signal Radar
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-ink-soft dark:text-paper-dark/70">
              Real-time signals from 20+ Indian and global sources — startups, policy, Reddit,
              Hacker News — scored by velocity and volume to surface what&apos;s actually heating up.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex-shrink-0 min-h-[44px] rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            {loading ? 'Fetching…' : '↻ Refresh'}
          </button>
        </div>

        {data && (
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <div className="rounded-xl border border-line dark:border-line-dark bg-surface-sunk dark:bg-surface-dark-raised px-4 py-2.5">
              <p className="text-xs text-ink-soft dark:text-paper-dark/70 uppercase tracking-widest font-semibold">Articles</p>
              <p className="mt-0.5 text-xl font-bold text-ink dark:text-paper-dark tabular-nums">{data.articleCount}</p>
            </div>
            <div className="rounded-xl border border-line dark:border-line-dark bg-surface-sunk dark:bg-surface-dark-raised px-4 py-2.5">
              <p className="text-xs text-ink-soft dark:text-paper-dark/70 uppercase tracking-widest font-semibold">Signals</p>
              <p className="mt-0.5 text-xl font-bold text-ink dark:text-paper-dark tabular-nums">{signals.length}</p>
            </div>
            <div className="rounded-xl border border-line dark:border-line-dark bg-surface-sunk dark:bg-surface-dark-raised px-4 py-2.5">
              <p className="text-xs text-ink-soft dark:text-paper-dark/70 uppercase tracking-widest font-semibold">Rising</p>
              <p className="mt-0.5 text-xl font-bold text-positive tabular-nums">
                {signals.filter(s => s.trend === 'rising').length}
              </p>
            </div>
            <div className="rounded-xl border border-line dark:border-line-dark bg-surface-sunk dark:bg-surface-dark-raised px-4 py-2.5">
              <p className="text-xs text-ink-soft dark:text-paper-dark/70 uppercase tracking-widest font-semibold">Fetched in</p>
              <p className="mt-0.5 text-xl font-bold text-ink dark:text-paper-dark tabular-nums">{(data.durationMs / 1000).toFixed(1)}s</p>
            </div>
            <button
              onClick={() => setShowSources(v => !v)}
              className="rounded-xl border border-line dark:border-line-dark bg-surface-sunk dark:bg-surface-dark-raised px-4 py-2.5 text-left hover:bg-line dark:hover:bg-line-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <p className="text-xs text-ink-soft dark:text-paper-dark/70 uppercase tracking-widest font-semibold">Sources</p>
              <p className="mt-0.5 text-sm font-semibold text-brand-600 tabular-nums">
                {data.sourcesSummary.fetched.length + data.sourcesSummary.reddit.filter(r => r.count > 0).length} live {showSources ? '▲' : '▼'}
              </p>
            </button>
          </div>
        )}

        {showSources && data && (
          <div className="mt-4 rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5 text-sm">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-ink dark:text-paper-dark mb-2">✅ Fetched ({data.sourcesSummary.fetched.length})</p>
                <ul className="space-y-1">
                  {data.sourcesSummary.fetched.map(s => (
                    <li key={s} className="text-ink-soft dark:text-paper-dark/70 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-positive flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                {data.sourcesSummary.failed.length > 0 && (
                  <>
                    <p className="font-semibold text-ink dark:text-paper-dark mb-2">⚠️ Failed ({data.sourcesSummary.failed.length})</p>
                    <ul className="space-y-1 mb-4">
                      {data.sourcesSummary.failed.map(s => (
                        <li key={s} className="text-ink-soft/70 dark:text-paper-dark/50 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-alert flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <p className="font-semibold text-ink dark:text-paper-dark mb-2">📱 Reddit Communities</p>
                <ul className="space-y-1 mb-4">
                  {data.sourcesSummary.reddit.map(s => (
                    <li key={s.name} className="text-ink-soft dark:text-paper-dark/70 flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${s.count > 0 ? 'bg-brand-600' : 'bg-line dark:bg-line-dark'}`} />
                      {s.name}
                      {s.count > 0 && (
                        <span className="ml-auto text-[11px] font-semibold text-brand-600 tabular-nums">{s.count} posts</span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="text-ink-soft dark:text-paper-dark/70 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-caution flex-shrink-0" />
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
            className={`rounded-full px-4 py-2 min-h-[44px] text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
              tab === t
                ? 'bg-brand-600 text-white hover:bg-brand-700'
                : 'bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-paper-dark/70 hover:bg-line dark:hover:bg-line-dark'
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
          <div className="inline-flex items-center gap-3 text-ink-soft dark:text-paper-dark/70">
            <span className="inline-block h-5 w-5 flex-shrink-0 rounded-full border-2 border-brand-600/30 border-t-brand-600 animate-spin" />
            <span className="text-sm font-medium">Scanning 20+ sources across India and the web…</span>
          </div>
          <p className="mt-2 text-xs text-ink-soft/70 dark:text-paper-dark/50">Usually takes 2–5 seconds</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-alert/30 bg-alert/5 dark:bg-alert/10 p-6 text-center">
          <p className="text-sm font-semibold text-alert">Failed to load signals: {error}</p>
          <button onClick={load} className="mt-3 text-sm text-brand-600 hover:underline">
            Try again
          </button>
        </div>
      )}

      {/* Pain Points Tab */}
      {!loading && !error && tab === 'pain' && data && (
        <div className="space-y-3">
          {data.painPoints.length === 0 ? (
            <p className="py-12 text-center text-ink-soft dark:text-paper-dark/70 text-sm">
              No pain point signals found in this batch.
            </p>
          ) : (
            data.painPoints.map((p, i) => (
              <a
                key={i}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-2xl border border-alert/30 bg-surface dark:bg-surface-dark p-4 hover:border-alert/60 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] transition-all"
              >
                <span className="mt-0.5 h-2 w-2 rounded-full bg-alert flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink dark:text-paper-dark line-clamp-2 leading-snug">
                    {p.title}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-soft/70 dark:text-paper-dark/50">
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
            <p className="py-12 text-center text-ink-soft dark:text-paper-dark/70 text-sm">
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
        <p className="mt-10 text-center text-xs text-ink-soft/70 dark:text-paper-dark/50">
          Generated {new Date(data.generatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} ·
          Cached for 1 hour · Scores based on velocity × recency × source diversity
        </p>
      )}
    </div>
  )
}
