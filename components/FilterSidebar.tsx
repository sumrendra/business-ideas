'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
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
    <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterGroup title="Industry">
        {INDUSTRIES.map((ind) => (
          <FilterButton
            key={ind}
            label={ind}
            active={activeFilters.industry === ind}
            onClick={() => setFilter('industry', ind)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Budget Range">
        {BUDGET_OPTIONS.map(({ value, label }) => (
          <FilterButton
            key={value}
            label={label}
            active={activeFilters.budget === value}
            onClick={() => setFilter('budget', value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Market Saturation">
        {MARKET_SATURATION_OPTIONS.map(({ value, label }) => (
          <FilterButton
            key={value}
            label={label}
            active={activeFilters.saturation === value}
            onClick={() => setFilter('saturation', value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Complexity">
        {DIFFICULTY_OPTIONS.map(({ value, label }) => (
          <FilterButton
            key={value}
            label={label}
            active={activeFilters.difficulty === value}
            onClick={() => setFilter('difficulty', value)}
          />
        ))}
      </FilterGroup>

      {allTags.length > 0 && (
        <FilterGroup title="Tags">
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`badge text-xs transition-colors cursor-pointer ${
                  activeFilters.tags.includes(tag)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors text-left ${
        active
          ? 'bg-indigo-600 text-white font-medium'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {label}
      {active && <span className="ml-2 text-xs opacity-75">✓</span>}
    </button>
  )
}
