export interface License {
  id: string
  name: string
  authority: string
  level: 'central' | 'state' | 'local'
  mandatory: boolean
  feeMin: number      // INR
  feeMax: number      // INR
  processingDays: number
  renewalYears: number
  link?: string
  notes: string
}

export interface BusinessType {
  id: string
  label: string
  icon: string
  description: string
  setupCostMin: number   // rough one-time INR
  setupCostMax: number
  licenses: License[]
}

// Sources: MCA portal, FSSAI portal, state PCB websites, StartupIndia compliance tracker,
// Udyog Aadhaar portal, CPCB, BEE, CEA — fees verified Oct 2023.
export const BUSINESS_TYPES: BusinessType[] = [
  // ── RESTAURANT / QSR ──────────────────────────────────────────────────────
  {
    id: 'restaurant',
    label: 'Restaurant / QSR',
    icon: '🍽️',
    description: 'Dine-in restaurant, quick-service outlet, dhaba, or food court stall.',
    setupCostMin: 500000,
    setupCostMax: 3000000,
    licenses: [
      { id: 'fssai-state', name: 'FSSAI State License', authority: 'Food Safety & Standards Authority of India (FSSAI)', level: 'central', mandatory: true, feeMin: 2000, feeMax: 5000, processingDays: 30, renewalYears: 1, link: 'https://foscos.fssai.gov.in', notes: 'Required if annual turnover ₹12L–₹20Cr. Registration (₹100) for turnover <₹12L.' },
      { id: 'trade-license', name: 'Trade / Shops & Establishment License', authority: 'Municipal Corporation / Gram Panchayat', level: 'local', mandatory: true, feeMin: 500, feeMax: 5000, processingDays: 7, renewalYears: 1, notes: 'Fee varies by city tier and floor area. Apply at local ward office or state\'s e-Nagar portal.' },
      { id: 'gst', name: 'GST Registration', authority: 'GST Council / GSTN', level: 'central', mandatory: false, feeMin: 0, feeMax: 0, processingDays: 7, renewalYears: 0, link: 'https://www.gst.gov.in', notes: 'Mandatory if projected annual turnover >₹20L (₹10L for North-East states). Free to register online.' },
      { id: 'eating-house', name: 'Eating House License (Police)', authority: 'State Police / Commissioner of Police', level: 'state', mandatory: true, feeMin: 500, feeMax: 3000, processingDays: 14, renewalYears: 1, notes: 'Required in most states. Delhi: ₹200–₹500. Maharashtra: ₹1,000–₹2,500. Tamil Nadu: exempted for many categories.' },
      { id: 'fire-noc', name: 'Fire Safety NOC', authority: 'State Fire & Emergency Services', level: 'state', mandatory: true, feeMin: 500, feeMax: 5000, processingDays: 21, renewalYears: 1, notes: 'Mandatory for area >50 sqm or above ground floor. Requires fire extinguishers and exit signage.' },
      { id: 'health-trade', name: 'Health Trade License', authority: 'Municipal Health Department', level: 'local', mandatory: true, feeMin: 500, feeMax: 3000, processingDays: 14, renewalYears: 1, notes: 'Separate from trade license in most metros. Inspector visit required for larger units.' },
      { id: 'liquor', name: 'Liquor License (if serving alcohol)', authority: 'State Excise Department', level: 'state', mandatory: false, feeMin: 50000, feeMax: 500000, processingDays: 60, renewalYears: 1, notes: 'Optional. Costs vary drastically by state: Goa ₹5,000, Maharashtra ₹50,000+, Delhi ₹100,000+. Dry states: not available.' },
      { id: 'music-prs', name: 'Music License (IPRS / PPL)', authority: 'Indian Performing Rights Society / Phonographic Performance Ltd', level: 'central', mandatory: false, feeMin: 5000, feeMax: 20000, processingDays: 7, renewalYears: 1, notes: 'Required if playing recorded music. IPRs (live composition rights) + PPL (master recording rights). Online application.' },
      { id: 'udyam', name: 'Udyam / MSME Registration', authority: 'Ministry of MSME', level: 'central', mandatory: false, feeMin: 0, feeMax: 0, processingDays: 1, renewalYears: 0, link: 'https://udyamregistration.gov.in', notes: 'Free, self-declared. Unlocks priority lending, govt scheme eligibility, lower power tariffs in many states.' },
    ],
  },

  // ── CLOUD KITCHEN ─────────────────────────────────────────────────────────
  {
    id: 'cloud-kitchen',
    label: 'Cloud Kitchen',
    icon: '🍳',
    description: 'Delivery-only kitchen with no dine-in, running one or more food brands.',
    setupCostMin: 300000,
    setupCostMax: 1500000,
    licenses: [
      { id: 'fssai-state', name: 'FSSAI State License', authority: 'FSSAI', level: 'central', mandatory: true, feeMin: 2000, feeMax: 5000, processingDays: 30, renewalYears: 1, notes: 'Same as restaurant. Each brand operated from same kitchen is covered under one license.' },
      { id: 'trade-license', name: 'Trade / Shops & Establishment License', authority: 'Municipal Corporation', level: 'local', mandatory: true, feeMin: 500, feeMax: 3000, processingDays: 7, renewalYears: 1, notes: 'Some cities allow self-declaration online; others require physical inspection.' },
      { id: 'gst', name: 'GST Registration', authority: 'GSTN', level: 'central', mandatory: false, feeMin: 0, feeMax: 0, processingDays: 7, renewalYears: 0, notes: 'Mandatory if turnover >₹20L. Swiggy/Zomato require GSTIN for restaurant partner onboarding.' },
      { id: 'fire-noc', name: 'Fire Safety NOC', authority: 'State Fire Services', level: 'state', mandatory: true, feeMin: 500, feeMax: 3000, processingDays: 14, renewalYears: 1, notes: 'Required if kitchen uses LPG above a threshold or occupies >50 sqm. Check local fire office norms.' },
      { id: 'pfa', name: 'Prevention of Food Adulteration Compliance', authority: 'Food Safety Officer (State)', level: 'state', mandatory: true, feeMin: 0, feeMax: 0, processingDays: 0, renewalYears: 0, notes: 'No separate registration needed — covered by FSSAI license. Maintain hygiene records for periodic inspection.' },
      { id: 'udyam', name: 'Udyam Registration', authority: 'Ministry of MSME', level: 'central', mandatory: false, feeMin: 0, feeMax: 0, processingDays: 1, renewalYears: 0, notes: 'Recommended — enables MUDRA loans, priority credit, and state subsidy schemes for food processing.' },
    ],
  },

  // ── PHARMACY ──────────────────────────────────────────────────────────────
  {
    id: 'pharmacy',
    label: 'Pharmacy / Medical Store',
    icon: '💊',
    description: 'Retail pharmacy or chemist shop dispensing prescription and OTC drugs.',
    setupCostMin: 400000,
    setupCostMax: 1500000,
    licenses: [
      { id: 'drug-license-20', name: 'Drug License — Form 20 (Retail)', authority: 'State Drug Controller / CDSCO', level: 'state', mandatory: true, feeMin: 3000, feeMax: 8000, processingDays: 45, renewalYears: 5, link: 'https://cdscoonline.gov.in', notes: 'Requires a registered pharmacist (B.Pharm/D.Pharm) on premises. Separate Form 21 needed for wholesale. Premises >10 sqm. Fee varies by state.' },
      { id: 'drug-license-21b', name: 'Drug License — Form 21B (Schedule X Drugs)', authority: 'State Drug Controller', level: 'state', mandatory: false, feeMin: 1500, feeMax: 5000, processingDays: 30, renewalYears: 5, notes: 'Required if stocking psychotropic or habit-forming drugs (Schedule X). Requires separate storage and register maintenance.' },
      { id: 'trade-license', name: 'Trade / Shops & Establishment License', authority: 'Municipal Corporation', level: 'local', mandatory: true, feeMin: 500, feeMax: 3000, processingDays: 7, renewalYears: 1, notes: 'Standard trade license from local municipal body.' },
      { id: 'gst', name: 'GST Registration', authority: 'GSTN', level: 'central', mandatory: false, feeMin: 0, feeMax: 0, processingDays: 7, renewalYears: 0, notes: 'Required if turnover >₹20L. Most pharmacies cross this threshold quickly.' },
      { id: 'fssai-basic', name: 'FSSAI Basic Registration (for nutraceuticals)', authority: 'FSSAI', level: 'central', mandatory: false, feeMin: 100, feeMax: 2000, processingDays: 7, renewalYears: 1, notes: 'Needed if you sell protein supplements, vitamins, or health foods. Many pharmas skip this and risk penalties.' },
      { id: 'pharmacist-registration', name: 'Pharmacist Registration (Staff)', authority: 'State Pharmacy Council', level: 'state', mandatory: true, feeMin: 1000, feeMax: 3000, processingDays: 30, renewalYears: 5, notes: 'At least one registered pharmacist must be present during working hours. Registration fee per person.' },
    ],
  },

  // ── GYM / FITNESS ────────────────────────────────────────────────────────
  {
    id: 'gym',
    label: 'Gym & Fitness Studio',
    icon: '🏋️',
    description: 'Commercial gym, yoga studio, crossfit box, or mixed fitness center.',
    setupCostMin: 800000,
    setupCostMax: 5000000,
    licenses: [
      { id: 'trade-license', name: 'Trade / Shops & Establishment License', authority: 'Municipal Corporation', level: 'local', mandatory: true, feeMin: 500, feeMax: 3000, processingDays: 7, renewalYears: 1, notes: 'Standard license. Some municipalities have a separate "Health Club" category with higher fees.' },
      { id: 'gst', name: 'GST Registration', authority: 'GSTN', level: 'central', mandatory: false, feeMin: 0, feeMax: 0, processingDays: 7, renewalYears: 0, notes: 'Fitness services attract 18% GST. Mandatory if revenue >₹20L/year.' },
      { id: 'fire-noc', name: 'Fire Safety NOC', authority: 'State Fire Services', level: 'state', mandatory: true, feeMin: 500, feeMax: 5000, processingDays: 21, renewalYears: 1, notes: 'Required for commercial spaces. Fire exit routes, extinguishers, and sprinkler system (if >300 sqm) are prerequisites.' },
      { id: 'health-club', name: 'Health Club License (select states/cities)', authority: 'Municipal Health Dept / Tourism Dept', level: 'local', mandatory: false, feeMin: 2000, feeMax: 15000, processingDays: 21, renewalYears: 1, notes: 'Required in some cities (Bengaluru, Chennai). Involves premises inspection. Check local municipal norms before opening.' },
      { id: 'music-prs', name: 'Music License (IPRS / PPL)', authority: 'IPRS & Phonographic Performance Ltd', level: 'central', mandatory: false, feeMin: 5000, feeMax: 15000, processingDays: 7, renewalYears: 1, notes: 'Required if playing music during sessions. Annual fee based on floor area and number of screens.' },
      { id: 'udyam', name: 'Udyam Registration', authority: 'Ministry of MSME', level: 'central', mandatory: false, feeMin: 0, feeMax: 0, processingDays: 1, renewalYears: 0, notes: 'Free. Useful for availing NSIC marketing support and lower-rate term loans for equipment finance.' },
    ],
  },

  // ── DIAGNOSTIC LAB ────────────────────────────────────────────────────────
  {
    id: 'diagnostic-lab',
    label: 'Diagnostic Lab',
    icon: '🔬',
    description: 'Pathology lab, imaging center, or multi-specialty diagnostic center.',
    setupCostMin: 1000000,
    setupCostMax: 10000000,
    licenses: [
      { id: 'cpe-act', name: 'Clinical Establishments Registration (CEA)', authority: 'State Health Dept / National Accreditation Board for Hospitals', level: 'state', mandatory: true, feeMin: 5000, feeMax: 25000, processingDays: 60, renewalYears: 3, link: 'https://coa.gov.in', notes: 'Mandatory under Clinical Establishments Act 2010 (adopted by most states). Fee by number of employees / bed count. Premises inspection required.' },
      { id: 'bmwm', name: 'Bio-Medical Waste Management Authorization', authority: 'State Pollution Control Board', level: 'state', mandatory: true, feeMin: 2000, feeMax: 10000, processingDays: 30, renewalYears: 1, notes: 'Mandatory under BMW Management Rules 2016. Must tie up with CBWTF (Common Bio-Medical Waste Treatment Facility) operator.' },
      { id: 'aerb', name: 'AERB Approval (for X-Ray / CT / Radiation)', authority: 'Atomic Energy Regulatory Board (AERB)', level: 'central', mandatory: false, feeMin: 5000, feeMax: 20000, processingDays: 45, renewalYears: 5, link: 'https://eiraweb.aerb.gov.in', notes: 'Mandatory if operating X-Ray, CT, mammography, or bone densitometry equipment. Radiation Safety Officer designation required.' },
      { id: 'pcpndt', name: 'PCPNDT Registration (Ultrasound for Pregnancy)', authority: 'District Appropriate Authority / State Health Dept', level: 'state', mandatory: false, feeMin: 500, feeMax: 2000, processingDays: 30, renewalYears: 5, notes: 'Mandatory if any ultrasound device is used for obstetric/gynaecological scanning. Strict record-keeping of Form F for every scan.' },
      { id: 'nabl', name: 'NABL Accreditation (optional but preferred)', authority: 'National Accreditation Board for Testing & Calibration Laboratories', level: 'central', mandatory: false, feeMin: 50000, feeMax: 200000, processingDays: 180, renewalYears: 2, link: 'https://www.nabl-india.org', notes: 'Not mandatory but highly recommended. Unlocks empanelment with CGHS, ECHS, insurance panels, and large corporate wellness contracts.' },
      { id: 'trade-license', name: 'Trade / Shops & Establishment License', authority: 'Municipal Corporation', level: 'local', mandatory: true, feeMin: 500, feeMax: 5000, processingDays: 7, renewalYears: 1, notes: 'Standard local license.' },
      { id: 'gst', name: 'GST Registration', authority: 'GSTN', level: 'central', mandatory: false, feeMin: 0, feeMax: 0, processingDays: 7, renewalYears: 0, notes: 'Diagnostic services are currently exempt from GST but B2B lab contracts (corporate) attract 18% on the service portion. Registration recommended.' },
    ],
  },

  // ── EV CHARGING STATION ────────────────────────────────────────────────────
  {
    id: 'ev-charging',
    label: 'EV Charging Station',
    icon: '⚡',
    description: 'Public or semi-public EV charging point — residential complex, highway, or commercial hub.',
    setupCostMin: 200000,
    setupCostMax: 3000000,
    licenses: [
      { id: 'cea-compliance', name: 'CEA Compliance (Electrical Installation)', authority: 'Central Electricity Authority (CEA)', level: 'central', mandatory: true, feeMin: 0, feeMax: 0, processingDays: 7, renewalYears: 0, link: 'https://cea.nic.in', notes: 'EV charging stations are de-licensed as a service under 2022 SOP. Must comply with CEA (Measures Relating to Safety) Regulations. No license fee — self-compliance.' },
      { id: 'discom-load', name: 'Electricity Load Sanction (DISCOM)', authority: 'State Distribution Company (DISCOM)', level: 'state', mandatory: true, feeMin: 10000, feeMax: 100000, processingDays: 30, renewalYears: 0, notes: 'One-time load enhancement application. Commercial tariff applies. Fast chargers (50kW+) need 3-phase HT connection. Cost depends on load and transformer capacity addition.' },
      { id: 'trade-license', name: 'Trade / Shops & Establishment License', authority: 'Municipal Corporation', level: 'local', mandatory: true, feeMin: 500, feeMax: 2000, processingDays: 7, renewalYears: 1, notes: 'Required for commercial operations at the charging site. Some states are integrating this into single-window EV portals.' },
      { id: 'fire-noc', name: 'Fire Safety NOC', authority: 'State Fire Services', level: 'state', mandatory: false, feeMin: 500, feeMax: 5000, processingDays: 21, renewalYears: 1, notes: 'Required for large stations with battery storage (BESS) or covered parking structures. Not required for small AC chargers on open plots.' },
      { id: 'gst', name: 'GST Registration', authority: 'GSTN', level: 'central', mandatory: false, feeMin: 0, feeMax: 0, processingDays: 7, renewalYears: 0, notes: 'GST on EV charging is 5% (as electricity supply) if charging facility is the core service. Mixed-use stations may attract 18% on the service component.' },
      { id: 'bee-star', name: 'BEE Star Rating (Charging Equipment)', authority: 'Bureau of Energy Efficiency (BEE)', level: 'central', mandatory: true, feeMin: 0, feeMax: 0, processingDays: 0, renewalYears: 0, notes: 'Equipment must carry BEE star rating. Applicable to AC slow chargers. Responsibility of equipment manufacturer — verify before purchase.' },
    ],
  },

  // ── FOOD MANUFACTURING ─────────────────────────────────────────────────────
  {
    id: 'food-manufacturing',
    label: 'Food Processing Unit',
    icon: '🏭',
    description: 'Small or medium food manufacturing unit — snacks, pickles, dairy, spices, packaged food.',
    setupCostMin: 500000,
    setupCostMax: 10000000,
    licenses: [
      { id: 'fssai-mfg', name: 'FSSAI Manufacturing License', authority: 'FSSAI', level: 'central', mandatory: true, feeMin: 7500, feeMax: 7500, processingDays: 60, renewalYears: 1, link: 'https://foscos.fssai.gov.in', notes: 'Annual fee ₹7,500 for manufacturing license (₹2,000 for turnover <₹12L). Additional food categories may require category-specific approvals (infant food, proprietary food, etc.).' },
      { id: 'factory-license', name: 'Factory License (Factories Act)', authority: 'State Labour / Factory Inspectorate', level: 'state', mandatory: false, feeMin: 5000, feeMax: 50000, processingDays: 45, renewalYears: 1, notes: 'Required if using power and employing ≥10 workers (or ≥20 without power). Fee calculated on HP of installed machinery. Includes worker welfare compliance.' },
      { id: 'pcb-cts', name: 'Pollution Control Board — Consent to Establish (CTE)', authority: 'State Pollution Control Board', level: 'state', mandatory: true, feeMin: 5000, feeMax: 50000, processingDays: 60, renewalYears: 5, notes: 'Needed before construction/installation. Category based on effluent/pollution potential (Green/Orange/Red). Most food units fall under Green/Orange.' },
      { id: 'pcb-cto', name: 'Pollution Control Board — Consent to Operate (CTO)', authority: 'State Pollution Control Board', level: 'state', mandatory: true, feeMin: 5000, feeMax: 25000, processingDays: 30, renewalYears: 1, notes: 'Required after CTE and before starting operations. Annual renewal. Includes effluent treatment compliance.' },
      { id: 'agmark', name: 'AGMARK Certification (for graded agricultural products)', authority: 'Directorate of Marketing & Inspection (DMI)', level: 'central', mandatory: false, feeMin: 10000, feeMax: 50000, processingDays: 60, renewalYears: 5, notes: 'Optional but required to use AGMARK logo. Boosts buyer confidence for spices, edible oils, cereals, pulses, and dairy.' },
      { id: 'udyam', name: 'Udyam Registration', authority: 'Ministry of MSME', level: 'central', mandatory: false, feeMin: 0, feeMax: 0, processingDays: 1, renewalYears: 0, notes: 'Free. Mandatory to avail PMFME scheme (50% subsidy for food processing upgrades up to ₹10L).' },
      { id: 'gst', name: 'GST Registration', authority: 'GSTN', level: 'central', mandatory: false, feeMin: 0, feeMax: 0, processingDays: 7, renewalYears: 0, notes: 'Mandatory for manufacturers. Most packaged food items attract 5–18% GST depending on category.' },
      { id: 'bis', name: 'BIS / ISI Mark (for select packaged foods)', authority: 'Bureau of Indian Standards (BIS)', level: 'central', mandatory: false, feeMin: 20000, feeMax: 100000, processingDays: 90, renewalYears: 3, notes: 'Mandatory for packaged drinking water (IS 14543), infant food, and several specific categories under BIS Compulsory Registration. Check BIS website for your product.' },
    ],
  },

  // ── EXPORT BUSINESS ────────────────────────────────────────────────────────
  {
    id: 'export',
    label: 'Export Business',
    icon: '🚢',
    description: 'Exporting goods from India — agri-products, handicrafts, textiles, processed food, chemicals.',
    setupCostMin: 100000,
    setupCostMax: 1000000,
    licenses: [
      { id: 'iec', name: 'Import Export Code (IEC)', authority: 'DGFT (Directorate General of Foreign Trade)', level: 'central', mandatory: true, feeMin: 500, feeMax: 500, processingDays: 2, renewalYears: 0, link: 'https://dgft.gov.in', notes: 'One-time ₹500 fee. Fully online in 2 working days. No physical document needed — QR code based. Linked to PAN. Mandatory for any cross-border commercial transaction.' },
      { id: 'rcmc', name: 'RCMC (Registration Cum Membership Certificate)', authority: 'Export Promotion Council (EPC) for your sector', level: 'central', mandatory: false, feeMin: 3000, feeMax: 15000, processingDays: 15, renewalYears: 5, notes: 'Apply through the relevant EPC: APEDA (agri), EEPC (engineering), TEXPROCIL (textiles), CLE (leather), etc. Needed to avail export benefits and MEIS/RoDTEP incentives.' },
      { id: 'gst', name: 'GST Registration', authority: 'GSTN', level: 'central', mandatory: true, feeMin: 0, feeMax: 0, processingDays: 7, renewalYears: 0, notes: 'Mandatory for exporters. Export is zero-rated under GST — you can claim refund of input tax credits on inputs used in production for export.' },
      { id: 'ad-code', name: 'AD Code Registration (Bank)', authority: 'Authorized Dealer Bank', level: 'central', mandatory: true, feeMin: 0, feeMax: 0, processingDays: 2, renewalYears: 0, notes: 'Your bank\'s AD (Authorized Dealer) code must be linked to your customs port of export. Needed for filing shipping bills. Free, done at your bank.' },
      { id: 'apeda', name: 'APEDA Registration (Agri-food exporters)', authority: 'Agricultural & Processed Food Export Development Authority', level: 'central', mandatory: false, feeMin: 5000, feeMax: 5000, processingDays: 15, renewalYears: 5, link: 'https://www.apeda.gov.in', notes: 'Required for all exporters of scheduled APEDA products (fresh fruits, vegetables, processed food, cereals, animal products). Enables APEDA grant schemes.' },
      { id: 'fssai-export', name: 'FSSAI Export-Oriented Unit Registration', authority: 'FSSAI', level: 'central', mandatory: false, feeMin: 7500, feeMax: 7500, processingDays: 45, renewalYears: 1, notes: 'Required if exporting processed food. Importers in USA, EU, and UK increasingly require FSSAI certificates.' },
      { id: 'iso-haccp', name: 'ISO 22000 / HACCP / GMP Certification', authority: 'Accredited Certification Bodies (BIS, SGS, TUV, etc.)', level: 'central', mandatory: false, feeMin: 50000, feeMax: 200000, processingDays: 90, renewalYears: 3, notes: 'Not legally mandatory but often required by importers (especially EU, USA, Japan). BRC certification needed for UK supermarket supply chains.' },
    ],
  },

  // ── COACHING CENTER ────────────────────────────────────────────────────────
  {
    id: 'coaching',
    label: 'Coaching / Tutoring Center',
    icon: '📚',
    description: 'K-12 tuition center, competitive exam coaching, or skill training institute.',
    setupCostMin: 200000,
    setupCostMax: 2000000,
    licenses: [
      { id: 'trade-license', name: 'Trade / Shops & Establishment License', authority: 'Municipal Corporation', level: 'local', mandatory: true, feeMin: 500, feeMax: 3000, processingDays: 7, renewalYears: 1, notes: 'Basic operating license. Listed under "Educational Institution" in most municipal records.' },
      { id: 'gst', name: 'GST Registration', authority: 'GSTN', level: 'central', mandatory: false, feeMin: 0, feeMax: 0, processingDays: 7, renewalYears: 0, notes: 'Educational services are GST-exempt up to pre-university level. Competitive exam coaching (JEE/NEET/IAS) attracts 18% GST. Registration needed if taxable revenue >₹20L.' },
      { id: 'fire-noc', name: 'Fire Safety NOC', authority: 'State Fire Services', level: 'state', mandatory: false, feeMin: 500, feeMax: 3000, processingDays: 14, renewalYears: 1, notes: 'Required for premises with >50 students or in a multi-storey building. Fire exits and extinguishers required.' },
      { id: 'rajasthan-coaching', name: 'Coaching Centre Regulation Act Registration (Rajasthan / UP)', authority: 'State Education Dept', level: 'state', mandatory: false, feeMin: 1000, feeMax: 5000, processingDays: 30, renewalYears: 1, notes: 'Rajasthan & some other states have enacted coaching regulation laws post Kota incidents. Mandatory if operating in these states. Refund policy and safety norms are prescribed.' },
      { id: 'nsdc', name: 'NSDC / PMKVY Affiliation (for skill courses)', authority: 'National Skill Development Corporation', level: 'central', mandatory: false, feeMin: 10000, feeMax: 50000, processingDays: 45, renewalYears: 2, notes: 'Optional but enables PMKVY government-funded batch training and placement-linked payouts.' },
    ],
  },

  // ── SALON ─────────────────────────────────────────────────────────────────
  {
    id: 'salon',
    label: 'Salon & Beauty Parlour',
    icon: '💇',
    description: 'Unisex salon, barber shop, beauty parlour, or nail/spa studio.',
    setupCostMin: 200000,
    setupCostMax: 1500000,
    licenses: [
      { id: 'trade-license', name: 'Trade / Shops & Establishment License', authority: 'Municipal Corporation', level: 'local', mandatory: true, feeMin: 500, feeMax: 2000, processingDays: 7, renewalYears: 1, notes: 'Listed under "Personal Care Services." Some municipalities have a separate beauty parlour category with minor additional fee.' },
      { id: 'gst', name: 'GST Registration', authority: 'GSTN', level: 'central', mandatory: false, feeMin: 0, feeMax: 0, processingDays: 7, renewalYears: 0, notes: 'Beauty & grooming services attract 18% GST. Mandatory if revenue >₹20L/year.' },
      { id: 'health-trade', name: 'Health Trade License', authority: 'Municipal Health Dept', level: 'local', mandatory: false, feeMin: 500, feeMax: 2000, processingDays: 14, renewalYears: 1, notes: 'Required in most metro corporations. Inspectors check hygiene: sanitized tools, clean linens, waste disposal.' },
      { id: 'fire-noc', name: 'Fire Safety NOC', authority: 'State Fire Services', level: 'state', mandatory: false, feeMin: 500, feeMax: 2000, processingDays: 14, renewalYears: 1, notes: 'Required for premises >50 sqm or in multi-storey buildings. Fire extinguisher on site needed.' },
      { id: 'fssai-basic', name: 'FSSAI (if selling food/wellness drinks)', authority: 'FSSAI', level: 'central', mandatory: false, feeMin: 100, feeMax: 2000, processingDays: 7, renewalYears: 1, notes: 'Only if salon also serves health drinks, protein bars, or wellness shots. Most salons skip this.' },
    ],
  },
]

export function getTotalCost(bt: BusinessType): { min: number; max: number } {
  const licMin = bt.licenses.reduce((s, l) => s + l.feeMin, 0)
  const licMax = bt.licenses.reduce((s, l) => s + l.feeMax, 0)
  return { min: bt.setupCostMin + licMin, max: bt.setupCostMax + licMax }
}

export function getMandatoryLicenses(bt: BusinessType): License[] {
  return bt.licenses.filter(l => l.mandatory)
}

export function getTotalProcessingDays(licenses: License[]): number {
  // Licenses processed in parallel where possible; bottleneck is the longest serial dependency
  const central = licenses.filter(l => l.level === 'central').map(l => l.processingDays)
  const state   = licenses.filter(l => l.level === 'state').map(l => l.processingDays)
  const local   = licenses.filter(l => l.level === 'local').map(l => l.processingDays)
  const maxCentral = central.length ? Math.max(...central) : 0
  const maxState   = state.length   ? Math.max(...state)   : 0
  const maxLocal   = local.length   ? Math.max(...local)   : 0
  // Conservative: central + state (often sequential); local is parallel
  return maxCentral + maxState + Math.max(maxLocal - 14, 0)
}
