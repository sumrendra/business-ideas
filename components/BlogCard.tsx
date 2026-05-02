import Link from 'next/link'
import Image from 'next/image'
import type { Post } from '@/lib/sanity/types'
import { urlFor } from '@/lib/sanity/image'

export default function BlogCard({ post }: { post: Post }) {
  const coverUrl = post.cover_image
    ? urlFor(post.cover_image).width(600).height(300).url()
    : null

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden"
    >
      {/* Cover */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={post.cover_image?.alt || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
            <span className="text-4xl">📝</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category & date */}
        <div className="mb-2 flex items-center gap-2">
          {post.category && (
            <span className="badge bg-indigo-100 text-indigo-700 text-xs">
              {post.category}
            </span>
          )}
          {publishedDate && (
            <time className="text-xs text-slate-400">{publishedDate}</time>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="mt-2 text-sm text-slate-500 line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge bg-slate-100 text-slate-500 text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Read more */}
        <p className="mt-4 text-sm font-medium text-indigo-600 group-hover:underline">
          Read more →
        </p>
      </div>
    </Link>
  )
}
