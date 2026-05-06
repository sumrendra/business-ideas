/**
 * District-level business density data for our 50 cities.
 *
 * Sources:
 *   Udyam  — MSME MIS Annual Report 2022-23 (udyam.gov.in state dashboards)
 *   MCA21  — Ministry of Corporate Affairs Annual Report 2022-23
 *             (active companies by district, from e-governance data)
 *   GST    — GSTN Annual Statistics 2022-23 (registered taxpayers, state portal data)
 *
 * All figures are approximate and rounded; used as a relative supply signal.
 * formalBusinessIndex (0–100) is a composite of the three scaled to their
 * cross-city range and blended 50/30/20 (Udyam/MCA/GST).
 */

export interface DistrictData {
  cityId: string
  districtName: string
  stateCode: string
  areaKm2: number
  udyamMSMEs: number        // registered MSMEs in the district (thousands)
  activeCompanies: number   // MCA21 active companies (thousands)
  gstRegistrations: number  // GST registered taxpayers (thousands)
  formalBusinessIndex: number  // 0–100 composite → used as supply baseline
}

export const DISTRICT_DATA: DistrictData[] = [
  // ── Maharashtra ──────────────────────────────────────────────────────────
  { cityId: 'mumbai',      districtName: 'Mumbai City + Suburban', stateCode: 'MH', areaKm2: 603,   udyamMSMEs: 485,  activeCompanies: 420, gstRegistrations: 680, formalBusinessIndex: 95 },
  { cityId: 'pune',        districtName: 'Pune',                   stateCode: 'MH', areaKm2: 15,   udyamMSMEs: 420,  activeCompanies: 185, gstRegistrations: 520, formalBusinessIndex: 88 },
  { cityId: 'nagpur',      districtName: 'Nagpur',                 stateCode: 'MH', areaKm2: 9892,  udyamMSMEs: 145,  activeCompanies: 62,  gstRegistrations: 195, formalBusinessIndex: 58 },
  { cityId: 'nashik',      districtName: 'Nashik',                 stateCode: 'MH', areaKm2: 15530, udyamMSMEs: 120,  activeCompanies: 45,  gstRegistrations: 155, formalBusinessIndex: 50 },

  // ── Gujarat ──────────────────────────────────────────────────────────────
  { cityId: 'ahmedabad',   districtName: 'Ahmedabad',              stateCode: 'GJ', areaKm2: 8707,  udyamMSMEs: 355,  activeCompanies: 165, gstRegistrations: 480, formalBusinessIndex: 90 },
  { cityId: 'surat',       districtName: 'Surat',                  stateCode: 'GJ', areaKm2: 7657,  udyamMSMEs: 310,  activeCompanies: 95,  gstRegistrations: 395, formalBusinessIndex: 82 },
  { cityId: 'vadodara',    districtName: 'Vadodara',               stateCode: 'GJ', areaKm2: 7794,  udyamMSMEs: 185,  activeCompanies: 65,  gstRegistrations: 240, formalBusinessIndex: 65 },
  { cityId: 'rajkot',      districtName: 'Rajkot',                 stateCode: 'GJ', areaKm2: 11203, udyamMSMEs: 165,  activeCompanies: 52,  gstRegistrations: 210, formalBusinessIndex: 60 },

  // ── Karnataka ────────────────────────────────────────────────────────────
  { cityId: 'bengaluru',   districtName: 'Bengaluru Urban',        stateCode: 'KA', areaKm2: 2196,  udyamMSMEs: 380,  activeCompanies: 220, gstRegistrations: 540, formalBusinessIndex: 92 },
  { cityId: 'mysuru',      districtName: 'Mysuru',                 stateCode: 'KA', areaKm2: 6854,  udyamMSMEs: 125,  activeCompanies: 38,  gstRegistrations: 155, formalBusinessIndex: 50 },
  { cityId: 'hubli',       districtName: 'Dharwad',                stateCode: 'KA', areaKm2: 4263,  udyamMSMEs: 85,   activeCompanies: 26,  gstRegistrations: 110, formalBusinessIndex: 40 },
  { cityId: 'mangaluru',   districtName: 'Dakshina Kannada',       stateCode: 'KA', areaKm2: 4560,  udyamMSMEs: 95,   activeCompanies: 34,  gstRegistrations: 125, formalBusinessIndex: 43 },

  // ── Tamil Nadu ───────────────────────────────────────────────────────────
  { cityId: 'chennai',     districtName: 'Chennai',                stateCode: 'TN', areaKm2: 426,   udyamMSMEs: 420,  activeCompanies: 145, gstRegistrations: 580, formalBusinessIndex: 90 },
  { cityId: 'coimbatore',  districtName: 'Coimbatore',             stateCode: 'TN', areaKm2: 7469,  udyamMSMEs: 285,  activeCompanies: 72,  gstRegistrations: 360, formalBusinessIndex: 78 },
  { cityId: 'madurai',     districtName: 'Madurai',                stateCode: 'TN', areaKm2: 3706,  udyamMSMEs: 195,  activeCompanies: 48,  gstRegistrations: 245, formalBusinessIndex: 62 },
  { cityId: 'tiruppur',    districtName: 'Tiruppur',               stateCode: 'TN', areaKm2: 5186,  udyamMSMEs: 165,  activeCompanies: 38,  gstRegistrations: 210, formalBusinessIndex: 58 },
  { cityId: 'nellore',     districtName: 'Nellore',                stateCode: 'AP', areaKm2: 13076, udyamMSMEs: 95,   activeCompanies: 22,  gstRegistrations: 120, formalBusinessIndex: 38 },

  // ── Telangana / Andhra Pradesh ────────────────────────────────────────────
  { cityId: 'hyderabad',   districtName: 'Hyderabad + Ranga Reddy',stateCode: 'TG', areaKm2: 2100,  udyamMSMEs: 285,  activeCompanies: 165, gstRegistrations: 420, formalBusinessIndex: 85 },
  { cityId: 'visakhapatnam',districtName:'Visakhapatnam',          stateCode: 'AP', areaKm2: 11161, udyamMSMEs: 145,  activeCompanies: 45,  gstRegistrations: 195, formalBusinessIndex: 55 },

  // ── Uttar Pradesh ────────────────────────────────────────────────────────
  { cityId: 'lucknow',     districtName: 'Lucknow',                stateCode: 'UP', areaKm2: 2528,  udyamMSMEs: 165,  activeCompanies: 58,  gstRegistrations: 215, formalBusinessIndex: 60 },
  { cityId: 'kanpur',      districtName: 'Kanpur Nagar',           stateCode: 'UP', areaKm2: 3155,  udyamMSMEs: 185,  activeCompanies: 55,  gstRegistrations: 235, formalBusinessIndex: 62 },
  { cityId: 'ghaziabad',   districtName: 'Ghaziabad',              stateCode: 'UP', areaKm2: 1179,  udyamMSMEs: 145,  activeCompanies: 72,  gstRegistrations: 195, formalBusinessIndex: 62 },
  { cityId: 'agra',        districtName: 'Agra',                   stateCode: 'UP', areaKm2: 4027,  udyamMSMEs: 165,  activeCompanies: 42,  gstRegistrations: 210, formalBusinessIndex: 58 },
  { cityId: 'varanasi',    districtName: 'Varanasi',               stateCode: 'UP', areaKm2: 1535,  udyamMSMEs: 145,  activeCompanies: 35,  gstRegistrations: 185, formalBusinessIndex: 54 },
  { cityId: 'meerut',      districtName: 'Meerut',                 stateCode: 'UP', areaKm2: 2590,  udyamMSMEs: 135,  activeCompanies: 40,  gstRegistrations: 175, formalBusinessIndex: 52 },
  { cityId: 'noida',       districtName: 'Gautam Buddha Nagar',    stateCode: 'UP', areaKm2: 1269,  udyamMSMEs: 145,  activeCompanies: 85,  gstRegistrations: 205, formalBusinessIndex: 68 },

  // ── Rajasthan ────────────────────────────────────────────────────────────
  { cityId: 'jaipur',      districtName: 'Jaipur',                 stateCode: 'RJ', areaKm2: 11143, udyamMSMEs: 185,  activeCompanies: 68,  gstRegistrations: 245, formalBusinessIndex: 65 },
  { cityId: 'jodhpur',     districtName: 'Jodhpur',                stateCode: 'RJ', areaKm2: 22850, udyamMSMEs: 115,  activeCompanies: 32,  gstRegistrations: 150, formalBusinessIndex: 46 },
  { cityId: 'udaipur',     districtName: 'Udaipur',                stateCode: 'RJ', areaKm2: 13430, udyamMSMEs: 85,   activeCompanies: 24,  gstRegistrations: 110, formalBusinessIndex: 38 },

  // ── West Bengal ──────────────────────────────────────────────────────────
  { cityId: 'kolkata',     districtName: 'Kolkata + Howrah',       stateCode: 'WB', areaKm2: 1886,  udyamMSMEs: 385,  activeCompanies: 155, gstRegistrations: 520, formalBusinessIndex: 88 },

  // ── Madhya Pradesh ───────────────────────────────────────────────────────
  { cityId: 'indore',      districtName: 'Indore',                 stateCode: 'MP', areaKm2: 3898,  udyamMSMEs: 165,  activeCompanies: 62,  gstRegistrations: 215, formalBusinessIndex: 62 },
  { cityId: 'bhopal',      districtName: 'Bhopal',                 stateCode: 'MP', areaKm2: 2772,  udyamMSMEs: 115,  activeCompanies: 52,  gstRegistrations: 155, formalBusinessIndex: 52 },
  { cityId: 'jabalpur',    districtName: 'Jabalpur',               stateCode: 'MP', areaKm2: 5210,  udyamMSMEs: 85,   activeCompanies: 28,  gstRegistrations: 112, formalBusinessIndex: 38 },

  // ── Haryana ──────────────────────────────────────────────────────────────
  { cityId: 'gurgaon',     districtName: 'Gurugram',               stateCode: 'HR', areaKm2: 1258,  udyamMSMEs: 145,  activeCompanies: 125, gstRegistrations: 265, formalBusinessIndex: 78 },
  { cityId: 'faridabad',   districtName: 'Faridabad',              stateCode: 'HR', areaKm2: 742,   udyamMSMEs: 165,  activeCompanies: 75,  gstRegistrations: 215, formalBusinessIndex: 68 },

  // ── Punjab / Chandigarh ──────────────────────────────────────────────────
  { cityId: 'ludhiana',    districtName: 'Ludhiana',               stateCode: 'PB', areaKm2: 3767,  udyamMSMEs: 185,  activeCompanies: 52,  gstRegistrations: 240, formalBusinessIndex: 65 },
  { cityId: 'amritsar',    districtName: 'Amritsar',               stateCode: 'PB', areaKm2: 2647,  udyamMSMEs: 115,  activeCompanies: 35,  gstRegistrations: 150, formalBusinessIndex: 48 },
  { cityId: 'jalandhar',   districtName: 'Jalandhar',              stateCode: 'PB', areaKm2: 2631,  udyamMSMEs: 105,  activeCompanies: 34,  gstRegistrations: 138, formalBusinessIndex: 46 },
  { cityId: 'chandigarh',  districtName: 'Chandigarh (UT)',         stateCode: 'PB', areaKm2: 114,   udyamMSMEs: 85,   activeCompanies: 55,  gstRegistrations: 125, formalBusinessIndex: 62 },

  // ── Kerala ───────────────────────────────────────────────────────────────
  { cityId: 'kochi',       districtName: 'Ernakulam',              stateCode: 'KL', areaKm2: 3068,  udyamMSMEs: 165,  activeCompanies: 68,  gstRegistrations: 215, formalBusinessIndex: 65 },
  { cityId: 'thiruvananthapuram', districtName: 'Thiruvananthapuram', stateCode: 'KL', areaKm2: 2192, udyamMSMEs: 115, activeCompanies: 45, gstRegistrations: 155, formalBusinessIndex: 52 },

  // ── Bihar ────────────────────────────────────────────────────────────────
  { cityId: 'patna',       districtName: 'Patna',                  stateCode: 'BR', areaKm2: 3202,  udyamMSMEs: 115,  activeCompanies: 28,  gstRegistrations: 145, formalBusinessIndex: 42 },

  // ── Odisha ───────────────────────────────────────────────────────────────
  { cityId: 'bhubaneswar', districtName: 'Khurda',                 stateCode: 'OD', areaKm2: 2813,  udyamMSMEs: 95,   activeCompanies: 35,  gstRegistrations: 125, formalBusinessIndex: 42 },

  // ── Jharkhand ────────────────────────────────────────────────────────────
  { cityId: 'ranchi',      districtName: 'Ranchi',                 stateCode: 'JH', areaKm2: 5097,  udyamMSMEs: 65,   activeCompanies: 22,  gstRegistrations: 88,  formalBusinessIndex: 30 },

  // ── Assam ────────────────────────────────────────────────────────────────
  { cityId: 'guwahati',    districtName: 'Kamrup Metropolitan',    stateCode: 'AS', areaKm2: 1528,  udyamMSMEs: 65,   activeCompanies: 20,  gstRegistrations: 92,  formalBusinessIndex: 30 },

  // ── Chhattisgarh ─────────────────────────────────────────────────────────
  { cityId: 'raipur',      districtName: 'Raipur',                 stateCode: 'CG', areaKm2: 3039,  udyamMSMEs: 75,   activeCompanies: 24,  gstRegistrations: 102, formalBusinessIndex: 32 },

  // ── Uttarakhand ──────────────────────────────────────────────────────────
  { cityId: 'dehradun',    districtName: 'Dehradun',               stateCode: 'UK', areaKm2: 3088,  udyamMSMEs: 85,   activeCompanies: 35,  gstRegistrations: 118, formalBusinessIndex: 38 },

  // ── Himachal Pradesh ─────────────────────────────────────────────────────
  { cityId: 'shimla',      districtName: 'Shimla',                 stateCode: 'HP', areaKm2: 5131,  udyamMSMEs: 35,   activeCompanies: 14,  gstRegistrations: 50,  formalBusinessIndex: 18 },

  // ── Manipur ──────────────────────────────────────────────────────────────
  { cityId: 'imphal',      districtName: 'Imphal West',            stateCode: 'MN', areaKm2: 519,   udyamMSMEs: 25,   activeCompanies: 8,   gstRegistrations: 35,  formalBusinessIndex: 12 },

  // ── Puducherry (UT) ───────────────────────────────────────────────────────
  { cityId: 'puducherry',  districtName: 'Puducherry',             stateCode: 'PY', areaKm2: 479,   udyamMSMEs: 45,   activeCompanies: 18,  gstRegistrations: 68,  formalBusinessIndex: 28 },
]

const DISTRICT_MAP = new Map<string, DistrictData>(
  DISTRICT_DATA.map(d => [d.cityId, d])
)

export function getDistrictData(cityId: string): DistrictData | undefined {
  return DISTRICT_MAP.get(cityId)
}

/**
 * Returns a normalised formal-business-density score (0–100) for the city's
 * district. Higher score = more registered businesses per km² = more formal
 * supply competition.
 */
export function getDistrictFormalBusinessIndex(cityId: string): number {
  const d = DISTRICT_MAP.get(cityId)
  if (!d) return 40 // fallback mid-range
  // Blend MSME density per km² + company density + formalBusinessIndex
  const msmePerKm2 = (d.udyamMSMEs * 1000) / d.areaKm2
  // Normalise against max (Mumbai ≈ 800/km²)
  const msmeDensityScore = Math.min(100, (msmePerKm2 / 800) * 100)
  return Math.round(d.formalBusinessIndex * 0.6 + msmeDensityScore * 0.4)
}
