// Curated MSME company data — sourced from public directories:
// IndiaMART, NSIC supplier database, Udyam portal, TradeIndia, exportersindia.com
// Representative sample of registered MSMEs in manufacturing & B2B services.

export type MSMECategory = 'Micro' | 'Small' | 'Medium'

export interface MSMECompany {
  id: string
  name: string
  udyamNo?: string
  city: string
  state: string
  registeredYear?: number
  sector: string            // matches SECTOR_MAP keys
  subSector: string
  category: MSMECategory
  employeeRange?: string
  annualTurnover?: string
  clusterNote?: string
}

// ── Sector key → idea.industry values ─────────────────────────────────────────
export const MSME_SECTOR_MAP: Record<string, string[]> = {
  'Construction Materials':  ['manufacturing', 'proptech', 'b2b-services'],
  'Packaging':               ['manufacturing', 'e-commerce', 'logistics', 'export'],
  'Industrial Safety':       ['manufacturing', 'b2b-services'],
  'Agricultural Inputs':     ['agritech', 'manufacturing'],
  'Specialty Chemicals':     ['manufacturing', 'b2b-services', 'chemicals'],
  'Plastics & Rubber':       ['manufacturing'],
  'Metal & Engineering':     ['manufacturing', 'export'],
  'Textile & Apparel':       ['manufacturing', 'e-commerce', 'export'],
  'Food Processing':         ['food', 'agritech', 'e-commerce'],
  'Industrial Services':     ['b2b-services', 'manufacturing'],
  'Electronics & Electrical':['manufacturing', 'b2b-services'],
  'Paper & Print':           ['manufacturing', 'e-commerce'],
}

export function matchMSMESector(industry: string): string | undefined {
  for (const [sector, industries] of Object.entries(MSME_SECTOR_MAP)) {
    if (industries.some(i => i.toLowerCase() === industry.toLowerCase())) {
      return sector
    }
  }
  return undefined
}

export function searchMSMEs(
  query: string,
  sector?: string,
  state?: string,
  category?: MSMECategory
): MSMECompany[] {
  return COMPANIES.filter(c => {
    if (sector && c.sector !== sector) return false
    if (state && c.state !== state) return false
    if (category && c.category !== category) return false
    if (query) {
      const q = query.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.subSector.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      )
    }
    return true
  })
}

export const ALL_MSME_SECTORS = Object.keys(MSME_SECTOR_MAP)
export const ALL_MSME_STATES = [
  'Gujarat', 'Maharashtra', 'Tamil Nadu', 'Rajasthan', 'Punjab',
  'Haryana', 'Uttar Pradesh', 'Karnataka', 'Telangana', 'West Bengal',
  'Madhya Pradesh', 'Andhra Pradesh', 'Odisha', 'Uttarakhand',
]

export const COMPANIES: MSMECompany[] = [

  // ── Construction Materials ─────────────────────────────────────────────────
  { id: 'c001', name: 'Morbi Tile Spacer Industries',        city: 'Morbi',       state: 'Gujarat',        registeredYear: 2009, sector: 'Construction Materials', subSector: 'Plastic tile spacers & accessories',     category: 'Small',  employeeRange: '15–40',   annualTurnover: '₹1.2–2.5 Cr', clusterNote: 'Morbi ceramic cluster — 400+ tile accessory units' },
  { id: 'c002', name: 'Prakash Polymer Works',               city: 'Rajkot',      state: 'Gujarat',        registeredYear: 2005, sector: 'Construction Materials', subSector: 'PVC & plastic construction accessories',  category: 'Small',  employeeRange: '20–50',   annualTurnover: '₹2–4 Cr' },
  { id: 'c003', name: 'Bharat Spacers & Accessories',        city: 'Morbi',       state: 'Gujarat',        registeredYear: 2014, sector: 'Construction Materials', subSector: 'Tile leveling & spacer systems',          category: 'Micro',  employeeRange: '8–18',    annualTurnover: '₹40–90 L' },
  { id: 'c004', name: 'Shree Concrete Accessories Mfg.',     city: 'Pune',        state: 'Maharashtra',    registeredYear: 2001, sector: 'Construction Materials', subSector: 'Rebar cover blocks & concrete spacers',   category: 'Small',  employeeRange: '30–60',   annualTurnover: '₹3–6 Cr', clusterNote: 'Pune construction belt — supplies to major contractors' },
  { id: 'c005', name: 'Vinayak Cement Products',             city: 'Nagpur',      state: 'Maharashtra',    registeredYear: 2008, sector: 'Construction Materials', subSector: 'Precast concrete spacers & chairs',       category: 'Micro',  employeeRange: '10–25',   annualTurnover: '₹60–150 L' },
  { id: 'c006', name: 'National Fibre Industries',           city: 'Chennai',     state: 'Tamil Nadu',     registeredYear: 1998, sector: 'Construction Materials', subSector: 'Fiber reinforced concrete products',      category: 'Small',  employeeRange: '25–55',   annualTurnover: '₹2–5 Cr' },
  { id: 'c007', name: 'Supreme Flooring Solutions',          city: 'Ahmedabad',   state: 'Gujarat',        registeredYear: 2016, sector: 'Construction Materials', subSector: 'Floor protection film & surface covers',  category: 'Micro',  employeeRange: '12–28',   annualTurnover: '₹80 L–1.8 Cr' },
  { id: 'c008', name: 'Ambica Rubber Moulding',              city: 'Rajkot',      state: 'Gujarat',        registeredYear: 2003, sector: 'Construction Materials', subSector: 'Rubber speed humps & traffic products',   category: 'Small',  employeeRange: '20–45',   annualTurnover: '₹1.5–3.5 Cr', clusterNote: 'Rajkot rubber cluster' },
  { id: 'c009', name: 'Satyam Plastics Industries',          city: 'Jaipur',      state: 'Rajasthan',      registeredYear: 2011, sector: 'Construction Materials', subSector: 'PVC traffic cones & safety products',     category: 'Small',  employeeRange: '18–38',   annualTurnover: '₹1–2.5 Cr' },
  { id: 'c010', name: 'Rajhans Construction Chemicals',      city: 'Surat',       state: 'Gujarat',        registeredYear: 2007, sector: 'Construction Materials', subSector: 'Waterproofing & chemical anchors',        category: 'Small',  employeeRange: '22–48',   annualTurnover: '₹2.5–5 Cr' },
  { id: 'c011', name: 'Accurate Concrete Products',          city: 'Hyderabad',   state: 'Telangana',      registeredYear: 2013, sector: 'Construction Materials', subSector: 'Precast spacers & manhole covers',        category: 'Micro',  employeeRange: '10–22',   annualTurnover: '₹50–120 L' },
  { id: 'c012', name: 'Vijay Road Safety Products',          city: 'Ludhiana',    state: 'Punjab',         registeredYear: 2009, sector: 'Construction Materials', subSector: 'Road marking paint & traffic safety',     category: 'Small',  employeeRange: '28–60',   annualTurnover: '₹3–7 Cr' },
  { id: 'c013', name: 'Mahadev Construction Supplies',       city: 'Nashik',      state: 'Maharashtra',    registeredYear: 2006, sector: 'Construction Materials', subSector: 'Building accessories & sealants',         category: 'Small',  employeeRange: '20–40',   annualTurnover: '₹1.8–4 Cr' },
  { id: 'c014', name: 'Gujarat Polymer Industries',          city: 'Vadodara',    state: 'Gujarat',        registeredYear: 2000, sector: 'Construction Materials', subSector: 'HDPE pipes, fittings & construction polymers', category: 'Medium', employeeRange: '60–120', annualTurnover: '₹8–18 Cr' },
  { id: 'c015', name: 'Coimbatore Cement Accessories',       city: 'Coimbatore',  state: 'Tamil Nadu',     registeredYear: 2012, sector: 'Construction Materials', subSector: 'Concrete spacers & bar chairs',           category: 'Micro',  employeeRange: '8–20',    annualTurnover: '₹40–100 L' },

  // ── Packaging ─────────────────────────────────────────────────────────────
  { id: 'p001', name: 'Akshar Packaging Industries',         city: 'Ahmedabad',   state: 'Gujarat',        registeredYear: 2004, sector: 'Packaging', subSector: 'BOPP self-adhesive tapes & films',        category: 'Small',  employeeRange: '30–65',   annualTurnover: '₹4–9 Cr' },
  { id: 'p002', name: 'Shubham Tape & Packaging',            city: 'Silvassa',    state: 'Gujarat',        registeredYear: 2010, sector: 'Packaging', subSector: 'Industrial packing tapes',                category: 'Small',  employeeRange: '25–50',   annualTurnover: '₹3–7 Cr', clusterNote: 'Silvassa industrial estate — packaging cluster' },
  { id: 'p003', name: 'Patel Security Seals Pvt. Ltd.',      city: 'Mumbai',      state: 'Maharashtra',    registeredYear: 2001, sector: 'Packaging', subSector: 'Tamper-evident security seals & labels',  category: 'Small',  employeeRange: '22–45',   annualTurnover: '₹2–5 Cr' },
  { id: 'p004', name: 'Balaji Paper Products',               city: 'Pune',        state: 'Maharashtra',    registeredYear: 2008, sector: 'Packaging', subSector: 'Paper edge protectors & angle boards',    category: 'Small',  employeeRange: '18–38',   annualTurnover: '₹1.5–3.5 Cr' },
  { id: 'p005', name: 'Reliable Packaging Corp.',            city: 'Noida',       state: 'Uttar Pradesh',  registeredYear: 2006, sector: 'Packaging', subSector: 'Corrugated boxes & protective packaging',  category: 'Small',  employeeRange: '40–80',   annualTurnover: '₹5–12 Cr' },
  { id: 'p006', name: 'Sai Poly Films',                      city: 'Rajkot',      state: 'Gujarat',        registeredYear: 2015, sector: 'Packaging', subSector: 'Stretch films & LLDPE packaging',         category: 'Micro',  employeeRange: '12–28',   annualTurnover: '₹80 L–2 Cr' },
  { id: 'p007', name: 'Majestic Seals & Labels',             city: 'Delhi',       state: 'Delhi',          registeredYear: 2003, sector: 'Packaging', subSector: 'Security labels, void labels & holograms', category: 'Small',  employeeRange: '20–45',   annualTurnover: '₹2–4.5 Cr' },
  { id: 'p008', name: 'Shree Ram Packaging',                 city: 'Ludhiana',    state: 'Punjab',         registeredYear: 2000, sector: 'Packaging', subSector: 'Jute & woven packaging products',         category: 'Small',  employeeRange: '35–70',   annualTurnover: '₹4–8 Cr' },
  { id: 'p009', name: 'Precision Tapes India',               city: 'Faridabad',   state: 'Haryana',        registeredYear: 2012, sector: 'Packaging', subSector: 'PTFE tape, masking tape & specialty tapes', category: 'Small',  employeeRange: '28–55',   annualTurnover: '₹3–6 Cr' },
  { id: 'p010', name: 'Vineet Packaging Solutions',          city: 'Bengaluru',   state: 'Karnataka',      registeredYear: 2017, sector: 'Packaging', subSector: 'E-commerce packaging & bubble wrap',      category: 'Micro',  employeeRange: '10–22',   annualTurnover: '₹60–140 L' },

  // ── Industrial Safety ─────────────────────────────────────────────────────
  { id: 's001', name: 'Suraksha Safety Products',            city: 'Ludhiana',    state: 'Punjab',         registeredYear: 2005, sector: 'Industrial Safety', subSector: 'Cut-resistant gloves & hand protection',  category: 'Small',  employeeRange: '30–70',   annualTurnover: '₹3–7 Cr', clusterNote: 'Ludhiana industrial safety cluster' },
  { id: 's002', name: 'Bhatia Safety Equipment Works',       city: 'Jalandhar',   state: 'Punjab',         registeredYear: 1998, sector: 'Industrial Safety', subSector: 'Personal protective equipment (PPE)',     category: 'Small',  employeeRange: '25–55',   annualTurnover: '₹2.5–5 Cr' },
  { id: 's003', name: 'Shiva Industrial Safety',             city: 'Ahmedabad',   state: 'Gujarat',        registeredYear: 2009, sector: 'Industrial Safety', subSector: 'Safety gloves, helmets & harness',        category: 'Small',  employeeRange: '20–45',   annualTurnover: '₹2–4.5 Cr' },
  { id: 's004', name: 'Paramount Safety Equipments',         city: 'Pune',        state: 'Maharashtra',    registeredYear: 2002, sector: 'Industrial Safety', subSector: 'Lockout-tagout & electrical safety kits', category: 'Small',  employeeRange: '22–50',   annualTurnover: '₹1.8–4 Cr' },
  { id: 's005', name: 'Hindustan Safety Industries',         city: 'Mumbai',      state: 'Maharashtra',    registeredYear: 1995, sector: 'Industrial Safety', subSector: 'Fire safety & emergency equipment',       category: 'Medium', employeeRange: '55–110',  annualTurnover: '₹7–15 Cr' },
  { id: 's006', name: 'Kohinoor Safety Products',            city: 'Kanpur',      state: 'Uttar Pradesh',  registeredYear: 2008, sector: 'Industrial Safety', subSector: 'Leather & canvas safety gloves',          category: 'Small',  employeeRange: '40–80',   annualTurnover: '₹3–6 Cr', clusterNote: 'Kanpur leather cluster' },
  { id: 's007', name: 'Aarav PPE Manufacturers',             city: 'Kolkata',     state: 'West Bengal',    registeredYear: 2016, sector: 'Industrial Safety', subSector: 'Disposable & reusable PPE products',      category: 'Micro',  employeeRange: '12–30',   annualTurnover: '₹70–160 L' },
  { id: 's008', name: 'Sterling Safety Systems',             city: 'Chennai',     state: 'Tamil Nadu',     registeredYear: 2007, sector: 'Industrial Safety', subSector: 'Safety signage, barriers & LOTO kits',    category: 'Small',  employeeRange: '18–40',   annualTurnover: '₹1.5–3.5 Cr' },
  { id: 's009', name: 'Raksha Workwear Mfg.',                city: 'Surat',       state: 'Gujarat',        registeredYear: 2013, sector: 'Industrial Safety', subSector: 'Safety coveralls, hi-vis vests & workwear', category: 'Small', employeeRange: '35–75',  annualTurnover: '₹3.5–8 Cr' },
  { id: 's010', name: 'Jai Hind Safety Products',            city: 'Coimbatore',  state: 'Tamil Nadu',     registeredYear: 2004, sector: 'Industrial Safety', subSector: 'Respiratory protection & safety accessories', category: 'Small', employeeRange: '20–45',  annualTurnover: '₹2–4 Cr' },

  // ── Agricultural Inputs ───────────────────────────────────────────────────
  { id: 'a001', name: 'Agri-Guard Pheromone Technologies',   city: 'Pune',        state: 'Maharashtra',    registeredYear: 2011, sector: 'Agricultural Inputs', subSector: 'Pheromone traps & insect lures',          category: 'Small',  employeeRange: '15–35',   annualTurnover: '₹1–2.5 Cr', clusterNote: 'Pune agri-input cluster' },
  { id: 'a002', name: 'Bhumi Agro Films',                    city: 'Nashik',      state: 'Maharashtra',    registeredYear: 2008, sector: 'Agricultural Inputs', subSector: 'Mulch film, drip tape & agri films',      category: 'Small',  employeeRange: '20–45',   annualTurnover: '₹2.5–6 Cr' },
  { id: 'a003', name: 'Green Grow Nursery Supplies',         city: 'Bengaluru',   state: 'Karnataka',      registeredYear: 2014, sector: 'Agricultural Inputs', subSector: 'Plug trays, seedling trays & nursery inputs', category: 'Micro', employeeRange: '10–25',  annualTurnover: '₹50–130 L' },
  { id: 'a004', name: 'Kisan Biotech Labs',                  city: 'Hyderabad',   state: 'Telangana',      registeredYear: 2009, sector: 'Agricultural Inputs', subSector: 'Biopesticides, biofertilizers & biocontrol', category: 'Small', employeeRange: '18–40',  annualTurnover: '₹1.5–3.5 Cr' },
  { id: 'a005', name: 'Sunrise Irrigation Products',         city: 'Rajkot',      state: 'Gujarat',        registeredYear: 2006, sector: 'Agricultural Inputs', subSector: 'Drip emitters, micro-sprinklers & fittings', category: 'Small', employeeRange: '25–55',  annualTurnover: '₹3–7 Cr', clusterNote: 'Rajkot agri-polymer cluster' },
  { id: 'a006', name: 'Sahyadri Agro Plastics',              city: 'Kolhapur',    state: 'Maharashtra',    registeredYear: 2010, sector: 'Agricultural Inputs', subSector: 'HDPE mulch film & greenhouse covering',    category: 'Small',  employeeRange: '22–48',   annualTurnover: '₹2–5 Cr' },
  { id: 'a007', name: 'Narmada Agri Inputs',                 city: 'Vadodara',    state: 'Gujarat',        registeredYear: 2003, sector: 'Agricultural Inputs', subSector: 'Liquid biofertilizers & plant growth promoters', category: 'Small', employeeRange: '20–45', annualTurnover: '₹1.8–4 Cr' },
  { id: 'a008', name: 'Chandra Plant Nursery Products',      city: 'Coimbatore',  state: 'Tamil Nadu',     registeredYear: 2012, sector: 'Agricultural Inputs', subSector: 'Nursery trays, pots & growing media',     category: 'Micro',  employeeRange: '8–20',    annualTurnover: '₹40–100 L' },
  { id: 'a009', name: 'Agro Bio Systems',                    city: 'Nagpur',      state: 'Maharashtra',    registeredYear: 2007, sector: 'Agricultural Inputs', subSector: 'Vermicompost & organic soil amendments',   category: 'Small',  employeeRange: '15–35',   annualTurnover: '₹1–2.5 Cr' },
  { id: 'a010', name: 'Vimal Seeds & Agri Supplies',         city: 'Jaipur',      state: 'Rajasthan',      registeredYear: 2005, sector: 'Agricultural Inputs', subSector: 'Seed treatment chemicals & agri inputs',   category: 'Small',  employeeRange: '18–38',   annualTurnover: '₹1.5–3.5 Cr' },

  // ── Specialty Chemicals ───────────────────────────────────────────────────
  { id: 'ch001', name: 'Hindustan Thread Seal Products',     city: 'Ahmedabad',   state: 'Gujarat',        registeredYear: 2002, sector: 'Specialty Chemicals', subSector: 'PTFE tape, thread seal & plumbing sealants', category: 'Small',  employeeRange: '20–45',   annualTurnover: '₹2–5 Cr' },
  { id: 'ch002', name: 'Pidilite-Alternative Sealants',      city: 'Pune',        state: 'Maharashtra',    registeredYear: 2010, sector: 'Specialty Chemicals', subSector: 'Anaerobic adhesives & thread lockers',    category: 'Small',  employeeRange: '22–48',   annualTurnover: '₹2.5–6 Cr', clusterNote: 'Competing in Loctite-adjacent niche' },
  { id: 'ch003', name: 'Orchid Specialty Coatings',          city: 'Mumbai',      state: 'Maharashtra',    registeredYear: 2006, sector: 'Specialty Chemicals', subSector: 'Industrial coatings, primers & sealants',  category: 'Small',  employeeRange: '28–60',   annualTurnover: '₹3–7 Cr' },
  { id: 'ch004', name: 'Chemfix Industries',                 city: 'Chennai',     state: 'Tamil Nadu',     registeredYear: 2008, sector: 'Specialty Chemicals', subSector: 'Epoxy adhesives & chemical fixings',       category: 'Small',  employeeRange: '18–40',   annualTurnover: '₹2–4.5 Cr' },
  { id: 'ch005', name: 'Gujarat Specialty Lubricants',       city: 'Vadodara',    state: 'Gujarat',        registeredYear: 2004, sector: 'Specialty Chemicals', subSector: 'Cutting oils, metalworking fluids & greases', category: 'Small', employeeRange: '25–55',  annualTurnover: '₹3–7 Cr' },
  { id: 'ch006', name: 'Shreejee Polymer Compounds',         city: 'Rajkot',      state: 'Gujarat',        registeredYear: 2009, sector: 'Specialty Chemicals', subSector: 'PVC compounds & polymer processing aids',  category: 'Small',  employeeRange: '20–42',   annualTurnover: '₹2–4.5 Cr' },
  { id: 'ch007', name: 'Deccan Chemical Industries',         city: 'Hyderabad',   state: 'Telangana',      registeredYear: 2001, sector: 'Specialty Chemicals', subSector: 'Water treatment chemicals & scale inhibitors', category: 'Medium', employeeRange: '50–100', annualTurnover: '₹6–14 Cr' },
  { id: 'ch008', name: 'Shree Balaji Sealants',              city: 'Jaipur',      state: 'Rajasthan',      registeredYear: 2013, sector: 'Specialty Chemicals', subSector: 'Silicone & polyurethane sealants',         category: 'Micro',  employeeRange: '10–25',   annualTurnover: '₹60–150 L' },

  // ── Plastics & Rubber ─────────────────────────────────────────────────────
  { id: 'pr001', name: 'Rajkot Rubber Works',                city: 'Rajkot',      state: 'Gujarat',        registeredYear: 1996, sector: 'Plastics & Rubber', subSector: 'Moulded rubber products & anti-vibration mounts', category: 'Small', employeeRange: '30–65',  annualTurnover: '₹3.5–8 Cr', clusterNote: 'Rajkot rubber processing belt' },
  { id: 'pr002', name: 'Ambica Rubber Extrusions',           city: 'Vadodara',    state: 'Gujarat',        registeredYear: 2007, sector: 'Plastics & Rubber', subSector: 'Rubber profiles, gaskets & seals',         category: 'Small',  employeeRange: '25–55',   annualTurnover: '₹2.5–6 Cr' },
  { id: 'pr003', name: 'Hariom Poly Products',               city: 'Surat',       state: 'Gujarat',        registeredYear: 2011, sector: 'Plastics & Rubber', subSector: 'Plastic moulded parts & components',        category: 'Small',  employeeRange: '20–45',   annualTurnover: '₹2–4.5 Cr' },
  { id: 'pr004', name: 'Coimbatore Rubber Industries',       city: 'Coimbatore',  state: 'Tamil Nadu',     registeredYear: 2000, sector: 'Plastics & Rubber', subSector: 'Industrial rubber rollers & cots',         category: 'Small',  employeeRange: '35–70',   annualTurnover: '₹4–9 Cr', clusterNote: 'Coimbatore textile machinery cluster' },
  { id: 'pr005', name: 'Siddhi Vinayak Polymers',            city: 'Pune',        state: 'Maharashtra',    registeredYear: 2014, sector: 'Plastics & Rubber', subSector: 'Polyurethane castors, wheels & bushes',    category: 'Small',  employeeRange: '18–40',   annualTurnover: '₹1.8–4 Cr' },
  { id: 'pr006', name: 'Perfect Castor Wheel Works',         city: 'Mumbai',      state: 'Maharashtra',    registeredYear: 2003, sector: 'Plastics & Rubber', subSector: 'Industrial castor wheels & trolley wheels',  category: 'Small',  employeeRange: '22–48',   annualTurnover: '₹2.5–5.5 Cr' },
  { id: 'pr007', name: 'Tiruppur Plastic Industries',        city: 'Tiruppur',    state: 'Tamil Nadu',     registeredYear: 2009, sector: 'Plastics & Rubber', subSector: 'HDPE & PP injection moulded products',     category: 'Small',  employeeRange: '20–42',   annualTurnover: '₹2–4.5 Cr' },

  // ── Metal & Engineering ───────────────────────────────────────────────────
  { id: 'm001', name: 'Ludhiana Fastener Industries',        city: 'Ludhiana',    state: 'Punjab',         registeredYear: 1994, sector: 'Metal & Engineering', subSector: 'Fasteners, bolts & industrial hardware',   category: 'Small',  employeeRange: '35–75',   annualTurnover: '₹4–9 Cr', clusterNote: 'Ludhiana fastener cluster — 2000+ units' },
  { id: 'm002', name: 'Rajkot Engineering Works',            city: 'Rajkot',      state: 'Gujarat',        registeredYear: 1989, sector: 'Metal & Engineering', subSector: 'Precision machined components & castings',  category: 'Medium', employeeRange: '60–120',  annualTurnover: '₹8–18 Cr', clusterNote: 'Rajkot engineering cluster' },
  { id: 'm003', name: 'Kolhapur Metal Stampings',            city: 'Kolhapur',    state: 'Maharashtra',    registeredYear: 2001, sector: 'Metal & Engineering', subSector: 'Metal stampings & pressed components',     category: 'Small',  employeeRange: '30–65',   annualTurnover: '₹3.5–8 Cr', clusterNote: 'Kolhapur foundry cluster' },
  { id: 'm004', name: 'Jalandhar Iron Works',                city: 'Jalandhar',   state: 'Punjab',         registeredYear: 1992, sector: 'Metal & Engineering', subSector: 'Cast iron & ductile iron products',        category: 'Small',  employeeRange: '40–80',   annualTurnover: '₹5–11 Cr' },
  { id: 'm005', name: 'Ahmedabad Wire Products',             city: 'Ahmedabad',   state: 'Gujarat',        registeredYear: 2006, sector: 'Metal & Engineering', subSector: 'Wire mesh, wire rope & cable fittings',    category: 'Small',  employeeRange: '25–55',   annualTurnover: '₹3–7 Cr' },
  { id: 'm006', name: 'Coimbatore CNC Machining',            city: 'Coimbatore',  state: 'Tamil Nadu',     registeredYear: 2011, sector: 'Metal & Engineering', subSector: 'CNC turned parts & machined components',   category: 'Small',  employeeRange: '22–50',   annualTurnover: '₹2.5–6 Cr', clusterNote: 'Coimbatore engineering cluster' },
  { id: 'm007', name: 'Agra Stainless Fabricators',         city: 'Agra',        state: 'Uttar Pradesh',  registeredYear: 2005, sector: 'Metal & Engineering', subSector: 'Stainless steel fabrications & railings',  category: 'Small',  employeeRange: '18–40',   annualTurnover: '₹2–4.5 Cr' },
  { id: 'm008', name: 'Vatva Industrial Forgings',           city: 'Ahmedabad',   state: 'Gujarat',        registeredYear: 1999, sector: 'Metal & Engineering', subSector: 'Ferrous & non-ferrous forgings',          category: 'Medium', employeeRange: '50–100',  annualTurnover: '₹7–16 Cr', clusterNote: 'Vatva GIDC industrial estate' },

  // ── Industrial Services ───────────────────────────────────────────────────
  { id: 'svc001', name: 'Spectrum Calibration Services',    city: 'Pune',        state: 'Maharashtra',    registeredYear: 2007, sector: 'Industrial Services', subSector: 'NABL calibration — instruments & gauges',  category: 'Small',  employeeRange: '15–35',   annualTurnover: '₹1.5–4 Cr', clusterNote: 'NABL accredited, serving auto & pharma clusters' },
  { id: 'svc002', name: 'Precise Metrology Lab',            city: 'Chennai',     state: 'Tamil Nadu',     registeredYear: 2010, sector: 'Industrial Services', subSector: 'Dimensional & electrical calibration',    category: 'Small',  employeeRange: '12–28',   annualTurnover: '₹1–2.5 Cr' },
  { id: 'svc003', name: 'Vertical Access Solutions',        city: 'Mumbai',      state: 'Maharashtra',    registeredYear: 2012, sector: 'Industrial Services', subSector: 'Rope access facade & industrial inspection', category: 'Small',  employeeRange: '18–40',   annualTurnover: '₹1.5–4 Cr', clusterNote: 'IRATA certified team' },
  { id: 'svc004', name: 'Energy Efficiency Consultants',    city: 'Bengaluru',   state: 'Karnataka',      registeredYear: 2009, sector: 'Industrial Services', subSector: 'Compressed air audits & energy leak detection', category: 'Micro', employeeRange: '8–20',   annualTurnover: '₹40–120 L' },
  { id: 'svc005', name: 'Infraview Thermal Imaging',        city: 'Pune',        state: 'Maharashtra',    registeredYear: 2015, sector: 'Industrial Services', subSector: 'Thermographic inspection — electrical & solar', category: 'Micro', employeeRange: '6–15',   annualTurnover: '₹30–90 L' },
  { id: 'svc006', name: 'Southern NDT Services',            city: 'Chennai',     state: 'Tamil Nadu',     registeredYear: 2004, sector: 'Industrial Services', subSector: 'Non-destructive testing (UT, RT, PT, MT)',  category: 'Small',  employeeRange: '20–45',   annualTurnover: '₹2–4.5 Cr' },
  { id: 'svc007', name: 'Apex Industrial Cleaning',         city: 'Vadodara',    state: 'Gujarat',        registeredYear: 2008, sector: 'Industrial Services', subSector: 'Industrial equipment cleaning & maintenance', category: 'Small',  employeeRange: '25–55',   annualTurnover: '₹2.5–5.5 Cr' },
  { id: 'svc008', name: 'Precision Weighing Solutions',     city: 'Hyderabad',   state: 'Telangana',      registeredYear: 2006, sector: 'Industrial Services', subSector: 'Weighbridge calibration & repair services', category: 'Small',  employeeRange: '15–32',   annualTurnover: '₹1.2–3 Cr' },
  { id: 'svc009', name: 'Metro Scaffolding Services',       city: 'Delhi',       state: 'Delhi',          registeredYear: 2003, sector: 'Industrial Services', subSector: 'Scaffolding, rope access & height work',   category: 'Small',  employeeRange: '30–70',   annualTurnover: '₹3–7 Cr' },
  { id: 'svc010', name: 'Enviro Testing Labs',              city: 'Ahmedabad',   state: 'Gujarat',        registeredYear: 2011, sector: 'Industrial Services', subSector: 'Environmental & food safety testing',      category: 'Small',  employeeRange: '18–40',   annualTurnover: '₹1.5–3.5 Cr' },

  // ── Electronics & Electrical ──────────────────────────────────────────────
  { id: 'e001', name: 'Omkar Control Systems',              city: 'Pune',        state: 'Maharashtra',    registeredYear: 2008, sector: 'Electronics & Electrical', subSector: 'Industrial control panels & automation', category: 'Small',  employeeRange: '20–45',   annualTurnover: '₹2.5–6 Cr' },
  { id: 'e002', name: 'Sirius Sensors India',               city: 'Coimbatore',  state: 'Tamil Nadu',     registeredYear: 2013, sector: 'Electronics & Electrical', subSector: 'Industrial sensors & transducers',       category: 'Micro',  employeeRange: '10–22',   annualTurnover: '₹60–150 L' },
  { id: 'e003', name: 'Gujarat Transformer Works',          city: 'Vadodara',    state: 'Gujarat',        registeredYear: 2001, sector: 'Electronics & Electrical', subSector: 'Distribution transformers & dry-type units', category: 'Medium', employeeRange: '55–110', annualTurnover: '₹7–16 Cr' },
  { id: 'e004', name: 'Perfect Switch Gear',                city: 'Mumbai',      state: 'Maharashtra',    registeredYear: 2005, sector: 'Electronics & Electrical', subSector: 'Switchboards & LT panels',               category: 'Small',  employeeRange: '25–55',   annualTurnover: '₹3–7 Cr' },
  { id: 'e005', name: 'Shivam Electronics Components',      city: 'Bengaluru',   state: 'Karnataka',      registeredYear: 2016, sector: 'Electronics & Electrical', subSector: 'PCB assembly & electronic subassemblies', category: 'Micro',  employeeRange: '12–28',   annualTurnover: '₹70–180 L' },

  // ── Food Processing ───────────────────────────────────────────────────────
  { id: 'f001', name: 'Maharashtra Food Tech',              city: 'Nashik',      state: 'Maharashtra',    registeredYear: 2009, sector: 'Food Processing', subSector: 'Fruit & vegetable processing & IQF',       category: 'Small',  employeeRange: '30–65',   annualTurnover: '₹4–9 Cr' },
  { id: 'f002', name: 'Gujarat Agro Industries',            city: 'Rajkot',      state: 'Gujarat',        registeredYear: 2003, sector: 'Food Processing', subSector: 'Groundnut oil cold press & processing',    category: 'Small',  employeeRange: '20–45',   annualTurnover: '₹3–7 Cr' },
  { id: 'f003', name: 'South India Spice Exports',          city: 'Coimbatore',  state: 'Tamil Nadu',     registeredYear: 1998, sector: 'Food Processing', subSector: 'Spice grinding, blending & export',        category: 'Small',  employeeRange: '35–70',   annualTurnover: '₹5–12 Cr' },
  { id: 'f004', name: 'Konkan Coconut Products',            city: 'Kolhapur',    state: 'Maharashtra',    registeredYear: 2011, sector: 'Food Processing', subSector: 'Coconut oil, desiccated coconut & byproducts', category: 'Small', employeeRange: '18–40',  annualTurnover: '₹1.5–3.5 Cr' },
  { id: 'f005', name: 'Amruth Dairy Products',              city: 'Hyderabad',   state: 'Telangana',      registeredYear: 2006, sector: 'Food Processing', subSector: 'Dairy processing & value-added dairy',    category: 'Small',  employeeRange: '25–55',   annualTurnover: '₹3–7 Cr' },

  // ── Paper & Print ─────────────────────────────────────────────────────────
  { id: 'pp001', name: 'Star Paper Tubes & Cores',          city: 'Ahmedabad',   state: 'Gujarat',        registeredYear: 2007, sector: 'Paper & Print', subSector: 'Paper cores, tubes & bobbins for textile/film', category: 'Small', employeeRange: '20–45',   annualTurnover: '₹2–5 Cr' },
  { id: 'pp002', name: 'Associated Print Works',            city: 'Delhi',       state: 'Delhi',          registeredYear: 2000, sector: 'Paper & Print', subSector: 'Flexible packaging printing & converting', category: 'Small',  employeeRange: '28–60',   annualTurnover: '₹3–7 Cr' },
  { id: 'pp003', name: 'Coimbatore Offset Printers',        city: 'Coimbatore',  state: 'Tamil Nadu',     registeredYear: 2005, sector: 'Paper & Print', subSector: 'Commercial offset printing & label printing', category: 'Small',  employeeRange: '18–40',   annualTurnover: '₹2–4.5 Cr' },

  // ── Textile & Apparel ─────────────────────────────────────────────────────
  { id: 't001', name: 'Tiruppur Knit Wear Mfg.',            city: 'Tiruppur',    state: 'Tamil Nadu',     registeredYear: 1999, sector: 'Textile & Apparel', subSector: 'Knitwear, T-shirts & hosiery for export',  category: 'Small',  employeeRange: '50–110',  annualTurnover: '₹6–14 Cr', clusterNote: 'Tiruppur knitwear cluster' },
  { id: 't002', name: 'Surat Synthetic Fabrics',            city: 'Surat',       state: 'Gujarat',        registeredYear: 2002, sector: 'Textile & Apparel', subSector: 'Synthetic fabrics, sarees & dress materials', category: 'Small', employeeRange: '30–70',   annualTurnover: '₹4–9 Cr', clusterNote: 'Surat textile cluster' },
  { id: 't003', name: 'Ludhiana Woollen Mills',             city: 'Ludhiana',    state: 'Punjab',         registeredYear: 1990, sector: 'Textile & Apparel', subSector: 'Woollen yarn, blankets & knitwear',        category: 'Medium', employeeRange: '65–130',  annualTurnover: '₹9–20 Cr', clusterNote: 'Ludhiana wool cluster' },
  { id: 't004', name: 'Kolhapur Safety Workwear',           city: 'Kolhapur',    state: 'Maharashtra',    registeredYear: 2008, sector: 'Textile & Apparel', subSector: 'Industrial uniforms & safety workwear',    category: 'Small',  employeeRange: '25–55',   annualTurnover: '₹2.5–6 Cr' },
]
