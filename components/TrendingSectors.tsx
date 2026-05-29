import Link from 'next/link'
import type { ReactNode } from 'react'

interface SectorCounts {
  saas: number
  ecommerce: number
  localServices: number
  health: number
  edtech: number
  aiml: number
  climate: number
  fintech: number
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const FireIcon = () => (
  <svg viewBox="0 0 24 24" {...stroke} className="h-5 w-5">
    <path d="M15.36 5.21A8.25 8.25 0 0 1 12 21 8.25 8.25 0 0 1 6.04 7.05 8.29 8.29 0 0 0 9 9.6a8.98 8.98 0 0 1 3.36-6.87 8.21 8.21 0 0 0 3 2.48z" />
    <path d="M12 18a3.75 3.75 0 0 0 .5-7.47 5.99 5.99 0 0 0-1.93 3.55 5.97 5.97 0 0 1-2.13-1A3.75 3.75 0 0 0 12 18z" />
  </svg>
)

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" {...stroke} className="h-5 w-5">
    <path d="M3.75 13.5 14.25 2.25 12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
)

const TrendUpIcon = () => (
  <svg viewBox="0 0 24 24" {...stroke} className="h-5 w-5">
    <path d="M2.25 18 9 11.25l4.31 4.31a11.95 11.95 0 0 1 5.81-5.52l2.74-1.22" />
    <path d="m21.86 8.82-5.94-2.28m5.94 2.28-2.28 5.94" />
  </svg>
)

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" {...stroke} className="h-5 w-5">
    <path d="M9.81 15.9 9 18.75 8.19 15.9a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.85-.81a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.81 2.85a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.85.81a4.5 4.5 0 0 0-3.09 3.09Z" />
    <path d="M18 6v3.75M18 6h3.75M18 6h-3.75M18 6V2.25" />
  </svg>
)

const SECTORS: {
  key: keyof SectorCounts
  label: string
  href: string
  tag: string
  iconWrap: string   // icon background/text color classes
  icon: ReactNode
}[] = [
  {
    key: 'saas',
    label: 'SaaS',
    href: '/business-ideas/saas',
    tag: 'Hottest',
    iconWrap: 'bg-brand-600/10 text-brand-600 dark:text-indigo-400',
    icon: <FireIcon />,
  },
  {
    key: 'aiml',
    label: 'AI & Machine Learning',
    href: '/business-ideas/ai-ml',
    tag: 'Fast-growing',
    iconWrap: 'bg-brand-600/10 text-brand-600 dark:text-indigo-400',
    icon: <BoltIcon />,
  },
  {
    key: 'climate',
    label: 'Climate & Sustainability',
    href: '/business-ideas/climate',
    tag: 'Rising',
    iconWrap: 'bg-brand-600/10 text-brand-600 dark:text-indigo-400',
    icon: <TrendUpIcon />,
  },
  {
    key: 'ecommerce',
    label: 'E-commerce',
    href: '/business-ideas/ecommerce',
    tag: 'Top picks',
    iconWrap: 'bg-brand-600/10 text-brand-600 dark:text-indigo-400',
    icon: <SparklesIcon />,
  },
]

export default function TrendingSectors({ counts }: { counts: SectorCounts }) {
  return (
    <section className="border-y border-line dark:border-line-dark">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-indigo-400">Browse by sector</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-ink dark:text-slate-100">
              Trending right now
            </h2>
          </div>
          <Link
            href="/sectors"
            className="hidden sm:inline-flex text-sm font-medium text-brand-600 dark:text-indigo-400 hover:underline"
          >
            All sectors →
          </Link>
        </div>

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {SECTORS.map(s => (
            <Link
              key={s.key}
              href={s.href}
              className="group relative overflow-hidden rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised p-5 hover:border-brand-600 dark:hover:border-brand-600 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] transition-all"
            >
              <div className="relative flex flex-col">
                <div className="flex items-start justify-between">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.iconWrap}`}>
                    {s.icon}
                  </span>
                  <span className="rounded-full bg-surface-sunk dark:bg-surface-dark px-2 py-0.5 text-[11px] font-semibold text-ink-soft dark:text-slate-300">
                    <span className="tabular-nums">{counts[s.key]}</span> ideas
                  </span>
                </div>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-ink-soft dark:text-slate-500">
                  {s.tag}
                </p>
                <p className="mt-1 text-base font-semibold text-ink dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-indigo-300 transition-colors">
                  {s.label}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/sectors" className="text-sm font-medium text-brand-600 dark:text-indigo-400 hover:underline">
            All sectors →
          </Link>
        </div>
      </div>
    </section>
  )
}
