// Udyam Registration data via data.gov.in API
// Dataset: "List of MSME Registered Units under UDYAM"
// Resource ID: 8b68ae56-84cf-4728-a0a6-1be11028dea7
// 39.4M+ records, updated daily. Required filters: State + District.
// Activities field contains NIC5DigitId as JSON array.

import type { YearCount } from './types'

const RESOURCE_ID = '8b68ae56-84cf-4728-a0a6-1be11028dea7'

interface UdyamRecord {
  State?: string
  District?: string
  RegistrationDate?: string   // DD/MM/YYYY
  EnterpriseName?: string
  Activities?: string          // JSON: [{NIC5DigitId, Description}]
  [key: string]: string | number | undefined
}

interface ApiResponse {
  records?: UdyamRecord[]
  total?: number
  status?: string
  message?: string
}

function parseYear(dateStr: string): number | null {
  // Format: DD/MM/YYYY
  const parts = dateStr.split('/')
  if (parts.length !== 3) return null
  const year = parseInt(parts[2])
  return year >= 2019 && year <= new Date().getFullYear() ? year : null
}

function matchesNic(activitiesJson: string | undefined, nicCode: string): boolean {
  if (!activitiesJson) return true  // no filter if Activities missing
  try {
    const activities: { NIC5DigitId: string }[] = JSON.parse(activitiesJson)
    const prefix = nicCode.slice(0, 2)
    return activities.some(a => a.NIC5DigitId?.startsWith(prefix))
  } catch { return false }
}

export interface UdyamResult {
  district: string
  nicCode: string
  byYear: Record<number, number>
  totalCount: number
  trajectory: YearCount[]
  source: 'api' | 'estimated' | 'unavailable'
  note?: string
}

export async function fetchUdyamData(
  state: string,
  district: string,
  nicCode: string
): Promise<UdyamResult> {
  const apiKey = process.env.DATA_GOV_IN_API_KEY

  if (!apiKey) {
    return {
      district, nicCode,
      byYear: {}, totalCount: 0,
      trajectory: [],
      source: 'unavailable',
      note: 'Set DATA_GOV_IN_API_KEY env var (free at data.gov.in) to enable Udyam district-level data',
    }
  }

  const nicPrefix = nicCode.slice(0, 2)

  // Fetch up to 500 records filtered by State + District (required by API).
  // We then client-side filter by NIC prefix from the Activities JSON field.
  // The API doesn't support filtering on nested JSON fields directly.
  const params = new URLSearchParams({
    'api-key': apiKey,
    'format': 'json',
    'limit': '500',
    'filters[State]': state.toUpperCase(),
    'filters[District]': district.toUpperCase(),
  })

  try {
    const res = await fetch(
      `https://api.data.gov.in/resource/${RESOURCE_ID}?${params}`,
      { next: { revalidate: 86400 }, headers: { 'User-Agent': 'BusinessIdeasBot/1.0' } }
    )
    if (!res.ok) {
      return { district, nicCode, byYear: {}, totalCount: 0, trajectory: [], source: 'unavailable', note: `API error: ${res.status}` }
    }

    const data: ApiResponse = await res.json()
    const records = data.records ?? []

    // Filter by NIC prefix and group by registration year
    const byYear: Record<number, number> = {}
    let matchedCount = 0

    for (const r of records) {
      if (!matchesNic(r.Activities, nicPrefix)) continue
      const year = r.RegistrationDate ? parseYear(r.RegistrationDate) : null
      if (!year) continue
      byYear[year] = (byYear[year] ?? 0) + 1
      matchedCount++
    }

    // If no NIC matches in 500 records, return total district count (no NIC filter)
    // as a fallback with a note
    if (matchedCount === 0 && records.length > 0) {
      for (const r of records) {
        const year = r.RegistrationDate ? parseYear(r.RegistrationDate) : null
        if (!year) continue
        byYear[year] = (byYear[year] ?? 0) + 1
      }
      const totalCount = Object.values(byYear).reduce((a, b) => a + b, 0)
      const trajectory: YearCount[] = Object.entries(byYear)
        .map(([y, c]) => ({ year: parseInt(y), count: c, source: 'udyam' as const }))
        .sort((a, b) => a.year - b.year)

      return {
        district, nicCode, byYear, totalCount, trajectory, source: 'api',
        note: `NIC ${nicPrefix} not found in sample — showing all district MSMEs (${data.total?.toLocaleString()} total in ${district})`,
      }
    }

    const totalCount = Object.values(byYear).reduce((a, b) => a + b, 0)
    const trajectory: YearCount[] = Object.entries(byYear)
      .map(([y, c]) => ({ year: parseInt(y), count: c, source: 'udyam' as const }))
      .sort((a, b) => a.year - b.year)

    return {
      district, nicCode, byYear, totalCount, trajectory, source: 'api',
      note: `${matchedCount} NIC-${nicPrefix} MSMEs in ${district} (from ${data.total?.toLocaleString()} total district registrations)`,
    }
  } catch (e) {
    return {
      district, nicCode,
      byYear: {}, totalCount: 0,
      trajectory: [],
      source: 'unavailable',
      note: `Request failed: ${e instanceof Error ? e.message : 'unknown error'}`,
    }
  }
}
