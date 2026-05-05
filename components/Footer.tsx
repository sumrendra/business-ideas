import Link from 'next/link'

const SECTIONS = [
  {
    title: 'Opportunities',
    links: [
      { href: '/business-ideas', label: 'All ideas' },
      { href: '/sectors',        label: 'By sector' },
      { href: '/business-ideas/under-1-lakh', label: 'Under ₹1L' },
      { href: '/business-ideas/saas',         label: 'SaaS' },
    ],
  },
  {
    title: 'Insights',
    links: [
      { href: '/blog',                        label: 'All articles' },
      { href: '/blog?category=Funding%20%26%20Finance', label: 'Funding' },
      { href: '/blog?category=Market%20Research',       label: 'Market research' },
      { href: '/blog?tag=policy-pulse',                 label: 'Policy Pulse' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/funding-calculators', label: 'Funding calculators' },
      { href: '/get-funded',          label: 'Get funded' },
      { href: '/tools',               label: 'All tools' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
                BI
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">Business Ideas</span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              298 validated business ideas with real setup costs, unit economics
              and funding routes — for Indian entrepreneurs.
            </p>
          </div>

          {SECTIONS.map(s => (
            <div key={s.title}>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                {s.title}
              </p>
              <ul className="space-y-2">
                {s.links.map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
          <span>© {new Date().getFullYear()} BusinessIdeas.live · All rights reserved.</span>
          <span>Editorial estimates — not financial advice. <Link href="/funding-calculators" className="hover:text-indigo-500 underline-offset-2 hover:underline">See disclaimer</Link></span>
        </div>
      </div>
    </footer>
  )
}
