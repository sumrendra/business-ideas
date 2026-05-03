import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { client } from '@/lib/sanity/client'
import { POST_BY_SLUG_QUERY, POST_SLUGS_QUERY, RELATED_POSTS_QUERY } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import type { Post } from '@/lib/sanity/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(POST_SLUGS_QUERY)
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await client.fetch<Post | null>(POST_BY_SLUG_QUERY, { slug })
  if (!post) return {}
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: post.cover_image
        ? [urlFor(post.cover_image).width(1200).height(630).url()]
        : [],
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await client.fetch<Post | null>(
    POST_BY_SLUG_QUERY,
    { slug },
    { next: { tags: ['posts'] } }
  )

  if (!post) notFound()

  const relatedPosts = post.category
    ? await client.fetch<Post[]>(
        RELATED_POSTS_QUERY,
        { slug, category: post.category },
        { next: { tags: ['posts'] } }
      )
    : []

  const coverUrl = post.cover_image
    ? urlFor(post.cover_image).width(1200).height(600).url()
    : null

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex min-w-0 items-center gap-1 text-sm text-slate-500">
        <Link href="/" className="shrink-0 hover:text-indigo-600">Home</Link>
        <span className="shrink-0">/</span>
        <Link href="/blog" className="shrink-0 hover:text-indigo-600">Blog</Link>
        <span className="shrink-0">/</span>
        <span className="min-w-0 truncate text-slate-700">{post.title}</span>
      </nav>

      {/* Category, date, reading time */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {post.category && (
          <Link
            href={`/blog?category=${encodeURIComponent(post.category)}`}
            className="badge bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
          >
            {post.category}
          </Link>
        )}
        {publishedDate && (
          <time className="text-sm text-slate-400" dateTime={post.published_at}>
            {publishedDate}
          </time>
        )}
        {post.reading_time && (
          <span className="flex items-center gap-1 text-sm text-slate-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <polyline points="12,6 12,12 16,14" strokeWidth="2"/>
            </svg>
            {post.reading_time} min read
          </span>
        )}
      </div>

      {/* Title & excerpt */}
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl leading-tight">{post.title}</h1>
      <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p>

      {/* Cover image */}
      {coverUrl && (
        <div className="relative mt-8 h-64 w-full overflow-hidden rounded-2xl sm:h-80">
          <Image
            src={coverUrl}
            alt={post.cover_image?.alt || post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Body */}
      {post.body && (
        <div className="prose-content mt-10">
          <PortableText
            value={post.body as Parameters<typeof PortableText>[0]['value']}
            components={{
              types: {
                image: ({ value }) => {
                  if (!value?.asset) return null
                  return (
                    <figure className="my-8">
                      <div className="relative h-64 w-full overflow-hidden rounded-xl sm:h-80">
                        <Image
                          src={urlFor(value).width(800).url()}
                          alt={value.alt || ''}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {value.caption && (
                        <figcaption className="mt-2 text-center text-sm text-slate-400">{value.caption}</figcaption>
                      )}
                    </figure>
                  )
                },
              },
            }}
          />
        </div>
      )}

      {/* FAQs */}
      {post.faqs && post.faqs.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {post.faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-slate-100 bg-slate-50 p-5 open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-slate-800 list-none">
                  {faq.question}
                  <span className="shrink-0 text-slate-400 group-open:rotate-180 transition-transform duration-200">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-slate-600 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="mt-10 border-t border-slate-100 pt-6">
          <p className="mb-2 text-sm font-medium text-slate-500">Tags</p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="badge bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-12 border-t border-slate-100 pt-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Related Articles</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related._id}
                href={`/blog/${related.slug}`}
                className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
              >
                <p className="text-xs font-medium text-indigo-600 mb-1">{related.category}</p>
                <p className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-indigo-700 line-clamp-3">
                  {related.title}
                </p>
                {related.reading_time && (
                  <p className="mt-2 text-xs text-slate-400">{related.reading_time} min read</p>
                )}
                <p className="mt-2 text-xs font-medium text-indigo-500 group-hover:underline">Keep Reading →</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back CTA */}
      <div className="mt-12 text-center">
        <Link href="/blog" className="btn-outline">← Back to Blog</Link>
      </div>
    </article>
  )
}
