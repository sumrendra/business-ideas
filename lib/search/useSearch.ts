'use client'

import Fuse, { type FuseResult } from 'fuse.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { buildFuse } from './fuse'
import type {
  FilterSearchDoc,
  IdeaSearchDoc,
  PostSearchDoc,
  SearchDoc,
  SearchIndex,
  ToolSearchDoc,
} from './types'

interface DeepHit {
  slug: string
  title: string
  industry?: string
  category?: string
  tags?: string[]
  cover?: string | null
}

interface DeepResponse {
  ideas: DeepHit[]
  posts: DeepHit[]
}

export interface SearchSections {
  query: string
  ideas: FuseResult<IdeaSearchDoc>[]
  posts: FuseResult<PostSearchDoc>[]
  tools: FuseResult<ToolSearchDoc>[]
  filters: FuseResult<FilterSearchDoc>[]
  deepIdeas: DeepHit[]
  deepPosts: DeepHit[]
  loadingDeep: boolean
  /** Closest industry suggestions when nothing matched */
  didYouMean: FilterSearchDoc[]
  /** Fallback ideas (featured) to surface when zero matches */
  fallbackIdeas: IdeaSearchDoc[]
  isEmpty: boolean
  totalMatches: number
}

const INDEX_CACHE_KEY = '__bi_search_index_cache__'
const INDEX_FETCH_LIMITER = '__bi_search_index_inflight__'

interface WindowWithCache extends Window {
  [INDEX_CACHE_KEY]?: SearchIndex
  [INDEX_FETCH_LIMITER]?: Promise<SearchIndex>
}

function getCachedIndex(): SearchIndex | null {
  if (typeof window === 'undefined') return null
  const w = window as WindowWithCache
  return w[INDEX_CACHE_KEY] ?? null
}

async function fetchIndex(): Promise<SearchIndex> {
  if (typeof window === 'undefined') {
    throw new Error('Search index can only be fetched on the client')
  }
  const w = window as WindowWithCache
  if (w[INDEX_CACHE_KEY]) return w[INDEX_CACHE_KEY]!
  if (w[INDEX_FETCH_LIMITER]) return w[INDEX_FETCH_LIMITER]!

  const inflight = fetch('/api/search-index', { cache: 'force-cache' })
    .then((r) => r.json() as Promise<SearchIndex>)
    .then((data) => {
      w[INDEX_CACHE_KEY] = data
      return data
    })
    .finally(() => {
      w[INDEX_FETCH_LIMITER] = undefined
    })
  w[INDEX_FETCH_LIMITER] = inflight
  return inflight
}

export function useSearchIndex(enabled: boolean = true): {
  index: SearchIndex | null
  fuse: Fuse<SearchDoc> | null
  loading: boolean
} {
  const [index, setIndex] = useState<SearchIndex | null>(() => getCachedIndex())
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!enabled) return
    if (index) return
    let cancelled = false
    setLoading(true)
    fetchIndex()
      .then((data) => {
        if (!cancelled) setIndex(data)
      })
      .catch(() => {
        /* swallow — search will just be empty until retry */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, index])

  const fuse = useMemo(() => (index ? buildFuse(index) : null), [index])

  return { index, fuse, loading }
}

const MAX_PER_GROUP = 5

function splitResults(results: FuseResult<SearchDoc>[]) {
  const ideas: FuseResult<IdeaSearchDoc>[] = []
  const posts: FuseResult<PostSearchDoc>[] = []
  const tools: FuseResult<ToolSearchDoc>[] = []
  const filters: FuseResult<FilterSearchDoc>[] = []

  for (const r of results) {
    switch (r.item.kind) {
      case 'idea':
        if (ideas.length < MAX_PER_GROUP) ideas.push(r as FuseResult<IdeaSearchDoc>)
        break
      case 'post':
        if (posts.length < MAX_PER_GROUP) posts.push(r as FuseResult<PostSearchDoc>)
        break
      case 'tool':
        if (tools.length < MAX_PER_GROUP) tools.push(r as FuseResult<ToolSearchDoc>)
        break
      case 'filter':
        if (filters.length < 3) filters.push(r as FuseResult<FilterSearchDoc>)
        break
    }
  }
  return { ideas, posts, tools, filters }
}

export function useSearch(query: string, enabled: boolean = true): SearchSections {
  const { index, fuse } = useSearchIndex(enabled)
  const [deep, setDeep] = useState<DeepResponse>({ ideas: [], posts: [] })
  const [loadingDeep, setLoadingDeep] = useState(false)
  const lastDeepKey = useRef<string>('')

  const trimmed = query.trim()

  const { ideas, posts, tools, filters } = useMemo(() => {
    if (!fuse || !trimmed) {
      return {
        ideas: [] as FuseResult<IdeaSearchDoc>[],
        posts: [] as FuseResult<PostSearchDoc>[],
        tools: [] as FuseResult<ToolSearchDoc>[],
        filters: [] as FuseResult<FilterSearchDoc>[],
      }
    }
    const raw = fuse.search(trimmed, { limit: 30 })
    return splitResults(raw)
  }, [fuse, trimmed])

  const fuseHitCount = ideas.length + posts.length + tools.length + filters.length

  useEffect(() => {
    if (!trimmed || trimmed.length < 4) {
      setDeep({ ideas: [], posts: [] })
      setLoadingDeep(false)
      lastDeepKey.current = ''
      return
    }
    if (fuseHitCount > 0) {
      setDeep({ ideas: [], posts: [] })
      setLoadingDeep(false)
      return
    }

    const key = trimmed.toLowerCase()
    if (key === lastDeepKey.current) return
    lastDeepKey.current = key

    let cancelled = false
    setLoadingDeep(true)
    const handle = setTimeout(() => {
      fetch(`/api/search-deep?q=${encodeURIComponent(trimmed)}`)
        .then((r) => r.json() as Promise<DeepResponse>)
        .then((data) => {
          if (!cancelled) setDeep(data ?? { ideas: [], posts: [] })
        })
        .catch(() => {
          if (!cancelled) setDeep({ ideas: [], posts: [] })
        })
        .finally(() => {
          if (!cancelled) setLoadingDeep(false)
        })
    }, 240)

    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [trimmed, fuseHitCount])

  const didYouMean = useMemo<FilterSearchDoc[]>(() => {
    if (!index || !trimmed || fuseHitCount > 0) return []
    const industryDocs = index.filters.filter((f) => f.filterKind === 'industry')
    const localFuse = new Fuse(industryDocs, {
      keys: ['label'],
      threshold: 0.5,
      ignoreLocation: true,
      minMatchCharLength: 2,
    })
    return localFuse.search(trimmed).slice(0, 3).map((r) => r.item)
  }, [index, trimmed, fuseHitCount])

  const fallbackIdeas = useMemo<IdeaSearchDoc[]>(() => {
    if (!index) return []
    if (trimmed && fuseHitCount > 0) return []
    return index.ideas
      .filter((i) => i.featured)
      .slice(0, trimmed ? 4 : 6)
  }, [index, trimmed, fuseHitCount])

  const totalMatches =
    fuseHitCount + deep.ideas.length + deep.posts.length

  return {
    query: trimmed,
    ideas,
    posts,
    tools,
    filters,
    deepIdeas: deep.ideas,
    deepPosts: deep.posts,
    loadingDeep,
    didYouMean,
    fallbackIdeas,
    isEmpty: trimmed.length === 0,
    totalMatches,
  }
}

const RECENT_KEY = 'bi_recent_searches'
const MAX_RECENT = 6

export function useRecentSearches(): {
  recent: string[]
  push: (q: string) => void
  clear: () => void
} {
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      if (raw) setRecent(JSON.parse(raw))
    } catch {
      /* ignore */
    }
  }, [])

  const push = (q: string) => {
    const v = q.trim()
    if (!v) return
    setRecent((prev) => {
      const next = [v, ...prev.filter((p) => p.toLowerCase() !== v.toLowerCase())].slice(0, MAX_RECENT)
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const clear = () => {
    setRecent([])
    try {
      localStorage.removeItem(RECENT_KEY)
    } catch {
      /* ignore */
    }
  }

  return { recent, push, clear }
}
