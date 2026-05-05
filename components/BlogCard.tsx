import Link from 'next/link'
import Image from 'next/image'
import type { Post } from '@/lib/sanity/types'
import { urlFor } from '@/lib/sanity/image'

export default function BlogCard({ post }: { post: Post }) {
  const coverUrl = post.cover_image
    ? urlFor(post.cover_image).width(700).height(440).url()
    : null

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-colors"
    >
      {/* Cover */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={post.cover_image?.alt || post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-950/40 dark:to-slate-900" />
        )}
        {post.category && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-white/85 dark:bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200 border border-white/40 dark:border-slate-700/50">
              {post.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold leading-snug text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Meta line */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          {publishedDate && <time dateTime={post.published_at}>{publishedDate}</time>}
          {post.reading_time && (
            <>
              <span aria-hidden>·</span>
              <span>{post.reading_time} min read</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
