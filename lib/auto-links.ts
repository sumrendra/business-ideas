/**
 * Auto-link phrases inside Portable Text blocks.
 *
 * Static entries cover government schemes, internal tools, and cross-site pages.
 * Dynamic blog links are built at render time via buildBlogAutoLinks().
 */

export interface AutoLink {
  phrase: string
  href: string
  external?: boolean
}

export const AUTO_LINKS: AutoLink[] = [
  // ── PM Surya Ghar (solar) ────────────────────────────────────────────────────
  { phrase: 'PM Surya Ghar Muft Bijli Yojana', href: '/incentives#pm-surya-ghar' },
  { phrase: 'PM Surya Ghar scheme',             href: '/incentives#pm-surya-ghar' },
  { phrase: 'PM Surya Ghar Yojana',             href: '/incentives#pm-surya-ghar' },
  { phrase: 'PM Surya Ghar',                    href: '/incentives#pm-surya-ghar' },

  // ── MSME & startup funding schemes ───────────────────────────────────────────
  { phrase: 'PMEGP scheme',                     href: '/get-funded' },
  { phrase: 'PMEGP',                            href: '/get-funded' },
  { phrase: 'MUDRA Loan',                       href: '/get-funded' },
  { phrase: 'MUDRA loan',                       href: '/get-funded' },
  { phrase: 'Pradhan Mantri MUDRA Yojana',      href: '/get-funded' },
  { phrase: 'CGTMSE',                           href: '/get-funded' },
  { phrase: 'Stand-Up India',                   href: '/get-funded' },
  { phrase: 'Startup India',                    href: '/get-funded' },
  { phrase: 'DPIIT recognition',                href: '/get-funded' },
  { phrase: 'DPIIT-recognised',                 href: '/get-funded' },
  { phrase: 'DPIIT recognized',                 href: '/get-funded' },
  { phrase: 'PM Vishwakarma',                   href: '/get-funded' },
  { phrase: 'PM Vishwakarma scheme',            href: '/get-funded' },
  { phrase: 'angel investor',                   href: '/funding-radar' },
  { phrase: 'angel investors',                  href: '/funding-radar' },
  { phrase: 'venture capital',                  href: '/funding-radar' },
  { phrase: 'seed funding',                     href: '/funding-radar' },
  { phrase: 'startup funding',                  href: '/funding-radar' },

  // ── EV & energy schemes ───────────────────────────────────────────────────────
  { phrase: 'PM E-DRIVE',                       href: '/incentives' },
  { phrase: 'FAME II',                          href: '/incentives' },
  { phrase: 'FAME scheme',                      href: '/incentives' },

  // ── State incentives ──────────────────────────────────────────────────────────
  { phrase: 'state incentives',                 href: '/incentives' },
  { phrase: 'state subsidy',                    href: '/incentives' },
  { phrase: 'state subsidies',                  href: '/incentives' },
  { phrase: 'capital subsidy',                  href: '/incentives' },
  { phrase: 'interest subvention',              href: '/incentives' },
  { phrase: 'GST reimbursement',                href: '/incentives' },
  { phrase: 'stamp duty waiver',                href: '/incentives' },

  // ── Internal tools ────────────────────────────────────────────────────────────
  { phrase: 'hyperlocal opportunity',           href: '/hyperlocal-opportunity' },
  { phrase: 'hyperlocal demand',                href: '/hyperlocal-opportunity' },
  { phrase: 'local demand analysis',            href: '/hyperlocal-opportunity' },
  { phrase: 'opportunity map',                  href: '/hyperlocal-opportunity' },
  { phrase: 'funding radar',                    href: '/funding-radar' },
  { phrase: 'competitor intel',                 href: '/competitor-intel' },
  { phrase: 'sector pulse',                     href: '/sector-pulse' },
  { phrase: 'supply chain finder',              href: '/supply-chain' },
  { phrase: 'export finder',                    href: '/export-finder' },
  { phrase: 'compliance map',                   href: '/compliance-map' },
  { phrase: 'signal radar',                     href: '/signal-radar' },
]

// ── PT block types (minimal) ──────────────────────────────────────────────────
interface PTSpan {
  _type: 'span'
  _key: string
  text: string
  marks: string[]
}

interface PTLinkDef {
  _type: 'link'
  _key: string
  href: string
  blank?: boolean
}

interface PTBlock {
  _type: string
  _key: string
  children?: PTSpan[]
  markDefs?: PTLinkDef[]
  [key: string]: unknown
}

/**
 * Build auto-links from blog post titles fetched from Sanity.
 * Only includes titles that are specific enough (≥ 15 chars) to avoid
 * false positives on short or generic titles.
 */
export function buildBlogAutoLinks(
  posts: { slug: string; title: string; tags?: string[] }[]
): AutoLink[] {
  return posts
    .filter(p => p.slug && p.title && p.title.length >= 15)
    .map(p => ({ phrase: p.title, href: `/blog/${p.slug}` }))
}

/**
 * Processes a Portable Text blocks array, injecting link markDefs for any
 * AUTO_LINKS phrase found in plain (un-linked) spans. Safe to call on every
 * render — existing marks and markDefs are never modified.
 *
 * Links are matched longest-phrase-first so more specific entries win over
 * shorter overlapping ones (e.g. "PM Surya Ghar scheme" beats "PM Surya Ghar").
 */
export function injectAutoLinks(
  blocks: unknown[],
  links: AutoLink[] = AUTO_LINKS,
): unknown[] {
  if (!blocks?.length) return blocks

  // Sort longest phrase first so specific matches take precedence
  const sorted = [...links].sort((a, b) => b.phrase.length - a.phrase.length)

  let counter = 0

  return blocks.map(block => {
    const b = block as PTBlock
    if (b._type !== 'block' || !Array.isArray(b.children)) return block

    const existingLinkKeys = new Set(
      (b.markDefs ?? []).filter(m => m._type === 'link').map(m => m._key)
    )

    const newMarkDefs: PTLinkDef[] = [...(b.markDefs ?? [])]
    const newChildren: PTSpan[] = []

    for (const child of b.children) {
      if (child._type !== 'span') { newChildren.push(child); continue }
      if (child.marks?.some(m => existingLinkKeys.has(m))) {
        newChildren.push(child); continue
      }

      type Segment = { text: string; href?: string; external?: boolean }
      let segments: Segment[] = [{ text: child.text }]

      for (const al of sorted) {
        const updated: Segment[] = []
        for (const seg of segments) {
          if (seg.href) { updated.push(seg); continue }
          const lower = seg.text.toLowerCase()
          const idx   = lower.indexOf(al.phrase.toLowerCase())
          if (idx === -1) { updated.push(seg); continue }
          if (idx > 0) updated.push({ text: seg.text.slice(0, idx) })
          updated.push({ text: seg.text.slice(idx, idx + al.phrase.length), href: al.href, external: al.external })
          const tail = seg.text.slice(idx + al.phrase.length)
          if (tail) updated.push({ text: tail })
        }
        segments = updated
      }

      if (segments.length === 1 && !segments[0].href) {
        newChildren.push(child); continue
      }

      segments.forEach((seg, si) => {
        const key = `${child._key}_al${counter++}_${si}`
        if (!seg.href) {
          newChildren.push({ ...child, _key: key, text: seg.text, marks: child.marks ?? [] })
        } else {
          const mdKey = `almd${counter++}`
          newMarkDefs.push({ _type: 'link', _key: mdKey, href: seg.href, ...(seg.external ? { blank: true } : {}) })
          newChildren.push({ ...child, _key: key, text: seg.text, marks: [...(child.marks ?? []), mdKey] })
        }
      })
    }

    return { ...b, children: newChildren, markDefs: newMarkDefs }
  })
}
