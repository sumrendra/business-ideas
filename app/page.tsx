import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { FEATURED_IDEAS_QUERY, RECENT_POSTS_QUERY } from '@/lib/sanity/queries'
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

export default async function HomePage() {
  const [featuredIdeas, recentPosts] = await Promise.all([
    client.fetch<Idea[]>(FEATURED_IDEAS_QUERY, {}, { next: { tags: ['business-ideas'] } }),
    client.fetch<Post[]>(RECENT_POSTS_QUERY, {}, { next: { tags: ['posts'] } }),
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
            <Link href="/ideas" className="btn-outline text-sm">
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

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Frequently asked questions</h2>
        <FaqAccordion />
      </section>
    </>
  )
}
