'use client'

import { useEffect, useState } from 'react'

export interface TocHeading {
  id: string
  text: string
  level: number
}

export default function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting heading
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-10% 0% -80% 0%', threshold: 0 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (!headings.length) return null

  return (
    <nav aria-label="Table of contents">
      <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
        In this article
      </p>
      <hr className="mb-4 border-slate-200 dark:border-slate-700" />
      <ol className="space-y-2">
        {headings.map(({ id, text, level }, i) => {
          const isActive = activeId === id
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  setActiveId(id)
                }}
                className={[
                  'flex items-start gap-1.5 text-sm leading-snug transition-colors',
                  level === 3 ? 'pl-3' : '',
                  isActive
                    ? 'font-semibold text-slate-900 dark:text-slate-100 underline underline-offset-2 decoration-indigo-500'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200',
                ].join(' ')}
              >
                <span className="shrink-0 tabular-nums text-slate-400 dark:text-slate-600 text-xs mt-0.5">
                  {level === 2 ? `${i + 1}.` : '—'}
                </span>
                {text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
