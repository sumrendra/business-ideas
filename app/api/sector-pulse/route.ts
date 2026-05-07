import { NextResponse } from 'next/server'
import { buildAllSectorPulses } from '@/lib/sector-pulse/signals'
import type { SectorPulseResponse } from '@/lib/sector-pulse/types'

export const runtime = 'nodejs'
export const revalidate = 86400  // cache 24h — data is preprocessed, no point re-running every request

export async function GET() {
  const sectors = await buildAllSectorPulses()

  const accelerating = sectors.filter(s => s.lifecycle === 'Accelerating').length
  const declining    = sectors.filter(s => s.lifecycle === 'Declining').length
  const topOpp  = sectors[0]?.label ?? ''
  const topRisk = [...sectors].sort((a, b) => b.riskScore - a.riskScore)[0]?.label ?? ''

  const response: SectorPulseResponse = {
    sectors,
    summary: {
      totalSectors:  sectors.length,
      accelerating,
      declining,
      topOpportunity: topOpp,
      topRisk,
      dataAsOf: new Date().toISOString(),
    },
  }

  return NextResponse.json(response)
}
