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
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <a
        href={currentPage > 1 ? buildUrl(currentPage - 1) : undefined}
        aria-disabled={currentPage === 1}
        className={`inline-flex min-h-[44px] items-center rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
          currentPage === 1
            ? 'pointer-events-none border-line dark:border-line-dark text-ink-soft/40 dark:text-paper-dark/30'
            : 'border-line dark:border-line-dark text-ink-soft dark:text-paper-dark hover:bg-surface-sunk dark:hover:bg-surface-dark-raised hover:text-ink dark:hover:text-paper-dark'
        }`}
      >
        ← Prev
      </a>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-ink-soft/50 dark:text-paper-dark/40">…</span>
        ) : (
          <a
            key={p}
            href={buildUrl(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border px-3 py-2 text-center text-sm font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
              p === currentPage
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line dark:border-line-dark text-ink-soft dark:text-paper-dark hover:bg-surface-sunk dark:hover:bg-surface-dark-raised hover:text-ink dark:hover:text-paper-dark'
            }`}
          >
            {p}
          </a>
        )
      )}

      <a
        href={currentPage < totalPages ? buildUrl(currentPage + 1) : undefined}
        aria-disabled={currentPage === totalPages}
        className={`inline-flex min-h-[44px] items-center rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
          currentPage === totalPages
            ? 'pointer-events-none border-line dark:border-line-dark text-ink-soft/40 dark:text-paper-dark/30'
            : 'border-line dark:border-line-dark text-ink-soft dark:text-paper-dark hover:bg-surface-sunk dark:hover:bg-surface-dark-raised hover:text-ink dark:hover:text-paper-dark'
        }`}
      >
        Next →
      </a>
    </nav>
  )
}
