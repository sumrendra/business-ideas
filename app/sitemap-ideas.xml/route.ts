import { client } from '@/lib/sanity/client'
import { IDEA_SLUGS_QUERY } from '@/lib/sanity/queries'

const BASE = 'https://businessideas.live'

export async function GET() {
  const ideaSlugs = await client.fetch<{ slug: string }[]>(
    IDEA_SLUGS_QUERY,
    {},
    { next: { tags: ['business-ideas'] } }
  )

  const ideaUrls = ideaSlugs.map(
    ({ slug }) => `  <url>
    <loc>${BASE}/business-ideas/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ideaUrls}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
