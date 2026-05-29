import Link from 'next/link'

// Footer IA mirrors the primary navigation so the site's shape reads the
// same in both places. All hrefs are existing routes (no URL/sitemap change).
const SECTIONS = [
  {
    title: 'Ideas',
    links: [
      { href: '/business-ideas', label: 'All business ideas' },
      { href: '/sectors', label: 'By sector' },
      { href: '/business-ideas/under-1-lakh', label: 'Under ₹1 lakh' },
      { href: '/opportunity-finder', label: 'Opportunity finder' },
    ],
  },
  {
    title: 'Startups & insights',
    links: [
      { href: '/startups', label: 'Startup database' },
      { href: '/blog', label: 'Blog' },
      { href: '/policy-pulse', label: 'Policy Pulse' },
      { href: '/sector-pulse', label: 'India sector pulse' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/funding-calculators', label: 'Funding calculators' },
      { href: '/get-funded', label: 'Scheme finder' },
      { href: '/incentives', label: 'State incentives' },
      { href: '/tools', label: 'All tools' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-line dark:border-line-dark bg-surface dark:bg-surface-dark">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm">
                BI
              </div>
              <span className="font-bold text-ink dark:text-slate-100">Business Ideas</span>
            </Link>
            <p className="mt-3 text-sm text-ink-soft dark:text-slate-400 max-w-xs leading-relaxed">
              298 validated business ideas with real setup costs, unit economics
              and funding routes — for Indian entrepreneurs.
            </p>
          </div>

          {SECTIONS.map((s) => (
            <div key={s.title}>
              <p className="text-xs font-bold uppercase tracking-widest text-ink-soft/60 dark:text-slate-500 mb-3">
                {s.title}
              </p>
              <ul className="space-y-2">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-soft dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-500 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-line dark:border-line-dark pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-soft/70 dark:text-slate-500">
          <span>© {new Date().getFullYear()} BusinessIdeas.live · All rights reserved.</span>
          <span>Editorial estimates — not financial advice. <Link href="/funding-calculators" className="hover:text-brand-600 underline-offset-2 hover:underline">See disclaimer</Link></span>
        </div>
      </div>
    </footer>
  )
}
