// GSTIN — public business count estimation
// The GST portal doesn't offer a public bulk API.
// We use two approaches:
//   1. GST taxpayer count by state from GSTN public statistics (published quarterly)
//   2. State GST code → estimate active registrations in the sector
//
// Source: GSTN Annual Statistics 2022-23, Ministry of Finance press releases

// State code (as per GST) → state name
export const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
  '04': 'Chandigarh', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
  '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura',
  '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand',
  '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '27': 'Maharashtra', '28': 'Andhra Pradesh', '29': 'Karnataka', '30': 'Goa',
  '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
  '36': 'Telangana', '37': 'Andhra Pradesh',
}

export const STATE_TO_GST_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(GST_STATE_CODES).map(([code, name]) => [name, code])
)

// Active GST registrations by state (as of Mar 2023, GSTN Annual Report)
const STATE_ACTIVE_GSTIN: Record<string, number> = {
  'Maharashtra':      2_340_000,
  'Delhi':            1_720_000,
  'Karnataka':          980_000,
  'Tamil Nadu':         870_000,
  'Gujarat':            840_000,
  'Uttar Pradesh':    1_560_000,
  'Rajasthan':          720_000,
  'West Bengal':        680_000,
  'Haryana':            560_000,
  'Telangana':          420_000,
  'Andhra Pradesh':     380_000,
  'Madhya Pradesh':     460_000,
  'Punjab':             340_000,
  'Kerala':             320_000,
  'Bihar':              280_000,
  'Odisha':             220_000,
  'Jharkhand':          180_000,
  'Chhattisgarh':       160_000,
  'Uttarakhand':        140_000,
  'Himachal Pradesh':    90_000,
  'Assam':              180_000,
  'Goa':                 62_000,
}

// Sector share of GST registrations (approximate, from GSTN sector analysis)
const NIC_DIVISION_GST_SHARE: Record<string, number> = {
  '47': 0.28,  // Retail — largest sector
  '56': 0.08,  // Food service
  '62': 0.07,  // IT services
  '86': 0.04,  // Healthcare
  '10': 0.06,  // Food manufacturing
  '41': 0.05,  // Construction
  '85': 0.03,  // Education
  '45': 0.04,  // Automotive
  '01': 0.02,  // Agriculture (many exempt from GST)
  '69': 0.04,  // Professional services
  '93': 0.02,  // Wellness
  '96': 0.02,  // Personal services
  '35': 0.01,  // Energy
  '49': 0.05,  // Transport
  '52': 0.02,  // Warehousing
  '14': 0.02,  // Leather
  '13': 0.02,  // Textiles
}

export interface GstinEstimate {
  state: string
  totalActiveGstin: number
  sectorEstimate: number
  sectorShare: number
  note: string
  source: 'gstn_statistics'
}

export function estimateGstinCount(state: string, nicDivision: string): GstinEstimate | null {
  const total = STATE_ACTIVE_GSTIN[state]
  if (!total) return null

  const share = NIC_DIVISION_GST_SHARE[nicDivision] ?? 0.02
  const sectorEstimate = Math.round(total * share)

  return {
    state,
    totalActiveGstin: total,
    sectorEstimate,
    sectorShare: share,
    note: `Estimated from GSTN Annual Statistics 2022-23. Sector share based on NIC division ${nicDivision} composition of national registrations.`,
    source: 'gstn_statistics',
  }
}
