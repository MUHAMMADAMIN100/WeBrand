import { RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Slim filter bar above a table: filter controls on the left. The thin muted
 * caption below the bar shows the current page window «Показано X–Y из Z» (Z is
 * the filtered total); page controls themselves live below the table.
 */
export function FilterBar({
  children,
  total,
  from,
  to,
  active,
  onReset,
}: {
  children: ReactNode
  total: number // size of the filtered result set (Z)
  from: number // 1-based index of the first row on the current page (X)
  to: number // 1-based index of the last row on the current page (Y)
  active: boolean
  onReset: () => void
}) {
  // Show a range only when the page actually slices the result set; otherwise the
  // whole set is visible, so a bare count reads cleaner.
  const paged = total > 0 && (from > 1 || to < total)
  return (
    <>
      {/* Filter controls only — the result count no longer floats in the card corner.
          Mobile: each control on its own comfortable row (flex-col, left-aligned),
          so the search (w-full) gets a full row and chips never get squeezed next
          to it. Desktop (sm+): the original inline-wrap layout — unchanged. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-3 shadow-card">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
          {children}
        </div>
      </div>

      {/* Thin, muted caption between the filter bar and the table — in normal flow,
          right-aligned, consistent across every list. */}
      <div className="mb-4 mt-2 flex items-center justify-end gap-2.5 px-1">
        <span className="text-xs text-neutral-400 dark:text-neutral-500" aria-live="polite">
          Показано{' '}
          <span className="font-semibold text-neutral-600 dark:text-neutral-300">
            {paged ? `${from}–${to}` : total}
          </span>
          {paged ? ` из ${total}` : ''}
        </span>
        {active && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Сбросить
          </button>
        )}
      </div>
    </>
  )
}
