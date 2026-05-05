import Link from 'next/link'
import Image from 'next/image'
import type { Idea } from '@/lib/sanity/types'
import { BUDGET_LABELS, DIFFICULTY_LABELS } from '@/lib/sanity/types'
import { urlFor } from '@/lib/sanity/image'

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  advanced:     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  expert:       'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

export default function IdeaCard({ idea }: { idea: Idea }) {
  const coverUrl = idea.cover_image
    ? urlFor(idea.cover_image).width(600).height(300).url()
    : null

  return (
    <Link
      href={`/business-ideas/${idea.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors overflow-hidden"
    >
      {/* Cover */}
      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={idea.cover_image?.alt || idea.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
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
        <span className="mb-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
          {idea.industry}
        </span>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors line-clamp-2">
          {idea.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
          {idea.description}
        </p>

        {/* Revenue highlight */}
        {idea.monthly_revenue_range && (
          <div className="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold leading-none">Monthly Revenue</p>
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{idea.monthly_revenue_range}</p>
              </div>
              {idea.time_to_first_revenue && (
                <>
                  <span className="text-emerald-200 dark:text-emerald-700">|</span>
                  <div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold leading-none">First Revenue</p>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{idea.time_to_first_revenue}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Meta badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {idea.budget_range && (
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs">
              {BUDGET_LABELS[idea.budget_range] || idea.budget_range}
            </span>
          )}
          {idea.difficulty_level && (
            <span className={`badge text-xs ${DIFFICULTY_COLOR[idea.difficulty_level] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              {DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level}
            </span>
          )}
        </div>

        {/* Tags */}
        {idea.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {idea.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs">
                {tag}
              </span>
            ))}
            {idea.tags.length > 3 && (
              <span className="badge bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-500 text-xs">
                +{idea.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
