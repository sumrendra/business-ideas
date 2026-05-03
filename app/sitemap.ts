import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity/client'
import { IDEA_SLUGS_QUERY, POST_SLUGS_QUERY } from '@/lib/sanity/queries'
import { ALL_SLUGS } from './blogs/[slug]/config'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return [
      { url: BASE_URL,            changeFrequency: 'daily',  priority: 1 },
      { url: `${BASE_URL}/business-ideas`, changeFrequency: 'daily',  priority: 0.9 },
      { url: `${BASE_URL}/blog`,  changeFrequency: 'weekly', priority: 0.8 },
    ]
  }

  const [ideaSlugs, postSlugs] = await Promise.all([
    client.fetch<{ slug: string }[]>(IDEA_SLUGS_QUERY),
    client.fetch<{ slug: string }[]>(POST_SLUGS_QUERY),
  ])

  const ideaUrls = ideaSlugs.map(({ slug }) => ({
    url: `${BASE_URL}/business-ideas/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const postUrls = postSlugs.map(({ slug }) => ({
    url: `${BASE_URL}/blog/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const blogLandingUrls = ALL_SLUGS.map((slug) => ({
    url: `${BASE_URL}/blogs/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }))

  return [
    { url: BASE_URL,                     changeFrequency: 'daily',   priority: 1 },
    { url: `${BASE_URL}/business-ideas`, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/blog`,           changeFrequency: 'weekly',  priority: 0.8 },
    ...blogLandingUrls,
    ...ideaUrls,
    ...postUrls,
  ]
}
