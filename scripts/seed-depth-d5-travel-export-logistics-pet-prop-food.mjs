import { createClient } from '@sanity/client'
import { randomBytes } from 'crypto'
import { readFileSync } from 'fs'
import { homedir } from 'os'

const cfg = JSON.parse(readFileSync(`${homedir()}/.config/sanity/config.json`, 'utf8'))
const client = createClient({ projectId: '5p3rso81', dataset: 'production', apiVersion: '2024-01-01', token: cfg.authToken, useCdn: false })

const k = () => randomBytes(6).toString('hex')

const DATA = {
  // ── Travel ───────────────────────────────────────────────────────────────────
  'accessible-tourism-platform-differently-abled': {
    google_trends_keyword: 'accessible travel India disability',
    unit_economics: { cac: 3000, ltv: 24000, ltv_cac_ratio: 8.0, avg_order_value: 8000, churn_rate: 20, payback_period: 8, context: 'Commission 10–15% on bookings; avg accessible trip ₹15,000–₹80,000; CSR partnerships from corporates fund early growth.' },
    competitors: [
      { name: 'Accessible India (Govt)', type: 'Government', description: 'Govt accessibility initiative; not a booking platform.' },
      { name: 'HandyTrip', type: 'Global', description: 'Wheelchair travel platform; no India-specific inventory.' },
      { name: 'Special Needs Group', type: 'US Company', description: 'Accessible cruise + travel; no India operations.' },
    ],
  },
  'adventure-experiential-tourism-aggregator': {
    google_trends_keyword: 'adventure tourism India',
    unit_economics: { cac: 2000, ltv: 20000, ltv_cac_ratio: 10.0, avg_order_value: 8000, churn_rate: 25, payback_period: 7, context: 'Commission 15–20% on activities; avg adventure experience ₹3,000–₹25,000; repeat season customers are high-LTV.' },
    competitors: [
      { name: 'Thrillophilia', type: 'Indian Startup', description: 'Experience travel marketplace; Series A, 10,000+ activities.' },
      { name: 'Tripoto', type: 'Indian Startup', description: 'Travel community + bookings; Series B.' },
      { name: 'Airbnb Experiences', type: 'Global', description: 'Curated local experiences; India coverage thin.' },
    ],
  },
  'budget-hotel-property-management-saas': {
    google_trends_keyword: 'hotel management software India',
    unit_economics: { cac: 5000, ltv: 60000, ltv_cac_ratio: 12.0, avg_order_value: 20000, churn_rate: 12, payback_period: 8, context: 'Annual SaaS ₹12,000–₹30,000; channel manager + front desk + revenue management bundle creates high switching cost.' },
    competitors: [
      { name: 'Hotelogix', type: 'Indian Startup', description: 'Cloud PMS for budget hotels; Series A, 10,000+ properties.' },
      { name: 'eZee Technosys', type: 'Indian Startup', description: 'Hotel management software; Surat-based, global reach.' },
      { name: 'RMS Cloud', type: 'Global', description: 'Property management; expensive for budget India hotels.' },
    ],
  },
  'co-living-space-network-digital-nomads': {
    google_trends_keyword: 'co-living space India',
    unit_economics: { cac: 3000, ltv: 30000, ltv_cac_ratio: 10.0, avg_order_value: 15000, churn_rate: 20, payback_period: 7, context: 'Monthly rent ₹8,000–₹25,000; Goa and Bengaluru are primary markets; 6–12 month stays from remote workers.' },
    competitors: [
      { name: 'Stanza Living', type: 'Indian Startup', description: 'Co-living for students + professionals; Series D.' },
      { name: 'CoLive', type: 'Indian Startup', description: 'Managed co-living; Bengaluru-first, Series B.' },
      { name: 'Zostel', type: 'Indian Startup', description: 'Hostel network; strong in traveller community.' },
    ],
  },
  'corporate-travel-management-saas-smes': {
    google_trends_keyword: 'corporate travel management software India',
    unit_economics: { cac: 20000, ltv: 200000, ltv_cac_ratio: 10.0, avg_order_value: 60000, churn_rate: 15, payback_period: 10, context: 'Annual SaaS ₹30,000–₹2L; SMEs 50–500 employees spend ₹50L–₹5Cr on travel; savings pitch drives adoption.' },
    competitors: [
      { name: 'Happay (CRED)', type: 'Indian Startup', description: 'Corporate travel + expense management; Series C.' },
      { name: 'itilite', type: 'Indian Startup', description: 'AI travel management for corporates; Series B.' },
      { name: 'Concur (SAP)', type: 'Global', description: 'Enterprise travel management; too expensive for SMEs.' },
    ],
  },
  'ev-charging-network-highways': {
    google_trends_keyword: 'EV highway charging India',
    unit_economics: { cac: 100000, ltv: 1000000, ltv_cac_ratio: 10.0, avg_order_value: 200000, churn_rate: 8, payback_period: 14, context: 'Revenue per charge point ₹3,000–₹8,000/month; highway nodes need 20+ EVs/day at 30–50% utilisation for viability.' },
    competitors: [
      { name: 'Tata Power EV', type: 'Large Player', description: 'National charging network; expressway partnership model.' },
      { name: 'Ather Grid', type: 'Indian Startup', description: 'Fast charging for Ather scooters; expanding to all EVs.' },
      { name: 'Charge+Zone', type: 'Indian Startup', description: 'Highway DC fast chargers; Series C funded.' },
    ],
  },
  'luxury-train-experience-operator': {
    google_trends_keyword: 'luxury train India Palace on Wheels',
    unit_economics: { cac: 15000, ltv: 100000, ltv_cac_ratio: 6.7, avg_order_value: 80000, churn_rate: 30, payback_period: 10, context: 'Per-person ₹50,000–₹2L for 7-night journey; international tourists 60% of revenue; OTA commission 15–20%.' },
    competitors: [
      { name: 'Palace on Wheels (RTDC)', type: 'Government', description: 'Iconic luxury train; Rajasthan Tourism.' },
      { name: 'Deccan Odyssey', type: 'Government', description: 'Maharashtra luxury train; Maharashtra Tourism.' },
      { name: 'Golden Chariot', type: 'Government', description: 'Karnataka luxury train; Karnataka Tourism.' },
    ],
  },
  'medical-tourism-facilitation-platform': {
    google_trends_keyword: 'medical tourism India',
    unit_economics: { cac: 10000, ltv: 100000, ltv_cac_ratio: 10.0, avg_order_value: 50000, churn_rate: 20, payback_period: 10, context: 'Commission 5–10% of treatment value; avg medical tourist spends ₹2L–₹10L; cardiac + orthopedic highest volume.' },
    competitors: [
      { name: 'Vaidam Health', type: 'Indian Startup', description: 'Medical tourism platform; 1,000+ international patients/month.' },
      { name: 'IndianHealthGuru', type: 'Indian Platform', description: 'Medical tourism aggregator; established.' },
      { name: 'Apollo Hospitals', type: 'Large Player', description: 'Hospital chain with in-house international patient desk.' },
    ],
  },
  'pilgrimage-trip-planning-platform': {
    google_trends_keyword: 'Char Dham yatra booking India',
    unit_economics: { cac: 1500, ltv: 15000, ltv_cac_ratio: 10.0, avg_order_value: 12000, churn_rate: 20, payback_period: 7, context: 'Commission 10–15% on pilgrim packages; Char Dham, Vaishno Devi, and Tirupati each handle millions annually.' },
    competitors: [
      { name: 'IRCTC Tourism', type: 'Government', description: 'Dominant; government trust and rail integration.' },
      { name: 'SOTC Pilgrimages', type: 'Large Player', description: 'Travel company with pilgrimage vertical.' },
      { name: 'Spiritual Yatra', type: 'Indian Startup', description: 'Pilgrimage + spiritual travel; early stage.' },
    ],
  },
  'regional-language-travel-content-platform': {
    google_trends_keyword: 'Hindi travel blog India',
    unit_economics: { cac: 300, ltv: 3000, ltv_cac_ratio: 10.0, avg_order_value: 300, churn_rate: 35, payback_period: 4, context: 'Ad revenue ₹50–₹200/1,000 views; affiliate commission 5–10% on bookings; Hindi content 10x underserved vs English.' },
    competitors: [
      { name: 'Thrillophilia Blog', type: 'Indian Startup', description: 'English travel content; limited regional language.' },
      { name: 'Hindi Wikipedia Travel', type: 'Free Platform', description: 'Reference only; no booking integration.' },
      { name: 'Travel vlogs (YouTube)', type: 'Creators', description: 'Video-first; no booking monetisation.' },
    ],
  },
  'rural-homestay-network': {
    google_trends_keyword: 'rural homestay booking India',
    unit_economics: { cac: 1500, ltv: 15000, ltv_cac_ratio: 10.0, avg_order_value: 3000, churn_rate: 22, payback_period: 7, context: 'Commission 15–20% on bookings; avg rural homestay ₹1,500–₹4,000/night; repeat urban weekenders drive LTV.' },
    competitors: [
      { name: 'StayVista', type: 'Indian Startup', description: 'Premium villa + homestay network; Series B.' },
      { name: 'Airbnb India (rural)', type: 'Global', description: 'Rural listings; limited curation + local support.' },
      { name: 'Ministry of Tourism (HLP)', type: 'Government', description: 'Heritage + rural tourism schemes; not a booking platform.' },
    ],
  },
  'school-trip-educational-tour-operator': {
    google_trends_keyword: 'school trip organiser India',
    unit_economics: { cac: 5000, ltv: 50000, ltv_cac_ratio: 10.0, avg_order_value: 20000, churn_rate: 15, payback_period: 8, context: 'Per-student ₹2,000–₹8,000; school contracts for annual trips create institutional LTV; safety record is key retention driver.' },
    competitors: [
      { name: 'Edu-Trips India', type: 'Local Company', description: 'School trip specialists; offline-dominant.' },
      { name: 'SOTC School Tours', type: 'Large Player', description: 'Large travel company with school vertical.' },
      { name: 'EduMynd', type: 'Indian Startup', description: 'Educational travel startup; early stage.' },
    ],
  },
  'train-travel-companion-app': {
    google_trends_keyword: 'train travel app India',
    unit_economics: { cac: 200, ltv: 2000, ltv_cac_ratio: 10.0, avg_order_value: 150, churn_rate: 30, payback_period: 4, context: 'Freemium; premium ₹99–₹299/year; affiliate on food + hotel bookings ₹50–₹150 per booking.' },
    competitors: [
      { name: 'IRCTC Rail Connect', type: 'Government', description: 'Official app; dominant but dated UX.' },
      { name: 'Ixigo Trains', type: 'Indian Startup', description: 'Train booking + PNR status; listed on NSE.' },
      { name: 'Railofy', type: 'Indian Startup', description: 'Train insurance + travel assistant; seed funded.' },
    ],
  },
  'travel-insurance-saas-ota-corporate': {
    google_trends_keyword: 'travel insurance online India',
    unit_economics: { cac: 5000, ltv: 50000, ltv_cac_ratio: 10.0, avg_order_value: 15000, churn_rate: 18, payback_period: 8, context: 'B2B SaaS ₹3L–₹10L/year to OTAs; commission 10–20% on premium; international trip insurance avg ₹1,500–₹5,000.' },
    competitors: [
      { name: 'Cover-More India', type: 'Global', description: 'Global travel insurance; embedded in major OTAs.' },
      { name: 'Digit Insurance Travel', type: 'Indian Insurtech', description: 'Digital insurer; strong travel product.' },
      { name: 'Tata AIG Travel', type: 'Indian+Global', description: 'Travel insurance; bank + OTA partnerships.' },
    ],
  },
  'wildlife-safari-booking-platform': {
    google_trends_keyword: 'wildlife safari booking India',
    unit_economics: { cac: 2500, ltv: 25000, ltv_cac_ratio: 10.0, avg_order_value: 15000, churn_rate: 20, payback_period: 7, context: 'Commission 10–15% on bookings; avg safari + resort package ₹10,000–₹50,000; Ranthambore and Jim Corbett peak demand.' },
    competitors: [
      { name: 'Jungle Lodges (KSTDC)', type: 'Government', description: 'Karnataka government lodges; limited online presence.' },
      { name: 'Pugdundee Safaris', type: 'Indian Operator', description: 'Premium safaris; offline-first booking.' },
      { name: 'MakeMyTrip Wildlife', type: 'Large Player', description: 'Wildlife section; limited curation.' },
    ],
  },
  // ── Export & Trade ────────────────────────────────────────────────────────────
  'agri-export-compliance-automation': {
    google_trends_keyword: 'agri export compliance India APEDA',
    unit_economics: { cac: 15000, ltv: 120000, ltv_cac_ratio: 8.0, avg_order_value: 40000, churn_rate: 15, payback_period: 9, context: 'Annual SaaS ₹30,000–₹1.5L; APEDA + Phytosanitary + food testing compliance is mandatory for exporters >₹50L.' },
    competitors: [
      { name: 'APEDA portal (Govt)', type: 'Government', description: 'Mandatory govt portal; manual and slow.' },
      { name: 'TradeSmith India', type: 'Indian Startup', description: 'Export documentation; early stage.' },
      { name: 'EcommerceExport (DGFT)', type: 'Government', description: 'DGFT export portal; compliance only, no automation.' },
    ],
  },
  'ayurvedic-herbal-products-export-brand': {
    google_trends_keyword: 'Ayurvedic products export India',
    unit_economics: { cac: 10000, ltv: 100000, ltv_cac_ratio: 10.0, avg_order_value: 30000, churn_rate: 15, payback_period: 9, context: 'B2B export contract ₹2L–₹20L/order; EU and US market commands 3–5x domestic price; GMP certification required.' },
    competitors: [
      { name: 'Himalaya Drug Company', type: 'Large FMCG', description: 'Dominant in global Ayurveda market.' },
      { name: 'Dabur International', type: 'Large FMCG', description: 'Ayurveda export powerhouse; MENA + UK focus.' },
      { name: 'Organic India', type: 'Indian Brand', description: 'Certified organic herbs; USDA-certified, premium.' },
    ],
  },
  'india-africa-trade-finance-platform': {
    google_trends_keyword: 'India Africa trade finance',
    unit_economics: { cac: 50000, ltv: 500000, ltv_cac_ratio: 10.0, avg_order_value: 150000, churn_rate: 12, payback_period: 12, context: 'Fee 1–3% on financed trade value; avg transaction ₹20L–₹2Cr; pharma, agri machinery, and FMCG are top verticals.' },
    competitors: [
      { name: 'Exim Bank India', type: 'Government', description: 'India trade finance; slow, collateral-heavy.' },
      { name: 'TradeIndia Finance', type: 'Indian Platform', description: 'B2B trade platform; limited Africa focus.' },
      { name: 'AfriGlobe Trade', type: 'African Platform', description: 'Africa-India commerce; limited India operations.' },
    ],
  },
  'india-gcc-real-estate-investment-platform': {
    google_trends_keyword: 'NRI real estate investment India',
    unit_economics: { cac: 15000, ltv: 150000, ltv_cac_ratio: 10.0, avg_order_value: 50000, churn_rate: 12, payback_period: 10, context: 'Commission 1–2% of property value; avg property ₹50L–₹3Cr; GCC NRI segment has high purchasing power.' },
    competitors: [
      { name: 'Square Yards', type: 'Indian Startup', description: 'Real estate platform with NRI focus; Series C.' },
      { name: 'PropTiger (Housing)', type: 'Indian Startup', description: 'Real estate platform; acquired by REA Group.' },
      { name: 'NRI Legal Services', type: 'Indian Startup', description: 'Legal + property management for NRIs.' },
    ],
  },
  'india-japan-cultural-language-training-platform': {
    google_trends_keyword: 'Japanese language course India',
    unit_economics: { cac: 3000, ltv: 25000, ltv_cac_ratio: 8.3, avg_order_value: 8000, churn_rate: 20, payback_period: 8, context: 'JLPT prep course ₹5,000–₹15,000; Japan-bound IT + nursing + caregiving workers are primary segments.' },
    competitors: [
      { name: 'The Japan Foundation', type: 'Cultural Org', description: 'Official Japan language programs; limited commercial.' },
      { name: 'JIC Language Services', type: 'Indian Institution', description: 'Japanese language + culture; offline-first.' },
      { name: 'Rosetta Stone Japan', type: 'Global', description: 'Language learning; not India-specific job market context.' },
    ],
  },
  'indian-animation-vfx-export-studio': {
    google_trends_keyword: 'animation studio India outsourcing',
    unit_economics: { cac: 30000, ltv: 300000, ltv_cac_ratio: 10.0, avg_order_value: 80000, churn_rate: 15, payback_period: 11, context: 'Project-based ₹5L–₹5Cr; retainer animation teams ₹2L–₹10L/month; India VFX at 40–60% cost of US/UK studios.' },
    competitors: [
      { name: 'Prana Studios', type: 'Indian Studio', description: 'Hollywood VFX outsourcing; Mumbai-based.' },
      { name: 'DQ Entertainment', type: 'Indian Listed', description: 'Animation + IP; listed, global client base.' },
      { name: 'Prime Focus', type: 'Indian Listed', description: 'VFX + cloud media services; listed, global.' },
    ],
  },
  'indian-architecture-design-services-export': {
    google_trends_keyword: 'architectural design outsourcing India',
    unit_economics: { cac: 20000, ltv: 200000, ltv_cac_ratio: 10.0, avg_order_value: 60000, churn_rate: 15, payback_period: 10, context: 'Per-project ₹2L–₹20L; India architects at 30–40% of US/UK rates; MEP + structural drawing outsourcing fastest growing.' },
    competitors: [
      { name: 'Freelancer.com Arch', type: 'Global Platform', description: 'Architecture gig marketplace; no quality guarantee.' },
      { name: 'CADnetics', type: 'Indian Firm', description: 'CAD + BIM outsourcing; boutique firm.' },
      { name: 'Virtual Employee', type: 'Indian Firm', description: 'Remote staffing including architects.' },
    ],
  },
  'indian-artisan-jewellery-export-platform': {
    google_trends_keyword: 'Indian handmade jewellery export',
    unit_economics: { cac: 5000, ltv: 50000, ltv_cac_ratio: 10.0, avg_order_value: 15000, churn_rate: 18, payback_period: 8, context: 'Commission 12–18% on export orders; EU + US markets pay 4–8x India retail price for ethnic jewellery.' },
    competitors: [
      { name: 'Etsy India sellers', type: 'Marketplace', description: 'Artisan jewellery; no India-specific export facilitation.' },
      { name: 'IndiaMART Jewellery', type: 'Indian Platform', description: 'B2B leads; no export compliance support.' },
      { name: 'GJEPC India', type: 'Industry Body', description: 'Gems & jewellery export promotion council; not a marketplace.' },
    ],
  },
  'indian-chemical-raw-material-export': {
    google_trends_keyword: 'chemical export India bulk',
    unit_economics: { cac: 30000, ltv: 300000, ltv_cac_ratio: 10.0, avg_order_value: 200000, churn_rate: 10, payback_period: 10, context: 'Commission 1–2% on shipment value; avg container ₹10L–₹50L; specialty chemicals earn 3x commodity margins.' },
    competitors: [
      { name: 'Chemexcil India', type: 'Export Council', description: 'Govt chemical export promotion; not a marketplace.' },
      { name: 'Alibaba (chemicals)', type: 'Global', description: 'China-dominated; India chemicals underrepresented.' },
      { name: 'Made-in-China.com', type: 'Global', description: 'B2B trade platform; India version lacking.' },
    ],
  },
  'indian-engineering-goods-export-marketplace': {
    google_trends_keyword: 'engineering goods export India',
    unit_economics: { cac: 25000, ltv: 250000, ltv_cac_ratio: 10.0, avg_order_value: 80000, churn_rate: 12, payback_period: 10, context: 'Commission 2–4% on orders; EEPC India shows engineering goods export at $110B+; small auto + machinery exporters underserved.' },
    competitors: [
      { name: 'IndiaMART', type: 'Indian Listed', description: 'B2B marketplace; engineering goods listed but no export focus.' },
      { name: 'TradeIndia', type: 'Indian Platform', description: 'B2B export directory; limited digital commerce.' },
      { name: 'EEPC India', type: 'Export Council', description: 'Engineering export promotion; not a marketplace.' },
    ],
  },
  'indian-food-export-diaspora-commerce': {
    google_trends_keyword: 'Indian food export USA',
    unit_economics: { cac: 3000, ltv: 30000, ltv_cac_ratio: 10.0, avg_order_value: 5000, churn_rate: 20, payback_period: 7, context: 'Commission 15–20% on orders; 35M+ Indian diaspora creates captive demand; FDA approval is moat against new entrants.' },
    competitors: [
      { name: 'iShopIndian', type: 'Indian Startup', description: 'Indian grocery for diaspora; US-focused.' },
      { name: 'Swiggy Instamart export', type: 'Indian Unicorn', description: 'No direct export; but diaspora demand signal.' },
      { name: 'Desicart', type: 'UK Company', description: 'Indian grocery for UK diaspora; limited SKUs.' },
    ],
  },
  'indian-handicraft-global-marketplace': {
    google_trends_keyword: 'Indian handicrafts export online',
    unit_economics: { cac: 4000, ltv: 40000, ltv_cac_ratio: 10.0, avg_order_value: 12000, churn_rate: 20, payback_period: 8, context: 'Commission 15–20% on international orders; GI-tagged crafts command 5–10x domestic retail in US/EU markets.' },
    competitors: [
      { name: 'Craftsvilla', type: 'Indian Startup', description: 'Ethnic products marketplace; B2C India focus.' },
      { name: 'Exotic India Art', type: 'Indian E-commerce', description: 'Handicrafts + art for global buyers; bootstrapped.' },
      { name: 'Gaatha.com', type: 'Indian Startup', description: 'Artisan stories + craft marketplace.' },
    ],
  },
  'indian-legal-process-outsourcing-platform': {
    google_trends_keyword: 'legal process outsourcing India',
    unit_economics: { cac: 30000, ltv: 300000, ltv_cac_ratio: 10.0, avg_order_value: 80000, churn_rate: 12, payback_period: 11, context: 'Monthly retainer $2,000–$10,000 USD from US/UK law firms; India LPO market at $3B growing 30% YoY.' },
    competitors: [
      { name: 'Pangea3 (Thomson Reuters)', type: 'Acquired', description: 'Pioneer LPO; acquired, now enterprise.' },
      { name: 'QuisLex', type: 'Indian LPO', description: 'Established LPO firm; Hyderabad + US offices.' },
      { name: 'Mindcrest', type: 'Indian LPO', description: 'Legal research + drafting outsourcing; acquired.' },
    ],
  },
  'indian-msme-export-aggregator': {
    google_trends_keyword: 'export aggregator India MSME',
    unit_economics: { cac: 8000, ltv: 80000, ltv_cac_ratio: 10.0, avg_order_value: 25000, churn_rate: 15, payback_period: 9, context: 'Commission 5–10% on export value; MSME exporters 200,000+ have no digital access to foreign buyers.' },
    competitors: [
      { name: 'Tradeling', type: 'Middle East Platform', description: 'B2B marketplace; India seller focus limited.' },
      { name: 'Meesho (export)', type: 'Indian Unicorn', description: 'Social commerce; no export facilitation.' },
      { name: 'Amazon Global Selling', type: 'Global', description: 'E-commerce export; only for consumer goods.' },
    ],
  },
  'indian-organic-textiles-export-brand': {
    google_trends_keyword: 'organic cotton export India',
    unit_economics: { cac: 10000, ltv: 100000, ltv_cac_ratio: 10.0, avg_order_value: 30000, churn_rate: 15, payback_period: 9, context: 'GOTS-certified premium 30–50% over conventional; EU sustainable fashion regulation creates tailwind.' },
    competitors: [
      { name: 'Arvind Organic', type: 'Indian Listed', description: 'Organic cotton textiles; strong export credentials.' },
      { name: 'Pratibha Syntex', type: 'Indian Company', description: 'Organic cotton garments; EU-certified exporter.' },
      { name: 'FabIndia (organic)', type: 'Indian Brand', description: 'Organic textiles; domestic retail focus.' },
    ],
  },
  'indian-renewable-energy-equipment-export': {
    google_trends_keyword: 'renewable energy equipment export India',
    unit_economics: { cac: 50000, ltv: 500000, ltv_cac_ratio: 10.0, avg_order_value: 200000, churn_rate: 10, payback_period: 12, context: 'Commission 2–4% on equipment orders; India solar panels + wind components at 20–35% cost advantage globally.' },
    competitors: [
      { name: 'Waaree Solar (export)', type: 'Indian Listed', description: 'Largest solar panel exporter from India.' },
      { name: 'Inox Wind', type: 'Indian Listed', description: 'Wind energy equipment; listed, export-focused.' },
      { name: 'Greenko Group', type: 'Indian Unicorn', description: 'Renewable energy developer; project export.' },
    ],
  },
  'indian-startup-expansion-consulting': {
    google_trends_keyword: 'market entry consulting India',
    unit_economics: { cac: 30000, ltv: 300000, ltv_cac_ratio: 10.0, avg_order_value: 80000, churn_rate: 15, payback_period: 11, context: 'Project fees $5,000–$50,000 per market entry engagement; retainer $2,000–$8,000/month for ongoing support.' },
    competitors: [
      { name: 'McKinsey India (market entry)', type: 'Global MBB', description: 'Top consulting; unaffordable for SMEs.' },
      { name: 'Gateway House', type: 'Think Tank', description: 'India strategic advisory; research-oriented.' },
      { name: 'Deloitte India Market Entry', type: 'Big 4', description: 'Large firm; minimum project size too high for startups.' },
    ],
  },
  'software-services-export-aggregator-boutique-it': {
    google_trends_keyword: 'IT outsourcing India small company',
    unit_economics: { cac: 25000, ltv: 250000, ltv_cac_ratio: 10.0, avg_order_value: 80000, churn_rate: 15, payback_period: 10, context: 'Platform fee 8–12% of contract value; avg project $10,000–$100,000; US and European SMEs seeking $15–$25/hour India developers.' },
    competitors: [
      { name: 'Toptal', type: 'Global', description: 'Elite developer marketplace; $50–$100/hr range.' },
      { name: 'Clutch.co', type: 'Global', description: 'B2B reviews + vendor discovery; not a direct marketplace.' },
      { name: 'GoodFirms', type: 'Indian Platform', description: 'IT company directory + reviews; India-based.' },
    ],
  },
  // ── Food ─────────────────────────────────────────────────────────────────────
  'ghost-kitchen-brand-incubator': {
    google_trends_keyword: 'ghost kitchen India',
    unit_economics: { cac: 30000, ltv: 300000, ltv_cac_ratio: 10.0, avg_order_value: 50000, churn_rate: 20, payback_period: 10, context: 'Revenue share 15–20% of brand GMV; avg ghost kitchen brand does ₹3L–₹15L/month; incubator equity stake in winners.' },
    competitors: [
      { name: 'Rebel Foods (Faasos)', type: 'Indian Unicorn', description: 'Cloud kitchen pioneer + brand incubator; global.' },
      { name: 'Biryani by Kilo', type: 'Indian Startup', description: 'Single-brand cloud kitchen; Series B.' },
      { name: 'Box8', type: 'Indian Startup', description: 'Cloud kitchen brand; acquired by Jubilant FoodWorks.' },
    ],
  },
  'school-hostel-tiffin-aggregator': {
    google_trends_keyword: 'school hostel food supplier India',
    unit_economics: { cac: 5000, ltv: 60000, ltv_cac_ratio: 12.0, avg_order_value: 20000, churn_rate: 15, payback_period: 8, context: 'B2B contract ₹1,500–₹3,000 per student/month; 100-student hostel = ₹1.5L–₹3L/month ARR; food safety audit creates switching cost.' },
    competitors: [
      { name: 'Sodexo India', type: 'Global', description: 'Enterprise food services; expensive for mid-size hostels.' },
      { name: 'Aramark India', type: 'Global', description: 'Institutional food service; enterprise-only.' },
      { name: 'Local caterers', type: 'Unorganised', description: 'Dominant; no consistency, no hygiene standards.' },
    ],
  },
  // ── Logistics ─────────────────────────────────────────────────────────────────
  'carbon-footprint-tracking-supply-chains': {
    google_trends_keyword: 'supply chain carbon tracking India',
    unit_economics: { cac: 20000, ltv: 180000, ltv_cac_ratio: 9.0, avg_order_value: 60000, churn_rate: 15, payback_period: 10, context: 'Annual SaaS ₹3L–₹12L; BRSR reporting mandate for 1,000 listed companies + scope 3 supplier pressure.' },
    competitors: [
      { name: 'Sphera', type: 'Global', description: 'ESG + supply chain risk; enterprise pricing.' },
      { name: 'Emitwise', type: 'Global Startup', description: 'Supply chain emissions; UK-founded, India entry.' },
      { name: 'EcoVadis India', type: 'Global', description: 'Supplier sustainability ratings; growing in India.' },
    ],
  },
  'cross-border-fulfillment-platform-exporters': {
    google_trends_keyword: 'cross border fulfillment India export',
    unit_economics: { cac: 15000, ltv: 150000, ltv_cac_ratio: 10.0, avg_order_value: 40000, churn_rate: 15, payback_period: 9, context: 'Commission 5–10% on shipment value; avg cross-border order ₹20,000–₹2L; SME D2C exporters fastest growing segment.' },
    competitors: [
      { name: 'Shiprocket X (Export)', type: 'Indian Startup', description: 'Exporter shipping SaaS; Series E, dominant.' },
      { name: 'DHL Express India', type: 'Global', description: 'International logistics; expensive for SME exporters.' },
      { name: 'FedEx India', type: 'Global', description: 'Express international; no SME-specific rates.' },
    ],
  },
  'd2c-shipping-aggregator-small-sellers': {
    google_trends_keyword: 'courier aggregator for small business India',
    unit_economics: { cac: 500, ltv: 6000, ltv_cac_ratio: 12.0, avg_order_value: 100, churn_rate: 20, payback_period: 4, context: 'Volume discount arbitrage; 500–2,000 shipments/month D2C sellers pay ₹40–₹80/kg vs ₹100–₹150 direct.' },
    competitors: [
      { name: 'Shiprocket', type: 'Indian Unicorn', description: 'Dominant D2C shipping aggregator; Series E.' },
      { name: 'Pickrr (acquired)', type: 'Indian Startup', description: 'Shipping aggregator; acquired by Shiprocket.' },
      { name: 'Shyplite', type: 'Indian Startup', description: 'Shipping for D2C and marketplace sellers.' },
    ],
  },
  'freight-brokerage-platform-sme-exporters': {
    google_trends_keyword: 'freight broker India export',
    unit_economics: { cac: 10000, ltv: 100000, ltv_cac_ratio: 10.0, avg_order_value: 25000, churn_rate: 18, payback_period: 9, context: 'Brokerage 3–5% on freight value; avg container freight ₹2L–₹8L; spot rates transparency is key value proposition.' },
    competitors: [
      { name: 'FreightBro', type: 'Indian Startup', description: 'Digital freight brokerage; Series A.' },
      { name: 'Freightwalla', type: 'Indian Startup', description: 'Ocean + air freight platform; bootstrapped.' },
      { name: 'Traditional freight forwarders', type: 'Unorganised', description: 'Dominant; no price transparency, relationship-based.' },
    ],
  },
  'hyperlocal-b2b-delivery-kirana': {
    google_trends_keyword: 'B2B delivery app for kirana India',
    unit_economics: { cac: 1000, ltv: 12000, ltv_cac_ratio: 12.0, avg_order_value: 2000, churn_rate: 20, payback_period: 6, context: 'Per-delivery ₹30–₹80; kirana route delivery 3–5 deliveries/day per executive; subscription route plans create stickiness.' },
    competitors: [
      { name: 'Udaan', type: 'Indian Unicorn', description: 'B2B trade + logistics for kiranas; Series F.' },
      { name: 'Ninjacart', type: 'Indian Unicorn', description: 'Agri B2B logistics; Walmart-backed.' },
      { name: 'Jumbotail', type: 'Indian Startup', description: 'B2B grocery + last-mile; Series C.' },
    ],
  },
  'last-mile-delivery-tier3-logistics': {
    google_trends_keyword: 'last mile delivery Tier 3 India',
    unit_economics: { cac: 2000, ltv: 18000, ltv_cac_ratio: 9.0, avg_order_value: 80, churn_rate: 22, payback_period: 7, context: 'Per-shipment ₹50–₹120; 200–500 shipments/day per hub needed for unit economics; rural deliverability is differentiation.' },
    competitors: [
      { name: 'Delhivery', type: 'Indian Listed', description: 'Pan-India logistics; listed, strong Tier 2/3 coverage.' },
      { name: 'XpressBees', type: 'Indian Startup', description: 'Last-mile courier; Series D, 2,000+ towns.' },
      { name: 'Ecom Express', type: 'Indian Startup', description: 'E-commerce logistics; 2,700+ pin codes.' },
    ],
  },
  'milk-run-logistics-auto-components': {
    google_trends_keyword: 'milk run logistics automotive India',
    unit_economics: { cac: 30000, ltv: 360000, ltv_cac_ratio: 12.0, avg_order_value: 120000, churn_rate: 10, payback_period: 9, context: 'Monthly route contract ₹1L–₹5L per OEM client; Maruti, Tata, Hyundai vendor supply chains are target.' },
    competitors: [
      { name: 'Rivigo', type: 'Indian Startup', description: 'Tech logistics; strong in industrial supply chains.' },
      { name: 'Mahindra Logistics', type: 'Indian Listed', description: 'Listed logistics arm; auto component focus.' },
      { name: 'TCI Supply Chain', type: 'Indian Listed', description: '3PL + milk run specialist; listed company.' },
    ],
  },
  'pharma-cold-chain-monitoring-saas': {
    google_trends_keyword: 'pharma cold chain monitoring India',
    unit_economics: { cac: 25000, ltv: 225000, ltv_cac_ratio: 9.0, avg_order_value: 75000, churn_rate: 12, payback_period: 10, context: 'Annual SaaS + IoT ₹5L–₹20L per pharma company; CDSCO GDP guidelines mandate cold chain documentation.' },
    competitors: [
      { name: 'Roambee', type: 'Indian Startup', description: 'IoT supply chain visibility; pharma + FMCG.' },
      { name: 'Cold Star Logistics', type: 'Indian Company', description: 'Pharma cold chain; logistics-first.' },
      { name: 'Sensitech (Carrier)', type: 'Global', description: 'Cold chain monitoring; MNC pricing.' },
    ],
  },
  'supply-chain-finance-logistics-smes': {
    google_trends_keyword: 'supply chain finance India MSME',
    unit_economics: { cac: 20000, ltv: 200000, ltv_cac_ratio: 10.0, avg_order_value: 60000, churn_rate: 15, payback_period: 10, context: 'Platform fee 1–2% on financed amount; avg transaction ₹5L–₹50L; anchor buyer partnerships drive volume.' },
    competitors: [
      { name: 'KredX', type: 'Indian Startup', description: 'Supply chain finance + invoice discounting; Series B.' },
      { name: 'CapGrid', type: 'Indian Startup', description: 'SCF platform; early stage.' },
      { name: 'Tata Capital SCF', type: 'Large NBFC', description: 'Supply chain finance; large anchor buyers.' },
    ],
  },
  'warehouse-management-saas-3pl-smes': {
    google_trends_keyword: 'warehouse management software India',
    unit_economics: { cac: 15000, ltv: 150000, ltv_cac_ratio: 10.0, avg_order_value: 50000, churn_rate: 12, payback_period: 9, context: 'Annual SaaS ₹3L–₹12L; D2C fulfillment boom creating demand; 3PL companies 100–500 SKUs are sweet spot.' },
    competitors: [
      { name: 'Increff WMS', type: 'Indian Startup', description: 'Warehouse management for fashion; Series B.' },
      { name: 'LoGo Infosoft', type: 'Indian Startup', description: 'WMS SaaS for SME logistics.' },
      { name: 'Oracle WMS', type: 'Global', description: 'Enterprise WMS; too expensive for SMEs.' },
    ],
  },
  // ── PetCare ───────────────────────────────────────────────────────────────────
  'aquarium-exotic-pet-ecommerce': {
    google_trends_keyword: 'aquarium fish online India',
    unit_economics: { cac: 400, ltv: 5000, ltv_cac_ratio: 12.5, avg_order_value: 1200, churn_rate: 25, payback_period: 4, context: 'Avg order ₹800–₹2,500; aquarium hobby is subscription-like with monthly consumables; live fish delivery is moat.' },
    competitors: [
      { name: 'AquaFish India', type: 'Local E-commerce', description: 'Online fish + aquarium supplies; limited geography.' },
      { name: 'Aquatic Realm', type: 'Local Store', description: 'Offline aquarium specialty store; no D2C.' },
      { name: 'Pet World Online', type: 'Indian E-commerce', description: 'General pet supplies; not aquarium-specialized.' },
    ],
  },
  'livestock-insurance-saas-rural': {
    google_trends_keyword: 'cattle insurance India',
    unit_economics: { cac: 1500, ltv: 12000, ltv_cac_ratio: 8.0, avg_order_value: 1200, churn_rate: 25, payback_period: 8, context: 'Premium 3–5% of cattle value; avg cattle worth ₹30,000–₹80,000; PMFBY and state schemes subsidise farmer share.' },
    competitors: [
      { name: 'NABARD cattle insurance', type: 'Government', description: 'Subsidised scheme; low awareness, paper-heavy.' },
      { name: 'AIC (Agriculture Insurance)', type: 'Government', description: 'State-run insurer; limited digital distribution.' },
      { name: 'Gramcover', type: 'Indian Startup', description: 'Rural insurance aggregator; early stage.' },
    ],
  },
  'online-pet-training-platform': {
    google_trends_keyword: 'dog training online India',
    unit_economics: { cac: 800, ltv: 8000, ltv_cac_ratio: 10.0, avg_order_value: 2500, churn_rate: 25, payback_period: 6, context: 'Course pack ₹1,500–₹4,000; monthly live coaching ₹800–₹1,500; puppy parent segment highest LTV.' },
    competitors: [
      { name: 'The Dodo Training (US)', type: 'Global', description: 'Pet content + tips; not structured India training.' },
      { name: 'Buddy School (India)', type: 'Local', description: 'Dog training app; very early stage.' },
      { name: 'Local dog trainers', type: 'Unorganised', description: 'In-person; expensive at ₹1,500–₹3,000/session.' },
    ],
  },
  'pet-cremation-memorial-services': {
    google_trends_keyword: 'pet cremation service India',
    unit_economics: { cac: 1000, ltv: 8000, ltv_cac_ratio: 8.0, avg_order_value: 4000, churn_rate: 30, payback_period: 7, context: 'Cremation ₹2,000–₹8,000; memorial products (urns, stones) ₹500–₹5,000; pet insurance claim facilitation adds B2B channel.' },
    competitors: [
      { name: 'Prayers for Pets', type: 'Indian Service', description: 'Pet cremation in metros; limited digital presence.' },
      { name: 'Antim Yatra (pet)', type: 'Local', description: 'Pet funeral services; city-specific.' },
      { name: 'Local vets (referral)', type: 'Unorganised', description: 'Vet-referred cremation; informal, no branding.' },
    ],
  },
  'pet-grooming-franchise-network': {
    google_trends_keyword: 'pet grooming near me India',
    unit_economics: { cac: 800, ltv: 9600, ltv_cac_ratio: 12.0, avg_order_value: 1200, churn_rate: 18, payback_period: 6, context: 'Per-session ₹600–₹2,000; monthly grooming package ₹1,500–₹3,000; franchise unit-level payback 18–24 months.' },
    competitors: [
      { name: 'Heads Up For Tails', type: 'Indian Startup', description: 'Premium pet retail + grooming; Series C.' },
      { name: 'Supertails Grooming', type: 'Indian Startup', description: 'Pet commerce + grooming; Series A.' },
      { name: 'Urban Company Pet (pilot)', type: 'Indian Unicorn', description: 'At-home grooming pilot in select cities.' },
    ],
  },
  'pet-healthcare-subscription-platform': {
    google_trends_keyword: 'pet health plan India',
    unit_economics: { cac: 1500, ltv: 15000, ltv_cac_ratio: 10.0, avg_order_value: 2500, churn_rate: 20, payback_period: 7, context: 'Annual health plan ₹1,500–₹5,000 covering vaccinations + annual checkup + 20% discount; pet insurance add-on.' },
    competitors: [
      { name: 'Paws India Health', type: 'Early Startup', description: 'Pet health plans; very early stage.' },
      { name: 'Pet Suraksha', type: 'Indian Startup', description: 'Pet insurance; seed funded.' },
      { name: 'Heads Up for Tails (vet)', type: 'Indian Startup', description: 'Retail + vet network; not subscription-first.' },
    ],
  },
  'pet-sitting-dog-walking-marketplace': {
    google_trends_keyword: 'pet sitting service India',
    unit_economics: { cac: 500, ltv: 6000, ltv_cac_ratio: 12.0, avg_order_value: 800, churn_rate: 20, payback_period: 5, context: 'Per-sit ₹300–₹800; monthly dog-walking plan ₹1,500–₹3,000; trust (sitter profiles + insurance) is key differentiator.' },
    competitors: [
      { name: 'Rover.com', type: 'Global', description: 'Global dog-sitting marketplace; limited India operations.' },
      { name: 'Wagr', type: 'Indian Startup', description: 'Pet services marketplace; seed funded.' },
      { name: 'Dogsee (grooming+sitting)', type: 'Indian Startup', description: 'Pet care multi-service; early stage.' },
    ],
  },
  'premium-indian-pet-food-brand': {
    google_trends_keyword: 'Indian pet food brand natural',
    unit_economics: { cac: 600, ltv: 7200, ltv_cac_ratio: 12.0, avg_order_value: 1200, churn_rate: 18, payback_period: 5, context: 'Monthly subscription ₹800–₹2,000; margin 55–65% vs 20–30% for global brands; "Made in India" premium resonating.' },
    competitors: [
      { name: 'Royal Canin India', type: 'Global MNC', description: 'Premium pet food; dominant in vet channel.' },
      { name: 'Drools', type: 'Indian Brand', description: 'Mass-market Indian pet food; offline-dominant.' },
      { name: 'Farmina India', type: 'Global Brand', description: 'Premium grain-free; growing in metro pet stores.' },
    ],
  },
  'raw-pet-food-subscription-barf': {
    google_trends_keyword: 'raw dog food BARF India',
    unit_economics: { cac: 800, ltv: 9600, ltv_cac_ratio: 12.0, avg_order_value: 2000, churn_rate: 20, payback_period: 5, context: 'Monthly subscription ₹1,500–₹4,000; cold-chain delivery from local butcher networks keeps COGS low.' },
    competitors: [
      { name: 'The Meat Co (India)', type: 'Indian Startup', description: 'Raw meat delivery; not BARF-specific formulation.' },
      { name: 'Fresh Paws', type: 'Indian Startup', description: 'Raw pet food; limited geographic reach.' },
      { name: 'Kibble & Bit', type: 'Indian D2C', description: 'Natural pet food; not raw/BARF.' },
    ],
  },
  'veterinary-diagnostics-saas': {
    google_trends_keyword: 'veterinary diagnostic software India',
    unit_economics: { cac: 10000, ltv: 90000, ltv_cac_ratio: 9.0, avg_order_value: 30000, churn_rate: 15, payback_period: 9, context: 'Annual SaaS ₹20,000–₹60,000 per vet clinic; PACS + EMR integration creates 5-year lock-in.' },
    competitors: [
      { name: 'Animana', type: 'Global', description: 'Vet practice management; expensive, Dutch origin.' },
      { name: 'VetBlue', type: 'Indian Startup', description: 'Vet clinic management; early stage.' },
      { name: 'eVetPractice', type: 'Global', description: 'Cloud vet software; US-centric workflows.' },
    ],
  },
  // ── PropTech ─────────────────────────────────────────────────────────────────
  'affordable-housing-investment-platform': {
    google_trends_keyword: 'fractional real estate investment India',
    unit_economics: { cac: 5000, ltv: 50000, ltv_cac_ratio: 10.0, avg_order_value: 20000, churn_rate: 15, payback_period: 9, context: 'Platform fee 2% on investment; avg investor ₹2L–₹20L; 8–10% rental yield + capital appreciation narrative drives repeat.' },
    competitors: [
      { name: 'PropShare', type: 'Indian Startup', description: 'Fractional CRE investment; SEBI-regulated.' },
      { name: 'hBits', type: 'Indian Startup', description: 'Fractional real estate platform; Series A.' },
      { name: 'Strata', type: 'Indian Startup', description: 'Commercial fractional investment; Series B.' },
    ],
  },
  'affordable-student-housing-platform': {
    google_trends_keyword: 'student accommodation platform India',
    unit_economics: { cac: 2000, ltv: 20000, ltv_cac_ratio: 10.0, avg_order_value: 6000, churn_rate: 25, payback_period: 7, context: 'Monthly booking fee ₹200–₹500; student rooms ₹4,000–₹12,000/month; PG aggregator model scales without owning inventory.' },
    competitors: [
      { name: 'Stanza Living', type: 'Indian Startup', description: 'Premium student co-living; Series D.' },
      { name: 'OYO Life', type: 'Indian Unicorn', description: 'Long-stay accommodations; managed inventory.' },
      { name: 'NoBroker PG', type: 'Indian Startup', description: 'PG listing + management; Series E.' },
    ],
  },
  'commercial-real-estate-leasing-smes': {
    google_trends_keyword: 'office space lease India SME',
    unit_economics: { cac: 15000, ltv: 150000, ltv_cac_ratio: 10.0, avg_order_value: 50000, churn_rate: 15, payback_period: 10, context: 'Brokerage 2 months rent; avg SME leases 2,000–5,000 sq ft at ₹50–₹150/sqft/month; flexi-space trend helps demand.' },
    competitors: [
      { name: 'WeWork India (CRE)', type: 'Global', description: 'Flexible office space; premium positioning.' },
      { name: '91springboard', type: 'Indian Startup', description: 'Coworking + dedicated offices; Series A.' },
      { name: 'IndiQube', type: 'Indian Startup', description: 'Managed office spaces; listed, South India strong.' },
    ],
  },
  'green-building-certification-consulting-platform': {
    google_trends_keyword: 'IGBC certification India',
    unit_economics: { cac: 20000, ltv: 180000, ltv_cac_ratio: 9.0, avg_order_value: 60000, churn_rate: 15, payback_period: 10, context: 'Consulting fee ₹5L–₹30L per project; IGBC + GRIHA + LEED India certifications; mandatory for govt projects >5,000 sqm.' },
    competitors: [
      { name: 'IGBC (CII)', type: 'Industry Body', description: 'Green building certification; not consulting.' },
      { name: 'Eco Recycling', type: 'Indian Startup', description: 'Green building materials + consulting.' },
      { name: 'Godrej Green Building', type: 'Large Player', description: 'Green building solutions from Godrej Properties.' },
    ],
  },
  'nri-property-management-service': {
    google_trends_keyword: 'NRI property management India',
    unit_economics: { cac: 10000, ltv: 120000, ltv_cac_ratio: 12.0, avg_order_value: 30000, churn_rate: 12, payback_period: 8, context: 'Monthly retainer 8–12% of rental income; NRI property managers also earn from sale facilitation and legal services.' },
    competitors: [
      { name: 'NRI Legal Services', type: 'Indian Startup', description: 'NRI property legal + management; established.' },
      { name: 'Square Yards NRI', type: 'Indian Startup', description: 'Real estate + NRI property management; Series C.' },
      { name: 'Local property agents', type: 'Unorganised', description: 'Dominant; unreliable for absentee NRI owners.' },
    ],
  },
  'office-space-fitout-financing-platform': {
    google_trends_keyword: 'office fitout financing India',
    unit_economics: { cac: 15000, ltv: 150000, ltv_cac_ratio: 10.0, avg_order_value: 50000, churn_rate: 15, payback_period: 10, context: 'Commission 2–4% of financed fitout value; avg office fitout ₹5L–₹50L; lease-to-own model growing in Tier 2 cities.' },
    competitors: [
      { name: 'Capgemini Fitout Finance', type: 'NBFC', description: 'Construction finance; not office-specific.' },
      { name: 'HDFC Business Loans', type: 'Bank', description: 'Business loans; not fitout-specific.' },
      { name: 'Local interior designers', type: 'Unorganised', description: 'No financing product; cash-only or bank loans.' },
    ],
  },
  'property-tax-filing-optimisation-saas': {
    google_trends_keyword: 'property tax filing online India',
    unit_economics: { cac: 2000, ltv: 18000, ltv_cac_ratio: 9.0, avg_order_value: 5000, churn_rate: 18, payback_period: 6, context: 'Annual service ₹2,000–₹8,000; commercial property owners with multiple units are high-LTV; state-specific compliance expertise is moat.' },
    competitors: [
      { name: 'Property Tax Advisory firms', type: 'Traditional', description: 'CAs + local consultants; offline, expensive.' },
      { name: 'Municipal portals (Govt)', type: 'Government', description: 'Self-service; complex UX, no optimisation guidance.' },
      { name: 'LegalWiz (property)', type: 'Indian Startup', description: 'Legal + compliance; property tax nascent feature.' },
    ],
  },
  'real-estate-legal-due-diligence-platform': {
    google_trends_keyword: 'property legal due diligence India',
    unit_economics: { cac: 8000, ltv: 60000, ltv_cac_ratio: 7.5, avg_order_value: 15000, churn_rate: 20, payback_period: 9, context: 'Per-property due diligence ₹8,000–₹30,000; RERA + encumbrance + title check bundle; bank-mandated due diligence is captive demand.' },
    competitors: [
      { name: 'NoBroker Legal', type: 'Indian Unicorn', description: 'Property legal services; Series E, broad reach.' },
      { name: 'Vakil Search Legal', type: 'Indian Startup', description: 'Legal services + property due diligence.' },
      { name: 'Local property lawyers', type: 'Unorganised', description: 'Dominant; variable quality, no digital delivery.' },
    ],
  },
  'rental-agreement-tenant-management-platform': {
    google_trends_keyword: 'online rental agreement India',
    unit_economics: { cac: 500, ltv: 5000, ltv_cac_ratio: 10.0, avg_order_value: 800, churn_rate: 25, payback_period: 5, context: 'Per-agreement ₹500–₹1,500; annual landlord subscription ₹2,000–₹5,000 for portfolio management; e-stamp integration is moat.' },
    competitors: [
      { name: 'NoBroker Agreements', type: 'Indian Unicorn', description: 'Dominant; online rent agreement + legal.' },
      { name: 'LegalDesk', type: 'Indian Startup', description: 'Online legal agreements including rent.' },
      { name: 'SignDesk', type: 'Indian Startup', description: 'eSign + digital agreements; B2B enterprise focus.' },
    ],
  },
  // ── Other ─────────────────────────────────────────────────────────────────────
  'mushroom-farming-in-hyderabad': {
    google_trends_keyword: 'mushroom farming business India',
    unit_economics: { cac: 2000, ltv: 20000, ltv_cac_ratio: 10.0, avg_order_value: 5000, churn_rate: 20, payback_period: 7, context: 'Course/franchise ₹20,000–₹50,000; fresh mushroom supply to restaurants ₹150–₹300/kg; farm-to-table subscription recurring revenue.' },
    competitors: [
      { name: 'GreenMyLife', type: 'Indian Startup', description: 'Mushroom grow kits; D2C.' },
      { name: 'Local mushroom farmers', type: 'Unorganised', description: 'Dominant in supply; no training or tech.' },
      { name: 'Agriplex', type: 'Indian Platform', description: 'Agri input + training; mushroom not core focus.' },
    ],
  },
}

const slugs = Object.keys(DATA)

async function run() {
  console.log(`Seeding depth data for ${slugs.length} ideas...`)
  const docs = await client.fetch(
    `*[_type=="businessIdea" && slug.current in $slugs]{_id,"slug":slug.current,"hasTrends":google_trends_keyword}`,
    { slugs }
  )
  const idMap = {}
  const hasData = new Set()
  for (const d of docs) {
    idMap[d.slug] = d._id
    if (d.hasTrends) hasData.add(d.slug)
  }

  let ok = 0, skip = 0, missing = 0
  for (let i = 0; i < slugs.length; i += 10) {
    const batch = slugs.slice(i, i + 10)
    const tx = client.transaction()
    let anyInBatch = false
    for (const slug of batch) {
      if (hasData.has(slug)) { skip++; continue }
      const docId = idMap[slug]
      if (!docId) { console.warn(`\n  Missing doc for slug: ${slug}`); missing++; continue }
      const d = DATA[slug]
      const competitors = (d.competitors || []).map(c => ({ ...c, _type: 'object', _key: k() }))
      tx.patch(docId, p => p.setIfMissing({
        google_trends_keyword: d.google_trends_keyword,
        unit_economics: d.unit_economics,
        competitors,
      }))
      ok++
      anyInBatch = true
    }
    if (anyInBatch) await tx.commit()
    process.stdout.write(`  ${Math.min(i + 10, slugs.length)} / ${slugs.length}`)
  }
  console.log(`\nDone. Updated: ${ok}, Skipped (already had data): ${skip}, Missing: ${missing}`)
}

run().catch(err => { console.error(err); process.exit(1) })
