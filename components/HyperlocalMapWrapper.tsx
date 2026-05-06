'use client'

import dynamic from 'next/dynamic'

const HyperlocalMap = dynamic(() => import('./HyperlocalMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[82vh] min-h-[520px] w-full items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading map…</p>
      </div>
    </div>
  ),
})

export default function HyperlocalMapWrapper() {
  return <HyperlocalMap />
}
