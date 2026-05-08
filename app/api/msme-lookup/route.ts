import { NextResponse } from 'next/server'
import { searchMSMEs, matchMSMESector, COMPANIES, MSME_SECTOR_MAP } from '@/lib/msme/companies'

const ALL_MSME_SECTORS = Object.keys(MSME_SECTOR_MAP)
const ALL_MSME_STATES  = [...new Set(COMPANIES.map(c => c.state))].sort()

export const runtime = 'nodejs'
export const revalidate = 86400

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const industry = searchParams.get('industry') ?? ''
  const state    = searchParams.get('state') ?? ''
  const q        = searchParams.get('q') ?? ''
  const limit    = Math.min(50, parseInt(searchParams.get('limit') ?? '30', 10))

  const resolvedSector = industry ? (matchMSMESector(industry) ?? 'Manufacturing') : 'Manufacturing'

  const results = searchMSMEs(q, resolvedSector, state || undefined)

  return NextResponse.json({
    sector:     resolvedSector,
    total:      results.length,
    companies:  results.slice(0, limit),
    sectors:    ALL_MSME_SECTORS,
    states:     ALL_MSME_STATES,
    dataSource: 'MCA21 Company Master Data — data.gov.in (active registered companies)',
  })
}
