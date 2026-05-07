// NIC 2008 codes for common MSME / small business types in India
// Source: NIC 2008 classification (mospi.gov.in)

export interface NicEntry {
  code: string           // NIC 2008 5-digit code
  label: string          // human-readable name
  division: string       // broad sector (2-digit)
  divisionName: string
  keywords: string[]     // search keywords for matching
  placeKeywords: string[] // Google Places search terms
  gstType?: string       // likely GST sector
}

export const NIC_CODES: NicEntry[] = [
  // ── Agriculture & Farming ──────────────────────────────────────────────────
  { code: '01133', label: 'Mushroom Cultivation',        division: '01', divisionName: 'Agriculture', keywords: ['mushroom', 'oyster mushroom', 'button mushroom', 'mushroom farm'], placeKeywords: ['mushroom farm', 'mushroom cultivation'] },
  { code: '01119', label: 'Vegetable Farming',           division: '01', divisionName: 'Agriculture', keywords: ['vegetable farm', 'vegetable growing', 'kitchen garden'], placeKeywords: ['vegetable farm', 'organic farm'] },
  { code: '01110', label: 'Cereal / Grain Farming',      division: '01', divisionName: 'Agriculture', keywords: ['grain farm', 'wheat farm', 'rice farm', 'cereal'], placeKeywords: ['grain farm', 'wheat farm'] },
  { code: '01130', label: 'Flower / Nursery',            division: '01', divisionName: 'Agriculture', keywords: ['nursery', 'flower farm', 'horticulture', 'plant nursery', 'flowers'], placeKeywords: ['plant nursery', 'flower nursery'] },
  { code: '01410', label: 'Dairy Farming',               division: '01', divisionName: 'Agriculture', keywords: ['dairy', 'milk farm', 'cow farm', 'buffalo farm', 'dairy farm'], placeKeywords: ['dairy farm', 'milk farm'] },
  { code: '01470', label: 'Poultry Farming',             division: '01', divisionName: 'Agriculture', keywords: ['poultry', 'chicken farm', 'egg farm', 'broiler farm', 'hatchery'], placeKeywords: ['poultry farm', 'chicken farm'] },
  { code: '01492', label: 'Beekeeping / Honey',          division: '01', divisionName: 'Agriculture', keywords: ['beekeeping', 'honey', 'apiary', 'bee farm'], placeKeywords: ['honey farm', 'beekeeping'] },
  { code: '01499', label: 'Goat / Sheep Farming',        division: '01', divisionName: 'Agriculture', keywords: ['goat farm', 'sheep farm', 'meat farming', 'small ruminant'], placeKeywords: ['goat farm', 'sheep farm'] },
  { code: '03210', label: 'Aquaculture / Fish Farming',  division: '03', divisionName: 'Aquaculture', keywords: ['fish farm', 'aquaculture', 'prawn farm', 'shrimp farm', 'fishery'], placeKeywords: ['fish farm', 'aquaculture'] },
  { code: '02100', label: 'Forestry / Bamboo',           division: '02', divisionName: 'Forestry', keywords: ['bamboo', 'timber', 'forestry', 'bamboo farm'], placeKeywords: ['bamboo farm'] },
  { code: '01610', label: 'Post-Harvest Services / Agri Processing', division: '01', divisionName: 'Agriculture', keywords: ['agri processing', 'post harvest', 'grain mill', 'threshing'], placeKeywords: ['agri processing', 'grain processing'] },

  // ── Food Manufacturing / Processing ───────────────────────────────────────
  { code: '10710', label: 'Bakery / Bread Making',       division: '10', divisionName: 'Food Manufacturing', keywords: ['bakery', 'bread', 'cake', 'biscuit', 'patisserie', 'rusk'], placeKeywords: ['bakery', 'bread factory'] },
  { code: '10720', label: 'Sugar / Jaggery / Honey Products', division: '10', divisionName: 'Food Manufacturing', keywords: ['jaggery', 'sugar', 'honey processing', 'confectionery'], placeKeywords: ['jaggery making', 'candy manufacturing'] },
  { code: '10730', label: 'Chocolate / Cocoa / Snacks',  division: '10', divisionName: 'Food Manufacturing', keywords: ['chocolate', 'cocoa', 'candy', 'snack manufacturing'], placeKeywords: ['chocolate factory', 'snack manufacturing'] },
  { code: '10500', label: 'Dairy Processing (Paneer/Ghee/Cheese)', division: '10', divisionName: 'Food Manufacturing', keywords: ['dairy processing', 'paneer', 'ghee', 'cheese making', 'curd'], placeKeywords: ['dairy products', 'paneer making'] },
  { code: '10620', label: 'Rice / Flour Milling',        division: '10', divisionName: 'Food Manufacturing', keywords: ['rice mill', 'flour mill', 'chakki', 'atta', 'grinding mill'], placeKeywords: ['rice mill', 'flour mill'] },
  { code: '10130', label: 'Meat / Poultry Processing',   division: '10', divisionName: 'Food Manufacturing', keywords: ['meat processing', 'poultry processing', 'slaughterhouse', 'cold cuts'], placeKeywords: ['meat processing', 'poultry processing'] },
  { code: '10310', label: 'Pickle / Jam / Preserve',     division: '10', divisionName: 'Food Manufacturing', keywords: ['pickle', 'jam', 'achar', 'preserve', 'chutney making'], placeKeywords: ['pickle making', 'jam manufacturing'] },
  { code: '10410', label: 'Edible Oil Manufacturing',    division: '10', divisionName: 'Food Manufacturing', keywords: ['oil mill', 'edible oil', 'mustard oil', 'groundnut oil', 'cold press'], placeKeywords: ['oil mill', 'edible oil plant'] },
  { code: '10793', label: 'Spice Processing',            division: '10', divisionName: 'Food Manufacturing', keywords: ['spice', 'masala', 'grinding spice', 'chilli powder', 'turmeric processing'], placeKeywords: ['spice factory', 'masala manufacturing'] },
  { code: '11010', label: 'Distillery / Spirits',        division: '11', divisionName: 'Beverages', keywords: ['distillery', 'spirits', 'alcohol', 'wine', 'beer brewery'], placeKeywords: ['brewery', 'distillery'] },
  { code: '11030', label: 'Fruit Juice / Beverage Manufacturing', division: '11', divisionName: 'Beverages', keywords: ['juice', 'beverage manufacturing', 'soft drink', 'energy drink'], placeKeywords: ['juice factory', 'beverage plant'] },

  // ── Textile / Garment ──────────────────────────────────────────────────────
  { code: '13920', label: 'Readymade Garment / Tailoring Unit', division: '13', divisionName: 'Textiles', keywords: ['garment', 'tailoring', 'readymade clothes', 'apparel manufacturing', 'stitching unit'], placeKeywords: ['garment factory', 'tailoring unit'] },
  { code: '13910', label: 'Knitting / Hosiery',          division: '13', divisionName: 'Textiles', keywords: ['knitting', 'hosiery', 'sock', 'sweater', 'knitwear'], placeKeywords: ['knitting factory', 'hosiery unit'] },
  { code: '13110', label: 'Spinning / Weaving',          division: '13', divisionName: 'Textiles', keywords: ['spinning', 'weaving', 'yarn', 'handloom', 'textile weaving'], placeKeywords: ['weaving unit', 'handloom'] },
  { code: '14110', label: 'Leather Goods Manufacturing', division: '14', divisionName: 'Leather', keywords: ['leather', 'leather goods', 'bag making', 'wallet', 'leather accessories'], placeKeywords: ['leather factory', 'leather goods'] },

  // ── Other Manufacturing ────────────────────────────────────────────────────
  { code: '22110', label: 'Plastic Products Manufacturing', division: '22', divisionName: 'Manufacturing', keywords: ['plastic products', 'plastic manufacturing', 'PVC', 'containers', 'packaging plastic'], placeKeywords: ['plastic factory', 'plastic manufacturing'] },
  { code: '16291', label: 'Furniture / Wood Products',   division: '16', divisionName: 'Manufacturing', keywords: ['furniture', 'wood furniture', 'carpenter', 'wooden furniture making'], placeKeywords: ['furniture factory', 'carpenter workshop'] },
  { code: '31001', label: 'Paper / Cardboard Products',  division: '17', divisionName: 'Manufacturing', keywords: ['paper', 'cardboard', 'box making', 'packaging', 'paper products'], placeKeywords: ['paper factory', 'box manufacturing'] },
  { code: '20110', label: 'Chemical / Fertilizer Manufacturing', division: '20', divisionName: 'Manufacturing', keywords: ['chemical', 'fertilizer', 'organic fertilizer', 'bio fertilizer'], placeKeywords: ['chemical factory', 'fertilizer plant'] },
  { code: '26110', label: 'Electronics / PCB Assembly',  division: '26', divisionName: 'Electronics', keywords: ['electronics', 'PCB assembly', 'circuit board', 'electronic manufacturing'], placeKeywords: ['electronics factory', 'PCB assembly'] },
  { code: '27100', label: 'Electrical Equipment Manufacturing', division: '27', divisionName: 'Electronics', keywords: ['electrical equipment', 'motor', 'transformer', 'electrical manufacturing'], placeKeywords: ['electrical equipment', 'motor manufacturing'] },

  // ── Construction / Real Estate ─────────────────────────────────────────────
  { code: '41001', label: 'Building Construction (Residential)', division: '41', divisionName: 'Construction', keywords: ['construction', 'builder', 'residential construction', 'housing'], placeKeywords: ['construction company', 'builder'] },
  { code: '43210', label: 'Electrical Wiring / Solar Installation', division: '43', divisionName: 'Construction', keywords: ['electrical wiring', 'solar installation', 'solar panel', 'solar EPC', 'wiring contractor'], placeKeywords: ['solar installation', 'electrical contractor'] },
  { code: '43220', label: 'Plumbing / Water Fitting',    division: '43', divisionName: 'Construction', keywords: ['plumbing', 'water fitting', 'pipe fitting', 'plumber'], placeKeywords: ['plumbing services', 'plumber'] },
  { code: '43290', label: 'Interior Design / Home Renovation', division: '43', divisionName: 'Construction', keywords: ['interior design', 'home renovation', 'modular kitchen', 'false ceiling', 'interior'], placeKeywords: ['interior designer', 'home renovation'] },
  { code: '68310', label: 'Real Estate Broker / Agency', division: '68', divisionName: 'Real Estate', keywords: ['real estate', 'property broker', 'estate agent', 'realty'], placeKeywords: ['real estate agent', 'property dealer'] },

  // ── Retail Trade ───────────────────────────────────────────────────────────
  { code: '47111', label: 'Grocery / General Store',     division: '47', divisionName: 'Retail', keywords: ['grocery', 'kirana', 'general store', 'supermarket', 'provision store'], placeKeywords: ['grocery store', 'kirana store'] },
  { code: '47520', label: 'Hardware / Building Materials Store', division: '47', divisionName: 'Retail', keywords: ['hardware store', 'building materials', 'iron store', 'cement dealer'], placeKeywords: ['hardware store', 'building materials'] },
  { code: '47730', label: 'Pharmacy / Medical Store',    division: '47', divisionName: 'Retail', keywords: ['pharmacy', 'medical store', 'chemist', 'drugstore', 'medicine shop'], placeKeywords: ['pharmacy', 'medical store'] },
  { code: '47640', label: 'Mobile / Electronics Retail', division: '47', divisionName: 'Retail', keywords: ['mobile shop', 'electronics retail', 'phone shop', 'gadget store'], placeKeywords: ['mobile shop', 'electronics store'] },
  { code: '47300', label: 'Petrol Pump / Fuel Retail',   division: '47', divisionName: 'Retail', keywords: ['petrol pump', 'fuel station', 'CNG station', 'fuel retail'], placeKeywords: ['petrol pump', 'fuel station'] },
  { code: '47710', label: 'Clothing / Apparel Retail',   division: '47', divisionName: 'Retail', keywords: ['clothing store', 'apparel shop', 'garment retail', 'boutique', 'fashion store'], placeKeywords: ['clothing store', 'boutique'] },

  // ── Transportation & Logistics ─────────────────────────────────────────────
  { code: '49310', label: 'Auto Rickshaw / Taxi Service', division: '49', divisionName: 'Transport', keywords: ['auto rickshaw', 'taxi', 'cab service', 'ola uber'], placeKeywords: ['taxi service', 'cab service'] },
  { code: '49200', label: 'Trucking / Goods Transport',  division: '49', divisionName: 'Transport', keywords: ['trucking', 'goods transport', 'lorry', 'freight transport', 'logistics'], placeKeywords: ['transport company', 'logistics'] },
  { code: '52100', label: 'Warehousing / Cold Storage',  division: '52', divisionName: 'Transport', keywords: ['warehouse', 'cold storage', 'storage facility', 'fulfilment'], placeKeywords: ['warehouse', 'cold storage'] },
  { code: '53100', label: 'Courier / Last Mile Delivery', division: '53', divisionName: 'Transport', keywords: ['courier', 'delivery service', 'parcel', 'last mile', 'delivery startup'], placeKeywords: ['courier service', 'delivery company'] },

  // ── Food Service ───────────────────────────────────────────────────────────
  { code: '56101', label: 'Restaurant / Dhaba',          division: '56', divisionName: 'Food Service', keywords: ['restaurant', 'dhaba', 'eatery', 'food joint', 'dine-in'], placeKeywords: ['restaurant', 'dhaba'] },
  { code: '56102', label: 'Tiffin / Home Kitchen / Meal Service', division: '56', divisionName: 'Food Service', keywords: ['tiffin', 'cloud kitchen', 'home kitchen', 'meal service', 'home food', 'dabba service'], placeKeywords: ['tiffin service', 'cloud kitchen'] },
  { code: '56301', label: 'Tea / Coffee Shop / Cafe',    division: '56', divisionName: 'Food Service', keywords: ['tea shop', 'chai', 'cafe', 'coffee shop', 'chai stall'], placeKeywords: ['cafe', 'tea shop'] },
  { code: '56302', label: 'Juice Bar / Fruit Shop',      division: '56', divisionName: 'Food Service', keywords: ['juice bar', 'juice shop', 'fruit bar', 'smoothie'], placeKeywords: ['juice bar', 'juice shop'] },
  { code: '56109', label: 'Fast Food / Quick Service',   division: '56', divisionName: 'Food Service', keywords: ['fast food', 'QSR', 'burger', 'sandwich', 'quick service restaurant'], placeKeywords: ['fast food', 'QSR'] },
  { code: '56290', label: 'Catering / Event Food',       division: '56', divisionName: 'Food Service', keywords: ['catering', 'event food', 'caterer', 'banquet catering'], placeKeywords: ['catering service', 'caterer'] },

  // ── Health & Wellness ──────────────────────────────────────────────────────
  { code: '86100', label: 'Clinic / Hospital / Nursing Home', division: '86', divisionName: 'Healthcare', keywords: ['clinic', 'nursing home', 'hospital', 'medical clinic', 'doctor clinic'], placeKeywords: ['clinic', 'nursing home'] },
  { code: '86901', label: 'Diagnostic Lab / Pathology',  division: '86', divisionName: 'Healthcare', keywords: ['diagnostic', 'pathology', 'blood test', 'lab', 'diagnostic center'], placeKeywords: ['diagnostic lab', 'pathology lab'] },
  { code: '86902', label: 'Physiotherapy / Rehabilitation', division: '86', divisionName: 'Healthcare', keywords: ['physiotherapy', 'physio', 'rehabilitation', 'pain management'], placeKeywords: ['physiotherapy', 'physio clinic'] },
  { code: '93110', label: 'Gym / Fitness Center',        division: '93', divisionName: 'Wellness', keywords: ['gym', 'fitness center', 'crossfit', 'fitness studio', 'workout'], placeKeywords: ['gym', 'fitness center'] },
  { code: '93191', label: 'Yoga Studio / Meditation',    division: '93', divisionName: 'Wellness', keywords: ['yoga', 'meditation', 'yoga studio', 'yoga class'], placeKeywords: ['yoga studio', 'yoga class'] },
  { code: '96020', label: 'Beauty Salon / Spa / Parlour', division: '96', divisionName: 'Personal Services', keywords: ['beauty salon', 'spa', 'parlour', 'salon', 'hair salon', 'beauty parlour'], placeKeywords: ['beauty salon', 'spa'] },
  { code: '96011', label: 'Laundry / Dry Cleaning',      division: '96', divisionName: 'Personal Services', keywords: ['laundry', 'dry cleaning', 'wash fold', 'laundromat'], placeKeywords: ['laundry service', 'dry cleaning'] },

  // ── Education ──────────────────────────────────────────────────────────────
  { code: '85490', label: 'Coaching / Tuition Center',   division: '85', divisionName: 'Education', keywords: ['coaching', 'tuition', 'tutoring', 'coaching center', 'study center'], placeKeywords: ['coaching center', 'tuition center'] },
  { code: '85101', label: 'Pre-school / Playschool',     division: '85', divisionName: 'Education', keywords: ['preschool', 'playschool', 'kindergarten', 'nursery school', 'creche'], placeKeywords: ['preschool', 'playschool'] },
  { code: '85320', label: 'Vocational / Skill Training', division: '85', divisionName: 'Education', keywords: ['vocational', 'skill training', 'ITI', 'trade course', 'computer training'], placeKeywords: ['skill training', 'vocational training'] },
  { code: '85510', label: 'Sports / Activity Classes',   division: '85', divisionName: 'Education', keywords: ['sports academy', 'cricket academy', 'swimming', 'dance class', 'music class'], placeKeywords: ['sports academy', 'dance class'] },

  // ── IT & Technology Services ───────────────────────────────────────────────
  { code: '62010', label: 'Software Development / IT Services', division: '62', divisionName: 'IT', keywords: ['software', 'IT services', 'web development', 'app development', 'software company'], placeKeywords: ['software company', 'IT firm'] },
  { code: '62020', label: 'Computer Repair / Mobile Repair', division: '62', divisionName: 'IT', keywords: ['computer repair', 'mobile repair', 'laptop repair', 'phone repair', 'IT support'], placeKeywords: ['computer repair', 'mobile repair'] },
  { code: '62090', label: 'Digital Marketing / Agency',  division: '62', divisionName: 'IT', keywords: ['digital marketing', 'SEO', 'social media', 'marketing agency', 'content creation'], placeKeywords: ['digital marketing agency', 'SEO company'] },
  { code: '63120', label: 'Web Portal / E-commerce Platform', division: '63', divisionName: 'IT', keywords: ['ecommerce', 'online marketplace', 'web portal', 'online store'], placeKeywords: ['ecommerce company', 'web portal'] },

  // ── Vehicle / Auto Services ────────────────────────────────────────────────
  { code: '45201', label: 'Auto / Vehicle Repair Garage',division: '45', divisionName: 'Automotive', keywords: ['auto repair', 'garage', 'mechanic', 'car service', 'two wheeler repair', 'bike repair'], placeKeywords: ['auto repair', 'car service garage'] },
  { code: '45202', label: 'EV Repair / EV Service Center', division: '45', divisionName: 'Automotive', keywords: ['EV repair', 'electric vehicle repair', 'EV service', 'EV mechanic'], placeKeywords: ['EV service center', 'electric vehicle repair'] },
  { code: '45203', label: 'Tyre / Battery Shop',         division: '45', divisionName: 'Automotive', keywords: ['tyre shop', 'battery shop', 'tyre fitting', 'puncture repair'], placeKeywords: ['tyre shop', 'battery shop'] },
  { code: '45301', label: 'Auto Parts / Spare Parts',    division: '45', divisionName: 'Automotive', keywords: ['spare parts', 'auto parts', 'car parts', 'two wheeler parts'], placeKeywords: ['spare parts shop', 'auto parts'] },
  { code: '45400', label: 'Motorcycle / Scooter Dealer', division: '45', divisionName: 'Automotive', keywords: ['bike dealer', 'motorcycle showroom', 'two wheeler dealer', 'scooter dealer'], placeKeywords: ['bike dealer', 'two wheeler showroom'] },

  // ── Professional / Financial Services ─────────────────────────────────────
  { code: '69100', label: 'CA / Tax Consultant / Accountant', division: '69', divisionName: 'Professional', keywords: ['CA firm', 'chartered accountant', 'tax consultant', 'GST filing', 'accounting'], placeKeywords: ['CA firm', 'tax consultant'] },
  { code: '69200', label: 'Legal Services / Advocate',   division: '69', divisionName: 'Professional', keywords: ['lawyer', 'advocate', 'legal services', 'law firm', 'legal consultant'], placeKeywords: ['law firm', 'advocate'] },
  { code: '74100', label: 'Graphic Design / Printing',   division: '74', divisionName: 'Professional', keywords: ['graphic design', 'printing press', 'banner printing', 'design studio'], placeKeywords: ['printing press', 'graphic design'] },
  { code: '79110', label: 'Travel Agency / Tour Operator', division: '79', divisionName: 'Professional', keywords: ['travel agency', 'tour operator', 'ticketing', 'holiday package'], placeKeywords: ['travel agency', 'tour operator'] },

  // ── Repair & Maintenance ───────────────────────────────────────────────────
  { code: '95110', label: 'Mobile Phone Repair',         division: '95', divisionName: 'Repair', keywords: ['mobile repair', 'phone repair', 'smartphone repair', 'screen replacement'], placeKeywords: ['mobile repair shop', 'phone repair'] },
  { code: '95210', label: 'Consumer Electronics Repair', division: '95', divisionName: 'Repair', keywords: ['electronics repair', 'TV repair', 'AC repair', 'appliance repair', 'fridge repair'], placeKeywords: ['electronics repair', 'TV repair'] },
  { code: '95290', label: 'AC / HVAC Installation & Service', division: '95', divisionName: 'Repair', keywords: ['AC installation', 'HVAC', 'AC service', 'air conditioning', 'AC repair'], placeKeywords: ['AC service', 'HVAC installation'] },

  // ── Clean Energy ───────────────────────────────────────────────────────────
  { code: '35110', label: 'Solar Energy / EV Charging Station', division: '35', divisionName: 'Energy', keywords: ['solar', 'solar panel', 'EV charging', 'rooftop solar', 'solar energy', 'charging station'], placeKeywords: ['solar panel installation', 'EV charging station'] },
  { code: '38210', label: 'Waste Management / Recycling', division: '38', divisionName: 'Waste', keywords: ['waste management', 'recycling', 'e-waste', 'scrap', 'waste collection'], placeKeywords: ['recycling center', 'waste management'] },

  // ── Event / Media ───────────────────────────────────────────────────────────
  { code: '90010', label: 'Photography / Videography Studio', division: '90', divisionName: 'Media', keywords: ['photography', 'studio', 'photographer', 'video production', 'wedding photography'], placeKeywords: ['photography studio', 'photographer'] },
  { code: '82300', label: 'Event Management',            division: '82', divisionName: 'Events', keywords: ['event management', 'event planner', 'wedding planner', 'corporate events'], placeKeywords: ['event management', 'wedding planner'] },
]

// ── Search helpers ─────────────────────────────────────────────────────────────

export function searchNicCodes(query: string): NicEntry[] {
  if (!query || query.length < 2) return NIC_CODES.slice(0, 20)
  const q = query.toLowerCase()
  return NIC_CODES
    .filter(n =>
      n.label.toLowerCase().includes(q) ||
      n.keywords.some(k => k.includes(q)) ||
      n.code.includes(q) ||
      n.divisionName.toLowerCase().includes(q)
    )
    .slice(0, 15)
}

export function getNicByCode(code: string): NicEntry | undefined {
  return NIC_CODES.find(n => n.code === code)
}

// Division (2-digit) → NIC entries
export function getByDivision(division: string): NicEntry[] {
  return NIC_CODES.filter(n => n.division === division)
}

// All unique divisions for sector filter
export const DIVISIONS = [...new Set(NIC_CODES.map(n => n.divisionName))].sort()
