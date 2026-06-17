import { GripVertical, Newspaper, Pencil, Plus, SearchX, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PageHeader, Card } from '../components/Layout'
import { Button } from '../components/ui/Button'
import { PublishBadge } from '../components/ui/Badge'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Toggle } from '../components/ui/Toggle'
import { Pagination } from '../components/ui/Pagination'
import { FilterBar } from '../components/filters/FilterBar'
import { SegmentedControl, type Segment } from '../components/filters/SegmentedControl'
import { SearchInput } from '../components/filters/SearchInput'
import { useDebounce } from '../lib/useDebounce'
import { usePagination } from '../lib/usePagination'
import type { News, NewsListItem } from '../lib/types'
import { deleteNews, getNews, listNews, patchNews } from '../api/resources'
import { useToast } from '../context/ToastContext'
import { NewsForm } from './NewsForm'

type StatusFilter = 'all' | 'published' | 'draft'
type Filters = { status: StatusFilter; search: string }
const DEFAULT_FILTERS: Filters = { status: 'all', search: '' }

const STATUS_SEGMENTS: Segment<StatusFilter>[] = [
  { value: 'all', label: 'Все' },
  { value: 'published', label: 'Опубликовано' },
  { value: 'draft', label: 'Черновик' },
]

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function CoverCell({ item }: { item: NewsListItem }) {
  return (
    <div className="grid h-11 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
      {item.cover ? (
        <img src={item.cover} alt="" className="h-full w-full object-cover" />
      ) : (
        <Newspaper className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
      )}
    </div>
  )
}

type RowHandlers = {
  onEdit: (n: NewsListItem) => void
  onDelete: (n: NewsListItem) => void
  onToggle: (n: NewsListItem) => void
  loadingEdit: string | null
}

/** Content cells shared by the sortable and static rows. */
function NewsCells({ n, onEdit, onDelete, onToggle, loadingEdit }: { n: NewsListItem } & RowHandlers) {
  return (
    <>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <CoverCell item={n} />
          <div className="min-w-0">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">{n.title}</div>
            <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">{n.slug}</div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-neutral-600 dark:text-neutral-300">
        {formatDate(n.published_at)}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <PublishBadge published={n.is_published} />
          {/* Keep the toggle clickable; don't let a tap on it start a row drag. */}
          <span className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()}>
            <Toggle checked={n.is_published} onChange={() => onToggle(n)} />
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1" onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(n)}
            disabled={loadingEdit === n.slug}
            className="cursor-pointer rounded-lg p-2 text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-600 dark:hover:text-brand-300 disabled:opacity-50"
            aria-label="Редактировать"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(n)}
            className="cursor-pointer rounded-lg p-2 text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400"
            aria-label="Удалить"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </>
  )
}

/** Draggable row — whole row is the drag target (same pattern as projects). */
function SortableNewsRow({ n, ...handlers }: { n: NewsListItem } & RowHandlers) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: n.slug })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-label={`Статья «${n.title}». Перетащите, чтобы изменить порядок`}
      className={`touch-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/60 ${
        isDragging ? 'relative z-10 cursor-grabbing bg-white dark:bg-neutral-900 shadow-lg' : 'cursor-grab hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40'
      }`}
    >
      <td className="py-3.5 pl-4 pr-1">
        <span className="inline-flex p-1.5 text-neutral-300 dark:text-neutral-600" aria-hidden="true">
          <GripVertical className="h-4 w-4" />
        </span>
      </td>
      <NewsCells n={n} {...handlers} />
    </tr>
  )
}

/** Static row (used while filtered — reordering a subset is ambiguous). */
function StaticNewsRow({ n, ...handlers }: { n: NewsListItem } & RowHandlers) {
  return (
    <tr className="transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
      <td className="py-3.5 pl-4 pr-1">
        <span
          className="inline-flex p-1.5 text-neutral-200 dark:text-neutral-600"
          title="Сбросьте фильтры, чтобы менять порядок"
        >
          <GripVertical className="h-4 w-4" />
        </span>
      </td>
      <NewsCells n={n} {...handlers} />
    </tr>
  )
}

export default function NewsPage() {
  const toast = useToast()
  const [items, setItems] = useState<NewsListItem[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [formOpen, setFormOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [editing, setEditing] = useState<News | null>(null)
  const [loadingEdit, setLoadingEdit] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<NewsListItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const search = useDebounce(filters.search, 250)
  const filtersActive = filters.status !== 'all' || filters.search !== ''
  // Drag reordering only when the list shows every row in its true order.
  const reorderable = !filtersActive

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((n) => {
      if (filters.status === 'published' && !n.is_published) return false
      if (filters.status === 'draft' && n.is_published) return false
      if (q && !n.title.toLowerCase().includes(q) && !n.slug.toLowerCase().includes(q)) return false
      return true
    })
  }, [items, filters.status, search])

  // Client-side pagination (12/page) over the filtered list. Drag-reorder (when
  // unfiltered) operates within the visible page; resets to page 1 on filter change.
  const pg = usePagination(filtered, 12, `${filters.status}|${search}`)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setItems(await listNews())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  const openCreate = () => {
    setEditing(null)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }

  // The list lacks the heavy body — fetch the full article before editing.
  const openEdit = async (n: NewsListItem) => {
    setLoadingEdit(n.slug)
    try {
      const full = await getNews(n.slug)
      setEditing(full)
      setFormKey((k) => k + 1)
      setFormOpen(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось открыть статью')
    } finally {
      setLoadingEdit(null)
    }
  }

  const togglePublish = async (n: NewsListItem) => {
    setItems((arr) => arr.map((x) => (x.slug === n.slug ? { ...x, is_published: !x.is_published } : x)))
    try {
      await patchNews(n.slug, { is_published: !n.is_published })
      toast.success(!n.is_published ? 'Опубликовано' : 'Снято с публикации')
    } catch (err) {
      setItems((arr) => arr.map((x) => (x.slug === n.slug ? { ...x, is_published: n.is_published } : x)))
      toast.error(err instanceof Error ? err.message : 'Не удалось изменить')
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldList = items
    const oldIndex = items.findIndex((n) => n.slug === active.id)
    const newIndex = items.findIndex((n) => n.slug === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    // Reassign sequential sort_order; optimistic update; PATCH only changed rows.
    const reordered = arrayMove(items, oldIndex, newIndex).map((n, i) => ({ ...n, sort_order: i }))
    setItems(reordered)
    const changed = reordered.filter(
      (n) => oldList.find((o) => o.slug === n.slug)?.sort_order !== n.sort_order,
    )
    try {
      await Promise.all(changed.map((n) => patchNews(n.slug, { sort_order: n.sort_order })))
      toast.success('Порядок обновлён')
    } catch (err) {
      setItems(oldList) // rollback
      toast.error(err instanceof Error ? err.message : 'Не удалось сохранить порядок')
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteNews(toDelete.slug)
      toast.success('Статья удалена')
      setToDelete(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка удаления')
    } finally {
      setDeleting(false)
    }
  }

  const rowHandlers: RowHandlers = { onEdit: openEdit, onDelete: setToDelete, onToggle: togglePublish, loadingEdit }

  return (
    <>
      <PageHeader
        title="Новости"
        subtitle="Перетаскивайте строки, чтобы задать порядок в ленте /news на сайте"
        action={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Новая статья
          </Button>
        }
      />

      {status === 'ready' && items.length > 0 && (
        <FilterBar total={pg.total} from={pg.from} to={pg.to} active={filtersActive} onReset={resetFilters}>
          <SegmentedControl
            ariaLabel="Статус публикации"
            value={filters.status}
            onChange={(s) => setFilters((f) => ({ ...f, status: s }))}
            options={STATUS_SEGMENTS}
          />
          <SearchInput
            className="w-full sm:w-auto sm:min-w-[200px] sm:flex-1"
            ariaLabel="Поиск по заголовку"
            placeholder="Поиск по заголовку…"
            value={filters.search}
            onChange={(s) => setFilters((f) => ({ ...f, search: s }))}
          />
        </FilterBar>
      )}

      <Card>
        {status === 'loading' ? (
          <TableSkeleton rows={6} cols={5} />
        ) : status === 'error' ? (
          <EmptyState
            icon={Newspaper}
            title="Не удалось загрузить"
            message="Проверьте, что бэкенд запущен, и попробуйте снова."
            action={<Button variant="secondary" onClick={load}>Повторить</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="Статей пока нет"
            message="Добавьте первую статью — она появится в разделе /news на сайте."
            action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Новая статья</Button>}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Ничего не найдено"
            message="Под текущие фильтры нет статей. Измените условия или сбросьте фильтры."
            action={<Button variant="secondary" onClick={resetFilters}>Сбросить фильтры</Button>}
          />
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  <th className="w-10" aria-label="Перетащить" />
                  <th className="px-5 py-3 font-semibold">Статья</th>
                  <th className="px-5 py-3 font-semibold">Дата</th>
                  <th className="px-5 py-3 font-semibold">Статус</th>
                  <th className="px-5 py-3 text-right font-semibold">Действия</th>
                </tr>
              </thead>
              {reorderable ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext items={pg.pageItems.map((n) => n.slug)} strategy={verticalListSortingStrategy}>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {pg.pageItems.map((n) => (
                        <SortableNewsRow key={n.slug} n={n} {...rowHandlers} />
                      ))}
                    </tbody>
                  </SortableContext>
                </DndContext>
              ) : (
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {pg.pageItems.map((n) => (
                    <StaticNewsRow key={n.slug} n={n} {...rowHandlers} />
                  ))}
                </tbody>
              )}
            </table>
          </div>
          <Pagination page={pg.page} totalPages={pg.totalPages} onChange={pg.setPage} />
          </>
        )}
      </Card>

      <NewsForm key={formKey} open={formOpen} initial={editing} onClose={() => setFormOpen(false)} onSaved={load} />

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить статью?"
        message={`«${toDelete?.title}» будет удалена без возможности восстановления.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
