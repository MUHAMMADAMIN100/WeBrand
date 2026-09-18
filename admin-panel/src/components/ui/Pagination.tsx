import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Page controls (◀ / numbers / ▶) for a client-paginated table. Rendered below
 * the table, inside the Card. Hidden entirely when there's only one page.
 */
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const arrow =
    'grid h-9 w-9 place-items-center rounded-full border border-ink-200 text-ink-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40 [&:not(:disabled)]:hover:border-ink-950 [&:not(:disabled)]:hover:text-ink-950 dark:border-ink-700 dark:text-ink-300 dark:[&:not(:disabled)]:hover:border-white dark:[&:not(:disabled)]:hover:text-white'

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1.5 border-t border-ink-100 px-4 py-4 dark:border-ink-800"
      aria-label="Постраничная навигация"
    >
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className={arrow} aria-label="Предыдущая страница">
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition-colors ${
            p === page
              ? 'bg-ink-950 text-white dark:bg-white dark:text-ink-950'
              : 'border border-ink-200 text-ink-600 hover:border-ink-950 hover:text-ink-950 dark:border-ink-700 dark:text-ink-300 dark:hover:border-white dark:hover:text-white'
          }`}
        >
          {p}
        </button>
      ))}

      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className={arrow} aria-label="Следующая страница">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
