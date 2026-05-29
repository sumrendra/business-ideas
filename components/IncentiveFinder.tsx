'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  TYPE_META, SIZE_META,
  type IncentiveType, type EnterpriseSizeKey, type SectorKey,
} from '@/lib/incentives'

// ─── Normalized data shape (curated + neon) ──────────────────────────────────

export interface NormalizedIncentive {
  id: string
  state: string
  name: string
  type: IncentiveType
  /** override the TYPE_META label (used when neon types don't map cleanly) */
  rawTypeLabel?: string
  amount: string
  eligibility: string
  duration: string
  sector?: SectorKey | string
  enterpriseSize: EnterpriseSizeKey[]
  newOnly: boolean
  forWomen: boolean
  forScSt: boolean
  policyName: string
  sourceUrl: string
  amountPercent: number | null
  source: 'curated' | 'live'
}

// ─── Geography ───────────────────────────────────────────────────────────────

const STATE_REGIONS: Record<string, string[]> = {
  'West':       ['Maharashtra', 'Gujarat', 'Goa'],
  'South':      ['Karnataka', 'Tamil Nadu', 'Telangana', 'Andhra Pradesh', 'Kerala'],
  'North':      ['Uttar Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Delhi', 'Himachal Pradesh', 'Uttarakhand'],
  'Central':    ['Madhya Pradesh', 'Chhattisgarh'],
  'East':       ['West Bengal', 'Bihar', 'Jharkhand', 'Odisha'],
  'North-East': ['Assam'],
}

const STATE_ABBR: Record<string, string> = {
  Maharashtra: 'MH', Gujarat: 'GJ', Goa: 'GA',
  Karnataka: 'KA', 'Tamil Nadu': 'TN', Telangana: 'TS', 'Andhra Pradesh': 'AP', Kerala: 'KL',
  'Uttar Pradesh': 'UP', Rajasthan: 'RJ', Haryana: 'HR', Punjab: 'PB', Delhi: 'DL',
  'Himachal Pradesh': 'HP', Uttarakhand: 'UK',
  'Madhya Pradesh': 'MP', Chhattisgarh: 'CG',
  'West Bengal': 'WB', Bihar: 'BR', Jharkhand: 'JH', Odisha: 'OD',
  Assam: 'AS',
}

const ALL_TYPES = Object.keys(TYPE_META) as IncentiveType[]
const ALL_SIZES = Object.keys(SIZE_META) as EnterpriseSizeKey[]

// Incentive type is a non-semantic category, so every chip uses the single
// indigo accent (One Voice Rule). The label text is the distinguishing cue.
const TYPE_CHIP =
  'bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-600/15 dark:text-brand-100 dark:ring-brand-600/30'
const TYPE_RING: Record<IncentiveType, string> = {
  'capital-subsidy':   TYPE_CHIP,
  'interest-subsidy':  TYPE_CHIP,
  'stamp-duty':        TYPE_CHIP,
  'electricity':       TYPE_CHIP,
  'gst-reimbursement': TYPE_CHIP,
  'employment':        TYPE_CHIP,
  'tax-holiday':       TYPE_CHIP,
  'other':             'bg-surface-sunk text-ink-soft ring-line dark:bg-surface-dark-raised dark:text-paper-dark/70 dark:ring-line-dark',
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])
  return ref
}

// ─── Atoms ───────────────────────────────────────────────────────────────────

function Chevron({ open = false }: { open?: boolean }) {
  return (
    <svg
      className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function FilterButton({
  label, active, count, onClick, children, open,
}: {
  label: string
  active?: boolean
  count?: number
  onClick: () => void
  children?: React.ReactNode
  open?: boolean
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
          active
            ? 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-600/40 dark:bg-brand-600/15 dark:text-brand-100'
            : 'border-line bg-surface text-ink-soft hover:bg-surface-sunk dark:border-line-dark dark:bg-surface-dark dark:text-paper-dark/70 dark:hover:bg-surface-dark-raised'
        }`}
      >
        {label}
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-brand-600 px-1.5 py-px text-[10px] font-bold tabular-nums text-white">{count}</span>
        )}
        <Chevron open={open} />
      </button>
      {children}
    </div>
  )
}

function Popover({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <div
      className={`absolute z-30 mt-2 min-w-[14rem] overflow-hidden rounded-lg border border-line bg-surface shadow-xl dark:border-line-dark dark:bg-surface-dark ${
        align === 'right' ? 'right-0' : 'left-0'
      }`}
    >
      {children}
    </div>
  )
}

// ─── State selector — horizontal rail + popover ──────────────────────────────

function StateRail({
  states, counts, selected, onSelect,
}: {
  states: string[]
  counts: Record<string, number>
  selected: string
  onSelect: (s: string) => void
}) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const popoverRef = useClickOutside<HTMLDivElement>(() => setPopoverOpen(false))
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Sort by # of schemes descending for the rail
  const sortedStates = useMemo(
    () => [...states].sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0)),
    [states, counts],
  )

  function updateScrollState() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [sortedStates])

  // When selection changes (e.g. via popover), scroll the rail so the active chip is visible
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !selected) return
    const target = el.querySelector<HTMLButtonElement>(`[data-state="${CSS.escape(selected)}"]`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [selected])

  function scrollBy(dir: 1 | -1) {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.6), behavior: 'smooth' })
  }

  return (
    <div className="relative mb-6">
      <div className="flex items-center gap-2">
        {/* Scroll-left button */}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={!canScrollLeft}
          aria-label="Scroll states left"
          className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border text-ink-soft transition-all md:inline-flex ${
            canScrollLeft
              ? 'border-line bg-surface shadow-sm hover:bg-surface-sunk hover:text-ink dark:border-line-dark dark:bg-surface-dark dark:hover:bg-surface-dark-raised dark:hover:text-paper-dark'
              : 'pointer-events-none border-transparent bg-transparent text-ink-soft/40 dark:text-paper-dark/30'
          }`}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Scrollable rail with edge mask */}
        <div className="relative min-w-0 flex-1">
          <div
            ref={scrollRef}
            className="bi-state-rail flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollSnapType: 'x proximity' }}
          >
            <button
              onClick={() => onSelect('')}
              data-state=""
              style={{ scrollSnapAlign: 'start' }}
              aria-pressed={selected === ''}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                selected === ''
                  ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200 dark:bg-brand-600/20 dark:text-brand-100 dark:ring-brand-600/40'
                  : 'border border-line bg-surface text-ink-soft hover:bg-surface-sunk dark:border-line-dark dark:bg-surface-dark dark:text-paper-dark/70 dark:hover:bg-surface-dark-raised'
              }`}
            >
              {selected === '' && <span aria-hidden>✓</span>}
              All states
            </button>
            {sortedStates.map(st => {
              const isActive = selected === st
              return (
                <button
                  key={st}
                  data-state={st}
                  onClick={() => onSelect(isActive ? '' : st)}
                  style={{ scrollSnapAlign: 'start' }}
                  aria-pressed={isActive}
                  className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200 dark:bg-brand-600/20 dark:text-brand-100 dark:ring-brand-600/40'
                      : 'border border-line bg-surface text-ink-soft hover:bg-surface-sunk dark:border-line-dark dark:bg-surface-dark dark:text-paper-dark/70 dark:hover:bg-surface-dark-raised'
                  }`}
                >
                  {isActive && <span aria-hidden>✓</span>}
                  {st}
                  <span className={`text-[10px] font-semibold tabular-nums ${
                    isActive ? 'text-brand-600/70 dark:text-brand-200/70' : 'text-ink-soft/60 dark:text-paper-dark/50'
                  }`}>
                    {counts[st] ?? 0}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Scroll-right button */}
        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={!canScrollRight}
          aria-label="Scroll states right"
          className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border text-ink-soft transition-all md:inline-flex ${
            canScrollRight
              ? 'border-line bg-surface shadow-sm hover:bg-surface-sunk hover:text-ink dark:border-line-dark dark:bg-surface-dark dark:hover:bg-surface-dark-raised dark:hover:text-paper-dark'
              : 'pointer-events-none border-transparent bg-transparent text-ink-soft/40 dark:text-paper-dark/30'
          }`}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* By-region popover */}
        <div ref={popoverRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setPopoverOpen(o => !o)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-line-dark dark:bg-surface-dark dark:text-paper-dark/70 dark:hover:bg-surface-dark-raised"
            aria-label="Browse all states by region"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="hidden sm:inline">By region</span>
            <Chevron open={popoverOpen} />
          </button>
          {popoverOpen && (
            <Popover align="right">
              <div className="max-h-[60vh] w-72 overflow-y-auto p-2">
                {Object.entries(STATE_REGIONS).map(([region, regionStates]) => {
                  const visible = regionStates.filter(s => states.includes(s))
                  if (!visible.length) return null
                  return (
                    <div key={region} className="mb-2 last:mb-0">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft/70 dark:text-paper-dark/50">{region}</p>
                      <div className="flex flex-col">
                        {visible.map(st => (
                          <button
                            key={st}
                            onClick={() => { onSelect(selected === st ? '' : st); setPopoverOpen(false) }}
                            className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                              selected === st
                                ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-100'
                                : 'text-ink-soft hover:bg-surface-sunk dark:text-paper-dark/70 dark:hover:bg-surface-dark-raised'
                            }`}
                          >
                            <span>{st}</span>
                            <span className="text-xs tabular-nums text-ink-soft/60 dark:text-paper-dark/50">{counts[st] ?? 0}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Popover>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Toolbar popovers ────────────────────────────────────────────────────────

function TypePopover({
  open, onClose, selected, onToggle,
}: {
  open: boolean
  onClose: () => void
  selected: Set<IncentiveType>
  onToggle: (t: IncentiveType) => void
}) {
  const ref = useClickOutside<HTMLDivElement>(onClose)
  if (!open) return null
  return (
    <div ref={ref}>
      <Popover>
        <div className="p-2">
          {ALL_TYPES.map(t => {
            const meta = TYPE_META[t]
            const active = selected.has(t)
            return (
              <button
                key={t}
                onClick={() => onToggle(t)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-ink-soft transition-colors hover:bg-surface-sunk dark:text-paper-dark/70 dark:hover:bg-surface-dark-raised"
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden className={`inline-block h-2.5 w-2.5 rounded-sm ring-1 ring-inset ${TYPE_RING[t]}`} />
                  {meta.label}
                </span>
                {active && (
                  <svg className="h-3.5 w-3.5 text-brand-600 dark:text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </Popover>
    </div>
  )
}

function SizePopover({
  open, onClose, selected, onToggle,
}: {
  open: boolean
  onClose: () => void
  selected: Set<EnterpriseSizeKey>
  onToggle: (s: EnterpriseSizeKey) => void
}) {
  const ref = useClickOutside<HTMLDivElement>(onClose)
  if (!open) return null
  return (
    <div ref={ref}>
      <Popover>
        <div className="p-2">
          {ALL_SIZES.map(s => {
            const meta = SIZE_META[s]
            const active = selected.has(s)
            return (
              <button
                key={s}
                onClick={() => onToggle(s)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-ink-soft transition-colors hover:bg-surface-sunk dark:text-paper-dark/70 dark:hover:bg-surface-dark-raised"
              >
                {meta.label}
                {active && (
                  <svg className="h-3.5 w-3.5 text-brand-600 dark:text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </Popover>
    </div>
  )
}

function MorePopover({
  open, onClose, forWomen, setForWomen, forScSt, setForScSt, newOnly, setNewOnly,
}: {
  open: boolean
  onClose: () => void
  forWomen: boolean; setForWomen: (v: boolean) => void
  forScSt: boolean;  setForScSt: (v: boolean) => void
  newOnly: boolean;  setNewOnly: (v: boolean) => void
}) {
  const ref = useClickOutside<HTMLDivElement>(onClose)
  if (!open) return null
  return (
    <div ref={ref}>
      <Popover>
        <div className="p-2">
          {[
            { label: 'Women entrepreneurs', state: forWomen, set: setForWomen },
            { label: 'SC/ST entrepreneurs', state: forScSt,  set: setForScSt },
            { label: 'New businesses only', state: newOnly,  set: setNewOnly },
          ].map(({ label, state, set }) => (
            <label key={label} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm text-ink-soft hover:bg-surface-sunk dark:text-paper-dark/70 dark:hover:bg-surface-dark-raised">
              <input
                type="checkbox"
                checked={state}
                onChange={e => set(e.target.checked)}
                className="h-4 w-4 rounded border-line accent-brand-600 dark:border-line-dark"
              />
              {label}
            </label>
          ))}
        </div>
      </Popover>
    </div>
  )
}

function SortPopover({
  open, onClose, sortBy, setSortBy,
}: {
  open: boolean
  onClose: () => void
  sortBy: SortKey
  setSortBy: (s: SortKey) => void
}) {
  const ref = useClickOutside<HTMLDivElement>(onClose)
  if (!open) return null
  const options: { key: SortKey; label: string }[] = [
    { key: 'state',  label: 'Group by state' },
    { key: 'amount', label: 'Highest subsidy first' },
    { key: 'type',   label: 'Group by type' },
  ]
  return (
    <div ref={ref}>
      <Popover align="right">
        <div className="p-2 min-w-[12rem]">
          {options.map(o => (
            <button
              key={o.key}
              onClick={() => { setSortBy(o.key); onClose() }}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                sortBy === o.key
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-100'
                  : 'text-ink-soft hover:bg-surface-sunk dark:text-paper-dark/70 dark:hover:bg-surface-dark-raised'
              }`}
            >
              {o.label}
              {sortBy === o.key && (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </Popover>
    </div>
  )
}

type SortKey = 'state' | 'amount' | 'type'

// ─── Result row (list-style) ─────────────────────────────────────────────────

function IncentiveRow({ inc }: { inc: NormalizedIncentive }) {
  const [open, setOpen] = useState(false)
  const meta = TYPE_META[inc.type]
  const typeLabel = inc.rawTypeLabel ?? meta.label
  const hasUrl = inc.sourceUrl && inc.sourceUrl.length > 0

  return (
    <div className="group rounded-lg border border-line bg-surface transition-all hover:-translate-y-px hover:border-brand-300 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] dark:border-line-dark dark:bg-surface-dark dark:hover:border-brand-600/50">
      <div className="flex items-start gap-3 px-4 py-3 sm:items-center sm:gap-4">
        {/* State abbreviation */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-sunk text-xs font-bold tracking-wide text-ink-soft dark:bg-surface-dark-raised dark:text-paper-dark/70">
          {STATE_ABBR[inc.state] ?? inc.state.slice(0, 2).toUpperCase()}
        </div>

        {/* Main column */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-sm font-semibold text-ink dark:text-paper-dark">
              {inc.name}
            </p>
            {inc.source === 'live' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-positive/10 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-positive ring-1 ring-inset ring-positive/20 dark:bg-positive/15 dark:ring-positive/25">
                <span aria-hidden className="h-1 w-1 rounded-full bg-positive" />
                Live
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-soft dark:text-paper-dark/60">
            <span className="truncate">{inc.state}</span>
            {inc.sector && <><span>·</span><span className="capitalize">{inc.sector}</span></>}
            {inc.duration && inc.duration !== '—' && <><span>·</span><span>{inc.duration}</span></>}
            {inc.newOnly && <><span>·</span><span className="text-ink-soft/70 dark:text-paper-dark/50">New units</span></>}
            {inc.forWomen && <><span>·</span><span>Women</span></>}
            {inc.forScSt && <><span>·</span><span>SC/ST</span></>}
          </div>
        </div>

        {/* Type chip */}
        <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset md:inline-flex ${TYPE_RING[inc.type]}`}>
          {typeLabel}
        </span>

        {/* Amount */}
        <div className="hidden shrink-0 text-right md:block">
          <p className="max-w-[14rem] truncate text-sm font-semibold tabular-nums text-positive">
            {inc.amount}
          </p>
        </div>

        {/* Action */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="rounded-md p-2 text-ink-soft/60 transition-colors hover:bg-surface-sunk hover:text-ink dark:hover:bg-surface-dark-raised dark:hover:text-paper-dark"
            aria-label={open ? 'Collapse details' : 'Expand details'}
            aria-expanded={open}
          >
            <Chevron open={open} />
          </button>
          {hasUrl && (
            <a
              href={inc.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-500 dark:hover:bg-brand-600/15 sm:inline-flex"
            >
              Apply
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Mobile-only row 2 (type + amount) */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2 dark:border-line-dark md:hidden">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${TYPE_RING[inc.type]}`}>
          {typeLabel}
        </span>
        <span className="text-sm font-semibold tabular-nums text-positive">{inc.amount}</span>
        {hasUrl && (
          <a
            href={inc.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-500"
          >
            Apply
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        )}
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="grid gap-3 border-t border-line bg-surface-sunk/60 px-4 py-3 text-xs dark:border-line-dark dark:bg-surface-dark/50 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft/70 dark:text-paper-dark/50">Who qualifies</p>
            <p className="mt-0.5 text-ink-soft dark:text-paper-dark/70">{inc.eligibility}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft/70 dark:text-paper-dark/50">Duration</p>
            <p className="mt-0.5 text-ink-soft dark:text-paper-dark/70">{inc.duration}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft/70 dark:text-paper-dark/50">Enterprise size</p>
            <p className="mt-0.5 flex flex-wrap gap-1">
              {inc.enterpriseSize.length === 0 ? (
                <span className="text-ink-soft/60 dark:text-paper-dark/40">—</span>
              ) : (
                inc.enterpriseSize.map(s => (
                  <span key={s} className="rounded bg-surface px-1.5 py-px text-[10px] font-medium text-ink-soft ring-1 ring-inset ring-line dark:bg-surface-dark-raised dark:text-paper-dark/70 dark:ring-line-dark">
                    {SIZE_META[s].label}
                  </span>
                ))
              )}
            </p>
          </div>
          <div className="sm:col-span-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft/70 dark:text-paper-dark/50">Policy</p>
            <p className="mt-0.5 italic text-ink-soft dark:text-paper-dark/60">{inc.policyName}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Group header ────────────────────────────────────────────────────────────

function GroupHeader({
  label, count, open, onToggle,
}: {
  label: string
  count: number
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="group flex w-full items-center gap-3 py-3 text-left"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded text-ink-soft/60 transition-colors group-hover:bg-surface-sunk group-hover:text-ink dark:group-hover:bg-surface-dark-raised dark:group-hover:text-paper-dark">
        <Chevron open={open} />
      </span>
      <h3 className="text-base font-semibold tracking-tight text-ink dark:text-paper-dark">
        {label}
      </h3>
      <span className="rounded-full bg-surface-sunk px-2 py-0.5 text-[11px] font-medium tabular-nums text-ink-soft dark:bg-surface-dark-raised dark:text-paper-dark/60">
        {count}
      </span>
      <span className="h-px flex-1 bg-line/70 dark:bg-line-dark" />
    </button>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function IncentiveFinder({
  incentives,
}: {
  incentives: NormalizedIncentive[]
}) {
  const [selectedState, setSelectedState] = useState<string>('')
  const [selectedTypes, setSelectedTypes] = useState<Set<IncentiveType>>(new Set())
  const [selectedSizes, setSelectedSizes] = useState<Set<EnterpriseSizeKey>>(new Set())
  const [forWomen, setForWomen] = useState(false)
  const [forScSt, setForScSt] = useState(false)
  const [newOnly, setNewOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('state')

  // Popover state
  const [openPop, setOpenPop] = useState<null | 'type' | 'size' | 'more' | 'sort'>(null)

  // Collapsed state groups
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const toggleType = (t: IncentiveType) =>
    setSelectedTypes(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n })
  const toggleSize = (s: EnterpriseSizeKey) =>
    setSelectedSizes(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n })

  const allStates = useMemo(
    () => Array.from(new Set(incentives.map(i => i.state))).sort(),
    [incentives],
  )

  const countsByState = useMemo(() => {
    const m: Record<string, number> = {}
    for (const i of incentives) m[i.state] = (m[i.state] ?? 0) + 1
    return m
  }, [incentives])

  const filtered = useMemo(() => {
    let results = incentives.filter(i => {
      if (selectedState && i.state !== selectedState) return false
      if (selectedTypes.size > 0 && !selectedTypes.has(i.type)) return false
      if (selectedSizes.size > 0 && !i.enterpriseSize.some(s => selectedSizes.has(s))) return false
      if (forWomen && !i.forWomen) return false
      if (forScSt && !i.forScSt) return false
      if (newOnly && !i.newOnly) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (
          !i.name.toLowerCase().includes(q) &&
          !i.amount.toLowerCase().includes(q) &&
          !i.eligibility.toLowerCase().includes(q) &&
          !i.state.toLowerCase().includes(q) &&
          !i.policyName.toLowerCase().includes(q)
        ) return false
      }
      return true
    })

    if (sortBy === 'amount') {
      results = [...results].sort((a, b) => (b.amountPercent ?? 0) - (a.amountPercent ?? 0))
    } else if (sortBy === 'type') {
      results = [...results].sort((a, b) => a.type.localeCompare(b.type))
    } else {
      results = [...results].sort((a, b) => a.state.localeCompare(b.state))
    }
    return results
  }, [incentives, selectedState, selectedTypes, selectedSizes, forWomen, forScSt, newOnly, search, sortBy])

  // Top picks — high-value subsidies (only meaningful when no filters applied)
  const topPicks = useMemo(() => {
    return [...incentives]
      .filter(i => i.amountPercent !== null && i.amountPercent >= 25)
      .sort((a, b) => (b.amountPercent ?? 0) - (a.amountPercent ?? 0))
      .slice(0, 3)
  }, [incentives])

  // Grouping
  const grouped = useMemo(() => {
    const key = sortBy === 'type' ? 'type' : 'state'
    const map = new Map<string, NormalizedIncentive[]>()
    for (const i of filtered) {
      const k = key === 'state' ? i.state : TYPE_META[i.type].label
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(i)
    }
    return map
  }, [filtered, sortBy])

  const activeFilterCount = [
    selectedState ? 1 : 0,
    selectedTypes.size,
    selectedSizes.size,
    forWomen ? 1 : 0,
    forScSt ? 1 : 0,
    newOnly ? 1 : 0,
    search.trim() ? 1 : 0,
  ].reduce((a, b) => a + b, 0)
  const isFiltered = activeFilterCount > 0
  const moreCount = (forWomen ? 1 : 0) + (forScSt ? 1 : 0) + (newOnly ? 1 : 0)

  function clearAll() {
    setSelectedState('')
    setSelectedTypes(new Set())
    setSelectedSizes(new Set())
    setForWomen(false)
    setForScSt(false)
    setNewOnly(false)
    setSearch('')
  }

  function toggleGroup(name: string) {
    setCollapsedGroups(prev => {
      const n = new Set(prev)
      n.has(name) ? n.delete(name) : n.add(name)
      return n
    })
  }

  return (
    <div>
      {/* ── State rail ───────────────────────────────────────────────── */}
      <StateRail
        states={allStates}
        counts={countsByState}
        selected={selectedState}
        onSelect={setSelectedState}
      />

      {/* ── Sticky toolbar ───────────────────────────────────────────── */}
      <div className="sticky top-[64px] z-20 -mx-4 mb-3 border-y border-line bg-paper/90 px-4 py-3 backdrop-blur-md dark:border-line-dark dark:bg-ink-dark/90 sm:top-[80px]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <label htmlFor="incentive-search" className="sr-only">Search incentives</label>
            <input
              id="incentive-search"
              type="text"
              placeholder="Search incentives, amounts, policies…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="min-h-[44px] w-full rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink shadow-sm placeholder:text-ink-soft/50 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30 dark:border-line-dark dark:bg-surface-dark dark:text-paper-dark dark:placeholder:text-paper-dark/40"
            />
          </div>

          <FilterButton
            label="Type"
            active={selectedTypes.size > 0}
            count={selectedTypes.size}
            open={openPop === 'type'}
            onClick={() => setOpenPop(openPop === 'type' ? null : 'type')}
          >
            <TypePopover
              open={openPop === 'type'}
              onClose={() => setOpenPop(null)}
              selected={selectedTypes}
              onToggle={toggleType}
            />
          </FilterButton>

          <FilterButton
            label="Size"
            active={selectedSizes.size > 0}
            count={selectedSizes.size}
            open={openPop === 'size'}
            onClick={() => setOpenPop(openPop === 'size' ? null : 'size')}
          >
            <SizePopover
              open={openPop === 'size'}
              onClose={() => setOpenPop(null)}
              selected={selectedSizes}
              onToggle={toggleSize}
            />
          </FilterButton>

          <FilterButton
            label="More"
            active={moreCount > 0}
            count={moreCount}
            open={openPop === 'more'}
            onClick={() => setOpenPop(openPop === 'more' ? null : 'more')}
          >
            <MorePopover
              open={openPop === 'more'}
              onClose={() => setOpenPop(null)}
              forWomen={forWomen} setForWomen={setForWomen}
              forScSt={forScSt} setForScSt={setForScSt}
              newOnly={newOnly} setNewOnly={setNewOnly}
            />
          </FilterButton>

          <div className="ml-auto">
            <FilterButton
              label={sortBy === 'amount' ? 'Highest first' : sortBy === 'type' ? 'By type' : 'By state'}
              open={openPop === 'sort'}
              onClick={() => setOpenPop(openPop === 'sort' ? null : 'sort')}
            >
              <SortPopover
                open={openPop === 'sort'}
                onClose={() => setOpenPop(null)}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </FilterButton>
          </div>
        </div>

        {/* Active filter chips */}
        {isFiltered && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {selectedState && (
              <ActiveChip label={selectedState} onClear={() => setSelectedState('')} />
            )}
            {[...selectedTypes].map(t => (
              <ActiveChip key={t} label={TYPE_META[t].label} onClear={() => toggleType(t)} />
            ))}
            {[...selectedSizes].map(s => (
              <ActiveChip key={s} label={SIZE_META[s].label} onClear={() => toggleSize(s)} />
            ))}
            {forWomen && <ActiveChip label="Women" onClear={() => setForWomen(false)} />}
            {forScSt && <ActiveChip label="SC/ST" onClear={() => setForScSt(false)} />}
            {newOnly && <ActiveChip label="New units" onClear={() => setNewOnly(false)} />}
            {search.trim() && <ActiveChip label={`"${search}"`} onClear={() => setSearch('')} />}
            <button
              onClick={clearAll}
              className="ml-1 text-xs font-medium text-ink-soft hover:text-ink dark:text-paper-dark/60 dark:hover:text-paper-dark"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Result count — only when filtered ────────────────────────── */}
      {isFiltered && (
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-sm text-ink-soft dark:text-paper-dark/60">
            <span className="font-semibold tabular-nums text-ink dark:text-paper-dark">{filtered.length}</span>
            <span className="ml-1.5 tabular-nums">of {incentives.length} schemes match</span>
          </p>
        </div>
      )}

      {/* ── Top picks ribbon (only when no filters) ─────────────────── */}
      {!isFiltered && topPicks.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Top picks · Highest subsidy
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {topPicks.map(inc => (
              <a
                key={inc.id}
                href={inc.sourceUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col gap-2 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-indigo-50/40 p-4 transition-all hover:-translate-y-px hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-indigo-950/20 dark:hover:border-indigo-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {STATE_ABBR[inc.state] ?? inc.state.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${TYPE_RING[inc.type]}`}>
                    {inc.rawTypeLabel ?? TYPE_META[inc.type].label}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {inc.name}
                </p>
                <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {inc.amountPercent}%
                </p>
                <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                  {inc.amount}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Results: grouped list ────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">No incentives match your filters.</p>
          <button onClick={clearAll} className="mt-3 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {[...grouped.entries()].map(([groupName, items]) => {
            const collapsed = collapsedGroups.has(groupName)
            return (
              <section key={groupName}>
                <GroupHeader
                  label={groupName}
                  count={items.length}
                  open={!collapsed}
                  onToggle={() => toggleGroup(groupName)}
                />
                {!collapsed && (
                  <div className="space-y-1.5 pt-1">
                    {items.map(inc => <IncentiveRow key={inc.id} inc={inc} />)}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ActiveChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20">
      {label}
      <button
        onClick={onClear}
        className="-mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
        aria-label={`Remove ${label}`}
      >
        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  )
}
