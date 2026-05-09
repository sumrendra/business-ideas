import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/tender-search/db'
import { cacheGet, cacheSet } from '@/lib/tender-search/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = searchParams.get('category') || ''
  const ministry = searchParams.get('ministry') || ''
  const state    = searchParams.get('state') || ''
  const q        = searchParams.get('q') || ''
  const page     = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
  const limit    = 25

  const cacheKey = `bids:${req.nextUrl.search}`
  const cached = cacheGet<object>(cacheKey)
  if (cached) return NextResponse.json(cached)

  const t0 = Date.now()
  const conditions: string[] = []
  const params: (string | number)[] = []
  let i = 1

  if (q)        { conditions.push(`(item_description ILIKE $${i} OR bid_no ILIKE $${i++})`); params.push(`%${q}%`) }
  if (category) { conditions.push(`category ILIKE $${i++}`);                                 params.push(`%${category}%`) }
  if (ministry) { conditions.push(`ministry ILIKE $${i++}`);                                 params.push(`%${ministry}%`) }
  if (state)    { conditions.push(`state ILIKE $${i++}`);                                    params.push(`%${state}%`) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const offset = (page - 1) * limit

  try {
    const [rowsResult, countResult, statsResult] = await Promise.all([
      pool.query(
        `SELECT id,source,bid_no,category,item_description,ministry,organization,state,
                l1_price,l1_seller_name,l1_seller_gstin,estimated_value,
                total_bidders,bid_closing_date,savings_percent,scraped_at
         FROM bid_results ${where}
         ORDER BY bid_closing_date DESC NULLS LAST, scraped_at DESC
         LIMIT ${limit} OFFSET ${offset}`,
        params
      ),
      pool.query(`SELECT COUNT(*) FROM bid_results ${where}`, params),
      pool.query(
        `SELECT
           AVG(l1_price)::numeric(18,2)      AS avg_l1,
           PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY l1_price) AS median_l1,
           MIN(l1_price)                     AS min_l1,
           COUNT(*)                          AS total,
           AVG(total_bidders)::numeric(6,1)  AS avg_bidders,
           AVG(savings_percent)::numeric(6,1) AS avg_savings
         FROM bid_results ${where}
         WHERE l1_price IS NOT NULL`,
        params
      ),
    ])

    const bids = rowsResult.rows.map(r => ({
      bidId: r.id,
      source: r.source,
      bidNo: r.bid_no,
      category: r.category,
      itemDescription: r.item_description,
      ministry: r.ministry,
      organization: r.organization,
      state: r.state,
      l1Price: r.l1_price ? Number(r.l1_price) : null,
      l1SellerName: r.l1_seller_name,
      l1SellerGstin: r.l1_seller_gstin,
      estimatedValue: r.estimated_value ? Number(r.estimated_value) : null,
      totalBidders: r.total_bidders,
      bidClosingDate: r.bid_closing_date,
      savingsPercent: r.savings_percent ? Number(r.savings_percent) : null,
    }))

    const stats = statsResult.rows[0]
    const total = parseInt(countResult.rows[0].count)

    const response = {
      bids,
      total,
      page,
      pages: Math.ceil(total / limit),
      summary: {
        avgL1Price:     Number(stats.avg_l1 || 0),
        medianL1Price:  Number(stats.median_l1 || 0),
        lowestL1Price:  Number(stats.min_l1 || 0),
        totalBids:      Number(stats.total || 0),
        avgBidders:     Number(stats.avg_bidders || 0),
        avgSavings:     Number(stats.avg_savings || 0),
      },
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - t0,
    }

    cacheSet(cacheKey, response, 5 * 60 * 1000)
    return NextResponse.json(response)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
