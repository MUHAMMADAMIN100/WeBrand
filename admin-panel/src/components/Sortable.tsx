import { ArrowUpDown, Check, ChevronsDown, ChevronsUp } from 'lucide-react'
import { Button } from './ui/Button'

/**
 * The «Сортировка» toggle shown above a reorderable list. OFF = normal
 * paginated/filtered browsing; ON = the whole list with drag-and-drop across
 * every item (filters/pagination hidden by the page).
 */
export function SortModeBar({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Button
        variant={active ? 'primary' : 'secondary'}
        size="sm"
        icon={active ? <Check className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4" />}
        onClick={onToggle}
      >
        {active ? 'Готово' : 'Сортировка'}
      </Button>
      {active ? (
        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          Перетаскивайте строки по всему списку или жмите «В начало / В конец». Фильтры отключены.
        </span>
      ) : (
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          Включите, чтобы менять порядок перетаскиванием по всему списку (через границы страниц).
        </span>
      )}
    </div>
  )
}

/** In-row quick reorder actions (sort mode): move this row to the very top /
 * bottom of the whole list — a fast path without long dragging. */
export function RowMoveButtons({ onStart, onEnd }: { onStart: () => void; onEnd: () => void }) {
  const cls =
    'cursor-pointer rounded-lg p-2 text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-600 dark:hover:text-brand-300'
  return (
    // stopPropagation so a tap on a button never starts a row drag.
    <div className="flex items-center justify-end gap-1" onPointerDown={(e) => e.stopPropagation()}>
      <button onClick={onStart} className={cls} aria-label="В начало" title="В начало">
        <ChevronsUp className="h-4 w-4" />
      </button>
      <button onClick={onEnd} className={cls} aria-label="В конец" title="В конец">
        <ChevronsDown className="h-4 w-4" />
      </button>
    </div>
  )
}
