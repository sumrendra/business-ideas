import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { client } from '@/lib/sanity/client'
import { POST_BY_SLUG_QUERY, POST_SLUGS_QUERY, RELATED_POSTS_QUERY } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import type { Post } from '@/lib/sanity/types'
import ShareButtons from '@/components/ShareButtons'
import ContactUsButton from '@/components/ContactUsButton'

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

  const pageUrl = `https://businessideas.live/blog/${slug}`
  const author = post.author || 'BusinessIdeas.live'

  return (
    <>
      <article className="mx-auto max-w-4xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-indigo-600">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700 line-clamp-1">{post.title}</span>
        </nav>

        {/* Hero: two-column on desktop */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          {/* Left: category, title, meta, share */}
          <div>
            {post.category && (
              <Link
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className="mb-3 inline-block rounded-md bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-700 hover:bg-teal-200 transition-colors"
              >
                {post.category}
              </Link>
            )}

            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              {post.title}
            </h1>

            {/* Date · reading time */}
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              {publishedDate && (
                <time dateTime={post.published_at}>{publishedDate}</time>
              )}
              {post.reading_time && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <polyline points="12,6 12,12 16,14" strokeWidth="2"/>
                    </svg>
                    {post.reading_time} min read
                  </span>
                </>
              )}
            </div>

            {/* Author */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 shrink-0">
                {author.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700">{author}</span>
            </div>

            {/* Share buttons */}
            <ShareButtons title={post.title} url={pageUrl} />
          </div>

          {/* Right: cover image */}
          {coverUrl && (
            <div className="relative h-56 w-full overflow-hidden rounded-2xl sm:h-72 lg:h-64">
              <Image
                src={coverUrl}
                alt={post.cover_image?.alt || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <hr className="my-8 border-slate-100" />

        {/* Excerpt */}
        <p className="text-lg leading-relaxed text-slate-600">{post.excerpt}</p>

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

        {/* Share again at bottom */}
        <div className="mt-10 border-t border-slate-100 pt-6">
          <p className="mb-1 text-sm font-medium text-slate-500">Share this article</p>
          <ShareButtons title={post.title} url={pageUrl} />
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 border-t-2 border-slate-100 pt-10">
            <h2 className="mb-8 text-2xl font-bold uppercase tracking-widest text-amber-700">
              Related Blog
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {relatedPosts.map((related) => {
                const relatedCover = related.cover_image
                  ? urlFor(related.cover_image).width(600).height(380).url()
                  : null
                return (
                  <div key={related._id} className="flex flex-col">
                    {/* Cover image */}
                    <div className="relative h-48 w-full overflow-hidden rounded-sm bg-slate-100">
                      {relatedCover ? (
                        <Image
                          src={relatedCover}
                          alt={related.cover_image?.alt || related.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/>
                            <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5"/>
                            <polyline points="21,15 16,10 5,21" strokeWidth="1.5"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="mt-4 text-base font-semibold leading-snug text-slate-800 line-clamp-2">
                      {related.title}
                    </h3>

                    {/* Read More button */}
                    <div className="mt-4">
                      <Link
                        href={`/blog/${related.slug}`}
                        className="inline-block border border-slate-400 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-700 hover:border-amber-700 hover:text-amber-700 transition-colors"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Back CTA */}
        <div className="mt-12 text-center">
          <Link href="/blog" className="btn-outline">← Back to Blog</Link>
        </div>
      </article>

      {/* Floating Contact Us */}
      <ContactUsButton />
    </>
  )
}
