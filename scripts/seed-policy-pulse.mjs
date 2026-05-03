import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const cliConfig = JSON.parse(readFileSync(join(process.env.HOME, '.config/sanity/config.json'), 'utf8'))

const client = createClient({
  projectId: '5p3rso81',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: cliConfig.authToken,
  useCdn: false,
})

let _key = 0
const key = () => `k${++_key}`
const p  = (text) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const h2 = (text) => ({ _type: 'block', _key: key(), style: 'h2',     markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const h3 = (text) => ({ _type: 'block', _key: key(), style: 'h3',     markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const li = (text) => ({ _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1, markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const faq = (question, answer) => ({ question, answer })

const posts = [
  // ── Article 1: PM Surya Ghar Solar Installer ─────────────────────────────
  {
    _type: 'post',
    title: 'PM Surya Ghar Opens a ₹75,000 Crore Door for Local Solar Installers',
    slug: { _type: 'slug', current: 'pm-surya-ghar-solar-installer-business-opportunity' },
    excerpt: 'The government is handing out ₹78,000 subsidies to every Indian household that goes solar. Someone has to do the installation. That someone could be you — and the math is surprisingly good.',
    category: 'Entrepreneurship',
    author: 'BusinessIdeas.live',
    reading_time: 7,
    tags: ['policy-pulse', 'solar', 'green energy', 'government scheme', 'low investment'],
    published_at: new Date('2026-05-04').toISOString(),
    featured: false,
    body: [
      p('The Government of India launched PM Surya Ghar: Muft Bijli Yojana in February 2024 with a ₹75,021 crore outlay — and a direct subsidy of up to ₹78,000 per household that installs rooftop solar. The scheme targets 1 crore homes by 2027. As of early 2026, roughly 10 lakh homes have been covered. That means 90 lakh homes are still waiting.'),
      p('Every single one of them needs a certified local installer to make it happen. That installer could be you.'),

      h2('What the policy actually says'),
      p('Under PM Surya Ghar, the subsidy flows directly to the homeowner\'s bank account — but only after a government-empanelled vendor completes the installation. The Ministry of New and Renewable Energy (MNRE) and REC Limited maintain a national vendor registry. If you are on that list, you get access to a buyer who is already motivated and has ₹78,000 worth of reasons to say yes.'),
      p('The subsidy covers up to 3 kW of capacity per household: ₹30,000 per kW for the first 2 kW, and ₹18,000 per kW for the third. For most homes in Tier 2 and Tier 3 cities — where rooftop space is not a problem — a 3 kW system is the sweet spot.'),

      h2('The business case in plain numbers'),
      p('A 3 kW residential installation costs the homeowner approximately ₹1.6–1.8 lakh in total. After the ₹78,000 subsidy, the out-of-pocket cost is under ₹1 lakh. As an installer, your gross margin on a job like this runs 15–20%, which translates to ₹24,000–36,000 per installation.'),
      p('Run 5 jobs a month — entirely achievable with two trained electricians — and you are at ₹1.2–1.8 lakh in gross profit per month. At that pace, you recover your initial investment within 6–9 months.'),

      h2('What does it cost to start?'),
      li('State-level DISCOM empanelment and bank guarantee: ₹2–2.5 lakh'),
      li('Tools, mounting hardware, safety equipment: ₹1–1.5 lakh'),
      li('Two trained installation technicians (salary): ₹25,000–40,000/month'),
      li('Working capital for equipment float: ₹3–5 lakh'),
      p('Total entry cost: ₹7–10 lakh. That is it. No factory, no warehouse, no massive machinery.'),

      h2('What about Chinese competition?'),
      p('Solar panels were once India\'s biggest Chinese import story. That is changing fast. The government\'s Approved List of Models and Manufacturers (ALMM) now restricts subsidy-eligible installations to panels from approved domestic manufacturers. If you source from the ALMM list — which you must, to qualify for subsidy — you are not competing with Chinese imports. You are actually protected by the policy.'),
      p('As an installer, your business is fundamentally a service business. You are not manufacturing panels — you are surveying rooftops, designing systems, pulling permits, and wiring inverters. That is local work that cannot be offshored or undersold by a factory in Shenzhen.'),

      h2('Where the real opportunity is: Tier 2 and Tier 3 cities'),
      p('Solar installation companies are already crowded in Mumbai, Bengaluru, and Delhi. The gap is massive in smaller cities — Nagpur, Coimbatore, Surat, Ludhiana, Bhopal — where the scheme demand is high, rooftop space is abundant, and competition is almost non-existent. If you are based in or near a Tier 2 city, you have a first-mover window that will not stay open forever.'),

      h2('Government schemes to fund your setup'),
      li('PMEGP (Prime Minister\'s Employment Generation Programme): Up to ₹20 lakh project loan with 25–35% margin money subsidy — effectively a grant on a portion of your investment.'),
      li('State subsidies: Karnataka and Gujarat offer additional 25% capital subsidies on equipment costs for solar service businesses.'),
      li('MSME registration: Gives you priority lending access and government procurement preferences.'),

      h2('How to get started this week'),
      p('1. Register on the PM Surya Ghar national portal (pmsuryaghar.gov.in) as a vendor.'),
      p('2. Apply for empanelment with your state DISCOM. Requirements vary by state but typically involve a bank guarantee, electrical contractor licence, and GST registration.'),
      p('3. Hire one certified electrician and one helper. Start with residential leads in your own neighbourhood — word of mouth is fast in a community where the neighbour\'s electricity bill just dropped to zero.'),
      p('The ₹75,000 crore scheme is already in motion. The subsidies are already being disbursed. The only question is who in your city is going to capture this business.'),
    ],
    faqs: [
      faq('Do I need an electrical contractor licence to become a solar installer?', 'Yes, most states require a valid electrical contractor licence or a tie-up with a licensed contractor to get DISCOM empanelment. If you do not have one, you can hire a licensed electrician as a co-founder or technical director.'),
      faq('Can I start with just ₹5 lakh?', 'You can start lean by skipping the large equipment float and doing back-to-back orders — collect an advance from the customer, order the equipment, install, collect balance. A ₹5 lakh start is possible but tight. ₹7–8 lakh gives you much more breathing room.'),
      faq('How do I find my first customers?', 'The PM Surya Ghar portal itself generates leads — homeowners register interest and the system connects them to empanelled vendors in their district. Your first 10 customers could come entirely from the government portal.'),
      faq('What happens after the scheme ends?', 'Rooftop solar adoption is growing independently of the subsidy due to rising electricity tariffs. Even without the scheme, a residential 3 kW system pays back in 4–5 years through electricity savings alone. The market is not scheme-dependent — the scheme just accelerates it.'),
    ],
    seo_title: 'Solar Installer Business Opportunity Under PM Surya Ghar 2026',
    seo_description: 'PM Surya Ghar offers ₹78,000 per household for rooftop solar. Start a certified solar installation business for ₹7–10 lakh and tap 90 lakh waiting homes.',
  },

  // ── Article 2: BIS Furniture Compliance Consulting ───────────────────────
  {
    _type: 'post',
    title: 'India Just Mandated BIS Certification for All Furniture — and Lakhs of Small Makers Have No Idea What to Do',
    slug: { _type: 'slug', current: 'bis-furniture-certification-compliance-business' },
    excerpt: 'The Furniture Quality Control Order 2025 forces every bed, chair, and desk sold in India to carry an ISI mark by August 2026. Most small workshop owners are completely unprepared. A compliance consulting business started today could serve hundreds of them.',
    category: 'Entrepreneurship',
    author: 'BusinessIdeas.live',
    reading_time: 6,
    tags: ['policy-pulse', 'manufacturing', 'compliance', 'BIS', 'furniture'],
    published_at: new Date('2026-05-03').toISOString(),
    featured: false,
    body: [
      p('On February 13, 2026, the Government of India activated the Furniture (Quality Control) Order, 2025. The law is simple: any bed, bunk bed, table, desk, chair, stool, or storage unit sold in India must carry a BIS ISI mark. No mark, no legal sale. Large manufacturers had to comply immediately; MSMEs and small workshops have a transitional window until August 2026.'),
      p('India has hundreds of thousands of small furniture workshops — in Jodhpur, Nagpur, Pune, Ernakulam, Howrah. Most of them have never filled out a BIS application in their lives. They have no idea where to start, who to call, or how much it costs. That gap is your business.'),

      h2('What BIS Scheme I certification actually involves'),
      p('Getting an ISI mark is not a one-time form fill. It is a process:'),
      li('Document your manufacturing process: bill of materials, quality control steps, raw material specifications.'),
      li('Get product samples tested at a BIS-recognised NABL laboratory.'),
      li('Arrange a factory inspection by a BIS officer.'),
      li('Apply for the licence and pay the annual marking fee.'),
      li('Renew every year with ongoing compliance documentation.'),
      p('For a small workshop owner who makes chairs and sells them to retailers, navigating this process alone takes months and several expensive false starts. A consultant who knows the process can get it done in 6–8 weeks.'),

      h2('The business model'),
      p('This is a consulting and coordination business, not a manufacturing one. You are the guide who walks a furniture maker through the BIS maze. Your services:'),
      li('Initial gap assessment: what documentation does the client already have versus what BIS requires?'),
      li('Process documentation: writing up their manufacturing procedures in the format BIS needs.'),
      li('Lab coordination: arranging sample testing at a tied-up NABL lab (you sign a referral or revenue-share agreement with the lab — no capital needed).'),
      li('Factory audit preparation: coaching the client on what the BIS inspector will look for.'),
      li('Application filing and follow-up.'),
      li('Annual renewal and compliance maintenance.'),
      p('Charge ₹30,000–80,000 per client for the initial certification. Annual renewal packages at ₹15,000–25,000 per client create recurring revenue. In a furniture cluster of 200 makers, even converting 15% of them in your first year generates ₹90 lakh–1.8 crore in revenue.'),

      h2('What does it cost to start?'),
      li('Laptop, office setup, BIS standards purchase (IS codes for furniture): ₹1–2 lakh'),
      li('Self-study and training on BIS Scheme I process: ₹50,000–1 lakh in relevant courses and consultations'),
      li('NABL lab partnership: no capital — introduce clients, earn referral fees or a rev-share'),
      li('Initial outreach to a furniture cluster (travel, flyers, trade association membership): ₹50,000'),
      p('Total: ₹2–4 lakh. This is one of the lowest capital-to-revenue ratio opportunities in this list.'),

      h2('The China angle — and why it helps you'),
      p('The QCO was designed in part to block cheap, uncertified Chinese furniture imports. Before this order, an Indian retailer could import a container of unbranded Chinese furniture and sell it legally. After the order, that import requires a BIS licence — which requires a local authorised representative, factory inspection, and ongoing compliance. The regulatory friction on Chinese imports is now massive.'),
      p('Indian manufacturers who get BIS certification gain a genuine, legally enforced competitive advantage. Your business exists to help them get that advantage. You are on the right side of this trade barrier.'),

      h2('Where to find your first clients'),
      p('India has well-defined furniture manufacturing clusters. These are your hunting grounds:'),
      li('Jodhpur, Rajasthan: the largest furniture cluster in India, over 3,000 units'),
      li('Nagpur and Pune, Maharashtra: established manufacturing hubs'),
      li('Ernakulam, Kerala: strong wood and cane furniture tradition'),
      li('Howrah, West Bengal: metal furniture concentration'),
      p('Each cluster has a trade association. A single presentation at a cluster association meeting could land you 20–30 clients. The August 2026 deadline creates urgency — manufacturers who miss it cannot legally sell their products.'),

      h2('Subsidies and support available'),
      li('BIS MSME concessions: micro enterprises get 80% reduction in annual marking fees; small enterprises get 50%. This makes the certification more affordable for your clients and easier to sell.'),
      li('SFURTI scheme: government funding for cluster-level infrastructure, including compliance systems. You can potentially bid for cluster-level contracts.'),
      li('PMEGP: fund your own business setup with up to ₹20 lakh at subsidised rates.'),
    ],
    faqs: [
      faq('Do I need to be a BIS-certified officer to offer this service?', 'No. BIS certification is done by BIS itself — you are a consultant who helps clients prepare their documentation and navigate the process. No special licence is required to offer consulting services.'),
      faq('What if I have no background in manufacturing or compliance?', 'The BIS Scheme I process for furniture is well-documented. Spending 2–3 months studying the relevant IS standards and the BIS application process is enough to start. Your first few clients will teach you the rest.'),
      faq('Is there a risk the government delays or rolls back the QCO?', 'The government extended the MSME transition window from February to August 2026 — so some adjustment is possible. But the direction is firmly towards more QCOs, not fewer. The government has been systematically expanding mandatory BIS certification across sectors for the past four years.'),
      faq('Can I work remotely with clients?', 'Much of the documentation work can be done remotely. Factory inspection preparation requires a physical visit. If you focus on a single cluster initially, travel costs are minimal.'),
    ],
    seo_title: 'BIS Furniture Compliance Consulting Business Opportunity 2026',
    seo_description: 'India\'s Furniture QCO 2025 mandates ISI mark for all furniture by August 2026. Start a BIS compliance consulting business for ₹2–4 lakh and serve lakhs of unprepared manufacturers.',
  },

  // ── Article 3: EV Charging Station ───────────────────────────────────────
  {
    _type: 'post',
    title: 'The Government Is Paying Up to 80% of the Cost to Set Up an EV Charging Station. Here Is How to Claim It.',
    slug: { _type: 'slug', current: 'ev-charging-station-business-pm-edrive-subsidy' },
    excerpt: 'India needs 72,300 new public EV chargers under PM E-DRIVE. The government is offering 70–80% subsidy on equipment and infrastructure. With 17 million EVs projected by 2030 and only 25,000 charging points today, the supply gap is enormous.',
    category: 'Entrepreneurship',
    author: 'BusinessIdeas.live',
    reading_time: 8,
    tags: ['policy-pulse', 'EV', 'electric vehicles', 'government scheme', 'infrastructure'],
    published_at: new Date('2026-05-02').toISOString(),
    featured: false,
    body: [
      p('India sold over 2 million electric vehicles in 2025. By 2030, that number is projected to cross 17 million annually. The problem: India currently has roughly 25,000 public charging stations. That is less than one charger for every 80 EVs on the road. In the United States, the ratio is closer to one charger for every 18 EVs.'),
      p('The government knows this. The PM E-DRIVE scheme, launched in October 2024 with a ₹10,900 crore budget, dedicates ₹2,000 crore specifically to public charging infrastructure — with subsidies that cover 70–80% of your setup cost. This is one of those rare windows where the policy, the market, and the subsidy all point in the same direction.'),

      h2('What PM E-DRIVE actually offers'),
      p('Under the scheme, eligible locations receive:'),
      li('70% subsidy on EV charging equipment costs'),
      li('80% subsidy on upstream infrastructure (electrical wiring, transformers, civil work)'),
      li('100% subsidy for government buildings, hospitals, and educational institutions'),
      p('Eligible locations include toll plazas, fuel stations, commercial parking lots, apartment complexes, shopping malls, and office parks. If you own or can get a commercial agreement with any of these, you are eligible.'),

      h2('Two business models to consider'),
      h3('Model A: Small AC charging hub (₹5–8 lakh pre-subsidy)'),
      p('Install 3–5 AC chargers (7.2 kW each) in a commercial parking lot or apartment complex. These charge a typical EV in 4–6 hours — perfect for overnight parking or long shopping visits.'),
      li('3 AC chargers (7.2 kW each): ₹3–5 lakh equipment cost'),
      li('Electrical wiring and DISCOM load sanction: ₹1–2 lakh'),
      li('Civil work and signage: ₹50,000'),
      p('After 70–80% subsidy, your actual outlay is ₹1–1.6 lakh. Revenue comes from per-unit charging fees: at ₹15–20 per kWh, a busy hub can generate ₹30,000–60,000 per month.'),

      h3('Model B: DC fast charger at highway or fuel station (₹10–15 lakh pre-subsidy)'),
      p('One 30 kW DC fast charger can charge an EV to 80% in under an hour. These go at highways, fuel stations, and city hubs where drivers cannot wait 4 hours.'),
      li('1 DC fast charger (30 kW): ₹8–12 lakh'),
      li('Upstream infrastructure: ₹2–3 lakh'),
      p('After 70–80% subsidy, net outlay is ₹2–3 lakh. Revenue is higher per session — ₹200–400 per charge — and utilisation grows quickly in high-traffic locations.'),

      h2('Revenue and payback period'),
      p('Assume a 5-charger AC hub with 30% average utilisation (a conservative estimate for a decent location). At ₹15/kWh:'),
      li('5 chargers × 7.2 kW × 8 hours/day × 30% utilisation × ₹15/kWh = ₹1,296/day'),
      li('Monthly gross revenue: ~₹39,000'),
      li('Less electricity cost (₹7/kWh): ~₹18,000'),
      li('Net monthly: ~₹21,000'),
      p('After subsidy, your capital outlay is ₹1.5–2 lakh. Payback period: 7–10 months. After that, the revenue is nearly pure profit from a piece of hardware that runs itself.'),

      h2('The China question'),
      p('It is worth being honest here: EV battery supply chains are deeply China-dependent. China controls over 90% of global graphite refining and 60% of lithium processing. In April 2026, China imposed new export licensing requirements on rare earth elements used in EV motors — dysprosium, terbium, and others.'),
      p('This creates risk for EV manufacturers and ultimately for EV adoption timelines. However, as a charging station operator, your business is selling electricity — not manufacturing batteries or motors. Your hardware (the charging equipment itself) can be sourced from Indian companies like Tata Power, Exicom, and Delta Electronics India, all of whom manufacture AC and DC chargers domestically.'),
      p('The China risk affects your customers (EV buyers) more than it affects you directly. If EV adoption slows, your utilisation grows more slowly. But the direction of travel is not in doubt — India\'s EV fleet is growing at 66% annually even with supply chain friction.'),

      h2('State-level sweeteners on top of PM E-DRIVE'),
      li('Gujarat: 100% electricity duty exemption + 25% additional capex subsidy'),
      li('Maharashtra: Viability Gap Funding up to ₹10 lakh per DC fast charger'),
      li('Karnataka: 25% capex subsidy + priority DISCOM connections'),
      li('Delhi: Mandating charging infrastructure at all vehicle dealerships — creating a captive installation market'),

      h2('How to get started'),
      p('1. Identify a high-footfall location where you can get a commercial agreement: a mall, fuel station, apartment complex, or office park.'),
      p('2. Apply on the PM E-DRIVE portal (emobility.in or through state nodal agencies) for subsidy allocation. Approvals have been running 4–8 weeks.'),
      p('3. Get three quotes from MNRE-empanelled charger manufacturers. Tata Power, Exicom, and ChargeZone are the largest domestic suppliers.'),
      p('4. The subsidy flows as a reimbursement after installation — so you need working capital or a short-term loan for the upfront outlay. PMEGP covers up to ₹20 lakh at subsidised rates.'),
      p('The gap between 25,000 existing chargers and 72,300 government-targeted chargers will be filled by entrepreneurs, not by the government itself. The subsidy is the invitation. The question is who shows up.'),
    ],
    faqs: [
      faq('Do I need to own the property to set up a charging station?', 'No. You can sign a revenue-share or lease agreement with a property owner — mall, fuel station, parking lot. Many property owners are actively looking for EV charging partners because it draws higher-income customers.'),
      faq('What is the minimum area needed?', 'A single AC charger needs roughly 2 square metres of parking space plus access to a 3-phase electrical connection. A 5-charger hub fits comfortably in 15–20 square metres. DC fast chargers need slightly more due to the larger equipment cabinet.'),
      faq('How do I collect payments from EV users?', 'All major charger manufacturers (Tata Power EZ Charge, ChargeZone, Exicom) provide a cloud-connected system with a mobile app for payment. You do not need to build any software. You get a dashboard showing sessions, revenue, and utilisation.'),
      faq('What happens when the PM E-DRIVE subsidy period ends?', 'The scheme runs through March 2027 with a likely extension. But even without subsidy, a DC fast charger at a well-chosen highway location pays back in 18–24 months at current EV fleet growth rates. The subsidy just makes the economics extraordinary in the near term.'),
    ],
    seo_title: 'EV Charging Station Business Opportunity Under PM E-DRIVE 2026',
    seo_description: 'PM E-DRIVE offers 70–80% subsidy on EV charging station setup. India needs 72,300 new chargers. Start an EV charging business for ₹1.5–3 lakh net after subsidy.',
  },
]

async function seed() {
  for (const post of posts) {
    const existing = await client.fetch(
      '*[_type == "post" && slug.current == $slug][0]{ _id }',
      { slug: post.slug.current }
    )
    if (existing) {
      console.log(`SKIP (already exists): ${post.slug.current}`)
      continue
    }
    const result = await client.create(post)
    console.log(`✓ Created: ${post.slug.current} (${result._id})`)
  }
  console.log('\nDone.')
}

seed().catch((err) => { console.error(err.message); process.exit(1) })
