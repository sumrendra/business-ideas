'use client'

import { useState } from 'react'
import Link from 'next/link'

const MAX_VISIBLE = 5

interface TagFilterProps {
  allTags: string[]
  activeTag?: string
  activeCategory?: string
}

function tagUrl(tag: string, activeTag?: string, activeCategory?: string) {
  if (activeTag === tag) {
    return activeCategory ? `/blog?category=${encodeURIComponent(activeCategory)}` : '/blog'
  }
  return activeCategory
    ? `/blog?category=${encodeURIComponent(activeCategory)}&tag=${encodeURIComponent(tag)}`
    : `/blog?tag=${encodeURIComponent(tag)}`
}

export default function TagFilter({ allTags, activeTag, activeCategory }: TagFilterProps) {
  const sorted = [...allTags].sort()
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? sorted : sorted.slice(0, MAX_VISIBLE)

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((tag) => {
        const isActive = activeTag === tag
        return (
          <Link
            key={tag}
            href={tagUrl(tag, activeTag, activeCategory)}
            rel="nofollow"
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
          </Link>
        )
      })}
      {sorted.length > MAX_VISIBLE && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="inline-flex min-h-[32px] items-center rounded-full border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-1 text-xs font-medium text-ink-soft dark:text-paper-dark hover:text-ink dark:hover:text-paper-dark transition-colors cursor-pointer"
        >
          {expanded ? 'Show less' : `+${sorted.length - MAX_VISIBLE} more`}
        </button>
      )}
    </div>
  )
}
