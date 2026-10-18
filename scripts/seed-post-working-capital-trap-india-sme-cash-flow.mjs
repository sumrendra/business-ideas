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

const p     = (text) => ({ _type: 'block', _key: key(), style: 'normal',     markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const h2    = (text) => ({ _type: 'block', _key: key(), style: 'h2',         markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const h3    = (text) => ({ _type: 'block', _key: key(), style: 'h3',         markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const li    = (text) => ({ _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1, markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const num   = (text) => ({ _type: 'block', _key: key(), style: 'normal', listItem: 'number', level: 1, markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const quote = (text) => ({ _type: 'block', _key: key(), style: 'blockquote', markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const faq   = (question, answer) => ({ question, answer })

const pLink     = (...parts) => buildLinkParagraph(parts, '/business-ideas')
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
  query: 'indian small business invoice finance',
  fallbackQueries: ['india entrepreneur finance desk', 'india business owner'],
  alt: 'Indian small business owner reviewing overdue invoices and cash flow records at a desk',
}

// ── Post payload ──────────────────────────────────────────────────────────────

const post = {
  _type: 'post',
  title: "The Working Capital Trap: Why India's Profitable SMBs Still Run Out of Cash",
  slug: { _type: 'slug', current: 'working-capital-trap-india-sme-cash-flow' },
  excerpt: "India's profitable small businesses are running into a timing problem. Over ₹8.1 lakh crore is locked in delayed payments. Here is how the working capital trap works and what you can do about it.",
  category: 'Operations',
  tags: ['operations', 'working capital', 'cash flow', 'msme', 'entrepreneurship', 'funding & finance', 'b2b', 'gst'],
  reading_time: 15,
  featured: false,
  author: 'BusinessIdeas.live',
  published_at: new Date().toISOString(),
  seo_title: "Working Capital Trap: Why India's SMBs Run Out of Cash",
  seo_description: "India's MSMEs wait 73 days to collect invoices while paying suppliers in 30. Learn how the working capital trap works — and how to escape it.",
  body: [

    p("Across 1.1 lakh Indian small businesses, Recordent's 2026 SME Receivables Report turned up one number that cuts through every optimism: 73. That is how many days, on average, it takes an Indian SME to collect on its invoices. The average firm was carrying ₹3.83 crore in overdue receivables — not because the business was failing, but because its customers had decided, explicitly or not, that a small supplier is cheaper to owe money to than a bank."),

    p("India has a working capital crisis that gets routinely misdiagnosed as a credit crisis. A credit crisis is when businesses cannot get loans. What is happening to Indian MSMEs is subtler and harder to fix: profitable businesses — ones with real customers, real orders, real margins — are running out of cash because money owed to them sits in corporate accounts for 73 to 120 days while they pay their own suppliers in 30. The gap between those two numbers is the trap."),

    p("SIDBI's May 2025 landmark study on the Indian MSME sector pegged the addressable credit gap at roughly ₹30 lakh crore — about 24% of all the finance the sector needs. The study's most revealing finding was not the headline number: it was that the gap is worst in trading businesses, at 33%. Trading MSMEs do not lack business. They lack the cash their buyers already owe them."),

    h2("The Profitability Illusion: When Good Margins Hide a Cash Emergency"),

    p("Picture a fabric wholesaler in Surat. Margins are 14%. The business has grown 30% year-on-year for three years. On paper, profitable. But the founder is up at 2 AM calculating whether the current account has enough to clear tomorrow's supplier invoice. Three large retail chains — each on 90-day credit — have ₹58 lakh in combined outstanding. The bank will not lend against those receivables because there is no formal credit agreement. The CA says the business is fine. The current account says otherwise."),

    p("This is the profitability illusion. Most Indian SMB founders track margins and revenue growth. Almost none track the cash conversion cycle — the number of days between paying for inputs and collecting from customers. When the cycle runs 90 days and supplier terms are 30, the business is financing 60 days of its customer's operations every month. If monthly revenue is ₹50 lakh, that is ₹1 crore permanently parked in the customer's pocket at zero cost to them."),

    p("The Economic Survey 2025-26 put a national figure to this problem: ₹8.1 lakh crore locked in delayed payments to Indian MSMEs at any given time. That is not debt. That is earned money that profitable businesses are waiting to receive. SMERGERS, an India-based M&A marketplace, analyzed 50 fundraising mandates ahead of MSME Day 2026 and found that six in ten SMEs seeking capital were raising money to manage cash flow and service existing debt — not to expand."),

    h2("Three Places Cash Gets Locked Up"),

    h3("1. Receivables: The 73-Day Reality"),

    p("The MSMED Act, 2006 is unambiguous: buyers must pay MSME suppliers within 45 days of accepting goods or services if there is a written agreement, or within 15 days if there is no agreement. These are not guidelines. Section 16 of the Act mandates compound interest at three times the RBI bank rate for every day of delay. Section 43B(h) of the Income Tax Act — in force from FY 2024-25 — adds a further cost: buyers who delay payment beyond 45 days cannot deduct that expense from their taxable income until they actually pay."),

    p("In practice, none of this enforcement bites. Recordent's 2026 data found 73-day average payment cycles across 1.1 lakh businesses. Large corporates routinely impose 90-day and 120-day credit terms on MSME suppliers — directly breaching the Act. The MSME Samadhaan platform, the government's official redress system, tells the full story: out of 2,56,892 complaints filed cumulatively through December 2025, the disposal rate had fallen from roughly 33% in FY21 to just 4.07% by FY26, according to a Business Standard report in June 2026. The platform was replaced by a redesigned MSME Online Dispute Resolution portal in October 2025 — another transition that left existing claimants in limbo."),

    h3("2. Inventory: Money Sitting on Shelves"),

    p("For manufacturers and traders, inventory is the other working capital anchor. DNB's MSME Sampark report, based on RBI data, found that the net working capital cycle for one MSME segment lengthened to 98 days in FY24, up from 87 days in FY23, with inventory build-up as the primary driver. A 98-day working capital cycle means a business is financing roughly one-third of its annual revenue in float at any moment. For a ₹3 crore annual-revenue business, that is ₹1 crore permanently tied up in stock and receivables combined — capital that cannot be invested, reinvested, or returned to the founder."),

    h3("3. GST: The Refund That Never Arrives in 30 Days"),

    p("The GST inverted duty structure traps working capital for manufacturers in specific sectors — textiles, chemicals, ceramics, pharma, engineering goods — who buy inputs taxed at 18% and sell outputs taxed at 5% or 12%. The surplus input tax credit can only be recovered through a GST refund. The government promises this within 30 days. Empower India, a public policy think tank, reported in 2026 that businesses in Ludhiana's small-manufacturing clusters had 13% of working capital locked in pending GST refunds despite the 30-day statutory promise. In practice, delays of 60 to 90 days are common, with some claims running past 180 days."),

    p("A May 2026 GST performance audit stakeholder consultation specifically flagged refund sanction delays as a major MSME pain point, noting that refund claims were spreading across multiple tax officers, that disposal timelines were being missed routinely, and that interest on delayed refunds was not being calculated automatically. The India SME Forum had been raising this issue across two consecutive GST Council cycles with limited result."),

    quote("The problem is not that Indian SMBs are unprofitable. The problem is that they are profitable on paper and insolvent in cash — and the entire formal credit system is built to serve the paper, not the cash."),

    h2("Why the 45-Day Rule Has No Teeth"),

    p("The legal architecture is actually strong. MSMED Act Section 15 caps buyer credit at 45 days. Section 16 attaches compound interest. Section 24 gives these provisions overriding effect, meaning a contract clause purporting to waive the interest is void against a registered MSME supplier. Section 43B(h) of the Income Tax Act makes late payment a real-money tax cost for large buyers starting FY 2024-25. On paper, the incentive to pay on time is substantial."),

    p("The enforcement gap is structural. The Facilitation Councils meant to adjudicate payment disputes are state-level bodies, and as one CII official noted publicly, MSMEs typically have to go to courts to get real relief — an option that most small businesses cannot afford in time or money. The 4.07% complaint disposal rate of the old Samadhaan portal is a damning number. Redesigning the portal does not fix the underlying problem: an underfunded adjudication system facing hundreds of thousands of disputes."),

    p("The deeper issue is power asymmetry. A packaging manufacturer in Pune supplying to a large FMCG company is not going to invoke the MSMED Act against a customer that accounts for 40% of revenue. The relationship risk — getting blacklisted — overwhelms the legal right. This is the enforcement gap that no portal can fix. The real solution must come from reducing the MSME's financial dependence on any single large buyer, or making invoice discounting accessible enough that the MSME does not need to accept 120-day payment terms just to keep the contract."),

    h2("TReDS: The Government's Answer, Used by 0.2% of MSMEs"),

    p("The Trade Receivables Discounting System — TReDS — is the RBI's flagship solution to the receivables problem. The platform lets MSME sellers upload invoices to a marketplace where banks and NBFCs bid to discount them. The MSME gets paid immediately at a small discount; the financial institution waits for the corporate buyer to settle at invoice maturity. The concept is sound. The government has pushed it hard. In FY 2025-26, TReDS financed ₹3.47 lakh crore in invoices — up from ₹40,000 crore in FY 2021-22, an eight-fold jump in four years, according to a PIB press release dated July 10, 2026."),

    p("And yet, as of March 2025, only 135,093 MSME sellers had registered across TReDS platforms, against a universe of over nine crore MSMEs in India. An SSRN working paper from 2025 calculated penetration at approximately 0.2%. The reasons are documented: registration is cumbersome, many MSMEs lack the digital infrastructure for structured invoice uploads, and large corporate buyers resist joining platforms that make their outstanding payment obligations visible to third-party financiers. The RBI reduced the mandatory TReDS registration threshold for corporates from ₹500 crore turnover to ₹250 crore in 2026, and on June 30, 2026, the Ministry of MSME mandated TReDS settlement for all Central Public Sector Enterprises procuring from MSMEs. Whether CPSEs move the penetration needle is the key question."),

    pLinkPost("For MSME founders exploring fintech tools to automate cash-flow visibility and qualify for receivables-based lending, ", [{ text: "the Account Aggregator framework guide", slug: "account-aggregator-india-fintech-founders-guide" }], " explains how AA-based credit products use your receivables data to unlock working capital — a fundamentally different approach to the same timing problem."),

    h2("The Cash Conversion Cycle: The Number You Are Not Tracking"),

    p("The cash conversion cycle (CCC) is the single most useful number an SMB founder can track, and most do not. The formula: Days Inventory Outstanding plus Days Sales Outstanding minus Days Payable Outstanding. A business with 30-day inventory turns, 73-day receivables, and 30-day payables has a CCC of 73 days. Every rupee of revenue requires 73 days of financing. At ₹50 lakh monthly revenue, the permanent working capital requirement from the cycle alone is ₹1.22 crore."),

    p("The founders who have made this shift — tracking CCC quarterly rather than watching revenue and margin — consistently describe it as a turning point. Cutting receivables from 73 days to 45 days on a ₹6 crore annual-revenue business frees up approximately ₹37 lakh in working capital. That is more immediate liquidity than most bank credit lines those businesses can qualify for. The capital was already earned. It just needed to be collected faster."),

    p("Sector benchmarks in India are hard to find in public data, but supply chain finance practitioners report that FMCG distributors can achieve CCC of 15 to 25 days, B2B manufacturers typically run 60 to 90 days, and construction material suppliers often exceed 120 days. If your CCC is more than 30 days above the sector average, the drag on profitability is real. The three usual culprits are slow-moving inventory, a few large customers on long credit, and GST refunds outstanding."),

    pLinkPost("The relationship between payment terms and unit economics — how to build receivables cycles into your pricing model — is covered in detail in ", [{ text: "product pricing and margin math for Indian founders", slug: "product-pricing-india-margin-math" }], "."),

    quote("Cutting your receivables cycle from 73 days to 45 days on a ₹6 crore revenue business frees up ₹37 lakh. That is more than most bank working capital lines your business qualifies for right now."),

    h2("What Actually Works: Practical Levers"),

    p("The most underused working capital tool for Indian founders is dynamic discounting — offering customers a small early payment incentive in exchange for paying before the due date. A 1.5% discount for 30-day early payment on a 90-day invoice costs roughly 6% annualised. A working capital loan from a bank costs 12% to 16%. The math favours discounting in most cases, and it removes collection risk entirely. Credflow, the Mumbai-based B2B receivables management platform founded by Kunal Aggarwal, raised $2.1 million to build software automating exactly this kind of cash-flow discipline for Indian SMBs. Aggarwal noted in Inc42 that traditional B2B businesses in India were managing receivables and payables through entirely offline, archaic processes — a gap the platform was built to close."),

    p("Supply chain finance is the institutional version. A large corporate buyer uses its own credit rating to raise money cheaply and passes that liquidity to its MSME suppliers, who get paid early at a rate tied to the buyer's creditworthiness rather than their own. CredAble, operating in India's supply chain finance market, documented in a July 2025 analysis that 12 funded Indian startups had shut down in 2024 despite having raised millions — largely because equity capital is not designed to plug a 15-day receivables gap that recurs every single month. As a CredAble co-founder put it to YourStory SMBStory, the core issue was that bankers were unwilling to lend to cash-flow-driven businesses without collateral — which is exactly why supply chain finance, tied to the corporate buyer's creditworthiness, can work where conventional MSME lending cannot."),

    p("For businesses supplying to the government or CPSEs, TReDS is now worth a serious look — particularly after the June 2026 mandate requiring CPSEs to settle MSME invoices through the platform. MUDRA loans (Pradhan Mantri MUDRA Yojana) and the Emergency Credit Line Guarantee Scheme for MSMEs can bridge short-term gaps, though both are collateral-sensitive and take time to process. The right tool depends on whether your working capital problem is structural (cash conversion cycle is too long) or situational (one large customer is late on one invoice). Structural problems need process changes; situational ones need credit."),

    pLink("For founders building the next generation of B2B working capital tools for the Indian market, the ", [{ text: "B2B procurement financing platform idea", slug: "b2b-procurement-financing-platform" }], " explores validated demand metrics and the specific gaps that institutional supply chain finance still does not reach."),

    pLink("For kirana stores and micro-retailers specifically, ", [{ text: "the BNPL for kirana and MSME retailers concept", slug: "bnpl-kirana-msme-retailers" }], " outlines how embedded short-term credit is reshaping working capital for India's smallest businesses."),

    pLinkPost("If the cash flow gap is pushing you toward raising formal debt or equity to fund working capital — rather than operations — the practical steps for early-stage fundraising are laid out in ", [{ text: "how to raise your first ₹50 lakh pre-seed in India", slug: "how-to-raise-first-50-lakh-pre-seed-india" }], "."),

    h2("Steps to Take This Quarter"),

    p("The working capital trap is fixable, but it requires deliberate action on all three fronts simultaneously. Here is a sequence that works."),

    num("Calculate your current cash conversion cycle. Pull the last three months of data, compute Days Inventory Outstanding, Days Sales Outstanding, and Days Payable Outstanding. The number will likely surprise you. Compare it against your sector average."),
    num("Audit your top five customers by receivables outstanding. For any customer with invoices past 45 days, determine whether the cause is dispute, process, or deliberate delay — the fix is different in each case."),
    num("Check whether your buyers are TReDS-eligible. If any are CPSEs, they are now legally required to settle via TReDS. Register on RXIL, M1xchange, or Invoicemart and upload a test invoice to understand the process before relying on it."),
    num("Track your pending GST ITC claims separately from your P&L. File a formal escalation for any refund outstanding beyond 30 days. The GST portal has an escalation mechanism that is significantly underused. A dedicated monthly ITC review meeting — even 30 minutes — changes outcomes."),
    num("Model a dynamic discounting offer for your three largest accounts. Calculate the annualised cost of a 1.5% discount for 30-day early payment and compare it against your current borrowing cost. In most cases the discount costs half what working capital debt does."),

    pLinkPost("For founders building operations software to automate receivables tracking, payment reminders, or cash flow forecasting, ", [{ text: "how AI is cutting operations costs for Indian startups", slug: "ai-cut-operations-costs-india-startups" }], " covers the practical tooling landscape in 2026."),

    h2("The Bigger Picture"),

    p("The MSME (Amendment) Act 2026 — passed by Parliament in August 2026 — adds mandatory 90-day timelines for mediation and arbitration of payment disputes, creating harder deadlines than the old Samadhaan process. The RBI's consolidated Master Direction on TReDS, issued in June 2026, streamlines how platforms operate and lowers registration thresholds. The CPSE TReDS mandate is the most direct intervention yet. The policy direction is right. The implementation velocity is still slow relative to the problem's size."),

    p("For the founder who is profitable on paper and stretched for cash this month, policy timelines are not the answer. The working capital trap is a structural problem that needs to be engineered out of the business — through your own payment terms, your customer mix, and your cash conversion discipline. The government's tools are worth using when you qualify for them. Your own operating model is what determines whether you need them constantly or rarely. Start with the CCC. Everything else follows from that number."),

    p("Last updated: October 2026"),

  ],
  faqs: [
    faq(
      "What is the 45-day payment rule for MSMEs in India?",
      "Under Section 15 of the MSMED Act 2006, buyers must pay MSME suppliers within 45 days of accepting goods or services if there is a written agreement, or within 15 days if no agreement exists. Section 16 mandates compound interest at three times the RBI bank rate for any delay. Since FY 2024-25, Section 43B(h) of the Income Tax Act also disallows buyers from deducting a delayed MSME payment until they actually pay it — making late payment a direct tax cost."
    ),
    faq(
      "How do I file a complaint for delayed payment as an MSME?",
      "Since October 2025, new cases go to the MSME Online Dispute Resolution portal, which replaced the older MSME Samadhaan platform. You need an active Udyam registration, and your complaint is heard by the Micro and Small Enterprises Facilitation Council in your buyer's state. Historically the process has been slow — the disposal rate fell to 4.07% in FY26 — so parallel negotiation with the buyer, or offering early-payment discounts to incentivise compliance, is often faster than waiting for the portal."
    ),
    faq(
      "What is TReDS and should my SMB use it?",
      "TReDS (Trade Receivables Discounting System) is an RBI-authorised platform where MSME sellers upload invoices and banks bid to discount them — the MSME gets paid immediately, the bank waits for the buyer to pay at maturity. As of June 2026, all Central Public Sector Enterprises are required to settle MSME invoices via TReDS. The five active platforms are RXIL, M1xchange, Invoicemart, C2treds, and DTX. Penetration is roughly 0.2% of Indian MSMEs, but if you supply to CPSEs or large corporates above ₹250 crore turnover, registration is now a practical necessity."
    ),
    faq(
      "What is a healthy cash conversion cycle for Indian SMBs?",
      "It varies by sector. FMCG distributors can achieve CCC of 15 to 25 days. B2B manufacturers typically run 60 to 90 days. Construction material suppliers often exceed 120 days. If your CCC is more than 30 days above your sector average, the working capital drag is costing you real money. Cutting Days Sales Outstanding by 28 days on a ₹6 crore revenue business frees up roughly ₹37 lakh — more than most working capital credit lines those businesses qualify for."
    ),
    faq(
      "How does the GST inverted duty structure lock up MSME working capital?",
      "If you buy inputs taxed at 18% and sell outputs taxed at 5% or 12%, you accumulate surplus input tax credit that can only be recovered through a GST refund claim. The statutory promise is 30 days. In practice, Empower India reported in 2026 that Ludhiana small manufacturers had 13% of working capital locked in pending refunds. Delays of 60 to 90 days are common. Track your ITC claims in a separate register and escalate anything past 30 days through the GST portal's grievance mechanism."
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
