import { useRef } from 'react'

export type Segment<T extends string> = { value: T; label: string }

/**
 * Compact segmented radio group (Все / … ). Keyboard: arrow keys move + select,
 * Home/End jump to ends. Roving tabindex keeps it a single tab stop.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T
  onChange: (v: T) => void
  options: Segment<T>[]
  ariaLabel: string
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const move = (delta: number) => {
    const i = options.findIndex((o) => o.value === value)
    const next = (i + delta + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex max-w-full flex-wrap items-center gap-0.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 p-1"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          move(1)
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          move(-1)
        } else if (e.key === 'Home') {
          e.preventDefault()
          onChange(options[0].value)
          refs.current[0]?.focus()
        } else if (e.key === 'End') {
          e.preventDefault()
          const last = options.length - 1
          onChange(options[last].value)
          refs.current[last]?.focus()
        }
      }}
    >
      {options.map((o, i) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors duration-150 ${
              active
                ? 'bg-white text-brand-700 shadow-sm dark:bg-neutral-900 dark:text-brand-300'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
