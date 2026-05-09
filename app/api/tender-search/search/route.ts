import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/tender-search/db'
import { cacheGet, cacheSet } from '@/lib/tender-search/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q        = searchParams.get('q') || ''
  const state    = searchParams.get('state') || ''
  const ministry = searchParams.get('ministry') || ''
  const category = searchParams.get('category') || ''
  const source   = searchParams.get('source') || ''
  const status   = searchParams.get('status') || 'active'
  const minVal   = parseFloat(searchParams.get('minValue') || '0') || 0
  const maxVal   = parseFloat(searchParams.get('maxValue') || '0') || 0
  const deadlineDays = parseInt(searchParams.get('deadlineDays') || '0') || 0
  const page     = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
  const limit    = 25

  const cacheKey = req.nextUrl.search
  const cached = cacheGet<object>(cacheKey)
  if (cached) return NextResponse.json(cached)

  const t0 = Date.now()
  const conditions: string[] = []
  const params: (string | number)[] = []
  let i = 1

  if (q) {
    conditions.push(`to_tsvector('english', coalesce(title,'') || ' ' || coalesce(organization,'') || ' ' || coalesce(category,'') || ' ' || coalesce(ministry,'')) @@ plainto_tsquery('english', $${i++})`)
    params.push(q)
  }
  if (state)    { conditions.push(`state ILIKE $${i++}`);    params.push(`%${state}%`) }
  if (ministry) { conditions.push(`ministry ILIKE $${i++}`); params.push(`%${ministry}%`) }
  if (category) { conditions.push(`category ILIKE $${i++}`); params.push(`%${category}%`) }
  if (source)   { conditions.push(`source = $${i++}`);       params.push(source) }
  if (status)   { conditions.push(`status = $${i++}`);       params.push(status) }
  if (minVal > 0) { conditions.push(`tender_value >= $${i++}`); params.push(minVal) }
  if (maxVal > 0) { conditions.push(`tender_value <= $${i++}`); params.push(maxVal) }
  if (deadlineDays > 0) {
    conditions.push(`bid_deadline BETWEEN NOW() AND NOW() + INTERVAL '${deadlineDays} days'`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const offset = (page - 1) * limit

  try {
    const [rowsResult, countResult] = await Promise.all([
      pool.query(
        `SELECT id,source,bid_no,title,organization,ministry,category,state,
                tender_value,bid_deadline,published_at,status,document_url,
                item_description,quantity,scraped_at
         FROM tenders ${where}
         ORDER BY bid_deadline ASC NULLS LAST, scraped_at DESC
         LIMIT ${limit} OFFSET ${offset}`,
        params
      ),
      pool.query(`SELECT COUNT(*) FROM tenders ${where}`, params),
    ])

    const tenders = rowsResult.rows.map(r => ({
      id: r.id,
      source: r.source,
      bidNo: r.bid_no,
      title: r.title,
      organization: r.organization,
      ministry: r.ministry,
      category: r.category,
      state: r.state,
      tenderValue: r.tender_value ? Number(r.tender_value) : null,
      bidDeadline: r.bid_deadline,
      publishedAt: r.published_at,
      status: r.status,
      documentUrl: r.document_url,
      itemDescription: r.item_description,
      quantity: r.quantity,
      scrapedAt: r.scraped_at,
    }))

    const total = parseInt(countResult.rows[0].count)
    const response = {
      tenders,
      total,
      page,
      pages: Math.ceil(total / limit),
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - t0,
      dataNote: 'Live data from GeM, CPPP, and MahaTenders — refreshed every 6 hours',
    }

    cacheSet(cacheKey, response, 5 * 60 * 1000)
    return NextResponse.json(response)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
