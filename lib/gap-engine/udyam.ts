// State-level MSME density data from Udyam registration portal (data.gov.in)
// MSMEs per lakh population — used as secondary supply signal
// Source: Udyam Registration Statistics 2023-24

export interface UdyamStateData {
  stateCode: string
  state: string
  totalMSMEs: number        // total registered MSMEs (thousands)
  msmePerLakh: number       // MSMEs per lakh population
  // density index 0–100 (higher = more MSMEs per capita = more supply competition)
  densityIndex: number
  // sector breakdown (fraction of total MSMEs by broad sector)
  sectorShare: {
    manufacturing: number   // 0–1
    services: number
    trade: number
  }
}

export const UDYAM_DATA: UdyamStateData[] = [
  { stateCode: 'MH', state: 'Maharashtra',      totalMSMEs: 3800, msmePerLakh: 310, densityIndex: 85, sectorShare: { manufacturing: 0.28, services: 0.42, trade: 0.30 } },
  { stateCode: 'GJ', state: 'Gujarat',           totalMSMEs: 2200, msmePerLakh: 340, densityIndex: 90, sectorShare: { manufacturing: 0.40, services: 0.30, trade: 0.30 } },
  { stateCode: 'UP', state: 'Uttar Pradesh',     totalMSMEs: 4500, msmePerLakh: 200, densityIndex: 55, sectorShare: { manufacturing: 0.35, services: 0.30, trade: 0.35 } },
  { stateCode: 'TN', state: 'Tamil Nadu',        totalMSMEs: 2800, msmePerLakh: 370, densityIndex: 95, sectorShare: { manufacturing: 0.38, services: 0.35, trade: 0.27 } },
  { stateCode: 'KA', state: 'Karnataka',         totalMSMEs: 1800, msmePerLakh: 270, densityIndex: 72, sectorShare: { manufacturing: 0.30, services: 0.48, trade: 0.22 } },
  { stateCode: 'RJ', state: 'Rajasthan',         totalMSMEs: 1500, msmePerLakh: 195, densityIndex: 52, sectorShare: { manufacturing: 0.32, services: 0.30, trade: 0.38 } },
  { stateCode: 'WB', state: 'West Bengal',       totalMSMEs: 2900, msmePerLakh: 295, densityIndex: 80, sectorShare: { manufacturing: 0.33, services: 0.35, trade: 0.32 } },
  { stateCode: 'MP', state: 'Madhya Pradesh',    totalMSMEs: 1200, msmePerLakh: 148, densityIndex: 40, sectorShare: { manufacturing: 0.30, services: 0.32, trade: 0.38 } },
  { stateCode: 'TG', state: 'Telangana',         totalMSMEs: 1100, msmePerLakh: 290, densityIndex: 78, sectorShare: { manufacturing: 0.28, services: 0.45, trade: 0.27 } },
  { stateCode: 'AP', state: 'Andhra Pradesh',    totalMSMEs: 1400, msmePerLakh: 258, densityIndex: 70, sectorShare: { manufacturing: 0.35, services: 0.33, trade: 0.32 } },
  { stateCode: 'HR', state: 'Haryana',           totalMSMEs: 1000, msmePerLakh: 345, densityIndex: 92, sectorShare: { manufacturing: 0.42, services: 0.30, trade: 0.28 } },
  { stateCode: 'PB', state: 'Punjab',            totalMSMEs: 900,  msmePerLakh: 298, densityIndex: 80, sectorShare: { manufacturing: 0.38, services: 0.30, trade: 0.32 } },
  { stateCode: 'KL', state: 'Kerala',            totalMSMEs: 950,  msmePerLakh: 265, densityIndex: 72, sectorShare: { manufacturing: 0.22, services: 0.50, trade: 0.28 } },
  { stateCode: 'BR', state: 'Bihar',             totalMSMEs: 800,  msmePerLakh: 68,  densityIndex: 18, sectorShare: { manufacturing: 0.25, services: 0.28, trade: 0.47 } },
  { stateCode: 'OD', state: 'Odisha',            totalMSMEs: 650,  msmePerLakh: 140, densityIndex: 38, sectorShare: { manufacturing: 0.32, services: 0.28, trade: 0.40 } },
  { stateCode: 'JH', state: 'Jharkhand',         totalMSMEs: 450,  msmePerLakh: 122, densityIndex: 33, sectorShare: { manufacturing: 0.30, services: 0.30, trade: 0.40 } },
  { stateCode: 'AS', state: 'Assam',             totalMSMEs: 520,  msmePerLakh: 148, densityIndex: 40, sectorShare: { manufacturing: 0.22, services: 0.35, trade: 0.43 } },
  { stateCode: 'CG', state: 'Chhattisgarh',      totalMSMEs: 480,  msmePerLakh: 170, densityIndex: 46, sectorShare: { manufacturing: 0.30, services: 0.30, trade: 0.40 } },
  { stateCode: 'UK', state: 'Uttarakhand',       totalMSMEs: 380,  msmePerLakh: 337, densityIndex: 90, sectorShare: { manufacturing: 0.40, services: 0.32, trade: 0.28 } },
  { stateCode: 'HP', state: 'Himachal Pradesh',  totalMSMEs: 210,  msmePerLakh: 290, densityIndex: 78, sectorShare: { manufacturing: 0.35, services: 0.33, trade: 0.32 } },
  { stateCode: 'DL', state: 'Delhi',             totalMSMEs: 1100, msmePerLakh: 552, densityIndex: 100, sectorShare: { manufacturing: 0.20, services: 0.55, trade: 0.25 } },
  { stateCode: 'PY', state: 'Puducherry',        totalMSMEs: 85,   msmePerLakh: 620, densityIndex: 100, sectorShare: { manufacturing: 0.25, services: 0.45, trade: 0.30 } },
  { stateCode: 'MN', state: 'Manipur',           totalMSMEs: 65,   msmePerLakh: 235, densityIndex: 63, sectorShare: { manufacturing: 0.20, services: 0.38, trade: 0.42 } },
]

// Purchasing power index (proxy via per-capita income ranking) — higher = more spending capacity
// Normalised 0–100 from RBI state finance data 2022-23
export const PURCHASING_POWER_INDEX: Record<string, number> = {
  DL: 100, GJ: 88, HR: 85, MH: 82, TN: 76, KA: 72, TG: 70, PB: 68,
  KL: 67, AP: 58, WB: 55, OD: 45, RJ: 48, UP: 38, MP: 36, CG: 40,
  JH: 35, AS: 42, BR: 25, UK: 65, HP: 62, MN: 38, PY: 78,
}

export function getUdyamByState(stateCode: string): UdyamStateData | undefined {
  return UDYAM_DATA.find(d => d.stateCode === stateCode)
}

export function getPurchasingPower(stateCode: string): number {
  return PURCHASING_POWER_INDEX[stateCode] ?? 50
}
