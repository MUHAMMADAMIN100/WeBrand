import { Clapperboard, GripVertical, Pencil, Plus, SearchX, Trash2, Youtube } from 'lucide-react'
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
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Pagination } from '../components/ui/Pagination'
import { SortModeBar, RowMoveButtons } from '../components/Sortable'
import { FilterBar } from '../components/filters/FilterBar'
import { SearchInput } from '../components/filters/SearchInput'
import { useDebounce } from '../lib/useDebounce'
import { usePagination } from '../lib/usePagination'
import { useSortableList } from '../lib/useSortableList'
import { youtubeId, youtubeThumb } from '../lib/youtube'
import type { Reel } from '../lib/types'
import { deleteReel, listReels, patchReel } from '../api/resources'
import { useToast } from '../context/ToastContext'
import { ReelForm } from './ReelForm'

function ThumbCell({ reel }: { reel: Reel }) {
  const id = youtubeId(reel.youtube_url)
  return (
    <div className="grid h-11 w-[72px] shrink-0 place-items-center overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
      {id ? (
        <img src={youtubeThumb(id)} alt="" className="h-full w-full object-cover" />
      ) : (
        <Youtube className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
      )}
    </div>
  )
}

type RowHandlers = {
  onEdit: (r: Reel) => void
  onDelete: (r: Reel) => void
  sortMode: boolean
  onMoveStart: (r: Reel) => void
  onMoveEnd: (r: Reel) => void
}

function ReelCells({ r, onEdit, onDelete, sortMode, onMoveStart, onMoveEnd }: { r: Reel } & RowHandlers) {
  return (
    <>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <ThumbCell reel={r} />
          <div className="min-w-0">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
              {r.title || <span className="text-neutral-400 dark:text-neutral-500">Без названия</span>}
            </div>
            <a
              href={r.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="block max-w-[420px] truncate text-xs text-neutral-500 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-300"
            >
              {r.youtube_url}
            </a>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        {sortMode ? (
          <RowMoveButtons onStart={() => onMoveStart(r)} onEnd={() => onMoveEnd(r)} />
        ) : (
          <div className="flex items-center justify-end gap-1" onPointerDown={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(r)}
              className="cursor-pointer rounded-lg p-2 text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-600 dark:hover:text-brand-300"
              aria-label="Редактировать"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(r)}
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

function SortableReelRow({ r, ...handlers }: { r: Reel } & RowHandlers) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: r.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-label={`Рилс «${r.title || r.youtube_url}». Перетащите, чтобы изменить порядок`}
      className={`touch-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/60 ${
        isDragging ? 'relative z-10 cursor-grabbing bg-white dark:bg-neutral-900 shadow-lg' : 'cursor-grab hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40'
      }`}
    >
      <td className="py-3.5 pl-4 pr-1">
        <span className="inline-flex p-1.5 text-neutral-300 dark:text-neutral-600" aria-hidden="true">
          <GripVertical className="h-4 w-4" />
        </span>
      </td>
      <ReelCells r={r} {...handlers} />
    </tr>
  )
}

function StaticReelRow({ r, ...handlers }: { r: Reel } & RowHandlers) {
  return (
    <tr className="transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
      <td className="py-3.5 pl-4 pr-1">
        <span
          className="inline-flex p-1.5 text-neutral-200 dark:text-neutral-600"
          title="Включите «Сортировка», чтобы менять порядок"
        >
          <GripVertical className="h-4 w-4" />
        </span>
      </td>
      <ReelCells r={r} {...handlers} />
    </tr>
  )
}

export default function ReelsPage() {
  const toast = useToast()
  const [items, setItems] = useState<Reel[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [formOpen, setFormOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [editing, setEditing] = useState<Reel | null>(null)
  const [toDelete, setToDelete] = useState<Reel | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [searchRaw, setSearchRaw] = useState('')
  const search = useDebounce(searchRaw, 250)
  const filtersActive = search !== ''

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (r) => r.title.toLowerCase().includes(q) || r.youtube_url.toLowerCase().includes(q),
    )
  }, [items, search])

  const pg = usePagination(filtered, 12, search)

  const { sortMode, toggleSort, onDragEnd, moveToStart, moveToEnd } = useSortableList({
    items,
    setItems,
    getId: (r) => r.id,
    patch: patchReel,
    toast,
    onEnterSort: () => setSearchRaw(''),
  })

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setItems(await listReels())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }
  const openEdit = (r: Reel) => {
    setEditing(r)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteReel(toDelete.id)
      toast.success('Рилс удалён')
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
    sortMode,
    onMoveStart: moveToStart,
    onMoveEnd: moveToEnd,
  }

  return (
    <>
      <PageHeader
        title="Рилсы"
        subtitle="Видео с YouTube для страницы SMM. Включите «Сортировка», чтобы менять порядок по всему списку."
        action={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Новый рилс
          </Button>
        }
      />

      {status === 'ready' && items.length > 0 && (
        <SortModeBar active={sortMode} onToggle={toggleSort} />
      )}

      {status === 'ready' && items.length > 0 && !sortMode && (
        <FilterBar total={pg.total} from={pg.from} to={pg.to} active={filtersActive} onReset={() => setSearchRaw('')}>
          <SearchInput
            className="min-w-[200px] flex-1"
            ariaLabel="Поиск по названию или ссылке"
            placeholder="Поиск по названию или ссылке…"
            value={searchRaw}
            onChange={setSearchRaw}
          />
        </FilterBar>
      )}

      <Card>
        {status === 'loading' ? (
          <TableSkeleton rows={5} cols={3} />
        ) : status === 'error' ? (
          <EmptyState
            icon={Clapperboard}
            title="Не удалось загрузить"
            message="Проверьте, что бэкенд запущен, и попробуйте снова."
            action={<Button variant="secondary" onClick={load}>Повторить</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Clapperboard}
            title="Рилсов пока нет"
            message="Добавьте первый рилс — он появится в разделе «Видео и рилсы» на странице SMM."
            action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Новый рилс</Button>}
          />
        ) : !sortMode && filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Ничего не найдено"
            message="Под текущий поиск нет рилсов. Измените запрос или сбросьте поиск."
            action={<Button variant="secondary" onClick={() => setSearchRaw('')}>Сбросить поиск</Button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    <th className="w-10" aria-label="Перетащить" />
                    <th className="px-5 py-3 font-semibold">Рилс</th>
                    <th className="px-5 py-3 text-right font-semibold">{sortMode ? 'Переместить' : 'Действия'}</th>
                  </tr>
                </thead>
                {sortMode ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                    onDragEnd={onDragEnd}
                  >
                    <SortableContext items={items.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {items.map((r) => (
                          <SortableReelRow key={r.id} r={r} {...rowHandlers} />
                        ))}
                      </tbody>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {pg.pageItems.map((r) => (
                      <StaticReelRow key={r.id} r={r} {...rowHandlers} />
                    ))}
                  </tbody>
                )}
              </table>
            </div>
            {!sortMode && <Pagination page={pg.page} totalPages={pg.totalPages} onChange={pg.setPage} />}
          </>
        )}
      </Card>

      <ReelForm key={formKey} open={formOpen} initial={editing} onClose={() => setFormOpen(false)} onSaved={load} />

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить рилс?"
        message={`«${toDelete?.title || toDelete?.youtube_url}» будет удалён без возможности восстановления.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
