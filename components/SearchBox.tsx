'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

interface SearchBoxProps {
  placeholder?: string
  className?: string
}

function SearchBoxInner({
  placeholder = 'Search ideas, sectors, keywords...',
  className = '',
}: SearchBoxProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('search') ?? '')

  useEffect(() => {
    setValue(searchParams.get('search') ?? '')
  }, [searchParams])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    const trimmed = value.trim()
    if (trimmed) {
      params.set('search', trimmed)
    } else {
      params.delete('search')
    }
    router.push(`/ideas?${params.toString()}`)
  }

  function handleClear() {
    setValue('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    const qs = params.toString()
    router.push(`/ideas${qs ? '?' + qs : ''}`)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
          🔍
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors text-lg leading-none"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        Search
      </button>
    </form>
  )
}

export default function SearchBox(props: SearchBoxProps) {
  return (
    <Suspense fallback={
      <div className={`relative flex items-center gap-2 ${props.className ?? ''}`}>
        <div className="relative flex-1">
          <input
            type="text"
            disabled
            placeholder={props.placeholder ?? 'Search ideas, sectors, keywords...'}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm text-slate-800 shadow-sm placeholder:text-slate-400"
          />
        </div>
        <button disabled className="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white opacity-75">
          Search
        </button>
      </div>
    }>
      <SearchBoxInner {...props} />
    </Suspense>
  )
}
