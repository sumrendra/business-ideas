// Template for auto-generated blog seed scripts.
// The blog-writer agent copies this to scripts/seed-post-<slug>.mjs and fills in `post` and `coverImage`.
// Mirrors scripts/seed-posts.mjs + scripts/seed-post-images.mjs.
//
// Cover-image strategy:
//   1. If UNSPLASH_ACCESS_KEY is set, the agent inlines a search query (themed photo, fresh per post).
//   2. Otherwise the agent inlines a direct Unsplash photo URL it picked from CATEGORY_FALLBACK
//      (or hand-picked while drafting). Either way the script downloads + uploads to Sanity.

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, mkdirSync, createReadStream } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

// ── Auth ──────────────────────────────────────────────────────────────────────

let authToken = process.env.SANITY_WRITE_TOKEN
if (!authToken) {
  try {
    const cliConfig = JSON.parse(readFileSync(join(process.env.HOME, '.config/sanity/config.json'), 'utf8'))
    authToken = cliConfig.authToken
  } catch {}
}
if (!authToken) authToken = process.env.SANITY_API_TOKEN
if (!authToken) {
  console.error('ERROR: No Sanity auth token. Set SANITY_WRITE_TOKEN in .env.local.')
  process.exit(1)
}

const client = createClient({
  projectId: '5p3rso81',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: authToken,
  useCdn: false,
})

// ── PortableText helpers ──────────────────────────────────────────────────────

let _key = 0
const key = () => `k${++_key}`

const p   = (text) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const h2  = (text) => ({ _type: 'block', _key: key(), style: 'h2',     markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const h3  = (text) => ({ _type: 'block', _key: key(), style: 'h3',     markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const li  = (text) => ({ _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1, markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const num = (text) => ({ _type: 'block', _key: key(), style: 'normal', listItem: 'number', level: 1, markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const faq = (question, answer) => ({ question, answer })

// pLink — paragraph with inline links to business ideas.
// Args alternate plain string / link-array / plain string / link-array / ...
//   pLink('See the ', [{ text: 'cloud kitchen idea', slug: 'cloud-kitchen' }], ' for benchmarks.')
const pLink = (...parts) => {
  const markDefs = []
  const children = []
  for (const part of parts) {
    if (typeof part === 'string') {
      if (part) children.push({ _type: 'span', _key: key(), text: part, marks: [] })
    } else if (Array.isArray(part)) {
      for (const { text, slug } of part) {
        const mk = key()
        markDefs.push({ _key: mk, _type: 'link', href: `/business-ideas/${slug}` })
        children.push({ _type: 'span', _key: key(), text, marks: [mk] })
      }
    }
  }
  return { _type: 'block', _key: key(), style: 'normal', markDefs, children }
}

// ── Cover image config (filled in by blog-writer agent) ───────────────────────
//
// EITHER provide a direct URL the agent picked (preferred — no API key needed):
//   const coverImage = {
//     url: 'https://images.unsplash.com/photo-<id>?w=1600&q=80',
//     alt: 'Descriptive alt text relevant to the post',
//   }
//
// OR provide a search query (requires UNSPLASH_ACCESS_KEY in .env.local):
//   const coverImage = {
//     query: 'india d2c brand marketing',
//     alt: 'Descriptive alt text relevant to the post',
//   }

const coverImage = {
  url: '__COVER_URL__',
  alt: '__COVER_ALT__',
}

// ── Post payload (filled in by blog-writer agent) ─────────────────────────────

const post = {
  _type: 'post',
  title: '__TITLE__',
  slug: { _type: 'slug', current: '__SLUG__' },
  excerpt: '__EXCERPT__',
  category: '__CATEGORY__', // single primary category from the 8-item fixed list
  tags: [/* '__TAG_1__', '__TAG_2__', ... cross-discovery tags incl. other category names lowercased */],
  reading_time: 0, // __READING_TIME__
  featured: false,
  author: 'BusinessIdeas.live',
  published_at: new Date().toISOString(),
  seo_title: '__SEO_TITLE__',
  seo_description: '__SEO_DESCRIPTION__',
  body: [
    // Filled by agent. Mix of p(), h2(), h3(), li(), num(), and pLink() for inline idea backlinks.
  ],
  faqs: [
    // faq('Question?', 'Answer.'),
  ],
}

// ── Helpers: image fetch + upload ─────────────────────────────────────────────

async function unsplashSearch(query, accessKey) {
  const u = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`
  const res = await fetch(u, { headers: { Authorization: `Client-ID ${accessKey}` } })
  if (!res.ok) throw new Error(`Unsplash search failed (${res.status}) for query "${query}"`)
  const data = await res.json()
  return data.results || []
}

async function resolveImageUrl(cfg) {
  if (cfg.url && !cfg.url.startsWith('__')) return { url: cfg.url, source: 'direct' }
  if (cfg.query) {
    const k = process.env.UNSPLASH_ACCESS_KEY
    if (!k) throw new Error('coverImage.query set but UNSPLASH_ACCESS_KEY missing in env')

    // Try the specific query first, then progressively broaden if it returns zero hits.
    const queries = [cfg.query, ...(cfg.fallbackQueries || []), 'india business', 'small business']
    let pick = null
    let triedQuery = null
    for (const q of queries) {
      const results = await unsplashSearch(q, k)
      if (results.length > 0) {
        pick = results[Math.floor(Math.random() * Math.min(5, results.length))]
        triedQuery = q
        break
      }
    }
    if (!pick) throw new Error(`No photos found for any of: ${queries.join(' | ')}`)
    return { url: `${pick.urls.raw}&w=1600&q=80&fm=jpg`, source: `unsplash-api(${triedQuery})`, credit: pick.user?.name }
  }
  throw new Error('coverImage requires either .url or .query')
}

async function downloadImage(url, filepath) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bi-blog-writer/1.0)' },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`Download failed: ${url} → HTTP ${res.status}`)
  writeFileSync(filepath, Buffer.from(await res.arrayBuffer()))
}

async function uploadCoverImage() {
  const resolved = await resolveImageUrl(coverImage)
  const tmpDir = join(tmpdir(), 'bi-blog-images')
  mkdirSync(tmpDir, { recursive: true })
  const tmpFile = join(tmpDir, `${post.slug.current}.jpg`)

  console.log(`  ↓ Cover image: ${resolved.source}${resolved.credit ? ` (by ${resolved.credit})` : ''}`)
  await downloadImage(resolved.url, tmpFile)

  console.log(`  ↑ Uploading cover to Sanity...`)
  const asset = await client.assets.upload('image', createReadStream(tmpFile), {
    filename: `${post.slug.current}.jpg`,
    contentType: 'image/jpeg',
  })
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: coverImage.alt,
  }
}

// ── Publish ───────────────────────────────────────────────────────────────────

async function publish() {
  const existing = await client.fetch('*[_type == "post" && slug.current == $s][0]{_id}', { s: post.slug.current })
  if (existing) {
    console.error(`SKIP: post with slug "${post.slug.current}" already exists (${existing._id})`)
    process.exit(1)
  }
  post.cover_image = await uploadCoverImage()
  const created = await client.create(post)
  console.log(`✓ Published: ${post.title}`)
  console.log(`  _id: ${created._id}`)
  console.log(`  URL: https://businessideas.live/blog/${post.slug.current}`)
}

publish().catch((err) => { console.error('ERROR:', err.message); process.exit(1) })
