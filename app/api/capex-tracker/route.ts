import { NextResponse } from 'next/server'
import { getNeonPool } from '@/lib/neon'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sector  = searchParams.get('sector')  ?? ''
  const status  = searchParams.get('status')  ?? ''
  const type    = searchParams.get('type')    ?? ''
  const q       = searchParams.get('q')       ?? ''

  const conditions: string[] = []
  const params: (string)[] = []
  let i = 1

  if (sector) { conditions.push(`sector = $${i++}`);        params.push(sector) }
  if (status) { conditions.push(`status = $${i++}`);        params.push(status) }
  if (type)   { conditions.push(`promise_type = $${i++}`);  params.push(type)   }
  if (q)      { conditions.push(`(LOWER(company_name) LIKE $${i} OR LOWER(ticker) LIKE $${i} OR LOWER(promise_text) LIKE $${i})`); params.push(`%${q.toLowerCase()}%`); i++ }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  try {
    const pool = getNeonPool()

    const [{ rows }, { rows: stats }] = await Promise.all([
      pool.query(
        `SELECT * FROM capex_promises ${where} ORDER BY
           CASE status WHEN 'missed' THEN 1 WHEN 'watch' THEN 2 WHEN 'partial' THEN 3
             WHEN 'on_track' THEN 4 WHEN 'delivered' THEN 5 ELSE 6 END,
           promised_amount_cr DESC NULLS LAST`,
        params
      ),
      pool.query(
        `SELECT status, count(*)::int FROM capex_promises GROUP BY status`
      ),
    ])

    return NextResponse.json({ promises: rows, stats }, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 })
  }
}
