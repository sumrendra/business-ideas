import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.png" alt="businessideas.live" width={32} height={32} className="h-8 w-auto" />
          <span className="font-bold text-slate-900 text-lg">
            <span className="text-indigo-600">business</span>ideas.live
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          <Link
            href="/ideas"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors hidden sm:inline-flex"
          >
            Browse Ideas
          </Link>
          <Link
            href="/blog"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors hidden sm:inline-flex"
          >
            Articles
          </Link>
          <Link
            href="/sectors"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors hidden md:inline-flex"
          >
            Sectors
          </Link>
          <Link
            href="/get-funded"
            className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors hidden md:inline-flex"
          >
            Get Funded
          </Link>
          <span className="text-slate-300 text-sm hidden md:inline-flex px-1">···</span>
        </div>
      </nav>
    </header>
  )
}
