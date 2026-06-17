import { GripVertical, Handshake, Link2, Pencil, Plus, SearchX, Trash2 } from 'lucide-react'
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
import type { Partner } from '../lib/types'
import { deletePartner, listPartners, patchPartner } from '../api/resources'
import { useToast } from '../context/ToastContext'
import { PartnerForm } from './PartnerForm'

function LogoCell({ partner }: { partner: Partner }) {
  const initials = partner.name.slice(0, 2).toUpperCase()
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
      {partner.logo ? (
        <img src={partner.logo} alt="" className="max-h-8 max-w-9 object-contain" />
      ) : (
        <span className="text-xs font-extrabold text-brand-700 dark:text-brand-300">{initials}</span>
      )}
    </div>
  )
}

type RowHandlers = {
  onEdit: (p: Partner) => void
  onDelete: (p: Partner) => void
  sortMode: boolean
  onMoveStart: (p: Partner) => void
  onMoveEnd: (p: Partner) => void
}

function PartnerCells({ p, onEdit, onDelete, sortMode, onMoveStart, onMoveEnd }: { p: Partner } & RowHandlers) {
  return (
    <>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <LogoCell partner={p} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-100">
              {p.name}
              {p.link && (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="text-neutral-400 transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                  aria-label="Открыть ссылку"
                  title={p.link}
                >
                  <Link2 className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            {p.niche && <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">{p.niche}</div>}
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="max-w-[360px] truncate text-sm text-neutral-600 dark:text-neutral-300">
          {p.result || <span className="text-neutral-400 dark:text-neutral-500">—</span>}
        </div>
      </td>
      <td className="px-5 py-3.5">
        {sortMode ? (
          <RowMoveButtons onStart={() => onMoveStart(p)} onEnd={() => onMoveEnd(p)} />
        ) : (
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
        )}
      </td>
    </>
  )
}

function SortablePartnerRow({ p, ...handlers }: { p: Partner } & RowHandlers) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-label={`Партнёр «${p.name}». Перетащите, чтобы изменить порядок`}
      className={`touch-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/60 ${
        isDragging ? 'relative z-10 cursor-grabbing bg-white dark:bg-neutral-900 shadow-lg' : 'cursor-grab hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40'
      }`}
    >
      <td className="py-3.5 pl-4 pr-1">
        <span className="inline-flex p-1.5 text-neutral-300 dark:text-neutral-600" aria-hidden="true">
          <GripVertical className="h-4 w-4" />
        </span>
      </td>
      <PartnerCells p={p} {...handlers} />
    </tr>
  )
}

function StaticPartnerRow({ p, ...handlers }: { p: Partner } & RowHandlers) {
  return (
    <tr className="transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
      <td className="py-3.5 pl-4 pr-1">
        <span
          className="inline-flex p-1.5 text-neutral-200 dark:text-neutral-600"
          title="Сбросьте поиск, чтобы перетаскивать, или включите «Сортировка»"
        >
          <GripVertical className="h-4 w-4" />
        </span>
      </td>
      <PartnerCells p={p} {...handlers} />
    </tr>
  )
}

export default function PartnersPage() {
  const toast = useToast()
  const [items, setItems] = useState<Partner[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [formOpen, setFormOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [editing, setEditing] = useState<Partner | null>(null)
  const [toDelete, setToDelete] = useState<Partner | null>(null)
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
      (p) => p.name.toLowerCase().includes(q) || p.niche.toLowerCase().includes(q),
    )
  }, [items, search])

  const pg = usePagination(filtered, 12, search)

  const { sortMode, toggleSort, onDragEnd, moveToStart, moveToEnd } = useSortableList({
    items,
    setItems,
    getId: (p) => p.id,
    patch: patchPartner,
    toast,
    onEnterSort: () => setSearchRaw(''),
  })

  // Ordinary in-page drag works without sort mode — whenever the list is in its
  // true order (no search). Sort mode additionally drags across all pages.
  const draggable = sortMode || !filtersActive
  const dragRows = sortMode ? items : pg.pageItems

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setItems(await listPartners())
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
  const openEdit = (p: Partner) => {
    setEditing(p)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deletePartner(toDelete.id)
      toast.success('Партнёр удалён')
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
        title="Партнёры"
        subtitle="Карточки партнёров для страницы SMM. Перетаскивайте строки прямо здесь, а «Сортировка» — чтобы переносить через все страницы."
        action={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Новый партнёр
          </Button>
        }
      />

      {status === 'ready' && items.length > 0 && (
        <SortModeBar active={sortMode} onToggle={toggleSort} />
      )}

      {status === 'ready' && items.length > 0 && !sortMode && (
        <FilterBar total={pg.total} from={pg.from} to={pg.to} active={filtersActive} onReset={() => setSearchRaw('')}>
          <SearchInput
            className="w-full sm:w-auto sm:min-w-[200px] sm:flex-1"
            ariaLabel="Поиск по названию или нише"
            placeholder="Поиск по названию или нише…"
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
            icon={Handshake}
            title="Не удалось загрузить"
            message="Проверьте, что бэкенд запущен, и попробуйте снова."
            action={<Button variant="secondary" onClick={load}>Повторить</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Handshake}
            title="Партнёров пока нет"
            message="Добавьте первого партнёра — карточка появится в разделе «Сильные партнёры» на странице SMM."
            action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Новый партнёр</Button>}
          />
        ) : !sortMode && filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Ничего не найдено"
            message="Под текущий поиск нет партнёров. Измените запрос или сбросьте поиск."
            action={<Button variant="secondary" onClick={() => setSearchRaw('')}>Сбросить поиск</Button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    <th className="w-10" aria-label="Перетащить" />
                    <th className="px-5 py-3 font-semibold">Партнёр</th>
                    <th className="px-5 py-3 font-semibold">Результат</th>
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
                    <SortableContext items={dragRows.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {dragRows.map((p) => (
                          <SortablePartnerRow key={p.id} p={p} {...rowHandlers} />
                        ))}
                      </tbody>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {pg.pageItems.map((p) => (
                      <StaticPartnerRow key={p.id} p={p} {...rowHandlers} />
                    ))}
                  </tbody>
                )}
              </table>
            </div>
            {!sortMode && <Pagination page={pg.page} totalPages={pg.totalPages} onChange={pg.setPage} />}
          </>
        )}
      </Card>

      <PartnerForm key={formKey} open={formOpen} initial={editing} onClose={() => setFormOpen(false)} onSaved={load} />

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить партнёра?"
        message={`«${toDelete?.name}» будет удалён без возможности восстановления.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
