import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export { metadata, viewport } from 'next-sanity/studio'

// Always render the Studio fresh — never statically cache it
export const dynamic = 'force-dynamic'

export default function StudioPage() {
  return <NextStudio config={config} />
}
