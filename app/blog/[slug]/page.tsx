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
import TableOfContents, { type TocHeading } from '@/components/TableOfContents'
import IdeaCard from '@/components/IdeaCard'
import { RELATED_IDEAS_FOR_POST_QUERY } from '@/lib/sanity/queries'
import type { Idea } from '@/lib/sanity/types'
import { Ld, articleSchema, breadcrumbSchema, faqSchema } from '@/lib/jsonld'

interface PageProps {
  params: Promise<{ slug: string }>
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function extractHeadings(body: unknown[]): TocHeading[] {
  const headings: TocHeading[] = []
  let h2Count = 0
  for (const block of body as any[]) {
    if (block._type !== 'block') continue
    if (block.style !== 'h2' && block.style !== 'h3') continue
    const text = (block.children ?? []).map((c: any) => c.text ?? '').join('')
    if (!text) continue
    if (block.style === 'h2') h2Count++
    headings.push({ id: slugify(text), text, level: block.style === 'h2' ? 2 : 3 })
  }
  return headings
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(POST_SLUGS_QUERY)
  return slugs.map(({ slug }) => ({ slug }))
}

const BASE = 'https://businessideas.live'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await client.fetch<Post | null>(POST_BY_SLUG_QUERY, { slug })
  if (!post) return {}
  const title = post.seo_title || post.title
  const description = post.seo_description || post.excerpt || ''
  const ogImage = post.cover_image
    ? urlFor(post.cover_image).width(1200).height(630).url()
    : `${BASE}/og-blog.png`
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE}/blog/${slug}`,
      siteName: 'businessideas.live',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: 'article',
      publishedTime: post.published_at,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@businessideaslive',
      title,
      description,
      images: [ogImage],
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

  const [relatedPosts, relatedIdeas] = await Promise.all([
    post.category
      ? client.fetch<Post[]>(RELATED_POSTS_QUERY, { slug, category: post.category }, { next: { tags: ['posts'] } })
      : Promise.resolve([]),
    post.tags?.length
      ? client.fetch<Idea[]>(RELATED_IDEAS_FOR_POST_QUERY, { tags: post.tags }, { next: { tags: ['business-ideas'] } })
      : Promise.resolve([]),
  ])

  const coverUrl = post.cover_image
    ? urlFor(post.cover_image).width(1200).height(600).url()
    : null

  const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : null
  const publishedDate = fmtDate(post.published_at)
  const updatedDate = fmtDate(post._updatedAt)

  const pageUrl = `https://businessideas.live/blog/${slug}`
  const author = post.author || 'BusinessIdeas.live'
  const headings = post.body ? extractHeadings(post.body as unknown[]) : []

  const articleLd = articleSchema({
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    url: pageUrl,
    imageUrl: coverUrl || undefined,
    datePublished: post.published_at,
    dateModified: post._updatedAt,
    author,
  })
  const isPolicyPulse = post.tags?.includes('policy-pulse')
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: 'https://businessideas.live' },
    isPolicyPulse
      ? { name: 'Policy Pulse', url: 'https://businessideas.live/policy-pulse' }
      : { name: 'Blog', url: 'https://businessideas.live/blog' },
    { name: post.title, url: pageUrl },
  ])
  const faqLd = post.faqs?.length ? faqSchema(post.faqs.map(f => ({ q: f.question, a: f.answer }))) : null

  // PortableText heading renderer with anchor IDs
  const headingComponent = (level: 2 | 3) =>
    function HeadingBlock({ children, value }: any) {
      const text = (value?.children ?? []).map((c: any) => c.text ?? '').join('')
      const id = slugify(text)
      const Tag = `h${level}` as 'h2' | 'h3'
      return <Tag id={id}>{children}</Tag>
    }

  return (
    <>
      <Ld data={articleLd} />
      <Ld data={breadcrumb} />
      {faqLd && <Ld data={faqLd} />}
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex min-w-0 items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
          <span className="shrink-0 mx-1">/</span>
          {isPolicyPulse ? (
            <Link href="/policy-pulse" className="shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400">Policy Pulse</Link>
          ) : (
            <Link href="/blog" className="shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400">Blog</Link>
          )}
          {post.category && !isPolicyPulse && (
            <>
              <span className="shrink-0 mx-1">/</span>
              <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400">{post.category}</Link>
            </>
          )}
          <span className="shrink-0 mx-1">/</span>
          <span className="min-w-0 truncate text-slate-700 dark:text-slate-300">{post.title}</span>
        </nav>

        {/* Hero: cover image full-width, then title below */}
        <div className="mb-10">
          {/* Cover image */}
          {coverUrl && (
            <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl sm:h-80 lg:h-96">
              <Image
                src={coverUrl}
                alt={post.cover_image?.alt || post.title}
                fill
                className="object-cover"
                priority
              />
              {isPolicyPulse && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    Policy Pulse
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Category badge (non-policy-pulse) */}
          {post.category && !isPolicyPulse && (
            <Link
              href={`/blog?category=${encodeURIComponent(post.category)}`}
              className="mb-4 inline-block rounded-md bg-teal-100 dark:bg-teal-900/40 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/60 transition-colors"
            >
              {post.category}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900 dark:text-slate-100 sm:text-4xl lg:text-5xl max-w-4xl">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              {/* Author */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-xs font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                  {author.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-300">{author}</span>
              </div>
              {publishedDate && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <time dateTime={post.published_at}>{publishedDate}</time>
                </>
              )}
              {updatedDate && updatedDate !== publishedDate && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <time dateTime={post._updatedAt}>Updated {updatedDate}</time>
                </>
              )}
              {post.reading_time && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
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
            <ShareButtons title={post.title} url={pageUrl} />
          </div>
        </div>

        <hr className="mb-8 border-slate-100 dark:border-slate-800" />

        {/* Body area: TOC sidebar + content */}
        <div className="flex gap-10 items-start">
          {/* Sticky TOC sidebar */}
          {headings.length > 0 && (
            <aside className="hidden xl:block w-56 shrink-0 sticky top-24 self-start">
              <TableOfContents headings={headings} />
            </aside>
          )}

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Excerpt */}
            <p className="text-lg leading-relaxed text-slate-600 mb-10">{post.excerpt}</p>

            {/* Body */}
            {post.body && (
              <div className="prose-content">
                <PortableText
                  value={post.body as Parameters<typeof PortableText>[0]['value']}
                  components={{
                    block: {
                      h2: headingComponent(2),
                      h3: headingComponent(3),
                    },
                    marks: {
                      link: ({ value, children }) => {
                        const href: string = value?.href ?? ''
                        const isInternal =
                          href.startsWith('/') ||
                          href.includes('businessideas.live')
                        const internalHref = isInternal
                          ? href.replace(/^https?:\/\/businessideas\.live/, '')
                          : href
                        if (isInternal) {
                          return (
                            <Link
                              href={internalHref}
                              className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800 transition-colors"
                            >
                              {children}
                            </Link>
                          )
                        }
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800 transition-colors"
                          >
                            {children}
                          </a>
                        )
                      },
                    },
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
                <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {post.faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 open:bg-white dark:open:bg-slate-800 open:shadow-sm transition-all"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-slate-800 dark:text-slate-100 list-none">
                        {faq.question}
                        <span className="shrink-0 text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform duration-200">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
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
              <section className="mt-16 border-t-2 border-slate-200 dark:border-slate-700 pt-10">
                <h2 className="mb-8 text-2xl font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  Related Blog
                </h2>
                <div className="grid gap-8 sm:grid-cols-3">
                  {relatedPosts.map((related) => {
                    const relatedCover = related.cover_image
                      ? urlFor(related.cover_image).width(600).height(380).url()
                      : null
                    return (
                      <div key={related._id} className="flex flex-col">
                        <div className="relative h-48 w-full overflow-hidden rounded-sm bg-slate-100 dark:bg-slate-800">
                          {relatedCover ? (
                            <Image
                              src={relatedCover}
                              alt={related.cover_image?.alt || related.title}
                              fill
                              className="object-cover transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600">
                              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/>
                                <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5"/>
                                <polyline points="21,15 16,10 5,21" strokeWidth="1.5"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <h3 className="mt-4 text-base font-semibold leading-snug text-slate-800 dark:text-slate-100 line-clamp-2">
                          {related.title}
                        </h3>
                        <div className="mt-4">
                          <Link
                            href={`/blog/${related.slug}`}
                            className="inline-block border border-slate-400 dark:border-slate-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:border-amber-600 dark:hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
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

            {/* Related Business Ideas */}
            {relatedIdeas.length > 0 && (
              <section className="mt-16 border-t-2 border-slate-100 pt-10">
                <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">Related Business Ideas</h2>
                <p className="mb-6 text-sm text-slate-500">Ideas you can start based on this article</p>
                <div className="grid gap-5 sm:grid-cols-3">
                  {relatedIdeas.map(idea => <IdeaCard key={idea._id} idea={idea} />)}
                </div>
              </section>
            )}

            {/* Back CTAs */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <Link href="/blog" className="btn-outline">← Back to Blogs</Link>
              <Link href="/business-ideas" className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
                Browse 298 Business Ideas →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Contact Us */}
      <ContactUsButton />
    </>
  )
}
