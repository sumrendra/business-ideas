import type { Metadata } from 'next'
import Link from 'next/link'
import RotatingText from '@/components/RotatingText'
import { client } from '@/lib/sanity/client'
import { FEATURED_IDEAS_QUERY, RECENT_POSTS_QUERY, POLICY_PULSE_QUERY, SECTOR_COUNTS_QUERY } from '@/lib/sanity/queries'
import IdeaCard from '@/components/IdeaCard'
import BlogCard from '@/components/BlogCard'
import HeroSearch from '@/components/HeroSearch'
import TrendingSectors from '@/components/TrendingSectors'
import SponsoredBanner from '@/components/SponsoredBanner'
import PartnersStrip from '@/components/PartnersStrip'
import FaqAccordion from '@/components/FaqAccordion'
import type { Idea, Post } from '@/lib/sanity/types'
import { Ld, faqSchema } from '@/lib/jsonld'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Business Suggestions in India – Low Investment, High Profit & Startup Guides 2026 | Business Ideas',
  description:
    'Discover 300+ business ideas in India with filters by investment, profit, and difficulty. Get cost, setup steps, and funding options to start today. Business ideas for small business. Enquire Today',
  alternates: { canonical: 'https://businessideas.live/' },
  openGraph: {
    title: 'Business Suggestions in India – Low Investment, High Profit & Startup Guides 2026',
    description: 'Discover 300+ business ideas in India with filters by investment, profit, and difficulty.',
    url: 'https://businessideas.live/',
    type: 'website',
  },
}

interface SectorCounts {
  saas: number; ecommerce: number; localServices: number; health: number
  edtech: number; aiml: number; climate: number; fintech: number
}

export default async function HomePage() {
  const [featuredIdeas, recentPosts, policyPosts, sectorCounts] = await Promise.all([
    client.fetch<Idea[]>(FEATURED_IDEAS_QUERY, {}, { next: { tags: ['business-ideas'] } }),
    client.fetch<Post[]>(RECENT_POSTS_QUERY, {}, { next: { tags: ['posts'] } }),
    client.fetch<Post[]>(POLICY_PULSE_QUERY, {}, { next: { tags: ['posts'] } }),
    client.fetch<SectorCounts>(SECTOR_COUNTS_QUERY, {}, { next: { tags: ['business-ideas'] } }),
  ])

  return (
    <>
      <Ld data={faqSchema([
        { q: 'What are the best business ideas in India right now?', a: 'The best business ideas in India in 2026 depend on your budget and skills. Top sectors include SaaS, local services, EdTech, health & wellness, and e-commerce. Browse our curated collection filtered by investment and difficulty.' },
        { q: 'Which business can I start with under ₹1 lakh in India?', a: 'Service businesses like home cleaning, tiffin service, online tutoring, social media management, and content writing can all be started for under ₹1 lakh and generate ₹30,000–₹80,000/month.' },
        { q: 'What are the best business ideas for women in India?', a: 'Women-friendly business ideas in India include home-based tiffin service, online tutoring, beauty services, boutique fashion, digital marketing agency, and handcraft exports — all offering flexibility and profitability.' },
        { q: 'What is the most profitable small business in India?', a: 'High-margin small businesses include digital services (70–85% margin), online education (60–80%), and food delivery/tiffin services (50–65%). The best choice depends on your skills and local market.' },
        { q: 'How do I get funding for a business in India?', a: 'Options include MUDRA Loan (up to ₹10L, no collateral), PMEGP subsidy (15–35% of project cost), Stand-Up India (₹10L–₹1Cr for women/SC/ST), and bank loans backed by CGTMSE guarantee.' },
      ])} />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden mesh-bg">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised px-3 py-1 text-xs font-medium text-ink-soft dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-positive" />
            <span className="tabular-nums">298</span> validated ideas · updated weekly
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink dark:text-slate-100 sm:text-5xl lg:text-6xl">
            Find your next <RotatingText />
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft dark:text-slate-400">
            Real setup costs, unit economics, competitor data and funding routes —
            curated for Indian entrepreneurs.
          </p>
          <div className="mt-8">
            <HeroSearch className="max-w-xl mx-auto" />
          </div>

          {/* IA split: Opportunities vs Insights */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto text-left">
            <Link
              href="/business-ideas"
              className="group rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised p-5 hover:border-brand-600 dark:hover:border-brand-600 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-indigo-400">Opportunities</p>
                  <p className="mt-1 text-base font-semibold text-ink dark:text-slate-100"><span className="tabular-nums">298</span> validated ideas</p>
                  <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">Filter by budget, sector and difficulty</p>
                </div>
                <span className="text-ink-soft group-hover:text-brand-600 transition-colors">→</span>
              </div>
            </Link>
            <Link
              href="/blog"
              className="group rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised p-5 hover:border-brand-600 dark:hover:border-brand-600 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-indigo-400">Insights</p>
                  <p className="mt-1 text-base font-semibold text-ink dark:text-slate-100">News, guides &amp; market analysis</p>
                  <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">Policy moves and what they mean</p>
                </div>
                <span className="text-ink-soft group-hover:text-brand-600 transition-colors">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trending sectors ───────────────────────────────────────────────── */}
      <TrendingSectors counts={sectorCounts} />

      {/* ── Featured opportunities ─────────────────────────────────────────── */}
      {featuredIdeas.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-indigo-400">Opportunities</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-ink dark:text-slate-100">Featured ideas</h2>
            </div>
            <Link href="/business-ideas" className="hidden sm:inline-flex text-sm font-medium text-brand-600 dark:text-indigo-400 hover:underline">
              View all <span className="tabular-nums">298</span> →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredIdeas.slice(0, 3).map((idea) => (
              <IdeaCard key={idea._id} idea={idea} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/business-ideas" className="btn-outline text-sm">View all <span className="tabular-nums">298</span> →</Link>
          </div>
        </section>
      )}

      {/* ── Sponsored ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <SponsoredBanner
          sponsor="SBI Bank"
          text="Need capital to start? Get a collateral-free business loan up to ₹25L"
          ctaLabel="Apply Now"
          ctaHref="https://sbi.co.in"
        />
      </section>

      {/* ── Partners ───────────────────────────────────────────────────────── */}
      <section className="border-y border-line dark:border-line-dark bg-surface-sunk dark:bg-surface-dark">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <PartnersStrip />
        </div>
      </section>

      {/* ── Newsletter strip ───────────────────────────────────────────────── */}
      <section className="bg-indigo-50 dark:bg-indigo-950/40 border-b border-line dark:border-indigo-900/40">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-ink-soft dark:text-slate-300">
          Get <span className="tabular-nums">3</span> new business ideas every week —{' '}
          <Link href="/subscribe" className="font-semibold text-brand-600 dark:text-indigo-400 hover:underline">
            Subscribe free
          </Link>
        </div>
      </section>

      {/* ── Blog ───────────────────────────────────────────────────────────── */}
      {recentPosts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-indigo-400">Blog</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-ink dark:text-slate-100">Latest blogs</h2>
            </div>
            <Link href="/blog" className="hidden sm:inline-flex text-sm font-medium text-brand-600 dark:text-indigo-400 hover:underline">
              View all blogs →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.slice(0, 3).map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/blog" className="btn-outline text-sm">View all blogs →</Link>
          </div>
        </section>
      )}

      {/* ── Policy Pulse (kept dark — already has its own treatment) ───────── */}
      {policyPosts.length > 0 && (
        <section className="bg-slate-950 text-white py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-alert" />
                  <span className="text-xs font-bold uppercase tracking-widest text-alert">Policy Pulse</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Opportunities from the news</h2>
                <p className="mt-1 text-sm text-slate-400">New government policies creating real business windows right now</p>
              </div>
              <Link href="/policy-pulse" className="shrink-0 text-sm font-medium text-indigo-300 hover:text-indigo-200 hover:underline">
                View all →
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {policyPosts.map((post) => {
                const date = post.published_at
                  ? new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : null
                return (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col rounded-xl border border-line-dark bg-surface-dark/60 backdrop-blur-md p-5 hover:border-brand-600 hover:bg-surface-dark-raised/60 transition-colors"
                  >
                    <span className="mb-3 self-start rounded-full bg-alert/10 px-2.5 py-0.5 text-xs font-semibold text-alert">
                      Policy Alert
                    </span>
                    <h3 className="flex-1 text-base font-semibold leading-snug text-slate-100 group-hover:text-white line-clamp-3">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">{post.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-line-dark pt-3">
                      {date && <span className="text-xs text-slate-500 tabular-nums">{date}</span>}
                      {post.reading_time && (
                        <span className="text-xs text-slate-500"><span className="tabular-nums">{post.reading_time}</span> min read</span>
                      )}
                    </div>
                    <span className="mt-3 text-xs font-semibold text-indigo-300 group-hover:underline">
                      Read the opportunity →
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="border-t border-line dark:border-line-dark mesh-bg">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="max-w-3xl">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-indigo-400">FAQ</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-ink dark:text-slate-100">
                Frequently asked questions
              </h2>
              <p className="mt-2 text-sm text-ink-soft dark:text-slate-400">
                Quick answers on starting a business in India — budget, sectors and funding.
              </p>
            </div>
            <FaqAccordion />
          </div>
        </div>
      </section>
    </>
  )
}
