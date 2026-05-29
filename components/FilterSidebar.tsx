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
    <div className="space-y-3 rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5">
      <div className="flex items-center justify-between pb-2 border-b border-line dark:border-line-dark">
        <h2 className="font-semibold text-ink dark:text-paper-dark">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-alert hover:underline font-medium transition-colors"
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
            {visibleTags.map((tag) => {
              const isActive = activeFilters.tags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex min-h-[32px] items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-brand-600/10 text-brand-700 dark:text-brand-600'
                      : 'bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-paper-dark hover:bg-brand-600/10 hover:text-brand-700 dark:hover:text-brand-600'
                  }`}
                >
                  {isActive && (
                    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {tag}
                </button>
              )
            })}
          </div>
          {sortedTags.length > TAGS_VISIBLE && (
            <button
              onClick={() => setShowAllTags((v) => !v)}
              className="mt-2 text-xs font-medium text-brand-600 hover:underline"
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
    <details open={defaultOpen} className="group border-b border-line dark:border-line-dark pb-3 last:border-b-0 last:pb-0">
      <summary className="flex cursor-pointer items-center justify-between list-none mb-2 select-none">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-paper-dark group-hover:text-ink dark:group-hover:text-paper-dark transition-colors">
          {title}
        </span>
        <svg
          className="h-4 w-4 text-ink-soft dark:text-paper-dark transition-transform duration-200 group-open:rotate-180"
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
      className={`flex min-h-[36px] w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors text-left ${
        active
          ? 'bg-brand-600/10 text-brand-700 dark:text-brand-600 font-medium'
          : 'text-ink-soft dark:text-paper-dark hover:bg-surface-sunk dark:hover:bg-surface-dark-raised hover:text-ink dark:hover:text-paper-dark'
      }`}
    >
      <span className="flex items-center gap-1.5">
        {active && (
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {label}
      </span>
    </button>
  )
}
