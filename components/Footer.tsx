import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                BI
              </div>
              <span className="font-bold text-slate-800">Business Ideas</span>
            </Link>
            <p className="mt-2 text-xs text-slate-400 max-w-xs">
              Curated business opportunities with filters to help you find your perfect venture.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            <Link href="/ideas" className="hover:text-indigo-600 transition-colors">Ideas</Link>
            <Link href="/blog"  className="hover:text-indigo-600 transition-colors">Blog</Link>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Business Ideas. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
