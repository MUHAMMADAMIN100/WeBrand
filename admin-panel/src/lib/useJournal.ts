import { useCallback, useEffect, useState } from 'react'
import type { Lead } from './types'
import { deleteLead, listLeads } from '../api/resources'
import { useToast } from '../context/ToastContext'
import type { Segment } from '../components/filters/SegmentedControl'

// ---- Shared journal helpers (used by both the leads and applications pages) ----

// Short, fixed-width date for a table row, e.g. "09.06.2026, 18:08".
export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

export type RangeFilter = 'all' | 'today' | '7d' | '30d'

export const RANGE_SEGMENTS: Segment<RangeFilter>[] = [
  { value: 'all', label: 'Всё время' },
  { value: 'today', label: 'Сегодня' },
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
]

// Threshold (ms) for a date range — start of the inclusive window in local tz.
export function rangeThreshold(range: RangeFilter): number {
  if (range === 'all') return 0
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const daysBack = range === 'today' ? 0 : range === '7d' ? 6 : 29
  start.setDate(start.getDate() - daysBack)
  return start.getTime()
}

/**
 * Shared state + actions for a leads-journal page pre-scoped to a single `kind`.
 * Both journal pages (Заявки = leads, and Вакансии → Заявки = applications) read
 * the same `GET /api/leads/journal/` endpoint and filter client-side by kind, so
 * the load / delete / detail-drawer / confirm wiring lives here once instead of
 * being duplicated per page. The list/detail/confirm UI components are reused as-is.
 */
export function useJournal(kind: Lead['kind']) {
  const toast = useToast()
  const [items, setItems] = useState<Lead[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [detailId, setDetailId] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<Lead | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const all = await listLeads()
      setItems(all.filter((l) => l.kind === kind))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [kind])

  useEffect(() => {
    load()
  }, [load])

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteLead(toDelete.id)
      setItems((arr) => arr.filter((x) => x.id !== toDelete.id))
      if (detailId === toDelete.id) setDetailId(null) // close the drawer if it showed this one
      toast.success(kind === 'application' ? 'Отклик удалён' : 'Заявка удалена')
      setToDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось удалить')
    } finally {
      setDeleting(false)
    }
  }

  return {
    items,
    status,
    load,
    detailId,
    setDetailId,
    toDelete,
    setToDelete,
    deleting,
    confirmDelete,
  }
}
