const BASE = 'https://businessideas.live'

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE}/sitemap-business-ideas.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE}/sitemap-blogs.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE}/sitemap-ideas.xml</loc>
  </sitemap>
</sitemapindex>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
