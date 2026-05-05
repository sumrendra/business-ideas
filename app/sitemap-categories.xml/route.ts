const BASE = 'https://businessideas.live'

const CATEGORIES = [
  'saas', 'ecommerce', 'health', 'edtech', 'fintech',
  'local-services', 'climate', 'ai-ml',
  'under-1-lakh', 'low-investment', 'medium-investment',
  'for-beginners',
]

export async function GET() {
  const now = new Date().toISOString().split('T')[0]
  const urls = CATEGORIES.map(slug => `
  <url>
    <loc>${BASE}/business-ideas/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
