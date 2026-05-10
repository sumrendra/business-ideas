const BASE = 'https://businessideas.live'

function url(loc: string, priority: string, changefreq = 'weekly', lastmod?: string) {
  return `  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export async function GET() {
  const today = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${url(`${BASE}/`, '1.0', 'daily', today)}
${url(`${BASE}/business-ideas/`, '0.9', 'daily', today)}
${url(`${BASE}/sectors`, '0.9', 'weekly', today)}
${url(`${BASE}/get-funded`, '0.9', 'weekly', today)}
${url(`${BASE}/blog`, '0.9', 'daily', today)}
${url(`${BASE}/policy-pulse`, '0.9', 'daily', today)}
${url(`${BASE}/incentives`, '0.8', 'weekly', today)}
${url(`${BASE}/funding-radar`, '0.8', 'weekly', today)}
${url(`${BASE}/funding-calculators`, '0.8', 'weekly', today)}
${url(`${BASE}/hyperlocal-opportunity`, '0.7', 'weekly', today)}
${url(`${BASE}/competitor-intel`, '0.7', 'weekly', today)}
${url(`${BASE}/compliance-map`, '0.7', 'weekly', today)}
${url(`${BASE}/sector-pulse`, '0.7', 'weekly', today)}
${url(`${BASE}/export-finder`, '0.7', 'weekly', today)}
${url(`${BASE}/signal-radar`, '0.7', 'weekly', today)}
${url(`${BASE}/supply-chain`, '0.7', 'weekly', today)}
${url(`${BASE}/local-radar`, '0.7', 'weekly', today)}
${url(`${BASE}/dpiit-lookup`, '0.7', 'weekly', today)}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
