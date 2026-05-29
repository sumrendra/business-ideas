import type { Metadata } from 'next'
import { client } from '@/lib/sanity/client'
import { IDEAS_PAGE_QUERY, IDEAS_COUNT_QUERY, IDEA_TAGS_QUERY } from '@/lib/sanity/queries'
import type { Idea } from '@/lib/sanity/types'
import IdeaListCard from '@/components/IdeaListCard'
import FilterSidebar from '@/components/FilterSidebar'
import HeroSearch from '@/components/HeroSearch'
import SponsoredBanner from '@/components/SponsoredBanner'
import Pagination from '@/components/Pagination'
import SortDropdown from '@/components/SortDropdown'

const IDEAS_PER_PAGE = 5

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Business Ideas in India',
  url: 'https://businessideas.live/business-ideas/',
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
    { '@type': 'ListItem', position: 2, name: 'Business Ideas', item: 'https://businessideas.live/business-ideas/' },
  ],
}

const SORT_OPTIONS = [
  { value: 'featured',    label: 'Featured' },
  { value: 'newest',      label: 'Newest' },
  { value: 'budget_asc',  label: 'Lowest Budget' },
  { value: 'budget_desc', label: 'Highest Budget' },
  { value: 'easiest',     label: 'Easiest first' },
]
const DEFAULT_SORT = 'featured'
const VALID_SORTS = new Set(SORT_OPTIONS.map((o) => o.value))

interface PageProps {
  searchParams: Promise<{
    industry?: string
    budget?: string
    saturation?: string
    difficulty?: string
    tags?: string | string[]
    sort?: string
    search?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams
  const isFiltered = !!(sp.industry || sp.budget || sp.saturation || sp.difficulty || sp.tags || sp.search || sp.sort)
  return {
    title: 'Browse Business Ideas in India – Filter by Budget, Sector & Difficulty',
    description:
      'Explore 500+ business ideas in India filtered by investment, category, scalability, and profit potential. Find the right opportunity for you.',
    alternates: { canonical: 'https://businessideas.live/business-ideas/' },
    robots: isFiltered ? { index: false, follow: true } : undefined,
    openGraph: {
      title: 'Browse Business Ideas in India – Filter by Budget, Sector & Difficulty',
      description: 'Explore 500+ business ideas filtered by investment, category, scalability, and profit potential.',
      url: 'https://businessideas.live/business-ideas/',
      type: 'website',
    },
  }
}

export default async function IdeasPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const activeTags = sp.tags
    ? Array.isArray(sp.tags)
      ? sp.tags
      : [sp.tags]
    : []

  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10))
  const from = (currentPage - 1) * IDEAS_PER_PAGE
  const to   = currentPage * IDEAS_PER_PAGE - 1

  const filterParams = {
    industry:   sp.industry   ?? '',
    budget:     sp.budget     ?? '',
    saturation: sp.saturation ?? '',
    difficulty: sp.difficulty ?? '',
    tags:       activeTags,
    search:     sp.search     ?? '',
  }

  const requestedSort = sp.sort ?? DEFAULT_SORT
  const currentSort = VALID_SORTS.has(requestedSort) ? requestedSort : DEFAULT_SORT

  const [ideas, count, allTags] = await Promise.all([
    client.fetch<Idea[]>(
      IDEAS_PAGE_QUERY,
      { ...filterParams, from, to, sort: currentSort },
      { next: { tags: ['business-ideas'] } },
    ),
    client.fetch<number>(IDEAS_COUNT_QUERY, filterParams, { next: { tags: ['business-ideas'] } }),
    client.fetch<string[]>(IDEA_TAGS_QUERY, {}, { next: { tags: ['business-ideas'] } }),
  ])

  const totalPages = Math.ceil(count / IDEAS_PER_PAGE)

  const activeFilters = {
    industry:   sp.industry   ?? '',
    budget:     sp.budget     ?? '',
    saturation: sp.saturation ?? '',
    difficulty: sp.difficulty ?? '',
    tags:       activeTags,
    search:     sp.search     ?? '',
  }

  function buildParams(overrides: Record<string, string | null> = {}) {
    const params = new URLSearchParams()
    if (activeFilters.industry)   params.set('industry',   activeFilters.industry)
    if (activeFilters.budget)     params.set('budget',     activeFilters.budget)
    if (activeFilters.saturation) params.set('saturation', activeFilters.saturation)
    if (activeFilters.difficulty) params.set('difficulty', activeFilters.difficulty)
    if (activeFilters.search)     params.set('search',     activeFilters.search)
    activeFilters.tags.forEach((t) => params.append('tags', t))
    if (currentSort !== DEFAULT_SORT) params.set('sort', currentSort)
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === null || v === '') params.delete(k)
      else params.set(k, v)
    })
    const qs = params.toString()
    return qs ? `/business-ideas?${qs}` : '/business-ideas'
  }

  function sortUrl(value: string) {
    return buildParams({ sort: value === DEFAULT_SORT ? null : value, page: '1' })
  }

  function pageUrl(page: number) {
    return buildParams({ page: String(page) })
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
      <section className="border-b border-line dark:border-line-dark">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Opportunities — <span className="tabular-nums">298</span> curated business ideas
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-ink dark:text-paper-dark">Find the right business idea for you</h1>
          <p className="mt-2 text-sm text-ink-soft dark:text-paper-dark">
            Filter by budget, sector, complexity &amp; market stage · Updated weekly for the Indian market
          </p>
          <div className="mt-4 flex gap-3">
            <HeroSearch placeholder="Search by keyword, sector or city..." className="max-w-md flex-1" />
            <a href="/get-funded" className="btn-primary shrink-0 hidden sm:inline-flex">Enquire →</a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Results bar + sort */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft dark:text-paper-dark">
            Showing <span className="font-bold tabular-nums text-ink dark:text-paper-dark">{count}</span> ideas matching your filters
          </p>
          <SortDropdown
            current={currentSort}
            options={SORT_OPTIONS.map((o) => ({ ...o, url: sortUrl(o.value) }))}
          />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-64 shrink-0">
            <FilterSidebar allTags={allTags} activeFilters={activeFilters} />
          </aside>

          <div className="flex-1">
            {ideas.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line dark:border-line-dark py-24 text-center">
                <p className="text-lg font-medium text-ink dark:text-paper-dark">No ideas match your filters</p>
                <p className="mt-2 text-sm text-ink-soft dark:text-paper-dark">Try removing some filters to see more results.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {ideas.map((idea, i) => {
                    const globalRank = from + i + 1
                    return (
                      <div key={idea._id}>
                        <IdeaListCard idea={idea} rank={globalRank} />
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
                    )
                  })}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  buildUrl={pageUrl}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
