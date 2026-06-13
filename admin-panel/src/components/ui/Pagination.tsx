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
    'grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors disabled:cursor-not-allowed disabled:opacity-40 [&:not(:disabled)]:hover:border-brand-500 [&:not(:disabled)]:hover:text-brand-600 dark:[&:not(:disabled)]:hover:text-brand-300'

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1.5 border-t border-neutral-100 dark:border-neutral-800 px-4 py-4"
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
          className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition-colors ${
            p === page
              ? 'bg-brand-600 text-white shadow-sm'
              : 'border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-300'
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
