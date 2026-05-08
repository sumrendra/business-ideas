import Link from 'next/link'
import type { Idea } from '@/lib/sanity/types'
import { BUDGET_LABELS, DIFFICULTY_LABELS, MARKET_SATURATION_LABELS } from '@/lib/sanity/types'
import FavouriteButton from './FavouriteButton'

interface IdeaListCardProps {
  idea: Idea
  rank?: number
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  advanced:     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  expert:       'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

const SATURATION_COLOR: Record<string, string> = {
  concept:     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  validated:   'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  competitive: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  proven:      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

export default function IdeaListCard({ idea, rank }: IdeaListCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
      {/* Row 1: Rank + title + save */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {rank && (
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">#{rank}</span>
          )}
          <Link
            href={`/business-ideas/${idea.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            {idea.title}
          </Link>
        </div>
        <FavouriteButton slug={idea.slug} />
      </div>

      {/* Row 2: Tags */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {idea.industry && (
          <span className="badge bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs">{idea.industry}</span>
        )}
        {idea.difficulty_level && (
          <span className={`badge text-xs ${DIFFICULTY_COLOR[idea.difficulty_level] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
            {DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level}
          </span>
        )}
        {idea.market_saturation && (
          <span className={`badge text-xs ${SATURATION_COLOR[idea.market_saturation] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
            {MARKET_SATURATION_LABELS[idea.market_saturation] || idea.market_saturation}
          </span>
        )}
      </div>

      {/* Row 3: Metrics grid */}
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 sm:grid-cols-4">
        <MetricCell label="Investment" value={BUDGET_LABELS[idea.budget_range] || idea.budget_range || '—'} />
        <MetricCell label="Market" value={MARKET_SATURATION_LABELS[idea.market_saturation] || idea.market_saturation || '—'} />
        <MetricCell label="Complexity" value={DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level || '—'} />
        <MetricCell label="Sector" value={idea.industry || '—'} />
      </div>

      {/* Row 4: Description */}
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{idea.description}</p>

      {/* Row 5: Tags + CTA */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {idea.tags?.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs text-slate-400 dark:text-slate-500">· {tag}</span>
          ))}
        </div>
        <Link
          href={`/business-ideas/${idea.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
        >
          View full idea →
        </Link>
      </div>
    </div>
  )
}

const SATURATION_COLOR_DARK = 'dark:bg-blue-900/40 dark:text-blue-300'
function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  )
}
