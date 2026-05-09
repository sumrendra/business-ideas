import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/tender-search/db'
import { cacheGet, cacheSet } from '@/lib/tender-search/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = searchParams.get('category') || ''
  const state    = searchParams.get('state') || ''
  const q        = searchParams.get('q') || ''
  const page     = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
  const limit    = 25

  const cacheKey = `vendors:${req.nextUrl.search}`
  const cached = cacheGet<object>(cacheKey)
  if (cached) return NextResponse.json(cached)

  const t0 = Date.now()
  const conditions: string[] = ['l1_seller_name IS NOT NULL', "l1_seller_name != ''"]
  const params: (string | number)[] = []
  let i = 1

  if (q)        { conditions.push(`l1_seller_name ILIKE $${i++}`); params.push(`%${q}%`) }
  if (category) { conditions.push(`category ILIKE $${i++}`);       params.push(`%${category}%`) }
  if (state)    { conditions.push(`state ILIKE $${i++}`);          params.push(`%${state}%`) }

  const where = `WHERE ${conditions.join(' AND ')}`
  const offset = (page - 1) * limit

  try {
    const [rowsResult, countResult] = await Promise.all([
      pool.query(
        `SELECT
           l1_seller_name                                              AS seller_name,
           state,
           COUNT(*)::int                                              AS total_orders,
           SUM(l1_price)::numeric(20,2)                              AS total_value,
           AVG(l1_price)::numeric(18,2)                              AS avg_value,
           array_agg(DISTINCT category ORDER BY category) FILTER (WHERE category IS NOT NULL AND category != '') AS categories,
           array_agg(DISTINCT ministry ORDER BY ministry) FILTER (WHERE ministry IS NOT NULL AND ministry != '')  AS ministries
         FROM bid_results ${where}
         GROUP BY l1_seller_name, state
         ORDER BY total_orders DESC, total_value DESC
         LIMIT ${limit} OFFSET ${offset}`,
        params
      ),
      pool.query(
        `SELECT COUNT(DISTINCT l1_seller_name) FROM bid_results ${where}`,
        params
      ),
    ])

    const vendors = rowsResult.rows.map(r => ({
      sellerName:          r.seller_name,
      state:               r.state || '',
      totalOrders:         r.total_orders,
      totalOrderValueINR:  Number(r.total_value || 0),
      avgOrderValueINR:    Number(r.avg_value || 0),
      topCategories:       (r.categories || []).slice(0, 3),
      topMinistries:       (r.ministries || []).slice(0, 3),
    }))

    const total = parseInt(countResult.rows[0].count)

    const response = {
      vendors,
      total,
      page,
      pages: Math.ceil(total / limit),
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - t0,
    }

    cacheSet(cacheKey, response, 10 * 60 * 1000)
    return NextResponse.json(response)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
