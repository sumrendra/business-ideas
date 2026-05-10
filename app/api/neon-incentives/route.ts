import { NextResponse } from 'next/server'
import { getNeonPool } from '@/lib/neon'

export const runtime = 'nodejs'
export const revalidate = 3600 // 1 hour

// Maps Sanity industry values → sector keywords for fuzzy matching
const INDUSTRY_TO_SECTOR: Record<string, string[]> = {
  'Agriculture':            ['agriculture', 'agri', 'food', 'farm'],
  'Food & Beverage':        ['food', 'agriculture', 'agri'],
  'Manufacturing':          ['manufacturing', 'general'],
  'Textile':                ['textile', 'manufacturing'],
  'Health & Wellness':      ['healthcare', 'health', 'pharma'],
  'EdTech':                 ['education', 'it', 'technology'],
  'SaaS':                   ['it', 'technology', 'saas', 'software'],
  'AI / ML':                ['it', 'technology', 'ai', 'software'],
  'FinTech':                ['fintech', 'it', 'technology'],
  'E-commerce':             ['e-commerce', 'retail', 'it'],
  'Local Services':         ['services', 'general'],
  'Climate / Sustainability': ['renewable', 'green', 'energy', 'environment'],
  'Logistics':              ['logistics', 'transport'],
  'Construction':           ['construction', 'infrastructure'],
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const state = searchParams.get('state') ?? ''
  const industry = searchParams.get('industry') ?? ''
  const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '6', 10))

  const pool = getNeonPool()

  try {
    let rows
    if (state) {
      // Normalize state name for matching (case-insensitive prefix search)
      const statePattern = state.trim().toUpperCase()
      const keywords = industry ? (INDUSTRY_TO_SECTOR[industry] ?? []) : []

      if (keywords.length > 0) {
        // Try to match by sector keywords first
        const sectorConditions = keywords.map((_, i) => `LOWER(sector) LIKE $${i + 2}`).join(' OR ')
        const params = [statePattern, ...keywords.map(k => `%${k}%`)]
        const result = await pool.query(
          `SELECT state, scheme_name, incentive_type, sector, benefit_desc, eligibility,
                  amount_percent, portal_url, source
           FROM state_incentives
           WHERE UPPER(state) = $1 AND (${sectorConditions} OR sector = 'All' OR sector IS NULL)
           ORDER BY amount_percent DESC NULLS LAST
           LIMIT ${limit}`,
          params
        )
        rows = result.rows
        // Fall back to all incentives for the state if none matched the sector
        if (rows.length === 0) {
          const fallback = await pool.query(
            `SELECT state, scheme_name, incentive_type, sector, benefit_desc, eligibility,
                    amount_percent, portal_url, source
             FROM state_incentives
             WHERE UPPER(state) = $1
             ORDER BY amount_percent DESC NULLS LAST
             LIMIT ${limit}`,
            [statePattern]
          )
          rows = fallback.rows
        }
      } else {
        const result = await pool.query(
          `SELECT state, scheme_name, incentive_type, sector, benefit_desc, eligibility,
                  amount_percent, portal_url, source
           FROM state_incentives
           WHERE UPPER(state) = $1
           ORDER BY amount_percent DESC NULLS LAST
           LIMIT ${limit}`,
          [statePattern]
        )
        rows = result.rows
      }
    } else {
      // No state — return top incentives across all states
      const result = await pool.query(
        `SELECT state, scheme_name, incentive_type, sector, benefit_desc, eligibility,
                amount_percent, portal_url, source
         FROM state_incentives
         ORDER BY amount_percent DESC NULLS LAST
         LIMIT ${limit}`
      )
      rows = result.rows
    }

    return NextResponse.json({ incentives: rows, state, industry })
  } catch (err) {
    console.error('neon-incentives error:', err)
    return NextResponse.json({ incentives: [], error: 'DB error' }, { status: 500 })
  }
}
