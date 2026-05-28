#!/usr/bin/env node
/**
 * scripts/ingest-startups/from-wikipedia.mjs
 *
 * Phase 2 (b): Long-form story enricher.
 *
 * For each startup with a `wikipedia_title`:
 *   1. GET /api/rest_v1/page/summary/{title}
 *        → extract (HTML-stripped, plain text)         → `short_description`
 *        → description (one-line, capitalised)         → `tagline`
 *        → originalimage (Commons URL)                 → `logo` (only if doc has no logo)
 *   2. GET /api/rest_v1/page/html/{title}
 *        → lead paragraphs (before first <h2>)         → `long_story` (first 2-3 paragraphs)
 *        → "History" or "Founding" section paragraphs  → appended into `long_story`
 *        → h3 entries with year in heading             → `milestones[]`
 *
 * The HTML→Portable Text converter is intentionally minimal: <p>, <a>, <b>,
 * <i>, <em>, <strong> only. Images, infoboxes, navboxes are skipped — they
 * pull in too much chrome. This is enough for the /startups page to render a
 * paragraph block with inline links.
 *
 * Flags: --dry-run --limit N --only <slug,slug>
 *
 * Wikipedia API rate limit: ~200 req/s per IP, requires a real User-Agent.
 */

import {
  loadEnv, parseArgs, loadSeedList, getSanityClient, ensureStartupExists,
  startupDocId, dataSourceEntry, politeFetch, sleep, rkey, noEmDash,
  mergeArrayField,
} from './_lib.mjs'

loadEnv()
const args = parseArgs()
const DRY = !!args['dry-run']
const LIMIT = parseInt(args.limit ?? '0', 10) || 0
const ONLY = args.only ? new Set(String(args.only).split(',').map(s => s.trim())) : null

const WP_API = 'https://en.wikipedia.org/api/rest_v1'

async function fetchSummary(title) {
  const url = `${WP_API}/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`
  const res = await politeFetch(url, { allowNotOk: true })
  if (!res.ok) return null
  return res.json()
}

async function fetchHtml(title) {
  const url = `${WP_API}/page/html/${encodeURIComponent(title.replace(/ /g, '_'))}`
  const res = await politeFetch(url, { accept: 'text/html', allowNotOk: true })
  if (!res.ok) return null
  return res.text()
}

// Wikitext for infobox parsing. Action API, not REST.
async function fetchWikitext(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title.replace(/ /g, '_'))}&prop=wikitext&format=json&formatversion=2`
  const res = await politeFetch(url, { accept: 'application/json', allowNotOk: true })
  if (!res.ok) return null
  const json = await res.json().catch(() => null)
  return json?.parse?.wikitext || null
}

// Extract revenue / net income / employees / etc from a Wikipedia company
// infobox. Returns { revenue_inr, profit_inr, employees, year }.
//
// Indian company infoboxes typically use one of:
//   | revenue = {{INR}} {{increase}} '''2,500 crore''' (FY2024)
//   | revenue = {{INRConvert|2500|c}} (US$300 million) (2024)
//   | revenue = ₹2,500 crore (FY24)
//
// We strip templates with a regex sweep, then look for the first ₹/INR + number + crore
// pattern. Crore = 1e7 INR; lakh = 1e5; arab = 1e9.
function extractInfoboxFinancials(wikitext) {
  if (!wikitext) return null
  // Grab the first infobox block (between {{Infobox ... }} balanced braces — naive).
  const ibStart = wikitext.search(/\{\{\s*Infobox/i)
  if (ibStart < 0) return null
  // Walk forward balancing { and } to find the matching close.
  let depth = 0
  let end = ibStart
  for (let i = ibStart; i < wikitext.length - 1; i++) {
    if (wikitext[i] === '{' && wikitext[i + 1] === '{') { depth++; i++ }
    else if (wikitext[i] === '}' && wikitext[i + 1] === '}') { depth--; i++; if (depth === 0) { end = i + 1; break } }
  }
  const infobox = wikitext.slice(ibStart, end)

  const grabField = (re) => {
    const m = infobox.match(re)
    return m ? m[1].trim() : null
  }
  const rawRevenue  = grabField(/^\s*\|\s*revenue\s*=\s*([^\n]+)/im)
  const rawProfit   = grabField(/^\s*\|\s*(?:net_income|profit)\s*=\s*([^\n]+)/im)
  const rawEmployees = grabField(/^\s*\|\s*(?:num_employees|employees)\s*=\s*([^\n]+)/im)
  const rawYear     = grabField(/^\s*\|\s*fiscal_year\s*=\s*([^\n]+)/im) || grabField(/\((?:FY)?(\d{4})\)/i)

  return {
    revenue_inr: parseInrAmount(rawRevenue),
    profit_inr:  parseInrAmount(rawProfit),
    employees:   parseEmployeeCount(rawEmployees),
    fiscal_year: parseFy(rawYear ?? rawRevenue ?? ''),
  }
}

function parseInrAmount(raw) {
  if (!raw) return null
  // Strip wiki templates {{...}} recursively (cheap, no nesting beyond 1 level)
  let s = raw
    .replace(/\{\{INRConvert\|([\d.,]+)\|c\}\}/gi, (_, n) => `${n} crore`)
    .replace(/\{\{INRConvert\|([\d.,]+)\|l\}\}/gi, (_, n) => `${n} lakh`)
    .replace(/\{\{INRConvert\|([\d.,]+)\|b\}\}/gi, (_, n) => `${n} billion`)
    .replace(/\{\{INR\}\}/gi, '₹')
    .replace(/\{\{[^}]*\}\}/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
    .replace(/'''/g, '')
    .replace(/&nbsp;/g, ' ')

  // Match e.g. "₹2,500 crore" or "2,500 crore" or "₹2.5 billion" or "US$300 million"
  // Prefer INR/₹ matches. If none, fall back to USD * 83.
  const inrRe = /(?:₹|INR|Rs\.?)\s*([\d,]+(?:\.\d+)?)\s*(crore|cr\.?|lakh|lac|arab|billion|million|trillion)?/i
  const inr = s.match(inrRe)
  if (inr) {
    return toRupees(inr[1], inr[2])
  }
  // Fallback: bare number followed by 'crore' (very common)
  const bare = s.match(/([\d,]+(?:\.\d+)?)\s*(crore|cr\.?|lakh|lac|arab|billion|million)/i)
  if (bare) return toRupees(bare[1], bare[2])
  // USD fallback. 1 USD ≈ 83 INR (rough).
  const usd = s.match(/(?:US\$|\$)\s*([\d,]+(?:\.\d+)?)\s*(billion|million|trillion)?/i)
  if (usd) {
    const usdAmt = parseFloat(usd[1].replace(/,/g, ''))
    const mult = (() => {
      switch ((usd[2] || '').toLowerCase()) {
        case 'trillion': return 1e12
        case 'billion':  return 1e9
        case 'million':  return 1e6
        default: return 1
      }
    })()
    return Math.round(usdAmt * mult * 83)
  }
  return null
}

function toRupees(numStr, unit) {
  const n = parseFloat(numStr.replace(/,/g, ''))
  if (Number.isNaN(n)) return null
  switch ((unit || 'crore').toLowerCase().replace('.', '').replace(/^cr$/, 'crore')) {
    case 'crore':    return Math.round(n * 1_00_00_000)         // 1 cr = 1e7
    case 'lakh':
    case 'lac':      return Math.round(n * 1_00_000)            // 1 lakh = 1e5
    case 'arab':     return Math.round(n * 1_00_00_00_000)      // 1 arab = 1e9
    case 'billion':  return Math.round(n * 1e9 * 83)            // assume USD-flavoured
    case 'million':  return Math.round(n * 1e6 * 83)
    case 'trillion': return Math.round(n * 1e12 * 83)
    default:         return Math.round(n * 1_00_00_000)
  }
}

function parseEmployeeCount(raw) {
  if (!raw) return null
  const s = raw.replace(/\{\{[^}]*\}\}/g, '').replace(/<[^>]+>/g, '').replace(/[,]/g, '')
  const m = s.match(/(\d{2,})/)
  return m ? parseInt(m[1], 10) : null
}

function parseFy(raw) {
  if (!raw) return null
  const m = String(raw).match(/(?:FY)?\s*(20\d{2})/i)
  if (!m) return null
  return `FY${m[1].slice(-2)}`
}

// ────────────────────────────────────────────────────────────────────────────
// Minimal HTML → Portable Text. No deps. Handles <p>, <a>, <b>/<strong>,
// <i>/<em>. Skips everything else (figures, tables, infoboxes, navboxes).
// ────────────────────────────────────────────────────────────────────────────

function stripTags(s) {
  return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function htmlEntities(s) {
  return String(s)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#x([\da-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g,        (_, d) => String.fromCharCode(parseInt(d, 10)))
}

// Convert a single <p>…</p> chunk into a Portable Text block with marks.
function paragraphToBlock(pInner) {
  // Strip footnote references like <sup class="reference">…</sup>.
  let html = pInner.replace(/<sup[^>]*class="[^"]*reference[^"]*"[^>]*>.*?<\/sup>/gi, '')
                   .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
                   .replace(/<style[^>]*>.*?<\/style>/gi, '')

  const children = []
  const markDefs = []
  let i = 0

  function addText(text, marks = []) {
    if (!text) return
    children.push({ _type: 'span', _key: rkey('s'), text: noEmDash(htmlEntities(text)), marks })
  }

  while (i < html.length) {
    // Find next tag
    const tagStart = html.indexOf('<', i)
    if (tagStart === -1) { addText(html.slice(i)); break }
    if (tagStart > i) addText(html.slice(i, tagStart))

    // Read full tag
    const tagEnd = html.indexOf('>', tagStart)
    if (tagEnd === -1) { addText(html.slice(tagStart)); break }
    const tag = html.slice(tagStart, tagEnd + 1)
    i = tagEnd + 1

    const open = tag.match(/^<(\w+)([^>]*)>$/i)
    if (!open) continue
    const name = open[1].toLowerCase()
    const attrs = open[2]

    if (['b', 'strong', 'i', 'em', 'a'].includes(name)) {
      // Find matching close tag (greedy with depth=1 — simple)
      const closeRe = new RegExp(`</${name}\\s*>`, 'i')
      const closeMatch = html.slice(i).match(closeRe)
      if (!closeMatch) continue
      const inner = html.slice(i, i + closeMatch.index)
      i += closeMatch.index + closeMatch[0].length

      let marks = []
      if (name === 'b' || name === 'strong') marks = ['strong']
      else if (name === 'i' || name === 'em') marks = ['em']
      else if (name === 'a') {
        const hrefMatch = attrs.match(/href="([^"]+)"/i)
        if (hrefMatch) {
          let href = hrefMatch[1]
          // Wikipedia relative links → absolute
          if (href.startsWith('./')) href = 'https://en.wikipedia.org/wiki/' + href.slice(2)
          if (href.startsWith('/'))  href = 'https://en.wikipedia.org' + href
          const key = rkey('mk')
          markDefs.push({ _key: key, _type: 'link', href })
          marks = [key]
        }
      }
      addText(stripTags(inner), marks)
    } else {
      // Skip unknown elements but keep inner text only (lightweight).
      const closeRe = new RegExp(`</${name}\\s*>`, 'i')
      const closeMatch = html.slice(i).match(closeRe)
      if (closeMatch) {
        const inner = html.slice(i, i + closeMatch.index)
        i += closeMatch.index + closeMatch[0].length
        addText(stripTags(inner))
      }
    }
  }

  // Drop empty / whitespace-only blocks
  const totalText = children.map((c) => c.text).join('').trim()
  if (!totalText) return null

  return {
    _type: 'block',
    _key: rkey('b'),
    style: 'normal',
    markDefs,
    children: children.filter((c) => c.text && c.text.trim()),
  }
}

// Extract paragraphs from the lead (before the first <h2>) and from the
// History/Founding section (after <h2>History</h2> until the next <h2>).
function extractSections(html) {
  if (!html) return { lead: [], history: [], milestones: [] }

  // Parse out script/style noise
  const stripped = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<table[\s\S]*?<\/table>/gi, '')

  const sections = stripped.split(/<h2[\s\S]*?<\/h2>/i)
  const headerNames = []
  for (const m of stripped.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)) {
    headerNames.push(stripTags(m[1]).toLowerCase())
  }

  const lead = parasFrom(sections[0]).slice(0, 3)
  let historyIdx = headerNames.findIndex((h) => /history|founding|origin|background/i.test(h))
  const history = historyIdx >= 0 ? parasFrom(sections[historyIdx + 1] ?? '').slice(0, 6) : []

  // Milestones: walk through history HTML for any <h3> with a year in it,
  // pair with the following paragraph.
  const milestones = []
  if (historyIdx >= 0) {
    const historyHtml = sections[historyIdx + 1] ?? ''
    const subSections = historyHtml.split(/<h3[\s\S]*?<\/h3>/i)
    const h3Headings = []
    for (const m of historyHtml.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)) {
      h3Headings.push(stripTags(m[1]))
    }
    h3Headings.forEach((heading, idx) => {
      const yearMatch = heading.match(/(19|20)\d{2}/)
      if (!yearMatch) return
      const year = yearMatch[0]
      const para = parasFrom(subSections[idx + 1] ?? '')[0]
      const description = para
        ? para.children.map((c) => c.text).join('').slice(0, 280)
        : ''
      milestones.push({
        _key: rkey('m'),
        _type: 'object',
        date: `${year}-01-01`,
        title: noEmDash(heading),
        description: noEmDash(description),
      })
    })
  }

  return { lead, history, milestones }
}

function parasFrom(htmlChunk) {
  if (!htmlChunk) return []
  const out = []
  for (const m of htmlChunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const block = paragraphToBlock(m[1])
    if (block) out.push(block)
  }
  return out
}

// ────────────────────────────────────────────────────────────────────────────
// Logo upload helper. Skips if doc already has a logo.
// ────────────────────────────────────────────────────────────────────────────
async function uploadAsset(client, url, filename) {
  try {
    const res = await politeFetch(url, { accept: 'image/*' })
    const buf = Buffer.from(await res.arrayBuffer())
    const asset = await client.assets.upload('image', buf, { filename })
    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  } catch (e) {
    return null
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────
async function run() {
  const seedList = loadSeedList(LIMIT)
  let targets = ONLY ? seedList.filter((s) => ONLY.has(s.slug)) : seedList
  targets = targets.filter((s) => s.wikipedia_title)

  console.log(`[wikipedia] Processing ${targets.length} startups (dry=${DRY})`)

  let client = null
  if (!DRY) client = await getSanityClient()

  const stats = { hit: 0, miss: 0, skipped: 0, errors: 0, logos: 0, milestones: 0 }

  for (const seed of targets) {
    try {
      const summary = await fetchSummary(seed.wikipedia_title)
      if (!summary || summary.type === 'disambiguation') {
        console.log(`  MISS  ${seed.name}`)
        stats.miss++
        await sleep(150)
        continue
      }

      const tagline      = noEmDash(summary.description || '').slice(0, 160)
      const shortDesc    = noEmDash(summary.extract || '').slice(0, 400)
      const imageSourceUrl = summary.originalimage?.source || summary.thumbnail?.source

      let html = null
      try { html = await fetchHtml(seed.wikipedia_title) } catch {}
      const sections = extractSections(html)
      const longStory = [...sections.lead, ...sections.history]
      const milestones = sections.milestones

      console.log(`  HIT   ${seed.name} (paragraphs=${longStory.length}, milestones=${milestones.length})`)

      if (DRY) {
        console.log(`    tagline: ${tagline.slice(0, 80)}`)
        console.log(`    short:   ${shortDesc.slice(0, 80)}`)
        if (milestones[0]) console.log(`    m[0]:    ${milestones[0].title} (${milestones[0].date})`)
        stats.hit++; stats.milestones += milestones.length
        await sleep(150)
        continue
      }

      await ensureStartupExists(client, seed, 'seed-list + Wikipedia')
      const docId = startupDocId(seed.slug)

      // Upload logo if doc doesn't already have one
      const current = await client.fetch('*[_id == $id][0]{ logo }', { id: docId })
      const patch = client.patch(docId)
        .setIfMissing({ tagline, short_description: shortDesc })

      if (!current?.logo && imageSourceUrl) {
        const img = await uploadAsset(client, imageSourceUrl, `${seed.slug}-logo`)
        if (img) {
          patch.setIfMissing({ logo: { ...img, alt: `${seed.name} logo` } })
          stats.logos++
        }
      }

      if (longStory.length) patch.setIfMissing({ long_story: longStory })
      patch.set({ last_updated_at: new Date().toISOString() })

      // Commit setIfMissing-style fields first. Array merges below use a
      // separate read-modify-write commit to avoid Sanity's append+setIfMissing
      // ordering bug (append silently no-ops on a missing field).
      await patch.commit({ autoGenerateArrayKeys: true })

      // Infobox financials → financials[]
      try {
        const wikitext = await fetchWikitext(seed.wikipedia_title)
        const fin = extractInfoboxFinancials(wikitext)
        if (fin && (fin.revenue_inr || fin.profit_inr || fin.employees)) {
          const fy = fin.fiscal_year || 'Latest (Wikipedia)'
          const added = await mergeArrayField(client, docId, 'financials', [{
            _key: rkey('fin'),
            _type: 'financialSnapshot',
            fiscal_year: fy,
            revenue: fin.revenue_inr || undefined,
            profit:  fin.profit_inr  || undefined,
            employee_count: fin.employees || undefined,
            currency: 'INR',
            source: 'Wikipedia infobox',
            source_url: `https://en.wikipedia.org/wiki/${encodeURIComponent(seed.wikipedia_title.replace(/ /g, '_'))}`,
          }], 'fiscal_year')
          if (added > 0) {
            stats.infobox_financials = (stats.infobox_financials || 0) + 1
            console.log(`        +infobox fin: rev=${fin.revenue_inr ? '₹'+(fin.revenue_inr/1_00_00_000).toFixed(0)+'cr' : '-'} prof=${fin.profit_inr ? '₹'+(fin.profit_inr/1_00_00_000).toFixed(0)+'cr' : '-'} emp=${fin.employees || '-'} fy=${fy}`)
          }
        }
      } catch (e) {
        // Don't fail the wiki step on infobox parse error
      }

      if (milestones.length) {
        const added = await mergeArrayField(client, docId, 'milestones', milestones, 'title')
        stats.milestones += added
      }
      await mergeArrayField(client, docId, 'data_sources', [
        dataSourceEntry({ source: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${encodeURIComponent(seed.wikipedia_title.replace(/ /g, '_'))}` }),
      ], 'source')
      stats.hit++
      await sleep(200)
    } catch (e) {
      console.log(`  ERROR ${seed.name}: ${e.message}`)
      stats.errors++
    }
  }

  console.log('\n[wikipedia] Done.', stats)
  return stats
}

run().catch((e) => { console.error(e); process.exit(1) })
