import { NextResponse } from 'next/server'
import { RSS_SOURCES, API_SOURCES } from '@/lib/signal-radar/sources'
import { parseRSS, parseReddit, parseHN, computeSignals, extractPainPoints, type Article } from '@/lib/signal-radar/processor'

export const runtime   = 'nodejs'
export const revalidate = 3600   // cache full response for 1 hour

async function safeFetch(url: string, timeout = 6000): Promise<string | null> {
  try {
    const ac = new AbortController()
    const tid = setTimeout(() => ac.abort(), timeout)
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BusinessIdeasBot/1.0)' },
      next: { revalidate: 3600 },
    })
    clearTimeout(tid)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function fetchRSSSources(): Promise<{ articles: Article[]; fetched: string[]; failed: string[] }> {
  const results = await Promise.allSettled(
    RSS_SOURCES.map(async src => {
      const text = await safeFetch(src.url)
      if (!text) return { src, articles: [] as Article[], ok: false }
      return { src, articles: parseRSS(text, src.id, src.name), ok: true }
    })
  )

  const articles: Article[] = []
  const fetched: string[]   = []
  const failed: string[]    = []

  for (const r of results) {
    if (r.status === 'fulfilled') {
      if (r.value.ok && r.value.articles.length > 0) {
        articles.push(...r.value.articles)
        fetched.push(r.value.src.name)
      } else {
        failed.push(r.value.src.name)
      }
    }
  }

  return { articles, fetched, failed }
}

async function fetchRedditSources(): Promise<{ articles: Article[]; summary: { name: string; count: number }[] }> {
  const articles: Article[] = []
  const summary: { name: string; count: number }[] = []
  const weekAgo = Math.floor((Date.now() - 7 * 24 * 3_600_000) / 1000)

  await Promise.allSettled(
    API_SOURCES.reddit.map(async src => {
      const url  = `https://www.reddit.com/r/${src.subreddit}/top.json?limit=25&t=week`
      const text = await safeFetch(url, 8000)
      if (!text) {
        summary.push({ name: src.name, count: 0 })
        return
      }
      try {
        const json = JSON.parse(text)
        const posts = parseReddit(json, src.id, src.name)
        const recent = posts.filter(p => p.pubDate.getTime() / 1000 > weekAgo)
        articles.push(...recent)
        summary.push({ name: src.name, count: recent.length })
      } catch {
        summary.push({ name: src.name, count: 0 })
      }
    })
  )

  return { articles, summary }
}

async function fetchHackerNews(): Promise<Article[]> {
  const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 3_600_000) / 1000)
  // Search HN Algolia for India-relevant tech/startup stories
  const queries = ['india startup', 'india tech', 'india business', 'india funding']
  const articles: Article[] = []

  await Promise.allSettled(
    queries.map(async q => {
      const url  = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=15&numericFilters=created_at_i>${sevenDaysAgo}`
      const text = await safeFetch(url)
      if (!text) return
      try {
        articles.push(...parseHN(JSON.parse(text)))
      } catch { /* ignore */ }
    })
  )

  // Also fetch general top stories for tech trend signal
  const topUrl  = `https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=30&numericFilters=created_at_i>${sevenDaysAgo},points>50`
  const topText = await safeFetch(topUrl)
  if (topText) {
    try { articles.push(...parseHN(JSON.parse(topText))) } catch { /* ignore */ }
  }

  return articles
}

export async function GET() {
  const startMs = Date.now()

  const [rssResult, redditResult, hnArticles] = await Promise.all([
    fetchRSSSources(),
    fetchRedditSources(),
    fetchHackerNews(),
  ])

  const allArticles = [
    ...rssResult.articles,
    ...redditResult.articles,
    ...hnArticles,
  ]

  // Dedup by title similarity (normalised)
  const seen = new Set<string>()
  const deduped = allArticles.filter(a => {
    const key = a.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const signals    = computeSignals(deduped)
  const painPoints = extractPainPoints(deduped)

  return NextResponse.json({
    generatedAt:   new Date().toISOString(),
    durationMs:    Date.now() - startMs,
    articleCount:  deduped.length,
    sourcesSummary: {
      fetched: rssResult.fetched,
      failed:  rssResult.failed,
      reddit:  redditResult.summary,
      hn:      'Hacker News (Algolia API)',
    },
    signals,
    painPoints: painPoints.map(a => ({
      title:      a.title,
      link:       a.link,
      source:     a.sourceName,
      pubDate:    a.pubDate.toISOString(),
    })),
  })
}
