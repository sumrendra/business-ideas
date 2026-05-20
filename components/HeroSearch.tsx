'use client'

import { GlobalSearchInline } from './search/GlobalSearch'

interface HeroSearchProps {
  placeholder?: string
  className?: string
}

export default function HeroSearch({ placeholder, className = '' }: HeroSearchProps) {
  return <GlobalSearchInline placeholder={placeholder} className={className} />
}
