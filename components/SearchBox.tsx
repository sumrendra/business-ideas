'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SearchBoxProps {
  placeholder?: string
  defaultValue?: string
  className?: string
}

export default function SearchBox({ placeholder = 'Search ideas, sectors, keywords...', defaultValue = '', className = '' }: SearchBoxProps) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (value.trim()) params.set('search', value.trim())
    router.push(`/ideas${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <span className="absolute left-4 text-slate-400">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </form>
  )
}
