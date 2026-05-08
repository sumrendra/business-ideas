import { NextRequest, NextResponse } from 'next/server'
import googleTrends from 'google-trends-api'
import { getCityById } from '@/lib/gap-engine/cities'
import { CATEGORIES } from '@/lib/gap-engine/categories'
import { getPurchasingPower } from '@/lib/gap-engine/udyam'
import { fetchSupplyQuick } from '@/lib/gap-engine/supply'

export const runtime = 'nodejs'
export const maxDuration = 55

// Quick state-level trends score for one keyword
async function quickTrends(keyword: string, stateCode: string): Promise<number> {
  try {
    const result = await googleTrends.interestByRegion({
      keyword,
      geo: `IN-${stateCode}`,
      resolution: 'CITY',
    })
    const regions: { value: number[] }[] = JSON.parse(result)?.default?.geoMapData ?? []
    if (!regions.length) return 50
    const avg = regions.reduce((s, r) => s + (r.value?.[0] ?? 0), 0) / regions.length
    return Math.round(avg) || 50
  } catch {
    return 50
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cityId    = searchParams.get('city')
  const radius    = parseInt(searchParams.get('radius') ?? '3000', 10)
  const centerLat = parseFloat(searchParams.get('centerLat') ?? '')
  const centerLng = parseFloat(searchParams.get('centerLng') ?? '')

  if (!cityId) return NextResponse.json({ error: 'city required' }, { status: 400 })

  const city = getCityById(cityId)
  if (!city) return NextResponse.json({ error: 'Invalid city' }, { status: 400 })

  const searchLat = Number.isFinite(centerLat) ? centerLat : city.lat
  const searchLng = Number.isFinite(centerLng) ? centerLng : city.lng
  const purchasingPower = getPurchasingPower(city.stateCode)
  const apiKey = process.env.GOOGLE_MAPS_API_KEY ?? ''

  // All 15 categories scanned in parallel — typed + text keywords + umbrella + multilingual
  const results = await Promise.all(
    CATEGORIES.map(async cat => {
      const [trendsScore, supplyResult] = await Promise.all([
        quickTrends(cat.trendsKeywords[0], city.stateCode),
        apiKey
          ? fetchSupplyQuick(searchLat, searchLng, cat, radius, apiKey)
          : Promise.resolve({ count: 0, multilingualCount: 0 }),
      ])

      const { count: supplyCount, multilingualCount } = supplyResult
      const demandScore   = Math.round(trendsScore * 0.65 + purchasingPower * 0.35)
      // log(51) ceiling — 50 businesses = fully saturated; 20 businesses ≈ 76
      const supplyScore   = supplyCount <= 0 ? 0 : Math.min(100, Math.round((Math.log(supplyCount + 1) / Math.log(51)) * 100))
      // Multiplicative gap: rewards high demand AND low supply; avoids always-zero on subtraction
      const gapScore      = Math.round(demandScore * (100 - supplyScore) / 50)

      const rating: 'high' | 'medium' | 'low' | 'saturated' =
        gapScore >= 40 ? 'high' : gapScore >= 20 ? 'medium' : gapScore >= 5 ? 'low' : 'saturated'

      return { id: cat.id, label: cat.label, icon: cat.icon, demandScore, supplyCount, multilingualCount, supplyScore, gapScore, rating }
    })
  )

  results.sort((a, b) => b.gapScore - a.gapScore)

  return NextResponse.json({
    city: city.name,
    searchCenter: { lat: searchLat, lng: searchLng, isCustom: Number.isFinite(centerLat) },
    results,
  })
}
