'use client'

import dynamic from 'next/dynamic'

const HyperlocalMap = dynamic(() => import('./HyperlocalMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[82vh] min-h-[520px] w-full items-center justify-center rounded-lg border border-line dark:border-line-dark bg-surface-sunk dark:bg-surface-dark">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
        <p className="text-sm text-ink-soft dark:text-paper-dark/60">Loading map…</p>
      </div>
    </div>
  ),
})

export default function HyperlocalMapWrapper() {
  return <HyperlocalMap />
}
