'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import IdeaReportDocument from './IdeaReportDocument'
import type { Idea } from '@/lib/sanity/types'

export default function DownloadReportButton({ idea }: { idea: Idea }) {
  const fileName = `${idea.slug}-business-launch-kit.pdf`

  return (
    <PDFDownloadLink
      document={<IdeaReportDocument idea={idea} />}
      fileName={fileName}
      className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-colors text-center cursor-pointer"
    >
      {({ loading }) => (loading ? 'Preparing PDF…' : 'Download Report ↓')}
    </PDFDownloadLink>
  )
}
