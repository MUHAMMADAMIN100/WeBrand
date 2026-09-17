'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { useReducedMotionSafe } from '../../lib/capabilities'
import { cn } from '../../lib/utils'

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

// Leaving is quicker than arriving, and a tween ends on time — a spring's tail
// would keep the dialog in the tree (and in the way) after it looks closed.
const EXIT = { duration: 0.2, ease: [0.4, 0, 1, 1] } as const

type DialogProps = {
  open: boolean
  onClose: () => void
  /** id of the heading that names the dialog. */
  labelledBy: string
  /** Sizing of the panel, e.g. `max-w-lg`. */
  className?: string
  children: ReactNode
}

/** The modal shell of the design system: backdrop, body scroll lock, focus in
 *  and back out, focus trap, Esc. The close button lives on the panel, not in
 *  the scrolling content, so it stays reachable however long the content is. */
export default function Dialog({ open, onClose, labelledBy, className, children }: DialogProps) {
  const reduce = useReducedMotionSafe()
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  // Lock body scroll while open (SmoothScroll pauses Lenis off the same signal).
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Focus the dialog on open; hand focus back to the trigger on close.
  useEffect(() => {
    if (!open) return
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    const t = setTimeout(() => panelRef.current?.focus(), 60)
    return () => {
      clearTimeout(t)
      restoreFocusRef.current?.focus?.()
    }
  }, [open])

  // Esc to close + focus trap, scoped to the dialog.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const nodes = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
    if (!nodes.length) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: EXIT }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
          onKeyDown={onKeyDown}
        >
          <div onClick={onClose} className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" aria-hidden="true" />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0, transition: EXIT } : { opacity: 0, scale: 0.97, y: 16, transition: EXIT }}
            transition={reduce ? { duration: 0.15 } : { type: 'spring', damping: 30, stiffness: 320 }}
            className={cn(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl outline-none',
              className,
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute right-4 top-4 z-20 grid h-11 w-11 touch-manipulation place-items-center rounded-full bg-ink-950 text-white transition-colors duration-300 ease-expo hover:bg-lime hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* data-lenis-prevent: wheel and touch inside scroll the panel, not the page. */}
            <div data-lenis-prevent className="overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Blue surface that opens a dialog. Right padding keeps the title clear of the close button. */
export function DialogHeader({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('relative isolate overflow-hidden bg-brand-600 p-6 pr-20 text-white sm:p-9 sm:pr-24', className)}>
      <div className="bg-grid-dark pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
      {children}
    </div>
  )
}
