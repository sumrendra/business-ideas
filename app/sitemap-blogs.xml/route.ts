import { client } from '@/lib/sanity/client'
import { POST_SLUGS_QUERY } from '@/lib/sanity/queries'
import { ALL_SLUGS } from '@/app/blogs/[slug]/config'

const BASE = 'https://businessideas.live'

function url(loc: string, priority = '0.9') {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export async function GET() {
  const postSlugs = await client.fetch<{ slug: string }[]>(
    POST_SLUGS_QUERY,
    {},
    { cache: 'no-store' }
  )

  const postSlugSet = new Set(postSlugs.map(p => p.slug))

  // Landing pages at /blogs/ (config-driven, always valid)
  const landingBlogsUrls = ALL_SLUGS.map(slug => url(`${BASE}/blogs/${slug}`))

  // Landing pages also accessible at /blog/ when a Sanity post with that slug exists
  const landingBlogUrls = ALL_SLUGS
    .filter(slug => postSlugSet.has(slug))
    .map(slug => url(`${BASE}/blog/${slug}`))

  // Remaining Sanity posts (slugs not covered by landing pages above)
  const landingSlugSet = new Set(ALL_SLUGS)
  const otherPostUrls = postSlugs
    .filter(p => !landingSlugSet.has(p.slug))
    .map(p => url(`${BASE}/blog/${p.slug}`))

  const allUrls = [...landingBlogsUrls, ...landingBlogUrls, ...otherPostUrls].join('\n')

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
