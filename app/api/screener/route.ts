import { NextResponse } from 'next/server'
import { getNeonPool } from '@/lib/neon'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sector = searchParams.get('sector') ?? 'banks'

  try {
    const pool = getNeonPool()
    const { rows } = await pool.query(
      `SELECT ticker, name, sector, sub_sector, market_cap_cr, metrics, quarter, data_source
       FROM screener_companies
       WHERE sector = $1
       ORDER BY market_cap_cr DESC NULLS LAST`,
      [sector]
    )
    return NextResponse.json({ sector, companies: rows }, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load screener data' }, { status: 500 })
  }
}
