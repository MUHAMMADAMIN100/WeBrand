import { FolderKanban, GripVertical, Pencil, Plus, SearchX, Trash2 } from 'lucide-react'
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
import { Badge, PublishBadge } from '../components/ui/Badge'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Toggle } from '../components/ui/Toggle'
import { Pagination } from '../components/ui/Pagination'
import { FilterBar } from '../components/filters/FilterBar'
import { SegmentedControl, type Segment } from '../components/filters/SegmentedControl'
import { SearchInput } from '../components/filters/SearchInput'
import { CATEGORY_OPTIONS } from '../lib/options'
import { useDebounce } from '../lib/useDebounce'
import { usePagination } from '../lib/usePagination'
import type { Project } from '../lib/types'
import { deleteProject, listProjects, patchProject } from '../api/resources'
import { useToast } from '../context/ToastContext'
import { ProjectForm } from './ProjectForm'

type StatusFilter = 'all' | 'published' | 'draft'
type CategoryFilter = 'all' | (typeof CATEGORY_OPTIONS)[number]
type Filters = { category: CategoryFilter; status: StatusFilter; search: string }
const DEFAULT_FILTERS: Filters = { category: 'all', status: 'all', search: '' }

// Category facet derives from the cross-app CATEGORY_CHOICES contract.
const CATEGORY_SEGMENTS: Segment<CategoryFilter>[] = [
  { value: 'all', label: 'Все' },
  ...CATEGORY_OPTIONS.map((c) => ({ value: c, label: c })),
]
const STATUS_SEGMENTS: Segment<StatusFilter>[] = [
  { value: 'all', label: 'Все' },
  { value: 'published', label: 'Опубликовано' },
  { value: 'draft', label: 'Черновик' },
]

function LogoCell({ project }: { project: Project }) {
  const initials = project.initials || project.name.slice(0, 2).toUpperCase()
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
      {project.logo ? (
        <img src={project.logo} alt="" className="max-h-8 max-w-9 object-contain" />
      ) : (
        <span className="text-xs font-extrabold text-brand-700 dark:text-brand-300">{initials}</span>
      )}
    </div>
  )
}

type RowHandlers = {
  onEdit: (p: Project) => void
  onDelete: (p: Project) => void
  onToggle: (p: Project) => void
}

/** The content cells shared by the sortable and static rows. */
function ProjectCells({ p, onEdit, onDelete, onToggle }: { p: Project } & RowHandlers) {
  return (
    <>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <LogoCell project={p} />
          <div className="min-w-0">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">{p.name}</div>
            <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">{p.subtitle}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <Badge tone={p.category === 'SMM' ? 'violet' : 'brand'}>{p.category}</Badge>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <PublishBadge published={p.is_published} />
          {/* Keep the toggle clickable; don't let a tap on it start a row drag. */}
          <span className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()}>
            <Toggle checked={p.is_published} onChange={() => onToggle(p)} />
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1" onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(p)}
            className="cursor-pointer rounded-lg p-2 text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-600 dark:hover:text-brand-300"
            aria-label="Редактировать"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(p)}
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

/** Draggable row (used only when the list is unfiltered, i.e. truly in order).
 * The whole row is the drag target — listeners/attributes live on the <tr>, so
 * it can be grabbed anywhere. Interactive controls inside (toggle, edit, delete)
 * stopPropagation on pointerdown so they stay clickable and never start a drag. */
function SortableProjectRow({ p, ...handlers }: { p: Project } & RowHandlers) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-label={`Проект «${p.name}». Перетащите, чтобы изменить порядок`}
      className={`touch-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/60 ${
        isDragging ? 'relative z-10 cursor-grabbing bg-white dark:bg-neutral-900 shadow-lg' : 'cursor-grab hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40'
      }`}
    >
      <td className="py-3.5 pl-4 pr-1">
        <span className="inline-flex p-1.5 text-neutral-300 dark:text-neutral-600" aria-hidden="true">
          <GripVertical className="h-4 w-4" />
        </span>
      </td>
      <ProjectCells p={p} {...handlers} />
    </tr>
  )
}

/** Static row (used while filtered/searched — reordering a subset is ambiguous). */
function StaticProjectRow({ p, ...handlers }: { p: Project } & RowHandlers) {
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
      <ProjectCells p={p} {...handlers} />
    </tr>
  )
}

export default function ProjectsPage() {
  const toast = useToast()
  const [items, setItems] = useState<Project[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [formOpen, setFormOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [editing, setEditing] = useState<Project | null>(null)
  const [toDelete, setToDelete] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const search = useDebounce(filters.search, 250)
  const filtersActive = filters.category !== 'all' || filters.status !== 'all' || filters.search !== ''
  // Drag reordering only when the list shows every row in its true order.
  const reorderable = !filtersActive

  const sensors = useSensors(
    // ~8px before a press becomes a drag, so a plain click on the row never reorders.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((p) => {
      if (filters.category !== 'all' && p.category !== filters.category) return false
      if (filters.status === 'published' && !p.is_published) return false
      if (filters.status === 'draft' && p.is_published) return false
      if (q && !p.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [items, filters.category, filters.status, search])

  // Client-side pagination (12/page) over the filtered list. Drag-reorder (when
  // unfiltered) operates within the visible page; resets to page 1 on filter change.
  const pg = usePagination(filtered, 12, `${filters.category}|${filters.status}|${search}`)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setItems(await listProjects())
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
  const openEdit = (p: Project) => {
    setEditing(p)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }

  const togglePublish = async (p: Project) => {
    setItems((arr) => arr.map((x) => (x.id === p.id ? { ...x, is_published: !x.is_published } : x)))
    try {
      await patchProject(p.id, { is_published: !p.is_published })
      toast.success(!p.is_published ? 'Опубликовано' : 'Снято с публикации')
    } catch (err) {
      setItems((arr) => arr.map((x) => (x.id === p.id ? { ...x, is_published: p.is_published } : x)))
      toast.error(err instanceof Error ? err.message : 'Не удалось изменить')
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldList = items
    const oldIndex = items.findIndex((p) => p.id === active.id)
    const newIndex = items.findIndex((p) => p.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    // Reassign sequential sort_order; optimistic update; PATCH only changed rows.
    const reordered = arrayMove(items, oldIndex, newIndex).map((p, i) => ({ ...p, sort_order: i }))
    setItems(reordered)
    const changed = reordered.filter(
      (p) => oldList.find((o) => o.id === p.id)?.sort_order !== p.sort_order,
    )
    try {
      await Promise.all(changed.map((p) => patchProject(p.id, { sort_order: p.sort_order })))
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
      await deleteProject(toDelete.id)
      toast.success('Проект удалён')
      setToDelete(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка удаления')
    } finally {
      setDeleting(false)
    }
  }

  const rowHandlers: RowHandlers = { onEdit: openEdit, onDelete: setToDelete, onToggle: togglePublish }

  return (
    <>
      <PageHeader
        title="Проекты"
        subtitle="Перетаскивайте строки, чтобы задать порядок в портфолио на сайте"
        action={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Новый проект
          </Button>
        }
      />

      {status === 'ready' && items.length > 0 && (
        <FilterBar total={pg.total} from={pg.from} to={pg.to} active={filtersActive} onReset={resetFilters}>
          <SegmentedControl
            ariaLabel="Категория"
            value={filters.category}
            onChange={(category) => setFilters((f) => ({ ...f, category }))}
            options={CATEGORY_SEGMENTS}
          />
          <SegmentedControl
            ariaLabel="Статус публикации"
            value={filters.status}
            onChange={(status) => setFilters((f) => ({ ...f, status }))}
            options={STATUS_SEGMENTS}
          />
          <SearchInput
            className="min-w-[200px] flex-1"
            ariaLabel="Поиск по названию"
            placeholder="Поиск по названию…"
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
            icon={FolderKanban}
            title="Не удалось загрузить"
            message="Проверьте, что бэкенд запущен, и попробуйте снова."
            action={<Button variant="secondary" onClick={load}>Повторить</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Проектов пока нет"
            message="Добавьте первый проект — он появится в портфолио на сайте."
            action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Новый проект</Button>}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Ничего не найдено"
            message="Под текущие фильтры нет проектов. Измените условия или сбросьте фильтры."
            action={<Button variant="secondary" onClick={resetFilters}>Сбросить фильтры</Button>}
          />
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  <th className="w-10" aria-label="Перетащить" />
                  <th className="px-5 py-3 font-semibold">Проект</th>
                  <th className="px-5 py-3 font-semibold">Категория</th>
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
                  <SortableContext items={pg.pageItems.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {pg.pageItems.map((p) => (
                        <SortableProjectRow key={p.id} p={p} {...rowHandlers} />
                      ))}
                    </tbody>
                  </SortableContext>
                </DndContext>
              ) : (
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {pg.pageItems.map((p) => (
                    <StaticProjectRow key={p.id} p={p} {...rowHandlers} />
                  ))}
                </tbody>
              )}
            </table>
          </div>
          <Pagination page={pg.page} totalPages={pg.totalPages} onChange={pg.setPage} />
          </>
        )}
      </Card>

      {/* Always mounted so the drawer plays its enter AND exit animation (a
          conditional mount would unmount it instantly on close). `formKey`
          remounts it on each open so its useState reseeds from `initial`. */}
      <ProjectForm key={formKey} open={formOpen} initial={editing} onClose={() => setFormOpen(false)} onSaved={load} />

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить проект?"
        message={`«${toDelete?.name}» будет удалён без возможности восстановления.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
