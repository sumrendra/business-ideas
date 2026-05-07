export type SignalDirection = 'up' | 'down' | 'flat'
export type Lifecycle = 'Emerging' | 'Accelerating' | 'Maturing' | 'Contested' | 'Declining' | 'Transforming'
export type SectorCategory = 'Manufacturing' | 'Services' | 'Trade' | 'Infrastructure' | 'Primary' | 'Hospitality' | 'Logistics'

export interface Signal {
  score: number           // 0–100
  direction: SignalDirection
  changePercent: number   // YoY or period-over-period %
  label: string           // short human label e.g. "+18% YoY"
  note: string            // one-line explanation
  source: string          // data source name
  isEstimated: boolean    // false = real data, true = modelled/hardcoded
}

export interface FormationTick {
  year: number
  count: number           // new registrations (MCA21 + Udyam combined)
}

export interface SectorPulse {
  nicCode: string
  label: string
  icon: string
  category: SectorCategory
  description: string

  // 8 signals
  formationVelocity:   Signal   // MCA21 + Udyam: new co. growth rate
  survivalGradient:    Signal   // MCA21: active/total ratio trend
  formalizationRate:   Signal   // Udyam/GSTIN: informal economy gap
  creditMomentum:      Signal   // RBI: sectoral bank credit growth
  tradeExposure:       Signal   // DGFT: export strength (high = good)
  employmentAbsorption:Signal   // EPFO: net payroll additions
  searchDemand:        Signal   // Google Trends: 5yr CAGR
  policyScore:         Signal   // PLI / Budget: govt tailwind

  // Composite
  opportunityScore: number      // 0–100
  riskScore: number             // 0–100
  lifecycle: Lifecycle

  // Sparkline (last 6 years formation)
  formationTrend: FormationTick[]

  // Meta
  activeCompanies:  number
  struckOffCompanies: number
  totalMsmeRegistrations: number
}

export interface SectorPulseResponse {
  sectors: SectorPulse[]
  summary: {
    totalSectors: number
    accelerating: number
    declining: number
    topOpportunity: string
    topRisk: string
    dataAsOf: string
  }
}
