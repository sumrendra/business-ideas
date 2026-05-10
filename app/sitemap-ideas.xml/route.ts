import { client } from '@/lib/sanity/client'
import { IDEA_SLUGS_QUERY } from '@/lib/sanity/queries'

const BASE = 'https://businessideas.live'

export async function GET() {
  const ideaSlugs = await client.fetch<{ slug: string; lastmod: string }[]>(
    IDEA_SLUGS_QUERY,
    {},
    { cache: 'no-store' }
  )

  const ideaUrls = ideaSlugs.map(({ slug, lastmod }) => {
    const date = lastmod ? lastmod.split('T')[0] : new Date().toISOString().split('T')[0]
    return `  <url>
    <loc>${BASE}/business-ideas/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ideaUrls}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
