import type { FuseResult, FuseResultMatch } from 'fuse.js'

export interface HighlightSegment {
  text: string
  match: boolean
}

export function highlightSegments(
  value: string,
  matches: readonly FuseResultMatch[] | undefined,
  key: string,
): HighlightSegment[] {
  if (!matches || matches.length === 0) return [{ text: value, match: false }]
  const m = matches.find((x) => x.key === key && x.value === value)
  if (!m || !m.indices.length) return [{ text: value, match: false }]

  const segments: HighlightSegment[] = []
  let cursor = 0
  for (const [start, end] of m.indices) {
    if (start > cursor) segments.push({ text: value.slice(cursor, start), match: false })
    segments.push({ text: value.slice(start, end + 1), match: true })
    cursor = end + 1
  }
  if (cursor < value.length) segments.push({ text: value.slice(cursor), match: false })
  return segments
}

export function getTitleHighlight<T extends { title: string }>(
  result: FuseResult<T>,
): HighlightSegment[] {
  return highlightSegments(result.item.title, result.matches, 'title')
}
