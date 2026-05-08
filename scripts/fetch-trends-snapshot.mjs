/**
 * Pre-fetch Google Trends data for all business ideas and store in lib/trends/snapshot.json
 * Run: node scripts/fetch-trends-snapshot.mjs
 * Re-run monthly to refresh stale data (>30 days old entries are replaced).
 */

import { createClient } from '@sanity/client'
import googleTrends from 'google-trends-api'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SNAPSHOT_PATH = join(ROOT, 'lib/trends/snapshot.json')
const SNAPSHOT_TTL_MS = 30 * 24 * 60 * 60 * 1000
const CALL_TIMEOUT = 15000
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ── Sanity ────────────────────────────────────────────────────────────────────
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

// ── Keyword expansion (mirrors route.ts) ──────────────────────────────────────
const TRAILING_NOISE = [
  'india','in india','on demand','on-demand','service','services','platform',
  'app','startup','company','business','online','digital','solution','solutions',
  'provider','providers','maker','manufacturer','manufacturing','production',
  'based','driven','enabled',
]
const SYNONYMS = [
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

function expandKeywords(seed) {
  const variants = [seed.trim()]
  const lower = seed.trim().toLowerCase()
  let cleaned = lower, prev = ''
  while (cleaned !== prev) {
    prev = cleaned
    for (const n of TRAILING_NOISE)
      cleaned = cleaned.replace(new RegExp(`\\s+${n.replace(/[-]/g,'[-]')}\\s*$`,'i'),'').trim()
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

// ── Festival context (mirrors route.ts) ───────────────────────────────────────
const FESTIVAL_CONTEXT = {
  Jan:'Makar Sankranti / Pongal / Republic Day', Feb:"Valentine's Day / spring wedding season",
  Mar:'Holi / Ugadi / wedding season', Apr:'Ugadi / Ram Navami / wedding season peak',
  May:'Akshaya Tritiya / summer weddings', Jun:'Eid / early monsoon',
  Jul:'Rath Yatra / monsoon', Aug:'Independence Day / Raksha Bandhan / Ganesh Chaturthi',
  Sep:'Ganesh Chaturthi / Navratri begins', Oct:'Navratri / Dussehra / pre-Diwali',
  Nov:'Diwali / Bhai Dooj / wedding season peak', Dec:'Christmas / year-end / winter weddings',
}
function analyseSeasonality(values, labels) {
  if (values.length < 12) return null
  const byMonth = {}
  values.forEach((v, i) => {
    const m = labels[i]?.match(/^(\w{3})/)
    const idx = m ? MONTH_NAMES.indexOf(m[1]) : -1
    if (idx >= 0) { byMonth[idx] = byMonth[idx] ?? []; byMonth[idx].push(v) }
  })
  const avg = arr => arr.reduce((s,v) => s+v, 0) / arr.length
  const nonZero = values.filter(v => v > 0)
  if (!nonZero.length) return null
  const overallAvg = avg(nonZero)
  const threshold = overallAvg * 1.6
  const peakMonths = Object.entries(byMonth)
    .filter(([, vals]) => avg(vals) >= threshold)
    .sort(([a],[b]) => parseInt(a) - parseInt(b))
    .map(([idx]) => MONTH_NAMES[parseInt(idx)])
  if (!peakMonths.length) return null
  const grouped = []
  for (const m of peakMonths) {
    const last = grouped[grouped.length - 1]
    const lastIdx = last ? MONTH_NAMES.indexOf(last[last.length - 1]) : -1
    const curIdx = MONTH_NAMES.indexOf(m)
    if (last && curIdx - lastIdx === 1) last.push(m)
    else grouped.push([m])
  }
  const rangeStr = grouped.map(g => g.length === 1 ? g[0] : `${g[0]}–${g[g.length-1]}`).join(' and ')
  const contexts = [...new Set(peakMonths.map(m => FESTIVAL_CONTEXT[m]))].slice(0, 2)
  return `Demand peaks in ${rangeStr} — likely driven by ${contexts.join(' / ')}`
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────
function withTimeout(p, ms) {
  return Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))])
}

async function fetchOverTime(keyword, geo, months) {
  try {
    const raw = await withTimeout(
      googleTrends.interestOverTime({
        keyword, geo,
        startTime: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000),
        granularTime: false,
      }), CALL_TIMEOUT)
    if (!raw) return { values: [], timedOut: true }
    const s = typeof raw === 'string' ? raw : String(raw)
    // Google returns HTML when rate-limiting (may be missing leading chars after JSONP strip)
    if (!s.trimStart().startsWith('{') && !s.trimStart().startsWith('[')) return { values: [], timedOut: true }
    const parsed = JSON.parse(s)
    return { values: (parsed?.default?.timelineData ?? []).map(p => p.value[0]), timedOut: false }
  } catch { return { values: [], timedOut: true } }
}

async function fetchByRegion(keyword, geo) {
  try {
    const raw = await withTimeout(
      googleTrends.interestByRegion({
        keyword, geo, resolution: 'REGION',
        startTime: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
      }), CALL_TIMEOUT)
    if (!raw) return []
    const s = typeof raw === 'string' ? raw : String(raw)
    if (!s.trimStart().startsWith('{') && !s.trimStart().startsWith('[')) return []
    const parsed = JSON.parse(s)
    return (parsed?.default?.geoMapData ?? [])
      .map(r => ({ name: r.geoName, value: r.value[0] ?? 0 }))
      .filter(r => r.value > 0).sort((a,b) => b.value - a.value).slice(0, 10)
  } catch { return [] }
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

// Back-off schedule when rate-limited: 3min → 5min → 10min → 15min → 15min …
const BACKOFF_MS = [3*60e3, 5*60e3, 10*60e3, 15*60e3]

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  let snapshot = {}
  try { snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) } catch {}

  const ideas = await sanity.fetch(`*[_type == "businessIdea" && defined(google_trends_keyword)]{google_trends_keyword}`)
  const keywords = [...new Set(ideas.map(i => i.google_trends_keyword).filter(Boolean))]
  console.log(`Found ${keywords.length} unique keywords to process`)

  let saved = 0, skipped = 0, noData = 0
  const months = 60 // 5y

  // Consecutive rate-limit streak counter — triggers longer back-offs
  let rateLimitStreak = 0

  for (let i = 0; i < keywords.length; i++) {
    const kw = keywords[i]
    const cacheKey = `${kw.toLowerCase().trim()}|IN|5y`

    const existing = snapshot[cacheKey]
    if (existing && Date.now() - existing.ts < SNAPSHOT_TTL_MS) {
      skipped++
      process.stdout.write(`\r[${i+1}/${keywords.length}] Skip: ${kw.slice(0,45)}          `)
      continue
    }

    process.stdout.write(`\r[${i+1}/${keywords.length}] Fetching: ${kw.slice(0,45)}          `)

    const variants = expandKeywords(kw)
    let gotData = false

    // Retry the whole keyword with back-off if rate-limited
    for (let attempt = 0; ; attempt++) {
      const results = []
      let anyTimedOut = false

      for (let j = 0; j < variants.length; j++) {
        if (j > 0) await sleep(2000)
        const { values, timedOut } = await fetchOverTime(variants[j], 'IN', months)
        if (timedOut) anyTimedOut = true
        results.push({ keyword: variants[j], values })
        const avg = vals => vals.length ? vals.reduce((s,v) => s+v,0)/vals.length : 0
        if (j >= 2 && avg(values) > 20) break
      }

      const avgSig = vals => vals.length ? vals.reduce((s,v) => s+v,0)/vals.length : 0
      const score  = r => avgSig(r.values) * (r.keyword.trim().split(/\s+/).length >= 3 ? 1.2 : 1.0)
      const best   = results.reduce((a, b) => score(a) >= score(b) ? a : b)

      if (best.values.length) {
        // Success — build and save entry
        rateLimitStreak = 0
        const now = new Date()
        const labels = best.values.map((_, idx) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (best.values.length - 1 - idx), 1)
          return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
        })
        await sleep(1500)
        const cities = await fetchByRegion(best.keyword, 'IN')
        const seasonalInsight = analyseSeasonality(best.values, labels)

        snapshot[cacheKey] = {
          bestKeyword: best.keyword,
          allTried: results.map(r => r.keyword),
          values: best.values, labels, cities, seasonalInsight,
          ts: Date.now(),
        }
        writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2))
        saved++
        gotData = true
        break
      }

      if (!anyTimedOut) {
        // Genuine no-data (not a rate limit) — move on
        noData++
        break
      }

      // Rate limited — back off and retry
      rateLimitStreak++
      const backoff = BACKOFF_MS[Math.min(rateLimitStreak - 1, BACKOFF_MS.length - 1)]
      const mins = Math.round(backoff / 60000)
      process.stdout.write(`\n  Rate limited (streak ${rateLimitStreak}). Waiting ${mins}min before retry…\n`)
      await sleep(backoff)
    }

    if (!gotData && rateLimitStreak === 0) {
      process.stdout.write(`\n  No Trends data for "${kw}"\n`)
    }

    // Normal inter-idea delay (3s when not rate-limited)
    await sleep(3000)
  }

  console.log(`\n\nDone. Saved: ${saved}  Skipped (fresh): ${skipped}  No data: ${noData}`)
}

main().catch(console.error)
