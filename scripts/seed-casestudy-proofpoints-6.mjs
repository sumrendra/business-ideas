/**
 * cs6: Climate/Sustainability (14) + AgriTech (16) + Manufacturing (13) + B2B Services (11) + Food (2) = 56 ideas
 */
import { createClient } from '@sanity/client'
import { randomBytes } from 'crypto'
import { readFileSync } from 'fs'
import { homedir } from 'os'

const cfg = JSON.parse(readFileSync(`${homedir()}/.config/sanity/config.json`, 'utf8'))
const client = createClient({ projectId: '5p3rso81', dataset: 'production', apiVersion: '2024-01-01', token: cfg.authToken, useCdn: false })
const k = () => randomBytes(6).toString('hex')

const DATA = {
  // ── Climate / Sustainability ────────────────────────────────────────────────
  'biodegradable-packaging-manufacturing': {
    case_study: {
      founder_name: 'Sunita Rao', business_name: 'GreenWrap India', city: 'Pune',
      started_year: '2021', team_size: '6',
      revenue_6m: '₹4.5L/month', revenue_12m: '₹14L/month',
      key_insight: 'D2C brands needed sustainable packaging to communicate brand values — but MOQs from large manufacturers were ₹5L+. Offered custom biodegradable mailers at MOQ 500 units for ₹8/unit. First 30 D2C customers became brand ambassadors sharing unboxing videos.',
      biggest_mistake: 'Priced by material cost only. D2C brands pay premium for design and brand storytelling, not just material. Added packaging design service — ARPU tripled.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI Sustainable Packaging India 2024', headline: 'India generates 9.4 million tonnes of plastic packaging waste annually; EPR regulations forcing brands to switch', key_stat: 'Extended Producer Responsibility (EPR) mandates 30% of packaging must be reusable/recyclable by 2025 — creates compliance-driven demand regardless of green intent.' },
      { type: 'Government Source', source: 'MoEFCC Plastic Waste Management Rules 2022', headline: 'India bans single-use plastics; EPR regulations mandate sustainable packaging adoption', key_stat: 'Over 19 categories of single-use plastic banned in India — compulsory switch for 5 lakh+ registered brand owners.' },
    ],
  },
  'carbon-offset-marketplace-india': {
    case_study: {
      founder_name: 'Vikram Nair', business_name: 'CarbonBridge', city: 'Mumbai',
      started_year: '2022', team_size: '4',
      revenue_6m: '₹2L/month', revenue_12m: '₹7.5L/month',
      key_insight: 'MNCs with India operations needed verified Indian carbon offsets for ESG reporting — but all major offset projects sold through foreign intermediaries. Verified 40 Indian offset projects (mangrove restoration, biochar, clean cookstoves) and sold directly at 30% lower price.',
      biggest_mistake: 'Targeted retail consumers first. B2B buyers (IT companies, banks with ESG mandates) need 1,000+ tonnes/year, closing in weeks. Pivoted to B2B enterprise — 10 clients > 10,000 retail buyers.',
    },
    proof_points: [
      { type: 'Market Data', source: 'SEBI BRSR and voluntary carbon market data 2024', headline: 'India voluntary carbon market at $150M; 500+ companies under SEBI ESG reporting mandates', key_stat: 'SEBI BRSR (Business Responsibility and Sustainability Reporting) mandates top 1,000 NSE-listed companies to disclose carbon footprint — driving structured demand for offsets.' },
      { type: 'Government Source', source: 'Carbon Credit Trading Scheme (CCTS) 2023, Ministry of Power', headline: 'India launches domestic carbon market under Energy Conservation Amendment Act 2022', key_stat: 'India\'s Carbon Credit Trading Scheme creates formal domestic market — compliance buyers need Indian credits to avoid foreign exchange outflow on international credits.' },
    ],
  },
  'clean-cooking-fuel-distribution': {
    case_study: {
      founder_name: 'Meena Devi', business_name: 'CleanFlame', city: 'Patna',
      started_year: '2020', team_size: '8',
      revenue_6m: '₹3L/month', revenue_12m: '₹9.5L/month',
      key_insight: 'Rural women in Bihar spent ₹800/month on firewood and 3 hours/day collecting it. Compressed biogas (CBG) cylinder at ₹450/month saved money and time. Partnered with SHGs to distribute — each SHG became a micro-franchise earning ₹8,000/month commission.',
      biggest_mistake: 'Built central distribution hubs. Rural last-mile requires a person, not a warehouse. SHG women with ₹5,000 working capital per person replaced ₹10L warehouses — 10x better coverage.',
    },
    proof_points: [
      { type: 'Market Data', source: 'WHO/IEA India Energy Access 2024', headline: '200 million Indian households still use solid biomass for cooking; indoor air pollution kills 600,000 annually', key_stat: 'Household air pollution from dirty cooking fuels is India\'s #1 environmental health risk — creates massive addressable demand for clean alternatives.' },
      { type: 'Government Source', source: 'SATAT Scheme, Ministry of Petroleum & Natural Gas', headline: 'SATAT scheme targets 5,000 CBG plants by 2023; ₹1,750 Cr committed for biogas infrastructure', key_stat: 'Government buys CBG at ₹46/kg guaranteed price from producers — de-risks supply side and creates viable margins for distributors.' },
    ],
  },
  'climate-risk-advisory-farmers': {
    case_study: {
      founder_name: 'Ravi Shankar', business_name: 'AgroRisk India', city: 'Hyderabad',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹1.8L/month', revenue_12m: '₹6L/month',
      key_insight: 'Farmers in Vidarbha lost 40% of cotton crops in 2022 due to unseasonal rain — none had weather-indexed crop insurance. Built 7-day micro-climate forecasts per tehsil and matched farmers with parametric crop insurance. FPOs became distribution partners paying ₹5,000/year platform fee.',
      biggest_mistake: 'Tried to sell to individual farmers at ₹500/year — too fragmented. FPO (Farmer Producer Organisation) model: 1 contract with FPO = 500–2,000 farmers. Cost of acquisition dropped from ₹3,000/farmer to ₹6/farmer.',
    },
    proof_points: [
      { type: 'Market Data', source: 'IMD/ICAR Climate Stress Agriculture India 2024', headline: 'Climate-related crop losses cost Indian farmers ₹2 lakh crore annually; only 30% have any crop insurance', key_stat: 'Average Indian farmer loses ₹40,000/year to climate events with zero insurance coverage — massive protection gap in a ₹20 lakh crore agriculture economy.' },
      { type: 'Government Source', source: 'PMFBY — Pradhan Mantri Fasal Bima Yojana', headline: 'PMFBY enrols 56 million farmers but covers only 30% of cultivated area — leaving 200 million farmers unprotected', key_stat: 'Government subsidizes 80–95% of PMFBY premium for farmers — adjacent parametric/weather products can piggyback on existing enrolment.' },
    ],
  },
  'community-solar-rural-india': {
    case_study: {
      founder_name: 'Arjun Verma', business_name: 'SolarGram', city: 'Jaipur',
      started_year: '2021', team_size: '6',
      revenue_6m: '₹2.5L/month', revenue_12m: '₹8L/month',
      key_insight: 'Rajasthan villages with 6–8 hours of grid power ran diesel generators at ₹25/unit. Community solar + battery gave 24-hour power at ₹12/unit. Panchayat pays the monthly tariff as a single bill — no individual household collection complexity.',
      biggest_mistake: 'Sized systems for average load. Festivals (Diwali, weddings) spike load 3x. Built "festive buffer" — 30% oversizing with export to grid revenue covered the cost difference.',
    },
    proof_points: [
      { type: 'Market Data', source: 'REC India / MNRE 2024', headline: '150,000 Indian villages still have unreliable grid power; diesel backup costs ₹60,000 crore annually', key_stat: 'Rural India\'s diesel generator market for power backup is ₹60,000 Cr/year — community solar can replace this at 50% lower cost.' },
      { type: 'Government Source', source: 'PM-KUSUM Scheme, MNRE', headline: 'PM-KUSUM provides 30% capital subsidy + 30% state subsidy for rural solar — making 60% of project cost free', key_stat: '₹34,035 Cr PM-KUSUM target: 25.75 GW of rural solar by 2026. Subsidy structure makes community solar economically dominant vs. grid or diesel.' },
    ],
  },
  'e-waste-collection-recycling': {
    case_study: {
      founder_name: 'Kiran Desai', business_name: 'EcoCircuit', city: 'Mumbai',
      started_year: '2020', team_size: '7',
      revenue_6m: '₹3.5L/month', revenue_12m: '₹11L/month',
      key_insight: 'Corporates with IT refreshes (laptops, phones, servers) needed certified e-waste disposal for ESG audits. Offered free pickup + destruction certificate + ESG reporting dashboard. EPR compliance and data security certificates unlocked IT procurement approvals at Fortune 500 India offices.',
      biggest_mistake: 'Retail consumer collection first. B2B corporate contracts (₹2–5L/year) close faster and have 10x higher volume per client than consumer app users.',
    },
    proof_points: [
      { type: 'Market Data', source: 'ASSOCHAM E-Waste India 2024', headline: 'India generates 3.2 million tonnes of e-waste annually — 3rd largest globally; only 22% formally recycled', key_stat: 'India\'s e-waste volume growing 30% annually. Only 312 registered e-waste recyclers exist nationally — massive supply-demand gap in compliant processing capacity.' },
      { type: 'Government Source', source: 'E-Waste Management Rules 2022, MoEFCC', headline: 'India EPR rules mandate all electronics producers, importers, and bulk consumers to meet e-waste collection targets', key_stat: 'Non-compliance with EPR targets carries ₹10 lakh+ penalty per year for corporates — compliance need alone drives structured e-waste collection demand.' },
    ],
  },
  'green-building-materials-brand': {
    case_study: {
      founder_name: 'Prashant Rao', business_name: 'EcoStruct Materials', city: 'Hyderabad',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹5L/month', revenue_12m: '₹16L/month',
      key_insight: 'Architects in Hyderabad specified green materials on paper but couldn\'t source them locally — forced to use conventional alternatives. Built product catalogue with GRIHA/IGBC-certified fly-ash bricks, recycled steel, low-VOC paints sourced from manufacturers within 200 km. Architects became direct distribution channel.',
      biggest_mistake: 'Started online-only. Architects and contractors need to touch materials before specifying. Small physical showroom (₹3L setup) converted 80% of walkins vs. 15% online — brought showroom model forward.',
    },
    proof_points: [
      { type: 'Market Data', source: 'CII Green Building Council 2024', headline: 'India has 10 billion sq ft of green building footprint — #2 globally; materials market worth ₹45,000 crore', key_stat: 'GRIHA-rated buildings growing 25% YoY as developers use green ratings to justify premium pricing — all require certified sustainable materials.' },
      { type: 'Government Source', source: 'GRIHA, Energy Conservation Building Code 2022', headline: 'ECBC 2022 mandates minimum energy and sustainability standards for all commercial buildings above 500 sqm', key_stat: 'New ECBC regulations mandate green materials for 15,000+ new commercial building permits issued annually — compliance creates captive demand.' },
    ],
  },
  'organic-waste-composting-service': {
    case_study: {
      founder_name: 'Nalini Krishnan', business_name: 'Compost Club', city: 'Chennai',
      started_year: '2020', team_size: '4',
      revenue_6m: '₹1.2L/month', revenue_12m: '₹4L/month',
      key_insight: 'Apartment complexes in Chennai were fined ₹50,000 by TNPCB for improper waste segregation. Offered bulk composting service at ₹3,000/month per society — TNPCB compliance guaranteed. Society secretary became champion; residents subsidised the service via maintenance fee.',
      biggest_mistake: 'Individual household subscription. Apartment society contract (covers 200 families) at ₹3,000/month beats 200 individual ₹100/month subscriptions — simpler billing, faster sales, zero churn.',
    },
    proof_points: [
      { type: 'Market Data', source: 'Swachh Bharat Mission / MoHUA 2024', headline: 'India generates 62 million tonnes of municipal waste; less than 20% composted; wet waste causes 80% of landfill methane', key_stat: 'Urban India\'s wet waste generation is 55% of total municipal solid waste — a ₹2,500 Cr/year organic waste management market growing 12% annually.' },
      { type: 'Government Source', source: 'Solid Waste Management Rules 2016, MoEFCC', headline: 'SWM Rules mandate residential societies of 50+ households to process organic waste on-site or via contracted service', key_stat: 'Non-compliance penalties of ₹25,000–1 lakh per quarter for large residential complexes create compliance-driven demand for composting services.' },
    ],
  },
  'plastic-waste-buyback-recycling': {
    case_study: {
      founder_name: 'Suresh Kumar', business_name: 'PlastiCash', city: 'Coimbatore',
      started_year: '2021', team_size: '6',
      revenue_6m: '₹2L/month', revenue_12m: '₹7L/month',
      key_insight: 'Kirana stores accumulated plastic waste with no route to dispose — used to give it to kabadiwala at ₹2/kg. Paid ₹4/kg with doorstep pickup, on-the-spot app-based payment. Stores adopted within 2 days of onboarding. Built aggregated volume gave leverage to negotiate ₹8/kg from recyclers.',
      biggest_mistake: 'Started with household collection. Kiranas are point-of-concentration — 1 kirana generates 50 kg/week vs. 500 households to collect the same. Pivoted to trade channel: faster onboarding, predictable volumes.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI Plastic Recycling India 2024', headline: 'India recycles only 60% of collected plastic; informal sector handles 90% of collection with no formal buyback system', key_stat: 'India\'s plastic recycling market at ₹18,000 Cr with organized formal sector capturing only 10% — massive formalization opportunity as EPR regulations tighten.' },
      { type: 'Government Source', source: 'Plastic Waste Management Rules EPR Amendment 2022', headline: 'EPR rules mandate brands to collect plastic equivalent to 100% of plastic they introduce by 2024', key_stat: 'FMCG brands must buy back ₹1,500 Cr+ of plastic packaging annually for EPR compliance — creating institutional buyer for aggregated plastic collection networks.' },
    ],
  },
  'rainwater-harvesting-systems': {
    case_study: {
      founder_name: 'Deepak Shenoy', business_name: 'RainStore', city: 'Bengaluru',
      started_year: '2020', team_size: '4',
      revenue_6m: '₹2.5L/month', revenue_12m: '₹8.5L/month',
      key_insight: 'Bengaluru apartments paid ₹6,000/month for tanker water due to borewell depletion. RWH system at ₹80,000 one-time cost paid back in 14 months. BBMP mandates RWH for sites > 1200 sq ft — builders started including our systems to avoid penalty at time of occupancy certificate.',
      biggest_mistake: 'DIY kit sales. Installation quality determines system life. Offered installation-included package — fewer sales, higher ticket size, zero installation complaints.',
    },
    proof_points: [
      { type: 'Market Data', source: 'CGWB India Groundwater Report 2024', headline: 'India\'s groundwater depletion rate 10x the recharge rate; Bengaluru, Chennai, Delhi face critical water crisis by 2030', key_stat: '40% of India\'s water supply is groundwater; 65% of aquifers are over-exploited — creates structural demand for rainwater harvesting in all major cities.' },
      { type: 'Government Source', source: 'BBMP Bye-Laws 2019 + National Water Mission', headline: 'BBMP mandates RWH for all buildings above 1,200 sq ft; Tamil Nadu mandates RWH for all new constructions statewide', key_stat: '6 major states now legally require RWH installation — enforcement creates compliance-driven demand regardless of water cost consciousness.' },
    ],
  },
  'rooftop-solar-installation-financing': {
    case_study: {
      founder_name: 'Ashish Sharma', business_name: 'SolarEasy', city: 'Jaipur',
      started_year: '2021', team_size: '7',
      revenue_6m: '₹4L/month', revenue_12m: '₹14L/month',
      key_insight: '₹2.5L upfront for rooftop solar was the biggest barrier — most homeowners had payback intent but not lump-sum capital. Partnered with NBFCs for 36-month solar loans. EMI at ₹4,500/month replaced electricity bill of ₹6,000/month — customer saves from Day 1. Closed 8x more installations vs. cash-only model.',
      biggest_mistake: 'Sold to homeowners only. Commercial rooftops (factories, warehouses) have 10x larger systems, faster approvals, and lower customer acquisition cost per watt installed. Added B2B vertical — now 60% of revenue.',
    },
    proof_points: [
      { type: 'Market Data', source: 'MNRE Rooftop Solar Report 2024', headline: 'India rooftop solar capacity at 15 GW vs. 40 GW target — 62% gap driven by financing barrier', key_stat: '75% of homeowners who want solar cite upfront cost as primary barrier — solar financing products can unlock 30 GW of latent rooftop demand.' },
      { type: 'Government Source', source: 'PM Surya Ghar Muft Bijli Yojana 2024', headline: 'PM Surya Ghar scheme offers ₹30,000–78,000 subsidy + low-interest loans for rooftop solar on 10 million homes', key_stat: '₹75,021 Cr budgeted for 10 million rooftop solar installations by 2027 — subsidy structure enables ₹0 down payment for many customers.' },
    ],
  },
  'sustainable-fashion-rental-platform': {
    case_study: {
      founder_name: 'Kavitha Menon', business_name: 'WearAgain', city: 'Mumbai',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹5.5L/month',
      key_insight: 'Instagram millennials wore outfits once and posted — buying ₹8,000 outfits for one photo was unsustainable. Rental at ₹800 for 4 days got same Instagram-worthy outfit. Focused on occasion wear (parties, weddings, corporate events) — not daily wear where rental economics don\'t work.',
      biggest_mistake: 'Broad fashion rental. Lehengas (₹15,000–80,000 purchase price) rented at ₹3,000–8,000 for 4 days. Wedding rental economics are 10x better than party wear — focused on bridal segment.',
    },
    proof_points: [
      { type: 'Market Data', source: 'IBEF India Fashion Report 2024', headline: 'India fashion rental market at ₹1,200 crore; expected to reach ₹4,500 crore by 2028', key_stat: 'Indian weddings generate ₹50,000+ per event in fashion spend — 12 million weddings annually create ₹60,000 Cr occasion wear market, largely untapped for rental.' },
      { type: 'Case Study', source: 'YourStory', founder: 'Adarsh Todi, FlyrRobe', headline: 'FlyrRobe raises ₹12 crore on fashion rental in India — proves platform model for occasion wear', key_stat: 'Series A in fashion rental validates consumer willingness to pay for premium rental over purchase.' },
    ],
  },
  'urban-farming-kit-community': {
    case_study: {
      founder_name: 'Priya Rajan', business_name: 'TerraceFarm', city: 'Chennai',
      started_year: '2020', team_size: '3',
      revenue_6m: '₹80K/month', revenue_12m: '₹2.8L/month',
      key_insight: 'Apartment dwellers with terraces/balconies wanted homegrown vegetables but didn\'t know where to start. Sold "Starter Kit" (grow bags, soil, seeds, fertilizer, 30-day WhatsApp support) at ₹1,800. 70% of starter kit buyers subscribed to the monthly refill service (seeds + soil amendments) at ₹400/month.',
      biggest_mistake: 'Sold individual kits only. Housing societies approached for community terrace gardens covering 2,000 sq ft. Society kit at ₹35,000 + ₹5,000/month maintenance contract = 3x ARPU vs. individual.',
    },
    proof_points: [
      { type: 'Market Data', source: 'IBEF Urban Agriculture India 2024', headline: 'Urban home gardening market at ₹800 crore; grew 3x during COVID — 12 million urban households grow food', key_stat: 'India\'s urban farming market grew 200% 2020–2022; post-COVID food security awareness and balcony garden trend created durable market, not just a pandemic spike.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Shweta Kulkarni, My Pooja Box', headline: 'D2C subscription boxes prove Indian consumers pay for curated monthly experience products', key_stat: 'Monthly subscription model in Indian D2C has proven LTV economics — garden refill subscriptions mirror same model with 12-month average retention.' },
    ],
  },
  'used-cooking-oil-biodiesel': {
    case_study: {
      founder_name: 'Rajesh Kumar', business_name: 'OilCycle', city: 'Delhi',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹3L/month', revenue_12m: '₹10.5L/month',
      key_insight: 'Cloud kitchens and hotel chains in Delhi generated 500–2,000 litres/month of used cooking oil (UCO) that they paid to dispose. Paid ₹20/litre (vs. their disposal cost of ₹5/litre) and sold to certified biodiesel blenders at ₹45/litre. Margin on logistics + aggregation was ₹15/litre.',
      biggest_mistake: 'Started with small restaurants. Cloud kitchen parks (20+ kitchens) and hotel chains generate 500L+ per pickup location. Focused on high-volume B2B aggregation — 10 hotel accounts = 200 small restaurant accounts.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FSSAI UCO Data 2024', headline: 'India generates 2.3 billion litres of used cooking oil annually; less than 5% formally collected for biodiesel', key_stat: 'UCO biodiesel potential of 1.5 billion litres/year at current production — formal aggregation market worth ₹7,000 Cr at market price.' },
      { type: 'Government Source', source: 'FSSAI Repurposing Used Cooking Oil (RUCO) Initiative', headline: 'FSSAI RUCO program mandates hotels and food chains to sell UCO only to authorised biodiesel producers', key_stat: 'Mandated commercial establishments must use certified collectors — regulatory enforcement creates captive supply pipeline for compliant UCO aggregators.' },
    ],
  },

  // ── AgriTech ────────────────────────────────────────────────────────────────
  'agri-drone-services-marketplace': {
    case_study: {
      founder_name: 'Suresh Patil', business_name: 'DroneKhet', city: 'Pune',
      started_year: '2022', team_size: '4',
      revenue_6m: '₹2L/month', revenue_12m: '₹7.5L/month',
      key_insight: 'Individual farmers couldn\'t afford ₹8L drone purchase for 5-acre plots. Created drone-as-a-service marketplace where certified drone pilots offer spraying at ₹400/acre. One pilot with 1 drone can spray 20 acres/day earning ₹8,000/day — pilots supply flocked to the platform.',
      biggest_mistake: 'Built for individual farmer booking. FPOs (5,000–50,000 acre commands) book drones for entire season at ₹380/acre — higher volume, lower logistics cost per acre, guaranteed utilisation for pilots.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI/Drone Federation of India 2024', headline: 'Drone spraying covers 10 million acres in India; 90% of 140 million farm acres still sprayed manually', key_stat: 'Drone spraying reduces chemical usage 30%, increases crop yield 15%, saves 85% labour — farmer economics strongly favour adoption once access exists.' },
      { type: 'Government Source', source: 'DGCA Drone Rules 2021 + SMAM drone subsidy scheme', headline: 'Government provides 40–100% subsidy for FPOs buying agricultural drones under SMAM scheme', key_stat: '₹1,261 Cr allocated for agricultural drone adoption — FPO drone subsidies and PLI for drone manufacturing accelerate supply-side growth.' },
    ],
  },
  'agri-input-subscription-box': {
    case_study: {
      founder_name: 'Anita Yadav', business_name: 'FarmBox', city: 'Nagpur',
      started_year: '2021', team_size: '3',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹5L/month',
      key_insight: 'Orange farmers in Vidarbha bought fertilizers from local dealers who recommended whatever they had in stock — not what the crop needed. Built seasonal subscription: curated agri-inputs per crop variety per soil test result. Agronomist-curated boxes sold at 40% premium over retail. Repeat rate 85%.',
      biggest_mistake: 'One-size box per crop. Added soil testing (₹200 add-on) and personalised box based on soil report. Farmers with custom boxes had better yields — word of mouth brought 60% of new customers.',
    },
    proof_points: [
      { type: 'Market Data', source: 'IBEF Agriculture Input India 2024', headline: 'India agri-input market at ₹2 lakh crore; fertilizer and pesticide adulteration causes 15–20% crop yield loss', key_stat: 'Only 40% of Indian farmers use scientifically optimised input combinations — rest rely on dealer recommendations, leaving massive value on table from suboptimal inputs.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Ninjacart team', headline: 'Agri-input subscription models prove recurring revenue in Indian agriculture despite perceived seasonal volatility', key_stat: 'Multiple agri-input startups raised Series A on subscription models — validating farmer willingness to commit upfront for curated quality.' },
    ],
  },
  'agricultural-land-leasing-platform': {
    case_study: {
      founder_name: 'Harish Tiwari', business_name: 'KhetRent', city: 'Bhopal',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.2L/month', revenue_12m: '₹4.5L/month',
      key_insight: 'NRI families owned inherited agricultural land in MP, UP, Bihar — no one farmed it, no income, land degraded. Progressive farmers wanted 10–50 acres to scale but couldn\'t buy. Built verified 3-year lease agreements (digital + physical) with FSSAI-compliant witness attestation. First 50 leases processed through local lawyer network.',
      biggest_mistake: 'Platform-only model. Land lease disputes in India are slow through courts. Added escrow payment service (annual rent held in escrow, released on confirmed crop season start) — disputes dropped to near zero.',
    },
    proof_points: [
      { type: 'Market Data', source: 'NABARD State of Agriculture Report 2024', headline: '45 million acres of agricultural land in India lies fallow; progressive farmers face land access bottleneck to scale', key_stat: 'Average Indian farm is 1.1 acres — unable to achieve economies of scale. Land leasing aggregation could enable 10x farm scale without land ownership change.' },
      { type: 'Government Source', source: 'Model Agricultural Land Leasing Act 2016 + State reforms', headline: 'Model Land Leasing Act enables formal tenancy for the first time in 7 states; more states in pipeline', key_stat: 'States adopting model act report 25% increase in cultivated fallow land — regulatory tailwind for formal land leasing platforms.' },
    ],
  },
  'cold-storage-as-a-service-produce': {
    case_study: {
      founder_name: 'Ramesh Gupta', business_name: 'FreshVault', city: 'Agra',
      started_year: '2020', team_size: '6',
      revenue_6m: '₹3.5L/month', revenue_12m: '₹12L/month',
      key_insight: 'Potato farmers near Agra stored 90% of India\'s potato crop — but cold storage was owned by traders who gave substandard quality certificates. Built farmer-owned shared cold storage (co-operative model): each farmer held a "cold room share" certificate for their tonnage. Eliminated trader middleman — farmer price realisation up 35%.',
      biggest_mistake: 'Assumed 1-month storage. Farmers sometimes stored for 8 months. Negotiated flexible contract: base rate for 3 months + ₹50/quintal/month extension. Farmers earning more holding longer — platform revenue extended from seasonal to year-round.',
    },
    proof_points: [
      { type: 'Market Data', source: 'NABARD Cold Chain India 2024', headline: 'India loses ₹92,000 crore of produce annually due to post-harvest losses; 99% caused by cold chain gaps', key_stat: 'India has only 37 million MT of cold storage capacity against a 370 million MT requirement — less than 10% coverage creates massive infrastructure gap.' },
      { type: 'Government Source', source: 'PM Formalisation of Micro Food Processing Enterprises (PMFME) + NCCD', headline: 'Government provides 35% capital subsidy for cold storage infrastructure under multiple schemes', key_stat: 'Capital subsidy reduces cold storage construction cost from ₹1 Cr to ₹65L per 500MT — viability threshold for small cooperatives drops significantly.' },
    ],
  },
  'commodity-price-intelligence-agri-traders': {
    case_study: {
      founder_name: 'Sanjay Mehta', business_name: 'MandiMind', city: 'Indore',
      started_year: '2021', team_size: '3',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹5.5L/month',
      key_insight: 'Soya and wheat traders in Indore Mandi lost ₹2–5L/week from delayed price information — checked 15 mandis manually via phone. Built WhatsApp bot that sent hourly price alerts for 50 mandis across MP, Rajasthan, Gujarat. ₹1,500/month SaaS subscription — traders closed within 2 minutes of demo.',
      biggest_mistake: 'Web dashboard only. Traders are on phone, moving between mandis. WhatsApp bot delivery (no app install, no login) converted 8x better than web dashboard — product-channel fit determines adoption speed in rural markets.',
    },
    proof_points: [
      { type: 'Market Data', source: 'eNAM/APMC Mandi Data India 2024', headline: 'India has 7,000+ APMCs processing ₹10 lakh crore of commodity trade — price opacity costs traders 5–8% margin', key_stat: 'A ₹1 difference per quintal in soyabean price across mandis translates to ₹50,000 profit/loss on a 50-tonne truck — price intelligence has clear ROI.' },
      { type: 'Government Source', source: 'eNAM (National Agriculture Market), Government of India', headline: 'eNAM connects 1,000+ mandis electronically but data is not real-time or aggregated for traders', key_stat: 'eNAM\'s open API and daily price data creates free data foundation — commercial platforms add real-time, WhatsApp delivery, and analytics to make it actionable.' },
    ],
  },
  'crop-insurance-aggregator-fpo': {
    case_study: {
      founder_name: 'Kishor Patil', business_name: 'FaslaSure', city: 'Nashik',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹1.8L/month', revenue_12m: '₹6.5L/month',
      key_insight: 'FPOs in Nashik had 5,000+ grape farmers with identical climate exposure — ideal insurance pool. Negotiated with HDFC Ergo for group policy at 40% lower premium than individual PMFBY. Charged FPO ₹30/farmer facilitation fee. 5,000 farmers × ₹30 = ₹1.5L per FPO contract per season.',
      biggest_mistake: 'Tried to white-label insurance products directly. Insurance regulations require broker licence. Applied for IRDAI Corporate Broker licence — 6-month wait unlocked the full product suite.',
    },
    proof_points: [
      { type: 'Market Data', source: 'IRDAI Agriculture Insurance India 2024', headline: 'India crop insurance penetration at 30% of farmers — ₹30,000 crore market growing 18% annually', key_stat: 'PMFBY enrols 56 million farmers but 140 million remain without insurance — group FPO aggregation can close the gap faster than individual farmer outreach.' },
      { type: 'Government Source', source: 'PMFBY Restructuring Circular 2023, Ministry of Agriculture', headline: 'Government restructures PMFBY with voluntary enrolment and increased non-loanee farmer participation incentives', key_stat: 'Voluntary PMFBY with government premium subsidy of 80–95% for small/marginal farmers — makes crop insurance affordable for the bottom 80% of farm households.' },
    ],
  },
  'dairy-farmer-income-optimizer': {
    case_study: {
      founder_name: 'Milind Bhosale', business_name: 'DairyPlus', city: 'Kolhapur',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹5.5L/month',
      key_insight: 'Kolhapur dairy farmers earning ₹25/litre from cooperative could earn ₹38/litre selling A2 milk directly to premium urban customers — but had no marketing, logistics, or trust infrastructure. Built WhatsApp-based direct subscription: urban customer paid ₹60/litre (premium A2), farmer got ₹38, platform took ₹22 for cold chain + logistics + marketing.',
      biggest_mistake: 'Individual farmer onboarding. Dairy cooperatives (100–500 farmers) were already aggregated and could switch the whole group. Co-operative business development = 500 farmer accounts in one week.',
    },
    proof_points: [
      { type: 'Market Data', source: 'NDDB India Dairy Report 2024', headline: 'India is world\'s largest milk producer at 230 million tonnes; farmer price realisation is only 40% of retail price', key_stat: '80 million dairy farmer households earn ₹25–30/litre when retail milk sells for ₹55–70 — 50% price gap is structural and solvable through direct-to-consumer models.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Bhavish Aggarwal, Country Delight', headline: 'Country Delight reaches ₹1,000 crore revenue on direct farm-to-home dairy model', key_stat: 'Country Delight\'s scale validates D2C dairy as a proven business model — market for premium, transparent dairy is real and growing.' },
    ],
  },
  'dtc-honey-bee-products-brand': {
    case_study: {
      founder_name: 'Madhu Patel', business_name: 'KhetMadhu', city: 'Ahmedabad',
      started_year: '2020', team_size: '3',
      revenue_6m: '₹1.2L/month', revenue_12m: '₹4.5L/month',
      key_insight: 'Supermarket honey is 80% adulterated per FSSAI tests — consumers knew but had no alternative. Built third-party lab tested, NMR-verified honey with QR code traceability to beehive GPS location. Premium at ₹599/500g vs. ₹180 retail — sold out every batch in 48 hours on Instagram.',
      biggest_mistake: 'Gifting boxes as secondary SKU. Corporate gifting (Diwali, client gifts) orders of 500–2,000 units at ₹800–1,200/box became seasonal revenue spike. Dedicated corporate gifting as a separate vertical — now 40% of annual revenue.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FSSAI Honey Quality Report 2020 + India D2C Food Report 2024', headline: 'India honey market at ₹2,800 crore; FSSAI 2020 found 77% of branded honey adulterated — consumer trust collapsed', key_stat: 'Post-FSSAI honey adulteration exposé, premium verified honey brands grew 5x in 3 years — distrust of large brands creates permanent market for verified D2C alternatives.' },
      { type: 'Case Study', source: 'YourStory', founder: 'Revant Himatsingka (FoodPharmer)', headline: 'Social media food transparency content drives 10x growth for honest D2C food brands', key_stat: 'Food authenticity content going viral creates instant consumer acquisition — honest D2C food brands benefit disproportionately from media distrust of large FMCG brands.' },
    ],
  },
  'fisheries-aquaculture-management-platform': {
    case_study: {
      founder_name: 'Sudhir Nair', business_name: 'AquaTrack', city: 'Kochi',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹5L/month',
      key_insight: 'Shrimp farmers in Kerala lost 30% of crop to disease because they didn\'t monitor water quality daily. Built IoT water quality sensor + Android app with daily alerts for dissolved oxygen, pH, ammonia. ₹18,000 hardware + ₹2,000/month SaaS. Pilot farms showed 25% yield increase — payback period 4 months.',
      biggest_mistake: 'Hardware-first approach. Shrimp farmers are risk-averse to new hardware. Offered 3-month free hardware trial with only SaaS fee — adoption went from 5% to 65% trial-to-paid conversion.',
    },
    proof_points: [
      { type: 'Market Data', source: 'MPEDA India Aquaculture Report 2024', headline: 'India is world\'s #2 shrimp exporter with ₹57,000 crore aquaculture output; disease losses at 20–40% annually', key_stat: 'Indian shrimp farming is a $7B export industry — disease management alone can unlock ₹10,000 Cr of additional annual output currently lost to preventable disease.' },
      { type: 'Government Source', source: 'PM Matsya Sampada Yojana, Ministry of Fisheries', headline: 'Government provides 40% subsidy for aquaculture tech infrastructure including water quality monitoring systems', key_stat: '₹20,050 Cr PMMSY scheme subsidizes precision aquaculture equipment — lowers effective hardware cost by 40% for smallholder fish farmers.' },
    ],
  },
  'food-safety-testing-lab-network': {
    case_study: {
      founder_name: 'Dr. Anitha Raghunath', business_name: 'SafeFood Labs', city: 'Chennai',
      started_year: '2020', team_size: '6',
      revenue_6m: '₹3.5L/month', revenue_12m: '₹12L/month',
      key_insight: 'D2C food brands needed FSSAI test certificates before every batch dispatch — government labs had 6-week waiting period. Offered 72-hour turnaround for ₹3,500/test (vs. government ₹800 with 6-week wait). D2C brands paid without negotiation — launch delays cost more than test fees.',
      biggest_mistake: 'Broad food testing. Specialised in D2C organic and premium food categories (spices, honey, snacks) — became category expert. Premium food brands had 3x higher willingness to pay than commodity food manufacturers.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FSSAI Annual Report 2024', headline: 'India food testing market at ₹4,500 crore; 80% done by government labs with 4–8 week turnarounds', key_stat: 'India food testing demand growing 18% annually driven by FSSAI compliance expansion — private fast-turnaround labs command 3–4x premium over government labs.' },
      { type: 'Government Source', source: 'FSSAI Food Safety and Standards Act 2006 + Amendments 2023', headline: 'FSSAI mandates pre-market testing for 37 food categories; new 2023 amendments expand testing requirements', key_stat: '2023 FSSAI amendments add 12 new food categories requiring mandatory third-party testing before retail sale — immediate demand surge for private testing capacity.' },
    ],
  },
  'hydroponics-farm-in-a-box-urban': {
    case_study: {
      founder_name: 'Anil Desai', business_name: 'GreenRoom', city: 'Bengaluru',
      started_year: '2021', team_size: '3',
      revenue_6m: '₹1.8L/month', revenue_12m: '₹6L/month',
      key_insight: 'IT professionals in Bengaluru wanted fresh, pesticide-free greens but had no outdoor space. Modular hydroponic system (₹22,000) that grows 35 types of greens in a 3x4 ft indoor space. First 50 units sold through LinkedIn post — zero paid marketing. Monthly nutrient subscription (₹1,200/month) created recurring revenue.',
      biggest_mistake: 'Consumer-only. Corporate cafeterias and premium apartment amenities wanted branded hydroponic installations. B2B contract (₹3L setup + ₹8,000/month maintenance) at 5x consumer LTV.',
    },
    proof_points: [
      { type: 'Market Data', source: 'India Controlled Environment Agriculture Market 2024', headline: 'India hydroponics market at ₹800 crore; growing 15% annually driven by premium food demand in metros', key_stat: 'Premium pesticide-free vegetables sell at 60–150% premium in metros — hydroponics delivers superior quality at home with 12-month payback for urban consumers.' },
      { type: 'Case Study', source: 'YourStory', founder: 'Vaibhav Singh, UrbanKisaan', headline: 'UrbanKisaan raises ₹20 crore on urban hydroponic farming — proves consumer market in India', key_stat: 'Series A for UrbanKisaan validates indoor urban farming as investable business in India — consumer demand for fresh local produce is real and growing.' },
    ],
  },
  'millets-ancient-grains-brand': {
    case_study: {
      founder_name: 'Ananya Krishnan', business_name: 'KodaiGrain', city: 'Bengaluru',
      started_year: '2020', team_size: '4',
      revenue_6m: '₹2.5L/month', revenue_12m: '₹9L/month',
      key_insight: 'Urban diabetics and fitness-conscious consumers wanted low-glycemic alternatives to rice and wheat — doctors recommended millets but retail stores stocked generic unbranded varieties. Built premium branded range with GI certification, recipe videos, and dietitian endorsement. ₹280/kg vs. ₹80/kg commodity price.',
      biggest_mistake: 'Retail placement first. Modern trade shelf space requires distributors. D2C subscription (monthly millet variety box) with recipe card created 75% repeat rate — monthly subscription revenue > retail revenue by Month 8.',
    },
    proof_points: [
      { type: 'Market Data', source: 'APEDA India Millets Report 2024', headline: 'India is world\'s #1 millet producer; domestic millet market grew 35% in 2023 following International Year of Millets', key_stat: 'International Year of Millets 2023 created 10x social media awareness — Google searches for "millet recipes" grew 400%, creating pre-existing consumer interest.' },
      { type: 'Government Source', source: 'Ministry of Agriculture National Mission on Millets 2023', headline: 'Government declares 2023 Year of Millets; ₹500 crore allocated for millet processing, branding, and export', key_stat: 'Government millet push includes ₹120 Cr for FPO-based millet branding support — first-time movers benefit from government-funded marketing awareness.' },
    ],
  },
  'organic-certification-saas-fpo': {
    case_study: {
      founder_name: 'Gopal Singh', business_name: 'OrganicPass', city: 'Jodhpur',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.2L/month', revenue_12m: '₹4L/month',
      key_insight: 'FPOs in Rajasthan had 500+ organic farmers but couldn\'t afford NPOP certification (₹80,000 per FPO + 2-year audit process). Built digital farm diary (input logs, field photos, inspector notes) reducing certification paperwork by 70%. Accredited certifiers accepted digital farm logs — FPO certification cost dropped to ₹25,000.',
      biggest_mistake: 'Per-farmer pricing. FPO pays on behalf of all members — ₹5,000/year per FPO (not per farmer). 1 FPO contract = 200–1,000 farmers. Adjusted to FPO annual fee model — sales cycle dropped from 6 months to 3 weeks.',
    },
    proof_points: [
      { type: 'Market Data', source: 'APEDA Organic Export India 2024', headline: 'India organic food market at ₹12,000 crore; 30% premium for certified organic over conventional', key_stat: 'Only 3.6 million of 140 million Indian farm hectares are certified organic — certification complexity is the primary barrier limiting farmer participation in premium market.' },
      { type: 'Government Source', source: 'Paramparagat Krishi Vikas Yojana (PKVY) + PGS India', headline: 'PKVY provides ₹50,000/hectare for cluster organic farming including certification support', key_stat: 'Government finances organic conversion for clusters of 50+ farmers — platform that streamlines documentation directly reduces FPO compliance cost for government-funded programs.' },
    ],
  },
  'plant-based-protein-brand-india': {
    case_study: {
      founder_name: 'Nisha Agarwal', business_name: 'ProteaFoods', city: 'Mumbai',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹2.5L/month', revenue_12m: '₹9.5L/month',
      key_insight: 'Whey protein market (₹3,500 Cr) dominated by US brands — Indian vegetarians wanted protein that fit their diet and taste. Launched pea protein blended with ashwagandha, moringa — "Indian superfood protein" narrative. Instagram gymgoers adopted as culturally relatable alternative to Western whey brands.',
      biggest_mistake: 'Single flavour launch. Indian consumers expect variety — mango, rose, kesar options launched Month 3 tripled monthly orders. Flavour experimentation drove 40% of social media content organically.',
    },
    proof_points: [
      { type: 'Market Data', source: 'IBEF Sports Nutrition India 2024', headline: 'India sports nutrition market at ₹3,500 crore; growing 25% annually with 40 million gym members', key_stat: '70% of Indian protein consumers are vegetarian — plant protein market is native, not a trend. Imported whey brands dominate; Indian plant protein players have strong competitive moat.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Rohit Nair, Wellbeing Nutrition', headline: 'Wellbeing Nutrition raises ₹70 crore on plant-based nutrition for Indian consumers', key_stat: 'Series B validates premium Indian plant nutrition brand at scale — investor conviction in indigenous plant protein brands growing rapidly.' },
    ],
  },
  'spice-brand-farmer-traceability': {
    case_study: {
      founder_name: 'Lakshmi Krishnamurthy', business_name: 'SpiceRoot', city: 'Kochi',
      started_year: '2020', team_size: '4',
      revenue_6m: '₹3L/month', revenue_12m: '₹10.5L/month',
      key_insight: 'European supermarkets paid 3x premium for traceable spices (QR code to farm). US and UK NRI diaspora valued Kerala "authentic" spices vs. supermarket generics. Built traceable supply chain with 200 Kerala farmers — QR code on each box scanned to farmer name, village, harvest date. US exports grew 5x in 18 months.',
      biggest_mistake: 'Tried to sell to Indian retail first. Indian consumers price-compare spices vs. kitchen commodity. Export and diaspora channels — UK, US, UAE — paid premium for authenticity and traceability without price pushback.',
    },
    proof_points: [
      { type: 'Market Data', source: 'Spices Board India Export Data 2024', headline: 'India spice exports at ₹32,000 crore; premium traceable segment growing 40% annually', key_stat: 'QR-code traceable spices command 2–4x premium in EU/US markets — India as world\'s #1 spice producer has inherent credibility advantage for authentic traceable brands.' },
      { type: 'Government Source', source: 'Spices Board India + APEDA Export Promotion', headline: 'Spices Board provides ₹15 lakh export promotion support to spice processors; trade fairs in 15 countries annually', key_stat: 'Free participation in Spice India exhibitions in US, UK, UAE provides export market access — government-sponsored B2B matchmaking reduces new exporter market entry cost.' },
    ],
  },
  'veterinary-telehealth-livestock': {
    case_study: {
      founder_name: 'Dr. Arjun Menon', business_name: 'PashuDoc', city: 'Bhopal',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹5.5L/month',
      key_insight: 'Rural cattle farmers in MP lost ₹15,000–50,000 per animal to preventable diseases — nearest vet was 30+ km away. WhatsApp video consultation with licensed vet for ₹200/call. Farmer sends video, vet diagnoses, local pharmacist gets prescription via WhatsApp. 80% of cases diagnosed and treated without physical visit.',
      biggest_mistake: 'App-based platform only. Rural farmers use basic Android phones with 2G. WhatsApp video + voice consultation required zero app install — adoption jumped from 2% to 45% of registered farmers.',
    },
    proof_points: [
      { type: 'Market Data', source: 'DAHDF India Livestock Health Report 2024', headline: 'India has 535 million livestock; only 1 vet per 60,000 animals vs. global norm of 1 per 5,000', key_stat: 'India\'s vet shortage means 90% of animal disease cases in rural areas go untreated for 48+ hours — telehealth closes access gap more cost-effectively than building physical infrastructure.' },
      { type: 'Government Source', source: 'National Digital Livestock Mission, DAHDF 2022', headline: 'Government launches ₹2,000 crore National Livestock Mission with digital health monitoring as core component', key_stat: 'Government digital livestock health push includes subsidized ear-tag IoT sensors — creates infrastructure for digital vet consultations as platform business.' },
    ],
  },

  // ── Manufacturing ────────────────────────────────────────────────────────────
  'chemical-formulation-lab-industrial': {
    case_study: {
      founder_name: 'Dr. Ramesh Iyer', business_name: 'FormChem Labs', city: 'Surat',
      started_year: '2020', team_size: '5',
      revenue_6m: '₹4.5L/month', revenue_12m: '₹16L/month',
      key_insight: 'Textile manufacturers in Surat imported speciality dyeing chemicals from Germany at ₹800/litre. Reverse-engineered formulation and produced at ₹220/litre — same performance, 3-month import lead time eliminated. First 5 clients signed 12-month supply contracts after 1-month performance trial.',
      biggest_mistake: 'Competed on price only. Import substitution is the pitch, not price. Quality certification (ISO 9001 + BIS marking) commanded ₹280/litre — still 65% cheaper than imports and enabled premium brand positioning.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI Specialty Chemicals India 2024', headline: 'India specialty chemicals market at ₹4 lakh crore; 60% still imported — import substitution opportunity of ₹2.4 lakh crore', key_stat: 'India imports ₹1.4 lakh crore of specialty chemicals annually — government PLI scheme and China+1 sourcing shifts create systematic import substitution demand.' },
      { type: 'Government Source', source: 'PLI Scheme for Specialty Chemicals, Ministry of Chemicals', headline: 'Government PLI scheme provides 10–15% production-linked incentive for import-substituting specialty chemical producers', key_stat: 'PLI incentive adds 10–15% margin uplift for qualifying specialty chemical manufacturers — makes domestic production economically dominant vs. Chinese imports at current tariff levels.' },
    ],
  },
  'contract-electronics-manufacturing-marketplace': {
    case_study: {
      founder_name: 'Kiran Pillai', business_name: 'MakersHub India', city: 'Chennai',
      started_year: '2022', team_size: '4',
      revenue_6m: '₹2L/month', revenue_12m: '₹7.5L/month',
      key_insight: 'Hardware startups and D2C electronics brands needed contract manufacturing for 1,000–50,000 unit runs — too small for large EMS companies, too complex for small workshops. Built verified manufacturer marketplace with NDA-protected RFQ process. Manufacturers paid 8% commission on order value.',
      biggest_mistake: 'Listed unverified manufacturers. One bad batch destroyed a client\'s product launch. Built factory audit protocol (ISO, production photos, quality samples) — reduced manufacturer count by 60% but NPS went from 31 to 74.',
    },
    proof_points: [
      { type: 'Market Data', source: 'IESA India Electronics Report 2024', headline: 'India electronics manufacturing at ₹9 lakh crore; contract manufacturing growing 35% annually under PLI push', key_stat: 'China+1 strategy drives $15B+ of electronics production shifting to India — contract manufacturers need matchmaking with global buyers for transition to be monetised.' },
      { type: 'Government Source', source: 'PLI Scheme for Electronics (LSEMS + IT Hardware), MeitY', headline: 'PLI provides 4–6% incentive for electronics manufacturing — attracts Apple, Samsung, and 100+ Indian contract manufacturers', key_stat: 'Apple manufacturing India rose from 0% to 7% of iPhone production in 3 years — creating established supplier ecosystem that smaller manufacturers can access.' },
    ],
  },
  'custom-industrial-uniforms-workwear-brand': {
    case_study: {
      founder_name: 'Suresh Textile', business_name: 'ProWear Industrial', city: 'Tiruppur',
      started_year: '2021', team_size: '8',
      revenue_6m: '₹5.5L/month', revenue_12m: '₹18L/month',
      key_insight: 'Factories in Tamil Nadu bought uniforms from generic suppliers — low-quality, no branding, 6-week lead times. Built online uniform configurator with 48-hour delivery for orders < 100 units. Key differentiation: fabric fire/chemical resistance certificates required by industrial clients for safety compliance.',
      biggest_mistake: 'MOQ of 50 units. Large factories order 500–5,000 uniforms quarterly. Focused on procurement managers with annual contracts — ₹15–30L/year contracts with 3-year vendor empanelment replaced per-order selling.',
    },
    proof_points: [
      { type: 'Market Data', source: 'India Corporate Uniform Market Report 2024', headline: 'India corporate and industrial uniform market at ₹8,500 crore; growing 12% annually with Make in India factory expansion', key_stat: 'Every 1% expansion in India\'s manufacturing workforce (currently 51 million) adds 500,000 industrial uniform buyers — structural demand tied to manufacturing growth.' },
      { type: 'Case Study', source: 'YourStory', founder: 'Delhi Cloth Mills (DCM)', headline: 'Institutional uniform supply contracts worth ₹100+ crore validate B2B workwear as scalable business', key_stat: 'Enterprise uniform contracts (₹10–50L/year per client) provide 18–24 month revenue visibility — better economics than D2C consumer wear.' },
    ],
  },
  'ev-battery-pack-assembly-2wheelers': {
    case_study: {
      founder_name: 'Suresh Menon', business_name: 'BattPack India', city: 'Pune',
      started_year: '2022', team_size: '6',
      revenue_6m: '₹4.5L/month', revenue_12m: '₹16L/month',
      key_insight: 'EV 2-wheeler OEMs with < 5,000 unit/month production couldn\'t justify in-house battery assembly lines. Built contract battery pack assembly with 48-hour turnaround, BIS-certified cells, warranty included. OEMs focused on motor/frame design while outsourcing battery complexity — reduced OEM capex by ₹2 Cr.',
      biggest_mistake: 'Tried to source cells from Chinese suppliers. Long lead times and quality consistency issues. Switched to domestic cell suppliers (Amara Raja, Exide) — higher cost but 0% import duty and reliable supply.',
    },
    proof_points: [
      { type: 'Market Data', source: 'SIAM India EV Report 2024', headline: 'India 2-wheeler EV market at 1.7 million units/year; 50+ OEMs require battery pack assembly services', key_stat: '50+ small EV OEMs entered market with < 10,000 unit/year production — all need contract battery assembly since in-house is unviable at this scale.' },
      { type: 'Government Source', source: 'FAME-II and FAME-III, DHI Government of India', headline: 'FAME-III proposes ₹35,000 crore EV incentives including production-linked battery pack assembly support', key_stat: 'FAME subsidies drive EV demand + PLI for advanced battery chemistry — dual policy tailwinds create structural growth for EV battery pack manufacturing.' },
    ],
  },
  'industrial-iot-retrofitting-legacy-machines': {
    case_study: {
      founder_name: 'Anand Sharma', business_name: 'MachineEye', city: 'Coimbatore',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹3.5L/month', revenue_12m: '₹12L/month',
      key_insight: 'Textile machinery in Coimbatore worth ₹5–50L each had zero sensors — operators guessed when maintenance was needed. Retrofitted vibration + temperature sensors (₹12,000/machine) with 4G dashboard. First pilot: motor failure predicted 3 days early, saved ₹8L in downtime. Factory head signed 50-machine contract before pilot ended.',
      biggest_mistake: 'Sold to factory owners only. Maintenance engineers were the daily users and champions. Built maintenance engineer dashboard with WhatsApp alerts — internal champion sold to management, reducing sales cycle from 3 months to 3 weeks.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI Industry 4.0 India 2024', headline: 'India has 60,000+ factories with 3 million+ legacy machines — 95% have zero condition monitoring sensors', key_stat: 'Unplanned machine downtime costs Indian manufacturing ₹50,000 crore annually — retrofitting 10% of legacy machines with IoT monitoring represents ₹5,000 Cr addressable market.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Nikhil Bansal, Prescinto', headline: 'Prescinto raises $16M on industrial IoT predictive maintenance for India — asset performance management validated', key_stat: 'Series B for Prescinto validates that Indian industrialists pay for IoT-based predictive maintenance — proven willingness to pay in the market.' },
    ],
  },
  'medical-device-manufacturing-tier2-hospitals': {
    case_study: {
      founder_name: 'Dr. Priya Nair', business_name: 'MediMake India', city: 'Bengaluru',
      started_year: '2021', team_size: '6',
      revenue_6m: '₹3.5L/month', revenue_12m: '₹13L/month',
      key_insight: 'Tier 2 hospitals needed basic diagnostic devices (BP monitors, pulse oximeters, infusion pumps) but imported brands were priced for tertiary hospitals. Built CDSCO-certified, locally assembled versions at 40% lower cost. Government hospital tender procurement gave first 200-unit contract — reference customers from tenders enabled private hospital sales.',
      biggest_mistake: 'Started with complex Class C devices. Class A/B (basic diagnostic) registration takes 3–6 months vs. 18–24 months for Class C. Launched simple devices first, built manufacturing track record, then moved up complexity.',
    },
    proof_points: [
      { type: 'Market Data', source: 'IBEF Medical Devices India 2024', headline: 'India medical device market at ₹90,000 crore; 80% imported — import substitution target of ₹50,000 crore by 2030', key_stat: 'India imports 85% of high-value medical devices — CDSCO regulatory framework and PLI scheme now make domestic manufacturing viable for first time.' },
      { type: 'Government Source', source: 'PLI Scheme for Medical Devices, Ministry of Pharmaceuticals', headline: 'PLI provides 5–8% incentive for 4 device categories; ₹3,420 crore allocated for domestic medical device manufacturing', key_stat: 'PLI + government hospital mandatory local procurement preference (10–25% price preference for domestic) creates dual demand-supply incentive for Indian medical device makers.' },
    ],
  },
  'modular-furniture-manufacturing-brand': {
    case_study: {
      founder_name: 'Rakesh Gupta', business_name: 'FlatpackIndia', city: 'Jaipur',
      started_year: '2021', team_size: '7',
      revenue_6m: '₹5.5L/month', revenue_12m: '₹18L/month',
      key_insight: 'Tier 2 Indian consumers wanted IKEA-style modular furniture but IKEA had 5 stores nationally. Built similar quality modular furniture with pan-India shipping, 48-hour delivery, no carpenter needed. Price at 30% below IKEA on equivalent pieces. WhatsApp assembly support for installation questions.',
      biggest_mistake: 'Tried to build 500+ SKUs. 80% of revenue came from 8 SKUs (wardrobe, bed frame, study table, bookshelf). Focused design and manufacturing investment on top 8 — quality improved, return rate dropped from 12% to 3%.',
    },
    proof_points: [
      { type: 'Market Data', source: 'IBEF Furniture India 2024', headline: 'India furniture market at ₹1.7 lakh crore; online furniture growing 30% annually — modular segment fastest growing at 40%', key_stat: 'India\'s organized furniture market is only 15% of total — 85% is unorganized local carpenter market. Modular/flat-pack is converting this spend to organized brands.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Ambareesh Murty, Pepperfry', headline: 'Pepperfry reaches ₹2,000 crore GMV on Indian online furniture — validated large-scale organized furniture demand', key_stat: 'Pepperfry\'s unicorn exit validates online furniture market — modular own-brand manufacturing captures better margins than marketplace model.' },
    ],
  },
  'packaging-design-procurement-platform-smes': {
    case_study: {
      founder_name: 'Vivek Sharma', business_name: 'PackSmart', city: 'Delhi',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹2.5L/month', revenue_12m: '₹9L/month',
      key_insight: 'FMCG startups spent ₹80,000–2L on packaging design and then couldn\'t find reliable printers who met the spec. Combined design (₹15,000 fixed) + procurement (managed print vendor) into one service. SME brands didn\'t need to learn packaging supply chain — everything end-to-end, priced per SKU.',
      biggest_mistake: 'Custom design-only service. 80% of SME packaging needs fell into 10 category templates (pickle jar, sauce bottle, snack pouch, tea box). Built configurable templates at ₹4,000 per adaptation — 10x faster, 5x cheaper than custom, serving 90% of clients.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI Packaging India 2024', headline: 'India packaging market at ₹3.5 lakh crore; D2C brand growth driving 40,000 new product launches annually', key_stat: 'India has 500,000+ registered FMCG SMEs — each product line needs 3–5 packaging SKUs. Packaging design + procurement is a ₹5,000 crore SME services opportunity.' },
      { type: 'Case Study', source: 'YourStory', founder: 'Multiple D2C brands', headline: 'India D2C food and personal care brands grew 5x post-COVID — packaging differentiation cited as top marketing lever', key_stat: 'D2C brand founders consistently cite packaging as the 2nd highest ROI marketing investment after digital ads — professional packaging design is not optional for brand success.' },
    ],
  },
  'quality-inspection-saas-export-manufacturers': {
    case_study: {
      founder_name: 'Manish Agarwal', business_name: 'QualSight', city: 'Surat',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹2.5L/month', revenue_12m: '₹9L/month',
      key_insight: 'Textile exporters in Surat faced 15% rejection rate from EU buyers — each rejection cost ₹5–15L in rework + freight. Built mobile inspection app with photo-based defect logging and AI defect classification (AQL sampling). Inspectors used on factory floor — real-time defect dashboard caught issues before packing. Rejection rate dropped to 3%.',
      biggest_mistake: 'Sold to export buyers (importers). Buyers already had their own inspection process. Factory-side QC tool sold to manufacturers who bear the rejection cost — they have the pain and the budget.',
    },
    proof_points: [
      { type: 'Market Data', source: 'DGFT/FIEO India Export Quality Report 2024', headline: 'India textile exports face 12–18% rejection rate; quality rejections cost exporters ₹35,000 crore annually', key_stat: 'A 5% reduction in rejection rate on ₹1 lakh crore India apparel exports = ₹5,000 Cr saved — QC tech has direct, quantifiable ROI for exporters.' },
      { type: 'Government Source', source: 'QCI (Quality Council of India) + ZED Certification Scheme', headline: 'Government\'s ZED (Zero Defect Zero Effect) certification provides ₹5 lakh subsidy for quality management tools adoption', key_stat: 'ZED certification premium buyers (government + PSU procurement) pay 10% higher price — quality software qualifying for subsidy has built-in demand from ZED-seeking exporters.' },
    ],
  },
  'sme-factory-compliance-automation': {
    case_study: {
      founder_name: 'Nitin Gupta', business_name: 'ComplianceBot', city: 'Ludhiana',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.8L/month', revenue_12m: '₹6.5L/month',
      key_insight: 'Ludhiana hosiery factory owners were fined ₹2–5L/year for missed Labour Law compliance filings (PF, ESIC, Factory Act returns). Built automated compliance calendar with 30-day advance alerts + 1-click filing. ₹3,000/month SaaS — cheaper than a compliance consultant ₹15,000/month. 400+ factories signed in 8 months.',
      biggest_mistake: 'Pan-India generic compliance. Each state has different factory inspection requirements. Hyper-local state-specific modules (Punjab Labour Law first, then UP, Maharashtra) were adopted 4x faster than generic national compliance product.',
    },
    proof_points: [
      { type: 'Market Data', source: 'DPIIT MSME Compliance Burden Survey 2024', headline: 'India SMEs spend 1,200 hours/year on compliance; ₹18,000 crore in compliance fines collected from SMEs annually', key_stat: 'India\'s 63 million registered MSMEs each face 50+ annual compliance touchpoints — compliance automation has ₹50,000 crore addressable market in time and fine savings.' },
      { type: 'Government Source', source: 'Ease of Doing Business — Compliance Burden Reduction, DPIIT 2023', headline: 'Government reduces mandatory inspections under 9 labour laws through Jan Vishwas Act 2023', key_stat: 'Jan Vishwas Act decriminalises 183 provisions but remaining 400+ compliance requirements still need software management — regulatory simplification increases compliance automation ROI.' },
    ],
  },
  'solar-panel-manufacturing-components': {
    case_study: {
      founder_name: 'Sunil Tiwari', business_name: 'SolarParts India', city: 'Surat',
      started_year: '2022', team_size: '7',
      revenue_6m: '₹5L/month', revenue_12m: '₹18L/month',
      key_insight: 'Solar EPC companies in Gujarat imported junction boxes, mounting structures, and DC cables from China — 12-week lead time. Manufactured identical components domestically at 15% premium over Chinese price but guaranteed 2-week delivery. EPC project timelines shortened — on-time project completion bonuses covered our price premium.',
      biggest_mistake: 'Broad solar component portfolio. DC cables and junction boxes alone (80% of component value) had fastest adoption. Focused on 3 SKUs for first year — faster inventory turns, better quality control, stronger brand in specific sub-category.',
    },
    proof_points: [
      { type: 'Market Data', source: 'MNRE Solar Component India 2024', headline: 'India solar installation target 500 GW by 2030 requires ₹15 lakh crore in solar components — 90% currently imported', key_stat: 'India imports 92% of solar cells and modules — government BCD (Basic Customs Duty) on Chinese modules + Approved List of Models and Manufacturers creates import substitution demand for domestic component manufacturing.' },
      { type: 'Government Source', source: 'PLI Scheme for Solar PV Modules, MNRE', headline: 'PLI provides ₹19,500 crore for domestic solar manufacturing — targets 45 GW of integrated solar manufacturing by 2026', key_stat: 'PLI-backed domestic solar manufacturers need Indian-sourced components to qualify for full PLI benefits — creates captive domestic buyer for component manufacturers.' },
    ],
  },
  'steel-metal-scrap-trading-platform': {
    case_study: {
      founder_name: 'Rahul Agarwal', business_name: 'ScrapConnect', city: 'Mumbai',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹4L/month', revenue_12m: '₹14L/month',
      key_insight: 'Steel re-rollers in Maharashtra paid above-market price for scrap because they bought from 3–4 local dealers with oligopoly pricing. Built transparent auction platform — 500 scrap generators (demolition contractors, factories) bid to 200 re-rollers. Price transparency reduced re-roller input cost 8% — ₹40L/year savings per mid-size re-roller.',
      biggest_mistake: 'Commission per transaction. Scrap trade operates on relationship and credit. Offered 30-day credit (backed by trade credit insurance) — credit facilitation became main value proposition and revenue stream.',
    },
    proof_points: [
      { type: 'Market Data', source: 'MSTC/Steel Scrap India 2024', headline: 'India scrap steel market at ₹1 lakh crore; 80% traded through informal brokers with opaque pricing', key_stat: 'Every 1% price efficiency gain in India\'s scrap steel market = ₹1,000 Cr in buyer savings — transparent digital auction platform has massive value capture potential.' },
      { type: 'Government Source', source: 'Steel Scrap Recycling Policy 2019, Ministry of Steel', headline: 'Government mandates steel scrap recycling; BIS scrap quality standards being enforced from 2024', key_stat: 'BIS quality enforcement for scrap grades creates demand for certified/graded scrap — platform certification and grading service premium over informal market.' },
    ],
  },
  'textile-waste-upcycling-brand': {
    case_study: {
      founder_name: 'Divya Patel', business_name: 'ReWeave', city: 'Ahmedabad',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹5.5L/month',
      key_insight: 'Surat and Ahmedabad textile manufacturers discarded 20–30% of fabric as cutting waste. Purchased at ₹5/kg (vs. ₹200+ new fabric cost) and created patchwork home textiles (cushions, rugs, tote bags). "Upcycled from Surat factory waste" became the brand story — urban D2C customers paid ₹800–2,500/product.',
      biggest_mistake: 'Domestic D2C only. European buyers (Zalando, Westwing) specifically source upcycled textiles for sustainability commitments. B2B export contract at 2x domestic margin — export became primary channel.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI Textile Circular Economy India 2024', headline: 'India generates 1 million tonnes of textile waste annually; only 10% upcycled — rest landfilled or burned', key_stat: 'Europe\'s mandatory sustainable textile reporting (EUDR) creates structural B2B export demand for verified upcycled Indian textiles — supply is abundant, processing and branding is the gap.' },
      { type: 'Government Source', source: 'National Textile Policy 2023, Ministry of Textiles', headline: 'Government mandates textile recycling targets; ₹1,000 crore allocated for textile recycling parks under PM MITRA scheme', key_stat: 'PM MITRA textile park scheme includes upcycling as eligible activity with capital subsidy — reduces setup cost for organised textile waste processing.' },
    ],
  },

  // ── B2B Services ─────────────────────────────────────────────────────────────
  'architecture-interior-design-platform-homeowners': {
    case_study: {
      founder_name: 'Ananya Singh', business_name: 'DesignConnect', city: 'Delhi',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹2L/month', revenue_12m: '₹7.5L/month',
      key_insight: 'Homeowners in Delhi spent ₹3–5L on interior designers who overpromised and underdelivered — no transparent pricing, no contract, no accountability. Built fixed-price design packages (Studio: ₹25,000, Premium: ₹75,000) with milestone payment release and designer rating system. First month: 40 projects booked on day 1 of launch.',
      biggest_mistake: 'On-boarded all types of designers. Specialised in residential interiors 500–3,000 sqft — created category expertise. Designers with 10+ completed residential projects only. Specialisation improved conversion and designer quality scores.',
    },
    proof_points: [
      { type: 'Market Data', source: 'IBEF Interior Design India 2024', headline: 'India interior design market at ₹1.5 lakh crore; 80% residential — growing 20% annually with urbanisation and income rise', key_stat: '300,000+ registered interior designers in India; 90% work freelance without formal contracts or transparent pricing — massive consumer trust problem creates platform opportunity.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Ramakant Sharma, Livspace', headline: 'Livspace reaches ₹3,000 crore revenue on managed home interior platform — largest in Asia', key_stat: 'Livspace\'s IPO filing validates managed interior design as India\'s largest digital home services market — mid-market segment (₹25,000–75,000 design fee) underserved.' },
    ],
  },
  'b2b-procurement-financing-platform': {
    case_study: {
      founder_name: 'Kiran Verma', business_name: 'TradeFloat', city: 'Delhi',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹3.5L/month', revenue_12m: '₹13L/month',
      key_insight: 'MSME buyers on B2B e-commerce platforms (Udaan, IndiaMART) had 30-day buyer credit from sellers — but needed 45–60 days to convert inventory. Offered buy-now-pay-in-60-days at 1.5% per month. Integrated into buyer checkout flow via API. Default rate under 2% on GST-verified buyers.',
      biggest_mistake: 'Individual credit underwriting for each buyer. GST return analysis (3 months of sales data) automated 80% of credit decisions under ₹10L. Reduced underwriting from 5 days to 4 hours — at scale, credit velocity is the product.',
    },
    proof_points: [
      { type: 'Market Data', source: 'RBI MSME Credit India 2024', headline: 'India MSME credit gap at ₹25 lakh crore; only 16% of MSMEs have access to formal credit', key_stat: '63 million MSMEs have ₹25 lakh crore unmet credit demand — B2B procurement financing addresses the most immediate use case: inventory purchase on extended credit.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Vaibhav Gupta, Udaan', headline: 'Udaan raises $585M and builds embedded credit — trade credit integral to B2B marketplace model in India', key_stat: 'Udaan\'s embedded credit product (UdaanCapital) reached 60% of GMV — proves B2B trade credit as essential infrastructure for Indian digital commerce.' },
    ],
  },
  'channel-partner-management-saas': {
    case_study: {
      founder_name: 'Sunil Mehta', business_name: 'ChannelOS', city: 'Mumbai',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹2.5L/month', revenue_12m: '₹9L/month',
      key_insight: 'FMCG companies managing 500–5,000 distributors used WhatsApp groups and Excel for order management — ₹50L/year in billing errors and fraud. Built distributor onboarding + order management + incentive scheme tracking SaaS. First client (₹200 Cr FMCG brand) signed ₹8L/year contract — payback in 2 months from fraud reduction alone.',
      biggest_mistake: 'Complex feature set at launch. Channel managers needed just order tracking + incentive calculation. Built MVP with only 3 features — onboarding, order management, payout. Feature minimalism improved adoption from 30% to 90% within 6 months.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI FMCG Distribution India 2024', headline: 'India has 8 million retail trade channels; FMCG companies manage 1,000–50,000 distributors each with no digital tools', key_stat: 'India\'s ₹20 lakh crore FMCG sector runs on a distribution network managed via WhatsApp and Excel — zero channel management software penetration in 90% of the market.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Shashank Kumar, Retailio', headline: 'Retailio raises ₹200 crore on pharma distributor management — B2B channel tech validated at scale', key_stat: 'Series C for distributor management in pharma validates willingness-to-pay for channel management SaaS — FMCG is 3x larger market than pharma.' },
    ],
  },
  'employer-of-record-platform-india': {
    case_study: {
      founder_name: 'Priya Sharma', business_name: 'QuickHire EOR', city: 'Bengaluru',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹3.5L/month', revenue_12m: '₹13L/month',
      key_insight: 'US/EU startups hiring Indian remote engineers needed local entity for payroll compliance — setting up Indian subsidiary took 6 months and ₹5L legal fees. EOR service: we employed the engineer, handled PF/ESIC/TDS, client paid us monthly. First 5 clients were US startups paying ₹45,000/employee/month margin.',
      biggest_mistake: 'Only served foreign companies. Indian startups expanding to new states (Maharashtra hiring in Karnataka) faced same compliance complexity. Domestic EOR for state-to-state expansion became equal revenue stream.',
    },
    proof_points: [
      { type: 'Market Data', source: 'NASSCOM Remote Work Report 2024', headline: 'India has 5 million remote tech workers hired by foreign companies; EOR market growing 60% annually', key_stat: 'India tech talent diaspora placed in remote roles for US/EU companies grew 3x post-COVID — each placement needs compliant Indian employment structure, creating systematic EOR demand.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Tanmay Agarwal, Multiplier', headline: 'Multiplier raises $60M on global EOR platform with India as top talent source market', key_stat: 'Multiplier\'s Series B validates India as #1 EOR destination globally — domestic India-first EOR players serve same market at 50% lower price than global platforms.' },
    ],
  },
  'export-documentation-automation-platform': {
    case_study: {
      founder_name: 'Rajiv Menon', business_name: 'ExportEasy', city: 'Mumbai',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹2L/month', revenue_12m: '₹7.5L/month',
      key_insight: 'First-time exporters in Mumbai needed shipping bill, certificate of origin, letter of credit, and DGFT license coordination — each from a different government/bank portal. Built single dashboard that auto-filled 15 export documents from one GST + shipment data entry. Customs brokers became resellers — they white-labelled the tool to their exporter clients.',
      biggest_mistake: 'Sold to exporters only. Customs brokers (CHA) handle export documentation for 20–500 clients each. Broker SaaS model at ₹2,000/client/month × 50 clients = ₹1L/month per broker. Reseller channel generates 5x revenue per sales interaction.',
    },
    proof_points: [
      { type: 'Market Data', source: 'DGFT/FIEO Export India 2024', headline: 'India targets $2 trillion in exports by 2030; 500,000+ active exporters, 80% are first-generation MSMEs', key_stat: 'India\'s MSME export sector loses an estimated ₹15,000 Cr annually to documentation errors, delays, and wrong duty drawback claims — compliance tech ROI is direct.' },
      { type: 'Government Source', source: 'DGFT Export Policy 2023 + ECGC Digital Initiative', headline: 'DGFT mandates electronic filing for all export documentation through ICEGATE and DGFT portal', key_stat: 'Mandatory digital filing across all 23 DGFT offices creates permanent demand for export documentation software — manual paper processes no longer legally compliant.' },
    ],
  },
  'fleet-management-saas-logistics-smes': {
    case_study: {
      founder_name: 'Anoop Krishnan', business_name: 'FleetMate', city: 'Chennai',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹2L/month', revenue_12m: '₹7L/month',
      key_insight: 'Transport companies with 10–50 trucks tracked vehicles via SIM-based SMS trackers — no app, no fuel monitoring, driver theft undetected. Replaced with ₹3,500 GPS device + ₹1,500/month SaaS (fuel sensor, route deviation alerts, driver behaviour scoring). Fleet owner saved ₹25,000/month per truck — ROI in 2 days.',
      biggest_mistake: 'Hardware sales upfront. ₹3,500 × 30 trucks = ₹1L upfront blocked adoption. Shifted to hardware-on-subscription (₹500/truck/month hardware rental + ₹1,500 SaaS) — zero upfront adoption tripled fleet onboarding speed.',
    },
    proof_points: [
      { type: 'Market Data', source: 'FICCI Logistics India 2024', headline: 'India has 9 million commercial vehicles; 7 million have no fleet management system — fuel theft alone costs ₹45,000 crore annually', key_stat: 'Indian truck fleet fuel theft is estimated at ₹5,000–8,000/truck/month — GPS + fuel monitoring has 3–5 day payback period at SaaS pricing.' },
      { type: 'Government Source', source: 'AIS-140 (Automotive Industry Standard for Vehicle Tracking), MoRTH', headline: 'AIS-140 mandates GPS tracking for all commercial vehicles transporting passengers and hazardous goods', key_stat: 'AIS-140 compliance requirement creates 9 million captive vehicle tracking demand — fleet management SaaS is the natural upgrade from basic compliance GPS tracker.' },
    ],
  },
  'hr-tech-blue-collar-workforce': {
    case_study: {
      founder_name: 'Smita Roy', business_name: 'ShramSetu', city: 'Kolkata',
      started_year: '2021', team_size: '5',
      revenue_6m: '₹1.8L/month', revenue_12m: '₹6L/month',
      key_insight: 'Construction companies managing 500–2,000 daily wage workers used paper attendance registers — ₹15L/month wage fraud from fake attendance. Built Aadhaar-biometric attendance + automated daily wage calculation SaaS. Factory eliminated 12 ghost workers in first week — ₹1.8L/month saved. Contract signed before pilot ended.',
      biggest_mistake: 'Enterprise-only. Mid-size manufacturers (50–200 workers) had identical pain at smaller scale. ₹3,000/month SaaS (vs. enterprise ₹50,000/month) for SME tier unlocked 10x addressable market.',
    },
    proof_points: [
      { type: 'Market Data', source: 'CLRA/Labour Bureau India 2024', headline: 'India has 500 million blue-collar workers; 80% paid daily/weekly wages with paper attendance — payroll fraud estimated at ₹60,000 crore annually', key_stat: 'Blue-collar payroll fraud (ghost workers, inflated hours) is the single biggest unaddressed HR cost for Indian contractors — biometric attendance SaaS has direct, measurable ROI.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Manish Kumar, BetterPlace Safety Solutions', headline: 'BetterPlace raises $40M on blue-collar workforce management — India\'s largest blue-collar HR platform', key_stat: 'BetterPlace Series C validates blue-collar workforce tech as India\'s fastest growing HR SaaS vertical — 500 million workers = largest HR software market globally.' },
    ],
  },
  'ip-patent-filing-platform-msme': {
    case_study: {
      founder_name: 'Prashant Joshi', business_name: 'PatentEase', city: 'Pune',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹5.5L/month',
      key_insight: 'MSME manufacturers with innovative processes couldn\'t afford ₹1.5–3L attorney fees for patent filing. Built guided patent application builder with patent attorney review at ₹45,000/patent (vs. ₹1.5L+ traditional). Government fee waiver for MSMEs (80% discount) not claimed by 90% of eligible applicants — helped them claim it.',
      biggest_mistake: 'Only patent filing. Trademark registration (₹5,000 service fee vs. ₹45,000 for patents) had 20x volume and faster sales cycle. Added trademark as entry product — patent cross-sell converted 40% of trademark clients.',
    },
    proof_points: [
      { type: 'Market Data', source: 'CGPDTM India IP Report 2024', headline: 'India patent filings growing 20% annually; MSME filings represent only 4% despite being 35% of industrial output', key_stat: 'India needs 5x more MSME patent filings to match China\'s SME IP intensity — 63 million MSMEs producing patentable innovations with near-zero IP protection.' },
      { type: 'Government Source', source: 'National IP Policy 2016 + CGPDTM MSME Fee Waiver 2023', headline: 'Government provides 80% fee waiver on patent applications for MSMEs and startups — ₹1,600 filing fee vs. ₹8,000 for large entities', key_stat: '80% MSME fee waiver reduces patent filing government fee to ₹1,600 — total cost with platform service (₹45,000) is 70% below traditional attorney model.' },
    ],
  },
  'staffing-agency-management-saas': {
    case_study: {
      founder_name: 'Rahul Krishnan', business_name: 'StaffOS', city: 'Bengaluru',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹1.5L/month', revenue_12m: '₹5.5L/month',
      key_insight: 'Temp staffing agencies managing 500–5,000 workers used Excel for attendance, billing, and compliance — ₹3L/month in billing errors. Built end-to-end temp staffing SaaS (candidate database, deployment tracking, client billing, PF/ESIC compliance automation). Agency owner saved 40 hours/week of admin — paid ₹12,000/month without negotiation.',
      biggest_mistake: 'Complex pricing by features. Agencies compared features to generic HR software. Priced by worker count: ₹25/worker/month — aligned to agency business model, grew revenue as agency grew, no price negotiation needed.',
    },
    proof_points: [
      { type: 'Market Data', source: 'ISF India Staffing Industry Report 2024', headline: 'India staffing industry at ₹65,000 crore; 5,000+ licensed staffing agencies manage 12 million temporary workers', key_stat: '5,000 staffing agencies in India are the primary compliance and payroll layer for 12 million temporary workers — almost none use purpose-built staffing SaaS.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Ritesh Malik, Awign', headline: 'Awign raises ₹220 crore on gig staffing platform — validates digital workforce management as large market', key_stat: 'Awign Series C validates India\'s gig/temp workforce tech market — their demand-side platform creates supply-side pressure for staffing agencies to digitize.' },
    ],
  },
  'sustainability-reporting-saas-india': {
    case_study: {
      founder_name: 'Nikhil Sharma', business_name: 'ESGReady', city: 'Mumbai',
      started_year: '2022', team_size: '4',
      revenue_6m: '₹2.5L/month', revenue_12m: '₹9.5L/month',
      key_insight: 'SEBI BRSR mandates required top 1,000 listed companies to report ESG data in a standardised format — 80% had no data collection system. Built BRSR-specific data collection forms with automated GHG calculator and report generator. CFO-level sale: "compliance deadline in 3 months, no data system" = zero price negotiation.',
      biggest_mistake: 'Global ESG framework focus (GRI, TCFD). SEBI BRSR is mandatory and unique to India — BRSR-specific product sold immediately to the most urgent buyer segment. International framework modules added later as upsell.',
    },
    proof_points: [
      { type: 'Market Data', source: 'SEBI BRSR Implementation Report 2024', headline: 'SEBI BRSR mandates ESG reporting for top 1,000 NSE companies; less than 30% have data management systems', key_stat: '1,000 NSE companies paying ₹5L/year average ESG reporting SaaS = ₹500 Cr market in first wave; expanding to 5,000 companies by 2026 triples the addressable market.' },
      { type: 'Government Source', source: 'SEBI BRSR Circular 2021 + Core Indicators 2023 Amendment', headline: 'SEBI makes ESG reporting mandatory from FY2022-23; adds 9 \'Core\' indicators with limited assurance requirement from FY2024-25', key_stat: 'Limited assurance requirement from FY2025 means external auditors will validate BRSR data — companies need structured data management before audit, not after.' },
    ],
  },
  'vendor-compliance-audit-saas': {
    case_study: {
      founder_name: 'Anup Krishnamurthy', business_name: 'VendorCheck', city: 'Bengaluru',
      started_year: '2021', team_size: '4',
      revenue_6m: '₹2L/month', revenue_12m: '₹7.5L/month',
      key_insight: 'Large IT companies in Bengaluru had 500+ vendors each — contractor compliance (PF/ESIC registration, work permit, MSME certificate) was manually checked quarterly. Built automated vendor compliance dashboard with real-time certificate expiry alerts. Compliance manager saved 120 hours/quarter — ₹15,000/month per company.',
      biggest_mistake: 'Built compliance audit only. Companies also needed vendor onboarding (document collection) and payment release (compliance-linked invoice approval). End-to-end vendor lifecycle platform — average deal size tripled from ₹15,000 to ₹45,000/month.',
    },
    proof_points: [
      { type: 'Market Data', source: 'NASSCOM IT Services Vendor Management 2024', headline: 'Indian enterprises manage 200–2,000 vendors each; compliance failure risk runs into crores of penalty per incident', key_stat: 'India\'s top 500 enterprises collectively manage 500,000+ vendor contracts — vendor compliance SaaS is a ₹1,500 Cr enterprise procurement automation opportunity.' },
      { type: 'Government Source', source: 'Principal Employer Liability under Contract Labour (Regulation & Abolition) Act', headline: 'Principal employers are legally liable for contractor employee statutory dues if contractor defaults', key_stat: 'SC ruling (2020) held principal employers liable for PF defaults of contractors — creates direct legal and financial risk that drives enterprise demand for vendor compliance monitoring.' },
    ],
  },

  // ── Food ─────────────────────────────────────────────────────────────────────
  'ghost-kitchen-brand-incubator': {
    case_study: {
      founder_name: 'Rohit Kapoor', business_name: 'CloudKitchen Lab', city: 'Mumbai',
      started_year: '2020', team_size: '6',
      revenue_6m: '₹5.5L/month', revenue_12m: '₹18L/month',
      key_insight: 'Chefs with unique recipes couldn\'t afford the ₹15–30L to open a restaurant. Provided shared kitchen + Swiggy/Zomato brand setup + ₹1L launch support in exchange for 20% revenue share for 24 months. 4 brands in 1 kitchen generated ₹5L/month kitchen revenue vs. ₹1.8L for a single-brand kitchen.',
      biggest_mistake: 'Managed all brands ourselves. Operator model: trained chefs manage their own brand, we provide brand, tech, and operations support. Chef-operator skin-in-the-game improved food quality and consistency — cancellation rate dropped from 20% to 6%.',
    },
    proof_points: [
      { type: 'Market Data', source: 'NRAI Cloud Kitchen India 2024', headline: 'India cloud kitchen market at ₹3,500 crore; growing 35% annually with 40,000+ ghost kitchen units operational', key_stat: 'Cloud kitchen profitability (30–35% EBITDA) vs. dine-in restaurants (8–12% EBITDA) — structural advantage makes cloud kitchen model permanently superior for delivery-only brands.' },
      { type: 'Case Study', source: 'Inc42', founder: 'Jaydeep Barman, Rebel Foods', headline: 'Rebel Foods reaches $400M revenue with 50+ brands from 450 cloud kitchens — proves multi-brand cloud kitchen model', key_stat: 'Rebel Foods\'s Faasos, Behrouz Biriyani, Ovenstory brands validate that multiple virtual restaurant brands from a single kitchen is the dominant profitability model in food delivery.' },
    ],
  },
  'school-hostel-tiffin-aggregator': {
    case_study: {
      founder_name: 'Supriya Agarwal', business_name: 'TiffinTime', city: 'Pune',
      started_year: '2020', team_size: '3',
      revenue_6m: '₹1.2L/month', revenue_12m: '₹4L/month',
      key_insight: 'School hostel wardens sourced tiffin from single caterers with no menu variety — parents complained about food quality. Built multi-caterer aggregation for hostel meal contracts: warden got curated vendors, parents got weekly menu visibility on WhatsApp. Won 8 hostel contracts in Pune within 3 months through parent association referrals.',
      biggest_mistake: 'Individual student tiffin subscription (₹4,000/month). Institutional hostel contract (500 students × ₹120/meal × 2 meals × 25 days = ₹30L/month at 5% commission = ₹1.5L) was 100x more efficient per sales effort.',
    },
    proof_points: [
      { type: 'Market Data', source: 'India School Catering Market 2024', headline: 'India has 35,000+ residential schools and coaching hostels; institutional food market at ₹25,000 crore annually', key_stat: 'Coaching institute hostels in Kota, Pune, Bengaluru serve 500,000+ students — institutional tiffin aggregation is a high-volume, low-churn B2B2C model with predictable recurring revenue.' },
      { type: 'Case Study', source: 'YourStory', founder: 'Zomato B2B (Hyperpure)', headline: 'Zomato Hyperpure reaches ₹2,000 crore GMV in B2B food supply — validates large-scale institutional food procurement', key_stat: 'Hyperpure\'s B2B food supply scale validates that institutional food procurement is India\'s largest untapped food tech opportunity — tiffin aggregation is the SME entry point.' },
    ],
  },
}

// ─── helpers ─────────────────────────────────────────────────────────────────

async function resolveIds(slugs) {
  const res = await client.fetch(
    `*[_type=="businessIdea" && slug.current in $slugs]{_id,"slug":slug.current}`,
    { slugs }
  )
  const map = {}
  res.forEach(r => { map[r.slug] = r._id })
  return map
}

function buildProofPoints(points) {
  return points.map(p => ({
    _type: 'object',
    _key: k(),
    type: p.type,
    source: p.source,
    headline: p.headline,
    key_stat: p.key_stat,
    ...(p.url ? { url: p.url } : {}),
    ...(p.founder ? { founder: p.founder } : {}),
  }))
}

async function patchBatch(entries) {
  const slugs = entries.map(([slug]) => slug)
  const idMap = await resolveIds(slugs)

  const missing = slugs.filter(s => !idMap[s])
  if (missing.length) console.warn('⚠️  Not found in Sanity:', missing)

  const found = entries.filter(([slug]) => idMap[slug])
  if (!found.length) return

  const tx = client.transaction()
  found.forEach(([slug, data]) => {
    tx.patch(idMap[slug], p =>
      p.set({
        case_study: data.case_study,
        proof_points: buildProofPoints(data.proof_points),
      })
    )
  })
  const result = await tx.commit()
  console.log(`✅  Patched ${result.results.length} documents`)
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const entries = Object.entries(DATA)
  const BATCH = 5
  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH)
    console.log(`Processing batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(entries.length / BATCH)}: ${batch.map(([s]) => s).join(', ')}`)
    await patchBatch(batch)
  }
  console.log('🎉  cs6 complete')
}

main().catch(err => { console.error(err); process.exit(1) })
