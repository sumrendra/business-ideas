import Link from 'next/link'
import type { Idea } from '@/lib/sanity/types'
import { BUDGET_LABELS, DIFFICULTY_LABELS, MARKET_SATURATION_LABELS } from '@/lib/sanity/types'
import FavouriteButton from './FavouriteButton'

interface IdeaListCardProps {
  idea: Idea
  rank?: number
}

// Difficulty is an ordinal status → sanctioned semantic palette.
const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'bg-surface-sunk text-positive dark:bg-surface-dark dark:text-positive',
  intermediate: 'bg-surface-sunk text-ink-soft dark:bg-surface-dark dark:text-slate-300',
  advanced:     'bg-surface-sunk text-caution dark:bg-surface-dark dark:text-caution',
  expert:       'bg-surface-sunk text-alert dark:bg-surface-dark dark:text-alert',
}

// Market saturation is a status → sanctioned semantic palette.
const SATURATION_COLOR: Record<string, string> = {
  concept:     'bg-surface-sunk text-ink-soft dark:bg-surface-dark dark:text-slate-300',
  validated:   'bg-surface-sunk text-positive dark:bg-surface-dark dark:text-positive',
  competitive: 'bg-surface-sunk text-caution dark:bg-surface-dark dark:text-caution',
  proven:      'bg-surface-sunk text-positive dark:bg-surface-dark dark:text-positive',
}

export default function IdeaListCard({ idea, rank }: IdeaListCardProps) {
  return (
    <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised p-5 hover:border-brand-600 dark:hover:border-brand-600 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] transition-all">
      {/* Row 1: Rank + title + save */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {rank && (
            <span className="text-xs font-semibold text-ink-soft dark:text-slate-500 tabular-nums">#{rank}</span>
          )}
          <Link
            href={`/business-ideas/${idea.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-bold text-ink dark:text-slate-100 hover:text-brand-600 dark:hover:text-indigo-300 transition-colors"
          >
            {idea.title}
          </Link>
        </div>
        <FavouriteButton slug={idea.slug} />
      </div>

      {/* Row 2: Tags */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {idea.industry && (
          <span className="badge bg-surface-sunk text-brand-600 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs">{idea.industry}</span>
        )}
        {idea.difficulty_level && (
          <span className={`badge text-xs ${DIFFICULTY_COLOR[idea.difficulty_level] || 'bg-surface-sunk text-ink-soft dark:bg-surface-dark dark:text-slate-300'}`}>
            {DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level}
          </span>
        )}
        {idea.market_saturation && (
          <span className={`badge text-xs ${SATURATION_COLOR[idea.market_saturation] || 'bg-surface-sunk text-ink-soft dark:bg-surface-dark dark:text-slate-300'}`}>
            {MARKET_SATURATION_LABELS[idea.market_saturation] || idea.market_saturation}
          </span>
        )}
      </div>

      {/* Row 3: Metrics grid */}
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-surface-sunk dark:bg-surface-dark p-3 sm:grid-cols-4">
        <MetricCell label="Investment" value={BUDGET_LABELS[idea.budget_range] || idea.budget_range || '—'} />
        <MetricCell label="Market" value={MARKET_SATURATION_LABELS[idea.market_saturation] || idea.market_saturation || '—'} />
        <MetricCell label="Complexity" value={DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level || '—'} />
        <MetricCell label="Sector" value={idea.industry || '—'} />
      </div>

      {/* Row 4: Description */}
      <p className="mt-3 text-sm text-ink-soft dark:text-slate-400 line-clamp-2">{idea.description}</p>

      {/* Row 5: Tags + CTA */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {idea.tags?.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs text-ink-soft dark:text-slate-500">· {tag}</span>
          ))}
        </div>
        <Link
          href={`/business-ideas/${idea.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-brand-600 dark:text-indigo-400 hover:underline shrink-0"
        >
          View full idea →
        </Link>
      </div>
    </div>
  )
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-soft dark:text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink dark:text-slate-200 tabular-nums">{value}</p>
    </div>
  )
}
