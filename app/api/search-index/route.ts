import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import {
  SEARCH_IDEAS_INDEX_QUERY,
  SEARCH_POSTS_INDEX_QUERY,
} from '@/lib/sanity/queries'
import { TOOLS_CATALOG } from '@/lib/search/tools'
import { FILTERS_CATALOG } from '@/lib/search/filters'
import type { IdeaSearchDoc, PostSearchDoc, SearchIndex } from '@/lib/search/types'

export const revalidate = 3600

interface RawIdea {
  slug: string
  title: string
  industry?: string
  tags?: string[]
  budget_range?: string
  difficulty_level?: string
  featured?: boolean
  cover?: string | null
}

interface RawPost {
  slug: string
  title: string
  category?: string
  tags?: string[]
  featured?: boolean
  cover?: string | null
}

export async function GET() {
  const [rawIdeas, rawPosts] = await Promise.all([
    client.fetch<RawIdea[]>(SEARCH_IDEAS_INDEX_QUERY, {}, { next: { tags: ['search-index'] } }),
    client.fetch<RawPost[]>(SEARCH_POSTS_INDEX_QUERY, {}, { next: { tags: ['search-index'] } }),
  ])

  const ideas: IdeaSearchDoc[] = (rawIdeas ?? []).map((i) => ({
    kind: 'idea',
    slug: i.slug,
    title: i.title,
    industry: i.industry,
    tags: i.tags ?? [],
    budget_range: i.budget_range,
    difficulty_level: i.difficulty_level,
    featured: i.featured ?? false,
    cover: i.cover ?? null,
  }))

  const posts: PostSearchDoc[] = (rawPosts ?? []).map((p) => ({
    kind: 'post',
    slug: p.slug,
    title: p.title,
    category: p.category,
    tags: p.tags ?? [],
    featured: p.featured ?? false,
    cover: p.cover ?? null,
  }))

  const body: SearchIndex = {
    ideas,
    posts,
    tools: TOOLS_CATALOG,
    filters: FILTERS_CATALOG,
  }

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
