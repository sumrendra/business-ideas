import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
            BI
          </div>
          <span className="font-bold text-slate-900 text-lg">Business Ideas</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          <Link
            href="/ideas"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            Ideas
          </Link>
          <Link
            href="/blog"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/ideas"
            className="btn-primary ml-3 hidden sm:inline-flex"
          >
            Browse Ideas
          </Link>
        </div>
      </nav>
    </header>
  )
}
