import { revalidateTag, revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/revalidate?secret=<SANITY_WEBHOOK_SECRET>
 *
 * Called by a Sanity webhook when content is published or updated.
 * Clears the relevant ISR cache so visitors see fresh content immediately
 * without requiring a full redeploy.
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  let body: { _type?: string; slug?: { current?: string } }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { _type, slug } = body

  if (_type === 'businessIdea') {
    revalidateTag('business-ideas')
    revalidatePath('/business-ideas')
    revalidatePath('/')
    if (slug?.current) {
      revalidatePath(`/business-ideas/${slug.current}`)
    }
  }

  if (_type === 'post') {
    revalidateTag('posts')
    revalidatePath('/blog')
    revalidatePath('/')
    if (slug?.current) {
      revalidatePath(`/blog/${slug.current}`)
    }
  }

  return NextResponse.json({ revalidated: true, type: _type })
}
