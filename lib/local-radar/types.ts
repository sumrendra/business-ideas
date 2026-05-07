export type DataSource = 'google_places' | 'mca21' | 'udyam' | 'gstin'

export interface YearCount {
  year: number
  count: number
  source: DataSource
}

export interface LocalBusiness {
  name: string
  address: string
  rating?: number
  totalRatings?: number
  status: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'PERMANENTLY_CLOSED' | 'UNKNOWN'
  estimatedEntryYear?: number  // from oldest review date
  placeId: string
  lat?: number
  lng?: number
  source: DataSource
}

export interface RadarResult {
  businessType: string
  nicCode: string
  city: string
  state: string
  lat: number
  lng: number
  radiusKm: number

  // Aggregated trajectory
  trajectory: YearCount[]          // combined, deduplicated by year
  trajectoryBySource: Record<DataSource, YearCount[]>

  // Current snapshot
  currentCount: number             // live Google Places count
  closedCount: number              // permanently closed count from Places
  survivalRate: number             // % that are still open
  businesses: LocalBusiness[]      // individual businesses from Places

  // Signals
  entryVelocity: number            // CAGR of entries over last 3 years
  trend: 'Rising' | 'Stable' | 'Declining' | 'Emerging' | 'Saturating'
  trendReason: string

  // State-level MCA21 context
  mcaStateSummary?: {
    state: string
    nicDivision: string
    incorporationsByYear: Record<number, number>  // from curated data
    activeCount: number
    struckOffCount: number
    survivalRate: number
  }

  // Udyam context
  udyamSummary?: {
    district: string
    nicCode: string
    registrationsByYear: Record<number, number>
    totalCount?: number
    source: 'api' | 'estimated' | 'unavailable'
    note?: string
  }

  // GSTIN count
  gstinEstimate?: {
    state: string
    count: number
    note: string
  }

  sourcesSummary: {
    source: DataSource
    status: 'live' | 'cached' | 'estimated' | 'unavailable'
    description: string
    count?: number
  }[]

  generatedAt: string
  durationMs: number
}
