const BASE = 'https://businessideas.live'

function url(loc: string, priority: string, changefreq = 'weekly') {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${url(`${BASE}/`, '1.0', 'daily')}
${url(`${BASE}/business-ideas/`, '0.9', 'daily')}
${url(`${BASE}/sectors`, '0.7')}
${url(`${BASE}/get-funded`, '0.7')}
${url(`${BASE}/blog`, '0.8')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
