import { createClient } from '@sanity/client'
import { randomBytes } from 'crypto'
import { readFileSync } from 'fs'
import { homedir } from 'os'

const cfg = JSON.parse(readFileSync(`${homedir()}/.config/sanity/config.json`, 'utf8'))
const client = createClient({ projectId: '5p3rso81', dataset: 'production', apiVersion: '2024-01-01', token: cfg.authToken, useCdn: false })

const k = () => randomBytes(6).toString('hex')

const DATA = {
  // ── Climate / Sustainability ─────────────────────────────────────────────────
  'solar-panel-installation-maintenance-business': {
    google_trends_keyword: 'solar panel installation India',
    unit_economics: { cac: 8000, ltv: 80000, ltv_cac_ratio: 10.0, avg_order_value: 80000, churn_rate: 8, payback_period: 10, context: 'One-time install ₹60,000–₹2L; AMC ₹3,000–₹8,000/year; 10-year warranty creates long-term customer.' },
    competitors: [
      { name: 'Tata Power Solar', type: 'Large Player', description: 'Brand trust + Tata network; premium pricing.' },
      { name: 'Waaree Energies', type: 'Indian Startup', description: 'Listed; panel manufacturer + installer.' },
      { name: 'Amplus Solar', type: 'Indian Startup', description: 'Commercial + industrial solar; Series C.' },
    ],
  },
  'sustainable-reusable-packaging-ecommerce-fmcg': {
    google_trends_keyword: 'sustainable packaging India',
    unit_economics: { cac: 15000, ltv: 120000, ltv_cac_ratio: 8.0, avg_order_value: 30000, churn_rate: 18, payback_period: 9, context: 'B2B annual contract ₹2L–₹10L; FMCG brands under ESG pressure are fastest-growing segment.' },
    competitors: [
      { name: 'Ecoware', type: 'Indian Startup', description: 'Sugarcane-based packaging; 2,000+ B2B clients.' },
      { name: 'Billerud India', type: 'Global', description: 'Paper packaging giant; premium, import-heavy.' },
      { name: 'Pakka Limited', type: 'Indian Listed', description: 'Compostable packaging from agri waste; NSE-listed.' },
    ],
  },
  'biodegradable-packaging-manufacturing': {
    google_trends_keyword: 'biodegradable packaging manufacturer India',
    unit_economics: { cac: 10000, ltv: 90000, ltv_cac_ratio: 9.0, avg_order_value: 20000, churn_rate: 15, payback_period: 9, context: 'B2B contract ₹1L–₹5L/month; D2C brand partnerships carry premium over commodity single-use plastic.' },
    competitors: [
      { name: 'Husk', type: 'Indian Startup', description: 'Rice husk packaging; rural production model.' },
      { name: 'Go Grn', type: 'Indian Startup', description: 'Compostable cutlery + packaging; D2C and B2B.' },
      { name: 'EcoRight', type: 'Indian D2C', description: 'Eco-friendly bags and packaging; consumer-facing.' },
    ],
  },
  'carbon-offset-marketplace-india': {
    google_trends_keyword: 'carbon credits India',
    unit_economics: { cac: 50000, ltv: 500000, ltv_cac_ratio: 10.0, avg_order_value: 150000, churn_rate: 15, payback_period: 12, context: 'Platform fee 5–15% on credit transactions; avg corporate buyer ₹5L–₹20L/year for compliance offsetting.' },
    competitors: [
      { name: 'VCMI India', type: 'Global Initiative', description: 'Voluntary carbon market integrity; not a marketplace.' },
      { name: 'Climes', type: 'Indian Startup', description: 'Carbon offset marketplace for Indian corporates; seed stage.' },
      { name: 'Gold Standard India', type: 'Global Standard', description: 'Carbon credit certification body.' },
    ],
  },
  'clean-cooking-fuel-distribution': {
    google_trends_keyword: 'clean cooking fuel rural India',
    unit_economics: { cac: 2000, ltv: 18000, ltv_cac_ratio: 9.0, avg_order_value: 800, churn_rate: 20, payback_period: 7, context: 'Monthly recurring fuel sale ₹600–₹1,200; DBTL subsidy piggybacking reduces price sensitivity.' },
    competitors: [
      { name: 'HPCL Rajiv Gandhi Urja', type: 'Government', description: 'Govt LPG distribution; dominant but supply gaps.' },
      { name: 'Desi Oven', type: 'Indian Startup', description: 'Improved cookstoves for rural India; grants-backed.' },
      { name: 'Oorja Stoves', type: 'Social Enterprise', description: 'Pellet-fueled cookstoves; B2B2C rural model.' },
    ],
  },
  'climate-risk-advisory-farmers': {
    google_trends_keyword: 'climate risk farming India',
    unit_economics: { cac: 5000, ltv: 30000, ltv_cac_ratio: 6.0, avg_order_value: 8000, churn_rate: 25, payback_period: 9, context: 'Annual advisory ₹5,000–₹15,000 per FPO; insurance company partnerships create B2B2C revenue stream.' },
    competitors: [
      { name: 'aWhere', type: 'Global', description: 'AgriWeather analytics; international pricing.' },
      { name: 'ICRISAT', type: 'Research', description: 'Government-backed agricultural research; non-commercial.' },
      { name: 'Skymet', type: 'Indian Startup', description: 'Weather analytics + agri advisory; B2B focus.' },
    ],
  },
  'community-solar-rural-india': {
    google_trends_keyword: 'community solar project India',
    unit_economics: { cac: 20000, ltv: 200000, ltv_cac_ratio: 10.0, avg_order_value: 50000, churn_rate: 10, payback_period: 12, context: 'Revenue from electricity sale ₹4–₹7/unit; community of 100 households generates ₹5L–₹15L/year.' },
    competitors: [
      { name: 'Gram Power', type: 'Indian Startup', description: 'Rural mini-grid; Series B, Rajasthan focus.' },
      { name: 'Husk Power Systems', type: 'Social Enterprise', description: 'Biomass + solar mini-grids; 200+ villages.' },
      { name: 'Azure Power (community)', type: 'Listed', description: 'Large-scale solar; not community-scale.' },
    ],
  },
  'e-waste-collection-recycling': {
    google_trends_keyword: 'e-waste recycling India',
    unit_economics: { cac: 1500, ltv: 12000, ltv_cac_ratio: 8.0, avg_order_value: 2500, churn_rate: 25, payback_period: 7, context: 'Revenue from material recovery + corporate EPR compliance contracts; B2B contracts ₹50,000–₹3L/year are anchor.' },
    competitors: [
      { name: 'Attero', type: 'Indian Startup', description: 'E-waste recycling + urban mining; Series B.' },
      { name: 'Karo Sambhav', type: 'PRO', description: 'Producer Responsibility Organisation for EPR compliance.' },
      { name: 'E-Parisaraa', type: 'Indian Startup', description: 'Govt-authorised e-waste recycler; Bengaluru HQ.' },
    ],
  },
  'ev-charging-network-apartments': {
    google_trends_keyword: 'EV charging station installation India',
    unit_economics: { cac: 15000, ltv: 120000, ltv_cac_ratio: 8.0, avg_order_value: 30000, churn_rate: 12, payback_period: 10, context: 'Hardware install ₹20,000–₹60,000; per-charge revenue ₹30–₹100; subscription maintenance adds recurring.' },
    competitors: [
      { name: 'Tata Power EV Charging', type: 'Large Player', description: 'National EV charging network; Tata brand trust.' },
      { name: 'Charge+Zone', type: 'Indian Startup', description: 'EV charging infra; Series C, 10,000+ points.' },
      { name: 'Statiq', type: 'Indian Startup', description: 'EV charging network + app; Series A.' },
    ],
  },
  'green-building-materials-brand': {
    google_trends_keyword: 'green building materials India',
    unit_economics: { cac: 10000, ltv: 80000, ltv_cac_ratio: 8.0, avg_order_value: 25000, churn_rate: 20, payback_period: 9, context: 'B2B project sales ₹2L–₹20L per construction project; IGBC-certified builders are primary channel.' },
    competitors: [
      { name: 'Bamboo India', type: 'Indian Startup', description: 'Engineered bamboo building products; niche segment.' },
      { name: 'Envigreen', type: 'Indian Startup', description: 'Eco-friendly packaging + building materials.' },
      { name: 'ACC (eco cement)', type: 'Large Player', description: 'Green cement products; brand dominance.' },
    ],
  },
  'organic-waste-composting-service': {
    google_trends_keyword: 'composting service India',
    unit_economics: { cac: 3000, ltv: 30000, ltv_cac_ratio: 10.0, avg_order_value: 5000, churn_rate: 18, payback_period: 7, context: 'Monthly B2B contract ₹3,000–₹10,000 with apartment complexes; compost revenue adds 20% on top.' },
    competitors: [
      { name: 'Daily Dump', type: 'Indian Social Enterprise', description: 'Home composting products; not service model.' },
      { name: 'Hasiru Dala', type: 'Social Enterprise', description: 'Waste picker cooperative; govt-partnership model.' },
      { name: 'Nepra Resources', type: 'Indian Startup', description: 'Dry waste collection + processing; Ahmedabad.' },
    ],
  },
  'plastic-waste-buyback-recycling': {
    google_trends_keyword: 'plastic waste collection India',
    unit_economics: { cac: 500, ltv: 6000, ltv_cac_ratio: 12.0, avg_order_value: 500, churn_rate: 25, payback_period: 5, context: 'B2C buyback ₹5–₹15/kg; corporate EPR contracts ₹10L–₹50L/year are high-margin anchor revenue.' },
    competitors: [
      { name: 'Recykal', type: 'Indian Startup', description: 'Digital waste marketplace; Series B, EPR focus.' },
      { name: 'Plastics for Change', type: 'Social Enterprise', description: 'Fair-trade plastic recycling from waste pickers.' },
      { name: 'SWaCH', type: 'Cooperative', description: 'Pune waste picker cooperative; city-level scale.' },
    ],
  },
  'rainwater-harvesting-systems': {
    google_trends_keyword: 'rainwater harvesting system India',
    unit_economics: { cac: 5000, ltv: 35000, ltv_cac_ratio: 7.0, avg_order_value: 25000, churn_rate: 15, payback_period: 8, context: 'One-time installation ₹15,000–₹1L; Chennai/Bengaluru mandates create non-discretionary demand.' },
    competitors: [
      { name: 'Waterman (Rajendra Singh)', type: 'NGO', description: 'Awareness + grassroots; not commercial installation.' },
      { name: 'Neer Foundation', type: 'NGO', description: 'Water conservation consultancy; government grants.' },
      { name: 'Local plumbers', type: 'Unorganised', description: 'Low-cost but no design expertise or guarantee.' },
    ],
  },
  'rooftop-solar-installation-financing': {
    google_trends_keyword: 'rooftop solar loan India',
    unit_economics: { cac: 10000, ltv: 90000, ltv_cac_ratio: 9.0, avg_order_value: 30000, churn_rate: 12, payback_period: 9, context: 'EMI financing 6–24 months; commission 3–5% on loan amount disbursed; avg system ₹80,000–₹2.5L.' },
    competitors: [
      { name: 'Tata Capital Solar', type: 'Large Player', description: 'Tata-branded solar financing; high trust, higher rates.' },
      { name: 'SolarSquare', type: 'Indian Startup', description: 'End-to-end rooftop solar + financing; Series B.' },
      { name: 'SECI (Govt scheme)', type: 'Government', description: 'PM Surya Ghar subsidy; reduces customer cost but complex.' },
    ],
  },
  'sustainable-fashion-rental-platform': {
    google_trends_keyword: 'designer dress rental India',
    unit_economics: { cac: 1500, ltv: 12000, ltv_cac_ratio: 8.0, avg_order_value: 2500, churn_rate: 30, payback_period: 7, context: 'Rental fee ₹1,500–₹8,000 per outfit; avg customer rents 4–5 times/year; inventory utilisation >60% needed for margin.' },
    competitors: [
      { name: 'Flyrobe', type: 'Indian Startup', description: 'Wedding + occasion wear rental; acquired by Rent It Bae.' },
      { name: 'Rent It Bae', type: 'Indian Startup', description: 'Designer outfit rental marketplace; series A.' },
      { name: 'Stage3', type: 'Indian Startup', description: 'Designer wear rental app; metro focus.' },
    ],
  },
  'urban-farming-kit-community': {
    google_trends_keyword: 'urban farming kit India',
    unit_economics: { cac: 600, ltv: 5000, ltv_cac_ratio: 8.3, avg_order_value: 2000, churn_rate: 35, payback_period: 5, context: 'Starter kit ₹1,500–₹5,000; monthly consumables subscription ₹500–₹1,500 extends LTV.' },
    competitors: [
      { name: 'Ugaoo', type: 'Indian D2C', description: 'Plants + grow kits; strong D2C brand.' },
      { name: 'Farmizen', type: 'Indian Startup', description: 'Urban farm subscription; plot rental model.' },
      { name: 'Urban Kisaan', type: 'Indian Startup', description: 'Hydroponic kits for homes; Hyderabad-based.' },
    ],
  },
  'used-cooking-oil-biodiesel': {
    google_trends_keyword: 'used cooking oil collection India',
    unit_economics: { cac: 5000, ltv: 40000, ltv_cac_ratio: 8.0, avg_order_value: 8000, churn_rate: 20, payback_period: 8, context: 'Buy UCO at ₹25–₹35/litre; sell biodiesel at ₹65–₹85/litre; QSR chains and cloud kitchens are anchor suppliers.' },
    competitors: [
      { name: 'BioD Energy', type: 'Indian Startup', description: 'UCO-to-biodiesel; supplying Indian Airlines.' },
      { name: 'Godrej Tyson UCO', type: 'Large Player', description: 'Food company UCO recycling programme.' },
      { name: 'Local recyclers', type: 'Unorganised', description: 'Dominant but no digital tracking or quality control.' },
    ],
  },
  // ── AgriTech ─────────────────────────────────────────────────────────────────
  'agri-drone-services-marketplace': {
    google_trends_keyword: 'agricultural drone service India',
    unit_economics: { cac: 5000, ltv: 40000, ltv_cac_ratio: 8.0, avg_order_value: 8000, churn_rate: 22, payback_period: 8, context: 'Per-acre spray ₹400–₹600; avg farmer 5–10 acres/season; FPO bulk contracts lower per-session CAC.' },
    competitors: [
      { name: 'Garuda Aerospace', type: 'Indian Startup', description: 'Agri drone manufacturer + service; Series A.' },
      { name: 'Aarav Unmanned Systems', type: 'Indian Startup', description: 'Precision agriculture drones; Series A.' },
      { name: 'IdeaForge (drones)', type: 'Indian Listed', description: 'Defence + agri drones; NSE-listed.' },
    ],
  },
  'agri-input-subscription-box': {
    google_trends_keyword: 'agri inputs online India',
    unit_economics: { cac: 1500, ltv: 12000, ltv_cac_ratio: 8.0, avg_order_value: 2000, churn_rate: 25, payback_period: 7, context: 'Monthly/seasonal box ₹1,500–₹3,500; crop-specific customisation reduces returns; FPO B2B bulk is higher margin.' },
    competitors: [
      { name: 'DeHaat', type: 'Indian Unicorn', description: 'End-to-end agri input + advisory; Series D.' },
      { name: 'Bayer Direct (app)', type: 'MNC', description: 'Crop science inputs via app; brand heavy, expensive.' },
      { name: 'AgroStar', type: 'Indian Startup', description: 'Agri input e-commerce; mobile-first.' },
    ],
  },
  'agricultural-land-leasing-platform': {
    google_trends_keyword: 'agricultural land lease India',
    unit_economics: { cac: 5000, ltv: 50000, ltv_cac_ratio: 10.0, avg_order_value: 15000, churn_rate: 15, payback_period: 9, context: 'Commission 5–10% on lease deal value; avg 1-acre lease ₹15,000–₹30,000/year in Maharashtra/Punjab.' },
    competitors: [
      { name: 'Farmrise', type: 'Indian Startup', description: 'Farm aggregation + leasing; early stage.' },
      { name: 'Jivabhumi', type: 'Indian Startup', description: 'Agricultural land marketplace; seed funded.' },
      { name: 'Land Registry offices', type: 'Government', description: 'Official channel; slow and paper-heavy.' },
    ],
  },
  'cold-storage-as-a-service-produce': {
    google_trends_keyword: 'cold storage service India',
    unit_economics: { cac: 10000, ltv: 100000, ltv_cac_ratio: 10.0, avg_order_value: 20000, churn_rate: 15, payback_period: 10, context: 'Per-metric-ton ₹800–₹2,500/month; seasonal produce drives 70% revenue in harvest months; utilisation >75% for viability.' },
    competitors: [
      { name: 'Coldex Logistics', type: 'Indian Company', description: 'Cold chain logistics; pan-India network.' },
      { name: 'WayCool Foods', type: 'Indian Startup', description: 'Agri supply chain + cold storage; Series C.' },
      { name: 'National Bulk Handling', type: 'Indian Company', description: 'Commodity + agri cold storage; large scale.' },
    ],
  },
  'commodity-price-intelligence-agri-traders': {
    google_trends_keyword: 'mandi prices app India',
    unit_economics: { cac: 3000, ltv: 24000, ltv_cac_ratio: 8.0, avg_order_value: 6000, churn_rate: 25, payback_period: 7, context: 'Annual SaaS ₹5,000–₹15,000 per trader; trader networks create viral distribution; mandi integration data is key moat.' },
    competitors: [
      { name: 'Agriwatch', type: 'Indian Startup', description: 'Commodity price analytics for agri traders.' },
      { name: 'eNAM', type: 'Government', description: 'Govt national agri market; limited price intelligence features.' },
      { name: 'Edelweiss Agri', type: 'Financial Company', description: 'Commodity intelligence for institutional traders.' },
    ],
  },
  'crop-insurance-aggregator-fpo': {
    google_trends_keyword: 'crop insurance India',
    unit_economics: { cac: 2000, ltv: 15000, ltv_cac_ratio: 7.5, avg_order_value: 3000, churn_rate: 25, payback_period: 8, context: 'Commission 5–10% on premium; avg premium ₹2,000–₹5,000/acre; PMFBY subsidy reduces farmer out-of-pocket cost.' },
    competitors: [
      { name: 'PMFBY (Govt)', type: 'Government', description: 'Subsidised crop insurance; dominant but low awareness.' },
      { name: 'Mahindra Insurance Brokers', type: 'Large Player', description: 'Farm + rural insurance distribution.' },
      { name: 'Gramcover', type: 'Indian Startup', description: 'Rural insurance aggregator; seed funded.' },
    ],
  },
  'dairy-farmer-income-optimizer': {
    google_trends_keyword: 'dairy farmer income app India',
    unit_economics: { cac: 1000, ltv: 8000, ltv_cac_ratio: 8.0, avg_order_value: 1500, churn_rate: 22, payback_period: 7, context: 'SaaS ₹500–₹1,500/month per dairy; bulk cattle feed procurement + vet telemedicine upsell adds 40% to ARPU.' },
    competitors: [
      { name: 'Stellapps', type: 'Indian Startup', description: 'Dairy tech IoT platform; Series C, Temasek-backed.' },
      { name: 'HerdmanPlus', type: 'Indian Startup', description: 'Herd management app for dairy farmers.' },
      { name: 'National Dairy Development Board', type: 'Government', description: 'Cooperative model; Amul umbrella.' },
    ],
  },
  'dtc-honey-bee-products-brand': {
    google_trends_keyword: 'organic honey brand India',
    unit_economics: { cac: 500, ltv: 5000, ltv_cac_ratio: 10.0, avg_order_value: 800, churn_rate: 28, payback_period: 5, context: 'D2C margin 55–65%; avg order ₹600–₹1,200; subscription "honey box" reduces CAC payback to 3 months.' },
    competitors: [
      { name: 'Dabur Honey', type: 'Large FMCG', description: 'Market leader; brand recall strong but purity controversy.' },
      { name: 'Apis Himalaya', type: 'FMCG Brand', description: 'Premium honey brand; retail-first.' },
      { name: 'Two Brothers Organic', type: 'Indian D2C', description: 'Organic farm products; strong direct sales.' },
    ],
  },
  'farm-to-restaurant-marketplace': {
    google_trends_keyword: 'farm to table delivery India',
    unit_economics: { cac: 5000, ltv: 60000, ltv_cac_ratio: 12.0, avg_order_value: 15000, churn_rate: 15, payback_period: 8, context: 'Margin 15–25% on produce value; restaurants order weekly; quality consistency is primary retention driver.' },
    competitors: [
      { name: 'Ninjacart', type: 'Indian Unicorn', description: 'B2B agri supply chain; Walmart-backed, dominant.' },
      { name: 'WayCool', type: 'Indian Startup', description: 'Agri supply chain to restaurants + retail.' },
      { name: 'Veggie Mart', type: 'Local Startup', description: 'Farm-to-restaurant in select cities.' },
    ],
  },
  'fisheries-aquaculture-management-platform': {
    google_trends_keyword: 'aquaculture management software India',
    unit_economics: { cac: 3000, ltv: 24000, ltv_cac_ratio: 8.0, avg_order_value: 6000, churn_rate: 22, payback_period: 7, context: 'Annual SaaS ₹5,000–₹15,000; pond monitoring IoT add-on ₹8,000–₹25,000; Andhra/Odisha high-density markets.' },
    competitors: [
      { name: 'eFishery', type: 'Indonesian Unicorn', description: 'Aquaculture IoT; expanding to India.' },
      { name: 'Akua', type: 'Indian Startup', description: 'Shrimp farming management platform; seed stage.' },
      { name: 'Fisheries dept portals', type: 'Government', description: 'State govt platforms; basic and offline-heavy.' },
    ],
  },
  'food-safety-testing-lab-network': {
    google_trends_keyword: 'food safety testing India',
    unit_economics: { cac: 15000, ltv: 150000, ltv_cac_ratio: 10.0, avg_order_value: 40000, churn_rate: 12, payback_period: 10, context: 'Annual testing contract ₹2L–₹10L per FMCG brand; FSSAI compliance mandate creates non-discretionary demand.' },
    competitors: [
      { name: 'SGS India', type: 'Global', description: 'Global testing giant; expensive for MSMEs.' },
      { name: 'Bureau Veritas India', type: 'Global', description: 'Certification + testing; strong in export standards.' },
      { name: 'Eurofins India', type: 'Global', description: 'Food testing labs; lab-first model.' },
    ],
  },
  'hydroponics-farm-in-a-box-urban': {
    google_trends_keyword: 'hydroponic farming kit India',
    unit_economics: { cac: 800, ltv: 7000, ltv_cac_ratio: 8.75, avg_order_value: 4000, churn_rate: 30, payback_period: 6, context: 'Starter kit ₹3,000–₹12,000; monthly nutrient subscription ₹500–₹1,000; resell of produce adds community income.' },
    competitors: [
      { name: 'Urban Kisaan', type: 'Indian Startup', description: 'Hydroponic home farm kits; Hyderabad-based.' },
      { name: 'Barton Breeze', type: 'Indian Startup', description: 'Indoor farming systems; premium segment.' },
      { name: 'Clover Organics', type: 'Indian Startup', description: 'Microgreens + hydro kits; D2C.' },
    ],
  },
  'millets-ancient-grains-brand': {
    google_trends_keyword: 'millet products India buy online',
    unit_economics: { cac: 400, ltv: 5000, ltv_cac_ratio: 12.5, avg_order_value: 800, churn_rate: 25, payback_period: 4, context: 'D2C margin 55–65%; subscription monthly box ₹800–₹1,500; International Year of Millets (2023) tailwind sustaining.' },
    competitors: [
      { name: 'True Elements', type: 'Indian D2C', description: 'Clean food brand with millets + grains; strong Amazon.' },
      { name: 'Slurrp Farm', type: 'Indian D2C', description: 'Kids health food with millets; Series B.' },
      { name: 'India Gate (HUL)', type: 'FMCG', description: 'Grains brand launching millet products; distribution moat.' },
    ],
  },
  'organic-certification-saas-fpo': {
    google_trends_keyword: 'organic certification India farmers',
    unit_economics: { cac: 5000, ltv: 35000, ltv_cac_ratio: 7.0, avg_order_value: 8000, churn_rate: 20, payback_period: 8, context: 'Annual SaaS ₹5,000–₹15,000 per FPO; includes documentation, inspection scheduling, and audit trails.' },
    competitors: [
      { name: 'APEDA (govt portal)', type: 'Government', description: 'Official organic certification; manual, slow processes.' },
      { name: 'ECOCERT India', type: 'Global', description: 'Premium global organic certifier; expensive.' },
      { name: 'Control Union India', type: 'Global', description: 'International certification body; enterprise focus.' },
    ],
  },
  'plant-based-protein-brand-india': {
    google_trends_keyword: 'plant based protein India',
    unit_economics: { cac: 600, ltv: 6000, ltv_cac_ratio: 10.0, avg_order_value: 1000, churn_rate: 28, payback_period: 5, context: 'D2C margin 50–60%; avg order ₹800–₹1,500; gym + fitness channel partnerships cut CAC 40%.' },
    competitors: [
      { name: 'Good Dot', type: 'Indian Startup', description: 'Plant-based meat alternatives; Series A.' },
      { name: 'Blue Tribe Foods', type: 'Indian D2C', description: 'Plant-based meat; retail + D2C.' },
      { name: 'Vezlay Foods', type: 'Indian Brand', description: 'Soya protein products; retail-dominant.' },
    ],
  },
  'precision-irrigation-saas-small-farmers': {
    google_trends_keyword: 'drip irrigation app India',
    unit_economics: { cac: 3000, ltv: 24000, ltv_cac_ratio: 8.0, avg_order_value: 5000, churn_rate: 22, payback_period: 7, context: 'Annual SaaS + IoT ₹4,000–₹12,000/farmer; subsidy under PM-KUSUM scheme offsets hardware cost.' },
    competitors: [
      { name: 'Netafim India', type: 'Global', description: 'Drip irrigation hardware; expensive for small farmers.' },
      { name: 'Jain Irrigation', type: 'Indian Listed', description: 'Irrigation systems; dominant in Maharashtra.' },
      { name: 'Fasal', type: 'Indian Startup', description: 'IoT-based farm intelligence; Series A.' },
    ],
  },
  'spice-brand-farmer-traceability': {
    google_trends_keyword: 'organic spice brand India',
    unit_economics: { cac: 500, ltv: 5500, ltv_cac_ratio: 11.0, avg_order_value: 900, churn_rate: 24, payback_period: 4, context: 'D2C margin 55–65%; QR-code traceability earns 20–30% premium over commodity spices.' },
    competitors: [
      { name: 'Everest Spices', type: 'Large FMCG', description: 'Dominant retail brand; no traceability story.' },
      { name: 'Keya (D2C)', type: 'Indian D2C', description: 'Premium spices; limited traceability.' },
      { name: 'Organic Tattva', type: 'Indian D2C', description: 'Organic spices; USDA-certified, premium segment.' },
    ],
  },
  'veterinary-telehealth-livestock': {
    google_trends_keyword: 'online vet consultation India',
    unit_economics: { cac: 1500, ltv: 12000, ltv_cac_ratio: 8.0, avg_order_value: 500, churn_rate: 25, payback_period: 8, context: 'Per-consultation ₹200–₹500; monthly livestock health plan ₹800–₹1,500; dairy farmer segment has highest LTV.' },
    competitors: [
      { name: 'MeriiGaay', type: 'Indian Startup', description: 'Dairy farmer platform with vet services; seed funded.' },
      { name: 'Animall', type: 'Indian Startup', description: 'Cattle trading + vet services; Series A.' },
      { name: 'Govt vet services', type: 'Government', description: 'Free but limited to govt vets; long wait times.' },
    ],
  },
  // ── B2B Services ─────────────────────────────────────────────────────────────
  'architecture-interior-design-platform-homeowners': {
    google_trends_keyword: 'hire architect online India',
    unit_economics: { cac: 8000, ltv: 80000, ltv_cac_ratio: 10.0, avg_order_value: 30000, churn_rate: 15, payback_period: 9, context: 'Platform fee 8–15% on project value; avg residential project ₹5L–₹30L; referral from completed projects drives 50%+ new leads.' },
    competitors: [
      { name: 'Livspace', type: 'Indian Unicorn', description: 'Interior design + execution; tech-enabled, 50 cities.' },
      { name: 'ArchiOnline', type: 'Indian Startup', description: 'Architect marketplace; early stage.' },
      { name: 'HomeLane', type: 'Indian Startup', description: 'Modular interiors; design-light execution-heavy.' },
    ],
  },
  'b2b-procurement-financing-platform': {
    google_trends_keyword: 'B2B procurement finance India',
    unit_economics: { cac: 20000, ltv: 200000, ltv_cac_ratio: 10.0, avg_order_value: 60000, churn_rate: 15, payback_period: 10, context: 'Platform fee 1–2% on financed transactions; avg transaction ₹5L–₹50L; repeat monthly purchasing drives LTV.' },
    competitors: [
      { name: 'Moglix', type: 'Indian Unicorn', description: 'B2B industrial procurement; Series F, strong manufacturing.' },
      { name: 'Ofbusiness', type: 'Indian Unicorn', description: 'B2B commerce + credit for MSMEs; heavily funded.' },
      { name: 'Jumbotail', type: 'Indian Startup', description: 'B2B grocery + credit for kirana; Series C.' },
    ],
  },
  'channel-partner-management-saas': {
    google_trends_keyword: 'channel partner management software India',
    unit_economics: { cac: 20000, ltv: 180000, ltv_cac_ratio: 9.0, avg_order_value: 60000, churn_rate: 15, payback_period: 10, context: 'Annual SaaS ₹3L–₹15L; FMCG, consumer electronics, and insurance companies have 500–5,000 channel partners each.' },
    competitors: [
      { name: 'ChannelStack', type: 'Indian Startup', description: 'Channel management SaaS; early stage.' },
      { name: 'Salesforce PRM', type: 'Global', description: 'Enterprise CRM with partner portal; expensive for Indian SMEs.' },
      { name: 'Zoho CRM Plus', type: 'Indian SaaS', description: 'Bundled CRM; limited partner-specific modules.' },
    ],
  },
  'employer-of-record-platform-india': {
    google_trends_keyword: 'employer of record India',
    unit_economics: { cac: 30000, ltv: 360000, ltv_cac_ratio: 12.0, avg_order_value: 120000, churn_rate: 12, payback_period: 10, context: 'Per-employee ₹3,000–₹8,000/month; multinational expanding to India without entity drives 70% of demand.' },
    competitors: [
      { name: 'Deel', type: 'Global Unicorn', description: 'Global EOR + payments; expensive for India-inbound.' },
      { name: 'Remote.com', type: 'Global', description: 'EOR platform; USD pricing.' },
      { name: 'Quess Corp EOR', type: 'Indian Listed', description: 'India-specific EOR; traditional staffing model.' },
    ],
  },
  'export-documentation-automation-platform': {
    google_trends_keyword: 'export documentation software India',
    unit_economics: { cac: 15000, ltv: 120000, ltv_cac_ratio: 8.0, avg_order_value: 40000, churn_rate: 15, payback_period: 10, context: 'Annual SaaS ₹30,000–₹1.5L; DGFT compliance mandate creates non-discretionary demand for exporters >₹1Cr.' },
    competitors: [
      { name: 'ImpexDocs', type: 'Indian Startup', description: 'Export documentation software; bootstrapped.' },
      { name: 'TradeEasy', type: 'Indian Startup', description: 'Trade finance + export docs; early stage.' },
      { name: 'Eccat', type: 'Indian Platform', description: 'Export compliance tools; limited AI automation.' },
    ],
  },
  'fleet-management-saas-logistics-smes': {
    google_trends_keyword: 'fleet management software India',
    unit_economics: { cac: 15000, ltv: 135000, ltv_cac_ratio: 9.0, avg_order_value: 45000, churn_rate: 15, payback_period: 9, context: 'Per-vehicle ₹500–₹1,500/month; 50-vehicle fleet = ₹50,000–₹75,000/month ARR; fuel savings ROI clinches retention.' },
    competitors: [
      { name: 'Fleetx', type: 'Indian Startup', description: 'Fleet management + analytics; Series B.' },
      { name: 'Tata Motors Fleet Edge', type: 'Large Player', description: 'Bundled with Tata trucks; limited to OEM vehicles.' },
      { name: 'Locus', type: 'Indian Startup', description: 'Route optimisation; logistics-first, not fleet mgmt.' },
    ],
  },
  'fractional-cfo-network-startups': {
    google_trends_keyword: 'fractional CFO India startup',
    unit_economics: { cac: 10000, ltv: 100000, ltv_cac_ratio: 10.0, avg_order_value: 30000, churn_rate: 18, payback_period: 9, context: 'Monthly retainer ₹15,000–₹50,000; fundraising event triggers upsell to full advisory ₹5L–₹20L project.' },
    competitors: [
      { name: 'CFO Bridge', type: 'Indian Startup', description: 'Fractional CFO marketplace; Series A.' },
      { name: 'Veritaas Advisory', type: 'Indian Firm', description: 'Startup CFO advisory; boutique firm.' },
      { name: 'Independent CFOs', type: 'Freelancers', description: 'Solo practitioners; unbranded, hard to scale.' },
    ],
  },
  'freelance-tech-talent-marketplace-startups': {
    google_trends_keyword: 'hire freelance developer India',
    unit_economics: { cac: 5000, ltv: 50000, ltv_cac_ratio: 10.0, avg_order_value: 15000, churn_rate: 20, payback_period: 8, context: 'Platform commission 15–20% of contract value; avg project ₹50,000–₹5L; vetting premium earns 2x over Upwork.' },
    competitors: [
      { name: 'Toptal', type: 'Global', description: 'Elite vetted freelancers; USD pricing, top 3% developers.' },
      { name: 'Turing.com', type: 'Global', description: 'Remote dev talent; US-first but Indian dev supply.' },
      { name: 'Flexiple', type: 'Indian Startup', description: 'Vetted tech freelancers for Indian startups; bootstrapped.' },
    ],
  },
  'hr-tech-blue-collar-workforce': {
    google_trends_keyword: 'blue collar worker management app India',
    unit_economics: { cac: 10000, ltv: 90000, ltv_cac_ratio: 9.0, avg_order_value: 30000, churn_rate: 18, payback_period: 9, context: 'Per-worker ₹100–₹300/month; 1,000-worker construction site = ₹1L–₹3L/month ARR; ESIC/PF compliance built-in drives stickiness.' },
    competitors: [
      { name: 'BetterPlace', type: 'Indian Startup', description: 'Blue-collar HR tech; Series C, Stellaris-backed.' },
      { name: 'Workex', type: 'Indian Startup', description: 'Blue-collar jobs + HR management; Series A.' },
      { name: 'Keka HR', type: 'Indian Startup', description: 'HRMS; primarily white-collar, blue-collar module nascent.' },
    ],
  },
  'ip-patent-filing-platform-msme': {
    google_trends_keyword: 'patent filing India MSME',
    unit_economics: { cac: 5000, ltv: 40000, ltv_cac_ratio: 8.0, avg_order_value: 15000, churn_rate: 20, payback_period: 8, context: 'Patent filing ₹8,000–₹25,000; trademark ₹3,000–₹8,000; IP portfolio management SaaS ₹5,000–₹15,000/year.' },
    competitors: [
      { name: 'LegalWiz', type: 'Indian Startup', description: 'IP filing + compliance; bootstrapped, profitable.' },
      { name: 'Vakilsearch', type: 'Indian Startup', description: 'Legal services + IP; dominant in MSME registration.' },
      { name: 'IPR India (Govt)', type: 'Government', description: 'Official patent office; slow, no digital filing advisory.' },
    ],
  },
  'staffing-agency-management-saas': {
    google_trends_keyword: 'staffing agency software India',
    unit_economics: { cac: 20000, ltv: 180000, ltv_cac_ratio: 9.0, avg_order_value: 60000, churn_rate: 15, payback_period: 10, context: 'Annual SaaS ₹3L–₹15L; mid-size staffing firms (50–500 placements/month) are sweet spot.' },
    competitors: [
      { name: 'Bullhorn India', type: 'Global', description: 'Global staffing ATS; expensive, US-centric workflows.' },
      { name: 'Vincere', type: 'Global', description: 'Recruitment CRM; popular with boutique staffing agencies.' },
      { name: 'SnapRecruit', type: 'Indian Startup', description: 'India-built staffing software; limited features.' },
    ],
  },
  'sustainability-reporting-saas-india': {
    google_trends_keyword: 'ESG reporting software India',
    unit_economics: { cac: 25000, ltv: 225000, ltv_cac_ratio: 9.0, avg_order_value: 75000, churn_rate: 12, payback_period: 10, context: 'Annual SaaS ₹5L–₹20L; SEBI BRSR mandate for listed companies creates compliance-driven non-discretionary demand.' },
    competitors: [
      { name: 'Persefoni', type: 'Global', description: 'Carbon accounting SaaS; USD pricing, enterprise focus.' },
      { name: 'Greennomy', type: 'Indian Startup', description: 'ESG reporting for Indian companies; early stage.' },
      { name: 'Emitwise', type: 'Global', description: 'Supply chain emissions tracking; manufacturing verticals.' },
    ],
  },
  'vendor-compliance-audit-saas': {
    google_trends_keyword: 'vendor compliance management India',
    unit_economics: { cac: 20000, ltv: 180000, ltv_cac_ratio: 9.0, avg_order_value: 60000, churn_rate: 15, payback_period: 10, context: 'Annual SaaS ₹3L–₹12L; manufacturing and retail companies with 100+ vendors are primary buyers.' },
    competitors: [
      { name: 'Ariba (SAP)', type: 'Global', description: 'Enterprise procurement + compliance; expensive, complex.' },
      { name: 'Coupa', type: 'Global', description: 'Spend management platform; USD pricing.' },
      { name: 'Zycus India', type: 'Indian Startup', description: 'Procurement intelligence; Series C, India HQ.' },
    ],
  },
  // ── Manufacturing ─────────────────────────────────────────────────────────────
  '3d-printing-service-bureau-industrial': {
    google_trends_keyword: '3D printing service India',
    unit_economics: { cac: 10000, ltv: 100000, ltv_cac_ratio: 10.0, avg_order_value: 25000, churn_rate: 18, payback_period: 9, context: 'Per-job ₹5,000–₹50,000; aerospace and auto prototyping are premium verticals; repeat prototyping cycles build LTV.' },
    competitors: [
      { name: 'Divide by Zero', type: 'Indian Startup', description: '3D printing service bureau + machine sales; Thane-based.' },
      { name: 'Think3D', type: 'Indian Startup', description: '3D printing + manufacturing services; Hyderabad.' },
      { name: 'Stratasys India', type: 'Global MNC', description: 'Enterprise 3D printing; very expensive entry point.' },
    ],
  },
  'chemical-formulation-lab-industrial': {
    google_trends_keyword: 'chemical testing lab India',
    unit_economics: { cac: 20000, ltv: 200000, ltv_cac_ratio: 10.0, avg_order_value: 50000, churn_rate: 12, payback_period: 10, context: 'Annual B2B contract ₹2L–₹10L; specialty chemicals for FMCG and pharma carry highest margins.' },
    competitors: [
      { name: 'Rossari Biotech', type: 'Indian Listed', description: 'Specialty chemicals; NSE-listed, strong in textiles.' },
      { name: 'Galaxy Surfactants', type: 'Indian Listed', description: 'Personal care chemicals; listed, premium segment.' },
      { name: 'Fine Organic Industries', type: 'Indian Listed', description: 'Food + specialty chemicals; strong in additives.' },
    ],
  },
  'contract-electronics-manufacturing-marketplace': {
    google_trends_keyword: 'electronics manufacturing India',
    unit_economics: { cac: 30000, ltv: 300000, ltv_cac_ratio: 10.0, avg_order_value: 100000, churn_rate: 10, payback_period: 10, context: 'Platform commission 3–5% on contracted manufacturing; avg order ₹10L–₹1Cr; PLI scheme demand boosting.' },
    competitors: [
      { name: 'Foxconn India', type: 'Global MNC', description: 'iPhone manufacturer; enterprise scale only.' },
      { name: 'Dixon Technologies', type: 'Indian Listed', description: 'Contract electronics; NSE-listed, dominant.' },
      { name: 'Kaynes Technology', type: 'Indian Listed', description: 'Specialty electronics manufacturing; listed.' },
    ],
  },
  'custom-industrial-uniforms-workwear-brand': {
    google_trends_keyword: 'industrial uniform manufacturer India',
    unit_economics: { cac: 10000, ltv: 100000, ltv_cac_ratio: 10.0, avg_order_value: 30000, churn_rate: 15, payback_period: 8, context: 'B2B annual contract ₹2L–₹20L; construction, manufacturing, and hospitality are anchor verticals; repeat annual orders.' },
    competitors: [
      { name: 'Arvind Workwear', type: 'Indian Listed', description: 'Textile giant with workwear division; strong institutional.' },
      { name: 'Raymond Workwear', type: 'Indian Brand', description: 'Premium uniforms; hospitality + services focus.' },
      { name: 'Local garment exporters', type: 'Unorganised', description: 'Price-competitive; no brand, limited reliability.' },
    ],
  },
  'ev-battery-pack-assembly-2wheelers': {
    google_trends_keyword: 'EV battery manufacturer India',
    unit_economics: { cac: 50000, ltv: 500000, ltv_cac_ratio: 10.0, avg_order_value: 150000, churn_rate: 10, payback_period: 12, context: 'B2B supply to EV OEMs; avg battery pack ₹25,000–₹50,000; PLI scheme subsidies reduce capex 20–30%.' },
    competitors: [
      { name: 'Exide EV', type: 'Indian Listed', description: 'Legacy battery maker pivoting to EV; brand trust.' },
      { name: 'Greenvolt', type: 'Indian Startup', description: 'EV battery packs; seed funded.' },
      { name: 'BPR Automotive', type: 'Indian Company', description: 'Lithium packs for 2W and 3W EVs.' },
    ],
  },
  'handloom-artisan-fabric-b2b-marketplace': {
    google_trends_keyword: 'handloom fabric wholesale India',
    unit_economics: { cac: 5000, ltv: 50000, ltv_cac_ratio: 10.0, avg_order_value: 15000, churn_rate: 18, payback_period: 8, context: 'Commission 10–15% on orders; fashion brands and export buyers pay 30–50% premium for GI-tagged handlooms.' },
    competitors: [
      { name: 'Craftsvilla', type: 'Indian Startup', description: 'Ethnic fashion marketplace; artisan-sourced products.' },
      { name: 'Okhai', type: 'Social Enterprise', description: 'Tata-backed artisan platform; women weavers.' },
      { name: 'Handloom Mark (Govt)', type: 'Government', description: 'Certification body; no marketplace.' },
    ],
  },
  'industrial-iot-retrofitting-legacy-machines': {
    google_trends_keyword: 'industrial IoT India manufacturing',
    unit_economics: { cac: 60000, ltv: 600000, ltv_cac_ratio: 10.0, avg_order_value: 150000, churn_rate: 10, payback_period: 12, context: 'Hardware + SaaS ₹1L–₹5L per machine line; factories with 10+ machines = ₹10L–₹50L ARR per customer.' },
    competitors: [
      { name: 'Altizon', type: 'Indian Startup', description: 'Industrial IoT platform; Series B, Pune-based.' },
      { name: 'Peel-Works', type: 'Indian Startup', description: 'Manufacturing intelligence; FMCG + auto focus.' },
      { name: 'GE Digital (Predix)', type: 'Global', description: 'Industrial IoT platform; expensive, needs SAP integration.' },
    ],
  },
  'medical-device-manufacturing-tier2-hospitals': {
    google_trends_keyword: 'medical device manufacturer India',
    unit_economics: { cac: 30000, ltv: 300000, ltv_cac_ratio: 10.0, avg_order_value: 80000, churn_rate: 10, payback_period: 12, context: 'Supply contract ₹5L–₹50L per hospital group; PLI scheme + import substitution policy creates tailwind.' },
    competitors: [
      { name: 'Trivitron Healthcare', type: 'Indian Listed', description: 'Medical device manufacturer; diagnostics focus.' },
      { name: 'Poly Medicure', type: 'Indian Listed', description: 'Medical disposables; export-focused.' },
      { name: 'Agappe Diagnostics', type: 'Indian Company', description: 'In-vitro diagnostics devices; Tier 2 hospitals.' },
    ],
  },
  'modular-furniture-manufacturing-brand': {
    google_trends_keyword: 'modular furniture manufacturer India',
    unit_economics: { cac: 8000, ltv: 60000, ltv_cac_ratio: 7.5, avg_order_value: 40000, churn_rate: 15, payback_period: 8, context: 'Residential kitchen ₹1.5L–₹8L; margin 35–45% after material; referrals from completed homes are primary acquisition.' },
    competitors: [
      { name: 'Godrej Interio', type: 'Large Player', description: 'Brand trust + retail network; premium segment.' },
      { name: 'HomeLane', type: 'Indian Startup', description: 'D2C modular interiors; tech-enabled visualisation.' },
      { name: 'Spacewood', type: 'Indian Brand', description: 'Modular furniture; strong in Tier 2 cities.' },
    ],
  },
  'packaging-design-procurement-platform-smes': {
    google_trends_keyword: 'custom packaging design India',
    unit_economics: { cac: 5000, ltv: 45000, ltv_cac_ratio: 9.0, avg_order_value: 12000, churn_rate: 20, payback_period: 8, context: 'Design fee ₹5,000–₹20,000; procurement commission 8–12% on print orders; D2C brand boom drives demand.' },
    competitors: [
      { name: 'Packhelp India', type: 'Global', description: 'Custom packaging marketplace; European roots, India presence.' },
      { name: 'Bizongo', type: 'Indian Startup', description: 'B2B packaging procurement; Series D.' },
      { name: 'Uflex', type: 'Indian Listed', description: 'Flexible packaging manufacturer; enterprise scale.' },
    ],
  },
  'quality-inspection-saas-export-manufacturers': {
    google_trends_keyword: 'quality inspection software India',
    unit_economics: { cac: 20000, ltv: 180000, ltv_cac_ratio: 9.0, avg_order_value: 60000, churn_rate: 15, payback_period: 10, context: 'Annual SaaS ₹3L–₹12L; garment, auto parts, and pharma exporters are primary verticals needing buyer audits.' },
    competitors: [
      { name: 'QIMA India', type: 'Global', description: 'Global inspection + audit; strong in textile exports.' },
      { name: 'Asiainspection', type: 'Global', description: 'Factory inspections for exporters; global platform.' },
      { name: 'Bureau Veritas QA', type: 'Global', description: 'Quality certification + inspection; premium pricing.' },
    ],
  },
  'sme-factory-compliance-automation': {
    google_trends_keyword: 'factory compliance automation India',
    unit_economics: { cac: 15000, ltv: 135000, ltv_cac_ratio: 9.0, avg_order_value: 45000, churn_rate: 15, payback_period: 9, context: 'Annual SaaS ₹30,000–₹1.5L; Factories Act + CLRA + EPF compliance creates non-discretionary need.' },
    competitors: [
      { name: 'Greytip (compliance)', type: 'Indian Startup', description: 'Payroll + statutory compliance; bootstrapped.' },
      { name: 'Keka Compliance', type: 'Indian Startup', description: 'Compliance module in HRMS; white-collar focus.' },
      { name: 'Simpliance', type: 'Indian Startup', description: 'Labour compliance SaaS; factory + office coverage.' },
    ],
  },
  'solar-panel-manufacturing-components': {
    google_trends_keyword: 'solar panel manufacturer India',
    unit_economics: { cac: 100000, ltv: 1000000, ltv_cac_ratio: 10.0, avg_order_value: 300000, churn_rate: 8, payback_period: 14, context: 'B2B supply to EPC contractors; PLI scheme provides ₹4,500/kW incentive; domestic demand from PM Surya Ghar scheme.' },
    competitors: [
      { name: 'Adani Solar', type: 'Large Conglomerate', description: 'Largest domestic solar manufacturer; fully integrated.' },
      { name: 'Waaree Energies', type: 'Indian Listed', description: 'Panel manufacturer + EPC; listed on NSE.' },
      { name: 'Vikram Solar', type: 'Indian Startup', description: 'Kolkata-based panel maker; export-oriented.' },
    ],
  },
  'steel-metal-scrap-trading-platform': {
    google_trends_keyword: 'steel scrap trading India',
    unit_economics: { cac: 15000, ltv: 150000, ltv_cac_ratio: 10.0, avg_order_value: 500000, churn_rate: 15, payback_period: 9, context: 'Commission 0.5–1.5% on traded value; avg transaction ₹5L–₹50L; steel mini-mills and auto ancillaries are key buyers.' },
    competitors: [
      { name: 'Metal Power (exchange)', type: 'Indian Platform', description: 'Metal trading platform; limited digital penetration.' },
      { name: 'Mandi.ai', type: 'Indian Startup', description: 'Commodity trading digitisation; early stage.' },
      { name: 'Ferrous scrap dealers', type: 'Unorganised', description: 'Dominant; no pricing transparency or trust mechanism.' },
    ],
  },
  'textile-waste-upcycling-brand': {
    google_trends_keyword: 'textile waste recycling India',
    unit_economics: { cac: 600, ltv: 6000, ltv_cac_ratio: 10.0, avg_order_value: 1200, churn_rate: 25, payback_period: 5, context: 'D2C margin 50–60%; B2B brand licensing 15–20% royalty; Surat/Tirupur garment waste is near-zero raw material cost.' },
    competitors: [
      { name: 'Doodlage', type: 'Indian D2C', description: 'Upcycled fashion from textile waste; B2B + D2C.' },
      { name: 'Patagonia India (worn wear)', type: 'Global Brand', description: 'Upcycled outdoor wear; premium, not India-specific.' },
      { name: 'FABRICS India', type: 'Industry Body', description: 'Textile waste awareness; not commercial.' },
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
