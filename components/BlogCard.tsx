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
      className="group flex flex-col rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised overflow-hidden hover:border-brand-600 dark:hover:border-brand-600 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] transition-all"
    >
      {/* Cover */}
      <div className="relative aspect-[16/10] w-full bg-surface-sunk dark:bg-surface-dark overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={post.cover_image?.alt || post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-sunk dark:bg-surface-dark" />
        )}
        {post.category && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-surface/90 dark:bg-surface-dark/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-ink-soft dark:text-slate-200 border border-line dark:border-line-dark">
              {post.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold leading-snug text-ink dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-slate-400 line-clamp-2 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Meta line */}
        <div className="mt-4 flex items-center gap-2 text-xs text-ink-soft dark:text-slate-500">
          {publishedDate && <time dateTime={post.published_at} className="tabular-nums">{publishedDate}</time>}
          {post.reading_time && (
            <>
              <span aria-hidden>·</span>
              <span><span className="tabular-nums">{post.reading_time}</span> min read</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
