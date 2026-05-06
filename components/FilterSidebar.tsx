'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

const TAGS_VISIBLE = 12
import {
  BUDGET_OPTIONS,
  MARKET_SATURATION_OPTIONS,
  DIFFICULTY_OPTIONS,
  INDUSTRIES,
} from '@/lib/sanity/types'

interface ActiveFilters {
  industry: string
  budget: string
  saturation: string
  difficulty: string
  tags: string[]
  search?: string
}

interface FilterSidebarProps {
  allTags: string[]
  activeFilters: ActiveFilters
}

export default function FilterSidebar({ allTags, activeFilters }: FilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showAllTags, setShowAllTags] = useState(false)
  const sortedTags = [...allTags].sort((a, b) => a.localeCompare(b))
  const visibleTags = showAllTags ? sortedTags : sortedTags.slice(0, TAGS_VISIBLE)

  const buildUrl = useCallback(
    (updates: Partial<ActiveFilters>) => {
      const merged = { ...activeFilters, ...updates }
      const params = new URLSearchParams()
      if (merged.industry)   params.set('industry',   merged.industry)
      if (merged.budget)     params.set('budget',     merged.budget)
      if (merged.saturation) params.set('saturation', merged.saturation)
      if (merged.difficulty) params.set('difficulty', merged.difficulty)
      if (merged.search)     params.set('search',     merged.search)
      merged.tags.forEach((t) => params.append('tags', t))
      const qs = params.toString()
      return `${pathname}${qs ? `?${qs}` : ''}`
    },
    [activeFilters, pathname]
  )

  const setFilter = (key: keyof ActiveFilters, value: string) => {
    const current = activeFilters[key]
    const next = current === value ? '' : value
    router.push(buildUrl({ [key]: next } as Partial<ActiveFilters>))
  }

  const toggleTag = (tag: string) => {
    const newTags = activeFilters.tags.includes(tag)
      ? activeFilters.tags.filter((t) => t !== tag)
      : [...activeFilters.tags, tag]
    router.push(buildUrl({ tags: newTags }))
  }

  const clearAll = () => router.push(pathname)

  const hasActiveFilters =
    activeFilters.industry ||
    activeFilters.budget ||
    activeFilters.saturation ||
    activeFilters.difficulty ||
    activeFilters.tags.length > 0

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterGroup title="Industry" defaultOpen={!!activeFilters.industry}>
        {INDUSTRIES.map((ind) => (
          <FilterButton
            key={ind}
            label={ind}
            active={activeFilters.industry === ind}
            onClick={() => setFilter('industry', ind)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Budget Range" defaultOpen={!!activeFilters.budget}>
        {BUDGET_OPTIONS.map(({ value, label }) => (
          <FilterButton
            key={value}
            label={label}
            active={activeFilters.budget === value}
            onClick={() => setFilter('budget', value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Market Saturation" defaultOpen={!!activeFilters.saturation}>
        {MARKET_SATURATION_OPTIONS.map(({ value, label }) => (
          <FilterButton
            key={value}
            label={label}
            active={activeFilters.saturation === value}
            onClick={() => setFilter('saturation', value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Complexity" defaultOpen={!!activeFilters.difficulty}>
        {DIFFICULTY_OPTIONS.map(({ value, label }) => (
          <FilterButton
            key={value}
            label={label}
            active={activeFilters.difficulty === value}
            onClick={() => setFilter('difficulty', value)}
          />
        ))}
      </FilterGroup>

      {sortedTags.length > 0 && (
        <FilterGroup title="Tags" defaultOpen={activeFilters.tags.length > 0}>
          <div className="flex flex-wrap gap-1.5">
            {visibleTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`badge text-xs transition-colors cursor-pointer ${
                  activeFilters.tags.includes(tag)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {sortedTags.length > TAGS_VISIBLE && (
            <button
              onClick={() => setShowAllTags((v) => !v)}
              className="mt-2 text-xs font-medium text-indigo-600 hover:underline"
            >
              {showAllTags
                ? 'Show less ▲'
                : `Show ${sortedTags.length - TAGS_VISIBLE} more ▼`}
            </button>
          )}
        </FilterGroup>
      )}
    </div>
  )
}

function FilterGroup({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details open={defaultOpen} className="group border-b border-slate-100 dark:border-slate-800 pb-3 last:border-b-0 last:pb-0">
      <summary className="flex cursor-pointer items-center justify-between list-none mb-2 select-none">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
          {title}
        </span>
        <svg
          className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="space-y-1">{children}</div>
    </details>
  )
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors text-left ${
        active
          ? 'bg-indigo-600 text-white font-medium'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
      }`}
    >
      {label}
      {active && <span className="ml-2 text-xs opacity-75">✓</span>}
    </button>
  )
}
