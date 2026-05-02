import type { Metadata } from 'next'
import { client } from '@/lib/sanity/client'
import { IDEAS_QUERY, IDEA_TAGS_QUERY } from '@/lib/sanity/queries'
import type { Idea } from '@/lib/sanity/types'
import IdeaCard from '@/components/IdeaCard'
import FilterSidebar from '@/components/FilterSidebar'

export const metadata: Metadata = {
  title: 'Browse Business Ideas',
  description:
    'Filter hundreds of curated business ideas by budget, industry, difficulty, stage, and tags to find the perfect opportunity for you.',
}

interface PageProps {
  searchParams: {
    industry?: string
    budget?: string
    stage?: string
    difficulty?: string
    tags?: string | string[]
  }
}

export default async function IdeasPage({ searchParams }: PageProps) {
  const activeTags = searchParams.tags
    ? Array.isArray(searchParams.tags)
      ? searchParams.tags
      : [searchParams.tags]
    : []

  const [ideas, allTags] = await Promise.all([
    client.fetch<Idea[]>(
      IDEAS_QUERY,
      {
        industry:   searchParams.industry   ?? '',
        budget:     searchParams.budget     ?? '',
        stage:      searchParams.stage      ?? '',
        difficulty: searchParams.difficulty ?? '',
        tags:       activeTags,
      },
      { next: { tags: ['business-ideas'] } }
    ),
    client.fetch<string[]>(IDEA_TAGS_QUERY, {}, { next: { tags: ['business-ideas'] } }),
  ])

  const hasFilters =
    !!searchParams.industry ||
    !!searchParams.budget ||
    !!searchParams.stage ||
    !!searchParams.difficulty ||
    activeTags.length > 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Business Ideas</h1>
        <p className="mt-2 text-slate-500">
          {ideas.length} idea{ideas.length !== 1 ? 's' : ''} found
          {hasFilters ? ' — filters applied' : ''}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <FilterSidebar
            allTags={allTags}
            activeFilters={{
              industry:   searchParams.industry   ?? '',
              budget:     searchParams.budget     ?? '',
              stage:      searchParams.stage      ?? '',
              difficulty: searchParams.difficulty ?? '',
              tags:       activeTags,
            }}
          />
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {ideas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-24 text-center">
              <p className="text-lg font-medium text-slate-700">No ideas match your filters</p>
              <p className="mt-2 text-sm text-slate-400">Try removing some filters to see more results.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {ideas.map((idea) => (
                <IdeaCard key={idea._id} idea={idea} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
