// Auto-generated seed script — DO NOT edit manually; see .claude/skills/blog-writer/

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, mkdirSync, createReadStream } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

// ── Auth ──────────────────────────────────────────────────────────────────────

let authToken = process.env.SANITY_WRITE_TOKEN
if (!authToken) {
  try {
    const cliConfig = JSON.parse(readFileSync(join(process.env.HOME, '.config/sanity/config.json'), 'utf8'))
    authToken = cliConfig.authToken
  } catch {}
}
if (!authToken) authToken = process.env.SANITY_API_TOKEN
if (!authToken) {
  console.error('ERROR: No Sanity auth token. Set SANITY_WRITE_TOKEN in .env.local.')
  process.exit(1)
}

const client = createClient({
  projectId: '5p3rso81',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: authToken,
  useCdn: false,
})

// ── PortableText helpers ──────────────────────────────────────────────────────

let _key = 0
const key = () => `k${++_key}`

const p     = (text)   => ({ _type: 'block', _key: key(), style: 'normal',     markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const h2    = (text)   => ({ _type: 'block', _key: key(), style: 'h2',         markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const h3    = (text)   => ({ _type: 'block', _key: key(), style: 'h3',         markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const li    = (text)   => ({ _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1, markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const num   = (text)   => ({ _type: 'block', _key: key(), style: 'normal', listItem: 'number', level: 1, markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const quote = (text)   => ({ _type: 'block', _key: key(), style: 'blockquote', markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const faq   = (question, answer) => ({ question, answer })

const pLink = (...parts) => buildLinkParagraph(parts, '/business-ideas')
const pLinkPost = (...parts) => buildLinkParagraph(parts, '/blog')

function buildLinkParagraph(parts, prefix) {
  const markDefs = []
  const children = []
  for (const part of parts) {
    if (typeof part === 'string') {
      if (part) children.push({ _type: 'span', _key: key(), text: part, marks: [] })
    } else if (Array.isArray(part)) {
      for (const { text, slug } of part) {
        const mk = key()
        markDefs.push({ _key: mk, _type: 'link', href: `${prefix}/${slug}` })
        children.push({ _type: 'span', _key: key(), text, marks: [mk] })
      }
    }
  }
  return { _type: 'block', _key: key(), style: 'normal', markDefs, children }
}

// ── Cover image ───────────────────────────────────────────────────────────────

const coverImage = {
  query: 'india small business manufacturing workshop growth',
  fallbackQueries: ['indian entrepreneur factory floor', 'msme india workshop', 'india business scaling'],
  alt: 'A small Indian manufacturing workshop with workers and equipment, representing the missing middle of Indian business',
}

// ── Post payload ──────────────────────────────────────────────────────────────

const post = {
  _type: 'post',
  title: "The Missing Middle: Why India's Best Founders Choose to Stay Small",
  slug: { _type: 'slug', current: 'missing-middle-india-msme-why-businesses-stay-small' },
  excerpt: "India has 4.72 crore MSMEs, and 98.9% are micro enterprises. The founders who never scale past 9 employees are not lacking ambition — they are responding to a compliance architecture that makes employee number 10 genuinely expensive.",
  category: 'Mindset',
  tags: ['mindset', 'msme', 'entrepreneurship', 'operations', 'compliance', 'scaling', 'founders', 'formalization'],
  reading_time: 16,
  featured: false,
  author: 'BusinessIdeas.live',
  published_at: new Date().toISOString(),
  seo_title: "Why India's MSMEs Stay Small: The Compliance Cliff Explained",
  seo_description: "98.9% of India's MSMEs are micro enterprises. The compliance cliff at employee 10 and 20 makes staying small rational. Here's how the best founders cross it.",
  body: [
    p("In April 2025, the Union government doubled the investment and turnover ceilings that define a micro enterprise in India — from ₹1 crore investment to ₹2.5 crore, from ₹5 crore turnover to ₹10 crore. Industry bodies called it a structural reform. Small business owners across the country called it long overdue. Then the Udyam portal published its latest data: 4.72 crore registered MSMEs, 98.9% still classified as micro. The proportion had barely moved."),
    p("The explanation most policy papers reach for is access to credit, or low ambition, or weak management capacity. Those factors exist. But they do not explain why an Indian founder who has built a ₹6-crore business and proven product-market fit still runs a 9-person team. The more uncomfortable explanation is a compliance architecture that creates artificial ceilings at exactly the moments when cash flow is most strained. The founders who escape this trap are not exceptional risk-takers. They are exceptional systems-builders who built compliance infrastructure before growth made it unavoidable."),

    h2("The Numbers That Should Not Add Up"),
    p("SIDBI's May 2025 sector study counted 7.34 crore MSMEs in India — a figure that includes informal, unregistered units. Of the 4.72 crore on the Udyam registry, 0.3% are medium enterprises. That 0.3% generates roughly 40% of all MSME exports, according to a NITI Aayog paper titled Designing a Policy for Medium Enterprises, published in May 2025. Read that again: three in a thousand firms account for four in every ten rupees of MSME export earnings."),
    p("The NITI Aayog paper was explicit about what this implies. Medium enterprises are not just bigger small businesses. They have the fixed-cost base to support export documentation, trade finance, international certifications, and the dedicated compliance teams that overseas buyers increasingly require. The missing middle is not just an employment story — it is an export competitiveness story."),
    p("Productivity confirms the gap from a different angle. Deloitte India's October 2025 economic outlook measured Indian MSME productivity at roughly 18% of large-enterprise levels. In OECD economies — Germany, South Korea, Japan — small and medium businesses operate at 45 to 70% of large-firm productivity. That 27-to-52 percentage-point gap is not explainable by geography or sector alone. It is the compounded effect of businesses that never achieved the scale needed to invest in training, machinery, process documentation, and management systems."),
    p("The International Growth Centre's India Firms Evidence Paper, published in June 2025, added a harder number: over 90% of India's workforce is in informal employment. The Annual Survey of Unincorporated Sector Enterprises for 2022-23 found that 63.2% of establishments are unregistered, and only 0.3% of establishments with hired workers are covered by either EPFO or ESIC. This is not informality by accident. It is informality by design, because the cost of formality is front-loaded and the benefits are diffuse."),

    h2("The Compliance Cliff: Three Thresholds That Rewire Your Costs"),
    p("The Employee State Insurance Corporation, ESIC, applies to every establishment with 10 or more employees. From the moment your tenth person joins, you owe 3.25% of their gross wages as employer contribution, plus 0.75% deducted from the employee's salary, on every salary up to ₹21,000 a month. The ESIC threshold is not a paperwork event. It is a permanent increase in the cost of every subsequent hire, alongside monthly contribution filings, digital challans, and the administrative discipline those require."),
    p("At 20 employees, the Employees' Provident Fund Organisation kicks in. Employer contribution: 12% of basic wage per employee. The combined effect of ESIC and EPFO, for a founder running a business with an average salary of ₹30,000 a month, adds roughly ₹3,500 to ₹4,500 per employee per month in statutory costs — before a single rupee of increment, bonus, or gratuity."),
    p("The Factory Act threshold, which most state governments set at 10 workers using powered machinery, adds a third layer: factory license fees, safety audits, welfare officer requirements above certain headcounts, and the ongoing risk of inspection. The compliance burden is administrative and financial, but it also introduces a new class of regulatory exposure that a sole proprietor with 8 employees simply does not carry."),
    p("The Labour Codes, which consolidated 29 central labour laws into four codes and took effect on November 21, 2025, were expected to simplify this picture. In practice, the thresholds themselves did not change materially. What changed is that compliance is now digital-first, with unified portals and penalties for late filing that are more consistently enforced than they were under the fragmented old regime. For a founder who was previously informal by neglect rather than by choice, the Codes made staying informal a higher-stakes decision."),
    p("Drishti IAS, citing the Annual Survey of Unincorporated Sector Enterprises 2015-16, reported that only about 7% of informal manufacturing establishments had 10 or more workers. That figure from 2015-16 has not changed dramatically by 2025-26. The compliance cliff has been visible for decades. Founders are not unaware of it. They are responding rationally to it."),
    p("Put this in concrete terms for a manufacturing unit paying ₹25,000 average gross salary to its workers. At 9 employees, monthly payroll is ₹2.25 lakh. At 10 employees with ESIC active, total employer liability on salaries alone jumps to ₹2.58 lakh per month — a ₹33,000 increase, net of the new hire's own salary. Over a year, that is ₹3.96 lakh in additional statutory cost for one hire. If the new employee generates ₹40,000 in gross margin per month, the payback period is just under 10 months. Most founders do not object to that math. What they object to is absorbing that cost while simultaneously setting up ESIC registrations, training an HR person on challan schedules, and managing the possibility of an inspection. The compliance infrastructure cost is real, even when it is invisible in the P&L."),

    quote("Nine employees is not a sign of small ambition. For many Indian founders, it is a number that makes precise financial sense once you have done the true cost of employee number ten."),

    h2("The ₹10 Crore Ceiling: When Micro Status Gets Expensive to Lose"),
    p("The April 2025 reclassification raised the micro-enterprise turnover ceiling from ₹5 crore to ₹10 crore. That is a meaningful buffer. But crossing ₹10 crore still triggers a change in category that carries real financial consequences across three interconnected policy channels."),
    p("The first is Priority Sector Lending. Public-sector banks must direct a mandated share of credit to priority sectors, with sub-targets specifically for micro enterprises. Once you cross into the small-enterprise category, the rates and collateral requirements tilt. The difference between a micro-enterprise loan at 8.5% and a small-enterprise loan at 10.5% on a ₹2 crore working capital facility is ₹40 lakh in interest over five years — not a rounding error on a business with 15% net margins."),
    p("The second is government procurement. The Public Procurement Policy for MSMEs reserves 25% of tenders from central government ministries and PSUs for MSMEs, with a specific 3% sub-target for micro and small enterprises owned by SC/ST entrepreneurs. Procurement officers have discretion in how aggressively they apply category preferences, and micro enterprises consistently report faster clearance times and fewer documentation requirements than small enterprises on identical tender values."),
    p("The third is scheme eligibility. MUDRA loans, Startup India benefits, state-level seed funding schemes, and export promotion programmes from FIEO and APEDA all carry micro-specific tranches with faster disbursement, lower guarantee requirements, or subsidised interest. These are not transformative in isolation. Cumulatively, they represent a cost of formality that a founder approaching the ₹10 crore mark is acutely aware of."),
    p("The MUDRA Kishor category, which covers loans between ₹50,000 and ₹5 lakh, has historically disbursed over ₹1.5 lakh crore per year at near-zero collateral requirements for micro firms. Cross into the small-enterprise category and the comparable product is a CGTMSE-backed term loan that carries a one-time guarantee fee of 0.75% to 1.5% of the loan amount, plus an annual service charge. For a founder taking a ₹1.5 crore term loan to buy equipment, that guarantee fee alone is ₹11 to 22 lakh over the loan tenure. The micro-enterprise window is not charity. It is a measurable cost advantage that rational founders do not give up until they have a specific reason that justifies it."),
    p("State-level incentives add another layer of calculation. Maharashtra, Tamil Nadu, Gujarat, and Karnataka all run MSME cluster development schemes and capital subsidy programmes with micro-specific eligibility windows. Tamil Nadu's TIDCO scheme, for example, offered capital subsidies of up to 25% for micro enterprises in priority sectors in 2024-25. The subsidy rate for small enterprises in the same scheme was 20%. That 5-percentage-point difference on a ₹2 crore plant and machinery investment is ₹10 lakh — real money for a business whose equity base is built entirely from retained earnings."),

    h2("What the Productivity Gap Actually Tells You"),
    p("The Deloitte 18% productivity figure sounds like an indictment. It is more useful to read it as a diagnostic. Productivity, measured as output per worker, is low in Indian MSMEs for the same reason it was low in OECD SMEs in the 1970s: businesses at sub-scale cannot afford the fixed costs of the tools that drive productivity. A 12-person furniture workshop cannot justify a ₹60 lakh CNC router. A 15-person textile unit cannot carry the overhead of a dedicated QC manager and an ERP system."),
    p("What the OECD comparison reveals is not that Indian founders are less capable. It is that OECD economies successfully moved a critical mass of firms through the compliance cliff into the 20-to-250 employee range where those fixed costs become justifiable. India has not, and the gap in productivity is the accumulated cost of that failure."),
    p("The IGC India Firms Evidence Paper frames this as a self-reinforcing cycle. Firms that stay small cannot invest in productivity. Firms that cannot invest in productivity cannot generate the cash flow to absorb the compliance costs of growing. Firms that cannot absorb compliance costs stay small. The cycle is rational at the individual level and corrosive at the aggregate level."),
    p("Policy Edge, in an analysis of medium-enterprise growth patterns, found that even among firms that do cross into medium-enterprise territory, close to two-thirds do not scale further. The compliance cliff does not end at the ₹250 crore turnover ceiling. It shifts. At that point, you are dealing with the Companies Act's more stringent audit requirements, mandatory CSR spending above ₹5 crore in net profits, and the full weight of transfer pricing rules if you have any related-party transactions. Each threshold creates a new cohort of founders who decide the next step is not worth it."),
    p("The data from ASUSE 2022-23 underlines how far this logic has penetrated. When 63.2% of all business establishments in India are unregistered, that is not a compliance knowledge gap. It is a revealed preference. Informal businesses trade certainty for flexibility: no GST filing, no ESIC, no EPFO, no factory inspector. They pay a different cost — no bank credit, no government contract, no formal supply chain relationship — and for millions of micro-operators, that trade-off is sensible. The goal is not to eliminate informality by decree. It is to make formality economically rational for the firms that have genuine growth potential."),
    pLinkPost("If you are at the threshold right now, ", [{ text: "hiring your first employee in India involves more legal decisions than most founders expect", slug: "hiring-first-employee-india-legal-checklist" }], " — the checklist there covers the exact ESIC and PF registration steps."),

    h2("The Founders Who Went Through the Wall"),
    p("Nithin Kamath and Nikhil Kamath built Zerodha in Bengaluru without venture capital. They started with personal savings and a bet that a zero-brokerage model would work if the underlying platform was reliable and the compliance was airtight. Zerodha went through every SEBI registration, every ESIC and PF threshold, every audit cycle. Today it is India's largest discount broker by active clients, with over 1.2 crore customers. Kamath has been public about one lesson: building compliance infrastructure early, when it felt premature, became a competitive moat. Competitors who deferred it spent years catching up."),
    p("Sridhar Vembu built Zoho Corporation in Chennai and later moved significant operations to Tenkasi, a small town in southern Tamil Nadu. Zoho reported ₹12,313 crore in revenue for FY2024-25 and employs thousands of people across tier-2 and tier-3 locations — all on a bootstrapped model with no institutional investors. Vembu has argued consistently that the decision to formalise early and stay outside the VC funding cycle gave Zoho the freedom to build for decades instead of quarters. Zoho runs payroll, provident fund, ESIC, and gratuity compliance for a workforce that would overwhelm most India-based SME HR departments. They solved it with their own software."),
    p("Neither Zerodha nor Zoho treated the compliance cliff as a reason to stop at nine employees. They treated it as infrastructure to build. That framing matters. Compliance is not optional past a certain scale — the only variable is whether you build the capacity to handle it before or after you need it. Building it before is harder and more expensive in the short run. Building it after, under pressure, is how founders find themselves choosing between growth and survival."),
    p("What both companies share, beyond scale, is the decision to invest in internal systems rather than outsourcing compliance indefinitely to a CA or a third-party vendor. External compliance support is necessary in the early stages. It becomes insufficient — and eventually a liability — when your headcount and transaction volume grow past the point where a monthly retainer CA can track everything that moves. Zerodha built in-house compliance teams, documented procedures, and audit trails because SEBI required it. Zoho built its own payroll and HR product partly because the founders experienced, firsthand, what it costs to run a 1,000-person company on spreadsheets and external vendors. The lesson both companies export is not that compliance is easy. It is that treating it as a core competency rather than a cost centre changes what is possible."),

    quote("Zoho and Zerodha did not grow despite India's compliance architecture. They built the systems to absorb it early, and that investment became a barrier their smaller competitors could not replicate."),

    h2("Building the Compliance Infrastructure Before You Need It"),
    p("The practical question is not whether to cross the compliance cliff. It is how to cross it without breaking cash flow. The answer is to sequence the investments deliberately rather than absorbing them all in one quarter."),
    num("Register for ESIC at employee 8, not 10. The registration itself has no cost. Having your systems, payroll codes, and employee onboarding paperwork ready before the threshold means employee 10 is a planned event, not a fire."),
    num("Separate basic wage from gross CTC before you hire number 15. PF is calculated on basic wage, not gross. Structuring salary packages before EPFO applies gives you control over the compliance cost per hire that you lose if you restructure after."),
    num("Run a factory licence eligibility check at 8 powered workers. State government requirements vary. Some states require a licence at 10, others at 20. Find out what applies to your premises before the inspection, not after."),
    num("Model the ₹10 crore threshold 18 months out. If your revenue trajectory puts you over the micro ceiling within six quarters, start the credit relationship migration now. Build the relationship with your banker when you are micro, so the conversation about small-enterprise facilities happens at a time of your choosing."),
    num("Automate the filings before they are mandatory. Monthly ESIC challans, quarterly PF returns, and annual gratuity actuarial estimates are predictable recurring costs. Every month they are handled manually is a month your founding team is not working on the business."),
    p("The transition quarter — the 90 days after you cross the headcount threshold — is the highest-risk window. New compliance costs are live, but the additional revenue from the new hire or hires has not yet materialized in the P&L. If your working capital buffer covers only 60 days of operating costs, this is the quarter that tests your cashflow management. Founders who have a plan for that 90-day window — a line of credit pre-approved, a receivables cycle tightened, a slow-month avoided for the hiring milestone — cross the cliff cleanly. Founders who hit it cold often freeze, stop at the threshold, and rationalise the decision as strategic. Sometimes it is. More often it is a cash problem wearing the clothes of a strategic choice."),
    pLink("Platforms built specifically for MSME payroll compliance are worth evaluating before the headcount crosses 15 — ", [{ text: "HR and payroll SaaS tools for SMEs", slug: "hr-payroll-saas-smes" }], " have matured significantly in the last two years."),
    pLink("GST compliance at the ₹10 crore turnover boundary also shifts in complexity — ", [{ text: "MSME GST filing automation tools", slug: "msme-gst-filing-automation" }], " can absorb a meaningful portion of that administrative overhead."),

    h2("The Decision Framework: When to Scale Past 9"),
    p("There is no universally correct answer to whether a given Indian founder should push through the compliance cliff. There is a set of questions that makes the decision explicit instead of leaving it as drift."),
    li("Is your revenue per employee increasing or flat? If adding the tenth person will push revenue-per-employee down for more than two quarters, the unit economics are not ready. If revenue per employee is rising, the cliff is a timing question, not a structural one."),
    li("Do you have 6 months of operating cash as a buffer? The transition quarter, when new compliance costs hit and revenue has not yet reflected the additional capacity, is where cash-light businesses stall. The buffer is not optional."),
    li("Have you identified and priced the PSL and procurement trade-offs? If your business depends on government procurement or subsidised priority sector credit, model the ₹10 crore turnover boundary explicitly."),
    li("Is your founding team's time the bottleneck, or is headcount? Many founders who feel capped at 9 are actually capped by systems that would break at 15. Fixing the system first is cheaper than hiring number 10 and discovering the system is the problem."),
    li("What does the compliance automation cost versus the value of the hire? At ₹50,000 per month for a mid-level employee, adding ₳7,000 in compliance cost is a 14% overhead increase. If the hire generates ₹1.5 lakh in revenue, the math is obvious. The founders who freeze at 9 usually have not run this specific calculation."),
    pLinkPost("The month founders most often freeze is not employee number 10 — it is earlier, when the business stops feeling easy and the energy to push through runs out. ", [{ text: "The psychology of why Indian founders quit at month 8", slug: "why-indian-founders-quit-month-8" }], " covers the mental pattern separately from the financial one."),

    h2("The Structural Fix That Policy Has Not Delivered"),
    p("The NITI Aayog May 2025 paper recommended two specific interventions: a dedicated R&D cell for medium enterprises and a sub-portal on Udyam for businesses in the ₹10 crore to ₹50 crore range. Both recommendations acknowledge that the missing middle is a policy failure, not a market one. The compliance thresholds were set decades ago and have never been recalibrated for the cost of compliance at scale."),
    p("The NITI Aayog paper also pointed to something more fundamental: the data problem. India does not have a reliable, real-time count of businesses in the small-to-medium transition zone. The Udyam registry captures self-reported classifications. Businesses that are informally operating above their registered category are not visible to policy. The sub-portal recommendation was an attempt to create a voluntary migration pathway where businesses in the ₹10 crore to ₹50 crore range could register with category-appropriate support packages before they were forced to reclassify. Whether that sub-portal materialises depends on inter-ministry coordination that has stalled similar initiatives before. The political economy of MSME policy in India consistently favours micro enterprises over medium ones, because micro enterprises vote in greater numbers. That is not a cynical observation. It is the structural reason why the missing middle has remained missing for three decades."),
    p("The Labour Codes were meant to simplify. Whether they succeed depends on state-level implementation rules, which were still being finalised by several states in 2025. The digital-first compliance portals are an improvement over paper-based systems, but they have not changed the underlying cost structure. A business with 22 employees still pays more in compliance overhead, as a percentage of payroll, than a business with 200."),
    p("The medium-enterprise gap is one that India will not close by decree. It closes when enough founders build the systems that make compliance absorbable, demonstrate that the cliff is survivable, and create the case studies that other founders use as permission to try. Zerodha and Zoho are case studies for technology companies. India needs them in textiles, food processing, light manufacturing, and healthcare services — the sectors where the missing middle is most visible and most costly."),
    p("SIDBI's May 2025 sector study estimated the formal credit gap for MSMEs at ₹30 lakh crore — meaning the difference between what MSMEs could productively absorb and what the formal financial system actually provides. That number has been cited in policy papers for years. The less-discussed question is why the gap persists despite a decade of MUDRA, CGTMSE expansion, TReDS mandates, and PSB loan melas. Part of the answer is that credit supply cannot fix a demand-side reluctance to formalise. A business that stays at 9 employees and ₹8 crore turnover to preserve its micro-enterprise status cannot fully access the credit that small and medium enterprises can access. The compliance architecture and the credit architecture are in tension with each other, and neither side has fully acknowledged it."),
    p("The April 2025 reclassification was a partial acknowledgement. Doubling the thresholds gave a buffer, but it did not change the cliff structure. A business at ₹9.5 crore turnover now has headroom. A business at ₹12 crore has crossed the threshold and must recalculate its credit, procurement, and scheme access. The reclassification moved the cliff — it did not remove it. Until the compliance cost architecture changes alongside the classification architecture, rational founders will continue to optimise for the category that serves them best, not for the category that maximises growth."),
    pLinkPost("For founders at the stage where formalisation feels premature, ", [{ text: "choosing the right business structure from the start", slug: "business-structure-india-sole-proprietor-vs-pvt-ltd-vs-llp" }], " is one decision that shapes how much compliance overhead you carry at every subsequent stage."),

    p("Last updated: October 2026"),
  ],
  faqs: [
    faq(
      "What is the missing middle problem in India?",
      "India's missing middle refers to the near-absence of businesses in the 20-to-250 employee range. Of 4.72 crore registered MSMEs on the Udyam portal in 2026, only 0.3% are medium enterprises — yet that 0.3% generates roughly 40% of all MSME exports, per NITI Aayog's May 2025 report. The gap is driven partly by compliance thresholds that make each growth step disproportionately expensive."
    ),
    faq(
      "At what employee count does ESIC apply in India?",
      "ESIC applies to any establishment with 10 or more employees. The employer contributes 3.25% of gross wages and the employee contributes 0.75%, on salaries up to ₹21,000 per month. Registration and monthly challan filing are mandatory from the month the tenth employee joins."
    ),
    faq(
      "Why do Indian MSMEs struggle to scale past 9 employees?",
      "Hiring a tenth employee triggers ESIC registration (employer cost: 3.25% of gross wages), followed by EPFO at 20 employees (employer PF: 12% of basic wage) and Factory Act registration at 10 powered workers in most states. Combined, these thresholds add 15 to 20 percentage points to the true cost-per-employee for headcount 10 to 25, at exactly the stage when cash flow is most constrained."
    ),
    faq(
      "What changed in the April 2025 MSME reclassification?",
      "The government revised the investment and turnover thresholds for all three MSME categories. Micro enterprise: investment up to ₹2.5 crore and turnover up to ₹10 crore (previously ₹1 crore / ₹5 crore). Small: ₹25 crore / ₹50 crore. Medium: ₹125 crore / ₹250 crore. The revision was intended to give growing businesses more headroom before they exit preferential credit and procurement benefits."
    ),
    faq(
      "Are there Indian companies that successfully crossed the compliance cliff?",
      "Zerodha (Bengaluru) scaled from a bootstrapped startup to India's largest discount broker by treating SEBI, ESIC, and EPFO compliance as infrastructure rather than overhead. Zoho Corporation (Chennai/Tenkasi) reached ₹12,313 crore in FY25 revenue on a fully bootstrapped model, employing thousands across tier-2 locations, having built in-house payroll and compliance systems early in its growth."
    ),
    faq(
      "When do the Labour Codes apply to Indian businesses?",
      "The four Labour Codes — consolidating 29 central labour laws — took effect on November 21, 2025. They cover wages, industrial relations, social security, and occupational safety. The codes did not materially change the ESIC and PF headcount thresholds, but introduced digital-first compliance portals with more consistently enforced penalties for late filings."
    ),
  ],
}

// ── Helpers: image fetch + upload ─────────────────────────────────────────────

async function unsplashSearch(query, accessKey) {
  const u = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`
  const res = await fetch(u, { headers: { Authorization: `Client-ID ${accessKey}` } })
  if (!res.ok) throw new Error(`Unsplash search failed (${res.status}) for query "${query}"`)
  const data = await res.json()
  return data.results || []
}

async function resolveImageUrl(cfg) {
  if (cfg.url && !cfg.url.startsWith('__')) return { url: cfg.url, source: 'direct' }
  if (cfg.query) {
    const k = process.env.UNSPLASH_ACCESS_KEY
    if (!k) throw new Error('coverImage.query set but UNSPLASH_ACCESS_KEY missing in env')
    const queries = [cfg.query, ...(cfg.fallbackQueries || []), 'india business', 'small business']
    let pick = null
    let triedQuery = null
    for (const q of queries) {
      const results = await unsplashSearch(q, k)
      if (results.length > 0) {
        pick = results[Math.floor(Math.random() * Math.min(5, results.length))]
        triedQuery = q
        break
      }
    }
    if (!pick) throw new Error(`No photos found for any of: ${queries.join(' | ')}`)
    return { url: `${pick.urls.raw}&w=1600&q=80&fm=jpg`, source: `unsplash-api(${triedQuery})`, credit: pick.user?.name }
  }
  throw new Error('coverImage requires either .url or .query')
}

async function downloadImage(url, filepath) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bi-blog-writer/1.0)' },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`Download failed: ${url} → HTTP ${res.status}`)
  writeFileSync(filepath, Buffer.from(await res.arrayBuffer()))
}

async function uploadCoverImage() {
  const resolved = await resolveImageUrl(coverImage)
  const tmpDir = join(tmpdir(), 'bi-blog-images')
  mkdirSync(tmpDir, { recursive: true })
  const tmpFile = join(tmpDir, `${post.slug.current}.jpg`)
  console.log(`  ↓ Cover image: ${resolved.source}${resolved.credit ? ` (by ${resolved.credit})` : ''}`)
  await downloadImage(resolved.url, tmpFile)
  console.log(`  ↑ Uploading cover to Sanity...`)
  const asset = await client.assets.upload('image', createReadStream(tmpFile), {
    filename: `${post.slug.current}.jpg`,
    contentType: 'image/jpeg',
  })
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: coverImage.alt,
  }
}

// ── Publish ───────────────────────────────────────────────────────────────────

async function publish() {
  const existing = await client.fetch('*[_type == "post" && slug.current == $s][0]{_id}', { s: post.slug.current })
  if (existing) {
    console.error(`SKIP: post with slug "${post.slug.current}" already exists (${existing._id})`)
    process.exit(1)
  }
  post.cover_image = await uploadCoverImage()
  const created = await client.create(post)
  console.log(`✓ Published: ${post.title}`)
  console.log(`  _id: ${created._id}`)
  console.log(`  URL: https://businessideas.live/blog/${post.slug.current}`)
}

publish().catch((err) => { console.error('ERROR:', err.message); process.exit(1) })
