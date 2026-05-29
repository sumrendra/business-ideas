import Link from 'next/link'

const CHIPS = [
  { group: 'Budget',     label: 'Under ₹1L',   href: '/business-ideas?budget=under_1l' },
  { group: 'Budget',     label: '₹1L-5L',       href: '/business-ideas?budget=1l_10l' },
  { group: 'Budget',     label: '₹5L+',         href: '/business-ideas?budget=10l_50l' },
  { group: 'Complexity', label: 'Beginner',     href: '/business-ideas?difficulty=beginner' },
  { group: 'Complexity', label: 'Intermediate', href: '/business-ideas?difficulty=intermediate' },
  { group: 'Scale',      label: 'Local',        href: '/business-ideas?tags=Local' },
  { group: 'Scale',      label: 'Scalable',     href: '/business-ideas?tags=Scalable' },
]

const GROUPS = ['Budget', 'Complexity', 'Scale']

export default function FilterChips() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {GROUPS.map((group) => (
        <div key={group} className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-soft dark:text-paper-dark">{group}:</span>
          {CHIPS.filter((c) => c.group === group).map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="inline-flex min-h-[32px] items-center rounded-full bg-surface-sunk dark:bg-surface-dark-raised px-3 py-1.5 text-xs font-medium text-ink-soft dark:text-paper-dark transition-colors hover:bg-brand-600/10 hover:text-brand-700 dark:hover:text-brand-600"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}
