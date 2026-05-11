import { client } from '@/lib/sanity/client'
import { POST_SLUGS_QUERY, POLICY_PULSE_SLUGS_QUERY } from '@/lib/sanity/queries'
import { ALL_SLUGS } from '@/app/blogs/[slug]/config'

const BASE = 'https://businessideas.live'

function url(loc: string, lastmod: string, priority = '0.9') {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export async function GET() {
  const today = new Date().toISOString().split('T')[0]

  const [postSlugs, policySlugsList] = await Promise.all([
    client.fetch<{ slug: string; lastmod: string }[]>(POST_SLUGS_QUERY, {}, { cache: 'no-store' }),
    client.fetch<{ slug: string; lastmod: string }[]>(POLICY_PULSE_SLUGS_QUERY, {}, { cache: 'no-store' }),
  ])

  const policySlugSet = new Set(policySlugsList.map(p => p.slug))
  const landingSlugSet = new Set(ALL_SLUGS)

  // /blogs/ landing pages (SEO keyword list pages)
  const landingUrls = ALL_SLUGS.map(slug => url(`${BASE}/blogs/${slug}`, today, '0.9'))

  // /policy-pulse/[slug] — canonical URLs for policy pulse articles
  const policyUrls = policySlugsList.map(p => {
    const date = p.lastmod ? p.lastmod.split('T')[0] : today
    return url(`${BASE}/policy-pulse/${p.slug}`, date, '0.8')
  })

  // /blog/[slug] — regular blog posts only (no landing pages, no policy-pulse)
  const blogUrls = postSlugs
    .filter(p => !landingSlugSet.has(p.slug) && !policySlugSet.has(p.slug))
    .map(p => {
      const date = p.lastmod ? p.lastmod.split('T')[0] : today
      return url(`${BASE}/blog/${p.slug}`, date, '0.8')
    })

  const allUrls = [...landingUrls, ...policyUrls, ...blogUrls].join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
