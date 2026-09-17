'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import { useReducedMotionSafe } from '../../lib/capabilities'
import { useDialogBehaviour } from '../../lib/useDialogBehaviour'
import { cn } from '../../lib/utils'

// Leaving is quicker than arriving, and a tween ends on time — a spring's tail
// would keep the dialog in the tree (and in the way) after it looks closed.
export const DIALOG_EXIT = { duration: 0.2, ease: [0.4, 0, 1, 1] } as const

type DialogProps = {
  open: boolean
  onClose: () => void
  /** id of the heading that names the dialog. */
  labelledBy: string
  /** Sizing of the panel, e.g. `max-w-lg`. */
  className?: string
  children: ReactNode
}

/** The modal shell of the design system. Behaviour (scroll lock, focus in and
 *  back out, focus trap, Esc) comes from `useDialogBehaviour`; this adds the
 *  look. The close button lives on the panel, not in the scrolling content, so
 *  it stays reachable however long the content is. */
export default function Dialog({ open, onClose, labelledBy, className, children }: DialogProps) {
  const reduce = useReducedMotionSafe()
  const panelRef = useRef<HTMLDivElement>(null)
  useDialogBehaviour(open, onClose, panelRef)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: DIALOG_EXIT }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
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
            exit={reduce ? { opacity: 0, transition: DIALOG_EXIT } : { opacity: 0, scale: 0.97, y: 16, transition: DIALOG_EXIT }}
            transition={reduce ? { duration: 0.15 } : { type: 'spring', damping: 30, stiffness: 320 }}
            className={cn(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl outline-none',
              className,
            )}
          >
            <DialogClose onClick={onClose} className="absolute right-4 top-4 z-20" />

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

/** The round close button every dialog carries: ink on any surface, 44px.
 *  Its focus ring is two-tone (white gap, ink ring) so it reads both on the blue
 *  header and on a white form. */
export function DialogClose({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Закрыть"
      className={cn(
        'grid h-11 w-11 touch-manipulation place-items-center rounded-full bg-ink-950 text-white transition-colors duration-300 ease-expo hover:bg-lime hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        className,
      )}
    >
      <X className="h-5 w-5" aria-hidden="true" />
    </button>
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
