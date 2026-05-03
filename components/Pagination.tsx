interface PaginationProps {
  currentPage: number
  totalPages: number
  buildUrl: (page: number) => string
}

export default function Pagination({ currentPage, totalPages, buildUrl }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | '…')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      <a
        href={currentPage > 1 ? buildUrl(currentPage - 1) : undefined}
        aria-disabled={currentPage === 1}
        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          currentPage === 1
            ? 'pointer-events-none text-slate-300'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        ← Prev
      </a>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">…</span>
        ) : (
          <a
            key={p}
            href={buildUrl(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`min-w-[36px] rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p}
          </a>
        )
      )}

      <a
        href={currentPage < totalPages ? buildUrl(currentPage + 1) : undefined}
        aria-disabled={currentPage === totalPages}
        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          currentPage === totalPages
            ? 'pointer-events-none text-slate-300'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        Next →
      </a>
    </nav>
  )
}
