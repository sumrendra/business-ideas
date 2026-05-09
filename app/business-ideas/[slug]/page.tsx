import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import {
  IDEA_BY_SLUG_QUERY, IDEA_SLUGS_QUERY, CATEGORY_IDEAS_QUERY,
  RELATED_POSTS_FOR_IDEA_QUERY, PEOPLE_ALSO_VIEWED_QUERY,
  ALL_POSTS_FOR_LINKING_QUERY,
} from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import type { Idea, Post } from '@/lib/sanity/types'
import {
  BUDGET_LABELS, MARKET_SATURATION_LABELS, DIFFICULTY_LABELS,
} from '@/lib/sanity/types'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { injectAutoLinks, buildBlogAutoLinks, AUTO_LINKS } from '@/lib/auto-links'
import DownloadReportButton from '@/components/DownloadReportButtonWrapper'
import IdeaCard from '@/components/IdeaCard'
import TrendsChart from '@/components/TrendsChart'
import TableOfContents, { type TocHeading } from '@/components/TableOfContents'
import Disclaimer from '@/components/Disclaimer'
import ShareButtons from '@/components/ShareButtons'
import FeedbackForm from '@/components/FeedbackForm'
import DPIITLookup from '@/components/DPIITLookup'
import MSMELookup from '@/components/MSMELookup'
import { Ld, breadcrumbSchema, collectionPageSchema, faqSchema } from '@/lib/jsonld'

const BASE = 'https://businessideas.live'

// Maps Sanity industry value → category page slug (for internal linking)
const INDUSTRY_SLUG: Record<string, string> = {
  'SaaS':                    'saas',
  'E-commerce':              'ecommerce',
  'Health & Wellness':       'health',
  'EdTech':                  'edtech',
  'FinTech':                 'fintech',
  'Local Services':          'local-services',
  'Climate / Sustainability':'climate',
  'AI / ML':                 'ai-ml',
}

// ── Programmatic SEO category definitions ─────────────────────────────────────
interface CategoryConfig {
  title: string
  h1: string
  description: string
  intro: string
  industry?: string
  budget?: string
  difficulty?: string
  faqs: { q: string; a: string }[]
  related: string[]   // other category slugs to cross-link
}

const SEO_CATEGORIES: Record<string, CategoryConfig> = {
  'saas': {
    title: 'SaaS Business Ideas in India 2026 | BusinessIdeas.live',
    h1: 'SaaS Business Ideas in India (2026)',
    description: 'Discover profitable SaaS business ideas for the Indian market with real revenue data, setup costs, and step-by-step launch guides.',
    intro: 'India\'s SaaS market is growing at 25% CAGR and is expected to reach $50 billion by 2030. Whether you\'re a developer, domain expert, or operator, there has never been a better time to build a software business for Indian SMEs, enterprises, or consumers.',
    industry: 'SaaS',
    faqs: [
      { q: 'What are the best SaaS business ideas in India?', a: 'Top SaaS ideas in India include GST filing tools, HR management for SMEs, vernacular content platforms, and farm-to-market agri-tech software — all solving uniquely Indian problems with recurring revenue models.' },
      { q: 'How much investment is needed to start a SaaS business in India?', a: 'Most SaaS businesses can be started with ₹2–10 lakh covering cloud hosting, development tools, and initial marketing. Many successful Indian SaaS companies started with under ₹5 lakh.' },
      { q: 'Can a non-technical founder start a SaaS business in India?', a: 'Yes. No-code tools like Bubble, Glide, and Webflow allow non-technical founders to build and launch SaaS products. Alternatively, hiring a technical co-founder or agency is common.' },
    ],
    related: ['ai-ml', 'edtech', 'fintech', 'for-beginners'],
  },
  'ecommerce': {
    title: 'E-commerce Business Ideas in India 2026 | BusinessIdeas.live',
    h1: 'E-commerce Business Ideas in India (2026)',
    description: 'Explore validated e-commerce business ideas for India — from niche D2C brands to marketplace selling, with real margins, setup costs, and launch steps.',
    intro: 'India\'s e-commerce market is projected to reach $300 billion by 2030, driven by 800 million internet users and growing tier-2 and tier-3 city adoption. From selling on Meesho and Amazon to building your own D2C brand, the opportunity is massive.',
    industry: 'E-commerce',
    faqs: [
      { q: 'What are the best e-commerce business ideas in India?', a: 'High-potential e-commerce ideas include D2C ethnic wear, organic food products, regional handicrafts on global marketplaces, and private-label personal care — all with 40–60% gross margins.' },
      { q: 'How do I start an e-commerce business in India with low investment?', a: 'Start by reselling on Meesho or Flipkart with zero inventory (dropshipping model). Then graduate to your own private-label product once you validate demand. Initial investment can be under ₹50,000.' },
      { q: 'Is GST required for e-commerce in India?', a: 'Yes. GST registration is mandatory for all e-commerce sellers in India, regardless of turnover threshold. You\'ll also need a PAN card and bank account.' },
    ],
    related: ['local-services', 'under-1-lakh', 'for-beginners'],
  },
  'health': {
    title: 'Health & Wellness Business Ideas in India 2026 | BusinessIdeas.live',
    h1: 'Health & Wellness Business Ideas in India (2026)',
    description: 'Find profitable health and wellness business ideas in India — from fitness studios to Ayurveda products, online nutrition consulting, and mental health platforms.',
    intro: 'India\'s health and wellness market is a ₹4.5 lakh crore opportunity growing at 12% annually. Post-pandemic health awareness, rising disposable incomes, and digital health adoption have created multiple entry points for entrepreneurs.',
    industry: 'Health & Wellness',
    faqs: [
      { q: 'What are the best health business ideas in India?', a: 'Top health business ideas include home physiotherapy services, Ayurvedic supplement D2C brands, corporate wellness programs, mental health apps in regional languages, and diet consultation services.' },
      { q: 'Do I need a medical degree to start a health business in India?', a: 'Not necessarily. Many health businesses like yoga studios, wellness consulting, supplement sales, and health tech platforms don\'t require medical degrees. However, clinical services do require proper licensing.' },
      { q: 'How profitable is the wellness business in India?', a: 'Wellness businesses typically achieve 40–70% gross margins. A home-based nutrition consulting practice can generate ₹1–3L/month within 6 months with minimal investment.' },
    ],
    related: ['local-services', 'under-1-lakh', 'edtech'],
  },
  'edtech': {
    title: 'EdTech Business Ideas in India 2026 | BusinessIdeas.live',
    h1: 'EdTech Business Ideas in India (2026)',
    description: 'Discover India\'s hottest EdTech business opportunities — from online tutoring platforms to skill development courses, with setup costs and revenue models.',
    intro: 'India has the world\'s largest 5–24 year old population and a $4 billion EdTech market growing at 39% CAGR. With 250 million students and severe shortage of quality teachers in tier-2/3 cities, education businesses have enormous demand.',
    industry: 'EdTech',
    faqs: [
      { q: 'What are the best EdTech business ideas in India?', a: 'High-demand EdTech businesses include UPSC/SSC coaching online, coding bootcamps for rural students, vernacular skill courses, school management SaaS, and exam preparation platforms for competitive exams.' },
      { q: 'How do I start an online tutoring business in India?', a: 'Start by teaching 5–10 students on Zoom or Google Meet. Use Teachable or Thinkific to host recorded courses. Build an audience on YouTube first for free. Initial investment under ₹20,000.' },
      { q: 'Is EdTech profitable in India?', a: 'EdTech has 60–80% gross margins on digital products and 40–60% on live classes. A solo tutor running online classes can earn ₹80,000–₹2L/month with 30–50 students.' },
    ],
    related: ['saas', 'health', 'for-beginners'],
  },
  'fintech': {
    title: 'FinTech Business Ideas in India 2026 | BusinessIdeas.live',
    h1: 'FinTech Business Ideas in India (2026)',
    description: 'Explore India\'s booming FinTech sector — from insurance distribution to credit scoring, micro-investment platforms, and rural banking solutions.',
    intro: 'India processes 40% of global real-time digital payments and has 190 million unbanked adults. The combination of UPI infrastructure, SEBI regulations, and massive underserved population makes FinTech one of the highest-opportunity sectors.',
    industry: 'FinTech',
    faqs: [
      { q: 'What FinTech business can I start in India?', a: 'Accessible FinTech businesses include insurance POSP agency, mutual fund distribution (ARN holder), chartered accountant firm, GST filing service, and financial literacy platform for tier-2 cities.' },
      { q: 'Do I need RBI licence to start a FinTech in India?', a: 'For distribution/advisory businesses like insurance POSP or mutual fund distribution, you need IRDAI or AMFI registration respectively — not an RBI licence. Full payment businesses require separate licensing.' },
      { q: 'How much can I earn from a FinTech business in India?', a: 'A mutual fund distribution business earns 0.5–1% of AUM annually. With ₹10 crore in AUM, that\'s ₹5–10L/year in passive income. Building to that level typically takes 2–3 years.' },
    ],
    related: ['saas', 'for-beginners', 'medium-investment'],
  },
  'local-services': {
    title: 'Local Services Business Ideas in India 2026 | BusinessIdeas.live',
    h1: 'Local Services Business Ideas in India (2026)',
    description: 'Find the best local services business ideas in India — from home maintenance to food delivery, event management, and hyperlocal delivery businesses.',
    intro: 'Service businesses are the fastest path to cash in India. With no inventory risk, minimal capital, and immediate local demand, a skilled service provider can be profitable within weeks. India\'s service sector accounts for 55% of GDP and continues to grow.',
    industry: 'Local Services',
    faqs: [
      { q: 'What are the best local service businesses in India?', a: 'Top local service businesses include home cleaning services, tiffin/meal subscription, AC and appliance repair, event photography, pet care, and beauty services — all with quick payback periods.' },
      { q: 'Can I run a local services business without office space?', a: 'Yes. Most local service businesses are operated from home. You go to the customer. Initial setup costs can be under ₹50,000 for tools and marketing.' },
      { q: 'How do I get first customers for my local service business?', a: 'List on JustDial, Urban Company, Sulekha, and local Facebook groups. Offer a discounted trial for first 5 customers and ask for reviews. Word of mouth builds fast in local markets.' },
    ],
    related: ['under-1-lakh', 'for-beginners', 'health'],
  },
  'climate': {
    title: 'Sustainable Business Ideas in India 2026 | BusinessIdeas.live',
    h1: 'Climate & Sustainability Business Ideas in India (2026)',
    description: 'Discover green business opportunities in India — from solar installation to EV charging, waste management, organic farming, and sustainable packaging.',
    intro: 'India has committed to net-zero by 2070 and is the world\'s third largest renewable energy market. Government subsidies, rising energy costs, and corporate ESG mandates have created a massive window for sustainability entrepreneurs.',
    industry: 'Climate / Sustainability',
    faqs: [
      { q: 'What are the best green business ideas in India?', a: 'Top sustainability businesses include solar panel installation, EV charging station, organic vermicompost, e-waste recycling, sustainable packaging supply, and carbon credit consultancy.' },
      { q: 'Are there government subsidies for green businesses in India?', a: 'Yes. PM Surya Ghar offers ₹75,000 crore in subsidies for solar, PM E-DRIVE provides 70–80% subsidy for EV charging, and PMEGP gives 15–35% subsidies for green manufacturing units.' },
      { q: 'Is solar installation a profitable business in India?', a: 'Solar installation earns 20–30% on hardware and 60–70% on Annual Maintenance Contracts. A 3-person team can install 2–3 systems per month, generating ₹1.5–3L/month gross.' },
    ],
    related: ['local-services', 'medium-investment', 'for-beginners'],
  },
  'ai-ml': {
    title: 'AI Business Ideas in India 2026 | BusinessIdeas.live',
    h1: 'AI & Machine Learning Business Ideas in India (2026)',
    description: 'Explore profitable AI business ideas for India — from building AI agents for SMEs to computer vision, vernacular NLP tools, and AI consulting services.',
    intro: 'India has 5 million AI/ML professionals — the second largest talent pool globally — yet 90% of Indian SMEs haven\'t adopted any AI tools. This gap between talent availability and business adoption represents one of the biggest entrepreneurial opportunities of the decade.',
    industry: 'AI / ML',
    faqs: [
      { q: 'What AI business can I start in India?', a: 'Practical AI businesses include AI chatbot setup for Indian SMEs, invoice and document digitisation for CA firms, AI-powered call center tools, vernacular voice assistants, and WhatsApp automation for local businesses.' },
      { q: 'Do I need to know coding to start an AI business?', a: 'Not necessarily. Many AI tools like ChatGPT, Claude, and Zapier allow non-coders to build AI workflows and sell them as services. Technical knowledge helps but isn\'t a prerequisite.' },
      { q: 'How much can an AI consultant earn in India?', a: 'AI consultants in India charge ₹50,000–₹2L per project and ₹1–3L/month on retainer. Enterprise AI projects can be worth ₹20–50L. Demand is outpacing supply significantly.' },
    ],
    related: ['saas', 'edtech', 'medium-investment'],
  },
  'under-1-lakh': {
    title: 'Business Ideas Under 1 Lakh in India 2026 | BusinessIdeas.live',
    h1: 'Business Ideas Under ₹1 Lakh in India (2026)',
    description: 'Start a business in India with under ₹1 lakh. Discover low investment business ideas with high returns — vetted with real setup costs and earning potential.',
    intro: 'You don\'t need a large budget to start a successful business in India. These ideas have been validated with real setup costs under ₹1 lakh (₹100,000) and can generate sustainable income within 3–6 months of starting.',
    budget: 'under_1l',
    faqs: [
      { q: 'Which business can I start in India with ₹50,000 or less?', a: 'Service businesses like home cleaning, tiffin service, tutoring, freelance content writing, and social media management can all be started for under ₹50,000. These require skills and time more than capital.' },
      { q: 'What is the most profitable business under 1 lakh in India?', a: 'High-ROI businesses under ₹1L include online tutoring (90%+ margin), social media management (85% margin), and home-based tiffin service (60–70% margin). All can generate ₹30,000–₹1L/month.' },
      { q: 'Can I start a business at home with under ₹1 lakh?', a: 'Yes. Home-based businesses like meal prep, handicrafts, beauty services, online coaching, and reselling on Meesho can all be started from home with under ₹1 lakh in investment.' },
    ],
    related: ['for-beginners', 'local-services', 'ecommerce'],
  },
  'low-investment': {
    title: 'Low Investment Business Ideas India 2026 (₹1L–₹10L) | BusinessIdeas.live',
    h1: 'Low Investment Business Ideas in India ₹1L–₹10L (2026)',
    description: 'Discover business ideas in India requiring ₹1 lakh to ₹10 lakh. Validated with real financials, break-even timelines, and growth roadmaps.',
    intro: 'The ₹1L–₹10L investment bracket is the sweet spot for first-time Indian entrepreneurs — enough capital to build a real operation, but small enough to validate before committing more. These businesses can achieve break-even in 3–8 months.',
    budget: '1l_10l',
    faqs: [
      { q: 'What business can I start with ₹5 lakh in India?', a: 'With ₹5 lakh, you can start a small food manufacturing unit, an educational franchise, a digital marketing agency, a mobile repair shop, or a small clothing brand. Many achieve ROI within 12–18 months.' },
      { q: 'Which low investment business is most profitable in India?', a: 'Digital services (marketing agencies, freelancing), education, and food service businesses consistently deliver the highest ROI per rupee invested, with gross margins of 50–80%.' },
      { q: 'How do I fund a ₹5–10 lakh business in India?', a: 'Options include personal savings, family, MUDRA Loan (collateral-free up to ₹10L), PMEGP subsidy (15–35% of project cost), or a small personal loan. Most lenders require a simple business plan.' },
    ],
    related: ['under-1-lakh', 'local-services', 'ecommerce'],
  },
  'medium-investment': {
    title: 'Business Ideas ₹10L–₹50L Investment India 2026 | BusinessIdeas.live',
    h1: 'Business Ideas Requiring ₹10 Lakh–₹50 Lakh Investment (India 2026)',
    description: 'Explore serious business opportunities in India for ₹10–50 lakh investment — manufacturing, tech, services, and retail with detailed financial breakdowns.',
    intro: 'Businesses in the ₹10–50 lakh bracket can build real defensible operations with systems, staff, and brand presence. These are typically the entry point for scalable businesses that can grow to crores in revenue.',
    budget: '10l_50l',
    faqs: [
      { q: 'What business can I start with ₹20 lakh in India?', a: 'With ₹20 lakh, you can open a cloud kitchen, start a solar installation business, launch a franchise outlet, set up a small manufacturing unit, or build a tech product (SaaS/app). Break-even is typically 12–24 months.' },
      { q: 'How do I get funding for a ₹10–50 lakh business in India?', a: 'CGTMSE provides collateral-free bank loans up to ₹2Cr. MUDRA Tarun covers up to ₹10L. Angel investors and seed funds are options for tech businesses. Stand-Up India offers ₹10L–₹1Cr for SC/ST and women.' },
      { q: 'Is ₹50 lakh enough to start a manufacturing business in India?', a: 'Yes for small-scale manufacturing. PMEGP supports projects up to ₹50L in manufacturing with 15–35% subsidy. Sectors like food processing, garments, and home products are well-suited to this budget.' },
    ],
    related: ['low-investment', 'climate', 'fintech'],
  },
  'for-beginners': {
    title: 'Business Ideas for Beginners in India 2026 | BusinessIdeas.live',
    h1: 'Business Ideas for Beginners in India (2026)',
    description: 'Start your entrepreneurial journey with these beginner-friendly business ideas in India — no prior experience needed, with step-by-step launch guidance.',
    intro: 'Starting your first business doesn\'t require years of experience. These ideas have been selected for their low learning curve, quick path to first revenue, and forgiving economics — perfect for first-time entrepreneurs in India.',
    difficulty: 'beginner',
    faqs: [
      { q: 'Which is the easiest business to start in India for beginners?', a: 'Easiest businesses for beginners include reselling on Meesho, home tiffin service, tutoring, social media management, and content writing — all require minimal skills and can start generating income within weeks.' },
      { q: 'How do I start a business in India with no experience?', a: 'Start with a service business using skills you already have. Take one small paid project first before scaling. Focus on your first 10 customers before thinking about growth. Fail fast, learn faster.' },
      { q: 'What are good first-time business ideas in India for students?', a: 'Students can start with tutoring, content creation, social media management, photography, or freelance graphic design — all can run alongside college with flexible hours and zero capital investment.' },
    ],
    related: ['under-1-lakh', 'local-services', 'health'],
  },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(IDEA_SLUGS_QUERY)
  return [
    ...slugs.map(({ slug }) => ({ slug })),
    ...Object.keys(SEO_CATEGORIES).map(slug => ({ slug })),
  ]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const cat = SEO_CATEGORIES[slug]
  if (cat) {
    return {
      title: cat.title,
      description: cat.description,
      alternates: { canonical: `${BASE}/business-ideas/${slug}` },
      openGraph: {
        title: cat.h1,
        description: cat.description,
        url: `${BASE}/business-ideas/${slug}`,
        images: [{ url: `${BASE}/og-default.png`, width: 1200, height: 630 }],
      },
      twitter: { card: 'summary_large_image', title: cat.h1, description: cat.description },
    }
  }
  const idea = await client.fetch<Idea | null>(IDEA_BY_SLUG_QUERY, { slug })
  if (!idea) return {}
  return {
    title: idea.seo_title || idea.title,
    description: idea.seo_description || idea.description,
    alternates: { canonical: `${BASE}/business-ideas/${slug}` },
    openGraph: {
      title: idea.seo_title || idea.title,
      description: idea.seo_description || idea.description,
      url: `${BASE}/business-ideas/${slug}`,
      images: idea.cover_image
        ? [{ url: urlFor(idea.cover_image).width(1200).height(630).url(), width: 1200, height: 630 }]
        : [{ url: `${BASE}/og-default.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: idea.seo_title || idea.title,
      description: idea.seo_description || idea.description,
    },
  }
}

const PT_COMPONENTS: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href: string = value?.href ?? '#'
      if (href.startsWith('/') || href.startsWith('#')) {
        return <Link href={href} className="text-indigo-600 dark:text-indigo-400 hover:underline">{children}</Link>
      }
      return <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{children}</a>
    },
  },
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced:     'bg-orange-100 text-orange-700',
  expert:       'bg-red-100 text-red-700',
}

const SATURATION_COLOR: Record<string, string> = {
  concept:     'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400',
  validated:   'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400',
  competitive: 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400',
  proven:      'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400',
}

export default async function IdeaPage({ params }: PageProps) {
  const { slug } = await params

  // ── Category page ──────────────────────────────────────────────────────────
  const cat = SEO_CATEGORIES[slug]
  if (cat) {
    const ideas = await client.fetch<Idea[]>(
      CATEGORY_IDEAS_QUERY,
      { industry: cat.industry ?? '', budget: cat.budget ?? '', difficulty: cat.difficulty ?? '' },
      { next: { tags: ['business-ideas'] } }
    )

    const breadcrumb = breadcrumbSchema([
      { name: 'Home', url: BASE },
      { name: 'Business Ideas', url: `${BASE}/business-ideas` },
      { name: cat.h1, url: `${BASE}/business-ideas/${slug}` },
    ])
    const collection = collectionPageSchema({
      title: cat.h1, description: cat.description,
      url: `${BASE}/business-ideas/${slug}`,
      items: ideas.map(i => ({ name: i.title, url: `${BASE}/business-ideas/${i.slug}` })),
    })
    const faq = faqSchema(cat.faqs)

    return (
      <>
        <Ld data={breadcrumb} />
        <Ld data={collection} />
        <Ld data={faq} />

        <div className="mx-auto max-w-6xl px-4 py-12">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/business-ideas" className="hover:text-indigo-600 dark:hover:text-indigo-400">Business Ideas</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700 dark:text-slate-300">{cat.h1}</span>
          </nav>

          {/* Header */}
          <header className="mb-10 max-w-3xl">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">{cat.h1}</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{cat.intro}</p>
            <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">{ideas.length} validated ideas</p>
          </header>

          {/* Ideas grid */}
          {ideas.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ideas.map(idea => <IdeaCard key={idea._id} idea={idea} />)}
            </div>
          ) : (
            <p className="text-slate-400 py-12 text-center">More ideas in this category coming soon.</p>
          )}

          {/* Cross-links to other categories */}
          {cat.related.length > 0 && (
            <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-10">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Browse More Categories</p>
              <div className="flex flex-wrap gap-3">
                {cat.related.map(r => {
                  const rc = SEO_CATEGORIES[r]
                  return rc ? (
                    <Link
                      key={r}
                      href={`/business-ideas/${r}`}
                      className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-700 dark:hover:border-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      {rc.h1.replace(' (2026)', '')}
                    </Link>
                  ) : null
                })}
                <Link
                  href="/business-ideas"
                  className="rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                >
                  View All Ideas →
                </Link>
              </div>
            </div>
          )}

          {/* FAQ */}
          <section className="mt-16 max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {cat.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-md overflow-hidden open:bg-white dark:open:bg-slate-900 transition-colors"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 marker:content-none hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <span>{faq.q}</span>
                    <svg
                      className="shrink-0 h-5 w-5 text-slate-400 dark:text-slate-500 transition-transform group-open:rotate-180"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="px-5 pb-5 pt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </>
    )
  }

  // ── Individual idea page ───────────────────────────────────────────────────
  const idea = await client.fetch<Idea | null>(
    IDEA_BY_SLUG_QUERY,
    { slug },
    { next: { tags: ['business-ideas'] } }
  )

  if (!idea) notFound()

  const [relatedPosts, peopleAlsoViewed, allPostsForLinking] = await Promise.all([
    client.fetch<Post[]>(
      RELATED_POSTS_FOR_IDEA_QUERY,
      { tags: idea.tags ?? [] },
      { next: { tags: ['posts'] } }
    ),
    client.fetch<Idea[]>(
      PEOPLE_ALSO_VIEWED_QUERY,
      { slug, industry: idea.industry ?? '', tags: idea.tags ?? [] },
      { next: { tags: ['business-ideas'] } }
    ),
    client.fetch<{ slug: string; title: string; tags?: string[] }[]>(
      ALL_POSTS_FOR_LINKING_QUERY,
      {},
      { next: { tags: ['posts'] } }
    ),
  ])

  // Combine static auto-links with dynamic blog post links
  const pageAutoLinks = [...AUTO_LINKS, ...buildBlogAutoLinks(allPostsForLinking)]

  // ── Reading time + ToC headings ────────────────────────────────────────────
  const wordCount = countIdeaWords(idea)
  const readingMinutes = Math.max(1, Math.round(wordCount / 230))

  const tocHeadings: TocHeading[] = [
    idea.target_audience && { id: 'who-is-it-for', text: 'Who Is It For?', level: 2 },
    idea.why_it_works && { id: 'what-works', text: 'What Works & Why', level: 2 },
    idea.scope_in_india && { id: 'scope-in-india', text: 'Scope in India', level: 2 },
    idea.things_to_note?.length && { id: 'things-to-note', text: 'Things to Be Mindful Of', level: 2 },
    idea.current_landscape && { id: 'current-landscape', text: 'Current Landscape', level: 2 },
    idea.unit_economics && Object.values(idea.unit_economics).some(Boolean) && { id: 'unit-economics', text: 'Unit Economics', level: 2 },
    { id: 'search-demand', text: 'Search Demand Trend', level: 2 },
    idea.competitors?.length && { id: 'competitors', text: 'Indian Competitors', level: 2 },
    idea.regulatory_table?.length && { id: 'regulatory', text: 'Licenses & Regulations', level: 2 },
    idea.case_study?.founder_name && { id: 'founder-story', text: 'Real Founder Story', level: 2 },
    ((idea.pros?.length ?? 0) > 0 || (idea.cons?.length ?? 0) > 0) && { id: 'pros-cons', text: 'Pros & Cons', level: 2 },
    idea.proof_points?.length && { id: 'proof', text: 'Real-World Proof', level: 2 },
  ].filter(Boolean) as TocHeading[]

  // ── HowTo schema (only when we have an actionable first step + steps) ─────
  const howToSteps: { name: string; text: string }[] = []
  if (idea.first_step) howToSteps.push({ name: 'Validate the idea', text: idea.first_step })
  if (idea.execution_plan?.month_1?.length) {
    idea.execution_plan.month_1.slice(0, 3).forEach((s, i) =>
      howToSteps.push({ name: `Month 1 — Step ${i + 1}`, text: s })
    )
  }
  if (idea.execution_plan?.month_2?.length) {
    idea.execution_plan.month_2.slice(0, 2).forEach((s, i) =>
      howToSteps.push({ name: `Month 2 — Step ${i + 1}`, text: s })
    )
  }
  if (idea.execution_plan?.month_3?.length) {
    idea.execution_plan.month_3.slice(0, 2).forEach((s, i) =>
      howToSteps.push({ name: `Month 3 — Step ${i + 1}`, text: s })
    )
  }

  const howToLd = howToSteps.length >= 2 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to start ${idea.title} in India`,
    description: idea.description,
    ...(idea.setup_cost_range && {
      estimatedCost: { '@type': 'MonetaryAmount', currency: 'INR', value: idea.setup_cost_range },
    }),
    step: howToSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  } : null

  const updatedDate = idea._updatedAt
    ? new Date(idea._updatedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : null
  const publishedDate = idea.published_at
    ? new Date(idea.published_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const coverUrl = idea.cover_image
    ? urlFor(idea.cover_image).width(1200).height(600).url()
    : null

  const hasNewMetrics =
    idea.monthly_revenue_range ||
    idea.time_to_first_revenue ||
    idea.breakeven_timeline ||
    idea.setup_cost_range ||
    idea.gross_margin

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: BASE },
    { name: 'Business Ideas', url: `${BASE}/business-ideas` },
    { name: idea.title, url: `${BASE}/business-ideas/${slug}` },
  ])

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: idea.title,
    description: idea.description,
    url: `${BASE}/business-ideas/${slug}`,
    ...(coverUrl && { image: coverUrl }),
    ...(idea.published_at && { datePublished: idea.published_at }),
    ...(idea._updatedAt && { dateModified: idea._updatedAt }),
    author: { '@type': 'Organization', name: 'BusinessIdeas.live', url: BASE },
    publisher: { '@type': 'Organization', name: 'BusinessIdeas.live', url: BASE, logo: { '@type': 'ImageObject', url: `${BASE}/logo.png` } },
  }

  return (
    <>
      <Ld data={breadcrumb} />
      <Ld data={articleLd} />
      {howToLd && <Ld data={howToLd} />}
    <article className="mx-auto max-w-7xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/business-ideas" className="hover:text-indigo-600 dark:hover:text-indigo-400">Ideas</Link>
        {idea.industry && INDUSTRY_SLUG[idea.industry] && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/business-ideas/${INDUSTRY_SLUG[idea.industry]}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">{idea.industry}</Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="truncate text-slate-700 dark:text-slate-300">{idea.title}</span>
      </nav>

      {/* Cover Image */}
      {coverUrl && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl sm:h-80">
          <Image
            src={coverUrl}
            alt={idea.cover_image?.alt || idea.title}
            fill
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8 max-w-4xl">
        <div className="mb-3 flex flex-wrap gap-2">
          {idea.featured && (
            <span className="badge border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 bg-transparent">Featured</span>
          )}
          {idea.industry && INDUSTRY_SLUG[idea.industry] ? (
            <Link href={`/business-ideas/${INDUSTRY_SLUG[idea.industry]}`} className="badge border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 bg-transparent text-xs hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{idea.industry}</Link>
          ) : (
            <span className="badge border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 bg-transparent text-xs">{idea.industry}</span>
          )}
          {idea.market_saturation && (
            <span className={`badge text-xs border bg-transparent ${SATURATION_COLOR[idea.market_saturation]}`}>
              {MARKET_SATURATION_LABELS[idea.market_saturation] || idea.market_saturation}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">{idea.title}</h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">{idea.description}</p>

        {/* Author + meta + share */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          {/* Author + timestamps */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold select-none">
              BI
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">
                BusinessIdeas.live Research
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                {publishedDate && <time dateTime={idea.published_at}>{publishedDate}</time>}
                {updatedDate && updatedDate !== publishedDate && (
                  <>
                    <span>·</span>
                    <time dateTime={idea._updatedAt}>Updated {updatedDate}</time>
                  </>
                )}
                <span>·</span>
                <span>{readingMinutes} min read</span>
              </div>
            </div>
          </div>

          {/* Share buttons */}
          <ShareButtons
            title={idea.title}
            url={`https://businessideas.live/business-ideas/${idea.slug ?? ''}`}
          />
        </div>
      </header>

      {/* Body area: ToC sidebar + content */}
      <div className="flex gap-10 items-start">
        {tocHeadings.length > 0 && (
          <aside className="hidden xl:block w-56 shrink-0 sticky top-24 self-start">
            <TableOfContents headings={tocHeadings} />
          </aside>
        )}
        <div className="min-w-0 flex-1 max-w-4xl">

      {/* ── At a Glance metrics ─────────────────────────────────────────────── */}
      {hasNewMetrics && (
        <section className="mb-10">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">At a glance</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {idea.monthly_revenue_range && (
              <GlanceCard label="Monthly Revenue" value={idea.monthly_revenue_range} accent="green" />
            )}
            {idea.time_to_first_revenue && (
              <GlanceCard label="Time to First Revenue" value={idea.time_to_first_revenue} accent="blue" />
            )}
            {idea.breakeven_timeline && (
              <GlanceCard label="Break-even" value={idea.breakeven_timeline} accent="amber" />
            )}
            {idea.setup_cost_range && (
              <GlanceCard label="Setup Cost" value={idea.setup_cost_range} accent="slate" />
            )}
            {idea.gross_margin && (
              <GlanceCard label="Gross Margin" value={idea.gross_margin} accent="indigo" />
            )}
            {idea.difficulty_level && (
              <GlanceCard
                label="Difficulty"
                value={DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level}
                accent={idea.difficulty_level === 'beginner' ? 'green' : idea.difficulty_level === 'intermediate' ? 'amber' : 'red'}
              />
            )}
          </div>
        </section>
      )}

      {/* ── Step 1 to Start ──────────────────────────────────────────────────── */}
      {idea.first_step && (
        <div className="mb-10 flex gap-4 rounded-2xl border border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-950/30 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white text-xl font-bold">
            1
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-400 mb-1">Start Here — This Week</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{idea.first_step}</p>
          </div>
        </div>
      )}

      {/* Demand Signal */}
      {idea.demand_signal && (
        <div className="mb-10 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/30 px-5 py-3">
          <span className="text-xs font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">Market Demand Signal</span>
          <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">{idea.demand_signal}</p>
        </div>
      )}

      {/* Revenue model & resources */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2">
        {idea.revenue_model?.length > 0 && (
          <TagGroup label="Revenue Model" items={idea.revenue_model} />
        )}
        {idea.resources_needed?.length > 0 && (
          <TagGroup label="Resources Needed" items={idea.resources_needed} />
        )}
      </div>

      {/* Who Is It For */}
      {idea.target_audience && (
        <Section id="who-is-it-for" title="Who Is It For?">
          <PortableText value={injectAutoLinks(idea.target_audience as unknown[], pageAutoLinks) as Parameters<typeof PortableText>[0]['value']} components={PT_COMPONENTS} />
        </Section>
      )}

      {/* What Works & Why */}
      {idea.why_it_works && (
        <Section id="what-works" title="What Works in This & Why?">
          <PortableText value={injectAutoLinks(idea.why_it_works as unknown[], pageAutoLinks) as Parameters<typeof PortableText>[0]['value']} components={PT_COMPONENTS} />
        </Section>
      )}

      {/* ── Download Report CTA (mid-page) ───────────────────────────────────── */}
      <div className="my-12 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-1">Free Download</p>
            <h3 className="text-xl font-bold">Get the Full Launch Kit for this Idea</h3>
            <p className="mt-1 text-sm text-indigo-200">
              Detailed financial model · Supplier &amp; vendor contacts · 90-day checklist · City-wise demand data
            </p>
          </div>
          <DownloadReportButton idea={idea} />
        </div>
      </div>

      {/* Scope in India */}
      {idea.scope_in_india && (
        <Section id="scope-in-india" title="Scope in India">
          <PortableText value={injectAutoLinks(idea.scope_in_india as unknown[], pageAutoLinks) as Parameters<typeof PortableText>[0]['value']} components={PT_COMPONENTS} />
        </Section>
      )}

      {/* Things to Be Mindful Of */}
      {idea.things_to_note && idea.things_to_note.length > 0 && (
        <Section id="things-to-note" title="Things to Be Mindful Of">
          <ul className="space-y-2">
            {idea.things_to_note.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Current Landscape */}
      {idea.current_landscape && (
        <Section id="current-landscape" title="Current Landscape in India">
          <PortableText value={injectAutoLinks(idea.current_landscape as unknown[], pageAutoLinks) as Parameters<typeof PortableText>[0]['value']} components={PT_COMPONENTS} />
        </Section>
      )}

      {/* ── Unit Economics ─────────────────────────────────────────────────────── */}
      {idea.unit_economics && Object.values(idea.unit_economics).some(Boolean) && (
        <section className="mb-10">
          <h2 id="unit-economics" className="mb-1 text-xl font-bold text-slate-900 dark:text-slate-100 scroll-mt-24">Unit Economics</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Real benchmarks from Indian operators in this space</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Customer Acq. Cost', value: idea.unit_economics.cac,
                tip: 'How much you spend to win one paying customer — ads, commissions, referrals. Lower is better. Aim to recover this within 3–6 months.' },
              { label: 'Lifetime Value', value: idea.unit_economics.ltv,
                tip: 'Total revenue you expect from one customer over their entire relationship with you. Higher LTV = more room to spend on acquisition.' },
              { label: 'LTV : CAC', value: idea.unit_economics.ltv_cac_ratio,
                tip: 'Ratio of lifetime value to acquisition cost. A ratio above 3:1 is healthy; above 5:1 is excellent. Below 1:1 means you\'re losing money on each customer.' },
              { label: 'Avg Order Value', value: idea.unit_economics.avg_order_value,
                tip: 'Average amount a customer spends per transaction. Increasing this (via upsells or bundles) is one of the fastest ways to grow revenue without new customers.' },
              { label: 'Monthly Churn', value: idea.unit_economics.churn_rate,
                tip: 'Percentage of customers who stop paying each month. 2–5% is typical for Indian B2C; under 1% for B2B SaaS. High churn kills growth even with strong acquisition.' },
              { label: 'CAC Payback', value: idea.unit_economics.payback_period,
                tip: 'How long until a customer\'s payments cover what you spent to acquire them. Under 12 months is strong. Shorter payback = faster you can reinvest in growth.' },
            ].filter(r => r.value).map(row => (
              <div key={row.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{row.label}</p>
                  <div className="group relative">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 text-[9px] font-bold text-slate-400 dark:text-slate-500 cursor-default select-none leading-none">i</span>
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-slate-900" />
                      {row.tip}
                    </div>
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{row.value}</p>
              </div>
            ))}
          </div>
          {idea.unit_economics.context && (
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 italic">{idea.unit_economics.context}</p>
          )}
        </section>
      )}

      {/* ── Google Trends ──────────────────────────────────────────────────────── */}
      {(() => {
        const kw = idea.google_trends_keyword || deriveTrendsKeyword(idea.title)
        return (
          <section className="mb-10">
            <h2 id="search-demand" className="mb-1 text-xl font-bold text-slate-900 dark:text-slate-100 scroll-mt-24">Search Demand Trend</h2>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Google Trends — India — past 5 years</p>
            <TrendsChart
              keyword={kw}
              trendsUrl={`https://trends.google.com/trends/explore?q=${encodeURIComponent(kw)}&geo=IN&date=today%205-y`}
            />
          </section>
        )
      })()}

      {/* ── Indian Competitors ─────────────────────────────────────────────────── */}
      {((idea.competitors && idea.competitors.length > 0) || idea.industry) && (
        <section className="mb-10">
          <h2 id="competitors" className="mb-1 text-xl font-bold text-slate-900 dark:text-slate-100 scroll-mt-24">Indian Competitors &amp; Players</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Know your competition before you start</p>

          {idea.competitors && idea.competitors.length > 0 && (
            <>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Key players</p>
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Company</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">City</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Funding</th>
                      <th className="px-4 py-3 text-left">Scale / Revenue Signal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {idea.competitors.map((c) => (
                      <tr key={c._key ?? c.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</div>
                          {c.type && (
                            <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              c.type === 'Funded' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                              c.type === 'Listed' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' :
                              c.type === 'MNC' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                              'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                            }`}>{c.type}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">{c.city || '—'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden md:table-cell">{c.funding_raised || '—'}</td>
                        <td className="px-4 py-3">
                          <p className="text-slate-700 dark:text-slate-300">{c.revenue_signal || c.description || '—'}</p>
                          {c.differentiator && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{c.differentiator}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {idea.industry && (
            <>
              <DPIITLookup industry={idea.industry} ideaTitle={idea.title} />
              <MSMELookup industry={idea.industry} ideaTitle={idea.title} />
            </>
          )}
        </section>
      )}

      {/* ── Regulatory Table ───────────────────────────────────────────────────── */}
      {idea.regulatory_table && idea.regulatory_table.length > 0 && (
        <section className="mb-10">
          <h2 id="regulatory" className="mb-1 text-xl font-bold text-slate-900 dark:text-slate-100 scroll-mt-24">Licenses &amp; Regulatory Requirements</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Exact costs and timelines — not estimates</p>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">License / Registration</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Authority</th>
                  <th className="px-4 py-3 text-left">Cost (₹)</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Time</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Portal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {idea.regulatory_table.map((reg, ri) => (
                  <tr key={reg._key ?? ri} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{reg.name}</div>
                      <span className={`text-xs font-medium ${reg.mandatory ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {reg.mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">{reg.authority || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{reg.cost || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">{reg.processing_time || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden lg:table-cell">{reg.portal || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Case Study ─────────────────────────────────────────────────────────── */}
      {idea.case_study?.founder_name && (
        <section className="mb-10">
          <h2 id="founder-story" className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100 scroll-mt-24">Real Founder Story</h2>
          <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 p-6">
            <div className="mb-4 flex flex-wrap items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                {idea.case_study.founder_name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-base">{idea.case_study.founder_name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {[idea.case_study.business_name, idea.case_study.city, idea.case_study.started_year]
                    .filter(Boolean).join(' · ')}
                </p>
              </div>
              {(idea.case_study.revenue_6m || idea.case_study.revenue_12m) && (
                <div className="ml-auto flex gap-4">
                  {idea.case_study.revenue_6m && (
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Month 6</p>
                      <p className="text-sm font-bold text-green-700 dark:text-green-400">{idea.case_study.revenue_6m}</p>
                    </div>
                  )}
                  {idea.case_study.revenue_12m && (
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Month 12</p>
                      <p className="text-sm font-bold text-green-700 dark:text-green-400">{idea.case_study.revenue_12m}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {idea.case_study.team_size && (
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Team size: {idea.case_study.team_size}</p>
            )}

            {idea.case_study.key_insight && (
              <div className="mb-4 rounded-xl border-l-4 border-indigo-400 bg-white dark:bg-slate-800/60 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-1">What Worked</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{idea.case_study.key_insight}</p>
              </div>
            )}

            {idea.case_study.biggest_mistake && (
              <div className="rounded-xl border-l-4 border-amber-400 bg-white dark:bg-slate-800/60 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">Biggest Mistake</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{idea.case_study.biggest_mistake}</p>
              </div>
            )}

            {idea.case_study.source_url && (
              <a href={idea.case_study.source_url} target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-block text-xs font-medium text-indigo-600 hover:underline">
                Read full story ↗
              </a>
            )}
          </div>
        </section>
      )}

      {/* Licenses Required */}
      {idea.licenses_required && idea.licenses_required.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-100">Licenses &amp; Registrations</h2>
          <div className="flex flex-wrap gap-2">
            {idea.licenses_required.map((lic) => (
              <span key={lic} className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-green-500">✓</span>
                {lic}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Pros & Cons */}
      {((idea.pros && idea.pros.length > 0) || (idea.cons && idea.cons.length > 0)) && (
        <section className="mb-10">
          <h2 id="pros-cons" className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100 scroll-mt-24">Pros &amp; Cons</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {idea.pros && idea.pros.length > 0 && (
              <div className="rounded-xl border border-green-100 dark:border-green-900/60 bg-green-50 dark:bg-green-950/30 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">Pros</p>
                <ul className="space-y-2">
                  {idea.pros.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="mt-0.5 text-green-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {idea.cons && idea.cons.length > 0 && (
              <div className="rounded-xl border border-red-100 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">Cons</p>
                <ul className="space-y-2">
                  {idea.cons.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="mt-0.5 text-red-400">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Proof Points */}
      {idea.proof_points && idea.proof_points.length > 0 && (
        <section className="mt-10 border-t border-slate-100 pt-8">
          <h2 id="proof" className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-100 scroll-mt-24">Real-World Proof</h2>
          <div className="space-y-4">
            {idea.proof_points.map((pp) => (
              <div
                key={pp._key}
                className={`rounded-xl border p-5 ${
                  pp.type === 'Case Study'
                    ? 'border-indigo-100 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/30'
                    : pp.type === 'Government Source'
                    ? 'border-green-100 dark:border-green-900/60 bg-green-50 dark:bg-green-950/30'
                    : 'border-amber-100 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30'
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                    pp.type === 'Case Study'
                      ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300'
                      : pp.type === 'Government Source'
                      ? 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-300'
                      : 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-300'
                  }`}>
                    {pp.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{pp.source}</span>
                  {pp.founder && <span className="text-xs text-slate-500 dark:text-slate-400">· {pp.founder}</span>}
                </div>
                {pp.url ? (
                  <a href={pp.url} target="_blank" rel="noopener noreferrer"
                    className="font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-400 hover:underline leading-snug">
                    {pp.headline} ↗
                  </a>
                ) : (
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{pp.headline}</p>
                )}
                {pp.key_stat && (
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">— {pp.key_stat}</p>
                )}
                {pp.quote && (
                  <blockquote className="mt-2 border-l-2 border-slate-300 dark:border-slate-600 pl-3 text-sm italic text-slate-600 dark:text-slate-400">
                    "{pp.quote}"
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sector cross-link strip */}
      {idea.industry && (
        <div className="mt-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Explore more</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Browse all <span className="text-indigo-600 dark:text-indigo-400">{idea.industry}</span> business ideas
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {INDUSTRY_SLUG[idea.industry] && (
              <Link
                href={`/business-ideas/${INDUSTRY_SLUG[idea.industry]}`}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Browse {idea.industry} ideas →
              </Link>
            )}
            <Link
              href={`/business-ideas?industry=${encodeURIComponent(idea.industry)}`}
              className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-600 px-3.5 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              Filter by industry
            </Link>
          </div>
        </div>
      )}

      {/* Tags */}
      {idea.tags?.length > 0 && (
        <div className="mt-10 border-t border-slate-100 pt-6">
          <p className="mb-2 text-sm font-medium text-slate-500">Tags</p>
          <div className="flex flex-wrap gap-2">
            {idea.tags.map((tag) => (
              <Link
                key={tag}
                href={`/business-ideas?tags=${encodeURIComponent(tag)}`}
                className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      <FeedbackForm ideaSlug={idea.slug ?? ''} ideaTitle={idea.title} />

      {/* Sources & References */}
      <IdeaSources idea={idea} />

      {/* Disclaimer */}
      <Disclaimer className="mt-12" />

      {/* Back CTA */}
      <div className="mt-10 text-center">
        <Link href="/business-ideas" className="btn-outline">
          ← Browse More Ideas
        </Link>
      </div>
        </div>
      </div>

      {/* People Also Viewed */}
      {peopleAlsoViewed.length > 0 && (
        <section className="mt-16 border-t border-slate-100 dark:border-slate-800 pt-12">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">People Also Viewed</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Similar ideas other founders are exploring</p>
            </div>
            {idea.industry && INDUSTRY_SLUG[idea.industry] && (
              <Link
                href={`/business-ideas/${INDUSTRY_SLUG[idea.industry]}`}
                className="hidden sm:inline-flex shrink-0 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                All {idea.industry} ideas →
              </Link>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {peopleAlsoViewed.map(i => <IdeaCard key={i._id} idea={i} />)}
          </div>
          {idea.industry && INDUSTRY_SLUG[idea.industry] && (
            <div className="mt-6 text-center sm:hidden">
              <Link href={`/business-ideas/${INDUSTRY_SLUG[idea.industry]}`} className="btn-outline text-sm">
                All {idea.industry} ideas →
              </Link>
            </div>
          )}
        </section>
      )}
    </article>

    {/* Related blog posts */}
    {relatedPosts.length > 0 && (
      <section className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 py-14">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-xl font-bold text-slate-900 dark:text-slate-100">Guides &amp; Resources</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {relatedPosts.map(post => {
              const imgUrl = post.cover_image
                ? urlFor(post.cover_image).width(600).height(340).url()
                : null
              return (
                <Link key={post._id} href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
                  {imgUrl && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image src={imgUrl} alt={post.cover_image?.alt || post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-1">{post.category}</p>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-indigo-700 transition-colors">{post.title}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    )}
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

const ACCENT_LEFT: Record<string, string> = {
  green:  'border-l-emerald-400',
  blue:   'border-l-blue-400',
  amber:  'border-l-amber-400',
  indigo: 'border-l-indigo-400',
  red:    'border-l-rose-400',
  slate:  'border-l-slate-300 dark:border-l-slate-600',
}

function GlanceCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  const left = ACCENT_LEFT[accent] || ACCENT_LEFT.slate
  return (
    <div className={`rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 border-l-4 ${left} px-4 py-3.5`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">{label}</p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{value}</p>
    </div>
  )
}

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 id={id} className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-100 scroll-mt-24">{title}</h2>
      <div className="prose-content">{children}</div>
    </section>
  )
}

// Extract plain text from a Portable Text array (or pass through plain string)
function deriveTrendsKeyword(title: string): string {
  const noise = /\b(business|india|indian|service|services|platform|startup|company|online|digital|solution|solutions|provider|maker|manufacturing|production|based|driven|enabled|and|the|a|an|in|of|for|with|by)\b/gi
  const cleaned = title.replace(noise, ' ').replace(/\s+/g, ' ').trim()
  const words = cleaned.split(' ').filter(Boolean).slice(0, 4)
  return words.join(' ') || title
}

function ptText(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return ''
  return value
    .map((block: { _type?: string; children?: { text?: string }[] }) => {
      if (block?._type !== 'block') return ''
      return (block.children ?? []).map(c => c?.text ?? '').join(' ')
    })
    .join(' ')
}

function countIdeaWords(idea: Idea): number {
  const parts = [
    idea.description,
    ptText(idea.target_audience),
    ptText(idea.why_it_works),
    ptText(idea.scope_in_india),
    ptText(idea.current_landscape),
    ptText(idea.problem),
    ptText(idea.solution),
    (idea.pros ?? []).join(' '),
    (idea.cons ?? []).join(' '),
    (idea.things_to_note ?? []).join(' '),
    idea.first_step,
    idea.demand_signal,
    idea.unit_economics?.context,
  ].filter(Boolean) as string[]
  const total = parts.join(' ')
  return total ? total.split(/\s+/).filter(Boolean).length : 0
}

function IdeaSources({ idea }: { idea: Idea }) {
  type SourceEntry = { label: string; url?: string; description?: string }
  const sources: SourceEntry[] = []

  // Proof points
  idea.proof_points?.forEach(pp => {
    if (pp.source) sources.push({ label: pp.source, url: pp.url, description: pp.headline })
  })

  // Case study source
  if (idea.case_study?.source_url && idea.case_study?.founder_name) {
    sources.push({ label: `Founder interview — ${idea.case_study.founder_name}`, url: idea.case_study.source_url })
  }

  // Regulatory portals
  idea.regulatory_table?.forEach(reg => {
    if (reg.portal && reg.name) {
      const already = sources.some(s => s.label === reg.portal)
      if (!already) sources.push({ label: reg.authority ?? reg.portal!, description: reg.portal! })
    }
  })

  // Always-present platform sources
  const platform: SourceEntry[] = [
    { label: 'Google Trends', description: 'Search demand index — India, 5-year window' },
    { label: 'DPIIT Startup Recognition Database (Dec 2023)', description: 'Ministry of Commerce & Industry — DPIIT recognised startups' },
    { label: 'MCA21 Company Master Data — data.gov.in', description: 'Ministry of Corporate Affairs — registered MSME companies' },
  ]
  if (idea.unit_economics?.context) {
    platform.unshift({ label: 'Unit Economics', description: idea.unit_economics.context })
  }

  const all = [...sources, ...platform]
  if (all.length === 0) return null

  return (
    <details className="group mt-10 border-t border-slate-100 dark:border-slate-800 pt-6">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors select-none">
        <svg className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        Sources &amp; References
        <span className="ml-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{all.length}</span>
      </summary>

      <ol className="mt-4 space-y-2.5">
        {all.map((src, i) => (
          <li key={i} className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="shrink-0 font-mono text-[11px] text-slate-300 dark:text-slate-600 pt-0.5">[{i + 1}]</span>
            <span>
              {src.url ? (
                <a href={src.url} target="_blank" rel="noopener noreferrer"
                  className="font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">
                  {src.label} ↗
                </a>
              ) : (
                <span className="font-medium text-slate-700 dark:text-slate-300">{src.label}</span>
              )}
              {src.description && (
                <span className="text-slate-400 dark:text-slate-500"> — {src.description}</span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </details>
  )
}

function TagGroup({ label, items }: { label: string; items: string[]; color?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3.5">
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
