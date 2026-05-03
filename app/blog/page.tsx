import type { Metadata } from 'next'
import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { POSTS_PAGE_QUERY, POSTS_COUNT_QUERY, POST_TAGS_QUERY } from '@/lib/sanity/queries'
import type { Post } from '@/lib/sanity/types'
import { BLOG_CATEGORIES } from '@/lib/sanity/types'
import BlogCard from '@/components/BlogCard'
import Pagination from '@/components/Pagination'

const POSTS_PER_PAGE = 9

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Guides, market insights, and entrepreneurship articles to help you evaluate and launch your next business idea.',
}

interface PageProps {
  searchParams: Promise<{
    category?: string
    tag?: string
    page?: string
  }>
}

export default async function BlogPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const activeTags = sp.tag ? [sp.tag] : []
  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10))
  const from = (currentPage - 1) * POSTS_PER_PAGE
  const to   = currentPage * POSTS_PER_PAGE - 1

  const filterParams = { category: sp.category ?? '', tags: activeTags }

  const [posts, count, allTags] = await Promise.all([
    client.fetch<Post[]>(POSTS_PAGE_QUERY, { ...filterParams, from, to }, { next: { tags: ['posts'] } }),
    client.fetch<number>(POSTS_COUNT_QUERY, filterParams, { next: { tags: ['posts'] } }),
    client.fetch<string[]>(POST_TAGS_QUERY, {}, { next: { tags: ['posts'] } }),
  ])

  const totalPages = Math.ceil(count / POSTS_PER_PAGE)
  const hasFilters = !!sp.category || !!sp.tag

  function pageUrl(page: number) {
    const params = new URLSearchParams()
    if (sp.category) params.set('category', sp.category)
    if (sp.tag)      params.set('tag',      sp.tag)
    params.set('page', String(page))
    return `/blog?${params.toString()}`
  }

  function catUrl(cat: string) {
    return sp.tag
      ? `/blog?category=${encodeURIComponent(cat)}&tag=${encodeURIComponent(sp.tag)}`
      : `/blog?category=${encodeURIComponent(cat)}`
  }

  function tagUrl(tag: string) {
    if (sp.tag === tag) return sp.category ? `/blog?category=${encodeURIComponent(sp.category)}` : '/blog'
    return sp.category
      ? `/blog?category=${encodeURIComponent(sp.category)}&tag=${encodeURIComponent(tag)}`
      : `/blog?tag=${encodeURIComponent(tag)}`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Blog</h1>
        <p className="mt-2 text-slate-500">
          {count} article{count !== 1 ? 's' : ''} found
          {hasFilters ? ' — filters applied' : ''}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Filters</h2>
              {hasFilters && (
                <Link href="/blog" className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                  Clear all
                </Link>
              )}
            </div>

            {/* Category filter */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Category</p>
              <div className="space-y-1">
                {BLOG_CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={catUrl(cat)}
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
            </div>

            {/* Tag filter */}
            {allTags.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.sort().map((tag) => (
                    <Link
                      key={tag}
                      href={tagUrl(tag)}
                      className={`badge text-xs transition-colors cursor-pointer ${
                        sp.tag === tag
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700'
                      }`}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
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
  )
}
