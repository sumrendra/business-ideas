'use client'

import dynamic from 'next/dynamic'
import type { Idea } from '@/lib/sanity/types'

const DownloadReportButton = dynamic(
  () => import('./DownloadReportButton'),
  {
    ssr: false,
    loading: () => (
      <span className="shrink-0 rounded-full bg-white/70 px-6 py-3 text-sm font-bold text-indigo-400 cursor-wait">
        Loading…
      </span>
    ),
  }
)

export default function DownloadReportButtonWrapper({ idea }: { idea: Idea }) {
  return <DownloadReportButton idea={idea} />
}
