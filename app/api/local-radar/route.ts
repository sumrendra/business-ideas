import { NextResponse } from 'next/server'
import { getNicByCode } from '@/lib/local-radar/nic-codes'
import { fetchPlacesTemporal } from '@/lib/local-radar/places-temporal'
import { getIncorporationTrend, getMcaSummary } from '@/lib/local-radar/mca21-static'
import { fetchUdyamData } from '@/lib/local-radar/udyam'
import { estimateGstinCount } from '@/lib/local-radar/gstin'
import type { RadarResult, YearCount, DataSource } from '@/lib/local-radar/types'
import { readFile } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'
// No revalidate — each query is unique (city + nicCode)

// Geocode a city + state string using Google Geocoding API
async function geocode(city: string, state: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(`${city}, ${state}, India`)
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${q}&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    )
    const data = await res.json()
    const loc = data.results?.[0]?.geometry?.location
    return loc ? { lat: loc.lat, lng: loc.lng } : null
  } catch { return null }
}

// Merge trajectories from multiple sources into a unified year-series
function mergeTrajectories(sources: { data: YearCount[]; weight: number }[]): YearCount[] {
  const yearMap = new Map<number, { counts: number[]; sources: DataSource[] }>()

  for (const { data } of sources) {
    for (const item of data) {
      const existing = yearMap.get(item.year) ?? { counts: [], sources: [] }
      existing.counts.push(item.count)
      if (!existing.sources.includes(item.source)) existing.sources.push(item.source)
      yearMap.set(item.year, existing)
    }
  }

  return [...yearMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, { counts, sources }]) => ({
      year,
      count: Math.round(counts.reduce((a, b) => a + b, 0) / counts.length), // average if multi-source
      source: sources[0] as DataSource,
    }))
}

function computeTrend(trajectory: YearCount[]): { trend: RadarResult['trend']; reason: string; velocity: number } {
  if (trajectory.length < 2) return { trend: 'Stable', reason: 'Insufficient data for trend analysis', velocity: 0 }

  const recent = trajectory.slice(-3)
  const older  = trajectory.slice(0, -3)

  const recentAvg = recent.reduce((a, b) => a + b.count, 0) / recent.length
  const olderAvg  = older.length ? older.reduce((a, b) => a + b.count, 0) / older.length : recentAvg

  const velocity = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0

  // Check if total counts are small (emerging market)
  const totalCount = trajectory.reduce((a, b) => a + b.count, 0)
  const lastYearCount = trajectory.at(-1)?.count ?? 0

  if (totalCount < 10 && velocity >= 0) {
    return { trend: 'Emerging', reason: `Fewer than 10 tracked entries — early-stage market with ${lastYearCount} recent entrants`, velocity }
  }

  if (velocity > 0.3) {
    return {
      trend: 'Rising',
      reason: `Entry rate grew ${Math.round(velocity * 100)}% vs 3-year average — strong demand signal`,
      velocity,
    }
  }

  if (velocity > 0.1) {
    return { trend: 'Rising', reason: `Steady ${Math.round(velocity * 100)}% growth in new entrants`, velocity }
  }

  if (velocity < -0.2) {
    return {
      trend: 'Declining',
      reason: `Entry rate fell ${Math.round(Math.abs(velocity) * 100)}% — possible market saturation or reduced viability`,
      velocity,
    }
  }

  // Check absolute level — if high count + stable = saturating
  if (lastYearCount > 50) {
    return { trend: 'Saturating', reason: `High entry volume (${lastYearCount}/year) with flat growth — market maturing`, velocity }
  }

  return { trend: 'Stable', reason: `Entry rate stable at ~${Math.round(recentAvg)} new businesses/year`, velocity }
}

// Try to load real MCA21 processed data if script has been run
async function loadMca21Processed(city: string, nicDivision: string): Promise<Record<number, number> | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'mca21', 'summary.json')
    const raw = await readFile(filePath, 'utf-8')
    const data = JSON.parse(raw)
    const cityData = data.byCityNicYear?.[city]?.[nicDivision]
    if (!cityData) return null
    // Convert {year: {active, struckOff}} → {year: count}
    const byYear: Record<number, number> = {}
    for (const [y, v] of Object.entries(cityData)) {
      const val = v as { active: number; struckOff: number }
      byYear[parseInt(y)] = (val.active ?? 0) + (val.struckOff ?? 0)
    }
    return byYear
  } catch { return null }
}

export async function GET(req: Request) {
  const startMs = Date.now()
  const { searchParams } = new URL(req.url)

  const nicCode  = searchParams.get('nic') ?? ''
  const city     = searchParams.get('city') ?? ''
  const state    = searchParams.get('state') ?? ''
  const radiusKm = parseFloat(searchParams.get('radius') ?? '15')

  if (!nicCode || !city || !state) {
    return NextResponse.json({ error: 'Required: nic, city, state' }, { status: 400 })
  }

  const nic = getNicByCode(nicCode)
  if (!nic) return NextResponse.json({ error: `Unknown NIC code: ${nicCode}` }, { status: 400 })

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY not set' }, { status: 500 })

  // 1. Geocode city
  const coords = await geocode(city, state, apiKey)
  if (!coords) return NextResponse.json({ error: `Could not geocode: ${city}, ${state}` }, { status: 422 })

  // 2. All 4 sources in parallel (Places takes longest)
  const [placesResult, udyamResult, mca21ProcessedRaw] = await Promise.all([
    fetchPlacesTemporal(coords.lat, coords.lng, radiusKm, nic.placeKeywords, apiKey, 25),
    fetchUdyamData(state, city, nicCode),
    loadMca21Processed(city, nic.division),
  ])

  // 3. MCA21 — prefer processed file, fall back to curated static data
  const mcaStatic  = getMcaSummary(state, nic.division)
  const mcaTrend   = getIncorporationTrend(state, nic.division)

  const mca21Trajectory: YearCount[] = mca21ProcessedRaw
    ? Object.entries(mca21ProcessedRaw)
        .map(([y, c]) => ({ year: parseInt(y), count: c as number, source: 'mca21' as const }))
        .sort((a, b) => a.year - b.year)
    : mcaTrend

  // 4. GSTIN estimate
  const gstinEst = estimateGstinCount(state, nic.division)

  // 5. Merge trajectory — only use city-level sources for trend to avoid
  // scale mismatch between city-level Places (~1-30/yr) and state-level MCA21 (~100-800/yr).
  // MCA21 static data is state-level; only include it when it's the city-processed version.
  const cityLevelSources: { data: YearCount[]; weight: number }[] = [
    { data: placesResult.trajectory, weight: 3 },
    { data: udyamResult.trajectory, weight: 2 },
  ]
  if (mca21ProcessedRaw) {
    // City-level MCA21 from preprocessed file — same scale as Places, safe to merge
    cityLevelSources.push({ data: mca21Trajectory, weight: 2 })
  }

  const mergedTrajectory = mergeTrajectories(cityLevelSources)

  const { trend, reason, velocity } = computeTrend(mergedTrajectory)

  const trajectoryBySource: RadarResult['trajectoryBySource'] = {
    google_places: placesResult.trajectory,
    mca21:         mca21Trajectory,
    udyam:         udyamResult.trajectory,
    gstin:         [],  // GSTIN doesn't give year-level breakdown
  }

  const result: RadarResult = {
    businessType: nic.label,
    nicCode,
    city,
    state,
    lat:     coords.lat,
    lng:     coords.lng,
    radiusKm,

    trajectory:         mergedTrajectory,
    trajectoryBySource,

    currentCount:  placesResult.currentCount,
    closedCount:   placesResult.closedCount,
    survivalRate:  placesResult.survivalRate,
    businesses:    placesResult.businesses.slice(0, 30),

    entryVelocity: Math.round(velocity * 100),
    trend,
    trendReason:   reason,

    mcaStateSummary: mcaStatic ? {
      state,
      nicDivision:          nic.division,
      incorporationsByYear: mcaStatic.incorporationsByYear,
      activeCount:          mcaStatic.activeCount,
      struckOffCount:       mcaStatic.struckOffCount,
      survivalRate:         mcaStatic.survivalRate,
    } : undefined,

    udyamSummary: {
      district: city,
      nicCode,
      registrationsByYear: udyamResult.byYear,
      totalCount:          udyamResult.totalCount,
      source:              udyamResult.source,
      note:                udyamResult.note,
    },

    gstinEstimate: gstinEst ? {
      state,
      count: gstinEst.sectorEstimate,
      note:  gstinEst.note,
    } : undefined,

    sourcesSummary: [
      {
        source:      'google_places',
        status:      'live',
        description: `Live Google Places search — ${placesResult.businesses.length} businesses found, review-date temporal analysis`,
        count:       placesResult.businesses.length,
      },
      {
        source:      'mca21',
        status:      mca21ProcessedRaw ? 'live' : 'estimated',
        description: mca21ProcessedRaw
          ? `MCA21 company master data (preprocessed) — city-level incorporations for NIC ${nic.division}`
          : `MCA Annual Report statistics — state-level incorporations for NIC division ${nic.division} (run scripts/fetch-mca21.mjs for city-level)`,
        count: mcaStatic?.activeCount,
      },
      {
        source:      'udyam',
        status:      udyamResult.source === 'api' ? 'live' : 'unavailable',
        description: udyamResult.source === 'api'
          ? `data.gov.in Udyam API — district MSME registrations for NIC ${nicCode}`
          : (udyamResult.note ?? 'Set DATA_GOV_IN_API_KEY to enable'),
        count: udyamResult.totalCount,
      },
      {
        source:      'gstin',
        status:      gstinEst ? 'estimated' : 'unavailable',
        description: gstinEst
          ? `GSTN Annual Statistics — estimated ${gstinEst.sectorEstimate.toLocaleString()} active GST filers in this sector in ${state}`
          : 'GSTIN bulk API not publicly available',
        count: gstinEst?.sectorEstimate,
      },
    ],

    generatedAt: new Date().toISOString(),
    durationMs:  Date.now() - startMs,
  }

  return NextResponse.json(result)
}
