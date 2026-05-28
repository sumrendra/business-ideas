const BASE = 'https://businessideas.live'

export async function GET() {
  const today = new Date().toISOString().split('T')[0]

  const sitemaps = [
    'sitemap-business-ideas.xml',
    'sitemap-blogs.xml',
    'sitemap-ideas.xml',
    'sitemap-categories.xml',
    // Append-only: new segment for the Startup Database. Adding to the index
    // does NOT change any existing canonical URL — it only adds /startups/* URLs.
    'sitemap-startups.xml',
  ]

  const entries = sitemaps.map(s => `  <sitemap>
    <loc>${BASE}/${s}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
