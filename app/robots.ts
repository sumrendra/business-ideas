import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Block the Sanity Studio from being indexed
        disallow: '/studio/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
