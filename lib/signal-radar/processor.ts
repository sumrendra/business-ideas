import { OPPORTUNITY_CATEGORIES, PAIN_POINT_PHRASES, STOPWORDS } from './keywords'

export interface Article {
  title: string
  link: string
  description: string
  pubDate: Date
  source: string
  sourceName: string
  text: string           // combined lowercased title + description
  isPainPoint: boolean
}

export interface Signal {
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

// ── RSS Parser ──────────────────────────────────────────────────────────────

function getTagContent(xml: string, tag: string): string {
  // CDATA
  const cdata = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
  if (cdata) return cdata[1].trim()
  // Regular
  const plain = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return plain ? plain[1].trim() : ''
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ')
}

function stripHtml(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

export function parseRSS(xml: string, sourceId: string, sourceName: string): Article[] {
  const articles: Article[] = []
  // Support both RSS <item> and Atom <entry>
  const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g
  let m: RegExpExecArray | null

  while ((m = itemRegex.exec(xml)) !== null) {
    const raw = m[1]
    const title       = stripHtml(getTagContent(raw, 'title'))
    const link        = getTagContent(raw, 'link') || getTagContent(raw, 'guid') || getTagContent(raw, 'id')
    const description = stripHtml(getTagContent(raw, 'description') || getTagContent(raw, 'summary') || getTagContent(raw, 'content'))
    const pubRaw      = getTagContent(raw, 'pubDate') || getTagContent(raw, 'published') || getTagContent(raw, 'updated') || getTagContent(raw, 'dc:date')

    if (!title || title.length < 5) continue
    const pubDate = pubRaw ? new Date(pubRaw) : new Date()
    if (isNaN(pubDate.getTime())) continue

    const text = (title + ' ' + description).toLowerCase()
    const isPainPoint = PAIN_POINT_PHRASES.some(p => text.includes(p))

    articles.push({ title, link, description: description.slice(0, 300), pubDate, source: sourceId, sourceName, text, isPainPoint })
  }

  return articles
}

// ── Reddit JSON Parser ───────────────────────────────────────────────────────

export function parseReddit(json: Record<string, unknown>, sourceId: string, sourceName: string): Article[] {
  try {
    const children = (json as { data: { children: { data: Record<string, unknown> }[] } }).data?.children ?? []
    return children
      .filter(c => c.data.score && Number(c.data.score) > 5)
      .map(c => {
        const d = c.data
        const title = String(d.title ?? '')
        const selftext = String(d.selftext ?? '').slice(0, 500)
        const text = (title + ' ' + selftext).toLowerCase()
        return {
          title,
          link: `https://reddit.com${d.permalink}`,
          description: selftext.slice(0, 300),
          pubDate: new Date(Number(d.created_utc) * 1000),
          source: sourceId,
          sourceName,
          text,
          isPainPoint: PAIN_POINT_PHRASES.some(p => text.includes(p)),
        }
      })
      .filter(a => a.title.length > 5)
  } catch {
    return []
  }
}

// ── HN Algolia Parser ────────────────────────────────────────────────────────

export function parseHN(json: Record<string, unknown>): Article[] {
  try {
    const hits = (json as { hits: Record<string, unknown>[] }).hits ?? []
    return hits.map(h => {
      const title = String(h.title ?? h.story_title ?? '')
      const text  = title.toLowerCase()
      return {
        title,
        link: String(h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`),
        description: '',
        pubDate: new Date(String(h.created_at)),
        source: 'hackernews',
        sourceName: 'Hacker News',
        text,
        isPainPoint: PAIN_POINT_PHRASES.some(p => text.includes(p)),
      }
    }).filter(a => a.title.length > 5)
  } catch {
    return []
  }
}

// ── Keyword Extractor ────────────────────────────────────────────────────────

export function extractTopKeywords(articles: Article[], topN = 6): string[] {
  const freq = new Map<string, number>()

  for (const a of articles) {
    const words = a.text.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)
    // Count bigrams and single words
    for (let i = 0; i < words.length; i++) {
      const w = words[i]
      if (w.length < 4 || STOPWORDS.has(w)) continue
      freq.set(w, (freq.get(w) ?? 0) + 1)
      if (i + 1 < words.length) {
        const bg = `${w} ${words[i + 1]}`
        if (words[i + 1].length >= 3 && !STOPWORDS.has(words[i + 1])) {
          freq.set(bg, (freq.get(bg) ?? 0) + 0.8)
        }
      }
    }
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN * 3)
    .map(([k]) => k)
    .filter(k => k.split(' ').every(w => !STOPWORDS.has(w)))
    .slice(0, topN)
}

// ── Signal Scorer ────────────────────────────────────────────────────────────

function recencyWeight(pubDate: Date): number {
  const hoursAgo = (Date.now() - pubDate.getTime()) / 3_600_000
  if (hoursAgo < 24)  return 3.0
  if (hoursAgo < 48)  return 2.0
  if (hoursAgo < 96)  return 1.5
  return 1.0
}

export function computeSignals(allArticles: Article[]): Signal[] {
  const now   = Date.now()
  const week  = 7 * 24 * 3_600_000
  const recent = allArticles.filter(a => now - a.pubDate.getTime() < week)
  const prior  = allArticles.filter(a => {
    const age = now - a.pubDate.getTime()
    return age >= week && age < 2 * week
  })

  const signals: Signal[] = []

  for (const cat of OPPORTUNITY_CATEGORIES) {
    const match = (a: Article) => cat.keywords.some(kw => a.text.includes(kw))

    const recentHits = recent.filter(match)
    const priorHits  = prior.filter(match)
    if (recentHits.length === 0) continue

    const sourceCount = new Set(recentHits.map(a => a.source)).size
    const velocity    = priorHits.length > 0
      ? recentHits.length / priorHits.length
      : recentHits.length >= 3 ? 2.0 : 1.0

    const weightedCount = recentHits.reduce((s, a) => s + recencyWeight(a.pubDate), 0)
    const score = weightedCount * Math.sqrt(sourceCount) * Math.min(2.5, velocity)

    signals.push({
      categoryId:   cat.id,
      label:        cat.label,
      icon:         cat.icon,
      color:        cat.color,
      ideaQuery:    cat.ideaQuery,
      articles:     recentHits.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()).slice(0, 12),
      articleCount: recentHits.length,
      sourceCount,
      score:        Math.round(score * 10) / 10,
      velocity:     Math.round(velocity * 10) / 10,
      trend:        velocity >= 1.4 ? 'rising' : velocity <= 0.7 ? 'declining' : 'stable',
      topKeywords:  extractTopKeywords(recentHits),
    })
  }

  return signals.sort((a, b) => b.score - a.score)
}

// Pain points = articles from any category that contain pain-point phrases
export function extractPainPoints(articles: Article[]): Article[] {
  const week = 7 * 24 * 3_600_000
  return articles
    .filter(a => a.isPainPoint && (Date.now() - a.pubDate.getTime()) < week)
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 30)
}
