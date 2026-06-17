import { Briefcase, GripVertical, Pencil, Plus, SearchX, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PageHeader, Card } from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Badge, PublishBadge } from '../components/ui/Badge'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Toggle } from '../components/ui/Toggle'
import { Pagination } from '../components/ui/Pagination'
import { SortModeBar, RowMoveButtons } from '../components/Sortable'
import { FilterBar } from '../components/filters/FilterBar'
import { SegmentedControl, type Segment } from '../components/filters/SegmentedControl'
import { SearchInput } from '../components/filters/SearchInput'
import { ICON_MAP } from '../lib/options'
import { useDebounce } from '../lib/useDebounce'
import { usePagination } from '../lib/usePagination'
import { useSortableList } from '../lib/useSortableList'
import type { Vacancy } from '../lib/types'
import { deleteVacancy, listVacancies, patchVacancy } from '../api/resources'
import { useToast } from '../context/ToastContext'
import { VacancyForm } from './VacancyForm'

type StatusFilter = 'all' | 'published' | 'draft'
type Filters = { status: StatusFilter; search: string }
const DEFAULT_FILTERS: Filters = { status: 'all', search: '' }

const STATUS_SEGMENTS: Segment<StatusFilter>[] = [
  { value: 'all', label: 'Все' },
  { value: 'published', label: 'Опубликовано' },
  { value: 'draft', label: 'Черновик' },
]

type RowHandlers = {
  onEdit: (v: Vacancy) => void
  onDelete: (v: Vacancy) => void
  onToggle: (v: Vacancy) => void
  sortMode: boolean
  onMoveStart: (v: Vacancy) => void
  onMoveEnd: (v: Vacancy) => void
}

/** The four content cells shared by the sortable and static rows. */
function VacancyCells({ v, onEdit, onDelete, onToggle, sortMode, onMoveStart, onMoveEnd }: { v: Vacancy } & RowHandlers) {
  const Icon = ICON_MAP[v.icon] ?? Briefcase
  return (
    <>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 dark:bg-brand-500/15">
            <Icon className="h-5 w-5 text-brand-600 dark:text-brand-300" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">{v.title}</div>
            <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">{v.type}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex flex-wrap gap-1.5">
          {v.tags.slice(0, 3).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
          {v.tags.length > 3 && <Badge>+{v.tags.length - 3}</Badge>}
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <PublishBadge published={v.is_published} />
          {/* Keep the toggle clickable; don't let a tap on it start a row drag. */}
          <span className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()}>
            <Toggle checked={v.is_published} onChange={() => onToggle(v)} />
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        {sortMode ? (
          <RowMoveButtons onStart={() => onMoveStart(v)} onEnd={() => onMoveEnd(v)} />
        ) : (
          <div className="flex items-center justify-end gap-1" onPointerDown={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(v)}
              className="cursor-pointer rounded-lg p-2 text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-600 dark:hover:text-brand-300"
              aria-label="Редактировать"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(v)}
              className="cursor-pointer rounded-lg p-2 text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400"
              aria-label="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </td>
    </>
  )
}

/** Draggable row — used for in-page drag (normal mode, unfiltered) and for the
 * full-list drag in sort mode. The whole row is the drag target — listeners/
 * attributes live on the <tr>, so it can be grabbed anywhere. Interactive
 * controls inside (toggle, edit, delete) stopPropagation on pointerdown so they
 * stay clickable and never start a drag. The grip is a non-interactive visual
 * hint; keyboard reordering works by focusing the row and pressing Space + arrows. */
function SortableVacancyRow({ v, ...handlers }: { v: Vacancy } & RowHandlers) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: v.slug })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-label={`Вакансия «${v.title}». Перетащите, чтобы изменить порядок`}
      className={`touch-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/60 ${
        isDragging ? 'relative z-10 cursor-grabbing bg-white dark:bg-neutral-900 shadow-lg' : 'cursor-grab hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40'
      }`}
    >
      <td className="py-3.5 pl-4 pr-1">
        <span className="inline-flex p-1.5 text-neutral-300 dark:text-neutral-600" aria-hidden="true">
          <GripVertical className="h-4 w-4" />
        </span>
      </td>
      <VacancyCells v={v} {...handlers} />
    </tr>
  )
}

/** Static row (used while filtered/searched — reordering a subset is ambiguous). */
function StaticVacancyRow({ v, ...handlers }: { v: Vacancy } & RowHandlers) {
  return (
    <tr className="transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
      <td className="py-3.5 pl-4 pr-1">
        <span
          className="inline-flex p-1.5 text-neutral-200 dark:text-neutral-600"
          title="Сбросьте фильтры, чтобы перетаскивать, или включите «Сортировка»"
        >
          <GripVertical className="h-4 w-4" />
        </span>
      </td>
      <VacancyCells v={v} {...handlers} />
    </tr>
  )
}

export default function VacanciesPage() {
  const toast = useToast()
  const [items, setItems] = useState<Vacancy[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [formOpen, setFormOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [editing, setEditing] = useState<Vacancy | null>(null)
  const [toDelete, setToDelete] = useState<Vacancy | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const search = useDebounce(filters.search, 250)
  const filtersActive = filters.status !== 'all' || filters.search !== ''

  const sensors = useSensors(
    // ~8px before a press becomes a drag, so a plain click on the row never reorders.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((v) => {
      if (filters.status === 'published' && !v.is_published) return false
      if (filters.status === 'draft' && v.is_published) return false
      if (q && !`${v.title} ${v.slug}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [items, filters.status, search])

  // Pagination is shown in normal mode; sort mode hides it and lists everything.
  const pg = usePagination(filtered, 12, `${filters.status}|${search}`)

  // Shared sort mode + drag / quick-move reordering (same across all lists).
  const { sortMode, toggleSort, onDragEnd, moveToStart, moveToEnd } = useSortableList({
    items,
    setItems,
    getId: (v) => v.slug,
    patch: patchVacancy,
    toast,
    onEnterSort: () => setFilters(DEFAULT_FILTERS),
  })

  // Ordinary in-page drag works without sort mode — whenever the list is in its
  // true order (no filters). Sort mode additionally drags across all pages.
  const draggable = sortMode || !filtersActive
  const dragRows = sortMode ? items : pg.pageItems

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setItems(await listVacancies())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  // Bump on every open so the always-mounted form remounts with fresh state
  // (its useState seeds from `initial`) while still animating its enter/exit.
  const openCreate = () => {
    setEditing(null)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }
  const openEdit = (v: Vacancy) => {
    setEditing(v)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }

  const togglePublish = async (v: Vacancy) => {
    setItems((arr) => arr.map((x) => (x.slug === v.slug ? { ...x, is_published: !x.is_published } : x)))
    try {
      await patchVacancy(v.slug, { is_published: !v.is_published })
      toast.success(!v.is_published ? 'Опубликовано' : 'Снято с публикации')
    } catch (err) {
      setItems((arr) => arr.map((x) => (x.slug === v.slug ? { ...x, is_published: v.is_published } : x)))
      toast.error(err instanceof Error ? err.message : 'Не удалось изменить')
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteVacancy(toDelete.slug)
      toast.success('Вакансия удалена')
      setToDelete(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка удаления')
    } finally {
      setDeleting(false)
    }
  }

  const rowHandlers: RowHandlers = {
    onEdit: openEdit,
    onDelete: setToDelete,
    onToggle: togglePublish,
    sortMode,
    onMoveStart: moveToStart,
    onMoveEnd: moveToEnd,
  }

  return (
    <>
      <PageHeader
        title="Вакансии"
        subtitle="Порядок на сайте /vacancies. Перетаскивайте строки прямо здесь, а «Сортировка» — чтобы переносить через все страницы."
        action={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Новая вакансия
          </Button>
        }
      />

      {status === 'ready' && items.length > 0 && (
        <SortModeBar active={sortMode} onToggle={toggleSort} />
      )}

      {status === 'ready' && items.length > 0 && !sortMode && (
        <FilterBar total={pg.total} from={pg.from} to={pg.to} active={filtersActive} onReset={resetFilters}>
          <SegmentedControl
            ariaLabel="Статус публикации"
            value={filters.status}
            onChange={(status) => setFilters((f) => ({ ...f, status }))}
            options={STATUS_SEGMENTS}
          />
          <SearchInput
            className="w-full sm:w-auto sm:min-w-[200px] sm:flex-1"
            ariaLabel="Поиск по названию или slug"
            placeholder="Поиск по названию, slug…"
            value={filters.search}
            onChange={(search) => setFilters((f) => ({ ...f, search }))}
          />
        </FilterBar>
      )}

      <Card>
        {status === 'loading' ? (
          <TableSkeleton rows={6} cols={5} />
        ) : status === 'error' ? (
          <EmptyState
            icon={Briefcase}
            title="Не удалось загрузить"
            message="Проверьте, что бэкенд запущен, и попробуйте снова."
            action={<Button variant="secondary" onClick={load}>Повторить</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Вакансий пока нет"
            message="Создайте первую вакансию — она появится на публичном сайте."
            action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Новая вакансия</Button>}
          />
        ) : !sortMode && filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Ничего не найдено"
            message="Под текущие фильтры нет вакансий. Измените условия или сбросьте фильтры."
            action={<Button variant="secondary" onClick={resetFilters}>Сбросить фильтры</Button>}
          />
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  <th className="w-10" aria-label="Перетащить" />
                  <th className="px-5 py-3 font-semibold">Вакансия</th>
                  <th className="px-5 py-3 font-semibold">Теги</th>
                  <th className="px-5 py-3 font-semibold">Статус</th>
                  <th className="px-5 py-3 text-right font-semibold">{sortMode ? 'Переместить' : 'Действия'}</th>
                </tr>
              </thead>
              {draggable ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext items={dragRows.map((v) => v.slug)} strategy={verticalListSortingStrategy}>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {dragRows.map((v) => (
                        <SortableVacancyRow key={v.slug} v={v} {...rowHandlers} />
                      ))}
                    </tbody>
                  </SortableContext>
                </DndContext>
              ) : (
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {pg.pageItems.map((v) => (
                    <StaticVacancyRow key={v.slug} v={v} {...rowHandlers} />
                  ))}
                </tbody>
              )}
            </table>
          </div>
          {!sortMode && <Pagination page={pg.page} totalPages={pg.totalPages} onChange={pg.setPage} />}
          </>
        )}
      </Card>

      {/* Always mounted so the drawer plays its enter AND exit animation (a
          conditional mount would unmount it instantly on close). `formKey`
          remounts it on each open so its useState reseeds from `initial`. */}
      <VacancyForm key={formKey} open={formOpen} initial={editing} onClose={() => setFormOpen(false)} onSaved={load} />

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить вакансию?"
        message={`«${toDelete?.title}» будет удалена без возможности восстановления.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
