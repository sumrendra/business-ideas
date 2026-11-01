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

const p   = (text) => ({ _type: 'block', _key: key(), style: 'normal',     markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const h2  = (text) => ({ _type: 'block', _key: key(), style: 'h2',         markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const h3  = (text) => ({ _type: 'block', _key: key(), style: 'h3',         markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const li  = (text) => ({ _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1, markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const num = (text) => ({ _type: 'block', _key: key(), style: 'normal', listItem: 'number', level: 1, markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const quote = (text) => ({ _type: 'block', _key: key(), style: 'blockquote', markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const faq = (question, answer) => ({ question, answer })

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
  query: 'india D2C brand small business growth capital',
  fallbackQueries: [
    'india startup founder money finance',
    'indian entrepreneur business growth',
    'small business funding india',
  ],
  alt: 'Indian D2C brand founder reviewing revenue-based financing documents at a desk',
}

// ── Post payload ──────────────────────────────────────────────────────────────

const post = {
  _type: 'post',
  title: "Revenue-Based Financing India: The Real Cost D2C Founders Are Paying in 2026",
  slug: { _type: 'slug', current: 'revenue-based-financing-india-d2c-msme-guide-2026' },
  excerpt: "On ₹20 lakh at a 20% flat fee, you hand back ₹4 lakh — what a CGTMSE-backed bank loan would have cost ₹1.35 lakh. RBF platforms charge 20–38% annualized and market it as “paisa on rupee.” Here is what it actually costs, who it’s right for, and when to walk to your bank instead.",
  category: 'Funding & Finance',
  tags: ['funding-finance', 'entrepreneurship', 'market-research', 'd2c', 'msme', 'startup-capital', 'cgtmse', 'working-capital'],
  reading_time: 10,
  featured: false,
  author: 'BusinessIdeas.live',
  published_at: new Date().toISOString(),
  seo_title: 'Revenue-Based Financing India 2026: True Cost for D2C Brands',
  seo_description: "RBF platforms charge 20–38% annualized. CGTMSE bank loans cost 10.5–13%. Learn when revenue-based financing makes sense for Indian D2C brands and MSMEs in 2026.",
  body: [

    p("On a ₹20 lakh advance with a 20% flat fee, you hand back ₹4 lakh — that is the same capital a CGTMSE-backed term loan would have cost ₹1.35 lakh to service for a full year. The revenue-based financing pitch says you pay only when you earn. What it does not say is the annualized rate you are quietly agreeing to."),

    p("Revenue-based financing in India charges 20–38% annualized on capital a CGTMSE-backed bank loan would provide at 10.5–13%. The D2C founders winning in 2026 treat RBF as an expensive bridge to be drawn when speed and the absence of collateral matter more than cost — and they exit it as soon as they can qualify for bank debt. This guide tells you how to make that calculation before you sign."),

    h2("What Revenue-Based Financing Actually Is"),

    p("Revenue-based financing (RBF) is non-dilutive growth capital repaid as a fixed percentage of monthly revenue until you return a predetermined multiple of the advance. There are no equity stakes, no personal guarantees in most cases, and no fixed EMIs. If revenue falls, repayments fall; if it rises, you clear faster."),

    p("Three platforms dominate the Indian market. GetVantage, founded by Bhavik Vasa in Mumbai, raised \$36 million across two rounds and serves D2C, marketplace, and SaaS startups with tickets between \$20,000 and \$500,000 (roughly ₹17 lakh to ₹4.2 crore). It requires \$6,000 or more in monthly recurring revenue and at least 12 months of revenue history. Velocity, based in Bengaluru, raised \$20 million Series A from Valar Ventures — the fund Peter Thiel co-founded — and counts PowerGummies, WallMantra, BellaVita, and Smoor Chocolates in its portfolio. Recur Club repositioned as a broader revenue-based debt platform and writes tickets from ₹10 lakh to ₹5 crore, underwriting on GST returns and payment-gateway data rather than audited financials."),

    p("The fee structure varies but the math is consistent. GetVantage typically charges a factor rate between 1.06 and 1.25, meaning you repay ₹1.06 to ₹1.25 for every rupee borrowed. Velocity charges a flat capital fee of 8–15% per transaction. Recur Club quotes monthly rates that compress to an annual equivalent of 20–30%. None of these numbers are hidden — they are in the term sheets — but the framing as “paisa on rupee” obscures the annualized cost."),

    pLinkPost("Understanding the unit economics behind your repayment capacity starts with knowing your margins. If you have not yet done the margin math, read ", [{ text: 'our product pricing guide', slug: 'product-pricing-india-margin-math' }], " before committing to any capital structure."),

    h2("The Flat Fee Illusion: How to Read the Real Rate"),

    p("A 20% flat fee on a 6-month repayment cycle is not 20% per year. It is 40%+ annualized. This matters because most RBF platforms quote a flat capital fee on the total advance, not an annual percentage rate. The conversion is simple: divide the flat fee by the expected repayment period in years."),

    p("Example: You borrow ₹20 lakh at a 20% flat fee with an expected 6-month repayment. You repay ₹24 lakh in total. The ₹4 lakh fee on a 6-month loan is equivalent to ₹8 lakh on a 12-month loan, which is 40% of the original ₹20 lakh advance. A CGTMSE-backed term loan at 12% per year on ₹20 lakh over 12 months costs roughly ₹1.35 lakh in interest — about one-sixth the cost."),

    quote("A 20% flat fee on a 6-month RBF advance is equivalent to a 40% annualized rate. The comparison to a bank loan is not abstract: on ₹20 lakh, the difference is ₹2.65 lakh vs. ₹1.35 lakh in financing cost."),

    p("The three fee components to check before signing any RBF term sheet:"),

    li("Capital fee or factor rate: the total fee expressed as flat percentage or multiplier"),
    li("Repayment percentage: what share of monthly revenue is withheld (typically 8–18%)"),
    li("Minimum repayment duration or cap: some platforms cap repayment at 18 or 24 months regardless of revenue performance"),

    p("The minimum duration clause is particularly important. If your revenue falls below the platform’s forecast and the loan amortizes slower than expected, you may hit a cap that accelerates repayment or triggers penalty fees. Read this clause carefully."),

    h2("Two D2C Brands That Took Velocity Capital — What Their Numbers Show"),

    p("D’chica, a Pune-based apparel brand targeting tween girls, started raising from Velocity in August 2020. By 2023 the brand had taken multiple rounds and reached ₹13 crore in annual revenue, up from a base of roughly ₹1.62 crore. That is a compelling headline. The fuller picture: D’chica operates in a high-margin, high-repeat-purchase category — exactly the profile where RBF repayment percentages can be absorbed without stressing cash flow. A commodity FMCG brand with 15% gross margins would struggle under the same structure."),

    p("Off Duty, another apparel brand, raised ₹4 crore from Velocity and reported 3x revenue growth over two years, targeting ₹15 crore. The brand used the capital for inventory build-ahead before peak season — a use case where RBF genuinely outperforms bank loans because inventory financing typically requires hypothecation of goods and takes 3–4 weeks to process. Velocity disbursed in 72 hours."),

    p("Nihaal Mariwala, founder of Setu (a Bengaluru-based nutrition brand), cited revenue-aligned repayment as the key reason he chose RBF over a term loan for growth capital. When Setu’s revenue from a particular channel dipped, repayments scaled down automatically — something a fixed EMI would not have allowed. Mariwala has since raised equity; RBF was a bridge, not a permanent structure."),

    pLinkPost("If you are building a D2C brand and weighing capital options early on, the framework in ", [{ text: 'how Indian D2C brands get their first 1,000 customers', slug: 'how-indian-d2c-brands-get-first-1000-customers' }], " explains which growth stage justifies outside capital at all."),

    h2("The CGTMSE Loan: What Most D2C Founders Miss"),

    p("The Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE) is a joint initiative of the Ministry of MSME and SIDBI. It provides collateral-free credit guarantees to lending institutions, which pass on lower rates to MSMEs. In March 2025, the Ministry raised the CGTMSE guarantee limit from ₹5 crore to ₹10 crore, meaningfully expanding eligibility. The guarantee fee was also revised in April 2025: 0.37% annually for loans up to ₹10 lakh, rising to 1.20% for loans between ₹8 and ₹10 crore."),

    p("The effective interest rate on a CGTMSE-backed loan typically runs 10.5–13% per year, depending on the lending institution and your credit history. PSU banks are at the lower end; private sector NBFCs run higher. To access CGTMSE, you need Udyam registration (the replacement for Udyog Aadhaar) and a GST registration of at least 12 months. The application goes through any scheduled commercial bank or NBFC empanelled with CGTMSE — SBI, Canara Bank, and SIDBI’s own direct lending programme are the most common routes for first-time borrowers."),

    quote("CGTMSE raised its guarantee limit to ₹10 crore in March 2025. If you have Udyam registration and 12 months of GST filings, you likely qualify for collateral-free credit at 10.5–13% per year — significantly cheaper than any RBF platform."),

    p("The processing time is the real friction. A CGTMSE-backed term loan takes 3–6 weeks from application to disbursal at most PSU banks. In contrast, GetVantage and Velocity can disburse in 48–72 hours. If you need capital by next Friday for a Diwali inventory order, CGTMSE is not your tool. If you are planning 60 days out, it almost certainly is."),

    pLink("For founders exploring alternative capital structures for D2C brands, the ", [{ text: 'revenue-based financing for D2C brands', slug: 'revenue-based-financing-d2c-brands' }], " idea brief covers the platform landscape and minimum eligibility thresholds in detail."),

    h2("When RBF Makes Sense in 2026"),

    p("Revenue-based financing is not the wrong product. It is the wrong product for specific use cases, and founders who understand this use it well."),

    p("Use RBF when all of the following are true:"),

    li("You need capital within 72 hours and a bank loan timeline is incompatible with the opportunity"),
    li("You have no saleable collateral to hypothecate for a traditional working-capital loan"),
    li("Your gross margins are above 40%, meaning repayment percentages will not destroy your unit economics"),
    li("The capital will be deployed in a cycle shorter than 6 months — peak-season inventory, a marketing campaign with measurable ROAS, or a platform prepayment discount"),
    li("You have already exhausted MUDRA and CGTMSE options, or the timeline constraints rule them out"),

    p("Do not use RBF for:"),

    li("Long-cycle capital deployment like product R&D or team hiring, where returns accrue over 12–24 months"),
    li("Margin-compressed categories (food delivery, commodity FMCG, logistics) where 8–18% monthly revenue withheld would exceed gross margin"),
    li("Evergreen working capital — the rolling repayment structure means costs compound if you keep drawing"),

    p("Inc42 reported in Q3 2024 that D2C startups raised \$595 million across 115 deals — down from \$1.4 billion across 134 deals in 2023. The funding compression is directly pushing founders toward RBF as equity becomes harder to raise. That makes it more important, not less, to run the annualized cost math before committing."),

    pLink("Founders building in the invoice-discounting and supply-chain financing space should also look at the ", [{ text: 'invoice discounting platform for MSMEs', slug: 'invoice-discounting-platform-msmes' }], " idea, which serves a related but structurally different capital gap."),

    h2("What the Platforms Don’t Tell You: Sector Risk"),

    p("Velocity itself laid off 14% of its workforce in 2023, according to Inc42, even while advising D2C brands on capital efficiency. The RBF platforms are not immune to the same market pressures they help their borrowers manage. This has two practical implications: platform risk (a platform that reduces operations may slow your disbursals or change underwriting criteria with little notice) and market-signal risk (if the largest RBF platform is cutting costs, the D2C funding environment they lend into is genuinely under stress)."),

    p("The BNPL and working-capital NBFC sector in India saw significant NPA pressure in FY2024–25, with RBI issuing revised risk-weight guidelines for unsecured consumer and business lending. While RBF platforms are not directly regulated as NBFCs in most cases, the capital they raise from institutional LPs is increasingly subject to the same risk-weighting pressure. Translation: underwriting standards will tighten, ticket sizes may shrink, and founders who have not built a parallel bank relationship will find RBF suddenly unavailable at the exact moment they need it."),

    pLink("For brands in the offline retail and kirana channel that need working capital against trade receivables, the ", [{ text: 'BNPL for kirana and MSME retailers', slug: 'bnpl-kirana-msme-retailers' }], " model addresses a specific receivables gap that RBF does not cover."),

    h2("Step-by-Step: Applying for RBF in India"),

    p("The application process across platforms is broadly similar. Here is what to prepare:"),

    num("Udyam registration certificate (mandatory for any formal debt product in India)"),
    num("Last 12 months of GST returns (GSTR-3B at minimum; platforms pull this via the Account Aggregator framework in most cases)"),
    num("Last 6 months of payment-gateway data — Razorpay, PayU, Cashfree, or direct Shopify payouts"),
    num("Last 6 months of bank statements for the primary operating account"),
    num("Marketplace seller data if applicable: Amazon, Flipkart, or Meesho seller dashboards"),

    p("GetVantage uses a proprietary algorithm to underwrite on revenue consistency, channel diversification, and gross margin. Velocity weights repeat-purchase rate and customer LTV. Recur Club leans heavily on GST return consistency as a proxy for revenue quality. The fastest approvals come from brands with clean GST compliance and no revenue gaps in the trailing 6 months."),

    p("Timeline: GetVantage takes 48–96 hours from complete application to term sheet. Velocity has disbursed in as little as 24 hours for returning borrowers. Recur Club runs 72–120 hours for first-time applicants. Compare this to 15–30 business days for a CGTMSE bank loan."),

    pLinkPost("For a complete picture of all pre-seed and early-growth capital options available to Indian founders, see ", [{ text: 'how to raise your first ₹50 lakh in India', slug: 'how-to-raise-first-50-lakh-pre-seed-india' }], "."),

    h2("The Numbers That Tell You Which Path to Take"),

    p("Before approaching any capital provider, run this three-step calculation:"),

    num("Annualized cost of RBF: flat fee ÷ expected repayment months × 12. A 15% flat fee on a 4-month cycle = 45% annualized."),
    num("CGTMSE equivalent: current rate at your nearest PSU bank (typically 10.5–12.5% per year) + CGTMSE guarantee fee (0.37–1.20% per year). Total: 11–14%."),
    num("The spread: if the RBF annualized cost exceeds your CGTMSE equivalent by more than 15 percentage points, the only justification is speed or collateral absence — not convenience."),

    p("India’s D2C e-commerce market reached \$108.76 billion in 2026 and is projected to grow to \$322.1 billion by 2031 at a 24.3% CAGR, according to Mordor Intelligence. That growth will require capital. The founders who build durable businesses will be the ones who know which capital is expensive and which is cheap — and who match the product to the use case rather than the pitch."),

    pLinkPost("Working-capital cycles and cash-flow traps for Indian SMEs are covered in depth in ", [{ text: 'the working capital trap guide', slug: 'working-capital-trap-india-sme-cash-flow' }], " — essential reading before you take on any form of short-term debt."),

    p("Last updated: November 2026"),

  ],
  faqs: [
    faq(
      "What is the typical interest rate for revenue-based financing in India?",
      "RBF platforms in India charge flat fees of 8–20% per transaction, which translates to 20–38% annualized depending on the repayment cycle. CGTMSE-backed bank loans are significantly cheaper at 10.5–13% per year."
    ),
    faq(
      "Do I need collateral for revenue-based financing?",
      "No. RBF platforms like GetVantage, Velocity, and Recur Club underwrite on revenue data — GST returns, payment-gateway history, and marketplace data — without requiring physical collateral or personal guarantees."
    ),
    faq(
      "What is the minimum revenue to qualify for RBF in India?",
      "GetVantage requires at least \$6,000 (roughly ₹5 lakh) in monthly recurring revenue and 12 months of revenue history. Velocity and Recur Club have lower floors, typically ₹2–3 lakh per month, but require consistent GST filings."
    ),
    faq(
      "Is CGTMSE better than RBF for D2C brands?",
      "CGTMSE is cheaper (10.5–13% per year vs. 20–38% for RBF) but slower (3–6 weeks to disburse vs. 48–72 hours). Use CGTMSE for planned capital needs and RBF only when speed or collateral constraints rule out bank financing."
    ),
    faq(
      "What is Udyam registration and do I need it for RBF?",
      "Udyam is the government MSME registration that replaced Udyog Aadhaar in 2020. It is free, done online at udyamregistration.gov.in, and required for CGTMSE access. Most RBF platforms do not require it but it signals formal business standing."
    ),
    faq(
      "Which RBF platform is best for D2C brands in India in 2026?",
      "GetVantage suits established D2C brands with \$6k+ MRR and multi-channel revenue. Velocity is strong for inventory-heavy apparel and FMCG brands. Recur Club works well for bootstrapped brands with clean GST compliance but limited P&L history."
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
