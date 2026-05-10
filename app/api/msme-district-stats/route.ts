import { NextResponse } from 'next/server'
import { getNeonPool } from '@/lib/neon'

export const runtime = 'nodejs'
export const revalidate = 86400 // 24 hours

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const state = searchParams.get('state') ?? ''
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '10', 10))

  const pool = getNeonPool()

  try {
    if (state) {
      const statePattern = state.trim().toUpperCase()
      // District-level breakdown for a state
      const { rows: districts } = await pool.query(
        `SELECT district, micro_count, small_count, medium_count, total_count
         FROM msme_district_stats
         WHERE UPPER(state) = $1
         ORDER BY total_count DESC NULLS LAST
         LIMIT $2`,
        [statePattern, limit]
      )
      // State totals
      const { rows: totals } = await pool.query(
        `SELECT
           SUM(micro_count)  AS micro,
           SUM(small_count)  AS small,
           SUM(medium_count) AS medium,
           SUM(total_count)  AS total,
           COUNT(*)          AS districts
         FROM msme_district_stats
         WHERE UPPER(state) = $1`,
        [statePattern]
      )
      return NextResponse.json({ state, totals: totals[0], districts })
    }

    // No state — return state-level summary
    const { rows } = await pool.query(
      `SELECT state,
         SUM(micro_count)  AS micro,
         SUM(small_count)  AS small,
         SUM(medium_count) AS medium,
         SUM(total_count)  AS total
       FROM msme_district_stats
       GROUP BY state
       ORDER BY total DESC NULLS LAST
       LIMIT $1`,
      [limit]
    )
    return NextResponse.json({ states: rows })
  } catch (err) {
    console.error('msme-district-stats error:', err)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
