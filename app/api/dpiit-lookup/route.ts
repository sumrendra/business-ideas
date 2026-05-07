import { NextResponse } from 'next/server'
import { searchStartups, matchSector, ALL_SECTORS, ALL_STATES } from '@/lib/dpiit/startups'

export const runtime = 'nodejs'
export const revalidate = 86400  // static data — cache for 24h

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const industry = searchParams.get('industry') ?? ''
  const state    = searchParams.get('state') ?? ''
  const q        = searchParams.get('q') ?? ''
  const limit    = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10))

  // Resolve idea industry to DPIIT sector bucket
  const resolvedSector = industry ? (matchSector(industry) ?? 'All') : 'All'

  const results = searchStartups(q, resolvedSector === 'All' ? undefined : resolvedSector, state || undefined)

  return NextResponse.json({
    sector:     resolvedSector,
    total:      results.length,
    startups:   results.slice(0, limit),
    sectors:    ALL_SECTORS,
    states:     ALL_STATES,
    dataSource: 'DPIIT Startup Recognition CSV (Dec 2023) + public Crunchbase/MCA21 data',
  })
}
