import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const cliConfig = JSON.parse(readFileSync(join(process.env.HOME, '.config/sanity/config.json'), 'utf8'))
const client = createClient({ projectId: '5p3rso81', dataset: 'production', apiVersion: '2024-01-01', token: cliConfig.authToken, useCdn: false })

let k = 0
const key = (slug) => `pp_${slug}_${k++}`

const data = [
  // ── Batch 1: 6 ideas ─────────────────────────────────────────────────────
  {
    slug: 'home-tiffin-meal-subscription-service',
    proof_points: [
      { _key: key('tiffin'), type: 'Case Study', source: 'YourStory / HerStory', url: 'https://yourstory.com/herstory/2020/05/woman-entrepreneur-food-business-gharachi-aathvan', headline: "This woman entrepreneur's food business clocks Rs 25 lakh in eight months", founder: 'Lalita Patil, Thane (Maharashtra)', key_stat: 'Started home tiffin service in 2016; restaurant earned ₹3–3.5 lakh/month; ₹25 lakh in first 8 months', quote: 'Running her business from home did not get her the same respect accorded to other working women' },
      { _key: key('tiffin'), type: 'Case Study', source: 'YourStory', url: 'https://yourstory.com/2021/05/startups-fight-covid-19-lokal-kitchen-mumbai-home-cooked-food', headline: 'This Mumbai startup connects people to home chefs with a meal subscription model', founder: 'Rohit Gawli & Rohit Mhatre, Mumbai', key_stat: 'Launched Jan 2021; 100+ home chefs; 30% week-over-week growth; avg order ₹250', quote: 'A subscription service where people can subscribe to 10, 15, or 30 meals a month from a wide variety of home chefs' },
      { _key: key('tiffin'), type: 'Market Data', source: 'IBEF', url: 'https://www.ibef.org/news/indian-food-services-sector-to-grow-by-8-1-from-2024-to-2028-report', headline: "India's food services market valued at US$ 80 billion in 2024, growing at 8.1% CAGR through 2028", key_stat: '6.6 crore urban users already on food delivery platforms — massive base for meal subscriptions' },
    ],
  },
  {
    slug: 'youtube-automation-faceless-content-channel',
    proof_points: [
      { _key: key('yt'), type: 'Market Data', source: 'Oxford Economics / YouTube India', url: 'https://www.business-standard.com/economy/news/youtube-creative-ecosystem-gdp-contribution-india-2024-125111701475_1.html', headline: "YouTube's creative ecosystem contributed over ₹16,000 crore to India's GDP in 2024", key_stat: '65,000+ Indian channels earned over ₹1 lakh in 2024; 63% of monetising creators say YouTube is their primary income source; ₹21,000 crore paid to Indian creators over 3 years' },
    ],
  },
  {
    slug: 'hyperlocal-d2c-skincare-brand',
    proof_points: [
      { _key: key('skin'), type: 'Case Study', source: 'Inc42', url: 'https://inc42.com/startups/how-conscious-chemist-grew-to-%E2%82%B931-cr-by-normalising-clinically-backed-actives/', headline: 'How Conscious Chemist Grew To ₹31 Cr By Normalising Clinically-Backed Actives', founder: 'Robin Gupta & Prakher Mathur, Gurugram', key_stat: 'Founded 2019; ₹32 Cr revenue FY25; 1 Mn+ customers; 75% gross margins; raised ₹17 Cr total', quote: '3X revenue growth in 12 months, a strong retention rate three times the industry average' },
      { _key: key('skin'), type: 'Case Study', source: 'YourStory', url: 'https://yourstory.com/2021/07/startup-bharat-d2c-beauty-startup-juicy-chemistry', headline: 'Launched in a kitchen with Rs 5k, Juicy Chemistry is now a Rs 25 Cr brand', founder: 'Megha & Pritesh Asher, Coimbatore', key_stat: 'Started with ₹5,000 in kitchen in 2014; ₹17 lakh year one; ₹6.5 Cr by 2019; ₹25 Cr+ by FY21; raised $6.3 Mn Series A', quote: 'Up until 2022, almost 80% of revenue was generated via online and D2C channels' },
      { _key: key('skin'), type: 'Market Data', source: 'IBEF', url: 'https://www.ibef.org/news/india-you-e-beauty-the-blush-and-glow-of-the-new-billion-dollar-boom', headline: "India's beauty & personal care market valued at US$ 28 billion, reaching US$ 34 billion by 2028", key_stat: 'Beauty e-commerce sales rose 39% in value between June–Nov 2024 vs prior year, vs only 3% growth in physical stores' },
    ],
  },
  {
    slug: 'edtech-vernacular-skill-based-courses',
    proof_points: [
      { _key: key('edtech'), type: 'Case Study', source: 'YourStory', url: 'https://yourstory.com/2022/09/kochi-online-learning-startup-empowering-aspirants-vernacular-language', headline: 'This online learning startup is empowering job aspirants by offering courses in vernacular languages', founder: 'Mohammed Hisamuddin & Rahul Ramesh, Kochi', key_stat: 'Founded 2017 with ₹25 lakh seed; ARR hit $2 Mn by 2020 (150% growth); 1 Cr+ registered users, 4 lakh paying; raised $10 Mn total', quote: 'Entri.app claims to have had 10x FY revenue growth over the last two years' },
      { _key: key('edtech'), type: 'Case Study', source: 'YourStory', url: 'https://yourstory.com/2022/03/mangaluru-edtech-startup-bharat-microdegree-engineering-it-skills-local-languages', headline: 'How this Mangaluru edtech startup imparts engineering and IT skills in local languages', founder: 'Gaurav Kamath, Rakesh Kothari & Manikanta Nair, Mangaluru', key_stat: 'Founded 2020; ₹1 Cr revenue FY21; targeting ₹15 Cr FY22; 50% month-on-month growth; 10,000+ learners', quote: 'The startup aims to make emerging tech affordable for students irrespective of their educational backgrounds and languages' },
      { _key: key('edtech'), type: 'Market Data', source: 'IBEF', url: 'https://www.ibef.org/news/india-s-edtech-market-likely-to-reach-rs-2-50-850-crore-us-29-billion-by-2030-report', headline: "India's edtech market projected to reach US$ 29 billion by 2030", key_stat: '488 million rural internet users underserved by English-medium platforms — the primary market for vernacular courses' },
    ],
  },
  {
    slug: 'ai-powered-resume-linkedin-profile-writing-service',
    proof_points: [
      { _key: key('resume'), type: 'Market Data', source: 'NASSCOM', url: 'https://nasscom.in/knowledge-center/publications/technology-sector-india-strategic-review-2024', headline: "India's IT-BPM sector employs 5.43 Mn professionals; demand for digital talent is 20x available supply", key_stat: 'Gen AI developer job listings grew 50%+ between 2022–2024; India faces 1.5–2.5 Mn job transition by 2031 — making resume and career positioning services high-urgency' },
    ],
  },
  {
    slug: 'saas-restaurant-cloud-kitchen-management-tool',
    proof_points: [
      { _key: key('saas'), type: 'Case Study', source: 'YourStory', url: 'https://yourstory.com/2019/12/bengaluru-based-saas-startup-eagleowl-restaurant-management', headline: 'This SaaS startup uses the cloud to make restaurant management a piece of cake', founder: 'Vinodh Rajaraman, Bengaluru', key_stat: 'Ex-Cisco engineer; bootstrapped; 20+ customers in first year including Smoor & Meghana Foods; 70% medium-to-large chains', quote: 'EagleOwl aims to help restaurants lower costs, streamline processes, and increase profitability' },
      { _key: key('saas'), type: 'Case Study', source: 'Inc42', url: 'https://inc42.com/buzz/posist-bets-on-less-touch-dining-with-new-tech-for-restaurants/', headline: 'POSist (now Restroworks) grew from bootstrap to 25,000+ restaurants across 20 countries', founder: 'Ashish Tulsian & Sakshi Tulsian, Delhi', key_stat: 'Founded 2012; 8,000 customers by 2021; 25,000+ restaurants; $18 Mn annual revenue by mid-2024', quote: 'Ashish realised the troubles of managing a restaurant hungered for an IT solution' },
      { _key: key('saas'), type: 'Market Data', source: 'IBEF', url: 'https://www.ibef.org/blogs/cloud-kitchens-in-india', headline: "India's cloud kitchen market projected to reach USD 2.84 billion by 2030 at 16.6% CAGR", key_stat: 'Only 25,000–50,000 restaurants digitised out of 7.5 million food service outlets — SaaS penetration is deeply underpenetrated' },
    ],
  },
  // ── Batch 2: 7 ideas ─────────────────────────────────────────────────────
  {
    slug: 'solar-panel-installation-maintenance-business',
    proof_points: [
      { _key: key('solar'), type: 'Case Study', source: 'YourStory HerStory', url: 'https://yourstory.com/herstory/2024/07/shreya-mishra-has-powered-15000-indian-homes-with-solar-energy', headline: 'Harnessing the sun: Shreya Mishra has powered 15,000 Indian homes with solar energy', founder: 'Shreya Mishra, Neeraj Jain, Nikhil Nahar — SolarSquare, Mumbai', key_stat: 'Crossed ₹300 crore revenue from residential solar within ~3 years; 20,000+ home installations across 16 cities; raised $40M Series B (Lightspeed, Dec 2024)', quote: 'We wanted to create the safest solar solutions for homes and introduced cyclone-proof installations with performance guarantees.' },
      { _key: key('solar'), type: 'Case Study', source: 'The Better India', url: 'https://thebetterindia.com/344429/solar-square-rooftop-panel-installation-iit-bombay-grads-neeraj-jain-shreya-mishra-nikhil-nahar/', headline: 'Startup by IIT Grads Helps Indian Homes Run on Zero Electricity, Earns Rs 200 Crore in Revenues', founder: 'Neeraj Jain, Shreya Mishra, Nikhil Nahar — IIT Bombay alumni', key_stat: 'Bootstrapped and profitable at ₹100 crore B2B before pivoting to residential; crossed ₹200 Cr then ₹300 Cr revenue; raised $4M seed (2022)', quote: 'Families weren\'t aware of the benefits of solar and there were a lot of myths that needed to be addressed.' },
      { _key: key('solar'), type: 'Market Data', source: 'IBEF — Renewable Energy', url: 'https://www.ibef.org/industry/renewable-energy', headline: 'India added 24 GW of solar in 2024 — world\'s third-largest solar market', key_stat: 'Cumulative grid-connected rooftop solar reached 11.8 GW in FY24, a 33.86% jump year-on-year (MNRE data via IBEF)' },
    ],
  },
  {
    slug: 'mental-health-wellness-platform-b2b-b2c',
    proof_points: [
      { _key: key('mh'), type: 'Case Study', source: 'Inc42', url: 'https://inc42.com/startups/how-lissuns-founder-turned-his-personal-crisis-into-the-startups-mission-statement/', headline: "How LISSUN's Founder Turned His Personal Crisis Into The Startup's Mission Statement", founder: 'Dr. Krishna Veer Singh & Tarun Gupta (ex-Uber executives) — LISSUN, Gurugram', key_stat: 'Founded 2021; raised $5.46M across 6 rounds; ₹10 crore revenue FY25; embedded in IVF clinics, maternity hospitals, and Kota coaching centres', quote: 'Singh sought therapy and found it difficult due to the fear of judgment and stigma — that became LISSUN\'s mission.' },
      { _key: key('mh'), type: 'Government Source', source: 'PIB — Economic Survey 2024', url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2034931', headline: 'Economic Survey 2024 addressed mental health at the economic level for the first time', key_stat: '10.6% of Indian adults suffer from mental disorders (NIMHANS); India\'s mental health market projected to reach USD 27–62 billion by 2032 at 28%+ CAGR' },
    ],
  },
  {
    slug: 'sustainable-reusable-packaging-ecommerce-fmcg',
    proof_points: [
      { _key: key('pkg'), type: 'Case Study', source: 'The Weekend Leader', url: 'https://www.theweekendleader.com/Success/3330/packed-for-a-green-planet.html', headline: 'How Pepcom India became a Rs 2.5 Crore eco packaging brand (Kolkata)', founder: 'Sagnik Mukherjee & Sanjoy Banerjee (ex-Mahindra, ex-Hero MotoCorp) — Pepcom India, Kolkata', key_stat: 'Founded 2022 with personal savings; FY25 ₹2.5 Cr revenue (₹15L/month); 3.5M biodegradable containers/month; replaced ~300 tonnes of plastic; 100+ clients in 15 cities', quote: 'What can replace plastic? Paper could be a cost-effective and eco-friendly option.' },
      { _key: key('pkg'), type: 'Case Study', source: 'The Better India', url: 'https://thebetterindia.com/360462/eco-friendly-biodegradable-bags-plastic-bag-replacement-bioreform-startup-hyderabad/', headline: 'Startup Uses Corn Waste to Make Bags That Decompose in 180 Days; Replaced 6 Million Plastic Bags', founder: 'Mohammed Azhar Mohiuddin — BioReform, Hyderabad (IIIT-H incubated)', key_stat: 'Started at 21; replaced 15M+ single-use plastic items; ₹1.3 Cr revenue FY24; expanded to 8 cities; won UN recognition', quote: 'A turning point arrived during COVID — focus shifted from chasing money to creating impact.' },
      { _key: key('pkg'), type: 'Market Data', source: 'IBEF — Bio-Packaging', url: 'https://www.ibef.org/blogs/india-s-bio-packaging-industry-scaling-sustainable-alternatives-to-plastic', headline: "India's bioplastics market valued at ₹4,069 crore (US$ 457M) in FY25", key_stat: "India's overall packaging industry is world's 3rd largest at US$ 86 billion (2024); projected to reach US$ 92 billion by FY30" },
    ],
  },
  {
    slug: 'hyperlocal-senior-care-companionship-services',
    proof_points: [
      { _key: key('senior'), type: 'Case Study', source: 'YourStory', url: 'https://yourstory.com/2021/11/goodfellows-companionship-startup-ratan-tata-shantanu-naidu', headline: 'GoodFellows — companionship startup backed by Ratan Tata connecting graduates with seniors', founder: 'Shantanu Naidu, Gargi Sandu & Niki Thakur — GoodFellows, Mumbai', key_stat: 'Backed by Ratan Tata; 65+ young goodfellows serving 400+ senior grandpals; ₹84.9 lakh annual revenue FY25', quote: 'We employ young, educated graduates to create intergenerational friendships to reduce loneliness.' },
      { _key: key('senior'), type: 'Government Source', source: 'NITI Aayog — Senior Care Reforms 2024', url: 'https://www.niti.gov.in/sites/default/files/2024-02/Senior%20Care%20Reforms%20in%20India%20Final%20Version%20Website-compressed.pdf', headline: "India's 60+ population will reach 194 million by 2031 and 346 million by 2050", key_stat: 'Senior care industry currently ~$7 billion; home healthcare segment projected to reach $21.3 billion by 2027' },
    ],
  },
  {
    slug: 'ai-powered-social-media-content-agency',
    proof_points: [
      { _key: key('ai'), type: 'Case Study', source: 'YourStory', url: 'https://yourstory.com/2024/10/frammer-ai-raises-seed-investment-from-lumikai', headline: 'Frammer AI raises $2M seed — converts 30-min videos into 35 social clips in 5 minutes', founder: 'Suparna Singh (ex-CEO NDTV), Kawaljit Singh Bedi — Frammer AI, Delhi', key_stat: 'Founded 2023; raised $2M from Lumikai; clients include India Today Group, Zee News, Acko; generating revenue for several months pre-raise', quote: 'Frammer is driving strong interest internationally, including from movie studios and sports rights-holders.' },
      { _key: key('ai'), type: 'Market Data', source: 'NASSCOM–BCG Report 2024', url: 'https://www.business-standard.com/industry/news/ai-market-in-india-to-touch-17-billion-by-2027-nasscom-bcg-report-124022000743_1.html', headline: "India's AI market growing at 25–35% CAGR, reaching $17 billion by 2027", key_stat: 'AI/ML jobs in India grew 67% YoY; 170+ AI startups raised $2.6 billion+ cumulatively' },
    ],
  },
  {
    slug: 'mushroom-farming-in-hyderabad',
    proof_points: [
      { _key: key('mush'), type: 'Case Study', source: 'YourStory', url: 'https://yourstory.com/2024/03/50-lakhs-year-bangalore-couples-pandemic-project-mushroom-business', headline: 'Rs 50 Lakhs in 1 Year! This Bangalore Couple\'s Pandemic Project Became a Booming Mushroom Business', founder: 'Jashid Hameed & Prithvi Kini — Nuvedo, Bengaluru', key_stat: 'Started with ₹10,000 during COVID 2020; FY24 ₹50+ lakh revenue; appeared on Shark Tank India Season 3; sells home-grow kits + functional mushroom products', quote: 'They managed to convey the message of mushrooms and dispel myths through their educational content.' },
      { _key: key('mush'), type: 'Case Study', source: 'YourStory', url: 'https://yourstory.com/2023/11/santosh-mishra-mushroom-maestro-odisha-success-story', headline: 'Santosh Mishra: Rising from Challenges to a Mushroom Millionaire (Odisha)', founder: 'Santosh Mishra — Kalinga Mushroom Centre, Puri district, Odisha', key_stat: 'Started with ₹36 for spawn training; produces 2,000 bottles of spawn daily; earns ₹10 lakh/year; trained 1 lakh+ farmers including under Odisha government\'s Mission Shakti', quote: 'Started with four bottles of mushroom spawn purchased for ₹36; now working on a ₹2 crore food processing unit.' },
      { _key: key('mush'), type: 'Market Data', source: 'Grand View Research', url: 'https://www.grandviewresearch.com/industry-analysis/india-mushroom-market-report', headline: "India's mushroom market valued at USD 1.25 billion in 2024, reaching USD 2.58 billion by 2030", key_stat: '12.7% CAGR; Ministry of Agriculture allocated ₹500 million toward mushroom farming projects in 2024' },
    ],
  },
  {
    slug: 'fintech-embedded-credit-kirana-small-retailers',
    proof_points: [
      { _key: key('fin'), type: 'Case Study', source: 'YourStory', url: 'https://yourstory.com/2019/12/turning-point-jumbotail-kirana-stores-entrepreneurs', headline: 'How Jumbotail found its groove with kirana stores — and became a unicorn', founder: 'Ashish Jhina & S. Karthik Venkateswaran (ex-Stanford MBA, ex-BCG/Flipkart) — Jumbotail, Bengaluru', key_stat: 'FY23 revenue ₹819 crore (2.17× YoY); unicorn at $1B+ valuation (2025); embedded credit via Jumbotail Capital = ~25% of total revenue; serves 500,000+ retailers in 400+ cities', quote: 'Jumbotail\'s embedded credit scoring model, built on transaction history and AI, helps unbanked retailers access short-term credit.' },
      { _key: key('fin'), type: 'Market Data', source: 'Avendus Capital / CredAble', url: 'https://credable.in/insights-by-credable/business-insights/credit-for-the-underserved-addressing-the-massive-dollar-five-hundred-thirty-billion-msme-credit-gap/', headline: "India's MSME credit gap is $530 billion — only 19–20% of demand formally met", key_stat: 'RBI Expert Committee estimated gap at ₹20–25 lakh crore; commercial MSME credit growing at 13% CAGR, reaching ₹35.2 lakh crore as of March 2025 (SIDBI)' },
    ],
  },
]

async function run() {
  for (const item of data) {
    const doc = await client.fetch('*[_type == "businessIdea" && slug.current == $slug][0]{ _id }', { slug: item.slug })
    if (!doc) { console.log(`SKIP (not found): ${item.slug}`); continue }
    await client.patch(doc._id).set({ proof_points: item.proof_points }).commit()
    console.log(`✓ Patched ${item.slug} — ${item.proof_points.length} proof point(s)`)
  }
  console.log('\nDone.')
}

run().catch(e => { console.error(e.message); process.exit(1) })
