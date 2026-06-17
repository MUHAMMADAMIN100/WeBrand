import { useState, type Dispatch, type SetStateAction } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type { DragEndEvent } from '@dnd-kit/core'

type Id = string | number

/**
 * Shared reordering for the admin's drag-and-drop lists (projects, vacancies,
 * reels, partners). Centralises the «Сортировка» mode + the optimistic
 * sort_order persistence so every list behaves identically.
 *
 * `sortMode` ON  → the page shows the WHOLE list (no pagination/filters) and
 *                  drag works across every item, plus «В начало/В конец».
 * `sortMode` OFF → normal paginated/filtered browsing (no reordering).
 *
 * All reorders renumber sequentially, PATCH only the rows whose sort_order
 * actually changed, and roll back on error.
 */
export function useSortableList<T extends { sort_order: number }, K extends Id = Id>({
  items,
  setItems,
  getId,
  patch,
  toast,
  onEnterSort,
}: {
  items: T[]
  setItems: Dispatch<SetStateAction<T[]>>
  getId: (item: T) => K
  patch: (id: K, data: { sort_order: number }) => Promise<unknown>
  toast: { success: (m: string) => void; error: (m: string) => void }
  /** Called when entering sort mode — clear filters/search so the full list is shown. */
  onEnterSort?: () => void
}) {
  const [sortMode, setSortMode] = useState(false)

  const toggleSort = () =>
    setSortMode((on) => {
      if (!on) onEnterSort?.()
      return !on
    })

  const persist = async (reordered: T[]) => {
    const oldList = items
    const renum = reordered.map((it, i) => ({ ...it, sort_order: i }))
    setItems(renum)
    const changed = renum.filter(
      (it) => oldList.find((o) => getId(o) === getId(it))?.sort_order !== it.sort_order,
    )
    if (changed.length === 0) return
    try {
      await Promise.all(changed.map((it) => patch(getId(it), { sort_order: it.sort_order })))
      toast.success('Порядок обновлён')
    } catch (err) {
      setItems(oldList) // rollback
      toast.error(err instanceof Error ? err.message : 'Не удалось сохранить порядок')
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => getId(i) === active.id)
    const newIndex = items.findIndex((i) => getId(i) === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    void persist(arrayMove(items, oldIndex, newIndex))
  }

  const moveToStart = (item: T) => {
    const idx = items.findIndex((i) => getId(i) === getId(item))
    if (idx <= 0) return
    void persist(arrayMove(items, idx, 0))
  }

  const moveToEnd = (item: T) => {
    const idx = items.findIndex((i) => getId(i) === getId(item))
    if (idx < 0 || idx === items.length - 1) return
    void persist(arrayMove(items, idx, items.length - 1))
  }

  return { sortMode, toggleSort, onDragEnd, moveToStart, moveToEnd }
}
