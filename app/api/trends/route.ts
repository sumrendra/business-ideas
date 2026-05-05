import { NextRequest, NextResponse } from 'next/server'

// Cache results for 6 hours — trends data doesn't change hourly
const cache = new Map<string, { data: number[]; labels: string[]; ts: number }>()
const CACHE_TTL = 6 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get('keyword')
  if (!keyword) return NextResponse.json({ error: 'keyword required' }, { status: 400 })

  const cached = cache.get(keyword)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ values: cached.data, labels: cached.labels })
  }

  try {
    // Dynamic import — google-trends-api is CJS
    const googleTrends = (await import('google-trends-api')).default

    const raw = await googleTrends.interestOverTime({
      keyword,
      geo: 'IN',
      startTime: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
      granularTime: false,
    })

    const parsed = JSON.parse(raw)
    const timeline: { value: number[]; formattedTime: string }[] =
      parsed?.default?.timelineData ?? []

    const values = timeline.map((p) => p.value[0])
    const labels = timeline.map((p) => p.formattedTime)

    cache.set(keyword, { data: values, labels, ts: Date.now() })
    return NextResponse.json({ values, labels })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
