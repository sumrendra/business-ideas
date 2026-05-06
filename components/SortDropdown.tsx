'use client'

import { useRouter } from 'next/navigation'

interface SortOption {
  value: string
  label: string
  url: string
}

interface SortDropdownProps {
  current: string
  options: SortOption[]
}

export default function SortDropdown({ current, options }: SortDropdownProps) {
  const router = useRouter()
  const urlByValue = Object.fromEntries(options.map((o) => [o.value, o.url]))

  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3 pr-1 py-1 text-sm shadow-sm transition-colors focus-within:border-indigo-400 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
      <svg
        className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h13M3 12h9M3 17h5M17 5v14m0 0l-3-3m3 3l3-3" />
      </svg>
      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Sort</span>
      <select
        value={current}
        onChange={(e) => router.push(urlByValue[e.target.value])}
        className="cursor-pointer appearance-none bg-transparent pr-7 py-0.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/></svg>\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.25rem center',
          backgroundSize: '1rem',
        }}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value} className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}