import Link from 'next/link'
import type { Idea } from '@/lib/sanity/types'
import { BUDGET_LABELS, DIFFICULTY_LABELS, MARKET_SATURATION_LABELS } from '@/lib/sanity/types'

interface IdeaListCardProps {
  idea: Idea
  rank?: number
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced:     'bg-orange-100 text-orange-700',
  expert:       'bg-red-100 text-red-700',
}

const SATURATION_COLOR: Record<string, string> = {
  concept:     'bg-blue-100 text-blue-700',
  validated:   'bg-teal-100 text-teal-700',
  competitive: 'bg-orange-100 text-orange-700',
  proven:      'bg-green-100 text-green-700',
}

export default function IdeaListCard({ idea, rank }: IdeaListCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
      {/* Row 1: Rank + title + save */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {rank && (
            <span className="text-xs font-semibold text-slate-400">#{rank}</span>
          )}
          <Link
            href={`/business-ideas/${idea.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-bold text-slate-900 hover:text-indigo-700 transition-colors"
          >
            {idea.title}
          </Link>
        </div>
        <button
          className="shrink-0 text-slate-300 hover:text-rose-400 transition-colors"
          aria-label="Save idea"
        >
          ♡
        </button>
      </div>

      {/* Row 2: Tags */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {idea.industry && (
          <span className="badge bg-indigo-100 text-indigo-700 text-xs">{idea.industry}</span>
        )}
        {idea.difficulty_level && (
          <span className={`badge text-xs ${DIFFICULTY_COLOR[idea.difficulty_level] || 'bg-slate-100 text-slate-600'}`}>
            {DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level}
          </span>
        )}
        {idea.market_saturation && (
          <span className={`badge text-xs ${SATURATION_COLOR[idea.market_saturation] || 'bg-slate-100 text-slate-600'}`}>
            {MARKET_SATURATION_LABELS[idea.market_saturation] || idea.market_saturation}
          </span>
        )}
      </div>

      {/* Row 3: Metrics grid */}
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-4">
        <MetricCell label="Investment" value={BUDGET_LABELS[idea.budget_range] || idea.budget_range || '—'} />
        <MetricCell label="Market" value={MARKET_SATURATION_LABELS[idea.market_saturation] || idea.market_saturation || '—'} />
        <MetricCell label="Complexity" value={DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level || '—'} />
        <MetricCell label="Sector" value={idea.industry || '—'} />
      </div>

      {/* Row 4: Description */}
      <p className="mt-3 text-sm text-slate-600 line-clamp-2">{idea.description}</p>

      {/* Row 5: Tags + CTA */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {idea.tags?.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs text-slate-400">· {tag}</span>
          ))}
        </div>
        <Link
          href={`/business-ideas/${idea.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-indigo-600 hover:underline shrink-0"
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
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}
