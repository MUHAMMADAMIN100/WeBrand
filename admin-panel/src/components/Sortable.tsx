import { ArrowUpDown, Check, ChevronsDown, ChevronsUp } from 'lucide-react'
import type { DraggableAttributes } from '@dnd-kit/core'
import { Button } from './ui/Button'

/** dnd-kit's row attributes without `role="button"`: a table row that holds
 *  buttons and a switch must not itself be a button (nested interactive). The
 *  keyboard drag still works — it listens on the focusable row, not the role. */
export function rowAttributes({ role: _role, ...rest }: DraggableAttributes) {
  return rest
}

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
        aria-pressed={active}
      >
        {active ? 'Готово' : 'Сортировка'}
      </Button>
      {active ? (
        <span className="inline-flex items-center rounded-full bg-lime-soft px-3 py-1.5 text-xs font-medium text-ink-950 dark:bg-lime/15 dark:text-lime">
          Перетаскивайте строки по всему списку или жмите «В начало / В конец». Фильтры отключены.
        </span>
      ) : (
        <span className="text-xs text-ink-600 dark:text-ink-400">
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
    'grid h-9 w-9 cursor-pointer place-items-center rounded-full text-ink-500 transition-colors hover:bg-ink-950 hover:text-white dark:text-ink-400 dark:hover:bg-white dark:hover:text-ink-950'
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
