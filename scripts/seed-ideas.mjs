import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '../.env.local')

// Parse .env.local manually
const env = {}
readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
})

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: env.SANITY_API_TOKEN,
  useCdn: false,
})

// Helper: wrap plain text in a PortableText block
function pt(text) {
  return [{ _type: 'block', _key: Math.random().toString(36).slice(2), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: Math.random().toString(36).slice(2), text, marks: [] }] }]
}

// Helper: multi-paragraph portable text
function pts(...paragraphs) {
  return paragraphs.map((text) => ({
    _type: 'block',
    _key: Math.random().toString(36).slice(2),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: Math.random().toString(36).slice(2), text, marks: [] }],
  }))
}

const ideas = [
  {
    _type: 'businessIdea',
    title: 'Home Tiffin & Meal Subscription Service',
    slug: { _type: 'slug', current: 'home-tiffin-meal-subscription-service' },
    description: 'A home-cooked meal subscription delivered daily to working professionals, students and bachelors who miss ghar ka khana. Low capital, recurring revenue, and strong word-of-mouth in dense urban pockets.',
    budget_range: 'under_1l',
    industry: 'Local Services',
    market_saturation: 'competitive',
    difficulty_level: 'beginner',
    stage: 'competitive',
    revenue_model: ['Subscription (SaaS)', 'Consulting / Services'],
    resources_needed: ['Solo Founder OK', 'Physical Space'],
    tags: ['tiffin', 'food', 'subscription', 'meal-delivery', 'home-cooked', 'recurring-revenue', 'local-services'],
    featured: true,
    published_at: new Date('2025-01-01').toISOString(),
    introduction: pts(
      "India runs on home-cooked food — and millions of working professionals, students and bachelors living away from family wake up every day without a reliable meal. They are tired of restaurant food, can't cook, and are willing to pay for consistency and taste that reminds them of home.",
      "A home tiffin business solves this problem at hyper-local scale. You cook, pack and deliver 20–80 meals a day within a 3–4 km radius — and charge a monthly subscription. No Swiggy. No middlemen. Direct relationship with your customer.",
    ),
    target_audience: pts(
      "This works best for someone who genuinely loves cooking, has a kitchen capable of producing 20–80 meals a day, and lives in or near a working professional cluster (IT parks, university campuses, PG accommodation zones). You are effectively running a micro-restaurant from your kitchen.",
      "Customers: Working professionals (ages 22–35) in metros and Tier-1 cities, students in PG accommodation, and nuclear families in apartments who want a home-cooked meal backup.",
    ),
    why_it_works: pts(
      "People crave the taste of ghar ka khana and are willing to pay a monthly subscription for it. Recurring revenue means predictable income from day one — unlike a restaurant, you know exactly how many meals to make each morning.",
      "The unit economics are excellent at small scale: with 40 subscribers at ₹3,500/month each, you are doing ₹1.4 lakh/month revenue with minimal overhead. WhatsApp is your CRM and Instagram is your marketing channel.",
    ),
    scope_in_india: pts(
      "Bengaluru, Pune, Hyderabad, Noida and Chennai have some of the highest concentrations of migrant working professionals in India. These cities are tiffin goldmines. A 3 km radius around any large IT park can sustain a 50-tiffin operation.",
      "Smaller Tier-2 cities (Indore, Surat, Nagpur) are increasingly viable as tech and manufacturing employment grows.",
    ),
    things_to_note: [
      'FSSAI license is mandatory — get it before you scale, not after.',
      'Pricing too low to attract customers is a trap — your time and gas cost money.',
      'Delivery logistics beyond 3–4 km become a headache; keep your radius tight initially.',
      'Seasonal dips happen — have a lean menu plan for summer when raw material costs spike.',
    ],
    current_landscape: pts(
      "Platforms like Khatakhata, Eatclub and even Swiggy Daily have tried to organise this space — none have fully dominated it. The market is served by thousands of informal, individual tiffin providers. That is your competition — and your advantage, because trust and taste beat a brand logo every time.",
    ),
    gross_margin: '55–70%',
    setup_cost_range: '₹20,000–₹60,000',
    pivot_options: 'Catering for offices / events, cloud kitchen, cooking classes',
    financing_options: 'Self-funded, friends & family, microfinance (Mudra loan)',
    pros: [
      'Very low starting capital',
      'Recurring subscription revenue',
      'Quick path to profitability',
      'Strong word-of-mouth growth',
    ],
    cons: [
      'Physically demanding — 7 days a week',
      'Hard to scale beyond a point without hiring',
      'Dependent on your personal health & availability',
      'Margins compress as you add delivery staff',
    ],
  },

  {
    _type: 'businessIdea',
    title: 'YouTube Automation / Faceless Content Channel',
    slug: { _type: 'slug', current: 'youtube-automation-faceless-content-channel' },
    description: 'Build a YouTube channel without ever appearing on camera. Script, narrate and edit niche content using AI and freelancers, then monetise through AdSense, sponsorships and affiliate links — fully location-independent.',
    budget_range: 'under_1l',
    industry: 'Creator Economy',
    market_saturation: 'competitive',
    difficulty_level: 'beginner',
    stage: 'competitive',
    revenue_model: ['Advertising', 'Affiliate'],
    resources_needed: ['Solo Founder OK'],
    tags: ['youtube', 'content-creation', 'faceless-channel', 'passive-income', 'creator-economy', 'ai', 'automation'],
    featured: true,
    published_at: new Date('2025-01-02').toISOString(),
    introduction: pts(
      "A faceless YouTube channel is one where you never appear on camera. You pick a niche — finance tips, motivational stories, Indian history, tech explainers — write scripts, commission voiceovers or use AI narration, add stock footage or animations, and upload consistently.",
      "Once a video is live, it earns forever. A library of 50–100 videos in a strong niche can generate ₹50,000–₹3,00,000/month on autopilot once the channel hits monetisation thresholds.",
    ),
    target_audience: pts(
      "Anyone curious about content, willing to learn basic video editing and SEO, and patient enough to wait 6–12 months before seeing significant income. This is not a get-rich-quick scheme — it is a content asset you build over time.",
      "Best suited for: recent graduates exploring side income, professionals with niche knowledge (CAs making finance content, engineers making tech explainers), and anyone comfortable with digital tools.",
    ),
    why_it_works: pts(
      "YouTube pays well in English niches (finance, tech, health) and increasingly well in Hindi. The automation model works because AI tools have dramatically lowered the cost of production — scripts, voiceovers and thumbnails can all be produced in hours with the right tools.",
      "Once the channel is monetised, it becomes a content annuity — old videos keep earning. Diversification into sponsorships and affiliate links multiplies the revenue per video.",
    ),
    scope_in_india: pts(
      "India is the second-largest YouTube market in the world. Hindi content is massively underserved in high-CPM niches like personal finance, investing and technology. A Hindi-language channel covering mutual funds or stock market basics can earn 3–5x more per view than general entertainment content.",
    ),
    things_to_note: [
      'The first 6–12 months will feel like you are shouting into a void — persistence is everything.',
      'Copyright strikes can kill a channel; use royalty-free music and licensed footage only.',
      'AdSense CPM in India is lower than the US — diversify into sponsorships and affiliate early.',
      'YouTube algorithm changes can hurt channels overnight; do not rely on a single income stream.',
    ],
    current_landscape: pts(
      "Channels like Pushkar Raj Thakur, Ankur Warikoo and Sharan Hegde have proved that finance content in Hindi is a goldmine. The faceless automation model is common in English globally but still has wide open lanes in Hindi and regional language niches.",
    ),
    gross_margin: '60–80% (post outsourcing costs)',
    setup_cost_range: '₹15,000–₹50,000',
    pivot_options: 'Sell the channel, launch a course, build a newsletter, affiliate marketing',
    financing_options: 'Self-funded; no external funding needed',
    pros: [
      'No camera, no face required',
      'Passive income once video library grows',
      'Completely location-independent',
      'Multiple monetisation streams (ads, sponsorships, affiliate, courses)',
    ],
    cons: [
      'Slow to monetise — minimum 1,000 subscribers + 4,000 watch hours required',
      'High competition in popular niches',
      'Algorithm-dependent income',
      'Requires consistent output for 6–12 months before results show',
    ],
  },

  {
    _type: 'businessIdea',
    title: 'Hyperlocal D2C Skincare Brand',
    slug: { _type: 'slug', current: 'hyperlocal-d2c-skincare-brand' },
    description: 'Launch a direct-to-consumer skincare brand targeting ingredient-aware Indian consumers, starting with 2–3 hero products. Build on Shopify, sell on Instagram and quick commerce, and scale with community and content.',
    budget_range: '1l_10l',
    industry: 'E-commerce',
    market_saturation: 'competitive',
    difficulty_level: 'intermediate',
    stage: 'competitive',
    revenue_model: ['One-time Sale', 'Subscription (SaaS)'],
    resources_needed: ['Designer', 'Regulatory Approval'],
    tags: ['skincare', 'd2c', 'ecommerce', 'beauty', 'cosmetics', 'instagram', 'shopify'],
    featured: false,
    published_at: new Date('2025-01-03').toISOString(),
    introduction: pts(
      "India's skincare market is a ₹20,000 crore opportunity, and D2C brands like Minimalist, Plum and Mamaearth proved that a small team with a sharp positioning can take on legacy FMCG giants. The window is still open — ingredient transparency, price-to-efficacy ratio and community trust are the new battleground.",
      "You do not need a lab or a factory to start. India has contract manufacturers (CMOs) in Baddi, Daman and Silvassa who can produce your formula in small batches. Your job is brand, positioning, content and distribution.",
    ),
    target_audience: pts(
      "Someone with a genuine interest in skincare, an eye for design and the willingness to learn digital marketing. A background in chemistry, pharmacy or beauty therapy is a bonus but not required. You need to understand your customer's skin concerns deeply enough to formulate a product that genuinely solves them.",
      "Target customers: Urban women (and increasingly men) aged 22–35, ingredient-aware, comfortable buying online, active on Instagram and YouTube skincare content.",
    ),
    why_it_works: pts(
      "Indian consumers are increasingly ingredient-aware — they read labels, watch skincare reels and distrust chemicals. A brand that is honest about formulations, backed by a relatable founder story and priced fairly (₹400–₹800 per product) can build a loyal customer base fast.",
      "The unit economics of skincare are exceptional — gross margins of 60–75% are standard. A customer who trusts your brand buys again every 2–3 months without a CAC (customer acquisition cost).",
    ),
    scope_in_india: pts(
      "Tier-2 and Tier-3 consumers are now buying skincare online — this is the next frontier. Niche sub-markets like men's skincare, Ayurvedic formulations for specific skin types (oily, pigmented, combination) and region-specific skin concerns (humidity-prone South India, dry-skin North India winters) are massively underserved.",
    ),
    things_to_note: [
      'Cosmetics in India require BIS certification and compliance with CDSCO rules — factor in 3–6 months for regulatory approvals.',
      'Do not launch 20 SKUs — start with 2–3 hero products and perfect them.',
      'Customer acquisition cost (CAC) on Meta and Google is rising; invest in organic content early.',
      'Returns and shelf life management can erode margins if not managed tightly.',
    ],
    current_landscape: pts(
      "Minimalist crossed ₹350 crore in revenue in under 4 years. Pilgrim, Foxtale and Dot & Key are all growing fast on the back of content-first, community-driven marketing. The market is competitive but not saturated — niche positioning still wins.",
    ),
    gross_margin: '60–75% gross; 15–30% net after marketing',
    setup_cost_range: '₹3 Lakh–₹8 Lakh (MOQs + packaging + website)',
    pivot_options: 'Add haircare, move into retail, white-label for salons, subscription box',
    financing_options: 'Bootstrapped, angel investors, revenue-based financing (Velocity, Klub)',
    pros: [
      'High gross margins',
      'Strong community and brand moat possible',
      'Multiple channels — D2C, Amazon, Quick Commerce',
      'Growing market with rising consumer awareness',
    ],
    cons: [
      'Regulatory approvals take time and money',
      'High competition from well-funded brands',
      'Rising digital ad costs increase customer acquisition cost',
      'Inventory and shelf-life risk if products don\'t move',
    ],
  },

  {
    _type: 'businessIdea',
    title: 'EdTech: Vernacular Skill-Based Courses',
    slug: { _type: 'slug', current: 'edtech-vernacular-skill-based-courses' },
    description: 'Record and sell skill-based online courses in Hindi or regional languages — serving the 600 million Indians who learn better in their mother tongue. Near-zero marginal cost, massive underserved demand.',
    budget_range: '1l_10l',
    industry: 'EdTech',
    market_saturation: 'validated',
    difficulty_level: 'intermediate',
    stage: 'validated',
    revenue_model: ['One-time Sale', 'Subscription (SaaS)'],
    resources_needed: ['Solo Founder OK', 'Domain Expertise'],
    tags: ['edtech', 'vernacular', 'online-courses', 'skill-development', 'hindi', 'elearning', 'regional-language'],
    featured: true,
    published_at: new Date('2025-01-04').toISOString(),
    introduction: pts(
      "India has 600 million people who are not comfortable learning in English — yet most online courses are in English. A platform or solo creator who teaches valuable skills (stock trading, digital marketing, web development, Tally, graphic design) in Hindi or Tamil or Marathi is sitting on a gold mine.",
      "Courses once recorded earn forever. The creator economy has proved that Indian learners will pay ₹999–₹4,999 for a course from someone they trust — even if that person has no institutional credentials.",
    ),
    target_audience: pts(
      "Anyone with a strong command of a skill — be it stock market trading, digital marketing, web development or graphic design — who can teach it clearly in a regional language. You are not competing with IITs; you are competing with other YouTube channels. Relatability and clarity win.",
      "Target students: 18–30 year olds in Tier-2 and Tier-3 cities who want to upskill, switch careers or start a side income but feel excluded from English-medium platforms.",
    ),
    why_it_works: pts(
      "Courses once recorded earn forever. A ₹1,999 course sold to 500 students is ₹10 lakh in revenue with near-zero marginal cost. YouTube can be used as a free top-of-funnel — 80% of your content free, 20% paid — and converts viewers into buyers with zero advertising spend.",
      "The Skill India and NEP 2020 tailwinds mean government and corporates are actively looking for vernacular skill-training providers.",
    ),
    scope_in_india: pts(
      "The National Education Policy 2020 explicitly endorses vernacular education. Government schemes like Skill India are creating demand for affordable, accessible skill training. Platforms like Graphy, Teachable and Thinkific make it easy to host and sell courses without tech skills.",
      "Hindi alone has 500+ million speakers. Tamil, Telugu, Marathi and Bengali each represent audiences of 50–100 million people.",
    ),
    things_to_note: [
      'Content piracy is rampant in India — use DRM-protected video hosting (like Vimeo OTT or Graphy).',
      'Completion rates for online courses are low globally (~5%) — build accountability into the product (live sessions, community, assignments).',
      'Refund requests spike if the course does not deliver tangible outcomes — make promises you can keep.',
      'Once you stop creating, revenue slowly declines — keep updating courses.',
    ],
    current_landscape: pts(
      "Apna, Josh Talks, and countless independent creators (Neeraj Arora for trading, Ishan Sharma for productivity) have validated the vernacular content model. Unacademy and PhysicsWallah (Alakh Pandey) are the large-scale proof points that Hindi content education can scale to thousands of crores.",
    ),
    gross_margin: '80–90% (digital delivery)',
    setup_cost_range: '₹50,000–₹2 Lakh (recording setup, platform fees, marketing)',
    pivot_options: 'Live cohorts, corporate training, certifications, community subscription',
    financing_options: 'Self-funded; pre-sell the course before building it to validate demand',
    pros: [
      'Near-zero marginal cost per additional student',
      'Massive underserved regional language market',
      'YouTube as free acquisition channel',
      'Strong student loyalty in vernacular niches',
    ],
    cons: [
      'Takes 6–12 months to build an audience first',
      'Piracy and refund abuse are real challenges',
      'Requires consistent content creation to maintain relevance',
      'Revenue can plateau without new course launches',
    ],
  },

  {
    _type: 'businessIdea',
    title: 'AI-Powered Resume & LinkedIn Profile Writing Service',
    slug: { _type: 'slug', current: 'ai-powered-resume-linkedin-profile-writing-service' },
    description: 'Use AI tools to write high-quality resumes and LinkedIn profiles for Indian job seekers — faster, better and cheaper than traditional resume writers. Start as a solo freelancer, then systemise and hire.',
    budget_range: 'under_1l',
    industry: 'AI / ML',
    market_saturation: 'validated',
    difficulty_level: 'beginner',
    stage: 'validated',
    revenue_model: ['Consulting / Services'],
    resources_needed: ['Solo Founder OK'],
    tags: ['ai', 'resume-writing', 'linkedin', 'career-services', 'freelance', 'job-seekers', 'chatgpt'],
    featured: false,
    published_at: new Date('2025-01-05').toISOString(),
    introduction: pts(
      "Every year, tens of millions of Indians apply for jobs — and most of them have terrible resumes. An AI-assisted resume writing service combines human editorial judgment with tools like ChatGPT, Kickresume and Enhancv to produce ATS-optimised, compelling resumes in hours instead of days.",
      "The service can start on Fiverr, LinkedIn or Instagram and scale to a team of writers serving hundreds of clients per month.",
    ),
    target_audience: pts(
      "Anyone with good writing skills, an understanding of how recruitment works and the willingness to learn a few AI tools. You do not need an HR degree. You need to understand what a hiring manager wants to see and communicate that on paper.",
      "Clients: Fresh graduates struggling to get interview calls, mid-career professionals switching industries, NRIs applying to Indian companies, and MBA graduates targeting consulting or banking roles.",
    ),
    why_it_works: pts(
      "The pain is universal and immediate — people need jobs and are anxious about their resume. AI tools like ChatGPT significantly reduce the time to produce a quality output, meaning you can serve 5–10x more clients per day than a traditional writer.",
      "The willingness to pay is strong: ₹1,500–₹5,000 for a resume and LinkedIn profile is a small price when a better document can unlock a ₹10–₹50 lakh/year salary.",
    ),
    scope_in_india: pts(
      "India adds millions of graduates to the job market every year. The services sector (IT, banking, consulting) is highly competitive — candidates who stand out on paper have a genuine edge. The NRI market (Indians in Gulf countries, US, UK applying to Indian companies) is an underserved, high-paying segment.",
    ),
    things_to_note: [
      'Clients have high expectations — underpromise and overdeliver, especially on timelines.',
      'AI-generated text often sounds generic; your value-add must be the human layer of insight.',
      'Reviews and portfolio matter enormously — collect testimonials from day one.',
      'Pricing below ₹500 attracts price-sensitive clients who are difficult to satisfy.',
    ],
    current_landscape: pts(
      "Platforms like Naukri, Indeed and LinkedIn themselves offer basic resume tools, but personalised, high-quality human-assisted resume writing is still largely done by small freelancers. No dominant brand has emerged in India — the market is wide open for someone with a strong portfolio and systematic delivery process.",
    ),
    gross_margin: '75–85%',
    setup_cost_range: '₹10,000–₹30,000 (tool subscriptions, website, social presence)',
    pivot_options: 'Career coaching, interview prep, LinkedIn ghostwriting for executives, corporate HR consulting',
    financing_options: 'Fully self-funded from day one',
    pros: [
      'Extremely low startup cost',
      'AI tools multiply output per hour significantly',
      'Strong referral-driven growth from happy job seekers',
      'Clear, immediate value proposition',
    ],
    cons: [
      'Relatively low ticket size per transaction',
      'Time-intensive without strong systems and processes',
      'Trust needs to be built from scratch',
      'Easy to copy; hard to build a durable moat without a strong brand',
    ],
  },

  {
    _type: 'businessIdea',
    title: 'Solar Panel Installation & Maintenance Business',
    slug: { _type: 'slug', current: 'solar-panel-installation-maintenance-business' },
    description: 'Capitalise on India\'s rooftop solar boom driven by the PM Surya Ghar scheme. Install solar panels for homes, housing societies and SMEs, then build a recurring revenue base through annual maintenance contracts.',
    budget_range: '10l_50l',
    industry: 'Climate / Sustainability',
    market_saturation: 'proven',
    difficulty_level: 'intermediate',
    stage: 'proven',
    revenue_model: ['Consulting / Services', 'One-time Sale'],
    resources_needed: ['Domain Expertise', 'Regulatory Approval', 'Hardware / Manufacturing'],
    tags: ['solar', 'renewable-energy', 'green-business', 'installation', 'sustainability', 'climate', 'amc'],
    featured: true,
    published_at: new Date('2025-01-06').toISOString(),
    introduction: pts(
      "India's government has set a target of 500 GW of renewable energy by 2030, and rooftop solar is a cornerstone of that plan. The PM Surya Ghar scheme provides up to 40% subsidy on rooftop solar for residential customers — and with rising electricity tariffs, the payback period for a homeowner is now 4–6 years.",
      "A solar installation and maintenance business sits at the intersection of government policy, consumer cost savings and environmental necessity. The demand is real, the subsidies are live and the market is far from saturated in most Indian cities.",
    ),
    target_audience: pts(
      "Someone with an interest in electrical systems, project management and sales. You do not need to be an engineer — most installation work is done by certified electricians you hire. What you need is the ability to generate leads, manage projects and maintain customer relationships.",
      "Target customers: Homeowners (₹50L+ property values), housing societies, schools, small factories and SMEs with high electricity bills.",
    ),
    why_it_works: pts(
      "Government subsidies (PM Surya Ghar scheme) cover up to 40% of installation costs for homes — this dramatically lowers the buyer's hesitation. Once installed, panels require annual maintenance contracts (AMC) which are pure recurring revenue at 60–70% margins.",
      "Rising electricity prices mean the financial case for solar improves every year without any selling effort on your part.",
    ),
    scope_in_india: pts(
      "States like Rajasthan, Gujarat, Maharashtra, UP and Karnataka receive the highest solar irradiance and have the most proactive state DISCOM policies. But even in lower-irradiance states, the economics work given subsidies and rising grid tariffs.",
      "The government's target of 1 crore rooftop solar installations under PM Surya Ghar means there is a decade of demand baked into policy.",
    ),
    things_to_note: [
      'MNRE and DISCOM empanelment is required for subsidy-eligible installations — a must-have.',
      'Project cash flows can be lumpy; ensure you collect advance payments before procurement.',
      'Quality of panels varies enormously — a bad installation will haunt you through complaints and repairs.',
      'Competition from large national players (Tata Power Solar, Adani) is increasing in metros — differentiate on local service and speed.',
    ],
    current_landscape: pts(
      "India installed over 15 GW of rooftop solar in 2023, and growth is accelerating under the PM Surya Ghar scheme which aims to cover 1 crore homes. Tata Power Solar, Adani Solar and dozens of regional players are active — but Tier-2 cities and residential colonies remain largely underserved by quality installers.",
    ),
    gross_margin: '20–30% on installation; 60–70% on AMC',
    setup_cost_range: '₹10 Lakh–₹30 Lakh (tools, vehicle, working capital for first projects)',
    pivot_options: 'EV charging installation, energy auditing, agri-solar (solar pumps for farmers)',
    financing_options: 'SIDBI green energy loans, NABARD, equipment financing from panel manufacturers',
    pros: [
      'Massive policy tailwind and government subsidies reduce buyer friction',
      'Recurring revenue from annual maintenance contracts (AMC)',
      'Strong referral dynamics in residential colonies',
      'Growing market with a very long runway',
    ],
    cons: [
      'Working capital intensive — buy panels before receiving full payment',
      'Regulatory empanelment with MNRE and DISCOM required',
      'Technical quality issues can permanently damage reputation',
      'Large national players entering smaller cities and compressing margins',
    ],
  },

  {
    _type: 'businessIdea',
    title: 'SaaS: Restaurant & Cloud Kitchen Management Tool',
    slug: { _type: 'slug', current: 'saas-restaurant-cloud-kitchen-management-tool' },
    description: 'Build a focused SaaS tool for Indian restaurants and cloud kitchens — covering order management, inventory, staff and Swiggy/Zomato integration. Target the massive underserved small-operator segment in Tier-2 and Tier-3 cities.',
    budget_range: '50l_2cr',
    industry: 'SaaS',
    market_saturation: 'competitive',
    difficulty_level: 'advanced',
    stage: 'competitive',
    revenue_model: ['Subscription (SaaS)'],
    resources_needed: ['Technical Co-founder', 'Domain Expertise', 'Large Capital'],
    tags: ['saas', 'restaurant-tech', 'cloud-kitchen', 'food-tech', 'b2b', 'pos', 'inventory-management'],
    featured: false,
    published_at: new Date('2025-01-07').toISOString(),
    introduction: pts(
      "India has over 7.5 million restaurants and an exploding cloud kitchen segment — and most of them manage orders on WhatsApp, track inventory in paper registers and have no idea if they are actually profitable after food and staff costs.",
      "A focused SaaS product for restaurants and cloud kitchens that integrates with Swiggy and Zomato, tracks real-time inventory and gives the owner a P&L view in under 30 seconds addresses a very real, very painful problem.",
    ),
    target_audience: pts(
      "Technical founders (ideally with a backend development background) who have a deep understanding of how restaurants actually operate — ideally from working in one or consulting for one. The sales motion requires getting into kitchens and understanding the owner's daily workflow.",
      "Target customers: Cloud kitchens (5–20 outlets), QSR chains, standalone restaurants in Tier-1 and Tier-2 cities with monthly revenue of ₹3–₹30 lakh.",
    ),
    why_it_works: pts(
      "Restaurant owners are not tech-savvy but they feel their pain acutely — missed orders, food wastage and staff theft are three daily anxieties that a good software product solves. The willingness to pay ₹2,000–₹5,000/month is very high if the product demonstrably reduces waste and missed orders.",
      "Once a restaurant is onboarded and the team trained, switching costs are very high. A well-designed product gets sticky within 30 days.",
    ),
    scope_in_india: pts(
      "The cloud kitchen segment is growing at 12% CAGR. Zomato and Swiggy's own data show that 60% of restaurant owners on their platform are small operators running 1–3 outlets. Tier-2 cities are underserved — the existing players focus on metros.",
    ),
    things_to_note: [
      'Restaurant owners have low patience for onboarding friction — the product must work in the first session.',
      'Churn is high if the software breaks during peak hours (lunch and dinner) — reliability is non-negotiable.',
      'API integrations with Swiggy and Zomato require approval and have strict uptime requirements.',
      'Sales cycles are short but support requirements are high — plan for a strong WhatsApp support channel.',
    ],
    current_landscape: pts(
      "Petpooja (Ahmedabad), UrbanPiper and Posist are established players, but none have fully cracked the small operator segment in Tier-2 and Tier-3 cities. The market is large enough for multiple winners, especially those who combine great UX with Hindi/regional language support.",
    ),
    gross_margin: '70–80% (SaaS gross margins)',
    setup_cost_range: '₹40 Lakh–₹1.5 Crore (product development + first sales team)',
    pivot_options: 'Payments (collect from customers directly), supply chain ordering, insurance for restaurant equipment',
    financing_options: 'Angel investment, seed funds, SaaS-focused VCs (Blume, Lightspeed India)',
    pros: [
      'Large fragmented market ripe for a focused solution',
      'High gross margins typical of SaaS businesses',
      'Sticky product — restaurants don\'t switch software easily',
      'Multiple upsell opportunities (payments, supply chain, insurance)',
    ],
    cons: [
      'High development cost and long build time before first rupee',
      'Complex integrations with food delivery platforms required',
      'High support load from non-technical users',
      'Well-funded competition already entrenched in metro markets',
    ],
  },

  {
    _type: 'businessIdea',
    title: 'Mental Health & Wellness Platform (B2B + B2C)',
    slug: { _type: 'slug', current: 'mental-health-wellness-platform-b2b-b2c' },
    description: 'Build a platform connecting users with licensed therapists, combining B2B corporate EAP contracts for predictable revenue with B2C subscriptions for brand scale — addressing India\'s acute mental health professional shortage.',
    budget_range: '50l_2cr',
    industry: 'Health & Wellness',
    market_saturation: 'validated',
    difficulty_level: 'advanced',
    stage: 'validated',
    revenue_model: ['Subscription (SaaS)', 'Consulting / Services'],
    resources_needed: ['Technical Co-founder', 'Domain Expertise', 'Regulatory Approval', 'Large Capital'],
    tags: ['mental-health', 'wellness', 'b2b', 'eap', 'healthtech', 'therapy', 'corporate-wellness'],
    featured: false,
    published_at: new Date('2025-01-08').toISOString(),
    introduction: pts(
      "India has approximately 1 psychologist for every 100,000 people — one of the worst mental health professional ratios in the world. Post-COVID, awareness has exploded and stigma has reduced, particularly among urban millennials. The supply-demand gap is enormous.",
      "A platform that connects users with licensed therapists via video/chat, while also selling corporate Employee Assistance Programs (EAP) to companies, sits at a powerful intersection of consumer need and enterprise willingness to pay.",
    ),
    target_audience: pts(
      "Founders with a background in psychology, healthcare or consumer apps, ideally with a genuine personal or professional connection to the mental health space. This is not a market for purely transactional thinking — user trust is everything.",
      "Target customers (B2C): Urban professionals aged 22–40 dealing with anxiety, work stress, relationship issues. Target customers (B2B): IT companies, BPOs, large enterprises with 500+ employees wanting mental health benefits.",
    ),
    why_it_works: pts(
      "B2B (corporate EAP — Employee Assistance Programs) provides predictable revenue while B2C builds the brand. Companies increasingly see mental health benefits as an employee retention tool — IT companies are especially motivated by high attrition and burnout data.",
      "The EAP contract model means you get paid per employee per month regardless of usage — a true subscription business.",
    ),
    scope_in_india: pts(
      "WHO estimates that depression and anxiety cost India $1.03 trillion in lost productivity per year. The EAP market in India is nascent — most companies don't have one — but Infosys, Wipro and Tata are all now offering mental health benefits, creating a reference point for smaller companies to follow.",
    ),
    things_to_note: [
      'Therapist quality control is existential — one bad experience can generate catastrophic press coverage.',
      'Data privacy (DPDP Act) compliance is non-negotiable in mental health — users share deeply sensitive information.',
      'Regulatory grey areas exist — ensure all therapists on the platform are RCI-registered.',
      'Retention of both therapists and users requires careful product design and incentive structures.',
    ],
    current_landscape: pts(
      "YourDOST, iCall and Wysa have validated the market. InnerHour was acquired by Aditya Birla Health Insurance. The B2B EAP segment is the fastest-growing channel — Optum, Mfine and 1to1help.net are the primary competitors. There is room for regional language platforms and platforms focused on specific demographics (students, women, senior executives).",
    ),
    gross_margin: '50–65% (after therapist fees)',
    setup_cost_range: '₹60 Lakh–₹2 Crore (platform + therapist onboarding + compliance)',
    pivot_options: 'Corporate wellness programs, insurance tie-ups, vernacular self-help content subscriptions',
    financing_options: 'Impact investors, healthcare VCs, NABH-aligned grant programs',
    pros: [
      'Enormous underserved need with strong post-COVID tailwinds',
      'B2B EAP contracts provide highly predictable recurring revenue',
      'Strong mission-driven brand potential that attracts talent and press',
      'Post-COVID awareness driving organic demand without heavy advertising',
    ],
    cons: [
      'High regulatory and ethical responsibility — not a space for shortcuts',
      'Difficult to ensure consistent therapist quality at scale',
      'Long B2B sales cycles for corporate EAP clients',
      'Significant upfront investment in platform development and compliance',
    ],
  },

  {
    _type: 'businessIdea',
    title: 'FinTech: Embedded Credit for Kirana & Small Retailers',
    slug: { _type: 'slug', current: 'fintech-embedded-credit-kirana-small-retailers' },
    description: 'Solve India\'s ₹25 lakh crore MSME credit gap by embedding working capital loans into the daily workflow of kirana stores and small retailers — using alternative data (UPI transactions, GST, inventory) for underwriting.',
    budget_range: '2cr_plus',
    industry: 'FinTech',
    market_saturation: 'competitive',
    difficulty_level: 'expert',
    stage: 'competitive',
    revenue_model: ['Subscription (SaaS)', 'Marketplace %'],
    resources_needed: ['Technical Co-founder', 'Domain Expertise', 'Regulatory Approval', 'Large Capital'],
    tags: ['fintech', 'lending', 'kirana', 'msme', 'embedded-finance', 'credit', 'nbfc', 'account-aggregator'],
    featured: false,
    published_at: new Date('2025-01-09').toISOString(),
    introduction: pts(
      "India has 12 million kirana stores, and most of them are perpetually short on working capital. Banks don't lend to them because they have no formal credit history. A FinTech that uses alternative data — UPI transaction history, GST returns, inventory velocity — to underwrite these loans and embed credit directly into the merchant's daily workflow is solving a multi-trillion rupee problem.",
    ),
    target_audience: pts(
      "Founders with deep FinTech, banking or credit underwriting experience — ideally someone who has worked at an NBFC, bank or payments company. An RBI-regulated lending business requires serious compliance infrastructure and cannot be run by domain outsiders.",
      "Target customers: Kirana store owners with monthly turnover of ₹1–₹20 lakh, small retailers, pharmacies and grocery distributors who need 15–45 day working capital loans.",
    ),
    why_it_works: pts(
      "Small business credit in India is a ₹25 lakh crore gap. Whoever solves the underwriting problem — reliably extending credit to those with thin or no credit files — wins an enormous market. Alternative data sources (UPI, GST, account aggregator) have finally made this tractable.",
      "The embedded model means the loan is offered in the context of a purchase or payment flow — conversion rates are 5–10x higher than traditional loan application flows.",
    ),
    scope_in_india: pts(
      "RBI's account aggregator framework is a game-changer — it allows customers to share their financial data with lenders with consent in seconds. States like UP, Bihar, Rajasthan and MP have huge concentrations of small retailers with almost no access to formal credit.",
    ),
    things_to_note: [
      'You cannot lend money without an NBFC licence or a partnership with a licenced NBFC — this is a hard regulatory requirement.',
      'Credit risk management is existential — one bad vintage of loans can wipe out the business.',
      'Collection is the unsexy but critical function — build it into your model from day one.',
      'This market attracts well-funded competition; your moat must be in proprietary data or distribution.',
    ],
    current_landscape: pts(
      "BharatPe (lending via PostPe), Klub, Progcap and Rupifi are active in this space. Several are backed by marquee VCs and banks. The key differentiation is the quality of underwriting — who can lend at lower NPA rates while serving thin-file borrowers. The RBI account aggregator framework is the new battleground.",
    ),
    gross_margin: 'Net Interest Margin: 8–14%',
    setup_cost_range: '₹2 Crore+ (NBFC capital requirements + tech + compliance)',
    pivot_options: 'Insurance distribution, payments acquiring, SaaS for inventory management, B2B supply chain financing',
    financing_options: 'Venture capital, debt capital markets, co-lending arrangements with banks (PSL mandate)',
    pros: [
      'Enormous credit gap in Indian MSME sector — ₹25 lakh crore addressable market',
      'Account Aggregator framework enables new, faster underwriting approaches',
      'High revenue potential at scale with strong unit economics',
      'Government push for financial inclusion (PSL norms) creates regulatory tailwind',
    ],
    cons: [
      'Regulatory complexity — NBFC licence or partnership is mandatory and costly',
      'Very high capital requirements before first loan can be disbursed',
      'Credit risk can be catastrophic if underwriting is poorly designed',
      'Intense competition from well-funded and experienced players',
    ],
  },

  {
    _type: 'businessIdea',
    title: 'Sustainable / Reusable Packaging for E-commerce & FMCG',
    slug: { _type: 'slug', current: 'sustainable-reusable-packaging-ecommerce-fmcg' },
    description: 'Supply compostable, reusable or recycled packaging to D2C brands, FMCG companies and quick commerce platforms under pressure from India\'s plastic ban and EPR regulations — a B2B play with recurring purchase orders.',
    budget_range: '10l_50l',
    industry: 'Climate / Sustainability',
    market_saturation: 'concept',
    difficulty_level: 'intermediate',
    stage: 'concept',
    revenue_model: ['One-time Sale', 'Consulting / Services'],
    resources_needed: ['Domain Expertise', 'Hardware / Manufacturing', 'Regulatory Approval'],
    tags: ['sustainability', 'packaging', 'eco-friendly', 'epr', 'fmcg', 'climate', 'b2b', 'circular-economy'],
    featured: false,
    published_at: new Date('2025-01-10').toISOString(),
    introduction: pts(
      "India generates over 3.5 million tonnes of plastic waste per year, and e-commerce packaging is a growing contributor. A business that manufactures or distributes sustainable packaging alternatives — compostable mailers, recycled paper boxes, reusable tiffin-style containers — is riding a regulatory and consumer wave that will only grow stronger.",
      "You do not have to build a factory from scratch. India has packaging manufacturers in Silvassa, Daman and Vapi who can white-label sustainable packaging at competitive MOQs.",
    ),
    target_audience: pts(
      "Entrepreneurs with a background in manufacturing, supply chain or sustainability consulting. You do not need to build the manufacturing yourself — India has packaging manufacturers ready to private-label. What you need is sales access to FMCG procurement teams and D2C brand founders.",
      "Target customers: D2C beauty, food and fashion brands; quick commerce dark stores; FMCG companies with EPR compliance obligations; exporters who need FSC-certified packaging.",
    ),
    why_it_works: pts(
      "India's Single Use Plastics ban (2022) and Extended Producer Responsibility (EPR) regulations are forcing FMCG companies to find alternatives urgently. D2C brands in beauty, food and fashion are increasingly using sustainable packaging as a brand signal — customers notice and reward it.",
      "The regulatory driver means this is not a purely voluntary market — large companies must comply or face fines. That creates a structural demand floor.",
    ),
    scope_in_india: pts(
      "Quick Commerce companies (Blinkit, Zepto, Swiggy Instamart) are under pressure to reduce plastic waste. FMCG giants like HUL, ITC and Marico have published EPR commitments that create real procurement demand for compliant packaging. The organised sustainable packaging market in India is still nascent — early movers build the supply relationships that later entrants will struggle to replicate.",
    ),
    things_to_note: [
      '"Greenwashing" risk — compostable packaging often requires industrial composting; be honest about real-world disposal limitations.',
      'Price premium over conventional plastic is 30–60% — FMCG buyers are price-sensitive; sustainability alone won\'t close deals.',
      'BIS certifications and food-contact safety approvals are required for packaging that touches food products.',
      'Manufacturing quality control across batches is critical — one bad batch can lose a key account.',
    ],
    current_landscape: pts(
      "Ecoware, Pakka Ltd and HUL's own sustainability initiatives are shaping the market. The organised sustainable packaging market in India is still nascent — early movers have the opportunity to lock in long-term supply contracts with large buyers before the market commoditises.",
    ),
    gross_margin: '35–50%',
    setup_cost_range: '₹15 Lakh–₹40 Lakh (MOQ with manufacturers + warehouse + sales team)',
    pivot_options: 'Brand design services for sustainable brands, reverse logistics (collect and compost), EPR compliance consulting',
    financing_options: 'Impact investors, green bonds, SIDBI sustainable finance schemes',
    pros: [
      'Strong regulatory tailwind from plastic bans and EPR compliance requirements',
      'ESG pressure making large FMCG companies motivated and urgent buyers',
      'Recurring B2B purchase orders once a supplier relationship is established',
      'Strong brand story for exports and PR with international buyers',
    ],
    cons: [
      'Higher price than conventional plastic — hard sell to cost-focused procurement teams',
      'Manufacturing quality and consistency challenges across batches',
      'Greenwashing scrutiny from consumers and regulators is increasing',
      'Long B2B sales cycles with large corporate buyers (3–9 months to first PO)',
    ],
  },

  {
    _type: 'businessIdea',
    title: 'Hyperlocal Senior Care & Companionship Services',
    slug: { _type: 'slug', current: 'hyperlocal-senior-care-companionship-services' },
    description: 'Provide trained caregivers and companionship services to elderly Indians living alone, paid for by their children in other cities. Monthly subscriptions, daily check-ins and emergency support — addressing a silent crisis.',
    budget_range: '1l_10l',
    industry: 'Health & Wellness',
    market_saturation: 'concept',
    difficulty_level: 'beginner',
    stage: 'concept',
    revenue_model: ['Subscription (SaaS)', 'Consulting / Services'],
    resources_needed: ['Solo Founder OK', 'Domain Expertise'],
    tags: ['senior-care', 'elder-care', 'hyperlocal', 'companionship', 'healthcare', 'ageing', 'nri'],
    featured: false,
    published_at: new Date('2025-01-11').toISOString(),
    introduction: pts(
      "India's nuclear family explosion has created a silent crisis — millions of elderly parents living alone while their children work in different cities or abroad. A hyperlocal service that provides trained caregivers, companionship visits, emergency support and daily WhatsApp check-in reports to families fills a deep emotional and practical gap.",
      "The paying customer is the adult child — often an NRI or professional in another city — who will pay ₹5,000–₹20,000/month for the peace of mind that their parent is safe, engaged and cared for.",
    ),
    target_audience: pts(
      "Empathetic founders who genuinely care about elder welfare and understand the anxieties of both the senior and their family. Experience in healthcare, social work or hospitality is a strong foundation. The ability to build and retain a team of reliable, background-verified caregivers is the core operational challenge.",
      "Target clients (paying): NRI children, dual-income urban couples in different cities from their parents. Target seniors: 65–85 year olds in metros and Tier-1 cities living independently or semi-independently.",
    ),
    why_it_works: pts(
      "The paying customer (the adult child) is often not in the same city as the senior, and is willing to pay ₹5,000–₹20,000 per month for reliable, documented care. WhatsApp check-in reports, video call facilitation and emergency escalation protocols are simple but immensely reassuring.",
      "Subscription model with monthly billing and very low churn once trust is established — a family that trusts you with their parent does not switch providers.",
    ),
    scope_in_india: pts(
      "India will have 300 million senior citizens by 2050. Currently, only 3% of elderly Indians have access to any form of organised support services. Metro cities — Mumbai, Delhi, Bengaluru, Chennai — have the highest concentration of seniors living alone with children elsewhere.",
    ),
    things_to_note: [
      'Background verification of all caregivers is non-negotiable — you are sending staff into someone\'s home.',
      'One serious incident (theft, neglect, medical emergency mishandled) can destroy your reputation permanently.',
      'Caregiver attrition is high in this industry — build strong retention incentives.',
      'Medical scope creep — be clear about what your service does and does not do; you are not a home nursing agency.',
    ],
    current_landscape: pts(
      "Emoha, Anvayaa and iGeriCare are organised players who have raised funding. Most cities, however, are served only by informal, unvetted local agencies. The trust gap between informal operators and what families actually want is enormous — and that gap is your market.",
    ),
    gross_margin: '40–55% (after caregiver costs)',
    setup_cost_range: '₹2 Lakh–₹8 Lakh (hiring + training + tech + operations)',
    pivot_options: 'Assisted living communities, corporate employee-parent benefit programs, health insurance partnerships',
    financing_options: 'Self-funded, angel investors, CSR funding from corporates',
    pros: [
      'Deep emotional need with motivated paying customers — especially NRI children',
      'Subscription model with very low churn once trust is established',
      'Massively underserved market in most Indian cities outside metros',
      'Strong referral dynamics within housing societies and apartment complexes',
    ],
    cons: [
      'High trust bar — any lapse in caregiver quality is catastrophic for reputation',
      'Operationally intensive and hard to scale without very strong processes',
      'Caregiver attrition is an ongoing structural challenge in this industry',
      'Scope creep into medical territory creates significant liability',
    ],
  },

  {
    _type: 'businessIdea',
    title: 'AI-Powered Social Media Content Agency',
    slug: { _type: 'slug', current: 'ai-powered-social-media-content-agency' },
    description: 'Run a social media agency for Indian SMEs using AI tools to produce content 5x faster. Niche down by industry (doctors, CAs, real estate agents), charge monthly retainers and build a scalable, systemised content production machine.',
    budget_range: 'under_1l',
    industry: 'AI / ML',
    market_saturation: 'competitive',
    difficulty_level: 'beginner',
    stage: 'competitive',
    revenue_model: ['Consulting / Services', 'Subscription (SaaS)'],
    resources_needed: ['Solo Founder OK'],
    tags: ['ai', 'social-media', 'content-agency', 'marketing', 'instagram', 'linkedin', 'smm', 'chatgpt'],
    featured: true,
    published_at: new Date('2025-01-12').toISOString(),
    introduction: pts(
      "Every small business in India now knows they need to be on Instagram and LinkedIn — and almost none of them have the time or skills to do it consistently. An agency that uses AI tools (ChatGPT, Canva, Midjourney) to produce high-quality, on-brand content at scale can serve 10–20 clients per month with a team of 2–3 people.",
      "The key insight: niche down. An agency that specialises in 'social media for dermatologists in Bengaluru' can charge 3x more than a generalist and gets referrals on autopilot.",
    ),
    target_audience: pts(
      "Someone with decent writing skills, a good eye for design and the curiosity to learn AI tools quickly. You do not need a marketing degree. What you need is the ability to understand a client's voice, translate their business into engaging content and deliver consistently month after month.",
      "Target clients: Doctors, dentists and healthcare professionals; CAs and lawyers; real estate agents and developers; D2C brands in fashion and beauty; local restaurants and cafes.",
    ),
    why_it_works: pts(
      "AI has collapsed the time required to produce good social content — what took a human 8 hours now takes 2 with the right tools. This means you can serve more clients at the same quality level. Small businesses pay ₹8,000–₹25,000/month for consistent social media management — a retainer model with very low marginal cost.",
      "Niching down by industry means you build a content template library and industry knowledge that makes each new client faster and cheaper to onboard.",
    ),
    scope_in_india: pts(
      "India has over 63 million MSMEs and a growing number are investing in digital presence post-COVID. Niching down by industry (real estate agents, doctors, CA firms, D2C fashion brands) allows you to build industry-specific playbooks that compound over time. Cities like Bengaluru, Hyderabad, Mumbai and Pune have thousands of potential clients within driving distance.",
    ),
    things_to_note: [
      'Client communication and revisions can eat all your time — set clear revision limits in contracts.',
      'AI content without a human editorial layer often sounds generic; your differentiator is voice and strategy.',
      'Social media algorithms change constantly — results are never guaranteed and managing client expectations is an art.',
      'Churn happens when clients don\'t see ROI — link content to business outcomes from day one.',
    ],
    current_landscape: pts(
      "The social media agency market is fragmented and saturated at the low end. The winners are those who niche down (e.g. 'social media for dermatologists in Bengaluru') and combine strategy with execution. No major player dominates the Indian SME segment — the market is won city-by-city and niche-by-niche.",
    ),
    gross_margin: '70–85%',
    setup_cost_range: '₹20,000–₹60,000 (tool subscriptions, laptop, portfolio website)',
    pivot_options: 'Paid ads management, influencer marketing campaigns, personal branding coaching, white-label for larger agencies',
    financing_options: 'Fully self-funded; start with 2–3 clients before investing in tools',
    pros: [
      'Extremely low startup cost — under ₹1 lakh to start',
      'Recurring monthly retainer income with low churn from happy clients',
      'AI tools enable very high output per person',
      'Easy to niche down and command significant premium pricing',
    ],
    cons: [
      'Highly competitive at the low (generalist) end of the market',
      'Client churn when results aren\'t immediately visible',
      'Time-intensive without strong systems, templates and processes',
      'Algorithm changes can undermine promised results and damage client relationships',
    ],
  },
]

async function seed() {
  console.log(`Seeding ${ideas.length} business ideas to Sanity project ${env.NEXT_PUBLIC_SANITY_PROJECT_ID}...`)

  // Check for existing ideas to avoid duplicates
  const existing = await client.fetch('*[_type == "businessIdea"].slug.current')
  console.log(`Found ${existing.length} existing ideas`)

  let created = 0
  let skipped = 0

  for (const idea of ideas) {
    const slug = idea.slug.current
    if (existing.includes(slug)) {
      console.log(`  SKIP  ${idea.title}`)
      skipped++
      continue
    }
    await client.create(idea)
    console.log(`  ✓  ${idea.title}`)
    created++
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped.`)
}

seed().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
