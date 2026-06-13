import { useEffect, useState } from 'react'

/**
 * Client-side pagination over an already-filtered list. 12 per page by default.
 * Pass a `resetKey` derived from the active filters/search so the page snaps
 * back to 1 whenever the result set changes. `page` is always clamped into range
 * (so filtering down never leaves you stranded on an empty out-of-range page).
 */
export function usePagination<T>(items: T[], pageSize = 12, resetKey?: unknown) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [resetKey])

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  return {
    page: current,
    setPage,
    totalPages,
    pageItems,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  }
}
