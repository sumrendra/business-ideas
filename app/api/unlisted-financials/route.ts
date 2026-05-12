import { NextResponse } from 'next/server'
import { getNeonPool } from '@/lib/neon'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q         = searchParams.get('q')?.trim() ?? ''
  const industry  = searchParams.get('industry') ?? ''
  const state     = searchParams.get('state') ?? ''
  const sortBy    = searchParams.get('sort') ?? 'revenue'
  const limit     = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200)

  try {
    const pool = getNeonPool()

    // Build filter conditions
    const conditions: string[] = []
    const params: unknown[] = []

    if (q) {
      params.push(`%${q}%`)
      conditions.push(`c.name ILIKE $${params.length}`)
    }
    if (industry) {
      params.push(industry)
      conditions.push(`c.industry = $${params.length}`)
    }
    if (state) {
      params.push(state)
      conditions.push(`c.state = $${params.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    // Valid sort columns mapped to SQL
    const sortMap: Record<string, string> = {
      revenue: 'latest.revenue_cr',
      pat: 'latest.pat_cr',
      networth: 'latest.net_worth_cr',
      assets: 'latest.total_assets_cr',
      name: 'c.name',
    }
    const orderCol = sortMap[sortBy] ?? sortMap.revenue

    const { rows: companies } = await pool.query(`
      SELECT
        c.cin,
        c.name,
        c.industry,
        c.sub_sector,
        c.state,
        c.category,
        c.incorporation_year,
        c.authorized_capital_cr,
        c.paid_up_capital_cr,
        c.is_notable,
        c.tags,
        latest.fiscal_year,
        latest.revenue_cr,
        latest.expenses_cr,
        latest.pat_cr,
        latest.net_worth_cr,
        latest.total_assets_cr,
        latest.total_debt_cr,
        latest.data_source,
        latest.scraped_at
      FROM unlisted_companies c
      LEFT JOIN LATERAL (
        SELECT * FROM unlisted_financials f
        WHERE f.cin = c.cin
        ORDER BY f.fiscal_year DESC
        LIMIT 1
      ) latest ON true
      ${where}
      ORDER BY ${orderCol} DESC NULLS LAST
      LIMIT $${params.length + 1}
    `, [...params, limit])

    // Also pull historical financials for each company (up to 5 years)
    if (companies.length <= 20) {
      const cins = companies.map(c => c.cin)
      const { rows: history } = await pool.query(`
        SELECT cin, fiscal_year, revenue_cr, pat_cr, net_worth_cr, total_assets_cr
        FROM unlisted_financials
        WHERE cin = ANY($1)
        ORDER BY cin, fiscal_year ASC
      `, [cins])

      const byCompany: Record<string, typeof history> = {}
      for (const row of history) {
        if (!byCompany[row.cin]) byCompany[row.cin] = []
        byCompany[row.cin].push(row)
      }
      return NextResponse.json({ companies, history: byCompany, total: companies.length }, {
        headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
      })
    }

    // Aggregate stats
    const { rows: [stats] } = await pool.query(`
      SELECT
        COUNT(DISTINCT c.cin) as total_companies,
        COUNT(DISTINCT CASE WHEN latest.fiscal_year IS NOT NULL THEN c.cin END) as with_data,
        COUNT(DISTINCT c.industry) as industries,
        COUNT(DISTINCT c.state) as states
      FROM unlisted_companies c
      LEFT JOIN LATERAL (
        SELECT fiscal_year FROM unlisted_financials f WHERE f.cin = c.cin ORDER BY f.fiscal_year DESC LIMIT 1
      ) latest ON true
    `)

    return NextResponse.json({ companies, total: companies.length, stats }, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (e) {
    console.error('unlisted-financials error:', e)
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 })
  }
}
