import { NextRequest, NextResponse } from 'next/server'
import googleTrends from 'google-trends-api'
import { getCityById } from '@/lib/gap-engine/cities'
import { getCategoryById } from '@/lib/gap-engine/categories'
import { getUdyamByState, getPurchasingPower } from '@/lib/gap-engine/udyam'

export const runtime = 'nodejs'
export const maxDuration = 30

// Normalise a value 0–max to 0–100
function normalise(value: number, max: number): number {
  if (max <= 0) return 0
  return Math.min(100, Math.round((value / max) * 100))
}

// Log-normalise supply count (Places API caps at 60; 60 = saturated)
function normaliseSupply(count: number): number {
  if (count <= 0) return 0
  // log scale: 1→5, 5→32, 10→50, 20→65, 40→83, 60→100
  return Math.min(100, Math.round((Math.log(count + 1) / Math.log(61)) * 100))
}

async function fetchTrendsScore(keywords: string[], geo: string): Promise<number> {
  try {
    // Use first keyword for Trends (most specific)
    const result = await googleTrends.interestByRegion({
      keyword: keywords[0],
      geo,
      resolution: 'REGION',
    })
    const data = JSON.parse(result)
    const regions: { geoName: string; value: number[] }[] = data?.default?.geoMapData ?? []
    if (regions.length === 0) return 50 // default if no data

    // Find the state that matches geo suffix (e.g. IN-MH)
    const stateCode = geo.split('-')[1]
    const match = regions.find(r =>
      r.geoName?.toLowerCase().includes(stateCode?.toLowerCase() ?? '')
    )
    if (match && match.value.length > 0) return match.value[0]

    // Fallback: return average of top 5 regions
    const avg = regions.slice(0, 5).reduce((s, r) => s + (r.value[0] ?? 0), 0) / 5
    return Math.round(avg)
  } catch {
    // Google Trends can throttle or fail — return neutral score
    return 50
  }
}

async function fetchPlacesCount(
  lat: number,
  lng: number,
  types: string[],
  radius: number
): Promise<number> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return 0

  let total = 0
  for (const type of types.slice(0, 2)) { // max 2 types to limit API spend
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    url.searchParams.set('location', `${lat},${lng}`)
    url.searchParams.set('radius', String(radius))
    url.searchParams.set('type', type)
    url.searchParams.set('key', apiKey)

    try {
      const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
      if (!res.ok) continue
      const json = await res.json()
      if (json.status === 'OK' || json.status === 'ZERO_RESULTS') {
        total += (json.results ?? []).length
      }
    } catch {
      // Skip on network error
    }
  }
  return total
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cityId = searchParams.get('city')
  const categoryId = searchParams.get('category')
  const radius = parseInt(searchParams.get('radius') ?? '3000', 10)

  if (!cityId || !categoryId) {
    return NextResponse.json({ error: 'city and category are required' }, { status: 400 })
  }

  const city = getCityById(cityId)
  const category = getCategoryById(categoryId)

  if (!city || !category) {
    return NextResponse.json({ error: 'Invalid city or category' }, { status: 400 })
  }

  const udyam = getUdyamByState(city.stateCode)
  const purchasingPower = getPurchasingPower(city.stateCode)

  // Fetch demand and supply in parallel
  const geoCode = `IN-${city.stateCode}`
  const [trendsScore, placesCount] = await Promise.all([
    fetchTrendsScore(category.trendsKeywords, geoCode),
    fetchPlacesCount(city.lat, city.lng, category.placesTypes, radius),
  ])

  // Adjust demand by purchasing power (blend 70% trends + 30% purchasing power)
  const demandScore = Math.round(trendsScore * 0.7 + purchasingPower * 0.3)

  // Supply score: mix 60% Places count + 40% Udyam density for the state
  const placeNorm = normaliseSupply(placesCount)
  const udyamDensity = udyam?.densityIndex ?? 50
  const supplyScore = Math.round(placeNorm * 0.6 + udyamDensity * 0.4)

  // Gap score: demand minus supply (negative = oversupplied; positive = opportunity)
  const gapScore = Math.max(0, demandScore - supplyScore)

  // Opportunity rating
  let rating: 'high' | 'medium' | 'low' | 'saturated'
  if (gapScore >= 40) rating = 'high'
  else if (gapScore >= 20) rating = 'medium'
  else if (gapScore >= 0) rating = 'low'
  else rating = 'saturated'

  return NextResponse.json({
    city: { id: city.id, name: city.name, state: city.state, tier: city.tier },
    category: { id: category.id, label: category.label, icon: category.icon },
    demand: {
      score: demandScore,
      trendsScore,
      purchasingPower,
      geo: geoCode,
      keyword: category.trendsKeywords[0],
    },
    supply: {
      score: supplyScore,
      placesCount,
      placesRadius: radius,
      udyamDensity,
      stateCode: city.stateCode,
    },
    gapScore,
    rating,
    note: 'Demand uses Google Trends search interest. Supply uses Google Maps nearby business count + Udyam MSME density. This is an indicative signal, not a market study.',
  })
}
