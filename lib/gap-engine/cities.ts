export type PopulationTier = 'metro' | 'tier1' | 'tier2' | 'tier3'

export interface City {
  id: string
  name: string
  state: string
  stateCode: string
  lat: number
  lng: number
  tier: PopulationTier
  population: number   // in lakhs
  densityKm2: number   // approximate population per km²
  h3Ring: number       // H3 resolution-8 ring radius for analysis
  // Google Trends name as it appears in region results (for city-level matching)
  trendsName: string
}

export const CITIES: City[] = [
  // ── Metros ──────────────────────────────────────────────────────────────────
  { id: 'mumbai',      name: 'Mumbai',         state: 'Maharashtra',     stateCode: 'MH', lat: 19.0760, lng: 72.8777, tier: 'metro', population: 2046, densityKm2: 20700, h3Ring: 16, trendsName: 'Mumbai' },
  { id: 'delhi',       name: 'Delhi',           state: 'Delhi',           stateCode: 'DL', lat: 28.7041, lng: 77.1025, tier: 'metro', population: 3290, densityKm2: 11300, h3Ring: 16, trendsName: 'Delhi' },
  { id: 'bengaluru',   name: 'Bengaluru',       state: 'Karnataka',       stateCode: 'KA', lat: 12.9716, lng: 77.5946, tier: 'metro', population: 1200, densityKm2: 4300,  h3Ring: 16, trendsName: 'Bengaluru' },
  { id: 'hyderabad',   name: 'Hyderabad',       state: 'Telangana',       stateCode: 'TG', lat: 17.3850, lng: 78.4867, tier: 'metro', population: 1000, densityKm2: 5500,  h3Ring: 16, trendsName: 'Hyderabad' },
  { id: 'ahmedabad',   name: 'Ahmedabad',       state: 'Gujarat',         stateCode: 'GJ', lat: 23.0225, lng: 72.5714, tier: 'metro', population: 800,  densityKm2: 6200,  h3Ring: 16, trendsName: 'Ahmedabad' },
  { id: 'chennai',     name: 'Chennai',         state: 'Tamil Nadu',      stateCode: 'TN', lat: 13.0827, lng: 80.2707, tier: 'metro', population: 1040, densityKm2: 7100,  h3Ring: 16, trendsName: 'Chennai' },
  { id: 'kolkata',     name: 'Kolkata',         state: 'West Bengal',     stateCode: 'WB', lat: 22.5726, lng: 88.3639, tier: 'metro', population: 1497, densityKm2: 24300, h3Ring: 16, trendsName: 'Kolkata' },
  { id: 'pune',        name: 'Pune',            state: 'Maharashtra',     stateCode: 'MH', lat: 18.5204, lng: 73.8567, tier: 'metro', population: 700,  densityKm2: 5800,  h3Ring: 16, trendsName: 'Pune' },

  // ── Tier 1 ──────────────────────────────────────────────────────────────────
  { id: 'surat',           name: 'Surat',           state: 'Gujarat',         stateCode: 'GJ', lat: 21.1702, lng: 72.8311, tier: 'tier1', population: 600,  densityKm2: 13500, h3Ring: 12, trendsName: 'Surat' },
  { id: 'jaipur',          name: 'Jaipur',          state: 'Rajasthan',       stateCode: 'RJ', lat: 26.9124, lng: 75.7873, tier: 'tier1', population: 400,  densityKm2: 6600,  h3Ring: 12, trendsName: 'Jaipur' },
  { id: 'lucknow',         name: 'Lucknow',         state: 'Uttar Pradesh',   stateCode: 'UP', lat: 26.8467, lng: 80.9462, tier: 'tier1', population: 360,  densityKm2: 6300,  h3Ring: 12, trendsName: 'Lucknow' },
  { id: 'kanpur',          name: 'Kanpur',          state: 'Uttar Pradesh',   stateCode: 'UP', lat: 26.4499, lng: 80.3319, tier: 'tier1', population: 320,  densityKm2: 7200,  h3Ring: 12, trendsName: 'Kanpur' },
  { id: 'nagpur',          name: 'Nagpur',          state: 'Maharashtra',     stateCode: 'MH', lat: 21.1458, lng: 79.0882, tier: 'tier1', population: 290,  densityKm2: 5000,  h3Ring: 12, trendsName: 'Nagpur' },
  { id: 'indore',          name: 'Indore',          state: 'Madhya Pradesh',  stateCode: 'MP', lat: 22.7196, lng: 75.8577, tier: 'tier1', population: 280,  densityKm2: 5600,  h3Ring: 12, trendsName: 'Indore' },
  { id: 'bhopal',          name: 'Bhopal',          state: 'Madhya Pradesh',  stateCode: 'MP', lat: 23.2599, lng: 77.4126, tier: 'tier1', population: 250,  densityKm2: 4100,  h3Ring: 12, trendsName: 'Bhopal' },
  { id: 'visakhapatnam',   name: 'Visakhapatnam',   state: 'Andhra Pradesh',  stateCode: 'AP', lat: 17.6868, lng: 83.2185, tier: 'tier1', population: 230,  densityKm2: 3900,  h3Ring: 12, trendsName: 'Visakhapatnam' },
  { id: 'patna',           name: 'Patna',           state: 'Bihar',           stateCode: 'BR', lat: 25.5941, lng: 85.1376, tier: 'tier1', population: 220,  densityKm2: 8400,  h3Ring: 12, trendsName: 'Patna' },
  { id: 'vadodara',        name: 'Vadodara',        state: 'Gujarat',         stateCode: 'GJ', lat: 22.3072, lng: 73.1812, tier: 'tier1', population: 210,  densityKm2: 4800,  h3Ring: 12, trendsName: 'Vadodara' },
  { id: 'ghaziabad',       name: 'Ghaziabad',       state: 'Uttar Pradesh',   stateCode: 'UP', lat: 28.6692, lng: 77.4538, tier: 'tier1', population: 200,  densityKm2: 7000,  h3Ring: 12, trendsName: 'Ghaziabad' },
  { id: 'ludhiana',        name: 'Ludhiana',        state: 'Punjab',          stateCode: 'PB', lat: 30.9010, lng: 75.8573, tier: 'tier1', population: 190,  densityKm2: 5200,  h3Ring: 12, trendsName: 'Ludhiana' },
  { id: 'agra',            name: 'Agra',            state: 'Uttar Pradesh',   stateCode: 'UP', lat: 27.1767, lng: 78.0081, tier: 'tier1', population: 185,  densityKm2: 4700,  h3Ring: 12, trendsName: 'Agra' },
  { id: 'nashik',          name: 'Nashik',          state: 'Maharashtra',     stateCode: 'MH', lat: 19.9975, lng: 73.7898, tier: 'tier1', population: 180,  densityKm2: 3800,  h3Ring: 12, trendsName: 'Nashik' },
  { id: 'faridabad',       name: 'Faridabad',       state: 'Haryana',         stateCode: 'HR', lat: 28.4089, lng: 77.3178, tier: 'tier1', population: 175,  densityKm2: 5000,  h3Ring: 12, trendsName: 'Faridabad' },
  { id: 'meerut',          name: 'Meerut',          state: 'Uttar Pradesh',   stateCode: 'UP', lat: 28.9845, lng: 77.7064, tier: 'tier1', population: 165,  densityKm2: 4500,  h3Ring: 12, trendsName: 'Meerut' },
  { id: 'rajkot',          name: 'Rajkot',          state: 'Gujarat',         stateCode: 'GJ', lat: 22.3039, lng: 70.8022, tier: 'tier1', population: 160,  densityKm2: 3200,  h3Ring: 12, trendsName: 'Rajkot' },

  // ── Tier 2 ──────────────────────────────────────────────────────────────────
  { id: 'coimbatore',        name: 'Coimbatore',        state: 'Tamil Nadu',      stateCode: 'TN', lat: 11.0168, lng: 76.9558, tier: 'tier2', population: 150, densityKm2: 3500, h3Ring: 9, trendsName: 'Coimbatore' },
  { id: 'kochi',             name: 'Kochi',             state: 'Kerala',          stateCode: 'KL', lat: 9.9312,  lng: 76.2673, tier: 'tier2', population: 140, densityKm2: 5200, h3Ring: 9, trendsName: 'Kochi' },
  { id: 'chandigarh',        name: 'Chandigarh',        state: 'Punjab',          stateCode: 'PB', lat: 30.7333, lng: 76.7794, tier: 'tier2', population: 130, densityKm2: 9200, h3Ring: 9, trendsName: 'Chandigarh' },
  { id: 'guwahati',          name: 'Guwahati',          state: 'Assam',           stateCode: 'AS', lat: 26.1445, lng: 91.7362, tier: 'tier2', population: 120, densityKm2: 3100, h3Ring: 9, trendsName: 'Guwahati' },
  { id: 'thiruvananthapuram',name: 'Thiruvananthapuram',state: 'Kerala',          stateCode: 'KL', lat: 8.5241,  lng: 76.9366, tier: 'tier2', population: 115, densityKm2: 2800, h3Ring: 9, trendsName: 'Thiruvananthapuram' },
  { id: 'raipur',            name: 'Raipur',            state: 'Chhattisgarh',    stateCode: 'CG', lat: 21.2514, lng: 81.6296, tier: 'tier2', population: 110, densityKm2: 3000, h3Ring: 9, trendsName: 'Raipur' },
  { id: 'dehradun',          name: 'Dehradun',          state: 'Uttarakhand',     stateCode: 'UK', lat: 30.3165, lng: 78.0322, tier: 'tier2', population: 100, densityKm2: 2400, h3Ring: 9, trendsName: 'Dehradun' },
  { id: 'amritsar',          name: 'Amritsar',          state: 'Punjab',          stateCode: 'PB', lat: 31.6340, lng: 74.8723, tier: 'tier2', population: 115, densityKm2: 4100, h3Ring: 9, trendsName: 'Amritsar' },
  { id: 'ranchi',            name: 'Ranchi',            state: 'Jharkhand',       stateCode: 'JH', lat: 23.3441, lng: 85.3096, tier: 'tier2', population: 105, densityKm2: 2600, h3Ring: 9, trendsName: 'Ranchi' },
  { id: 'jodhpur',           name: 'Jodhpur',           state: 'Rajasthan',       stateCode: 'RJ', lat: 26.2389, lng: 73.0243, tier: 'tier2', population: 108, densityKm2: 2700, h3Ring: 9, trendsName: 'Jodhpur' },
  { id: 'madurai',           name: 'Madurai',           state: 'Tamil Nadu',      stateCode: 'TN', lat: 9.9252,  lng: 78.1198, tier: 'tier2', population: 152, densityKm2: 4600, h3Ring: 9, trendsName: 'Madurai' },
  { id: 'mysuru',            name: 'Mysuru',            state: 'Karnataka',       stateCode: 'KA', lat: 12.2958, lng: 76.6394, tier: 'tier2', population: 100, densityKm2: 2300, h3Ring: 9, trendsName: 'Mysuru' },
  { id: 'gurgaon',           name: 'Gurgaon',           state: 'Haryana',         stateCode: 'HR', lat: 28.4595, lng: 77.0266, tier: 'tier2', population: 150, densityKm2: 5700, h3Ring: 9, trendsName: 'Gurgaon' },
  { id: 'noida',             name: 'Noida',             state: 'Uttar Pradesh',   stateCode: 'UP', lat: 28.5355, lng: 77.3910, tier: 'tier2', population: 120, densityKm2: 4200, h3Ring: 9, trendsName: 'Noida' },
  { id: 'jabalpur',          name: 'Jabalpur',          state: 'Madhya Pradesh',  stateCode: 'MP', lat: 23.1815, lng: 79.9864, tier: 'tier2', population: 130, densityKm2: 3400, h3Ring: 9, trendsName: 'Jabalpur' },
  { id: 'varanasi',          name: 'Varanasi',          state: 'Uttar Pradesh',   stateCode: 'UP', lat: 25.3176, lng: 82.9739, tier: 'tier2', population: 140, densityKm2: 5800, h3Ring: 9, trendsName: 'Varanasi' },

  // ── Tier 3 ──────────────────────────────────────────────────────────────────
  { id: 'mangaluru',   name: 'Mangaluru',   state: 'Karnataka',        stateCode: 'KA', lat: 12.9141, lng: 74.8560, tier: 'tier3', population: 70, densityKm2: 2100, h3Ring: 7, trendsName: 'Mangalore' },
  { id: 'tiruppur',    name: 'Tiruppur',    state: 'Tamil Nadu',       stateCode: 'TN', lat: 11.1085, lng: 77.3411, tier: 'tier3', population: 80, densityKm2: 2800, h3Ring: 7, trendsName: 'Tiruppur' },
  { id: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha',           stateCode: 'OD', lat: 20.2961, lng: 85.8245, tier: 'tier3', population: 95, densityKm2: 3200, h3Ring: 7, trendsName: 'Bhubaneswar' },
  { id: 'jalandhar',   name: 'Jalandhar',   state: 'Punjab',           stateCode: 'PB', lat: 31.3260, lng: 75.5762, tier: 'tier3', population: 90, densityKm2: 3700, h3Ring: 7, trendsName: 'Jalandhar' },
  { id: 'udaipur',     name: 'Udaipur',     state: 'Rajasthan',        stateCode: 'RJ', lat: 24.5854, lng: 73.7125, tier: 'tier3', population: 55, densityKm2: 1600, h3Ring: 7, trendsName: 'Udaipur' },
  { id: 'nellore',     name: 'Nellore',     state: 'Andhra Pradesh',   stateCode: 'AP', lat: 14.4426, lng: 79.9865, tier: 'tier3', population: 55, densityKm2: 2000, h3Ring: 7, trendsName: 'Nellore' },
  { id: 'hubli',       name: 'Hubli-Dharwad',state: 'Karnataka',       stateCode: 'KA', lat: 15.3647, lng: 75.1240, tier: 'tier3', population: 95, densityKm2: 2900, h3Ring: 7, trendsName: 'Hubli' },
  { id: 'shimla',      name: 'Shimla',      state: 'Himachal Pradesh', stateCode: 'HP', lat: 31.1048, lng: 77.1734, tier: 'tier3', population: 20, densityKm2: 650,  h3Ring: 7, trendsName: 'Shimla' },
  { id: 'imphal',      name: 'Imphal',      state: 'Manipur',          stateCode: 'MN', lat: 24.8170, lng: 93.9368, tier: 'tier3', population: 25, densityKm2: 1100, h3Ring: 7, trendsName: 'Imphal' },
  { id: 'puducherry',  name: 'Puducherry',  state: 'Puducherry',       stateCode: 'PY', lat: 11.9416, lng: 79.8083, tier: 'tier3', population: 30, densityKm2: 2600, h3Ring: 7, trendsName: 'Pondicherry' },
]

export const TIER_LABELS: Record<PopulationTier, string> = {
  metro:  'Metro (40L+ population)',
  tier1:  'Tier 1 (15–40L)',
  tier2:  'Tier 2 (5–15L)',
  tier3:  'Tier 3 (< 5L)',
}

export function getCityById(id: string): City | undefined {
  return CITIES.find(c => c.id === id)
}
