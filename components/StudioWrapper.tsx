'use client'
import dynamic from 'next/dynamic'

const SanityStudio = dynamic(() => import('./SanityStudio'), { ssr: false })

export default function StudioWrapper() {
  return <SanityStudio />
}
