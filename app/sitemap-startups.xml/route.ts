import { readClient } from '@/lib/sanity/client'
import { STARTUP_SLUGS_QUERY, FOUNDER_SLUGS_QUERY } from '@/lib/sanity/queries'

const BASE = 'https://businessideas.live'

function url(loc: string, lastmod: string, priority = '0.7') {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
}

/**
 * /sitemap-startups.xml — NEW sitemap segment.
 *
 * Registered via app/sitemap.xml/route.ts sitemap-index (separate edit).
 * Does NOT touch /business-ideas/, /blog/, /blogs/, or any existing URL.
 */
export async function GET() {
  const today = new Date().toISOString().split('T')[0]

  const [startupSlugs, founderSlugs] = await Promise.all([
    readClient.fetch<{ slug: string; lastmod: string }[]>(STARTUP_SLUGS_QUERY, {}, { cache: 'no-store' }),
    readClient.fetch<{ slug: string; lastmod: string }[]>(FOUNDER_SLUGS_QUERY, {}, { cache: 'no-store' }),
  ])

  const startupUrls = startupSlugs.map((s) => {
    const date = s.lastmod ? s.lastmod.split('T')[0] : today
    return url(`${BASE}/startups/${s.slug}`, date, '0.8')
  })

  const founderUrls = founderSlugs.map((f) => {
    const date = f.lastmod ? f.lastmod.split('T')[0] : today
    return url(`${BASE}/founders/${f.slug}`, date, '0.6')
  })

  const indexEntry = url(`${BASE}/startups`, today, '0.9')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexEntry}
${startupUrls.join('\n')}
${founderUrls.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
