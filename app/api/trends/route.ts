import { NextRequest, NextResponse } from 'next/server'

const CACHE_TTL      = 6 * 60 * 60 * 1000
const CALL_TIMEOUT   = 12000

interface CacheEntry {
  bestKeyword: string
  allTried: string[]
  values: number[]
  labels: string[]
  cities: { name: string; value: number }[]
  seasonalInsight: string | null
  ts: number
}
const cache = new Map<string, CacheEntry>()

// ── Keyword expansion ─────────────────────────────────────────────────────────
const TRAILING_NOISE = [
  'india','in india','on demand','on-demand','service','services','platform',
  'app','startup','company','business','online','digital','solution','solutions',
  'provider','providers','maker','manufacturer','manufacturing','production',
  'based','driven','enabled',
]
const SYNONYMS: Array<[RegExp, string[]]> = [
  [/tailor|alteration|darzi|stitching/i,            ['tailor at home','home tailor','darzi service']],
  [/tiffin|dabba|meal delivery/i,                   ['tiffin service','home tiffin','dabba service']],
  [/yoga|fitness|wellness|zumba/i,                  ['yoga at home','home fitness','online yoga']],
  [/tutor|coaching|teaching|home teacher/i,         ['home tutor','online tuition','private tutor']],
  [/plumb|electrician|carpenter|repair|handyman/i,  ['home repair service','electrician at home']],
  [/beauty|salon|makeup|parlour/i,                  ['home salon','beauty at home','makeup at home']],
  [/cleaning|housekeeping|maid|domestic/i,          ['home cleaning service','maid service']],
  [/solar|renewable energy/i,                       ['solar panel india','rooftop solar']],
  [/ev|electric vehicle|charging/i,                 ['electric vehicle india','EV charging station']],
  [/agri|farm|crop|kisan/i,                         ['agri business india','farming india']],
  [/export|import|trade/i,                          ['export business india','import export india']],
  [/pet|dog|cat|veterinary/i,                       ['pet care india','dog grooming india']],
  [/cloud kitchen|ghost kitchen/i,                  ['cloud kitchen india','ghost kitchen']],
  [/logistics|courier|last.mile/i,                  ['courier service india','last mile delivery']],
  [/fintech|lending|loan|nbfc/i,                    ['fintech india','digital lending india']],
  [/saas|b2b software|erp/i,                        ['saas india','business software india']],
  [/edtech|e-learning|online course/i,              ['edtech india','online learning india']],
  [/waste|recycl|scrap/i,                           ['waste management india','recycling business']],
  [/pvc|plastic|rubber/i,                           ['plastic manufacturer india','pvc products india']],
  [/tile|ceramic|construction material/i,           ['tile manufacturer india','ceramic tile india']],
]
const STOP_ENDINGS = new Set(['at','in','on','for','of','the','a','an','to','and','or','by','with'])

function expandKeywords(seed: string): string[] {
  const variants: string[] = [seed.trim()]
  const lower = seed.trim().toLowerCase()
  let cleaned = lower
  let prev = ''
  while (cleaned !== prev) {
    prev = cleaned
    for (const n of TRAILING_NOISE) {
      cleaned = cleaned.replace(new RegExp(`\\s+${n.replace(/[-]/g,'[-]')}\\s*$`,'i'),'').trim()
    }
  }
  if (cleaned !== lower && cleaned.length > 3) variants.push(cleaned)

  const words = cleaned.split(/\s+/)
  for (let len = Math.min(words.length - 1, 4); len >= 3; len--) {
    const t = words.slice(0, len).join(' ')
    if (!STOP_ENDINGS.has(words[len - 1]?.toLowerCase())) variants.push(t)
  }
  for (const [pat, syns] of SYNONYMS) {
    if (pat.test(seed)) { variants.splice(2, 0, ...syns); break }
  }
  return [...new Set(variants)].filter(v => {
    const ws = v.trim().split(/\s+/)
    return v.length > 3 && !STOP_ENDINGS.has(ws[ws.length - 1]?.toLowerCase())
  }).slice(0, 4)
}

// ── Seasonal analysis ─────────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const FESTIVAL_CONTEXT: Record<string, string> = {
  Jan: 'Makar Sankranti / Pongal / Republic Day',
  Feb: 'Valentine\'s Day / spring wedding season',
  Mar: 'Holi / Ugadi / wedding season',
  Apr: 'Ugadi / Ram Navami / wedding season peak',
  May: 'Akshaya Tritiya / summer weddings',
  Jun: 'Eid / early monsoon',
  Jul: 'Rath Yatra / monsoon',
  Aug: 'Independence Day / Raksha Bandhan / Ganesh Chaturthi',
  Sep: 'Ganesh Chaturthi / Navratri begins',
  Oct: 'Navratri / Dussehra / pre-Diwali',
  Nov: 'Diwali / Bhai Dooj / wedding season peak',
  Dec: 'Christmas / year-end / winter weddings',
}

function analyseSeasonality(values: number[], labels: string[]): string | null {
  if (values.length < 12) return null
  const byMonth: Record<number, number[]> = {}
  values.forEach((v, i) => {
    const m = labels[i]?.match(/^(\w{3})/)
    const idx = m ? MONTH_NAMES.indexOf(m[1]) : -1
    if (idx >= 0) { byMonth[idx] = byMonth[idx] ?? []; byMonth[idx].push(v) }
  })
  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length
  const nonZero = values.filter(v => v > 0)
  if (!nonZero.length) return null
  const overallAvg = avg(nonZero)
  const threshold = overallAvg * 1.6

  const peakMonths = Object.entries(byMonth)
    .filter(([, vals]) => avg(vals) >= threshold)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([idx]) => MONTH_NAMES[parseInt(idx)])

  if (!peakMonths.length) return null

  // Group consecutive months
  const grouped: string[][] = []
  for (const m of peakMonths) {
    const last = grouped[grouped.length - 1]
    const lastIdx = last ? MONTH_NAMES.indexOf(last[last.length - 1]) : -1
    const curIdx  = MONTH_NAMES.indexOf(m)
    if (last && curIdx - lastIdx === 1) last.push(m)
    else grouped.push([m])
  }

  const rangeStr = grouped.map(g =>
    g.length === 1 ? g[0] : `${g[0]}–${g[g.length - 1]}`
  ).join(' and ')

  const contexts = [...new Set(peakMonths.map(m => FESTIVAL_CONTEXT[m]))].slice(0, 2)
  return `Demand peaks in ${rangeStr} — likely driven by ${contexts.join(' / ')}`
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>(r => setTimeout(() => r(fallback), ms))])
}

async function fetchOverTime(
  gt: any, keyword: string, geo: string, months: number
): Promise<{ values: number[]; timedOut: boolean }> {
  try {
    const raw = await withTimeout(
      gt.interestOverTime({
        keyword, geo,
        startTime: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000),
        granularTime: false,
      }),
      CALL_TIMEOUT, null
    )
    if (raw === null) return { values: [], timedOut: true }
    // Google returns an HTML page when rate-limiting
    if (typeof raw === 'string' && (raw as string).trimStart().startsWith('<')) return { values: [], timedOut: true }
    const parsed = JSON.parse(raw)
    return { values: (parsed?.default?.timelineData ?? []).map((p: any) => p.value[0] as number), timedOut: false }
  } catch { return { values: [], timedOut: true } }
}

async function fetchByRegion(
  gt: any, keyword: string, geo: string, resolution: 'REGION' | 'CITY'
): Promise<{ name: string; value: number }[]> {
  try {
    const raw = await withTimeout(
      gt.interestByRegion({ keyword, geo, resolution,
        startTime: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
      }),
      CALL_TIMEOUT, null
    )
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return (parsed?.default?.geoMapData ?? [])
      .map((r: any) => ({ name: r.geoName, value: r.value[0] ?? 0 }))
      .filter((r: any) => r.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10)
  } catch { return [] }
}

function avgSignal(values: number[]) {
  return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const p       = req.nextUrl.searchParams
  const keyword = p.get('keyword') ?? ''
  const geo     = p.get('geo') ?? 'IN'
  const period  = p.get('period') ?? '5y'    // '1y' | '2y' | '5y'

  if (!keyword) return NextResponse.json({ error: 'keyword required' }, { status: 400 })

  const months   = period === '1y' ? 12 : period === '2y' ? 24 : 60
  const cacheKey = `${keyword.toLowerCase().trim()}|${geo}|${period}`

  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    const { ts, ...rest } = cached
    return NextResponse.json(rest)
  }

  const gt       = (await import('google-trends-api')).default
  const variants = geo.startsWith('IN') ? expandKeywords(keyword) : [keyword.trim()]

  // Try variants, pick best
  const results: { keyword: string; values: number[] }[] = []
  let anyTimedOut = false
  for (let i = 0; i < variants.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 1500))
    const { values, timedOut } = await fetchOverTime(gt, variants[i], geo, months)
    if (timedOut) anyTimedOut = true
    results.push({ keyword: variants[i], values })
    if (i >= 2 && avgSignal(values) > 20) break
  }

  const score = (r: { keyword: string; values: number[] }) => {
    const wc = r.keyword.trim().split(/\s+/).length
    return avgSignal(r.values) * (wc >= 3 ? 1.2 : 1.0)
  }
  const best = results.reduce((a, b) => score(a) >= score(b) ? a : b)

  // No data at all — return rateLimited if any call timed out, never cache so retry works
  if (!best.values.length) {
    return NextResponse.json({ rateLimited: anyTimedOut, values: [], labels: [], cities: [], bestKeyword: keyword, allTried: variants, seasonalInsight: null })
  }

  // Build labels
  const now = new Date()
  const labels = best.values.map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (best.values.length - 1 - i), 1)
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
  })

  // Geo breakdown (states if India-level, cities if state-level)
  await new Promise(r => setTimeout(r, 400))
  const resolution = geo === 'IN' ? 'REGION' : 'CITY'
  const cities = await fetchByRegion(gt, best.keyword, geo, resolution)

  const seasonalInsight = geo.startsWith('IN') ? analyseSeasonality(best.values, labels) : null

  const entry: CacheEntry = {
    bestKeyword: best.keyword,
    allTried: results.map(r => r.keyword),
    values: best.values,
    labels,
    cities,
    seasonalInsight,
    ts: Date.now(),
  }
  cache.set(cacheKey, entry)

  const { ts, ...rest } = entry
  return NextResponse.json(rest)
}
