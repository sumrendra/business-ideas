import type { Metadata } from 'next'
import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { POSTS_PAGE_QUERY, POSTS_COUNT_QUERY } from '@/lib/sanity/queries'
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

  const [posts, count] = await Promise.all([
    client.fetch<Post[]>(POSTS_PAGE_QUERY, { ...filterParams, from, to }, { next: { tags: ['posts'] } }),
    client.fetch<number>(POSTS_COUNT_QUERY, filterParams, { next: { tags: ['posts'] } }),
  ])

  const totalPages = Math.ceil(count / POSTS_PER_PAGE)

  function pageUrl(page: number) {
    const params = new URLSearchParams()
    if (sp.category) params.set('category', sp.category)
    if (sp.tag)      params.set('tag',      sp.tag)
    params.set('page', String(page))
    return `/blog?${params.toString()}`
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Blog</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          Deep dives, market research, and practical guides for aspiring entrepreneurs.
        </p>
      </div>

      {/* Category filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`badge px-3 py-1.5 text-sm font-medium transition-colors ${
            !sp.category
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All
        </Link>
        {BLOG_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/blog?category=${encodeURIComponent(cat)}`}
            className={`badge px-3 py-1.5 text-sm font-medium transition-colors ${
              sp.category === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Active tag pill */}
      {sp.tag && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-slate-500">Filtered by tag:</span>
          <span className="badge bg-indigo-100 text-indigo-700">{sp.tag}</span>
          <Link href="/blog" className="text-sm text-slate-400 hover:text-red-500">
            ✕ Clear
          </Link>
        </div>
      )}

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-24 text-center">
          <p className="text-lg font-medium text-slate-700">No posts found</p>
          <Link href="/blog" className="mt-4 btn-outline text-sm">
            Clear filters
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} buildUrl={pageUrl} />
        </>
      )}
    </div>
  )
}
