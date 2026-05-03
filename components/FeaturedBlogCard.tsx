import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import type { Post } from '@/lib/sanity/types'

export default function FeaturedBlogCard({ post }: { post: Post }) {
  const coverUrl = post.cover_image
    ? urlFor(post.cover_image).width(600).height(300).url()
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col sm:flex-row gap-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
    >
      {/* Image */}
      <div className="relative h-44 w-full sm:h-auto sm:w-48 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={post.cover_image?.alt || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">📝</div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center gap-2">
        <div className="flex items-center gap-2">
          {post.category && (
            <span className="badge bg-indigo-100 text-indigo-700 text-xs">{post.category}</span>
          )}
          <span className="text-xs text-slate-400">
            {new Date(post.published_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-3">{post.excerpt}</p>
        <span className="mt-1 text-sm font-medium text-indigo-600">Read more →</span>
      </div>
    </Link>
  )
}
