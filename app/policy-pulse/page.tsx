import type { Metadata } from 'next'
import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { POLICY_PULSE_PAGE_QUERY, POLICY_PULSE_COUNT_QUERY } from '@/lib/sanity/queries'
import type { Post } from '@/lib/sanity/types'
import BlogCard from '@/components/BlogCard'
import Pagination from '@/components/Pagination'
import { Ld, breadcrumbSchema } from '@/lib/jsonld'

const POSTS_PER_PAGE = 9
const BASE = 'https://businessideas.live'

export const metadata: Metadata = {
  title: 'Policy Pulse — Government Schemes & Business Opportunities | businessideas.live',
  description:
    'Track new government policies, subsidies, and regulatory changes that create real business opportunities for Indian entrepreneurs.',
  alternates: {
    canonical: `${BASE}/policy-pulse`,
  },
  openGraph: {
    title: 'Policy Pulse — Government Schemes & Business Opportunities',
    description:
      'New government policies creating real business windows right now — subsidies, schemes, and regulatory shifts for Indian entrepreneurs.',
    url: `${BASE}/policy-pulse`,
    siteName: 'businessideas.live',
    type: 'website',
  },
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function PolicyPulsePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10))
  const from = (currentPage - 1) * POSTS_PER_PAGE
  const to   = currentPage * POSTS_PER_PAGE - 1

  const [posts, count] = await Promise.all([
    client.fetch<Post[]>(POLICY_PULSE_PAGE_QUERY, { from, to }, { next: { tags: ['posts'] } }),
    client.fetch<number>(POLICY_PULSE_COUNT_QUERY, {}, { next: { tags: ['posts'] } }),
  ])

  const totalPages = Math.ceil(count / POSTS_PER_PAGE)

  function pageUrl(page: number) {
    return `/policy-pulse?page=${page}`
  }

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: 'https://businessideas.live/' },
    { name: 'Policy Pulse', url: 'https://businessideas.live/policy-pulse' },
  ])

  return (
    <>
    <Ld data={breadcrumb} />
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block h-2 w-2 rounded-full bg-alert" />
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-alert">Policy Pulse</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-ink dark:text-slate-100">News &amp; Articles</h1>
        <p className="mt-2 text-ink-soft dark:text-slate-400">
          Government policies &amp; schemes creating real business opportunities right now
          {count > 0 && <> · <span className="font-medium tabular-nums">{count} article{count !== 1 ? 's' : ''}</span></>}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line dark:border-line-dark py-24 text-center">
          <p className="text-lg font-medium text-ink dark:text-slate-200">No policy articles yet</p>
          <p className="mt-2 text-sm text-ink-soft dark:text-slate-400">Check back soon — we publish policy breakdowns regularly.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} buildUrl={pageUrl} />
        </>
      )}

      {/* CTA strip */}
      <div className="mt-16 rounded-2xl bg-ink-dark text-white px-8 py-10 text-center">
        <h2 className="text-xl font-bold">Don&apos;t miss the next policy window</h2>
        <p className="mt-2 text-sm text-slate-400">
          Get a breakdown of new government schemes and the business opportunities they create — straight to your inbox.
        </p>
        <Link
          href="/subscribe"
          className="mt-6 inline-flex items-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Subscribe free →
        </Link>
      </div>
    </div>
    </>
  )
}
