'use client'

import { Command } from 'cmdk'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRecentSearches } from '@/lib/search/useSearch'
import { SearchResults } from './SearchResults'
import { useSearchPalette } from './SearchProvider'

function SearchIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
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

function KbdHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="hidden sm:inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </kbd>
  )
}

export interface GlobalSearchInlineProps {
  placeholder?: string
  className?: string
  redirectTo?: string
}

export function GlobalSearchInline({
  placeholder = 'Search ideas, blogs, tools…',
  className = '',
  redirectTo = '/business-ideas',
}: GlobalSearchInlineProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { recent, push, clear } = useRecentSearches()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const closeAndRecord = useCallback(
    (q?: string) => {
      if (q) push(q)
      setOpen(false)
    },
    [push],
  )

  const submitFreeform = useCallback(
    (q: string) => {
      const trimmed = q.trim()
      if (!trimmed) return
      push(trimmed)
      setOpen(false)
      const target = `${redirectTo}?search=${encodeURIComponent(trimmed)}`
      router.push(target)
    },
    [push, redirectTo, router],
  )

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      <Command
        shouldFilter={false}
        loop
        label="Search"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false)
            inputRef.current?.blur()
          }
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submitFreeform(query)
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>
            <Command.Input
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-24 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    inputRef.current?.focus()
                  }}
                  className="rounded-full p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                  aria-label="Clear"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              {!query && <KbdHint>⌘K</KbdHint>}
            </div>
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Search
          </button>
        </form>

        {open && (
          <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <SearchResults
                query={query}
                onSelectAction={() => closeAndRecord(query)}
                recent={recent}
                onRecentSelectAction={(q) => {
                  setQuery(q)
                  inputRef.current?.focus()
                }}
                onClearRecentAction={clear}
                onSubmitFreeformAction={submitFreeform}
              />
            </Command.List>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-3 py-2 text-[10px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><KbdHint>↑↓</KbdHint> navigate</span>
                <span className="flex items-center gap-1"><KbdHint>↵</KbdHint> open</span>
                <span className="flex items-center gap-1"><KbdHint>esc</KbdHint> close</span>
              </div>
              <span className="hidden sm:inline">Search by businessideas.live</span>
            </div>
          </div>
        )}
      </Command>
    </div>
  )
}

export function GlobalSearchPalette() {
  const router = useRouter()
  const { open, setOpen } = useSearchPalette()
  const [query, setQuery] = useState('')
  const { recent, push, clear } = useRecentSearches()

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setQuery(''), 200)
      return () => clearTimeout(t)
    }
  }, [open])

  const closeAndRecord = useCallback(
    (q?: string) => {
      if (q) push(q)
      setOpen(false)
    },
    [push, setOpen],
  )

  const submitFreeform = useCallback(
    (q: string) => {
      const trimmed = q.trim()
      if (!trimmed) return
      push(trimmed)
      setOpen(false)
      router.push(`/business-ideas?search=${encodeURIComponent(trimmed)}`)
    },
    [push, router, setOpen],
  )

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global search"
      shouldFilter={false}
      loop
      overlayClassName="fixed inset-0 z-[99] bg-slate-950/40 backdrop-blur-sm bi-search-overlay"
      contentClassName="fixed left-1/2 top-[10vh] z-[100] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:ring-white/5 bi-search-content"
    >
      <DialogPrimitive.Title className="sr-only">Global search</DialogPrimitive.Title>
      <DialogPrimitive.Description className="sr-only">
        Search business ideas, blog posts, tools, and filters.
      </DialogPrimitive.Description>
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 dark:border-slate-800">
        <span className="text-slate-400 dark:text-slate-500">
          <SearchIcon className="h-4 w-4" />
        </span>
        <Command.Input
          value={query}
          onValueChange={setQuery}
          autoFocus
          placeholder="Search ideas, blogs, tools, filters…"
          className="flex-1 bg-transparent py-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Close"
        >
          esc
        </button>
      </div>
      <Command.List className="max-h-[60vh] overflow-y-auto p-2">
        <SearchResults
          query={query}
          onSelectAction={() => closeAndRecord(query)}
          recent={recent}
          onRecentSelectAction={(q) => setQuery(q)}
          onClearRecentAction={clear}
          onSubmitFreeformAction={submitFreeform}
        />
      </Command.List>
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[10px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><KbdHint>↑↓</KbdHint> navigate</span>
          <span className="flex items-center gap-1"><KbdHint>↵</KbdHint> open</span>
          <span className="flex items-center gap-1"><KbdHint>esc</KbdHint> close</span>
        </div>
        <span className="hidden sm:inline">Press <KbdHint>⌘K</KbdHint> anywhere</span>
      </div>
    </Command.Dialog>
  )
}
