'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'bi_favourites'

function getSaved(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export default function FavouriteButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(getSaved().includes(slug))
  }, [slug])

  function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const current = getSaved()
    const next = current.includes(slug)
      ? current.filter(s => s !== slug)
      : [...current, slug]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSaved(next.includes(slug))
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? 'Remove from saved' : 'Save idea'}
      className={`shrink-0 text-xl leading-none transition-colors ${
        saved
          ? 'text-rose-500 dark:text-rose-400'
          : 'text-slate-300 dark:text-slate-600 hover:text-rose-400 dark:hover:text-rose-500'
      }`}
    >
      {saved ? '♥' : '♡'}
    </button>
  )
}
