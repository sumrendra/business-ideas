// Commercial rent data for Indian cities by zone type
// Source: Anarock Commercial Report 2024, JLL India, Knight Frank India 2023-24
// Rent = monthly ₹ per sqft for ground-floor or first-floor retail/commercial space

export interface ZoneRent {
  zone: string
  description: string
  rentMin: number    // ₹/sqft/month
  rentMax: number
  typicalSqft: number  // typical unit size for SME retail
}

export interface CityRentProfile {
  cityId: string
  cityName: string
  tier: 1 | 2 | 3
  zones: ZoneRent[]
}

export const CITY_RENT_PROFILES: CityRentProfile[] = [
  { cityId: 'mumbai', cityName: 'Mumbai', tier: 1, zones: [
    { zone: 'Prime High-Street', description: 'Linking Rd, Colaba Causeway, Hill Rd Bandra, Phoenix Palladium area', rentMin: 300, rentMax: 700, typicalSqft: 300 },
    { zone: 'Secondary Commercial', description: 'Andheri West, Goregaon, Thane main market, Vashi', rentMin: 120, rentMax: 280, typicalSqft: 400 },
    { zone: 'Suburban High-Street', description: 'Kandivali, Borivali, Mira Road, Ulhasnagar', rentMin: 60, rentMax: 130, typicalSqft: 500 },
    { zone: 'Peripheral / Navi Mumbai (non-CBD)', description: 'Panvel, Badlapur, Bhiwandi, Vasai', rentMin: 25, rentMax: 70, typicalSqft: 600 },
  ]},
  { cityId: 'delhi', cityName: 'Delhi NCR', tier: 1, zones: [
    { zone: 'Prime High-Street', description: 'Connaught Place, Khan Market, South Ex, GK-1, Lajpat Nagar', rentMin: 250, rentMax: 500, typicalSqft: 300 },
    { zone: 'Secondary Commercial', description: 'Saket, Janakpuri, Rohini, Karol Bagh main market', rentMin: 100, rentMax: 220, typicalSqft: 400 },
    { zone: 'Gurgaon / Noida CBD', description: 'MG Road Gurgaon, Cyber City surrounds, Noida Sector 18', rentMin: 80, rentMax: 200, typicalSqft: 450 },
    { zone: 'Peripheral NCR', description: 'Faridabad, Ghaziabad outer, Greater Noida', rentMin: 25, rentMax: 70, typicalSqft: 600 },
  ]},
  { cityId: 'bengaluru', cityName: 'Bengaluru', tier: 1, zones: [
    { zone: 'Prime High-Street', description: 'Brigade Road, Koramangala 5th Block, Indiranagar 100ft Rd, Jayanagar 4th Block', rentMin: 150, rentMax: 350, typicalSqft: 350 },
    { zone: 'Secondary Commercial', description: 'Whitefield main, Electronic City Phase 2, Marathahalli, Hebbal', rentMin: 70, rentMax: 160, typicalSqft: 450 },
    { zone: 'Suburban High-Street', description: 'Bannerghatta Rd, Old Madras Rd, Rajarajeshwari Nagar', rentMin: 40, rentMax: 90, typicalSqft: 500 },
    { zone: 'Peripheral', description: 'Devanahalli, Sarjapura outer, Attibele', rentMin: 15, rentMax: 45, typicalSqft: 700 },
  ]},
  { cityId: 'hyderabad', cityName: 'Hyderabad', tier: 1, zones: [
    { zone: 'Prime High-Street', description: 'Banjara Hills, Jubilee Hills, Himayat Nagar, Madhapur main', rentMin: 100, rentMax: 250, typicalSqft: 400 },
    { zone: 'Secondary Commercial', description: 'Kondapur, Gachibowli, Kukatpally KPHB, Ameerpet', rentMin: 50, rentMax: 130, typicalSqft: 500 },
    { zone: 'Suburban High-Street', description: 'Miyapur, Kompally, LB Nagar, Uppal', rentMin: 25, rentMax: 65, typicalSqft: 550 },
    { zone: 'Peripheral', description: 'Shamshabad, Ghatkesar, Medchal', rentMin: 10, rentMax: 30, typicalSqft: 700 },
  ]},
  { cityId: 'chennai', cityName: 'Chennai', tier: 1, zones: [
    { zone: 'Prime High-Street', description: 'Anna Nagar 2nd Ave, Nungambakkam, Adyar, T. Nagar Ranganathan St', rentMin: 90, rentMax: 200, typicalSqft: 400 },
    { zone: 'Secondary Commercial', description: 'Velachery, Porur, Mogappair, Madhavaram', rentMin: 45, rentMax: 110, typicalSqft: 500 },
    { zone: 'Suburban High-Street', description: 'Perambur, Ambattur, Chrompet, Pallavaram', rentMin: 20, rentMax: 60, typicalSqft: 600 },
    { zone: 'Peripheral', description: 'Poonamallee, Red Hills, Maraimalai Nagar', rentMin: 10, rentMax: 28, typicalSqft: 700 },
  ]},
  { cityId: 'pune', cityName: 'Pune', tier: 1, zones: [
    { zone: 'Prime High-Street', description: 'FC Road, MG Road Deccan, Koregaon Park, Camp area', rentMin: 90, rentMax: 210, typicalSqft: 400 },
    { zone: 'Secondary Commercial', description: 'Baner main, Kothrud, Wakad, Viman Nagar', rentMin: 50, rentMax: 120, typicalSqft: 450 },
    { zone: 'Suburban High-Street', description: 'Hadapsar, Undri, Kondhwa, Ambegaon', rentMin: 25, rentMax: 65, typicalSqft: 550 },
    { zone: 'Peripheral', description: 'Talegaon, Chakan, Uruli Kanchan', rentMin: 10, rentMax: 30, typicalSqft: 700 },
  ]},
  { cityId: 'ahmedabad', cityName: 'Ahmedabad', tier: 1, zones: [
    { zone: 'Prime High-Street', description: 'CG Road, SG Highway retail strip, Navrangpura, Law Garden', rentMin: 70, rentMax: 160, typicalSqft: 400 },
    { zone: 'Secondary Commercial', description: 'Maninagar, Bopal, Vastrapur, Satellite Rd', rentMin: 35, rentMax: 90, typicalSqft: 500 },
    { zone: 'Suburban High-Street', description: 'Chandkheda, Nikol, Vastral, Naroda', rentMin: 18, rentMax: 45, typicalSqft: 600 },
    { zone: 'Peripheral', description: 'Sanand, Bavla, Dholka', rentMin: 8, rentMax: 22, typicalSqft: 800 },
  ]},
  { cityId: 'jaipur', cityName: 'Jaipur', tier: 2, zones: [
    { zone: 'Prime High-Street', description: 'MI Road, C-Scheme main, Tonk Road near Durgapura, Vaishali Nagar main', rentMin: 55, rentMax: 130, typicalSqft: 400 },
    { zone: 'Secondary Commercial', description: 'Malviya Nagar, Mansarovar Sector 7, Pratap Nagar, Gopalpura Bypass', rentMin: 28, rentMax: 70, typicalSqft: 500 },
    { zone: 'Suburban High-Street', description: 'Sanganer, Murlipura, Amer Rd, Raja Park', rentMin: 15, rentMax: 40, typicalSqft: 600 },
    { zone: 'Peripheral', description: 'Jagatpura outer, Chomu, Bassi', rentMin: 6, rentMax: 18, typicalSqft: 800 },
  ]},
  { cityId: 'lucknow', cityName: 'Lucknow', tier: 2, zones: [
    { zone: 'Prime High-Street', description: 'Hazratganj, MG Road, Gomti Nagar Vipin Khand, Ashok Marg', rentMin: 45, rentMax: 110, typicalSqft: 400 },
    { zone: 'Secondary Commercial', description: 'Alambagh, Aliganj, Jankipuram, Indira Nagar', rentMin: 22, rentMax: 60, typicalSqft: 500 },
    { zone: 'Suburban High-Street', description: 'Chinhat, Bakshi Ka Talab, Faizabad Road', rentMin: 10, rentMax: 28, typicalSqft: 600 },
    { zone: 'Peripheral', description: 'Malihabad, Deva Road, Sitapur Road outer', rentMin: 5, rentMax: 15, typicalSqft: 800 },
  ]},
  { cityId: 'kolkata', cityName: 'Kolkata', tier: 1, zones: [
    { zone: 'Prime High-Street', description: 'Park Street, Camac Street, Gariahat, New Market area', rentMin: 80, rentMax: 200, typicalSqft: 400 },
    { zone: 'Secondary Commercial', description: 'Salt Lake Sector V, Behala main, Barasat main, Dum Dum', rentMin: 35, rentMax: 90, typicalSqft: 500 },
    { zone: 'Suburban High-Street', description: 'Rajarhat New Town, Garia, Baruipur', rentMin: 18, rentMax: 50, typicalSqft: 600 },
    { zone: 'Peripheral', description: 'Barrackpore, Kalyani, Dankuni', rentMin: 8, rentMax: 22, typicalSqft: 800 },
  ]},
]

// Compute ROI index: gap_score / normalised_monthly_rent_cost
// Higher = better value location for the gap score achieved
export function computeLocalityROI(
  gapScore: number,       // 0–100 from scan endpoint
  rentMin: number,
  rentMax: number,
  sqft: number,
): { roiMin: number; roiMax: number; monthlyRentMin: number; monthlyRentMax: number } {
  const monthlyRentMin = rentMin * sqft
  const monthlyRentMax = rentMax * sqft
  // ROI = gap score per ₹10,000/month of rent (normalised for comparison)
  const roiMax = gapScore / (monthlyRentMin / 10000)
  const roiMin = gapScore / (monthlyRentMax / 10000)
  return {
    roiMin: Math.round(roiMin * 10) / 10,
    roiMax: Math.round(roiMax * 10) / 10,
    monthlyRentMin,
    monthlyRentMax,
  }
}
