import { client } from '@/lib/sanity/client'
import { POST_SLUGS_QUERY } from '@/lib/sanity/queries'
import { ALL_SLUGS } from '@/app/blogs/[slug]/config'

const BASE = 'https://businessideas.live'

export async function GET() {
  const postSlugs = await client.fetch<{ slug: string }[]>(
    POST_SLUGS_QUERY,
    {},
    { next: { tags: ['posts'] } }
  )

  const landingUrls = ALL_SLUGS.map(
    (slug) => `  <url>
    <loc>${BASE}/blogs/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
  ).join('\n')

  const postUrls = postSlugs.map(
    ({ slug }) => `  <url>
    <loc>${BASE}/blog/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${landingUrls}
${postUrls}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
