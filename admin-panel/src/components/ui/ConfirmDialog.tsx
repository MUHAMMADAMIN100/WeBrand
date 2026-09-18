import { AlertTriangle } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Button } from './Button'
import { usePresence } from '../../lib/usePresence'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Удалить',
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const { mounted, show } = usePresence(open, 200)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    // Focus lands on the safe choice; on close it returns to the trigger.
    restoreRef.current = document.activeElement as HTMLElement | null
    const t = window.setTimeout(() => cancelRef.current?.focus(), 60)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
      restoreRef.current?.focus?.({ preventScroll: true })
    }
  }, [open, onCancel])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
      <div
        onClick={onCancel}
        className={`absolute inset-0 bg-ink-950/60 backdrop-blur-[2px] transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className={`relative w-full max-w-md rounded-[1.5rem] bg-white p-6 shadow-xl transition-all duration-200 ease-out motion-reduce:transition-none dark:bg-ink-900 ${
          show ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'
        }`}
      >
        <div className="flex gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-50 dark:bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 id="confirm-title" className="font-display text-base font-bold text-ink-950 dark:text-white">
              {title}
            </h3>
            <p id="confirm-message" className="mt-1.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={loading}>
            Отмена
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
