import type { Category } from './categories'

// Types precise enough that any result from nearbysearch can be trusted
// without further name filtering. Broad types (health, store, establishment, etc.)
// are NOT in this list — those results must match nameKeywords to be included.
const TRUSTED_PLACE_TYPES = new Set([
  'pharmacy',
  'gym',
  'atm',
  'bank',
  'laundry',
  'beauty_salon',
  'hair_care',
  'veterinary_care',
  'pet_store',
  'tutoring_center',
  'meal_delivery',
  'coworking_space',
  'hospital',
  'doctor',
])

export interface PlaceFeature {
  lat: number
  lng: number
  name: string
  vicinity: string
  rating: number
  userRatingsTotal: number
  placeType: string
  placeId: string
  source: 'google' | 'osm'
  footfallScore: number
}

export function parsePlacesResult(p: Record<string, unknown>, placeType: string): PlaceFeature | null {
  const geo = p.geometry as { location: { lat: number; lng: number } }
  const lat = geo?.location?.lat ?? 0
  const lng = geo?.location?.lng ?? 0
  if (!lat || !lng) return null
  return {
    lat, lng,
    name: (p.name as string) ?? 'Unknown',
    vicinity: (p.vicinity as string) ?? (p.formatted_address as string) ?? '',
    rating: (p.rating as number) ?? 0,
    userRatingsTotal: (p.user_ratings_total as number) ?? 0,
    placeType,
    placeId: (p.place_id as string) ?? '',
    source: 'google',
    footfallScore: 0.5,
  }
}

export function dedup(p: PlaceFeature, seenIds: Set<string>, seenNames: Set<string>): boolean {
  if (p.placeId) {
    if (seenIds.has(p.placeId)) return false
    seenIds.add(p.placeId)
  } else {
    const key = `${p.name.toLowerCase()}|${p.vicinity.toLowerCase()}`
    if (seenNames.has(key)) return false
    seenNames.add(key)
  }
  return true
}

export function matchesCategoryMultilingual(name: string, nameKeywords: string[]): boolean {
  const n = name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ')
  return nameKeywords.some(kw => {
    const k = kw.toLowerCase()
    if (k.length <= 4) return new RegExp(`\\b${k}\\b`).test(n)
    return n.includes(k)
  })
}

// Typed nearbysearch — paginated (full version for detailed route)
export async function fetchByNearbySearch(
  lat: number, lng: number,
  type: string,
  radius: number,
  apiKey: string,
  paginate = true,
): Promise<PlaceFeature[]> {
  const base = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`
  const results: PlaceFeature[] = []
  try {
    const r1 = await fetch(base, { next: { revalidate: 3600 } })
    if (!r1.ok) return results
    const j1 = await r1.json()
    if (j1.status !== 'OK' && j1.status !== 'ZERO_RESULTS') return results
    for (const p of j1.results ?? []) {
      const f = parsePlacesResult(p, type); if (f) results.push(f)
    }
    if (paginate && j1.next_page_token) {
      await new Promise(r => setTimeout(r, 2200))
      const r2 = await fetch(`${base}&pagetoken=${j1.next_page_token}`, { next: { revalidate: 3600 } })
      if (r2.ok) {
        const j2 = await r2.json()
        for (const p of j2.results ?? []) {
          const f = parsePlacesResult(p, type); if (f) results.push(f)
        }
      }
    }
  } catch { /* ignore */ }
  return results
}

// Text search — top-20 relevance-ranked results, no pagination
export async function fetchByTextSearch(
  keyword: string,
  lat: number, lng: number,
  radius: number,
  apiKey: string,
): Promise<PlaceFeature[]> {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(keyword)}&location=${lat},${lng}&radius=${radius}&key=${apiKey}`
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json()
    if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') return []
    const out: PlaceFeature[] = []
    for (const p of json.results ?? []) {
      const f = parsePlacesResult(p, 'text_search'); if (f) out.push(f)
    }
    return out
  } catch {
    return []
  }
}

// Umbrella broad type fetch — attaches rawTypes[] for classification
export async function fetchByUmbrellaType(
  lat: number, lng: number,
  type: string,
  radius: number,
  apiKey: string,
  paginate = true,
): Promise<PlaceFeature[]> {
  const base = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`
  const results: PlaceFeature[] = []
  try {
    const r1 = await fetch(base, { next: { revalidate: 3600 } })
    if (!r1.ok) return results
    const j1 = await r1.json()
    if (j1.status !== 'OK' && j1.status !== 'ZERO_RESULTS') return results
    for (const p of j1.results ?? []) {
      const f = parsePlacesResult(p, `umbrella:${type}`)
      if (f) {
        ;(f as PlaceFeature & { rawTypes?: string[] }).rawTypes = (p as Record<string, unknown>).types as string[] ?? []
        results.push(f)
      }
    }
    if (paginate && j1.next_page_token) {
      await new Promise(r => setTimeout(r, 2200))
      const r2 = await fetch(`${base}&pagetoken=${j1.next_page_token}`, { next: { revalidate: 3600 } })
      if (r2.ok) {
        const j2 = await r2.json()
        for (const p of j2.results ?? []) {
          const f = parsePlacesResult(p, `umbrella:${type}`)
          if (f) {
            ;(f as PlaceFeature & { rawTypes?: string[] }).rawTypes = (p as Record<string, unknown>).types as string[] ?? []
            results.push(f)
          }
        }
      }
    }
  } catch { /* ignore */ }
  return results
}

// Classify and deduplicate umbrella results into confirmed places
function classifyUmbrellaResults(
  raw: PlaceFeature[],
  category: Category,
  seenIds: Set<string>,
  seenNames: Set<string>,
): { confirmed: PlaceFeature[]; multilingualCount: number } {
  const confirmed: PlaceFeature[] = []
  let multilingualCount = 0

  for (const p of raw) {
    if (!p.placeType.startsWith('umbrella:')) continue
    if (!dedup(p, seenIds, seenNames)) continue

    const rawTypes = ((p as PlaceFeature & { rawTypes?: string[] }).rawTypes ?? [])

    if (category.placesTypes.some(ct => rawTypes.includes(ct))) {
      confirmed.push(p); continue
    }
    if (matchesCategoryMultilingual(p.name, category.nameKeywords)) {
      p.placeType = `${p.placeType}:multilingual`
      confirmed.push(p)
      multilingualCount++
    }
  }

  return { confirmed, multilingualCount }
}

// Full supply fetch — typed (paginated) + all text keywords + top-2 umbrella (paginated)
// Used by the detailed single-category route
export async function fetchSupplyFromGoogle(
  lat: number, lng: number,
  category: Category,
  radius: number,
): Promise<{ places: PlaceFeature[]; multilingualCount: number }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return { places: [], multilingualCount: 0 }

  const nearbyPromises   = category.placesTypes.slice(0, 2).map(t =>
    fetchByNearbySearch(lat, lng, t, radius, apiKey, true)
  )
  const textPromises     = category.textSearchKeywords.map(kw =>
    fetchByTextSearch(kw, lat, lng, radius, apiKey)
  )
  const umbrellaPromises = category.umbrellaTypes.slice(0, 2).map(t =>
    fetchByUmbrellaType(lat, lng, t, radius, apiKey, true)
  )

  const allResults = await Promise.all([...nearbyPromises, ...textPromises, ...umbrellaPromises])
  const raw = allResults.flat()

  const seenIds   = new Set<string>()
  const seenNames = new Set<string>()
  const confirmed: PlaceFeature[] = []

  // Pass 1: typed + text-search results (category-targeted)
  for (const p of raw) {
    if (p.placeType.startsWith('umbrella:')) continue
    if (!dedup(p, seenIds, seenNames)) continue
    // For broad place types, require name keyword match to avoid false positives
    // (e.g. type=health returns car workshops, type=store returns unrelated shops)
    const isBroadType = p.placeType !== 'text_search' && !TRUSTED_PLACE_TYPES.has(p.placeType)
    if (isBroadType && !matchesCategoryMultilingual(p.name, category.nameKeywords)) continue
    if (p.placeType === 'text_search' && !matchesCategoryMultilingual(p.name, category.nameKeywords)) continue
    confirmed.push(p)
  }

  // Pass 2: umbrella — classify by types[] + multilingual keywords
  const { confirmed: umbrellaConfirmed, multilingualCount } = classifyUmbrellaResults(raw, category, seenIds, seenNames)
  confirmed.push(...umbrellaConfirmed)

  return { places: confirmed, multilingualCount }
}

// Quick supply fetch — 1-page typed + top-3 text keywords + top-1 umbrella (no pagination)
// Designed for parallel 15-category scan; fast but less exhaustive than fetchSupplyFromGoogle
export async function fetchSupplyQuick(
  lat: number, lng: number,
  category: Category,
  radius: number,
  apiKey: string,
): Promise<{ count: number; multilingualCount: number }> {
  const nearbyPromises = category.placesTypes.slice(0, 1).map(t =>
    fetchByNearbySearch(lat, lng, t, radius, apiKey, false)
  )
  const textPromises = category.textSearchKeywords.slice(0, 3).map(kw =>
    fetchByTextSearch(kw, lat, lng, radius, apiKey)
  )
  const umbrellaPromises = category.umbrellaTypes.slice(0, 1).map(t =>
    fetchByUmbrellaType(lat, lng, t, radius, apiKey, false)
  )

  const allResults = await Promise.all([...nearbyPromises, ...textPromises, ...umbrellaPromises])
  const raw = allResults.flat()

  const seenIds   = new Set<string>()
  const seenNames = new Set<string>()
  const confirmed: PlaceFeature[] = []

  for (const p of raw) {
    if (p.placeType.startsWith('umbrella:')) continue
    if (!dedup(p, seenIds, seenNames)) continue
    const isBroadType = p.placeType !== 'text_search' && !TRUSTED_PLACE_TYPES.has(p.placeType)
    if (isBroadType && !matchesCategoryMultilingual(p.name, category.nameKeywords)) continue
    if (p.placeType === 'text_search' && !matchesCategoryMultilingual(p.name, category.nameKeywords)) continue
    confirmed.push(p)
  }

  const { confirmed: umbrellaConfirmed, multilingualCount } = classifyUmbrellaResults(raw, category, seenIds, seenNames)
  confirmed.push(...umbrellaConfirmed)

  return { count: confirmed.length, multilingualCount }
}
