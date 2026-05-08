import { NextRequest, NextResponse } from 'next/server'
import googleTrends from 'google-trends-api'
import * as h3 from 'h3-js'
import { getCityById, type City } from '@/lib/gap-engine/cities'
import { getCategoryById } from '@/lib/gap-engine/categories'
import { getUdyamByState, getPurchasingPower } from '@/lib/gap-engine/udyam'
import { getCensusDensity } from '@/lib/gap-engine/census'
import { getDistrictFormalBusinessIndex } from '@/lib/gap-engine/districts'
import { type PlaceFeature, fetchSupplyFromGoogle } from '@/lib/gap-engine/supply'

export const runtime = 'nodejs'
export const maxDuration = 60

// ─── Seeded RNG ────────────────────────────────────────────────────────────────
function makeRng(seed: string) {
  let s = seed.split('').reduce((a, c) => (Math.imul(31, a) + c.charCodeAt(0)) | 0, 0)
  return () => { s = (Math.imul(48271, s) + 1) | 0; return (s >>> 0) / 4294967296 }
}

// ─── Haversine distance (km) ───────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── 1. Trends: state-level score + city-level resolution ─────────────────────
async function fetchTrendsData(
  keywords: string[],
  city: City,
): Promise<{ stateScore: number; cityScore: number }> {
  try {
    const result = await googleTrends.interestByRegion({
      keyword: keywords[0],
      geo: `IN-${city.stateCode}`,
      resolution: 'CITY',
    })
    const data = JSON.parse(result)
    const regions: { geoName: string; value: number[] }[] = data?.default?.geoMapData ?? []
    if (!regions.length) return { stateScore: 50, cityScore: 50 }

    const nameLower = city.trendsName.toLowerCase()
    const match = regions.find(r => r.geoName?.toLowerCase() === nameLower)
    const cityScore = match?.value?.[0] ?? 0
    const stateScore = Math.round(regions.reduce((s, r) => s + (r.value?.[0] ?? 0), 0) / regions.length)

    return {
      stateScore: stateScore || 50,
      cityScore: cityScore > 0 ? cityScore : stateScore || 50,
    }
  } catch {
    return { stateScore: 50, cityScore: 50 }
  }
}

// ─── 2. 5-year trend direction ─────────────────────────────────────────────────
async function fetchTrendDirection(
  keywords: string[],
  stateCode: string,
): Promise<{ direction: 'growing' | 'stable' | 'declining'; changePercent: number }> {
  try {
    const result = await googleTrends.interestOverTime({
      keyword: keywords[0],
      geo: `IN-${stateCode}`,
      startTime: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
      endTime: new Date(),
    })
    const data = JSON.parse(result)
    const timeline: { value: number[] }[] = data?.default?.timelineData ?? []
    if (timeline.length < 8) return { direction: 'stable', changePercent: 0 }

    const quarter = Math.floor(timeline.length / 4)
    const first = timeline.slice(0, quarter).reduce((s, d) => s + (d.value?.[0] ?? 0), 0) / quarter
    const last  = timeline.slice(-quarter).reduce((s, d) => s + (d.value?.[0] ?? 0), 0) / quarter
    const change = first > 0 ? (last - first) / first : 0
    const changePercent = Math.round(change * 100)

    return {
      direction: change > 0.12 ? 'growing' : change < -0.12 ? 'declining' : 'stable',
      changePercent,
    }
  } catch {
    return { direction: 'stable', changePercent: 0 }
  }
}

// ─── 3. OSM Overpass — supplement Google data (8s timeout) ───────────────────
async function fetchSupplyFromOSM(
  lat: number, lng: number,
  osmTags: string[],
  radiusM: number,
): Promise<PlaceFeature[]> {
  if (!osmTags.length) return []

  const tagFilters = osmTags.map(tag => {
    const eqIdx = tag.indexOf('=')
    const key   = tag.slice(0, eqIdx)
    const value = tag.slice(eqIdx + 1)
    return `  node["${key}"="${value}"](around:${radiusM},${lat},${lng});\n  way["${key}"="${value}"](around:${radiusM},${lat},${lng});`
  }).join('\n')

  const query = `[out:json][timeout:8];\n(\n${tagFilters}\n);\nout center;`

  try {
    const ac = new AbortController()
    const tid = setTimeout(() => ac.abort(), 8000)
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: ac.signal,
      next: { revalidate: 7200 },
    })
    clearTimeout(tid)
    if (!res.ok) return []
    const json = await res.json()
    const elements = (json.elements ?? []) as {
      type: string; lat?: number; lon?: number
      center?: { lat: number; lon: number }
      tags?: Record<string, string>
    }[]

    return elements.map(el => {
      const elLat = el.lat ?? el.center?.lat ?? 0
      const elLng = el.lon ?? el.center?.lon ?? 0
      return {
        lat: elLat,
        lng: elLng,
        name: el.tags?.name ?? el.tags?.['name:en'] ?? 'Unknown',
        vicinity: [el.tags?.['addr:street'], el.tags?.['addr:suburb']].filter(Boolean).join(', '),
        rating: 0,
        userRatingsTotal: 0,
        placeType: 'osm',
        placeId: '',
        source: 'osm' as const,
        footfallScore: 0.4, // OSM places have lower default footfall signal (no reviews data)
      }
    }).filter(p => p.lat !== 0 && p.lng !== 0)
  } catch {
    return []
  }
}

// ─── 5. Place Details footfall proxy (selective: top-N by review count) ────────
async function enrichFootfall(places: PlaceFeature[]): Promise<void> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return

  // Only fetch for top-5 Google Places with most reviews (API cost control)
  const candidates = places
    .filter(p => p.source === 'google' && p.placeId && p.userRatingsTotal > 50)
    .sort((a, b) => b.userRatingsTotal - a.userRatingsTotal)
    .slice(0, 5)

  await Promise.all(candidates.map(async place => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.placeId}&fields=opening_hours&key=${apiKey}`,
        { next: { revalidate: 86400 } },
      )
      if (!res.ok) return
      const json = await res.json()
      const periods = json.result?.opening_hours?.periods ?? []
      if (!periods.length) return

      let score = 0.5
      for (const period of periods) {
        const closeTime = (period.close?.time ?? '') as string
        if (!closeTime) { score = 1.0; break } // 24-hour business
        const closeHour = parseInt(closeTime.slice(0, 2), 10)
        // Open past 9 pm or wraps to early morning = high footfall
        if (closeHour >= 21 || closeHour <= 3) score = Math.max(score, 0.85)
        else if (closeHour >= 19) score = Math.max(score, 0.7)
      }
      place.footfallScore = score
    } catch {
      // leave default
    }
  }))
}

// ─── 6. Merge Google + OSM, dedup by proximity ────────────────────────────────
function mergeAndDedup(google: PlaceFeature[], osm: PlaceFeature[]): PlaceFeature[] {
  // First dedup within Google results by name + vicinity
  const seen = new Set<string>()
  const uniqueGoogle = google.filter(p => {
    const key = `${p.name}|${p.vicinity}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // For OSM: skip if any Google result is within 40m (same business)
  const uniqueOsm = osm.filter(op => {
    return !uniqueGoogle.some(gp => haversineKm(gp.lat, gp.lng, op.lat, op.lng) < 0.04)
  })

  return [...uniqueGoogle, ...uniqueOsm]
}

// ─── 7. Build supply GeoJSON ───────────────────────────────────────────────────
function toSupplyGeoJSON(places: PlaceFeature[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: places.map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: {
        name: p.name,
        vicinity: p.vicinity,
        rating: p.rating,
        userRatingsTotal: p.userRatingsTotal,
        placeType: p.placeType,
        source: p.source,
        footfallScore: p.footfallScore,
      },
    })),
  }
}

// ─── 8. H3 hex demand model (Census 2011 zone density) ────────────────────────
function hexDemandScore(
  hexLat: number, hexLng: number,
  city: City,
  distFromSearch: number, // distance from the active search centre (for decay)
  distFromCity: number,   // distance from city centre (for census density zones)
  trendsScore: number,
  rng: () => number,
): number {
  const maxRadius = city.h3Ring * 0.46
  if (distFromSearch > maxRadius) return 0

  // Distance decay from search centre
  const sigma = 2.0 + Math.sqrt(city.population / 2046) * 5.5
  const distFactor = Math.exp(-(distFromSearch * distFromSearch) / (2 * sigma * sigma))

  // Census 2011 zone-level density — always relative to city centre
  const zoneDensity = getCensusDensity(city.id, distFromCity)
  const denseFactor = Math.min(1.25, 0.5 + (Math.log(zoneDensity + 1) / Math.log(55000)) * 0.75)

  const trendsBase = trendsScore / 100
  const noise = 0.72 + rng() * 0.28

  return Math.min(1, trendsBase * distFactor * denseFactor * noise * 1.4)
}

// ─── 9. Supply strength per hex ───────────────────────────────────────────────
function supplyStrength(
  count: number, avgRating: number, avgReviews: number, avgFootfall: number,
): number {
  if (count === 0) return 0
  const countScore   = Math.min(1, Math.log(count + 1) / Math.log(13))
  const reviewScore  = avgReviews > 0 ? Math.min(1, Math.log(avgReviews + 1) / Math.log(500)) : 0.25
  const ratingMult   = avgRating > 0 ? 0.55 + (avgRating / 5) * 0.45 : 0.65
  // Footfall (0-1): high-footfall incumbents = harder competition
  const footfallBoost = 0.85 + avgFootfall * 0.15
  return Math.min(1, (countScore * 0.60 + reviewScore * 0.30 + (avgFootfall * 0.10)) * ratingMult * footfallBoost)
}

// ─── 10. Build H3 hex GeoJSON ──────────────────────────────────────────────────
function buildHexGeoJSON(
  city: City,
  searchLat: number,
  searchLng: number,
  cityTrendsScore: number,
  places: PlaceFeature[],
  rng: () => number,
): GeoJSON.FeatureCollection {
  const RES = 8

  type HexSupply = {
    count: number; totalRating: number; totalReviews: number
    totalFootfall: number; osmCount: number
  }
  const supplyByHex = new Map<string, HexSupply>()

  for (const p of places) {
    const cellId = h3.latLngToCell(p.lat, p.lng, RES)
    const ex = supplyByHex.get(cellId) ?? { count: 0, totalRating: 0, totalReviews: 0, totalFootfall: 0, osmCount: 0 }
    ex.count++
    ex.totalRating   += p.rating > 0 ? p.rating : 3.5
    ex.totalReviews  += p.userRatingsTotal
    ex.totalFootfall += p.footfallScore
    if (p.source === 'osm') ex.osmCount++
    supplyByHex.set(cellId, ex)
  }

  // Hex disk centred on search point (not necessarily city centre)
  const centerCell = h3.latLngToCell(searchLat, searchLng, RES)
  const disk = h3.gridDisk(centerCell, city.h3Ring)

  const features: GeoJSON.Feature[] = []
  for (const cellId of disk) {
    const [hexLat, hexLng] = h3.cellToLatLng(cellId)
    const distFromSearch = haversineKm(hexLat, hexLng, searchLat, searchLng)
    const distFromCity   = haversineKm(hexLat, hexLng, city.lat, city.lng)

    const demandScore = hexDemandScore(hexLat, hexLng, city, distFromSearch, distFromCity, cityTrendsScore, rng)
    if (demandScore < 0.05) continue

    const supply = supplyByHex.get(cellId) ?? { count: 0, totalRating: 0, totalReviews: 0, totalFootfall: 0, osmCount: 0 }
    const avgRating   = supply.count > 0 ? supply.totalRating   / supply.count : 0
    const avgReviews  = supply.count > 0 ? supply.totalReviews  / supply.count : 0
    const avgFootfall = supply.count > 0 ? supply.totalFootfall / supply.count : 0
    const supplyScore = supplyStrength(supply.count, avgRating, avgReviews, avgFootfall)

    const gapScore = Math.max(0, demandScore - supplyScore)
    const demandRelevance = Math.min(1, demandScore / 0.2)
    const opportunityScore = gapScore * demandRelevance

    const boundary = h3.cellToBoundary(cellId)
    const coords = [...boundary, boundary[0]].map(([la, ln]) => [ln, la])

    features.push({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coords] },
      properties: {
        h3id: cellId,
        demandScore:      Math.round(demandScore * 100),
        supplyScore:      Math.round(supplyScore * 100),
        gapScore:         Math.round(gapScore * 100),
        opportunityScore: Math.round(opportunityScore * 100),
        supplyCount:      supply.count,
        osmCount:         supply.osmCount,
        avgRating:        Math.round(avgRating * 10) / 10,
        totalReviews:     supply.totalReviews,
        avgFootfall:      Math.round(avgFootfall * 100),
        distKm:           Math.round(distFromSearch * 10) / 10,
      },
    })
  }

  return { type: 'FeatureCollection', features }
}

// ─── Main handler ──────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cityId     = searchParams.get('city')
  const categoryId = searchParams.get('category')
  const radius     = parseInt(searchParams.get('radius') ?? '3000', 10)
  const centerLat  = parseFloat(searchParams.get('centerLat') ?? '')
  const centerLng  = parseFloat(searchParams.get('centerLng') ?? '')

  if (!cityId || !categoryId) return NextResponse.json({ error: 'city and category required' }, { status: 400 })

  const city     = getCityById(cityId)
  const category = getCategoryById(categoryId)
  if (!city || !category) return NextResponse.json({ error: 'Invalid city or category' }, { status: 400 })

  // Use custom pin location if provided, otherwise fall back to city centre
  const searchLat = Number.isFinite(centerLat) ? centerLat : city.lat
  const searchLng = Number.isFinite(centerLng) ? centerLng : city.lng
  const isCustomCenter = Number.isFinite(centerLat) && Number.isFinite(centerLng)

  const udyam           = getUdyamByState(city.stateCode)
  const purchasingPower = getPurchasingPower(city.stateCode)

  // Parallel: trends (state+city), 5yr direction, Google Places, OSM
  const [trendsData, trendDir, googleResult, osmPlaces] = await Promise.all([
    fetchTrendsData(category.trendsKeywords, city),
    fetchTrendDirection(category.trendsKeywords, city.stateCode),
    fetchSupplyFromGoogle(searchLat, searchLng, category, radius),
    fetchSupplyFromOSM(searchLat, searchLng, category.osmTags, radius),
  ])

  const { places: googlePlaces, multilingualCount } = googleResult

  // Enrich top places with footfall signal (Place Details API)
  await enrichFootfall(googlePlaces)

  // Merge Google + OSM, deduplicate
  const allPlaces = mergeAndDedup(googlePlaces, osmPlaces)
  const supplyGeoJSON = toSupplyGeoJSON(allPlaces)

  const { stateScore, cityScore } = trendsData
  const rng = makeRng(cityId + categoryId)

  // Build H3 hex grid around the active search centre
  const hexGeoJSON = buildHexGeoJSON(city, searchLat, searchLng, cityScore, allPlaces, rng)

  // Aggregate stats
  const hexProps = hexGeoJSON.features.map(f => f.properties as {
    demandScore: number; supplyScore: number; gapScore: number
    opportunityScore: number; supplyCount: number; avgRating: number
    totalReviews: number; avgFootfall: number
  })
  const totalHexes           = hexProps.length
  const opportunityHexes     = hexProps.filter(h => h.opportunityScore >= 50).length
  const highOpportunityHexes = hexProps.filter(h => h.opportunityScore >= 70).length
  const avgHexDemand         = totalHexes > 0 ? hexProps.reduce((s, h) => s + h.demandScore, 0) / totalHexes : 0
  const avgHexSupply         = totalHexes > 0 ? hexProps.reduce((s, h) => s + h.supplyScore, 0) / totalHexes : 0

  const googleCount     = allPlaces.filter(p => p.source === 'google').length
  const textSearchCount = allPlaces.filter(p => p.placeType === 'text_search').length
  const umbrellaCount   = allPlaces.filter(p => p.placeType.startsWith('umbrella:')).length
  const osmCount        = allPlaces.filter(p => p.source === 'osm').length
  const supplyCount  = allPlaces.length
  const avgRating    = googleCount > 0
    ? allPlaces.filter(p => p.source === 'google').reduce((s, p) => s + p.rating, 0) / googleCount : 0
  const totalReviews = allPlaces.reduce((s, p) => s + p.userRatingsTotal, 0)

  // City-level gap score: blend Trends demand, purchasing power, formal business density
  const formalBusinessIndex = getDistrictFormalBusinessIndex(city.id)
  const udyamDensity        = udyam?.densityIndex ?? 50

  const demandScore    = Math.round(cityScore * 0.65 + purchasingPower * 0.35)
  const logNormSupply  = supplyCount <= 0 ? 0 : Math.min(100, Math.round((Math.log(supplyCount + 1) / Math.log(51)) * 100))
  const supplyScore    = Math.round(logNormSupply * 0.55 + formalBusinessIndex * 0.25 + udyamDensity * 0.20)
  // Multiplicative gap: rewards high demand AND low supply; avoids always-zero on subtraction
  const gapScore       = Math.round(demandScore * (100 - supplyScore) / 50)

  let rating: 'high' | 'medium' | 'low' | 'saturated'
  if (gapScore >= 40)      rating = 'high'
  else if (gapScore >= 20) rating = 'medium'
  else if (gapScore >= 5)  rating = 'low'
  else                     rating = 'saturated'

  return NextResponse.json({
    city: { id: city.id, name: city.name, state: city.state, tier: city.tier, lat: city.lat, lng: city.lng },
    searchCenter: { lat: searchLat, lng: searchLng, isCustom: isCustomCenter },
    category: {
      id: category.id, label: category.label, icon: category.icon,
      description: category.description, trendsKeywords: category.trendsKeywords,
    },
    hexGeoJSON,
    supplyGeoJSON,
    stats: {
      demandScore,
      supplyScore,
      gapScore,
      rating,
      stateScore,
      cityScore,
      purchasingPower,
      supplyCount,
      googleCount,
      textSearchCount,
      umbrellaCount,
      multilingualCount,
      osmCount,
      avgRating:            Math.round(avgRating * 10) / 10,
      totalReviews,
      trendDirection:       trendDir.direction,
      trendChangePercent:   trendDir.changePercent,
      totalHexes,
      opportunityHexes,
      highOpportunityHexes,
      avgHexDemand:         Math.round(avgHexDemand),
      avgHexSupply:         Math.round(avgHexSupply),
      udyamDensity,
      formalBusinessIndex,
      radius,
    },
  })
}
