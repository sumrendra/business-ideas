import type { Metadata } from 'next'
import { client } from '@/lib/sanity/client'
import { IDEAS_QUERY, IDEAS_COUNT_QUERY, IDEA_TAGS_QUERY } from '@/lib/sanity/queries'
import type { Idea } from '@/lib/sanity/types'
import IdeaListCard from '@/components/IdeaListCard'
import FilterSidebar from '@/components/FilterSidebar'
import SearchBox from '@/components/SearchBox'
import SponsoredBanner from '@/components/SponsoredBanner'

export const metadata: Metadata = {
  title: 'Browse Business Ideas in India – Filter by Budget, Sector & Difficulty',
  description:
    'Explore 500+ business ideas in India filtered by investment, category, scalability, and profit potential. Find the right opportunity for you.',
  alternates: { canonical: 'https://businessideas.live/business-ideas' },
  openGraph: {
    title: 'Browse Business Ideas in India – Filter by Budget, Sector & Difficulty',
    description: 'Explore 500+ business ideas filtered by investment, category, scalability, and profit potential.',
    url: 'https://businessideas.live/business-ideas',
    type: 'website',
  },
}

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Business Ideas in India',
  url: 'https://businessideas.live/business-ideas',
  description: 'Explore 500+ business ideas in India filtered by investment, category, scalability, and profit potential.',
  isPartOf: {
    '@type': 'WebSite',
    name: 'BusinessIdeas.live',
    url: 'https://businessideas.live/',
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://businessideas.live/' },
    { '@type': 'ListItem', position: 2, name: 'Business Ideas', item: 'https://businessideas.live/business-ideas' },
  ],
}

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'budget_asc', label: 'Budget ↑' },
  { value: 'budget_desc', label: 'Budget ↓' },
  { value: 'saturation', label: 'Market Stage' },
]

interface PageProps {
  searchParams: Promise<{
    industry?: string
    budget?: string
    saturation?: string
    difficulty?: string
    tags?: string | string[]
    sort?: string
    search?: string
  }>
}

export default async function IdeasPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const activeTags = sp.tags
    ? Array.isArray(sp.tags)
      ? sp.tags
      : [sp.tags]
    : []

  const queryParams = {
    industry:   sp.industry   ?? '',
    budget:     sp.budget     ?? '',
    saturation: sp.saturation ?? '',
    difficulty: sp.difficulty ?? '',
    tags:       activeTags,
    search:     sp.search     ?? '',
  }

  const [ideas, count, allTags] = await Promise.all([
    client.fetch<Idea[]>(IDEAS_QUERY, queryParams, { next: { tags: ['business-ideas'] } }),
    client.fetch<number>(IDEAS_COUNT_QUERY, queryParams, { next: { tags: ['business-ideas'] } }),
    client.fetch<string[]>(IDEA_TAGS_QUERY, {}, { next: { tags: ['business-ideas'] } }),
  ])

  const activeFilters = {
    industry:   sp.industry   ?? '',
    budget:     sp.budget     ?? '',
    saturation: sp.saturation ?? '',
    difficulty: sp.difficulty ?? '',
    tags:       activeTags,
    search:     sp.search     ?? '',
  }

  const currentSort = sp.sort ?? 'popularity'

  function sortUrl(value: string) {
    const params = new URLSearchParams()
    if (activeFilters.industry)   params.set('industry',   activeFilters.industry)
    if (activeFilters.budget)     params.set('budget',     activeFilters.budget)
    if (activeFilters.saturation) params.set('saturation', activeFilters.saturation)
    if (activeFilters.difficulty) params.set('difficulty', activeFilters.difficulty)
    if (activeFilters.search)     params.set('search',     activeFilters.search)
    activeFilters.tags.forEach((t) => params.append('tags', t))
    params.set('sort', value)
    return `/business-ideas?${params.toString()}`
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Banner */}
      <section className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            IDEA LOOKER — Browse 500+ Curated Business Ideas
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Find the right business idea for you</h1>
          <p className="mt-1 text-sm text-slate-500">
            Filter by budget, sector, complexity &amp; market stage · Updated weekly for the Indian market
          </p>
          <div className="mt-4 flex gap-3">
            <SearchBox placeholder="Search by keyword, sector or city..." className="max-w-md flex-1" />
            <a href="/get-funded" className="btn-primary shrink-0 hidden sm:inline-flex">Enquire →</a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Results bar + sort */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-800">{count}</span> ideas matching your filters
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">Sort by:</span>
            {SORT_OPTIONS.map(({ value, label }) => (
              <a
                key={value}
                href={sortUrl(value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  currentSort === value
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700'
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-64 shrink-0">
            <FilterSidebar allTags={allTags} activeFilters={activeFilters} />
          </aside>

          <div className="flex-1 space-y-4">
            {ideas.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-24 text-center">
                <p className="text-lg font-medium text-slate-700">No ideas match your filters</p>
                <p className="mt-2 text-sm text-slate-400">Try removing some filters to see more results.</p>
              </div>
            ) : (
              ideas.map((idea, i) => (
                <div key={idea._id}>
                  <IdeaListCard idea={idea} rank={i + 1} />
                  {(i + 1) % 5 === 0 && (
                    <div className="mt-4">
                      <SponsoredBanner
                        sponsor="HDFC Bank"
                        text="Get a collateral-free business loan up to ₹50L to launch your business"
                        ctaLabel="Apply Now"
                        ctaHref="https://hdfcbank.com"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
