import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import type { Post } from '@/lib/sanity/types'

export default function FeaturedBlogCard({ post }: { post: Post }) {
  const coverUrl = post.cover_image
    ? urlFor(post.cover_image).width(1200).height(700).url()
    : null

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).toUpperCase()
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex h-[480px] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      {/* Background image */}
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={post.cover_image?.alt || post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-indigo-700" />
      )}

      {/* Category pill — top left */}
      {post.category && (
        <div className="absolute left-5 top-5 z-10">
          <span className="rounded-full border border-white/80 bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
            {post.category}
          </span>
        </div>
      )}

      {/* Frosted overlay panel — slides up on hover */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end overflow-hidden
                      h-[40%] group-hover:h-full
                      transition-[height] duration-500 ease-in-out">

        {/* Frosted glass background */}
        <div className="absolute inset-0 bg-white/50 backdrop-blur-xl" />

        {/* Content */}
        <div className="relative flex flex-col p-6">
          {/* Meta line */}
          <p className="mb-2 text-[11px] font-bold tracking-widest text-slate-600">
            ARTICLE{publishedDate && <span className="ml-3 font-normal">{publishedDate}</span>}
          </p>

          {/* Title */}
          <h3 className="text-2xl font-semibold leading-snug text-slate-900 line-clamp-2 group-hover:line-clamp-none sm:text-3xl">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="mt-3 text-sm leading-relaxed text-slate-700
                        max-h-0 overflow-hidden opacity-0
                        group-hover:max-h-40 group-hover:opacity-100
                        transition-all duration-500 ease-in-out delay-100
                        line-clamp-3">
            {post.excerpt}
          </p>

          {/* Learn More button */}
          <div className="mt-5
                          translate-y-4 opacity-0
                          group-hover:translate-y-0 group-hover:opacity-100
                          transition-all duration-300 ease-in-out delay-200
                          self-end">
            <span className="inline-block rounded-full bg-green-400 px-7 py-3 text-xs font-bold uppercase tracking-widest text-slate-900 shadow hover:bg-green-300 transition-colors">
              Learn More
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
