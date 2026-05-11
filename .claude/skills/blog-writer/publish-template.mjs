// Template for auto-generated blog seed scripts.
// The blog-writer agent copies this to scripts/seed-post-<slug>.mjs and fills in `post`.
// Mirrors scripts/seed-posts.mjs but: (1) publishes a single post live, (2) adds pLink for inline idea backlinks.

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'

// Prefer explicit write token; fall back to CLI auth, then SANITY_API_TOKEN.
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

const p = (text) => ({
  _type: 'block', _key: key(), style: 'normal', markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})

const h2 = (text) => ({
  _type: 'block', _key: key(), style: 'h2', markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})

const h3 = (text) => ({
  _type: 'block', _key: key(), style: 'h3', markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})

const li = (text) => ({
  _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1, markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})

const num = (text) => ({
  _type: 'block', _key: key(), style: 'normal', listItem: 'number', level: 1, markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})

const faq = (question, answer) => ({ question, answer })

// pLink — paragraph with inline links to business ideas.
// Usage: pLink('Pair this with a ', [{ text: 'tiffin service', slug: 'tiffin-service' }], ' to diversify.')
// Or:    pLink('See our ', [{ text: 'EV charging guide', slug: 'ev-charging' }, { text: 'or solar installer', slug: 'solar-installer' }], ' write-ups.')
//
// Args alternate plain string / link array / plain string / link array / ...
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

// ── Post payload (filled in by blog-writer agent) ─────────────────────────────

const post = {
  _type: 'post',
  title: '__TITLE__',
  slug: { _type: 'slug', current: '__SLUG__' },
  excerpt: '__EXCERPT__',
  category: '__CATEGORY__',
  tags: [/* '__TAG_1__', '__TAG_2__', ... */],
  reading_time: 0, // __READING_TIME__
  featured: false,
  author: 'BusinessIdeas.live',
  published_at: new Date().toISOString(),
  seo_title: '__SEO_TITLE__',
  seo_description: '__SEO_DESCRIPTION__',
  body: [
    // Example shape — agent replaces this entire array:
    // p('Opening paragraph...'),
    // h2('First heading'),
    // p('...'),
    // pLink('See the ', [{ text: 'cloud kitchen idea', slug: 'cloud-kitchen' }], ' for revenue benchmarks.'),
    // li('Bullet 1'),
    // li('Bullet 2'),
    // h2('Closing'),
    // p('...'),
  ],
  faqs: [
    // faq('Question?', 'Answer.'),
  ],
}

// ── Publish ───────────────────────────────────────────────────────────────────

async function publish() {
  const existing = await client.fetch('*[_type == "post" && slug.current == $s][0]{_id}', { s: post.slug.current })
  if (existing) {
    console.error(`SKIP: post with slug "${post.slug.current}" already exists (${existing._id})`)
    process.exit(1)
  }
  const created = await client.create(post)
  console.log(`✓ Published: ${post.title}`)
  console.log(`  _id: ${created._id}`)
  console.log(`  URL: https://businessideas.live/blog/${post.slug.current}`)
}

publish().catch((err) => { console.error('ERROR:', err.message); process.exit(1) })
