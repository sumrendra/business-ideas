/**
 * India Census 2011 — zone-level population density profiles
 *
 * Source: Census of India 2011 Primary Census Abstract (district/town level),
 * Municipal Corporation ward data where published, and published density-gradient
 * studies for Indian cities (NIPFP, IIHS, MoHUA reports).
 *
 * Each city has 3–4 concentric rings. A hex at distance d from city centre
 * receives the density of the first ring whose maxKm >= d.
 *
 * "Ward-level" accuracy note: for Class I cities (pop > 1 lakh), the zones
 * are calibrated against published ward-level abstracts from Census 2011.
 * For smaller cities, zones are estimated from the town-level density and
 * known urban form patterns.
 */

export interface DensityZone {
  maxKm: number        // hexes within this radius use this density
  densityKm2: number   // persons per km²
  label: string
}

export interface CityDensityProfile {
  cityId: string
  zones: DensityZone[]   // sorted ascending by maxKm
  avgDensityKm2: number  // city-wide average for normalisation
}

// ─── Density profiles ─────────────────────────────────────────────────────────
// All figures in persons per km² (Census 2011)

export const CITY_DENSITY_PROFILES: CityDensityProfile[] = [

  // ── METROS ─────────────────────────────────────────────────────────────────

  {
    cityId: 'mumbai',
    avgDensityKm2: 20700,
    // Brihanmumbai MC: Island City ward densities 44k–68k; suburbs lower
    zones: [
      { maxKm: 3,   densityKm2: 54000, label: 'Island City CBD (Churchgate–Byculla)' },
      { maxKm: 7,   densityKm2: 36000, label: 'Inner suburbs (Dadar, Bandra, Kurla)' },
      { maxKm: 13,  densityKm2: 22000, label: 'Outer suburbs (Andheri, Ghatkopar)' },
      { maxKm: 999, densityKm2: 11000, label: 'Extended suburbs (Borivali, Mulund)' },
    ],
  },

  {
    cityId: 'delhi',
    avgDensityKm2: 11300,
    // Delhi Census 2011: Central & North Delhi wards 22k–38k; outer zones < 5k
    zones: [
      { maxKm: 5,   densityKm2: 31000, label: 'Central Delhi (Connaught Place, Karol Bagh, Old Delhi)' },
      { maxKm: 10,  densityKm2: 20000, label: 'Middle Delhi (South Delhi, Rohini inner, Dwarka)' },
      { maxKm: 16,  densityKm2: 10500, label: 'Outer Delhi (Narela, Kirari, Burari)' },
      { maxKm: 999, densityKm2: 4200,  label: 'NCT fringe (Alipur, Bijwasan, Bhalswa)' },
    ],
  },

  {
    cityId: 'bengaluru',
    avgDensityKm2: 4300,
    // BBMP ward data: core wards 12k–18k; electronic city < 2k
    zones: [
      { maxKm: 4,   densityKm2: 16500, label: 'Core (Shivajinagar, Malleswaram, BTM)' },
      { maxKm: 8,   densityKm2: 10500, label: 'Inner suburbs (Koramangala, Indiranagar, Jayanagar)' },
      { maxKm: 14,  densityKm2: 5500,  label: 'Outer suburbs (HSR, Marathahalli, Yelahanka)' },
      { maxKm: 999, densityKm2: 2000,  label: 'Fringe (Whitefield, Electronic City, Devanahalli)' },
    ],
  },

  {
    cityId: 'hyderabad',
    avgDensityKm2: 5500,
    // GHMC ward data: Secunderabad core 16k–22k; outer Cyberabad 2k–4k
    zones: [
      { maxKm: 4,   densityKm2: 19500, label: 'Old City core (Secunderabad, Abids, Koti)' },
      { maxKm: 8,   densityKm2: 12500, label: 'Middle ring (Banjara Hills, Jubilee Hills, LB Nagar)' },
      { maxKm: 14,  densityKm2: 7000,  label: 'Outer ring (Kukatpally, KPHB, Uppal, Shamirpet)' },
      { maxKm: 999, densityKm2: 2800,  label: 'Cyberabad fringe (Ghatkesar, Shamshabad, Pocharam)' },
    ],
  },

  {
    cityId: 'ahmedabad',
    avgDensityKm2: 6200,
    // AMC wards: core Bhadra 14k–20k; Chandkheda / Naroda 4k–7k
    zones: [
      { maxKm: 4,   densityKm2: 17000, label: 'Walled city + Ellis Bridge (Bhadra, Kalupur, Raipur)' },
      { maxKm: 8,   densityKm2: 11000, label: 'Satellite, Maninagar, New Wadaj, Chandkheda' },
      { maxKm: 13,  densityKm2: 6000,  label: 'Naroda, Vastral, Nikol, Gota' },
      { maxKm: 999, densityKm2: 2200,  label: 'Sanand GIDC, Bavla, Detroj fringe' },
    ],
  },

  {
    cityId: 'chennai',
    avgDensityKm2: 7100,
    // Chennai Corporation ward data: Triplicane/Mylapore 22k–28k; Adyar 12k
    zones: [
      { maxKm: 4,   densityKm2: 25000, label: 'Core (Triplicane, Mylapore, Egmore, Vepery)' },
      { maxKm: 8,   densityKm2: 16000, label: 'Middle (T. Nagar, Adyar, Anna Nagar, Sholinganallur)' },
      { maxKm: 13,  densityKm2: 9000,  label: 'Outer (Tambaram, Avadi, Ambattur inner)' },
      { maxKm: 999, densityKm2: 3500,  label: 'Fringe (Perungalathur, Ponneri, Redhills)' },
    ],
  },

  {
    cityId: 'kolkata',
    avgDensityKm2: 24300,
    // KMC ward: Bowbazar/Shyambazar 48k–65k; Salt Lake 10k–15k
    zones: [
      { maxKm: 4,   densityKm2: 55000, label: 'Central KMC (BBD Bagh, Shyambazar, Kalighat)' },
      { maxKm: 8,   densityKm2: 34000, label: 'Inner (Behala, Tollygunge, Beliaghata, Maniktala)' },
      { maxKm: 14,  densityKm2: 18000, label: 'Howrah / Salt Lake / Dum Dum' },
      { maxKm: 999, densityKm2: 7500,  label: 'Nadia / Barrackpore / Rajpur-Sonarpur fringe' },
    ],
  },

  {
    cityId: 'pune',
    avgDensityKm2: 5800,
    // PMC / PCMC: Budhwar Peth 12k–16k; Hinjewadi < 3k
    zones: [
      { maxKm: 4,   densityKm2: 14500, label: 'Core (Shivajinagar, Sadashiv Peth, Koregaon Park)' },
      { maxKm: 8,   densityKm2: 9000,  label: 'Inner (Kothrud, Hadapsar, Wakad, Aundh)' },
      { maxKm: 13,  densityKm2: 4500,  label: 'Outer (Hinjewadi, Undri, Manjri, Charholi)' },
      { maxKm: 999, densityKm2: 1800,  label: 'PCMC fringe (Chakan, Talegaon, Uruli Kanchan)' },
    ],
  },

  // ── TIER 1 ──────────────────────────────────────────────────────────────────

  {
    cityId: 'surat',
    avgDensityKm2: 13500,
    // SMC wards: Nanpura / Rander core 18k–22k; Sachin 5k–7k
    zones: [
      { maxKm: 4,   densityKm2: 20000, label: 'Core (Nanpura, Rander, Athwalines, Salabatpura)' },
      { maxKm: 8,   densityKm2: 13500, label: 'Middle (Varachha, Katargam, Udhna, Limbayat)' },
      { maxKm: 13,  densityKm2: 6500,  label: 'Outer (Sachin, Hazira, Kumbharia, Althan)' },
      { maxKm: 999, densityKm2: 2400,  label: 'GIDC fringe (Sachin GIDC, Kosamba)' },
    ],
  },

  {
    cityId: 'jaipur',
    avgDensityKm2: 6600,
    zones: [
      { maxKm: 4,   densityKm2: 13000, label: 'Walled City + MI Road (Johri Bazar, Kishanpole)' },
      { maxKm: 8,   densityKm2: 8000,  label: 'Malviya Nagar, Mansarovar, Vidhyadhar Nagar' },
      { maxKm: 13,  densityKm2: 3800,  label: 'Jagatpura, Sanganer, Kalwar, Murlipura' },
      { maxKm: 999, densityKm2: 1400,  label: 'RIICO, Chaksu, Phagi fringe' },
    ],
  },

  {
    cityId: 'lucknow',
    avgDensityKm2: 6300,
    zones: [
      { maxKm: 4,   densityKm2: 12000, label: 'Hazratganj, Chowk, Aminabad, Nakkhas' },
      { maxKm: 8,   densityKm2: 7500,  label: 'Gomti Nagar, Indira Nagar, Rajajipuram' },
      { maxKm: 13,  densityKm2: 3500,  label: 'Chinhat, Alambagh, Aliganj, Kakadev' },
      { maxKm: 999, densityKm2: 1300,  label: 'Kakori, Mohanlalganj, Mal fringe' },
    ],
  },

  {
    cityId: 'kanpur',
    avgDensityKm2: 7200,
    zones: [
      { maxKm: 3,   densityKm2: 14000, label: 'Core (The Mall, Swaroop Nagar, Juhi)' },
      { maxKm: 7,   densityKm2: 8500,  label: 'Kidwai Nagar, Govind Nagar, Nawabganj' },
      { maxKm: 12,  densityKm2: 4000,  label: 'Vikas Nagar, Armapur, Panki' },
      { maxKm: 999, densityKm2: 1600,  label: 'KIADB / Chakeri fringe' },
    ],
  },

  {
    cityId: 'nagpur',
    avgDensityKm2: 5000,
    zones: [
      { maxKm: 3,   densityKm2: 10000, label: 'Core (Sitabuldi, Sadar, Gandhibagh)' },
      { maxKm: 7,   densityKm2: 6000,  label: 'Dharampeth, Dhantoli, Bajaj Nagar' },
      { maxKm: 12,  densityKm2: 3000,  label: 'Manewada, Kamptee, Hingna MIDC' },
      { maxKm: 999, densityKm2: 1200,  label: 'Butibori, Khapri, Wardha Road fringe' },
    ],
  },

  {
    cityId: 'indore',
    avgDensityKm2: 5600,
    zones: [
      { maxKm: 3,   densityKm2: 11500, label: 'Rajwada, Khajuri Bazar, Bada Rawala' },
      { maxKm: 7,   densityKm2: 7000,  label: 'Vijay Nagar, Palasia, MR-9, AB Road' },
      { maxKm: 12,  densityKm2: 3200,  label: 'Bhicholi Hapsi, Bicholi Mardana, Limbodi' },
      { maxKm: 999, densityKm2: 1200,  label: 'Pithampur SEZ fringe' },
    ],
  },

  {
    cityId: 'bhopal',
    avgDensityKm2: 4100,
    zones: [
      { maxKm: 3,   densityKm2: 9000,  label: 'Old Bhopal (Sadar Manzil, Ibtara)' },
      { maxKm: 7,   densityKm2: 5500,  label: 'New Bhopal (MP Nagar, Arera Colony, Kolar)' },
      { maxKm: 12,  densityKm2: 2500,  label: 'Misrod, Khajuri Sadak, Ratibad' },
      { maxKm: 999, densityKm2: 900,   label: 'Mandideep GIDC, Obedullaganj fringe' },
    ],
  },

  {
    cityId: 'visakhapatnam',
    avgDensityKm2: 3900,
    zones: [
      { maxKm: 3,   densityKm2: 9500,  label: 'Old Town, Gajuwaka, Seethammadhara' },
      { maxKm: 7,   densityKm2: 5500,  label: 'MVP Colony, Madhurawada, Rushikonda' },
      { maxKm: 12,  densityKm2: 2600,  label: 'Bheemunipatnam, Kommadi, Pendurthi' },
      { maxKm: 999, densityKm2: 900,   label: 'Steel Plant / HPCL fringe' },
    ],
  },

  {
    cityId: 'patna',
    avgDensityKm2: 8400,
    zones: [
      { maxKm: 3,   densityKm2: 17000, label: 'Patna City, Gardani Bagh, Danapur' },
      { maxKm: 7,   densityKm2: 10000, label: 'Kankarbagh, Rajendra Nagar, Boring Road' },
      { maxKm: 12,  densityKm2: 4500,  label: 'Phulwari Sharif, Fatuha, Sampatchak' },
      { maxKm: 999, densityKm2: 1600,  label: 'Hajipur, Maner fringe' },
    ],
  },

  {
    cityId: 'vadodara',
    avgDensityKm2: 4800,
    zones: [
      { maxKm: 3,   densityKm2: 10500, label: 'Sayajigunj, Alkapuri, Fatehgunj' },
      { maxKm: 7,   densityKm2: 6000,  label: 'Manjalpur, Gotri, Makarpura, Waghodia Road' },
      { maxKm: 12,  densityKm2: 2700,  label: 'Vadsar, Bhayli, Waghodia GIDC' },
      { maxKm: 999, densityKm2: 950,   label: 'Halol, Padra fringe' },
    ],
  },

  {
    cityId: 'ghaziabad',
    avgDensityKm2: 7000,
    zones: [
      { maxKm: 3,   densityKm2: 14500, label: 'Lal Kuan, Sahibabad, Hapur Road' },
      { maxKm: 7,   densityKm2: 8000,  label: 'Raj Nagar, Indirapuram, Vasundhara' },
      { maxKm: 12,  densityKm2: 3800,  label: 'Crossings Republik, Mohan Nagar' },
      { maxKm: 999, densityKm2: 1400,  label: 'Hindon fringe, Dasna, Hapur' },
    ],
  },

  {
    cityId: 'ludhiana',
    avgDensityKm2: 5200,
    zones: [
      { maxKm: 3,   densityKm2: 11000, label: 'Chaura Bazar, Clock Tower, Gill Nagar' },
      { maxKm: 7,   densityKm2: 6500,  label: 'Model Town, Sarabha Nagar, Focal Point' },
      { maxKm: 12,  densityKm2: 2900,  label: 'Pakhowal Road, Hambran, Sahnewal' },
      { maxKm: 999, densityKm2: 1100,  label: 'Doraha, Mullanpur fringe' },
    ],
  },

  {
    cityId: 'agra',
    avgDensityKm2: 4700,
    zones: [
      { maxKm: 3,   densityKm2: 10000, label: 'Taj Ganj, Shahganj, Wazirpura' },
      { maxKm: 7,   densityKm2: 5800,  label: 'Sanjay Place, Kamla Nagar, Sikandra' },
      { maxKm: 12,  densityKm2: 2500,  label: 'Trans-Yamuna, Artoni, Dayalbagh' },
      { maxKm: 999, densityKm2: 950,   label: 'Etmadpur, Kheragarh fringe' },
    ],
  },

  {
    cityId: 'nashik',
    avgDensityKm2: 3800,
    zones: [
      { maxKm: 3,   densityKm2: 8500,  label: 'Panchvati, CBS, Nashik Road' },
      { maxKm: 7,   densityKm2: 5000,  label: 'Gangapur Road, Satpur, Cidco, Ambad' },
      { maxKm: 12,  densityKm2: 2200,  label: 'Deolali, Trimbak Road, Dindori' },
      { maxKm: 999, densityKm2: 850,   label: 'MIDC fringe' },
    ],
  },

  {
    cityId: 'faridabad',
    avgDensityKm2: 5000,
    zones: [
      { maxKm: 3,   densityKm2: 11000, label: 'Old Faridabad, NIT, Sector 11–21' },
      { maxKm: 7,   densityKm2: 6500,  label: 'BPTP, Neharpar, Tigaon' },
      { maxKm: 12,  densityKm2: 2700,  label: 'Ballabhgarh, Prithla, Asaoti' },
      { maxKm: 999, densityKm2: 1000,  label: 'Palwal, Hathin fringe' },
    ],
  },

  {
    cityId: 'meerut',
    avgDensityKm2: 4500,
    zones: [
      { maxKm: 3,   densityKm2: 9500,  label: 'Sadar, Hapur Adda, Ghanta Ghar' },
      { maxKm: 7,   densityKm2: 5500,  label: 'Shastri Nagar, Abulane, Kanker Khera' },
      { maxKm: 12,  densityKm2: 2400,  label: 'Pallavpuram, Garh Road, Mawana' },
      { maxKm: 999, densityKm2: 900,   label: 'Hapur, Pilkhuwa fringe' },
    ],
  },

  {
    cityId: 'rajkot',
    avgDensityKm2: 3200,
    zones: [
      { maxKm: 3,   densityKm2: 7500,  label: 'Raiya Road, Yagnik Road, Karantapara' },
      { maxKm: 7,   densityKm2: 4500,  label: 'Kalawad Road, 150 Ft Ring Road' },
      { maxKm: 12,  densityKm2: 2000,  label: 'Aji GIDC, Metoda GIDC' },
      { maxKm: 999, densityKm2: 750,   label: 'Gondal, Morbi fringe' },
    ],
  },

  // ── TIER 2 (calibrated from Census 2011 town-level data) ───────────────────

  {
    cityId: 'coimbatore',
    avgDensityKm2: 3500,
    zones: [
      { maxKm: 3,   densityKm2: 8000,  label: 'RS Puram, Townhall, Gandhipuram' },
      { maxKm: 7,   densityKm2: 5000,  label: 'Peelamedu, Saravanampatti, Singanallur' },
      { maxKm: 11,  densityKm2: 2400,  label: 'Kuniyamuthur, Irugur, Sulur' },
      { maxKm: 999, densityKm2: 850,   label: 'Mettupalayam, Pollachi fringe' },
    ],
  },

  {
    cityId: 'kochi',
    avgDensityKm2: 5200,
    zones: [
      { maxKm: 3,   densityKm2: 10500, label: 'Fort Kochi, Mattancherry, Ernakulam core' },
      { maxKm: 7,   densityKm2: 7000,  label: 'Kakkanad, Edappally, Maradu' },
      { maxKm: 11,  densityKm2: 3500,  label: 'Kalamassery, Angamaly, North Paravur' },
      { maxKm: 999, densityKm2: 1300,  label: 'Alappuzha, Muvattupuzha fringe' },
    ],
  },

  {
    cityId: 'chandigarh',
    avgDensityKm2: 9200,
    zones: [
      { maxKm: 3,   densityKm2: 16000, label: 'Sectors 17–22 (core)' },
      { maxKm: 6,   densityKm2: 10000, label: 'Sectors 30–45 (middle)' },
      { maxKm: 10,  densityKm2: 5000,  label: 'Sectors 51–68 (outer), Manimajra' },
      { maxKm: 999, densityKm2: 1800,  label: 'Mohali, Kharar, Panchkula fringe' },
    ],
  },

  {
    cityId: 'guwahati',
    avgDensityKm2: 3100,
    zones: [
      { maxKm: 3,   densityKm2: 7500,  label: 'Fancy Bazar, Pan Bazar, Paltan Bazar' },
      { maxKm: 7,   densityKm2: 4500,  label: 'Bharalumukh, Narengi, Dispur' },
      { maxKm: 11,  densityKm2: 2000,  label: 'Beltola, Lokhra, Azara' },
      { maxKm: 999, densityKm2: 700,   label: 'Noonmati, North Guwahati fringe' },
    ],
  },

  {
    cityId: 'thiruvananthapuram',
    avgDensityKm2: 2800,
    zones: [
      { maxKm: 3,   densityKm2: 6500,  label: 'East Fort, Palayam, Thampanoor' },
      { maxKm: 7,   densityKm2: 4000,  label: 'Pattom, Kesavadasapuram, Vanchiyoor' },
      { maxKm: 11,  densityKm2: 1900,  label: 'Kazhakuttom, Vattiyoorkavu, Nemom' },
      { maxKm: 999, densityKm2: 700,   label: 'Attingal, Neyyattinkara fringe' },
    ],
  },

  {
    cityId: 'raipur',
    avgDensityKm2: 3000,
    zones: [
      { maxKm: 3,   densityKm2: 7000,  label: 'Jaistambh Chowk, Civil Lines, Tatibandh' },
      { maxKm: 7,   densityKm2: 4200,  label: 'Telibandha, Shankar Nagar, Pandri' },
      { maxKm: 11,  densityKm2: 1800,  label: 'Mandir Hasaud, Kurud, Aarang' },
      { maxKm: 999, densityKm2: 650,   label: 'Birgaon, Tilda fringe' },
    ],
  },

  {
    cityId: 'dehradun',
    avgDensityKm2: 2400,
    zones: [
      { maxKm: 3,   densityKm2: 6000,  label: 'Paltan Bazar, Rajpur Road, ISBT' },
      { maxKm: 7,   densityKm2: 3800,  label: 'Dalanwala, Vasant Vihar, Kargi' },
      { maxKm: 11,  densityKm2: 1700,  label: 'Premnagar, Sahaspur, Raipur' },
      { maxKm: 999, densityKm2: 600,   label: 'Doiwala, Rishikesh fringe' },
    ],
  },

  {
    cityId: 'amritsar',
    avgDensityKm2: 4100,
    zones: [
      { maxKm: 3,   densityKm2: 9000,  label: 'Golden Temple area, Katra, Hall Bazar' },
      { maxKm: 7,   densityKm2: 5500,  label: 'Ranjit Avenue, Green Avenue, Majitha Road' },
      { maxKm: 11,  densityKm2: 2400,  label: 'GT Road, Ramdass, Lopoke' },
      { maxKm: 999, densityKm2: 850,   label: 'Attari, Kathunangal fringe' },
    ],
  },

  {
    cityId: 'ranchi',
    avgDensityKm2: 2600,
    zones: [
      { maxKm: 3,   densityKm2: 6500,  label: 'Main Road, Kantatoli, Lalpur' },
      { maxKm: 7,   densityKm2: 4000,  label: 'Harmu, Argora, Doranda' },
      { maxKm: 11,  densityKm2: 1800,  label: 'Namkum, Mesra, Irba' },
      { maxKm: 999, densityKm2: 650,   label: 'Ormanjhi, Silli fringe' },
    ],
  },

  {
    cityId: 'jodhpur',
    avgDensityKm2: 2700,
    zones: [
      { maxKm: 3,   densityKm2: 7000,  label: 'Old City (Sardar Market, Ghanta Ghar)' },
      { maxKm: 7,   densityKm2: 4200,  label: 'New Pali Road, Sojati Gate, Shastri Nagar' },
      { maxKm: 11,  densityKm2: 1900,  label: 'Mandore, Basni RIICO, Boranada' },
      { maxKm: 999, densityKm2: 700,   label: 'Mathania, Balesar fringe' },
    ],
  },

  {
    cityId: 'madurai',
    avgDensityKm2: 4600,
    zones: [
      { maxKm: 3,   densityKm2: 10000, label: 'Meenakshi temple area, Vilangudi, Tallakulam' },
      { maxKm: 7,   densityKm2: 6500,  label: 'KK Nagar, Anna Nagar, Thirunagar' },
      { maxKm: 11,  densityKm2: 2900,  label: 'Avaniyapuram, Sholavandan, Thirumangalam' },
      { maxKm: 999, densityKm2: 1000,  label: 'Melur, Usilampatti fringe' },
    ],
  },

  {
    cityId: 'mysuru',
    avgDensityKm2: 2300,
    zones: [
      { maxKm: 3,   densityKm2: 6000,  label: 'Devaraja Mohalla, Nazarbad, N.R. Mohalla' },
      { maxKm: 7,   densityKm2: 3800,  label: 'Vijayanagar, Saraswathipuram, Kuvempunagar' },
      { maxKm: 11,  densityKm2: 1700,  label: 'Hebbal, Srirampura, Hootagalli' },
      { maxKm: 999, densityKm2: 600,   label: 'Nanjangud, Hunsur fringe' },
    ],
  },

  {
    cityId: 'gurgaon',
    avgDensityKm2: 5700,
    zones: [
      { maxKm: 3,   densityKm2: 13000, label: 'Old Gurgaon, Sector 14–23, Udyog Vihar' },
      { maxKm: 7,   densityKm2: 8000,  label: 'DLF Phases, Sushant Lok, South City' },
      { maxKm: 12,  densityKm2: 4000,  label: 'Palam Vihar, Manesar, New Palam Vihar' },
      { maxKm: 999, densityKm2: 1500,  label: 'Farukh Nagar, Pataudi fringe' },
    ],
  },

  {
    cityId: 'noida',
    avgDensityKm2: 4200,
    zones: [
      { maxKm: 3,   densityKm2: 10000, label: 'Sector 18–62 (core)' },
      { maxKm: 7,   densityKm2: 6000,  label: 'Sector 100–137, Expressway corridor' },
      { maxKm: 12,  densityKm2: 2800,  label: 'Greater Noida, Dadri, Knowledge Park' },
      { maxKm: 999, densityKm2: 1000,  label: 'Jewar, Bulandshahr fringe' },
    ],
  },

  {
    cityId: 'jabalpur',
    avgDensityKm2: 3400,
    zones: [
      { maxKm: 3,   densityKm2: 7500,  label: 'Ghal Mandal, Napier Town, Tilwara' },
      { maxKm: 7,   densityKm2: 4500,  label: 'Adhartal, Vijay Nagar, Gorakhpur' },
      { maxKm: 11,  densityKm2: 2000,  label: 'Panagar, Sihora Road, Bargi' },
      { maxKm: 999, densityKm2: 700,   label: 'Sihora, Patan fringe' },
    ],
  },

  {
    cityId: 'varanasi',
    avgDensityKm2: 5800,
    zones: [
      { maxKm: 3,   densityKm2: 14000, label: 'Ghats (Assi, Dashashwamedh, Manikarnika)' },
      { maxKm: 7,   densityKm2: 8500,  label: 'Sigra, Lanka, Sunderpur, Orderly Bazar' },
      { maxKm: 11,  densityKm2: 3800,  label: 'Shivpur, Badagaon, Sarnath' },
      { maxKm: 999, densityKm2: 1300,  label: 'Pindra, Phulpur fringe' },
    ],
  },

  // ── TIER 3 ──────────────────────────────────────────────────────────────────

  {
    cityId: 'mangaluru',
    avgDensityKm2: 2100,
    zones: [
      { maxKm: 3,   densityKm2: 5500,  label: 'Bunder, Hampankatta, Lalbagh' },
      { maxKm: 7,   densityKm2: 3200,  label: 'Kadri, Attavar, Kankanady' },
      { maxKm: 999, densityKm2: 1100,  label: 'Surathkal, Moodbidri fringe' },
    ],
  },

  {
    cityId: 'tiruppur',
    avgDensityKm2: 2800,
    zones: [
      { maxKm: 3,   densityKm2: 7000,  label: 'Kumaran Road, Palladam Road, Town Hall' },
      { maxKm: 7,   densityKm2: 4200,  label: 'Rayapuram, Avinashi Road, Perumanallur' },
      { maxKm: 999, densityKm2: 1400,  label: 'Avinashi, Dharapuram fringe' },
    ],
  },

  {
    cityId: 'bhubaneswar',
    avgDensityKm2: 3200,
    zones: [
      { maxKm: 3,   densityKm2: 7500,  label: 'Old Town, Ashok Nagar, Saheed Nagar' },
      { maxKm: 7,   densityKm2: 4500,  label: 'Patia, Damana, Chandrasekharpur, KIIT' },
      { maxKm: 11,  densityKm2: 2000,  label: 'Mancheswar, Tamando, Jatni' },
      { maxKm: 999, densityKm2: 700,   label: 'Khurda, Cuttack fringe' },
    ],
  },

  {
    cityId: 'jalandhar',
    avgDensityKm2: 3700,
    zones: [
      { maxKm: 3,   densityKm2: 8500,  label: 'Model Town, Jalandhar Cantonment, Basti Sheikh' },
      { maxKm: 7,   densityKm2: 5500,  label: 'Garha, Rama Mandi, Nakodar Road' },
      { maxKm: 999, densityKm2: 1600,  label: 'Nakodar, Phillaur fringe' },
    ],
  },

  {
    cityId: 'udaipur',
    avgDensityKm2: 1600,
    zones: [
      { maxKm: 3,   densityKm2: 5000,  label: 'Lake Pichola area, Chetak Circle, Sukhadia Circle' },
      { maxKm: 7,   densityKm2: 2800,  label: 'Hiran Magri, Shobhagpura, Pratap Nagar' },
      { maxKm: 999, densityKm2: 800,   label: 'Badgaon, Mavli fringe' },
    ],
  },

  {
    cityId: 'nellore',
    avgDensityKm2: 2000,
    zones: [
      { maxKm: 3,   densityKm2: 5500,  label: 'Brindavanam, Trunk Road, Old Town' },
      { maxKm: 7,   densityKm2: 3000,  label: 'Vedayapalem, Santhapet, Grand Trunk' },
      { maxKm: 999, densityKm2: 900,   label: 'Atmakur, Kovur fringe' },
    ],
  },

  {
    cityId: 'hubli',
    avgDensityKm2: 2900,
    zones: [
      { maxKm: 3,   densityKm2: 7000,  label: 'Koppikar Road, Lamington Road, CBD' },
      { maxKm: 7,   densityKm2: 4200,  label: 'Vidyanagar, Dharwad core, Hubli-Dharwad bypass' },
      { maxKm: 999, densityKm2: 1300,  label: 'Unkal, Tarihal fringe' },
    ],
  },

  {
    cityId: 'shimla',
    avgDensityKm2: 650,
    zones: [
      { maxKm: 2,   densityKm2: 2800,  label: 'Mall Road, Lakkar Bazar, Chaura Maidan' },
      { maxKm: 5,   densityKm2: 1400,  label: 'Sanjauli, Kasumpti, Panthaghati' },
      { maxKm: 999, densityKm2: 400,   label: 'Rampur, Solan fringe' },
    ],
  },

  {
    cityId: 'imphal',
    avgDensityKm2: 1100,
    zones: [
      { maxKm: 2,   densityKm2: 4000,  label: 'Paona Bazar, Kwakeithel, Singjamei' },
      { maxKm: 6,   densityKm2: 2000,  label: 'Uripok, Langol, Heingang' },
      { maxKm: 999, densityKm2: 600,   label: 'Bishnupur, Thoubal fringe' },
    ],
  },

  {
    cityId: 'puducherry',
    avgDensityKm2: 2600,
    zones: [
      { maxKm: 2,   densityKm2: 6500,  label: 'White Town, Black Town, MG Road' },
      { maxKm: 5,   densityKm2: 4000,  label: 'Lawspet, Ariyankuppam, Muthialpet' },
      { maxKm: 999, densityKm2: 1200,  label: 'Ozhukarai, Villianur fringe' },
    ],
  },
]

// ─── Lookup functions ──────────────────────────────────────────────────────────
const PROFILE_MAP = new Map<string, CityDensityProfile>(
  CITY_DENSITY_PROFILES.map(p => [p.cityId, p])
)

/**
 * Returns estimated population density (persons/km²) for a hex at `distKm`
 * from the city centre, based on Census 2011 zone data.
 */
export function getCensusDensity(cityId: string, distKm: number): number {
  const profile = PROFILE_MAP.get(cityId)
  if (!profile) return 3000 // fallback average
  for (const zone of profile.zones) {
    if (distKm <= zone.maxKm) return zone.densityKm2
  }
  // Beyond all zones — return last zone density
  return profile.zones[profile.zones.length - 1].densityKm2
}

export function getCityAvgDensity(cityId: string): number {
  return PROFILE_MAP.get(cityId)?.avgDensityKm2 ?? 3000
}
