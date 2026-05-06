export type Stage = 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'series-d+' | 'ipo-prep'

export interface FundingDeal {
  id: string
  company: string
  sector: string
  subsector: string
  city: string
  state: string
  stage: Stage
  amountUSD: number   // million USD
  amountINR: number   // crore INR (approx)
  month: string       // YYYY-MM
  investors: string[]
  founded: number
  tagline: string
}

// Source: Inc42, Tracxn, VCC Edge, public press releases — FY2022–FY2024
export const FUNDING_DEALS: FundingDeal[] = [
  // ── FINTECH ──────────────────────────────────────────────────────────────────
  { id: 'perfios-d', company: 'Perfios', sector: 'Fintech', subsector: 'Credit Infrastructure', city: 'Bengaluru', state: 'Karnataka', stage: 'series-d+', amountUSD: 229, amountINR: 1900, month: '2023-05', investors: ['Bessemer Venture Partners', 'Teachers\' Venture Growth', 'Warburg Pincus'], founded: 2008, tagline: 'Bank statement & income verification API' },
  { id: 'kreditbee-d', company: 'KreditBee', sector: 'Fintech', subsector: 'Consumer Lending', city: 'Bengaluru', state: 'Karnataka', stage: 'series-d+', amountUSD: 200, amountINR: 1660, month: '2023-08', investors: ['Advent International', 'Premji Invest', 'MUFG'], founded: 2018, tagline: 'Instant personal loans for salaried & self-employed' },
  { id: 'moneyview-e', company: 'Moneyview', sector: 'Fintech', subsector: 'Personal Finance', city: 'Bengaluru', state: 'Karnataka', stage: 'series-d+', amountUSD: 75, amountINR: 623, month: '2023-10', investors: ['Winter Capital', 'Accel', 'Tiger Global'], founded: 2014, tagline: 'Credit scores, loans & money management app' },
  { id: 'juspay-c', company: 'Juspay', sector: 'Fintech', subsector: 'Payments', city: 'Bengaluru', state: 'Karnataka', stage: 'series-c', amountUSD: 60, amountINR: 498, month: '2023-06', investors: ['SoftBank Vision Fund 2', 'Accel'], founded: 2012, tagline: 'Payments orchestration powering UPI & checkout' },
  { id: 'fi-money-c', company: 'Fi (Epifi)', sector: 'Fintech', subsector: 'Neobanking', city: 'Bengaluru', state: 'Karnataka', stage: 'series-c', amountUSD: 75, amountINR: 623, month: '2022-01', investors: ['Temasek', 'Ribbit Capital', 'B Capital'], founded: 2019, tagline: 'Salary account & smart savings for millennials' },
  { id: 'm2p-fintech-c', company: 'M2P Fintech', sector: 'Fintech', subsector: 'Banking-as-a-Service', city: 'Chennai', state: 'Tamil Nadu', stage: 'series-c', amountUSD: 56, amountINR: 465, month: '2022-12', investors: ['NewQuest Capital', 'Insight Partners'], founded: 2014, tagline: 'API infrastructure for banks and fintechs' },
  { id: 'credable-b', company: 'CredAble', sector: 'Fintech', subsector: 'Supply Chain Finance', city: 'Mumbai', state: 'Maharashtra', stage: 'series-b', amountUSD: 25, amountINR: 207, month: '2023-04', investors: ['Fundamentum', 'API Holdings'], founded: 2017, tagline: 'Working capital financing for SME supply chains' },
  { id: 'grip-invest-a', company: 'Grip Invest', sector: 'Fintech', subsector: 'Alternative Investments', city: 'Delhi', state: 'Delhi NCR', stage: 'series-a', amountUSD: 14, amountINR: 116, month: '2023-03', investors: ['Endiya Partners', 'Titan Capital', 'pi Ventures'], founded: 2020, tagline: 'Fractional investments in leased assets & bonds' },

  // ── EDTECH ──────────────────────────────────────────────────────────────────
  { id: 'pw-b', company: 'PhysicsWallah', sector: 'Edtech', subsector: 'Test Prep', city: 'Noida', state: 'Uttar Pradesh', stage: 'series-b', amountUSD: 100, amountINR: 830, month: '2022-06', investors: ['WestBridge Capital', 'GSV Ventures'], founded: 2020, tagline: 'Affordable JEE/NEET coaching online & offline' },
  { id: 'classplus-d', company: 'Classplus', sector: 'Edtech', subsector: 'Tutor Infra', city: 'Noida', state: 'Uttar Pradesh', stage: 'series-d+', amountUSD: 70, amountINR: 581, month: '2022-01', investors: ['Alpha Wave Global', 'Tiger Global', 'Sequoia India'], founded: 2018, tagline: 'SaaS platform for coaching institutes to go online' },
  { id: 'teachmint-b', company: 'Teachmint', sector: 'Edtech', subsector: 'Classroom SaaS', city: 'Bengaluru', state: 'Karnataka', stage: 'series-b', amountUSD: 78, amountINR: 648, month: '2022-01', investors: ['Rocketship.vc', 'Lightspeed Venture Partners'], founded: 2020, tagline: 'Digital classroom tools for K-12 teachers' },
  { id: 'sunstone-b', company: 'Sunstone Eduversity', sector: 'Edtech', subsector: 'Higher Education', city: 'Delhi', state: 'Delhi NCR', stage: 'series-b', amountUSD: 35, amountINR: 291, month: '2022-07', investors: ['Alteria Capital', 'LC Nueva'], founded: 2019, tagline: 'Income-share model for college education & placement' },

  // ── HEALTHTECH ──────────────────────────────────────────────────────────────
  { id: 'pristyn-e', company: 'Pristyn Care', sector: 'Healthtech', subsector: 'Surgical Care', city: 'Gurugram', state: 'Haryana', stage: 'series-d+', amountUSD: 150, amountINR: 1245, month: '2022-03', investors: ['Sequoia Capital India', 'Hummingbird Ventures'], founded: 2018, tagline: 'Elective surgery network — cataract, hernia, kidney stones' },
  { id: 'healthify-c', company: 'HealthifyMe', sector: 'Healthtech', subsector: 'Wellness', city: 'Bengaluru', state: 'Karnataka', stage: 'series-c', amountUSD: 75, amountINR: 623, month: '2022-09', investors: ['LeapFrog Investments', 'Khosla Ventures', 'Unilever Ventures'], founded: 2012, tagline: 'AI calorie tracker, dieticians & fitness coaching' },
  { id: 'ayu-health-b', company: 'Ayu Health', sector: 'Healthtech', subsector: 'Hospital Network', city: 'Bengaluru', state: 'Karnataka', stage: 'series-b', amountUSD: 33, amountINR: 274, month: '2022-07', investors: ['Omidyar Network India', 'Jungle Ventures'], founded: 2018, tagline: 'Affordable hospital network in Tier-2 cities' },
  { id: 'ekacare-a', company: 'Eka Care', sector: 'Healthtech', subsector: 'Health Records', city: 'Bengaluru', state: 'Karnataka', stage: 'series-a', amountUSD: 22, amountINR: 183, month: '2023-02', investors: ['Accel', 'GV (Google Ventures)'], founded: 2019, tagline: 'ABHA-linked personal health records on ABDM' },

  // ── AGRITECH ────────────────────────────────────────────────────────────────
  { id: 'dehaat-e', company: 'DeHaat', sector: 'Agritech', subsector: 'Full-stack Agri Services', city: 'Patna', state: 'Bihar', stage: 'series-d+', amountUSD: 60, amountINR: 498, month: '2022-10', investors: ['Sofina', 'FMC Ventures', 'RPS Ventures'], founded: 2012, tagline: 'Agri inputs, advisory & market linkages for farmers' },
  { id: 'ninjacart-f', company: 'Ninjacart', sector: 'Agritech', subsector: 'Supply Chain', city: 'Bengaluru', state: 'Karnataka', stage: 'series-d+', amountUSD: 145, amountINR: 1204, month: '2022-01', investors: ['Tiger Global', 'Walmart', 'Accel'], founded: 2015, tagline: 'Farm-to-business fresh produce supply chain' },
  { id: 'waycool-d', company: 'WayCool Foods', sector: 'Agritech', subsector: 'Agri Distribution', city: 'Chennai', state: 'Tamil Nadu', stage: 'series-d+', amountUSD: 35, amountINR: 291, month: '2022-06', investors: ['Lightrock India', 'Drip Capital'], founded: 2015, tagline: 'Integrated food distribution & agri-fintech platform' },
  { id: 'jai-kisan-b', company: 'Jai Kisan', sector: 'Agritech', subsector: 'Agri Finance', city: 'Mumbai', state: 'Maharashtra', stage: 'series-b', amountUSD: 30, amountINR: 249, month: '2022-04', investors: ['Blume Ventures', 'Mirae Asset', 'Omidyar'], founded: 2018, tagline: 'Agri credit for smallholder farmers via rural NBFCs' },

  // ── QUICK COMMERCE ──────────────────────────────────────────────────────────
  { id: 'zepto-e', company: 'Zepto', sector: 'Quick Commerce', subsector: '10-min Grocery', city: 'Mumbai', state: 'Maharashtra', stage: 'series-d+', amountUSD: 665, amountINR: 5520, month: '2023-08', investors: ['StepStone Group', 'Goodwater Capital', 'Nexus Venture Partners', 'Y Combinator'], founded: 2021, tagline: '10-minute grocery delivery via dark store network' },
  { id: 'zepto-f', company: 'Zepto', sector: 'Quick Commerce', subsector: '10-min Grocery', city: 'Mumbai', state: 'Maharashtra', stage: 'series-d+', amountUSD: 340, amountINR: 2820, month: '2024-06', investors: ['Motilal Oswal', 'Lightspeed', 'General Catalyst'], founded: 2021, tagline: 'Series F pre-IPO round' },

  // ── D2C / CONSUMER ──────────────────────────────────────────────────────────
  { id: 'country-delight-d', company: 'Country Delight', sector: 'D2C', subsector: 'Farm-fresh Dairy', city: 'Gurugram', state: 'Haryana', stage: 'series-d+', amountUSD: 110, amountINR: 913, month: '2022-04', investors: ['Temasek', 'Think Investments', 'Matrix Partners'], founded: 2015, tagline: 'Subscription dairy & fresh produce home delivery' },
  { id: 'licious-g', company: 'Licious', sector: 'D2C', subsector: 'Meat & Seafood', city: 'Bengaluru', state: 'Karnataka', stage: 'series-d+', amountUSD: 52, amountINR: 432, month: '2022-01', investors: ['IIFL AMC', 'Bertelsmann India', '3one4 Capital'], founded: 2015, tagline: 'Premium cut & packaged meat delivery' },
  { id: 'sugar-d', company: 'SUGAR Cosmetics', sector: 'D2C', subsector: 'Beauty & Personal Care', city: 'Mumbai', state: 'Maharashtra', stage: 'series-d+', amountUSD: 50, amountINR: 415, month: '2022-10', investors: ['L Catterton', 'India Quotient', 'Elevation Capital'], founded: 2015, tagline: 'Long-stay makeup brand targeting Indian skin tones' },
  { id: 'heads-up-tails-c', company: 'Heads Up For Tails', sector: 'D2C', subsector: 'Pet Care', city: 'Gurugram', state: 'Haryana', stage: 'series-c', amountUSD: 37, amountINR: 307, month: '2023-06', investors: ['True North', 'Sequoia Surge'], founded: 2008, tagline: 'Premium pet food, grooming & accessories retail' },
  { id: 'purplle-f', company: 'Purplle', sector: 'D2C', subsector: 'Beauty Marketplace', city: 'Mumbai', state: 'Maharashtra', stage: 'series-d+', amountUSD: 45, amountINR: 374, month: '2023-04', investors: ['Premji Invest', 'Sequoia India', 'Verlinvest'], founded: 2012, tagline: 'Online beauty marketplace + private labels' },
  { id: 'mokobara-a', company: 'Mokobara', sector: 'D2C', subsector: 'Lifestyle / Luggage', city: 'Bengaluru', state: 'Karnataka', stage: 'series-a', amountUSD: 12, amountINR: 100, month: '2023-10', investors: ['Peak XV (Sequoia)', 'Fireside Ventures'], founded: 2021, tagline: 'Premium luggage & travel accessories targeting millennials' },

  // ── SAAS / B2B SOFTWARE ──────────────────────────────────────────────────────
  { id: 'darwinbox-d', company: 'Darwinbox', sector: 'SaaS', subsector: 'HR Tech', city: 'Hyderabad', state: 'Telangana', stage: 'series-d+', amountUSD: 72, amountINR: 598, month: '2022-01', investors: ['Technology Crossover Ventures (TCV)', 'Salesforce Ventures', 'Sequoia India'], founded: 2015, tagline: 'Cloud HCM suite for enterprise HR in Asia' },
  { id: 'keka-a', company: 'Keka HR', sector: 'SaaS', subsector: 'HR Tech', city: 'Hyderabad', state: 'Telangana', stage: 'series-a', amountUSD: 57, amountINR: 473, month: '2022-08', investors: ['WestBridge Capital'], founded: 2015, tagline: 'SMB HR & payroll software — bootstrapped to $50M ARR' },
  { id: 'whatfix-d', company: 'Whatfix', sector: 'SaaS', subsector: 'Digital Adoption', city: 'Bengaluru', state: 'Karnataka', stage: 'series-d+', amountUSD: 90, amountINR: 747, month: '2022-04', investors: ['SoftBank Vision Fund 2', 'Sequoia India', 'Cisco Investments'], founded: 2014, tagline: 'In-app guidance and DAP for enterprise software' },
  { id: 'postman-d', company: 'Postman', sector: 'SaaS', subsector: 'Developer Tools', city: 'Bengaluru', state: 'Karnataka', stage: 'series-d+', amountUSD: 225, amountINR: 1868, month: '2022-08', investors: ['BOND', 'Insight Partners', 'Coatue'], founded: 2014, tagline: 'API development & testing platform — 25M developers' },
  { id: 'browserstack-b', company: 'BrowserStack', sector: 'SaaS', subsector: 'Developer Tools', city: 'Mumbai', state: 'Maharashtra', stage: 'series-b', amountUSD: 200, amountINR: 1660, month: '2022-06', investors: ['Bond Capital', 'BOND', 'Insight Partners'], founded: 2011, tagline: 'Cloud-based browser & device testing platform' },
  { id: 'chargebee-h', company: 'Chargebee', sector: 'SaaS', subsector: 'Billing & Revenue', city: 'Chennai', state: 'Tamil Nadu', stage: 'series-d+', amountUSD: 250, amountINR: 2075, month: '2022-01', investors: ['Tiger Global', 'Sapphire Ventures', 'Insight Partners'], founded: 2011, tagline: 'Subscription billing & revenue management for SaaS' },
  { id: 'increff-b', company: 'Increff', sector: 'SaaS', subsector: 'Retail Tech', city: 'Bengaluru', state: 'Karnataka', stage: 'series-b', amountUSD: 15, amountINR: 125, month: '2022-09', investors: ['Westbridge Capital', 'Binny Bansal'], founded: 2016, tagline: 'Inventory & merchandising tech for apparel brands' },

  // ── EV / CLEANTECH ──────────────────────────────────────────────────────────
  { id: 'ather-e', company: 'Ather Energy', sector: 'EV / Cleantech', subsector: 'Electric 2-Wheeler', city: 'Bengaluru', state: 'Karnataka', stage: 'series-d+', amountUSD: 128, amountINR: 1063, month: '2022-01', investors: ['Hero MotoCorp', 'GIC Singapore', 'Stride Ventures'], founded: 2013, tagline: 'Premium electric scooters with smart dashboard' },
  { id: 'euler-c', company: 'Euler Motors', sector: 'EV / Cleantech', subsector: 'Electric 3-Wheeler', city: 'Delhi', state: 'Delhi NCR', stage: 'series-c', amountUSD: 60, amountINR: 498, month: '2023-07', investors: ['British International Investment', 'Blume Ventures', 'Stability AI CEO'], founded: 2018, tagline: 'Electric cargo 3-wheelers for last-mile delivery' },
  { id: 'yulu-b', company: 'Yulu', sector: 'EV / Cleantech', subsector: 'Micro-mobility', city: 'Bengaluru', state: 'Karnataka', stage: 'series-b', amountUSD: 82, amountINR: 681, month: '2022-11', investors: ['Bajaj Auto', 'Rocketship.vc'], founded: 2017, tagline: 'Shared e-bike & e-cycle platform for daily commute' },
  { id: 'log9-b', company: 'Log9 Materials', sector: 'EV / Cleantech', subsector: 'Battery Tech', city: 'Bengaluru', state: 'Karnataka', stage: 'series-b', amountUSD: 40, amountINR: 332, month: '2022-09', investors: ['Amara Raja Batteries', 'Exponent Energy investors'], founded: 2015, tagline: 'Fast-charge Li-ion battery cells and packs for EVs' },
  { id: 'solarify-a', company: 'SolarSquare', sector: 'EV / Cleantech', subsector: 'Rooftop Solar', city: 'Mumbai', state: 'Maharashtra', stage: 'series-a', amountUSD: 14, amountINR: 116, month: '2023-03', investors: ['Matrix Partners India', 'Better Capital'], founded: 2020, tagline: 'Residential rooftop solar installation & financing' },

  // ── SPACE TECH ──────────────────────────────────────────────────────────────
  { id: 'skyroot-b', company: 'Skyroot Aerospace', sector: 'Deep Tech', subsector: 'Space Launch', city: 'Hyderabad', state: 'Telangana', stage: 'series-b', amountUSD: 51, amountINR: 423, month: '2023-11', investors: ['GIC Singapore', 'Temasek', 'Bessemer Venture Partners'], founded: 2018, tagline: 'Small satellite launch vehicle — Vikram series rockets' },
  { id: 'agnikul-pre-b', company: 'Agnikul Cosmos', sector: 'Deep Tech', subsector: 'Space Launch', city: 'Chennai', state: 'Tamil Nadu', stage: 'series-a', amountUSD: 26, amountINR: 216, month: '2023-02', investors: ['Mayfield India', 'Artha Venture Fund', 'pi Ventures'], founded: 2017, tagline: 'World\'s first single-piece 3D-printed rocket engine' },
  { id: 'pixxel-b', company: 'Pixxel', sector: 'Deep Tech', subsector: 'Earth Observation', city: 'Bengaluru', state: 'Karnataka', stage: 'series-b', amountUSD: 36, amountINR: 299, month: '2022-11', investors: ['Google', 'Lightspeed', 'Radical Ventures'], founded: 2019, tagline: 'Hyperspectral satellite constellation for earth insights' },

  // ── LOGISTICS ────────────────────────────────────────────────────────────────
  { id: 'porter-f', company: 'Porter', sector: 'Logistics', subsector: 'Intra-city Freight', city: 'Bengaluru', state: 'Karnataka', stage: 'series-d+', amountUSD: 200, amountINR: 1660, month: '2022-04', investors: ['Vitruvian Partners', 'Tiger Global', 'Lightrock'], founded: 2014, tagline: 'Intra-city mini-truck & 2-wheeler delivery marketplace' },
  { id: 'shadowfax-e', company: 'Shadowfax', sector: 'Logistics', subsector: 'Last-mile Delivery', city: 'Bengaluru', state: 'Karnataka', stage: 'series-d+', amountUSD: 100, amountINR: 830, month: '2022-04', investors: ['IFC', 'Flipkart', 'Eight Roads Ventures'], founded: 2015, tagline: 'Tech-first last-mile logistics for ecommerce & pharma' },
  { id: 'elastic-run-d', company: 'ElasticRun', sector: 'Logistics', subsector: 'Rural Distribution', city: 'Pune', state: 'Maharashtra', stage: 'series-d+', amountUSD: 330, amountINR: 2739, month: '2022-03', investors: ['SoftBank Vision Fund 2', 'Goldman Sachs'], founded: 2016, tagline: 'Crowdsourced rural distribution reaching 50,000+ villages' },
  { id: 'shiprocket-e', company: 'Shiprocket', sector: 'Logistics', subsector: 'eCommerce Shipping', city: 'Delhi', state: 'Delhi NCR', stage: 'series-d+', amountUSD: 33, amountINR: 274, month: '2023-01', investors: ['Bertelsmann', 'Tribe Capital', 'March Capital'], founded: 2017, tagline: 'Multi-carrier shipping aggregator for D2C brands' },

  // ── B2B / MANUFACTURING ──────────────────────────────────────────────────────
  { id: 'zetwerk-d', company: 'Zetwerk', sector: 'B2B / Mfg', subsector: 'Manufacturing Marketplace', city: 'Bengaluru', state: 'Karnataka', stage: 'series-d+', amountUSD: 120, amountINR: 996, month: '2022-06', investors: ['Lightspeed', 'Greenoaks Capital', 'Kae Capital'], founded: 2018, tagline: 'Manufacturing network for industrial & consumer goods' },
  { id: 'moglix-h', company: 'Moglix', sector: 'B2B / Mfg', subsector: 'Industrial B2B Commerce', city: 'Noida', state: 'Uttar Pradesh', stage: 'series-d+', amountUSD: 250, amountINR: 2075, month: '2022-05', investors: ['Falcon Edge Capital', 'Harvard Management', 'Ratan Tata'], founded: 2015, tagline: 'B2B industrial goods procurement for manufacturing cos.' },
  { id: 'ofbusiness-g', company: 'OfBusiness', sector: 'B2B / Mfg', subsector: 'Raw Material Financing', city: 'Gurugram', state: 'Haryana', stage: 'series-d+', amountUSD: 200, amountINR: 1660, month: '2022-03', investors: ['SoftBank Vision Fund 2', 'Creation Investments', 'Matrix Partners'], founded: 2015, tagline: 'SME raw material procurement + embedded credit platform' },

  // ── PROPTECH ────────────────────────────────────────────────────────────────
  { id: 'stanza-c', company: 'Stanza Living', sector: 'Proptech', subsector: 'Student Housing', city: 'Delhi', state: 'Delhi NCR', stage: 'series-c', amountUSD: 25, amountINR: 208, month: '2022-09', investors: ['Falcon Edge Capital', 'Sequoia India'], founded: 2017, tagline: 'Tech-enabled student & professional co-living spaces' },
  { id: 'square-yards-d', company: 'Square Yards', sector: 'Proptech', subsector: 'Real Estate Platform', city: 'Gurugram', state: 'Haryana', stage: 'series-d+', amountUSD: 25, amountINR: 208, month: '2022-07', investors: ['Nexus Venture Partners', 'HDFC Capital'], founded: 2014, tagline: 'Integrated real estate marketplace + mortgage services' },

  // ── CLIMATE / WATER ──────────────────────────────────────────────────────────
  { id: 'ecostp-a', company: 'EcoSTP', sector: 'Climate / Water', subsector: 'Water Treatment', city: 'Bengaluru', state: 'Karnataka', stage: 'series-a', amountUSD: 8, amountINR: 66, month: '2023-01', investors: ['Ankur Capital', 'Rainmatter Foundation'], founded: 2014, tagline: 'Compact decentralised sewage treatment plants for buildings' },
  { id: 'crespire-pre-a', company: 'Crespire', sector: 'Climate / Water', subsector: 'Carbon Credits', city: 'Mumbai', state: 'Maharashtra', stage: 'seed', amountUSD: 3, amountINR: 25, month: '2023-06', investors: ['Gaia Impact Fund', 'Climate Angels'], founded: 2022, tagline: 'Carbon credit marketplace for Indian SMEs' },

  // ── GAMING / CREATOR ─────────────────────────────────────────────────────────
  { id: 'bombay-play-b', company: 'Bombay Play', sector: 'Gaming', subsector: 'Casual Mobile Games', city: 'Bengaluru', state: 'Karnataka', stage: 'series-b', amountUSD: 17, amountINR: 141, month: '2023-05', investors: ['Nazara Technologies', 'March Capital'], founded: 2019, tagline: 'Multiplayer casual games — Ludo, Carrom, Word games' },
  { id: 'kofluence-a', company: 'Kofluence', sector: 'Creator Economy', subsector: 'Influencer Marketing', city: 'Bengaluru', state: 'Karnataka', stage: 'series-a', amountUSD: 7, amountINR: 58, month: '2023-08', investors: ['Venture Catalysts', 'Spring Marketing Capital'], founded: 2019, tagline: 'AI-powered influencer discovery & campaign management' },

  // ── FOOD TECH ────────────────────────────────────────────────────────────────
  { id: 'freshmenu-c', company: 'Box8 / MOJO Pizza', sector: 'Foodtech', subsector: 'Cloud Kitchen Brand', city: 'Bengaluru', state: 'Karnataka', stage: 'series-c', amountUSD: 22, amountINR: 183, month: '2022-03', investors: ['Alibaba (Ant Group)', 'Kalaari Capital'], founded: 2015, tagline: 'Multi-brand cloud kitchen operating 200+ dark kitchens' },
  { id: 'dotpe-b', company: 'DotPe', sector: 'Foodtech', subsector: 'Restaurant SaaS', city: 'Gurugram', state: 'Haryana', stage: 'series-b', amountUSD: 55, amountINR: 457, month: '2022-01', investors: ['PayU', 'Google (Gradient Ventures)', 'Jungle Ventures'], founded: 2019, tagline: 'QR-based ordering, payments & loyalty for restaurants' },

  // ── INSURTECH ────────────────────────────────────────────────────────────────
  { id: 'acko-e', company: 'Acko', sector: 'Insurtech', subsector: 'Digital Insurance', city: 'Bengaluru', state: 'Karnataka', stage: 'series-d+', amountUSD: 255, amountINR: 2117, month: '2022-01', investors: ['General Atlantic', 'Multiples PE', 'Lightspeed'], founded: 2016, tagline: 'Digital-first car, health and micro-insurance' },
  { id: 'turtlemint-e', company: 'Turtlemint', sector: 'Insurtech', subsector: 'Insurance Distribution', city: 'Mumbai', state: 'Maharashtra', stage: 'series-d+', amountUSD: 120, amountINR: 996, month: '2022-06', investors: ['GGV Capital', 'Jungle Ventures', 'Amansa Capital'], founded: 2015, tagline: 'Digital insurance advisory platform for agents & consumers' },

  // ── TRAVEL / HOSPITALITY ─────────────────────────────────────────────────────
  { id: 'stayvista-a', company: 'StayVista', sector: 'Travel / Hospitality', subsector: 'Vacation Rentals', city: 'Mumbai', state: 'Maharashtra', stage: 'series-a', amountUSD: 10, amountINR: 83, month: '2023-05', investors: ['Elevation Capital', 'AngelList India'], founded: 2018, tagline: 'Curated private villa & resort network across India' },
  { id: 'treebo-c', company: 'Treebo Hotels', sector: 'Travel / Hospitality', subsector: 'Budget Hotel Chain', city: 'Bengaluru', state: 'Karnataka', stage: 'series-c', amountUSD: 34, amountINR: 282, month: '2022-09', investors: ['Elevation Capital', 'Bertelsmann India'], founded: 2015, tagline: 'Quality-assured budget hotel franchise network' },

  // ── VERNACULAR / BHARAT ──────────────────────────────────────────────────────
  { id: 'kuku-fm-c', company: 'Kuku FM', sector:'Media / Content', subsector: 'Audio Content', city: 'Delhi', state: 'Delhi NCR', stage: 'series-c', amountUSD: 25, amountINR: 208, month: '2023-03', investors: ['South Park Commons', 'Kalaari Capital', 'Tencent'], founded: 2018, tagline: 'Hindi & regional audio stories, courses and podcasts' },
]

// ── Derived aggregates (computed from deals) ─────────────────────────────────

export function getSummaryStats(deals: FundingDeal[]) {
  const totalUSD = deals.reduce((s, d) => s + d.amountUSD, 0)
  const bySector = deals.reduce<Record<string, { count: number; usd: number }>>((acc, d) => {
    acc[d.sector] = acc[d.sector] ?? { count: 0, usd: 0 }
    acc[d.sector].count++
    acc[d.sector].usd += d.amountUSD
    return acc
  }, {})
  const byStage = deals.reduce<Record<string, number>>((acc, d) => {
    acc[d.stage] = (acc[d.stage] ?? 0) + 1; return acc
  }, {})
  const byCity = deals.reduce<Record<string, number>>((acc, d) => {
    acc[d.city] = (acc[d.city] ?? 0) + 1; return acc
  }, {})
  return { totalUSD, bySector, byStage, byCity, count: deals.length }
}

export const SECTORS = [...new Set(FUNDING_DEALS.map(d => d.sector))].sort()
export const CITIES  = [...new Set(FUNDING_DEALS.map(d => d.city))].sort()
export const STAGES: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'series-d+', 'ipo-prep']
export const STAGE_LABELS: Record<Stage, string> = {
  'pre-seed': 'Pre-Seed', 'seed': 'Seed', 'series-a': 'Series A',
  'series-b': 'Series B', 'series-c': 'Series C', 'series-d+': 'Series D+', 'ipo-prep': 'IPO Prep',
}
