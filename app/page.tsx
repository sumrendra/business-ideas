import type { Metadata } from 'next'
import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { FEATURED_IDEAS_QUERY, RECENT_POSTS_QUERY, POLICY_PULSE_QUERY } from '@/lib/sanity/queries'
import IdeaCard from '@/components/IdeaCard'
import BlogCard from '@/components/BlogCard'
import FeaturedBlogCard from '@/components/FeaturedBlogCard'
import SearchBox from '@/components/SearchBox'
import FilterChips from '@/components/FilterChips'
import SponsoredBanner from '@/components/SponsoredBanner'
import PartnersStrip from '@/components/PartnersStrip'
import FaqAccordion from '@/components/FaqAccordion'
import type { Idea, Post } from '@/lib/sanity/types'

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

export default async function HomePage() {
  const [featuredIdeas, recentPosts, policyPosts] = await Promise.all([
    client.fetch<Idea[]>(FEATURED_IDEAS_QUERY, {}, { next: { tags: ['business-ideas'] } }),
    client.fetch<Post[]>(RECENT_POSTS_QUERY, {}, { next: { tags: ['posts'] } }),
    client.fetch<Post[]>(POLICY_PULSE_QUERY, {}, { next: { tags: ['posts'] } }),
  ])

  const [featuredPost, ...otherPosts] = recentPosts

  return (
    <>
      {/* Hero + Search */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find your next business idea
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
            Curated ideas for every budget, skill level, and ambition — built for Indian entrepreneurs
          </p>
          <div className="mt-8">
            <SearchBox className="max-w-xl mx-auto" />
          </div>
        </div>
      </section>

      {/* Filter chip bar */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <FilterChips />
        </div>
      </section>

      {/* Pillar ideas */}
      {featuredIdeas.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredIdeas.slice(0, 3).map((idea) => (
              <IdeaCard key={idea._id} idea={idea} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/business-ideas" className="btn-outline text-sm">
              View All Ideas →
            </Link>
          </div>
        </section>
      )}

      {/* Sponsored banner */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <SponsoredBanner
          sponsor="SBI Bank"
          text="Need capital to start? Get a collateral-free business loan up to ₹25L"
          ctaLabel="Apply Now"
          ctaHref="https://sbi.co.in"
        />
      </section>

      {/* Partners strip */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <PartnersStrip />
        </div>
      </section>

      {/* Newsletter strip */}
      <section className="bg-indigo-50">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-sm text-slate-700">
          🤖 Get 3 new business ideas every week —{' '}
          <Link href="/subscribe" className="font-semibold text-indigo-600 hover:underline">
            Subscribe free
          </Link>
        </div>
      </section>

      {/* Latest from the blog */}
      {recentPosts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Latest from the blog</h2>
            <Link href="/blog" className="text-sm font-medium text-indigo-600 hover:underline hidden sm:inline-flex">
              View all articles →
            </Link>
          </div>

          {/* Featured post — horizontal */}
          {featuredPost && (
            <div className="mb-6">
              <FeaturedBlogCard post={featuredPost} />
            </div>
          )}

          {/* Remaining posts — grid */}
          {otherPosts.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherPosts.slice(0, 3).map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Policy Pulse */}
      {policyPosts.length > 0 && (
        <section className="bg-slate-950 text-white py-14">
          <div className="mx-auto max-w-6xl px-4">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-red-400">Policy Pulse</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Opportunities from the news</h2>
                <p className="mt-1 text-sm text-slate-400">New government policies creating real business windows right now</p>
              </div>
              <Link href="/blog?tag=policy-pulse" className="shrink-0 text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
                View all →
              </Link>
            </div>

            {/* Cards */}
            <div className="grid gap-5 sm:grid-cols-3">
              {policyPosts.map((post) => {
                const date = post.published_at
                  ? new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : null
                return (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-indigo-700 hover:bg-slate-800 transition-all"
                  >
                    {/* Tag pill */}
                    <span className="mb-3 self-start rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                      Policy Alert
                    </span>

                    {/* Title */}
                    <h3 className="flex-1 text-base font-semibold leading-snug text-slate-100 group-hover:text-white line-clamp-3">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">{post.excerpt}</p>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                      {date && <span className="text-xs text-slate-500">{date}</span>}
                      {post.reading_time && (
                        <span className="text-xs text-slate-500">{post.reading_time} min read</span>
                      )}
                    </div>

                    <span className="mt-3 text-xs font-semibold text-indigo-400 group-hover:underline">
                      Read the opportunity →
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Frequently asked questions</h2>
        <FaqAccordion />
      </section>
    </>
  )
}
