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
  query: 'instagram reels social media india creator small business',
  fallbackQueries: ['social media marketing india mobile phone', 'digital marketing india creator video'],
  alt: 'A young Indian entrepreneur filming a short-form product video for social media, with a ring light and branded packaging visible in a home studio setup',
}

// ── Post payload ──────────────────────────────────────────────────────────────

const post = {
  _type: 'post',
  title: 'The 2026 Short-Form Video Playbook for Indian Small Businesses',
  slug: { _type: 'slug', current: 'short-form-video-marketing-india-2026' },
  excerpt: 'In 2026, Instagram organic reach averaged 6.8% for small accounts while Meta CPMs rose 22%. The brands growing are not posting more Reels — they run a three-platform stack: Reels for discovery, YouTube Shorts for search, and WhatsApp Commerce for retention.',
  category: 'Marketing & Growth',
  tags: ['marketing-growth', 'social-media', 'instagram', 'short-form-video', 'entrepreneurship', 'case-studies', 'd2c'],
  reading_time: 17,
  featured: false,
  author: 'BusinessIdeas.live',
  published_at: new Date().toISOString(),
  seo_title: 'Short-Form Video Marketing India 2026: Small Business Guide',
  seo_description: 'Instagram organic reach fell to 6.8% in 2026. Here is the multi-platform short-form video stack Indian small businesses are using to grow without ad spend.',
  body: [
    p('The average Instagram account with fewer than 100,000 followers reached 12% of its audience per post in 2023. By the first quarter of 2026, that number had fallen to 6.8%. If you were posting to 10,000 followers two years ago and averaging 1,200 views, you are now averaging 680 — with the same content quality, the same posting frequency, the same effort.'),
    p('That collapse is not a secret. Marketing researchers have been documenting it for two years. What is still a secret, at least to most Indian small business owners, is that the standard fix — post more Reels — makes the problem worse, not better. More posts mean more competition for the same algorithmic slot, without addressing the underlying shift in how reach is distributed.'),
    p('The businesses getting real returns from short-form video in 2026 are not the ones posting daily on Instagram. They are the ones running a three-platform stack: Reels for social discovery, YouTube Shorts for search-intent traffic, and WhatsApp Commerce for retention. Each platform does a different job. Collapsing all three into one Reels account is why most small brands are grinding hard and growing slowly.'),

    h2("The Organic Reach Collapse Nobody's Talking About"),
    p('Instagram rewrote its Reels ranking algorithm in Q1 2026, and most Indian business owners have not adjusted. The new algorithm scores content on three signals, in weighted order: watch time at 60% of the total ranking score, saves at 20%, and shares to DMs or close friends lists at 10%. Likes — the metric that Indian brands obsess over — barely registers. Comments matter only if they are substantive, not one-word reactions.'),
    p('The practical consequence is brutal for small accounts. Under the old system, a 10,000-follower account could get strong reach if its followers engaged quickly after posting. Under the new system, reach depends on whether non-followers who encounter the content watch it fully, save it, and share it privately. Those signals require the content to be genuinely useful or entertaining to a stranger — not just to an existing community.'),
    p('One founder of a homemade spice brand documented the shift publicly in a WhatsApp group for small food entrepreneurs: her account, which had averaged 2,000 to 3,000 likes per post on an audience of 100,000 followers, dropped to 200 to 300 likes within weeks of the Q1 2026 update — no change in content quality, no drop in posting frequency. Her conclusion was that she was doing something wrong. She was not. The algorithm changed the rules.'),
    p('The average post now reaches 3.5 to 7.6% of followers, down from 10 to 15% in 2020, according to 2026 reach data tracked by Outfame across 50,000 accounts. For a brand that built its organic acquisition model on Reels in 2022 or 2023, that compression represents a 40 to 50% reduction in reach per post with no corresponding reduction in content production cost.'),
    quote('In Q1 2026, Instagram quietly rewrote how Reels are ranked — and most Indian small business owners are still posting with 2024 tactics. Watch time, saves, and DM shares now dominate. Likes do not.'),

    h2('Why You Still Cannot Ignore Short-Form Video'),
    p("India's creator economy crossed $15 billion in 2026 and is projected to reach $61.87 billion by 2033 at a 22.4% annual growth rate. Four-point-four million active professional creators are publishing content on Indian social platforms, with 3.3 to 3.7 million primarily anchored on Instagram. The scale of the audience means the opportunity is real — the question is which platform and which format captures it efficiently for a small business with limited production budget."),
    pLinkPost("India's social commerce market hit $29.27 billion in 2025 and is projected to reach $143.86 billion by 2030 — a 37.5% CAGR that no other retail format matches. Video commerce captured 43% of global social commerce transactions in 2025. We traced the social commerce playbook for tier-2 markets in our ", [{ text: 'Meesho case study', slug: 'meesho-case-study-social-commerce-tier2-india' }], '.'),
    p('Vernacular content changes the equation further. Hindi and regional-language Reels deliver three to five times the engagement of identical English content at the same production cost. A Jaipur jewelry brand that switched its Reels to Rajasthani-inflected Hindi, paired with hyperlocal micro-influencers, reported a 200% increase in sales in the quarter after launch. English is not the language of commerce in tier-2 and tier-3 India — the algorithm rewards content that matches the language in which the viewer actually thinks.'),
    p('Ghar Magic, a D2C household soap brand, reached 25 million combined Reel views in its first eight months through a repeatable formula: show the problem in two seconds, apply the product, show the result. Their website traffic rose 300% in the month their second Reel crossed one million views. The content cost under ₹5,000 to produce. The reach collapse on Instagram does not affect brands doing this well — it punishes brands producing content that looks like advertising instead of content.'),

    h2('The ASCI April 2025 Amendment: Your Legal Minimum'),
    p('In April 2025, ASCI updated its Influencer Advertising in Digital Media Guidelines to tighten disclosure requirements specifically for short-form video formats. The original 2021 rule required #Ad or #Sponsored somewhere in the caption — but on Reels and Shorts, captions are often hidden behind a tap. The April 2025 amendment requires the disclosure label to appear in the first two lines of text or in the first three seconds of the video itself, visible without any interaction.'),
    p('The scale of non-compliance in FY 2024-25 shows why the update was necessary: ASCI flagged 1,015 influencer ads requiring modification, and 76% of India\'s top 100 digital stars failed basic disclosure norms in the same year. These are creators with millions of followers, working with major brands, and still not compliant. For a small business running micro-influencer campaigns, the liability runs both ways — brands and creators share exposure under ASCI rules.'),
    p('The Digital Personal Data Protection Act 2023 adds a second layer. Any Reel that collects a viewer\'s name, phone number, or email through a linked lead form must include clear data consent language. The ubiquitous Indian D2C call-to-action — \'DM me for your free sample\' — falls within DPDPA\'s data collection scope if you save those DMs and use them for follow-up marketing.'),
    p('The compliance minimum is not difficult: use #Ad or Paid Partnership in the first two lines for any content you are paying for. The April 2025 amendment explicitly includes gifted products — a creator who received free samples and posts about them without disclosure is violating the guidelines, even if no cash changed hands. Getting this right before your campaign scales is far cheaper than handling ASCI notices after.'),

    h2('Instagram Reels: What the 2026 Algorithm Actually Rewards'),
    p('Given the new signal weights, the content strategy that works on Instagram in 2026 looks different from 2023. Watch time is the primary driver at 60% of the ranking score. A 30-second Reel that 65% of non-follower viewers watch to completion outperforms a 15-second Reel that gets 200 likes but only a 40% completion rate. This pushes content toward specificity: a step-by-step tutorial for a specific problem outperforms a generic product showcase every time.'),
    p('Saves are the second-ranked signal at 20%. Content that viewers save for later — recipes, how-to guides, pricing comparisons, reference formats — accumulates saves over time and continues earning distribution weeks after posting. A Reel saved 200 times by non-followers sends a stronger quality signal to the algorithm than one liked 2,000 times by existing followers who will never buy.'),
    p("DM and close-friend shares are the third signal. These are the hardest to engineer deliberately, but the pattern is consistent: content that provokes the reaction 'I need to send this to someone specific' earns disproportionate distribution. Highly relatable problems, niche inside jokes specific to an Indian subculture, and deeply useful product demonstrations for a narrow use case all generate DM shares. The Ghar Magic format fits precisely here — 'send this to your mother-in-law' is a DM trigger."),
    pLink('For small businesses building a digital marketing practice from the ground up, the ', [{ text: 'social media scheduling idea for Indian SMBs', slug: 'social-media-scheduling-indian-smbs' }], ' is one of the more accessible service models for managing consistent cross-platform publishing.'),

    h2('YouTube Shorts: The Search-First Discovery Engine'),
    p('YouTube Shorts are distributed differently from Instagram Reels. Instagram distributes content through social signals — it shows your Reel to people algorithmically connected to your followers or to viewers with similar engagement patterns. YouTube Shorts distribution runs through a hybrid of social signals and search intent: a Shorts video titled "How to clean limestone floors without chemicals" will surface in Google Search results for that query months after it was posted.'),
    p('For small businesses with products that solve specific, searchable problems, YouTube Shorts compound in a way Instagram Reels cannot. A mattress brand\'s Reel gets 48 hours of algorithmic distribution before the platform moves on. A mattress brand\'s Shorts video about back pain and mattress firmness earns search traffic indefinitely. The RPM on YouTube Shorts in India ranges from ₹0.67 to ₹4.80 per thousand views for entertainment content, and ₹20 to ₹60 for finance and business content — secondary income for a brand building educational material, not the primary goal.'),
    p("Wakefit, the Bengaluru sleep company co-founded by Ankit Garg and Chaitanya Ramalingegowda, built its social media presence around content that combined humour with sharp brand commentary. A video referencing the viral Zomato 'looking for a candidate' post crossed 10 million views across platforms. Their YouTube library now compounds: how-to sleep content published in 2022 still drives search traffic in 2026 because the queries — 'how to choose mattress firmness India' or 'best pillow for back sleepers' — do not expire the way trending formats do."),
    p("The distinction between trending content (made for today's algorithm) and searchable content (made for a query that will exist for years) is the primary frame every small business should apply when planning their Shorts strategy. Both types can coexist on the same channel. But only searchable content builds a compounding asset. A tutorial on how to use your product correctly, filmed in 60 seconds, is an asset. A Reel riding a trending audio clip is a lottery ticket."),

    h2('WhatsApp Commerce: The Retention Layer Most Brands Skip'),
    p('Instagram and YouTube are discovery platforms. Someone finds your brand, watches a video, maybe follows. Then the algorithm decides whether to show them your next post. A follower who does not engage with your content within 60 to 90 days effectively disappears from your reach — the algorithm de-prioritises inactive connections regardless of follower count.'),
    p('WhatsApp Commerce bypasses this entirely. A broadcast list of 10,000 subscribers sees every message you send. WhatsApp Business API conversion rates in India average 30 to 40% — roughly thirty times the open rate of email marketing. The ONDC (Open Network for Digital Commerce) integration means a small business can now run end-to-end WhatsApp transactions, from product discovery through payment to delivery confirmation, without custom technology.'),
    pLinkPost('We covered the complete WhatsApp Commerce setup — broadcast lists, API access, ONDC integration, and the CTA strategies that convert social followers into subscribers — in our earlier piece on the ', [{ text: 'WhatsApp marketing playbook for Indian small businesses', slug: 'whatsapp-marketing-playbook-india-small-business' }], '. The short version: use Reels and Shorts to get discovered, use WhatsApp to keep the customer.'),
    p('boAt, the Delhi-based audio brand co-founded by Aman Gupta, ran one of the most-discussed Indian marketing campaigns of 2025 by inviting public critics to audit their product quality and debating them openly on social media. The campaign worked not because the Reel itself went viral, but because it gave existing WhatsApp subscribers something worth forwarding to their contacts. The DM shares generated by subscribers created a second wave of organic discovery that paid reach alone could not have produced — which is exactly the 2026 algorithm behaviour that brands need to understand.'),

    h2('Five Indian Brands Getting the Multi-Platform Stack Right'),
    p('Renee Cosmetics, the Mumbai colour cosmetics brand co-founded by Ashutosh Valani and Priyanka Gill, crossed ₹100 crore in revenue by FY25 partly through a deliberate micro-creator strategy. Rather than signing one or two macro-influencers, Renee seeded product with 300 to 500 micro-creators in the 10,000 to 100,000 follower range, each creating authentic Reels for their specific audience. The aggregate reach rivalled a single macro deal at a fraction of the cost, and conversion from micro-creator audiences ran higher because the audience trusted the creator personally rather than recognising a paid endorsement.'),
    pLinkPost('This mirrors the first-thousand-customer playbook documented in our piece on ', [{ text: 'how Indian D2C brands get their first 1,000 customers', slug: 'how-indian-d2c-brands-get-first-1000-customers' }], ' — the micro-creator layer is the equivalent of word-of-mouth at scale, with the ASCI disclosure requirement built in.'),
    p("Kusha Kapila, the Delhi-based content creator and actor, launched Underneat, a women's innerwear brand, after building a 500,000-follower Instagram presence. The sequencing was deliberate: audience first, product second. By the time Underneat launched, Kapila had three years of data on what her followers cared about, what language they used, and what problems they wanted solved. The first Reels for Underneat felt like extensions of her personal content, not brand advertising — because they were."),
    p('Ghar Magic took the opposite approach: no personal brand, pure product demonstration. Their hook was a recurring problem-solution format where each Reel opens on a recognisable household mess, the product is applied, the result is shown. The 18-second runtime was deliberate — long enough to show the result, short enough to guarantee near-complete watch time from non-followers who encounter the video cold. Twenty-five million combined views and a 300% traffic spike without a single paid rupee spent on Meta.'),
    p("Wakefit and boAt represent the mid-to-large end of the same playbook. Wakefit uses topical cultural commentary to earn shares — the Zomato parody works because it is genuinely funny to the target audience regardless of the brand, and the brand just happened to be associated with the laugh. boAt manufactured controversy productively by inviting critics, which generated DM sharing among subscribers. Both tactics earn the DM-share signal that the Q1 2026 algorithm weights at 10% of total ranking score — a small percentage that in practice separates viral from invisible."),
    quote("India's influencer marketing segment hit ₹4,500 crore in 2025 and is headed to ₹5,000 crore by 2027. But 76% of the top 100 Indian digital stars failed ASCI's disclosure norms in the same year. The size of the opportunity and the scale of non-compliance are growing at the same pace."),

    h2('The Meta Ads Trap (and How to Avoid It)'),
    p('Meta ads now account for 52 to 68% of the total paid digital marketing spend for Indian D2C brands. The cost per thousand impressions on Meta rose 22% year-over-year in 2025. This creates a structural problem: as organic reach declines, brands spend more on paid to compensate, which drives up CPMs, which makes organic reach decline further because the algorithm increasingly surfaces content that has already received paid amplification. Small businesses with constrained budgets exit this cycle when their customer acquisition cost crosses their lifetime value.'),
    p("The exit from the Meta ads trap is not to stop running Meta ads. It is to stop treating Meta ads as the only acquisition channel. YouTube Shorts and WhatsApp Commerce are both lower-competition environments in 2026 than Instagram. A Shorts video that ranks for a specific search query delivers impressions at zero marginal cost per view. A WhatsApp broadcast to 5,000 warm subscribers costs approximately ₹500 to send via the Business API and typically generates 1,500 to 2,000 opens — performance that would cost ₹30,000 to 50,000 to replicate through Meta ads at current CPM rates."),
    p("The brands most exposed in 2026 are the ones whose entire growth model is Meta ads plus Reels. When Meta's CPMs rise — which they will — or when the algorithm changes again, these brands have no owned channel. Owned channels like WhatsApp lists, email databases, and YouTube subscriber bases compound over time. Rented channels like Instagram follower counts and Meta ad audiences disappear the moment you stop paying or the platform rewrites its rules."),
    pLink('For brands thinking through the margin implications of rising customer acquisition cost, the ', [{ text: 'organic skincare D2C idea', slug: 'organic-natural-skincare-d2c' }], ' is a useful reference for what sustainable acquisition economics look like in Indian beauty and personal care.'),

    h2('Your 90-Day Short-Form Video Action Plan'),
    p('The shift from an Instagram-only strategy to a multi-platform stack does not require doubling content production. The same core video can be adapted for all three platforms if it is filmed with platform-specific edits in mind from the start.'),
    num('Weeks 1 to 2: Audit your current Reels. For each of the last 20 posts, pull three numbers from Instagram Insights: watch-to-completion rate, saves, and shares via DM. If completion rate is under 60%, the hook is the problem. If save rate is under 1%, the content is not useful enough to return to. If DM shares are near zero, the content is not specific enough to forward. Each problem has a different fix.'),
    num("Weeks 3 to 4: Launch your WhatsApp broadcast list. Add a CTA to every Reel caption — 'DM us SOAP for the ingredient guide' or 'Send us JOIN for weekly home care tips.' For every 100 new followers a Reel brings in, aim to convert 20 to 30 into WhatsApp subscribers. This is the most underinvested channel for Indian D2C brands in 2026."),
    num("Weeks 5 to 6: Start YouTube Shorts for search. Research five to ten questions your customers ask before buying. 'Is handmade soap better than commercial soap?' or 'How do I know which mattress firmness suits me?' are searchable queries with commercial intent. Film 40 to 60-second answers with your product in frame. Title each video as a question, not a brand statement. Optimise the description with the exact search query your customer would type."),
    num('Weeks 7 to 8: Add one micro-creator collaboration. Find three creators in the 10,000 to 50,000 follower range in your product category. Send gifted products with a brief explaining the 18-second problem-solution format. Track the DM shares and saves from their post versus your own. If the creator post outperforms yours by 3x, you have found the format — brief more creators with the same structure and measure compliance with the April 2025 ASCI disclosure requirement.'),
    num('Weeks 9 to 12: Measure and consolidate. Which platform drove the most new WhatsApp subscribers? Which Shorts video is still earning search traffic in week 12? Which Reel format — problem-solution, tutorial, testimonial, or brand commentary — earned the highest DM share rate? Cut what is not working. Double the format that is.'),

    p('The 90-day window is not about going viral. It is about building three assets simultaneously: an audience that discovers you via Reels social distribution, an audience that finds you via YouTube search, and a WhatsApp subscriber list that you own regardless of what Instagram or Google announces next Tuesday.'),
    p("The creator economy in India is too large to ignore and the algorithm is too unpredictable to trust completely. The brands that will still be here in 2030 are the ones building the owned layer now, while short-form video is still cheap to produce and WhatsApp Commerce infrastructure is still less crowded than Meta ads. The Reels you post today are a lottery ticket. The WhatsApp list you build from them is a business asset."),

    p('Last updated: October 2026'),
  ],
  faqs: [
    faq(
      'What is the average organic reach for Instagram Reels in India in 2026?',
      'For accounts under 100,000 followers, average organic reach fell from 12% in 2023 to 6.8% in 2026, according to reach data tracked across 50,000 accounts by Outfame. The Q1 2026 algorithm rewrite shifted ranking weights to watch time (60%), saves (20%), and DM shares (10%), making likes largely irrelevant for distribution.'
    ),
    faq(
      'Do I need to disclose paid partnerships on Instagram Reels under Indian law?',
      "Yes. ASCI's April 2025 amendment to the Influencer Advertising in Digital Media Guidelines requires the disclosure label (#Ad, #Sponsored, or 'Paid Partnership') to appear in the first two lines of the caption or the first three seconds of the video. This includes gifted products — free samples that result in a post require disclosure even without cash payment. In FY 2024-25, 76% of India's top 100 digital stars failed these norms."
    ),
    faq(
      'Is YouTube Shorts or Instagram Reels better for Indian small businesses in 2026?',
      'They serve different purposes in the same stack. Instagram Reels distribute through social signals and are strong for impulse discovery and community building but decay quickly. YouTube Shorts distribute through search intent and compound over time — a tutorial posted today can earn views for years. Most small businesses need both, but should start with whichever format aligns with their product: impulse purchases (food, beauty, accessories) start on Reels; considered purchases (furniture, appliances, supplements) start on Shorts.'
    ),
    faq(
      'How do I build a WhatsApp Commerce subscriber list from my social media following?',
      "Add a specific CTA to every Reel caption: 'DM us [keyword] for [specific value].' Process incoming DMs manually at first, then switch to WhatsApp Business API once your list exceeds 500 subscribers. The ONDC integration enables full commerce transactions — product browsing, payment, and delivery — through WhatsApp without custom technology. Target a 20 to 30% conversion rate from new Reel followers to WhatsApp subscribers."
    ),
    faq(
      'What content format gets the most DM shares on Instagram in 2026?',
      "Content that triggers the 'I need to send this to someone specific' reaction earns the most DM shares — the signal the Q1 2026 algorithm weights at 10% of total ranking score. The formats that consistently generate DM shares in Indian D2C are: relatable household problems shown with a product solution, regional-language content about hyper-specific local situations, and niche how-to content that feels like insider knowledge. Generic product showcases and brand montages generate almost no DM shares."
    ),
    faq(
      'How much does a WhatsApp Business API broadcast cost in India compared to Meta ads?',
      "A WhatsApp Business API broadcast to 5,000 warm subscribers costs approximately ₹500 and typically generates 1,500 to 2,000 opens at a 30 to 40% conversion rate. Achieving equivalent reach through Meta ads at current CPM rates (which rose 22% YoY in 2025) would cost ₹30,000 to ₹50,000 for cold audiences who have not opted in. The comparison is not perfect — a WhatsApp subscriber is a warmer lead — but the cost differential is why retention-focused brands are prioritising list-building over paid amplification."
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
