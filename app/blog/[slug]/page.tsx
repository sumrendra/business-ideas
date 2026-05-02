import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { client } from '@/lib/sanity/client'
import { POST_BY_SLUG_QUERY, POST_SLUGS_QUERY } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import type { Post } from '@/lib/sanity/types'

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(POST_SLUGS_QUERY)
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await client.fetch<Post | null>(POST_BY_SLUG_QUERY, { slug: params.slug })
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
  const post = await client.fetch<Post | null>(
    POST_BY_SLUG_QUERY,
    { slug: params.slug },
    { next: { tags: ['posts'] } }
  )

  if (!post) notFound()

  const coverUrl = post.cover_image
    ? urlFor(post.cover_image).width(1200).height(600).url()
    : null

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-indigo-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 line-clamp-1">{post.title}</span>
      </nav>

      {/* Category & date */}
      <div className="mb-4 flex items-center gap-3">
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
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl leading-tight">
        {post.title}
      </h1>
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
                        <figcaption className="mt-2 text-center text-sm text-slate-400">
                          {value.caption}
                        </figcaption>
                      )}
                    </figure>
                  )
                },
              },
            }}
          />
        </div>
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

      {/* Back CTA */}
      <div className="mt-12 text-center">
        <Link href="/blog" className="btn-outline">
          ← Back to Blog
        </Link>
      </div>
    </article>
  )
}
