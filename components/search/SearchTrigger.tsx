'use client'

import { useEffect, useState } from 'react'
import { useSearchPalette } from './SearchProvider'

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export default function SearchTrigger() {
  const { setOpen } = useSearchPalette()
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform))
  }, [])

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Open search"
      className="group inline-flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white/60 px-2.5 py-1.5 text-sm text-slate-500 shadow-sm hover:border-slate-300 hover:bg-white hover:text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition-colors"
    >
      <SearchIcon />
      <span className="hidden lg:inline">Search…</span>
      <kbd className="hidden lg:inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {isMac ? '⌘K' : 'Ctrl K'}
      </kbd>
    </button>
  )
}
