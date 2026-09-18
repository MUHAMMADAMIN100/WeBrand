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
      {/* Mobile: each control on its own row (the search gets a full row);
          from sm up: one wrapping line. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-2xl border border-ink-200 bg-white px-3.5 py-3 shadow-card dark:border-ink-800 dark:bg-ink-900">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
          {children}
        </div>
      </div>

      <div className="mb-4 mt-2 flex items-center justify-end gap-2.5 px-1">
        <span className="text-xs text-ink-600 dark:text-ink-400" aria-live="polite">
          Показано{' '}
          <span className="font-semibold text-ink-950 dark:text-ink-100">{paged ? `${from}–${to}` : total}</span>
          {paged ? ` из ${total}` : ''}
        </span>
        {active && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-950 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Сбросить
          </button>
        )}
      </div>
    </>
  )
}
