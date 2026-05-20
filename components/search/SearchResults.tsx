'use client'

import { Command } from 'cmdk'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { FuseResult } from 'fuse.js'
import { getTitleHighlight, type HighlightSegment } from '@/lib/search/highlight'
import type {
  FilterSearchDoc,
  IdeaSearchDoc,
  PostSearchDoc,
  ToolSearchDoc,
} from '@/lib/search/types'
import { useSearch, type SearchSections } from '@/lib/search/useSearch'

function Highlight({ segments }: { segments: HighlightSegment[] }) {
  return (
    <>
      {segments.map((s, i) =>
        s.match ? (
          <mark
            key={i}
            className="bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-100 rounded px-0.5"
          >
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  )
}

function Chip({
  tone,
  children,
}: {
  tone: 'indigo' | 'amber' | 'emerald' | 'slate'
  children: React.ReactNode
}) {
  const cls = {
    indigo:
      'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    amber:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    emerald:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    slate:
      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  }[tone]
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}
    >
      {children}
    </span>
  )
}

function Thumb({
  src,
  fallback,
  tone = 'slate',
}: {
  src?: string | null
  fallback: string
  tone?: 'indigo' | 'amber' | 'emerald' | 'slate'
}) {
  const toneCls = {
    indigo:
      'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 dark:from-indigo-500/20 dark:to-indigo-600/20 dark:text-indigo-200',
    amber:
      'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 dark:from-amber-500/20 dark:to-amber-600/20 dark:text-amber-200',
    emerald:
      'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 dark:from-emerald-500/20 dark:to-emerald-600/20 dark:text-emerald-200',
    slate:
      'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300',
  }[tone]
  if (src) {
    return (
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
        <Image
          src={src}
          alt=""
          fill
          sizes="40px"
          className="object-cover"
        />
      </div>
    )
  }
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${toneCls}`}
    >
      {fallback}
    </div>
  )
}

function initial(s: string): string {
  return s.trim().slice(0, 1).toUpperCase() || '·'
}

function IdeaRow({
  result,
  onSelect,
}: {
  result: FuseResult<IdeaSearchDoc>
  onSelect: () => void
}) {
  const router = useRouter()
  const segs = getTitleHighlight(result)
  return (
    <Command.Item
      value={`idea:${result.item.slug}:${result.item.title}`}
      onSelect={() => {
        onSelect()
        router.push(`/business-ideas/${result.item.slug}`)
      }}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800/80 transition-colors"
    >
      <Thumb
        src={result.item.cover}
        fallback={initial(result.item.title)}
        tone="indigo"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Highlight segments={segs} />
          </p>
          {result.item.featured && <Chip tone="indigo">Featured</Chip>}
        </div>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {result.item.industry ?? 'Idea'}
          {result.item.tags && result.item.tags.length > 0 && (
            <span className="ml-1 opacity-70">· {result.item.tags.slice(0, 3).join(' · ')}</span>
          )}
        </p>
      </div>
      <Chip tone="indigo">Idea</Chip>
    </Command.Item>
  )
}

function PostRow({
  result,
  onSelect,
}: {
  result: FuseResult<PostSearchDoc>
  onSelect: () => void
}) {
  const router = useRouter()
  const segs = getTitleHighlight(result)
  return (
    <Command.Item
      value={`post:${result.item.slug}:${result.item.title}`}
      onSelect={() => {
        onSelect()
        router.push(`/blogs/${result.item.slug}`)
      }}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800/80 transition-colors"
    >
      <Thumb
        src={result.item.cover}
        fallback={initial(result.item.title)}
        tone="amber"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          <Highlight segments={segs} />
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {result.item.category ?? 'Article'}
        </p>
      </div>
      <Chip tone="amber">Blog</Chip>
    </Command.Item>
  )
}

function ToolRow({
  result,
  onSelect,
}: {
  result: FuseResult<ToolSearchDoc>
  onSelect: () => void
}) {
  const router = useRouter()
  const segs = getTitleHighlight(result)
  return (
    <Command.Item
      value={`tool:${result.item.slug}:${result.item.title}`}
      onSelect={() => {
        onSelect()
        router.push(result.item.href)
      }}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800/80 transition-colors"
    >
      <Thumb fallback={initial(result.item.title)} tone="emerald" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          <Highlight segments={segs} />
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {result.item.description}
        </p>
      </div>
      <Chip tone="emerald">Tool</Chip>
    </Command.Item>
  )
}

function FilterRow({
  result,
  onSelect,
}: {
  result: FuseResult<FilterSearchDoc>
  onSelect: () => void
}) {
  const router = useRouter()
  const segs = getTitleHighlight(result)
  const filterTypeLabel = {
    industry: 'Industry',
    budget: 'Budget',
    difficulty: 'Difficulty',
    stage: 'Stage',
  }[result.item.filterKind]
  return (
    <Command.Item
      value={`filter:${result.item.slug}:${result.item.title}`}
      onSelect={() => {
        onSelect()
        router.push(result.item.href)
      }}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800/80 transition-colors"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
        <svg
          className="h-4 w-4 text-slate-500 dark:text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {filterTypeLabel}: <Highlight segments={segs} />
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          Jump to filter
        </p>
      </div>
      <Chip tone="slate">Filter</Chip>
    </Command.Item>
  )
}

function DeepIdeaRow({
  hit,
  onSelect,
}: {
  hit: { slug: string; title: string; industry?: string; cover?: string | null }
  onSelect: () => void
}) {
  const router = useRouter()
  return (
    <Command.Item
      value={`deep-idea:${hit.slug}`}
      onSelect={() => {
        onSelect()
        router.push(`/business-ideas/${hit.slug}`)
      }}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800/80 transition-colors"
    >
      <Thumb src={hit.cover} fallback={initial(hit.title)} tone="indigo" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {hit.title}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {hit.industry ?? 'Idea'}
        </p>
      </div>
      <Chip tone="indigo">Idea</Chip>
    </Command.Item>
  )
}

function DeepPostRow({
  hit,
  onSelect,
}: {
  hit: { slug: string; title: string; category?: string; cover?: string | null }
  onSelect: () => void
}) {
  const router = useRouter()
  return (
    <Command.Item
      value={`deep-post:${hit.slug}`}
      onSelect={() => {
        onSelect()
        router.push(`/blogs/${hit.slug}`)
      }}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800/80 transition-colors"
    >
      <Thumb src={hit.cover} fallback={initial(hit.title)} tone="amber" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {hit.title}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {hit.category ?? 'Article'}
        </p>
      </div>
      <Chip tone="amber">Blog</Chip>
    </Command.Item>
  )
}

export interface SearchResultsProps {
  query: string
  onSelectAction: () => void
  recent: string[]
  onRecentSelectAction: (q: string) => void
  onClearRecentAction: () => void
  onSubmitFreeformAction: (q: string) => void
}

const STARTER_SUGGESTIONS = [
  'cloud kitchen',
  'D2C',
  'food tech',
  'agritech',
  'home services',
  'SaaS',
]

export function SearchResults({
  query,
  onSelectAction,
  recent,
  onRecentSelectAction,
  onClearRecentAction,
  onSubmitFreeformAction,
}: SearchResultsProps) {
  const sections: SearchSections = useSearch(query, true)

  if (sections.isEmpty) {
    return (
      <div className="space-y-4 py-2">
        {recent.length > 0 && (
          <Command.Group
            heading={
              <div className="flex items-center justify-between">
                <span>Recent searches</span>
                <button
                  type="button"
                  onClick={onClearRecentAction}
                  className="text-[10px] uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 normal-case"
                >
                  Clear
                </button>
              </div>
            }
          >
            {recent.map((q) => (
              <Command.Item
                key={q}
                value={`recent:${q}`}
                onSelect={() => onRecentSelectAction(q)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800/80 transition-colors"
              >
                <svg
                  className="h-4 w-4 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-sm text-slate-700 dark:text-slate-200">{q}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {sections.fallbackIdeas.length > 0 && (
          <Command.Group heading="Popular ideas">
            {sections.fallbackIdeas.map((idea) => (
              <Command.Item
                key={idea.slug}
                value={`popular:${idea.slug}`}
                onSelect={() => {
                  onSelectAction()
                  window.location.assign(`/business-ideas/${idea.slug}`)
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800/80 transition-colors"
              >
                <Thumb src={idea.cover} fallback={initial(idea.title)} tone="indigo" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {idea.title}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {idea.industry ?? 'Idea'}
                  </p>
                </div>
                <Chip tone="indigo">Idea</Chip>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        <div className="px-3 pb-1 pt-1">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Try searching
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onRecentSelectAction(s)}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const hasFuseHits =
    sections.ideas.length +
      sections.posts.length +
      sections.tools.length +
      sections.filters.length >
    0
  const hasDeep = sections.deepIdeas.length + sections.deepPosts.length > 0

  return (
    <div className="space-y-1 py-2">
      {sections.ideas.length > 0 && (
        <Command.Group heading="Business ideas">
          {sections.ideas.map((r) => (
            <IdeaRow key={r.item.slug} result={r} onSelect={onSelectAction} />
          ))}
        </Command.Group>
      )}

      {sections.posts.length > 0 && (
        <Command.Group heading="Blog posts">
          {sections.posts.map((r) => (
            <PostRow key={r.item.slug} result={r} onSelect={onSelectAction} />
          ))}
        </Command.Group>
      )}

      {sections.tools.length > 0 && (
        <Command.Group heading="Tools">
          {sections.tools.map((r) => (
            <ToolRow key={r.item.slug} result={r} onSelect={onSelectAction} />
          ))}
        </Command.Group>
      )}

      {sections.filters.length > 0 && (
        <Command.Group heading="Jump to filter">
          {sections.filters.map((r) => (
            <FilterRow key={r.item.slug} result={r} onSelect={onSelectAction} />
          ))}
        </Command.Group>
      )}

      {!hasFuseHits && (
        <>
          {sections.didYouMean.length > 0 && (
            <Command.Group heading="Did you mean">
              {sections.didYouMean.map((d) => (
                <FilterRow
                  key={d.slug}
                  result={{ item: d, refIndex: 0, matches: [] }}
                  onSelect={onSelectAction}
                />
              ))}
            </Command.Group>
          )}

          {sections.loadingDeep && (
            <Command.Group heading="Deep matches">
              <div className="space-y-2 px-3 py-2">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl px-0 py-1.5 animate-pulse"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="h-2.5 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            </Command.Group>
          )}

          {hasDeep && (
            <>
              {sections.deepIdeas.length > 0 && (
                <Command.Group heading="Deep matches — ideas">
                  {sections.deepIdeas.map((h) => (
                    <DeepIdeaRow key={h.slug} hit={h} onSelect={onSelectAction} />
                  ))}
                </Command.Group>
              )}
              {sections.deepPosts.length > 0 && (
                <Command.Group heading="Deep matches — blog">
                  {sections.deepPosts.map((h) => (
                    <DeepPostRow key={h.slug} hit={h} onSelect={onSelectAction} />
                  ))}
                </Command.Group>
              )}
            </>
          )}

          {sections.fallbackIdeas.length > 0 && (
            <Command.Group heading="Or browse popular">
              {sections.fallbackIdeas.map((idea) => (
                <Command.Item
                  key={idea.slug}
                  value={`fallback:${idea.slug}`}
                  onSelect={() => {
                    onSelectAction()
                    window.location.assign(`/business-ideas/${idea.slug}`)
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800/80 transition-colors"
                >
                  <Thumb src={idea.cover} fallback={initial(idea.title)} tone="indigo" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {idea.title}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {idea.industry ?? 'Idea'}
                    </p>
                  </div>
                  <Chip tone="indigo">Idea</Chip>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </>
      )}

      <Command.Item
        value={`search-all:${query}`}
        onSelect={() => onSubmitFreeformAction(query)}
        className="mt-2 flex items-center gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2.5 cursor-pointer data-[selected=true]:bg-slate-100 dark:border-slate-700 dark:data-[selected=true]:bg-slate-800/80 transition-colors"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40">
          <svg
            className="h-4 w-4 text-indigo-600 dark:text-indigo-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            Search all ideas for &ldquo;{query}&rdquo;
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            Run a full search on the ideas page
          </p>
        </div>
      </Command.Item>
    </div>
  )
}
