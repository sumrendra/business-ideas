import type { Metadata } from 'next'
import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { AUTHORED_POSTS_PAGE_QUERY, AUTHORED_POSTS_COUNT_QUERY, AUTHORED_POST_TAGS_QUERY } from '@/lib/sanity/queries'
import type { Post } from '@/lib/sanity/types'
import { BLOG_CATEGORIES } from '@/lib/sanity/types'
import BlogCard from '@/components/BlogCard'
import Pagination from '@/components/Pagination'
import TagFilter from '@/components/TagFilter'
import SortDropdown from '@/components/SortDropdown'
import { Ld, breadcrumbSchema } from '@/lib/jsonld'

const POSTS_PER_PAGE = 6
const BASE = 'https://businessideas.live'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest',   label: 'Newest' },
  { value: 'oldest',   label: 'Oldest' },
  { value: 'shortest', label: 'Quick reads' },
  { value: 'longest',  label: 'Long reads' },
]
const DEFAULT_SORT = 'featured'
const VALID_SORTS = new Set(SORT_OPTIONS.map((o) => o.value))

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const canonical = page > 1 ? `${BASE}/blog?page=${page}` : `${BASE}/blog`
  const isFiltered = !!(sp.category || sp.tag || sp.sort)
  return {
    title: 'Blogs — Startup Guides & Market Insights for Indian Entrepreneurs',
    description:
      'Guides, market insights, and entrepreneurship articles to help you evaluate and launch your next business idea in India.',
    alternates: { canonical },
    robots: isFiltered ? { index: false, follow: true } : undefined,
    openGraph: {
      title: 'Blogs — Startup Guides & Market Insights | businessideas.live',
      description:
        'Actionable guides, Indian market research, and founder stories to help you launch your next business idea.',
      url: canonical,
      siteName: 'businessideas.live',
      images: [{ url: `${BASE}/og-blog.png`, width: 1200, height: 630, alt: 'businessideas.live Blog' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@businessideaslive',
      title: 'Blogs — Startup Guides & Market Insights | businessideas.live',
      description:
        'Actionable guides, Indian market research, and founder stories to help you launch your next business idea.',
      images: [`${BASE}/og-blog.png`],
    },
  }
}

interface PageProps {
  searchParams: Promise<{
    category?: string
    tag?: string
    sort?: string
    page?: string
  }>
}

export default async function BlogPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const activeTags = sp.tag ? [sp.tag] : []
  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10))
  const from = (currentPage - 1) * POSTS_PER_PAGE
  const to   = currentPage * POSTS_PER_PAGE - 1

  const requestedSort = sp.sort ?? DEFAULT_SORT
  const currentSort = VALID_SORTS.has(requestedSort) ? requestedSort : DEFAULT_SORT

  const filterParams = { category: sp.category ?? '', tags: activeTags }

  const [posts, count, allTags] = await Promise.all([
    client.fetch<Post[]>(AUTHORED_POSTS_PAGE_QUERY, { ...filterParams, from, to, sort: currentSort }, { next: { tags: ['posts'] } }),
    client.fetch<number>(AUTHORED_POSTS_COUNT_QUERY, filterParams, { next: { tags: ['posts'] } }),
    client.fetch<string[]>(AUTHORED_POST_TAGS_QUERY, {}, { next: { tags: ['posts'] } }),
  ])

  const totalPages = Math.ceil(count / POSTS_PER_PAGE)
  const hasFilters = !!sp.category || !!sp.tag

  function buildParams(overrides: Record<string, string | null> = {}) {
    const params = new URLSearchParams()
    if (sp.category) params.set('category', sp.category)
    if (sp.tag)      params.set('tag',      sp.tag)
    if (currentSort !== DEFAULT_SORT) params.set('sort', currentSort)
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === null || v === '') params.delete(k)
      else params.set(k, v)
    })
    const qs = params.toString()
    return qs ? `/blog?${qs}` : '/blog'
  }

  function pageUrl(page: number) {
    return buildParams({ page: String(page) })
  }

  function sortUrl(value: string) {
    return buildParams({ sort: value === DEFAULT_SORT ? null : value, page: '1' })
  }

  function catUrl(cat: string) {
    return buildParams({ category: cat, page: '1' })
  }

  function tagUrl(tag: string) {
    if (sp.tag === tag) return buildParams({ tag: null, page: '1' })
    return buildParams({ tag, page: '1' })
  }

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: 'https://businessideas.live/' },
    { name: 'Blogs', url: 'https://businessideas.live/blog' },
  ])

  return (
    <>
    <Ld data={breadcrumb} />
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Blogs</h1>
      </div>

      {/* Results bar + sort */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-800 dark:text-slate-100">{count}</span> article{count !== 1 ? 's' : ''}
          {hasFilters ? ' matching your filters' : ''}
        </p>
        <SortDropdown
          current={currentSort}
          options={SORT_OPTIONS.map((o) => ({ ...o, url: sortUrl(o.value) }))}
        />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Filters</h2>
              {hasFilters && (
                <Link href="/blog" className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                  Clear all
                </Link>
              )}
            </div>

            {/* Category filter */}
            <details open={!!sp.category} className="group border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
              <summary className="flex cursor-pointer items-center justify-between list-none mb-2 select-none">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 group-hover:text-slate-600 transition-colors">Category</span>
                <svg className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="space-y-1">
                {BLOG_CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={catUrl(cat)}
                    rel="nofollow"
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors text-left ${
                      sp.category === cat
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                    {sp.category === cat && <span className="ml-2 text-xs opacity-75">✓</span>}
                  </Link>
                ))}
              </div>
            </details>

            {/* Tag filter */}
            {allTags.length > 0 && (
              <details open={!!sp.tag} className="group border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <summary className="flex cursor-pointer items-center justify-between list-none mb-2 select-none">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 group-hover:text-slate-600 transition-colors">Tags</span>
                  <svg className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <TagFilter allTags={allTags} activeTag={sp.tag} activeCategory={sp.category} />
              </details>
            )}
          </div>
        </aside>

        {/* Posts grid */}
        <div className="flex-1">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-24 text-center">
              <p className="text-lg font-medium text-slate-700">No posts found</p>
              <p className="mt-2 text-sm text-slate-400">Try removing some filters to see more results.</p>
              <Link href="/blog" className="mt-4 btn-outline text-sm">Clear filters</Link>
            </div>
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} buildUrl={pageUrl} />
            </>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
