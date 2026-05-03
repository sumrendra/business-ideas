import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { IDEAS_QUERY } from '@/lib/sanity/queries'
import type { Idea } from '@/lib/sanity/types'
import IdeaCard from '@/components/IdeaCard'
import SponsoredBanner from '@/components/SponsoredBanner'
import { LANDING_PAGES, ALL_SLUGS } from './config'

const BASE = 'https://businessideas.live'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const config = LANDING_PAGES[slug]
  if (!config) return {}
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: `${BASE}/blogs/${slug}` },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `${BASE}/blogs/${slug}`,
      type: 'article',
    },
  }
}

export default async function BlogLandingPage({ params }: PageProps) {
  const { slug } = await params
  const config = LANDING_PAGES[slug]
  if (!config) notFound()

  const { filters } = config
  const queryParams = {
    industry:   filters.industry   ?? '',
    budget:     filters.budget     ?? '',
    saturation: filters.saturation ?? '',
    difficulty: filters.difficulty ?? '',
    tags:       filters.tags       ?? [],
    search:     filters.search     ?? '',
  }

  const ideas = await client.fetch<Idea[]>(
    IDEAS_QUERY,
    queryParams,
    { next: { tags: ['business-ideas'] } }
  )

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: config.h1,
    description: config.description,
    url: `${BASE}/blogs/${slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'BusinessIdeas.live',
      url: BASE,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Business Ideas', item: `${BASE}/business-ideas` },
      { '@type': 'ListItem', position: 3, name: config.h1, item: `${BASE}/blogs/${slug}` },
    ],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <nav className="mb-4 text-sm text-indigo-200">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/business-ideas" className="hover:text-white">Business Ideas</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{config.h1}</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {config.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100">
            {config.description}
          </p>
          <div className="mt-6">
            <Link
              href="/business-ideas"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
            >
              Browse All Ideas →
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-base text-slate-600 leading-relaxed">{config.intro}</p>
      </section>

      {/* Ideas grid */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        {ideas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-20 text-center">
            <p className="text-slate-500">No ideas found. Check back soon — we add new ideas weekly.</p>
            <Link href="/business-ideas" className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:underline">
              Browse all ideas →
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-800">{ideas.length}</span> curated ideas
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ideas.map((idea, i) => (
                <div key={idea._id}>
                  <IdeaCard idea={idea} />
                  {(i + 1) % 6 === 0 && i < ideas.length - 1 && (
                    <div className="col-span-full mt-2">
                      <SponsoredBanner
                        sponsor="SBI Bank"
                        text="Need capital to start? Get a collateral-free business loan up to ₹25L"
                        ctaLabel="Apply Now"
                        ctaHref="https://sbi.co.in"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-indigo-50">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-xl font-bold text-slate-900">Ready to start your business journey?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Browse all our curated ideas, filter by budget and sector, and find the perfect fit.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/business-ideas" className="btn-primary">
              Browse All Ideas →
            </Link>
            <Link href="/get-funded" className="btn-outline">
              Explore Funding Options
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
