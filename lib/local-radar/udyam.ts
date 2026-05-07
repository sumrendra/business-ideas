// Udyam Registration data via data.gov.in API
// Requires DATA_GOV_IN_API_KEY env var (free registration at data.gov.in)
//
// Dataset: MSME Enterprises Registered under Udyam Registration Portal
// Resource IDs (try in order — data.gov.in occasionally changes IDs):
//   Primary:   d0d3c65a-5e12-4dcf-b879-1be5da7e8bc3
//   Fallback1: 5bf4fbe5-b44d-4dc2-a97b-f85e42f4a37b
//
// Fields expected: state_name, district_name, nic_2digit, year_of_registration, count

import type { YearCount } from './types'

const RESOURCE_IDS = [
  'd0d3c65a-5e12-4dcf-b879-1be5da7e8bc3',
  '5bf4fbe5-b44d-4dc2-a97b-f85e42f4a37b',
  'ec5be43c-41e4-4b4b-afc6-db96c33490a7',
]

interface UdyamRecord {
  state_name?: string
  district_name?: string
  district?: string
  nic_2digit?: string
  nic_code?: string
  year_of_registration?: string
  year?: string
  count?: string
  total?: string
  [key: string]: string | undefined
}

interface ApiResponse {
  records?: UdyamRecord[]
  total?: number
  message?: string
  status?: string
}

async function queryUdyam(
  resourceId: string,
  state: string,
  district: string,
  nicCode: string,
  apiKey: string
): Promise<UdyamRecord[] | null> {
  const params = new URLSearchParams({
    'api-key': apiKey,
    'format': 'json',
    'limit': '100',
    'filters[state_name]': state.toUpperCase(),
  })
  if (district) params.set('filters[district_name]', district.toUpperCase())
  if (nicCode)  params.set('filters[nic_2digit]', nicCode.slice(0, 2))

  try {
    const res = await fetch(
      `https://api.data.gov.in/resource/${resourceId}?${params}`,
      { next: { revalidate: 86400 }, headers: { 'User-Agent': 'BusinessIdeasBot/1.0' } }
    )
    if (!res.ok) return null
    const data: ApiResponse = await res.json()
    if (!data.records?.length) return null
    return data.records
  } catch { return null }
}

function parseRecords(records: UdyamRecord[], district: string): {
  byYear: Record<number, number>
  totalCount: number
} {
  const byYear: Record<number, number> = {}

  for (const r of records) {
    const yearStr = r.year_of_registration ?? r.year ?? ''
    const year = parseInt(yearStr)
    const count = parseInt(r.count ?? r.total ?? '1') || 1

    if (year >= 2019 && year <= new Date().getFullYear()) {
      byYear[year] = (byYear[year] ?? 0) + count
    }
  }

  return {
    byYear,
    totalCount: Object.values(byYear).reduce((a, b) => a + b, 0),
  }
}

export interface UdyamResult {
  district: string
  nicCode: string
  byYear: Record<number, number>
  totalCount: number
  trajectory: YearCount[]
  source: 'api' | 'unavailable'
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

  // Try each resource ID
  for (const rid of RESOURCE_IDS) {
    const records = await queryUdyam(rid, state, district, nicCode, apiKey)
    if (records) {
      const { byYear, totalCount } = parseRecords(records, district)
      const trajectory: YearCount[] = Object.entries(byYear)
        .map(([y, c]) => ({ year: parseInt(y), count: c, source: 'udyam' as const }))
        .sort((a, b) => a.year - b.year)

      return { district, nicCode, byYear, totalCount, trajectory, source: 'api' }
    }
  }

  return {
    district, nicCode,
    byYear: {}, totalCount: 0,
    trajectory: [],
    source: 'unavailable',
    note: 'Udyam API returned no data for this district/NIC combination. Try state-level search.',
  }
}
