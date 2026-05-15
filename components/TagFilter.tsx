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
      {visible.map((tag) => (
        <Link
          key={tag}
          href={tagUrl(tag, activeTag, activeCategory)}
          rel="nofollow"
          className={`badge text-xs transition-colors cursor-pointer ${
            activeTag === tag
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700'
          }`}
        >
          {tag}
        </Link>
      ))}
      {sorted.length > MAX_VISIBLE && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="badge text-xs bg-slate-50 text-slate-400 border border-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
        >
          {expanded ? 'Show less' : `+${sorted.length - MAX_VISIBLE} more`}
        </button>
      )}
    </div>
  )
}
