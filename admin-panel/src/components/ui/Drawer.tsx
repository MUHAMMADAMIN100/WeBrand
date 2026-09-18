import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { usePresence } from '../../lib/usePresence'

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  const { mounted, show } = usePresence(open, 260)
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      // A list inside (Listbox) that used Esc marks it handled — leave the drawer open.
      if (e.key === 'Escape' && !e.defaultPrevented) onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Focus moves into the drawer and, on close, back to what opened it.
    restoreRef.current = document.activeElement as HTMLElement | null
    const t = window.setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 80)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
      document.body.style.overflow = prev
      restoreRef.current?.focus?.({ preventScroll: true })
    }
  }, [open, onClose])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[150]">
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink-950/60 backdrop-blur-[2px] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-drawer outline-none transition-transform duration-[260ms] ease-expo motion-reduce:transition-none dark:bg-ink-900 ${
          show ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-ink-200 px-6 py-5 dark:border-ink-800">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950 dark:text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="-mr-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-950 text-white transition-colors duration-200 hover:bg-lime hover:text-ink-950 dark:bg-white dark:text-ink-950 dark:hover:bg-lime"
            aria-label="Закрыть"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </header>

        <div className="scroll-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-ink-200 bg-paper px-6 py-4 dark:border-ink-800 dark:bg-ink-900">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
