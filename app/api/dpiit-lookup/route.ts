import { NextResponse } from 'next/server'
import { searchStartups, matchSector, scoreStartupsByIdea, ALL_SECTORS, ALL_STATES } from '@/lib/dpiit/startups'

export const runtime = 'nodejs'
export const revalidate = 86400

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const industry  = searchParams.get('industry') ?? ''
  const ideaTitle = searchParams.get('title') ?? ''
  const state     = searchParams.get('state') ?? ''
  const q         = searchParams.get('q') ?? ''
  const limit     = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10))

  const resolvedSector = industry ? (matchSector(industry) ?? 'All') : 'All'

  // When we have an idea title, score by relevance instead of returning the whole sector
  if (ideaTitle && resolvedSector !== 'All') {
    const { exact, sector } = scoreStartupsByIdea(ideaTitle, resolvedSector, state || undefined)

    // Apply free-text filter on top if the user typed something
    const applyQ = (list: typeof exact) =>
      q ? list.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) ||
                           s.subSector.toLowerCase().includes(q.toLowerCase())) : list

    const exactFiltered  = applyQ(exact)
    const sectorFiltered = applyQ(sector)

    return NextResponse.json({
      sector:       resolvedSector,
      matchMode:    exactFiltered.length > 0 ? 'exact' : 'sector-fallback',
      exact:        exactFiltered.slice(0, limit),
      sectorResults: sectorFiltered.slice(0, limit),
      total:        exact.length + sector.length,
      sectors:      ALL_SECTORS,
      states:       ALL_STATES,
      dataSource:   'DPIIT Startup Recognition CSV (Dec 2023) + public Crunchbase/MCA21 data',
    })
  }

  // Legacy path: no title, just sector filter
  const results = searchStartups(q, resolvedSector === 'All' ? undefined : resolvedSector, state || undefined)

  return NextResponse.json({
    sector:       resolvedSector,
    matchMode:    'sector',
    exact:        results.slice(0, limit),
    sectorResults: [],
    total:        results.length,
    sectors:      ALL_SECTORS,
    states:       ALL_STATES,
    dataSource:   'DPIIT Startup Recognition CSV (Dec 2023) + public Crunchbase/MCA21 data',
  })
}
