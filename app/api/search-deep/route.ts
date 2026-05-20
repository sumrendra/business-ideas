import { type NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { SEARCH_DEEP_QUERY } from '@/lib/sanity/queries'

export const revalidate = 60

interface DeepIdea {
  slug: string
  title: string
  industry?: string
  tags?: string[]
  cover?: string | null
}

interface DeepPost {
  slug: string
  title: string
  category?: string
  tags?: string[]
  cover?: string | null
}

interface DeepResult {
  ideas: DeepIdea[]
  posts: DeepPost[]
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 3) {
    return NextResponse.json({ ideas: [], posts: [] }, {
      headers: { 'Cache-Control': 'public, s-maxage=60' },
    })
  }

  const groqQuery = `*${q.replace(/[*"]/g, '')}*`

  const result = await client.fetch<DeepResult>(
    SEARCH_DEEP_QUERY,
    { q: groqQuery },
    { next: { tags: ['search-deep'], revalidate: 60 } }
  )

  return NextResponse.json(result ?? { ideas: [], posts: [] }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
