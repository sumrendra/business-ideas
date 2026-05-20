'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

interface SearchContextValue {
  open: boolean
  setOpen: (v: boolean) => void
  toggle: () => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => setOpen((v) => !v), [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
      const meta = isMac ? e.metaKey : e.ctrlKey
      if (meta && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === '/' && !open) {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !(e.target as HTMLElement)?.isContentEditable) {
          e.preventDefault()
          setOpen(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <SearchContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearchPalette(): SearchContextValue {
  const ctx = useContext(SearchContext)
  if (!ctx) {
    return {
      open: false,
      setOpen: () => {},
      toggle: () => {},
    }
  }
  return ctx
}
