import Link from 'next/link'

const CHIPS = [
  { group: 'Budget',     label: 'Under ₹1L',     href: '/ideas?budget=under_1k' },
  { group: 'Budget',     label: '₹1L–5L',         href: '/ideas?budget=1k_10k' },
  { group: 'Budget',     label: '₹5L+',           href: '/ideas?budget=10k_50k' },
  { group: 'Complexity', label: 'Beginner',       href: '/ideas?difficulty=beginner' },
  { group: 'Complexity', label: 'Intermediate',   href: '/ideas?difficulty=intermediate' },
  { group: 'Scale',      label: 'Local',          href: '/ideas?scalability=local' },
  { group: 'Scale',      label: 'Scalable',       href: '/ideas?scalability=pan_india' },
]

const GROUPS = ['Budget', 'Complexity', 'Scale']

export default function FilterChips() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {GROUPS.map((group) => (
        <div key={group} className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">{group}:</span>
          {CHIPS.filter((c) => c.group === group).map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}
