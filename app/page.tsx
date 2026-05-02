import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { FEATURED_IDEAS_QUERY, RECENT_POSTS_QUERY } from '@/lib/sanity/queries'
import IdeaCard from '@/components/IdeaCard'
import BlogCard from '@/components/BlogCard'
import type { Idea, Post } from '@/lib/sanity/types'

export const revalidate = 3600

export default async function HomePage() {
  const [featuredIdeas, recentPosts] = await Promise.all([
    client.fetch<Idea[]>(FEATURED_IDEAS_QUERY, {}, { next: { tags: ['business-ideas'] } }),
    client.fetch<Post[]>(RECENT_POSTS_QUERY, {}, { next: { tags: ['posts'] } }),
  ])

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <div className="mx-auto max-w-5xl px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your Next Business Idea<br />
            <span className="text-indigo-200">Starts Here</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100">
            Curated, research-backed business ideas with budget estimates, market
            analysis, and step-by-step guidance — filter by what fits you.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/ideas" className="btn-primary bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-3 text-base">
              Browse Ideas
            </Link>
            <Link href="/blog" className="btn-outline border-indigo-300 text-white hover:bg-indigo-700 px-6 py-3 text-base">
              Read the Blog
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <dl className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Business Ideas', value: '100+' },
              { label: 'Industries Covered', value: '10' },
              { label: 'Budget Ranges', value: '5' },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-bold text-indigo-600">{stat.value}</dt>
                <dd className="mt-1 text-sm text-slate-500">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Featured Ideas */}
      {featuredIdeas.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Ideas</h2>
              <p className="mt-1 text-slate-500">Hand-picked, high-potential business opportunities</p>
            </div>
            <Link href="/ideas" className="btn-outline text-sm hidden sm:inline-flex">
              View All →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredIdeas.map((idea) => (
              <IdeaCard key={idea._id} idea={idea} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/ideas" className="btn-outline">View All Ideas →</Link>
          </div>
        </section>
      )}

      {/* Filter CTA */}
      <section className="bg-indigo-50">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Find Ideas That Match Your Profile</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Filter by budget, industry, difficulty level, or topic tags. Every idea includes
            a revenue model, required resources, and market stage.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Under $1K', 'SaaS', 'E-commerce', 'Beginner', 'AI / ML', 'Solo Founder OK'].map((tag) => (
              <span key={tag} className="badge bg-indigo-100 text-indigo-700 text-sm px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
          <Link href="/ideas" className="btn-primary mt-8 inline-flex px-6 py-3 text-base">
            Explore All Ideas
          </Link>
        </div>
      </section>

      {/* Recent Blog Posts */}
      {recentPosts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">From the Blog</h2>
              <p className="mt-1 text-slate-500">Guides, insights, and entrepreneurship deep-dives</p>
            </div>
            <Link href="/blog" className="btn-outline text-sm hidden sm:inline-flex">
              View All →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
