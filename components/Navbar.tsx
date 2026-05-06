import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  { href: '/business-ideas', label: 'Opportunities' },
  { href: '/blog',           label: 'Insights' },
  { href: '/sectors',        label: 'Sectors' },
  { href: '/incentives',     label: 'State Incentives' },
  { href: '/tools',          label: 'Tools' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/icon.png"
            alt="businessideas.live"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
            <span className="text-indigo-600 dark:text-indigo-400">Business</span> Ideas
          </span>
        </Link>

        {/* Primary nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right cluster: CTA + theme toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/get-funded"
            className="hidden sm:inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Get Funded
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile nav row */}
      <div className="md:hidden border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="mx-auto max-w-7xl flex items-center gap-1 px-4 py-2 overflow-x-auto">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
