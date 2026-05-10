import { NextResponse } from 'next/server'
import { getNeonPool } from '@/lib/neon'

export const runtime = 'nodejs'
export const revalidate = 3600

// Maps idea industry → commodity search terms
const INDUSTRY_COMMODITIES: Record<string, string[]> = {
  'Agriculture':      ['Rice', 'Wheat', 'Maize', 'Cotton', 'Soyabean', 'Onion', 'Potato', 'Tomato'],
  'Food & Beverage':  ['Rice', 'Wheat', 'Sugar', 'Maize', 'Onion', 'Tomato', 'Groundnut'],
  'Textile':          ['Cotton', 'Jute'],
  'Manufacturing':    ['Cotton', 'Wheat', 'Maize'],
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const commodity = searchParams.get('commodity') ?? ''
  const state = searchParams.get('state') ?? ''
  const industry = searchParams.get('industry') ?? ''
  const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '8', 10))

  const pool = getNeonPool()

  try {
    // Determine which commodities to query
    const targetCommodities: string[] =
      commodity
        ? [commodity]
        : (INDUSTRY_COMMODITIES[industry] ?? [])

    if (targetCommodities.length === 0) {
      return NextResponse.json({ prices: [] })
    }

    const placeholders = targetCommodities.map((_, i) => `$${i + 1}`).join(', ')
    const params: (string | number)[] = [...targetCommodities]

    let query = `
      SELECT DISTINCT ON (commodity)
        commodity, variety, state, market, modal_price, min_price, max_price, arrival_date
      FROM commodity_prices
      WHERE commodity IN (${placeholders})
    `

    if (state) {
      params.push(state)
      query += ` AND UPPER(state) = $${params.length}`
    }

    query += `
      ORDER BY commodity, arrival_date DESC
      LIMIT $${params.length + 1}
    `
    params.push(limit)

    const { rows } = await pool.query(query, params)
    return NextResponse.json({ prices: rows })
  } catch (err) {
    console.error('commodity-prices error:', err)
    return NextResponse.json({ prices: [], error: 'DB error' }, { status: 500 })
  }
}
