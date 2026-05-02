import Link from 'next/link'
import Image from 'next/image'
import type { Idea } from '@/lib/sanity/types'
import { BUDGET_LABELS, DIFFICULTY_LABELS } from '@/lib/sanity/types'
import { urlFor } from '@/lib/sanity/image'

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced:     'bg-orange-100 text-orange-700',
  expert:       'bg-red-100 text-red-700',
}

export default function IdeaCard({ idea }: { idea: Idea }) {
  const coverUrl = idea.cover_image
    ? urlFor(idea.cover_image).width(600).height(300).url()
    : null

  return (
    <Link
      href={`/ideas/${idea.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden"
    >
      {/* Cover */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={idea.cover_image?.alt || idea.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl">💡</span>
          </div>
        )}
        {idea.featured && (
          <span className="absolute top-3 left-3 badge bg-indigo-600 text-white text-xs">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Industry */}
        <span className="mb-2 text-xs font-medium text-indigo-600 uppercase tracking-wide">
          {idea.industry}
        </span>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2">
          {idea.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-500 line-clamp-2 flex-1">
          {idea.description}
        </p>

        {/* Meta badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {idea.budget_range && (
            <span className="badge bg-slate-100 text-slate-600 text-xs">
              {BUDGET_LABELS[idea.budget_range] || idea.budget_range}
            </span>
          )}
          {idea.difficulty_level && (
            <span className={`badge text-xs ${DIFFICULTY_COLOR[idea.difficulty_level] || 'bg-slate-100 text-slate-600'}`}>
              {DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level}
            </span>
          )}
        </div>

        {/* Tags */}
        {idea.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {idea.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge bg-indigo-50 text-indigo-600 text-xs">
                {tag}
              </span>
            ))}
            {idea.tags.length > 3 && (
              <span className="badge bg-slate-50 text-slate-400 text-xs">
                +{idea.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
