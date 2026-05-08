import { NextRequest, NextResponse } from 'next/server'

const CACHE_TTL = 6 * 60 * 60 * 1000

interface CacheEntry {
  bestKeyword: string
  allTried: string[]
  values: number[]
  labels: string[]
  cities: { name: string; value: number }[]
  ts: number
}
const cache = new Map<string, CacheEntry>()

// ── Keyword expansion ────────────────────────────────────────────────────────
// Strips noisy suffixes and generates progressively shorter, higher-signal variants.
// Google Trends geo=IN already filters to India, so "India" suffix actually
// suppresses results (very few people search that exact long-tail phrase).

const TRAILING_NOISE = [
  'india', 'in india', 'on demand', 'on-demand', 'service', 'services',
  'platform', 'app', 'startup', 'company', 'business', 'online', 'digital',
  'solution', 'solutions', 'provider', 'providers', 'maker', 'manufacturer',
  'manufacturing', 'production', 'based', 'driven', 'enabled',
]

// Category-specific synonym sets — tried when keyword matches a known theme
const SYNONYMS: Array<[RegExp, string[]]> = [
  [/tailor|alteration|darzi|stitching|stitch/i,       ['tailor at home', 'home tailor', 'darzi service', 'alteration service']],
  [/tiffin|dabba|meal delivery|food delivery/i,        ['tiffin service', 'home tiffin', 'dabba service', 'home food delivery']],
  [/yoga|fitness|wellness|zumba/i,                     ['yoga at home', 'home fitness', 'online yoga']],
  [/tutor|coaching|teaching|home teacher/i,            ['home tutor', 'online tuition', 'private tutor india']],
  [/plumb|electrician|carpenter|repair|handyman/i,     ['home repair service', 'electrician at home', 'plumber at home']],
  [/beauty|salon|makeup|parlour/i,                     ['home salon', 'beauty at home', 'makeup at home']],
  [/cleaning|housekeeping|maid|domestic/i,             ['home cleaning service', 'maid service india', 'housekeeping service']],
  [/solar|renewable|energy/i,                          ['solar panel india', 'solar installation', 'rooftop solar']],
  [/ev|electric vehicle|charging/i,                    ['electric vehicle india', 'EV charging station', 'electric car india']],
  [/packaging|box|carton|pouch/i,                      ['packaging manufacturer india', 'custom packaging india']],
  [/agri|farm|crop|kisan|farmer/i,                     ['agri business india', 'farming india', 'kisan']],
  [/export|import|trade/i,                             ['export business india', 'import export india']],
  [/pet|dog|cat|veterinary|vet/i,                      ['pet care india', 'dog grooming india', 'vet at home']],
  [/cloud kitchen|ghost kitchen|food|restaurant/i,     ['cloud kitchen india', 'ghost kitchen', 'online food business']],
  [/logistics|courier|delivery|supply chain/i,         ['courier service india', 'last mile delivery india']],
  [/real estate|property|flat|apartment/i,             ['real estate india', 'property management india']],
  [/fintech|lending|loan|nbfc|microfinance/i,          ['fintech india', 'digital lending india', 'loan app india']],
  [/saas|software|b2b software|erp/i,                  ['saas india', 'business software india', 'erp software india']],
  [/edtech|lms|e-learning|online course/i,             ['edtech india', 'online learning india', 'e-learning platform']],
  [/waste|recycl|scrap|e-waste/i,                      ['waste management india', 'recycling business india', 'scrap business']],
  [/water|purif|filtration/i,                          ['water purifier india', 'water filtration india']],
  [/tile spacer|tile|ceramic|construction material/i,  ['tile manufacturer india', 'ceramic tile india']],
  [/pvc|plastic|rubber/i,                              ['plastic manufacturer india', 'pvc products india']],
]

function expandKeywords(seed: string): string[] {
  const variants: string[] = []
  const lower = seed.trim().toLowerCase()

  // 1. Start with original
  variants.push(seed.trim())

  // 2. Strip trailing noise words iteratively
  let cleaned = lower
  let prev = ''
  while (cleaned !== prev) {
    prev = cleaned
    for (const noise of TRAILING_NOISE) {
      const re = new RegExp(`\\s+${noise.replace(/[-]/g, '[-]')}\\s*$`, 'i')
      cleaned = cleaned.replace(re, '').trim()
    }
  }
  if (cleaned !== lower && cleaned.length > 3) variants.push(cleaned)

  // 3. Progressive word truncation of the cleaned form (4-word, 3-word only — not 2)
  // Skip truncations that end with a stop/preposition word (they produce vague matches)
  const STOP_ENDINGS = new Set(['at', 'in', 'on', 'for', 'of', 'the', 'a', 'an', 'to', 'and', 'or', 'by', 'with'])
  const words = cleaned.split(/\s+/)
  for (let len = Math.min(words.length - 1, 4); len >= 3; len--) {
    const truncated = words.slice(0, len).join(' ')
    const lastWord = words[len - 1]?.toLowerCase()
    if (truncated.length > 3 && !STOP_ENDINGS.has(lastWord)) {
      variants.push(truncated)
    }
  }

  // 4. Add category-specific synonyms (prepend — try these before truncations)
  for (const [pattern, synonyms] of SYNONYMS) {
    if (pattern.test(seed)) {
      // Insert synonyms right after the cleaned form (index 2), before truncations
      variants.splice(2, 0, ...synonyms)
      break
    }
  }

  // Deduplicate, filter trivially short, cap at 4 (fewer API calls = less rate-limit risk)
  return [...new Set(variants)].filter(v => {
    const words = v.trim().split(/\s+/)
    const lastWord = words[words.length - 1]?.toLowerCase()
    return v.length > 3 && !STOP_ENDINGS.has(lastWord)
  }).slice(0, 4)
}

// ── Fetch helpers ────────────────────────────────────────────────────────────
async function fetchOverTime(googleTrends: any, keyword: string): Promise<number[]> {
  try {
    const raw = await googleTrends.interestOverTime({
      keyword,
      geo: 'IN',
      startTime: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
      granularTime: false,
    })
    const parsed = JSON.parse(raw)
    return (parsed?.default?.timelineData ?? []).map((p: any) => p.value[0] as number)
  } catch {
    return []
  }
}

async function fetchByRegion(googleTrends: any, keyword: string): Promise<{ name: string; value: number }[]> {
  try {
    const raw = await googleTrends.interestByRegion({
      keyword,
      geo: 'IN',
      resolution: 'REGION',
      startTime: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
    })
    const parsed = JSON.parse(raw)
    const regions: { geoName: string; value: number[] }[] = parsed?.default?.geoMapData ?? []
    return regions
      .map(r => ({ name: r.geoName, value: r.value[0] ?? 0 }))
      .filter(r => r.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  } catch {
    return []
  }
}

function avgSignal(values: number[]): number {
  if (!values.length) return 0
  return values.reduce((s, v) => s + v, 0) / values.length
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get('keyword')
  if (!keyword) return NextResponse.json({ error: 'keyword required' }, { status: 400 })

  const cacheKey = keyword.toLowerCase().trim()
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    const { ts, ...rest } = cached
    return NextResponse.json(rest)
  }

  const googleTrends = (await import('google-trends-api')).default
  const variants = expandKeywords(keyword)

  // Try all variants with small stagger to avoid rate limits.
  // Early stop only after we've tried at least the original + first synonym (index 2),
  // so category synonyms always get a chance.
  const results: { keyword: string; values: number[] }[] = []
  for (let i = 0; i < variants.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 1500))
    const values = await fetchOverTime(googleTrends, variants[i])
    results.push({ keyword: variants[i], values })
    // Stop early if good signal found, but try at least 3 variants so synonyms run
    if (i >= 2 && avgSignal(values) > 20) break
  }

  // Pick best variant — score = avgSignal × word-count bonus (prefer specific over vague)
  // A 3-word phrase with avg 18 beats a 2-word phrase with avg 20
  const score = (r: { keyword: string; values: number[] }) => {
    const wordCount = r.keyword.trim().split(/\s+/).length
    const bonus = wordCount >= 3 ? 1.2 : 1.0
    return avgSignal(r.values) * bonus
  }
  const best = results.reduce((a, b) => score(a) >= score(b) ? a : b)

  // Build labels for best result
  const now = new Date()
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const labels = best.values.map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (best.values.length - 1 - i), 1)
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  })

  // Fetch city breakdown for best keyword (with small delay)
  await new Promise(r => setTimeout(r, 300))
  const cities = await fetchByRegion(googleTrends, best.keyword)

  const entry: CacheEntry = {
    bestKeyword: best.keyword,
    allTried: results.map(r => r.keyword),
    values: best.values,
    labels,
    cities,
    ts: Date.now(),
  }
  cache.set(cacheKey, entry)

  const { ts, ...rest } = entry
  return NextResponse.json(rest)
}
