// Google Places — temporal business entry analysis
// Strategy: get all businesses of a type in the area, then for each
// fetch Place Details to get oldest review date as entry-year proxy.

import type { LocalBusiness, YearCount } from './types'

const BASE = 'https://maps.googleapis.com/maps/api/place'

async function safeFetch(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BusinessIdeasBot/1.0' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

interface PlacesNearbyResult {
  results: {
    place_id: string
    name: string
    formatted_address?: string
    vicinity?: string
    rating?: number
    user_ratings_total?: number
    business_status?: string
    geometry: { location: { lat: number; lng: number } }
  }[]
  next_page_token?: string
  status: string
}

interface PlaceDetailsResult {
  result: {
    name: string
    formatted_address?: string
    rating?: number
    user_ratings_total?: number
    business_status?: string
    reviews?: { time: number; text?: string; author_name?: string }[]
    opening_hours?: { open_now?: boolean }
  }
  status: string
}

// Fetch up to 3 pages (60 results) of businesses matching the keywords
async function fetchAllPlaces(
  lat: number, lng: number, radiusM: number,
  keywords: string[], apiKey: string
): Promise<PlacesNearbyResult['results']> {
  const seen = new Set<string>()
  const all: PlacesNearbyResult['results'] = []

  for (const kw of keywords.slice(0, 3)) {
    let pageToken: string | undefined
    let page = 0

    do {
      const url = pageToken
        ? `${BASE}/nearbysearch/json?pagetoken=${pageToken}&key=${apiKey}`
        : `${BASE}/nearbysearch/json?location=${lat},${lng}&radius=${radiusM}&keyword=${encodeURIComponent(kw)}&key=${apiKey}`

      if (pageToken) await new Promise(r => setTimeout(r, 2000)) // Google requires delay between page requests

      const data = await safeFetch(url) as PlacesNearbyResult | null
      if (!data || data.status === 'ZERO_RESULTS') break

      for (const r of data.results ?? []) {
        if (!seen.has(r.place_id)) {
          seen.add(r.place_id)
          all.push(r)
        }
      }

      pageToken = data.next_page_token
      page++
    } while (pageToken && page < 3)
  }

  return all
}

// Get oldest review date for a place → use as entry-year proxy
async function getEntryYear(placeId: string, apiKey: string): Promise<number | undefined> {
  const url = `${BASE}/details/json?place_id=${placeId}&fields=reviews,business_status&key=${apiKey}`
  const data = await safeFetch(url) as PlaceDetailsResult | null
  if (!data?.result?.reviews?.length) return undefined
  const times = data.result.reviews.map(r => r.time).filter(Boolean)
  if (!times.length) return undefined
  const oldest = Math.min(...times)
  const year = new Date(oldest * 1000).getFullYear()
  // Businesses typically get their first review 3-12 months after opening
  // We report the review year as the known-existence year
  return year
}

export interface PlacesTemporalResult {
  businesses: LocalBusiness[]
  trajectory: YearCount[]
  currentCount: number
  closedCount: number
  survivalRate: number
}

export async function fetchPlacesTemporal(
  lat: number,
  lng: number,
  radiusKm: number,
  placeKeywords: string[],
  apiKey: string,
  maxDetailFetches = 30
): Promise<PlacesTemporalResult> {
  const radiusM = Math.min(50000, radiusKm * 1000)

  const places = await fetchAllPlaces(lat, lng, radiusM, placeKeywords, apiKey)

  // Fetch details in parallel batches (max 5 concurrent)
  const toDetail = places.slice(0, maxDetailFetches)
  const chunkSize = 5
  const yearByPlaceId = new Map<string, number | undefined>()

  for (let i = 0; i < toDetail.length; i += chunkSize) {
    const chunk = toDetail.slice(i, i + chunkSize)
    const results = await Promise.all(
      chunk.map(p => getEntryYear(p.place_id, apiKey).then(y => ({ pid: p.place_id, year: y })))
    )
    for (const { pid, year } of results) yearByPlaceId.set(pid, year)
  }

  // Build LocalBusiness list
  const businesses: LocalBusiness[] = places.map(p => ({
    name:               p.name,
    address:            p.vicinity ?? p.formatted_address ?? '',
    rating:             p.rating,
    totalRatings:       p.user_ratings_total,
    status:             (p.business_status ?? 'UNKNOWN') as LocalBusiness['status'],
    estimatedEntryYear: yearByPlaceId.get(p.place_id),
    placeId:            p.place_id,
    lat:                p.geometry.location.lat,
    lng:                p.geometry.location.lng,
    source:             'google_places',
  }))

  // Aggregate trajectory from entry years
  const yearCounts = new Map<number, number>()
  for (const b of businesses) {
    if (b.estimatedEntryYear && b.estimatedEntryYear >= 2015 && b.estimatedEntryYear <= new Date().getFullYear()) {
      yearCounts.set(b.estimatedEntryYear, (yearCounts.get(b.estimatedEntryYear) ?? 0) + 1)
    }
  }

  const trajectory: YearCount[] = [...yearCounts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, count]) => ({ year, count, source: 'google_places' }))

  const currentCount = businesses.filter(b => b.status !== 'PERMANENTLY_CLOSED').length
  const closedCount  = businesses.filter(b => b.status === 'PERMANENTLY_CLOSED').length
  const survivalRate = places.length > 0 ? Math.round((currentCount / places.length) * 100) : 100

  return { businesses, trajectory, currentCount, closedCount, survivalRate }
}
