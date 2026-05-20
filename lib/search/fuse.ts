import Fuse, { type IFuseOptions } from 'fuse.js'
import type { SearchDoc, SearchIndex } from './types'

export const FUSE_OPTIONS: IFuseOptions<SearchDoc> = {
  threshold: 0.38,
  ignoreLocation: true,
  includeMatches: true,
  includeScore: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'title', weight: 0.55 },
    { name: 'tags', weight: 0.18 },
    { name: 'industry', weight: 0.12 },
    { name: 'category', weight: 0.08 },
    { name: 'description', weight: 0.04 },
    { name: 'keywords', weight: 0.03 },
  ],
}

export function buildFuse(index: SearchIndex): Fuse<SearchDoc> {
  const docs: SearchDoc[] = [
    ...index.ideas,
    ...index.posts,
    ...index.tools,
    ...index.filters,
  ]
  return new Fuse(docs, FUSE_OPTIONS)
}
