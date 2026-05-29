import Link from 'next/link'
import Image from 'next/image'
import type { Idea } from '@/lib/sanity/types'
import { BUDGET_LABELS, DIFFICULTY_LABELS } from '@/lib/sanity/types'
import { urlFor } from '@/lib/sanity/image'

// Difficulty is an ordinal status, so it earns the sanctioned semantic palette:
// easier = positive, harder = caution → alert. Mid level stays neutral ink.
const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'bg-surface-sunk text-positive dark:bg-surface-dark dark:text-positive',
  intermediate: 'bg-surface-sunk text-ink-soft dark:bg-surface-dark dark:text-slate-300',
  advanced:     'bg-surface-sunk text-caution dark:bg-surface-dark dark:text-caution',
  expert:       'bg-surface-sunk text-alert dark:bg-surface-dark dark:text-alert',
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
      className="group flex flex-col rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised hover:border-brand-600 dark:hover:border-brand-600 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] transition-all overflow-hidden"
    >
      {/* Cover */}
      <div className="relative h-44 w-full bg-surface-sunk dark:bg-surface-dark overflow-hidden">
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
          <span className="absolute top-3 left-3 badge bg-brand-600 text-white text-xs">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Industry */}
        <span className="mb-2 text-xs font-medium text-brand-600 dark:text-indigo-400 uppercase tracking-wide">
          {idea.industry}
        </span>

        {/* Title */}
        <h3 className="font-semibold text-ink dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2">
          {idea.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-ink-soft dark:text-slate-400 line-clamp-2 flex-1">
          {idea.description}
        </p>

        {/* Revenue highlight — positive metric earns ledger green */}
        {idea.monthly_revenue_range && (
          <div className="mt-3 rounded-lg bg-surface-sunk dark:bg-surface-dark px-3 py-2">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-ink-soft dark:text-slate-400 font-semibold leading-none">Monthly Revenue</p>
                <p className="text-sm font-bold text-positive tabular-nums">{idea.monthly_revenue_range}</p>
              </div>
              {idea.time_to_first_revenue && (
                <>
                  <span className="text-line dark:text-line-dark">|</span>
                  <div>
                    <p className="text-xs text-ink-soft dark:text-slate-400 font-semibold leading-none">First Revenue</p>
                    <p className="text-sm font-bold text-ink dark:text-slate-200 tabular-nums">{idea.time_to_first_revenue}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Meta badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {idea.budget_range && (
            <span className="badge bg-surface-sunk text-ink-soft dark:bg-surface-dark dark:text-slate-300 text-xs tabular-nums">
              {BUDGET_LABELS[idea.budget_range] || idea.budget_range}
            </span>
          )}
          {idea.difficulty_level && (
            <span className={`badge text-xs ${DIFFICULTY_COLOR[idea.difficulty_level] || 'bg-surface-sunk text-ink-soft dark:bg-surface-dark dark:text-slate-300'}`}>
              {DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level}
            </span>
          )}
        </div>

        {/* Tags */}
        {idea.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {idea.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge bg-surface-sunk text-brand-600 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs">
                {tag}
              </span>
            ))}
            {idea.tags.length > 3 && (
              <span className="badge bg-surface-sunk text-ink-soft dark:bg-surface-dark dark:text-slate-500 text-xs tabular-nums">
                +{idea.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
