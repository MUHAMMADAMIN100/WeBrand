'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotionSafe as useReducedMotion } from '../lib/capabilities'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useModal } from '../context/ModalContext'
import ContactForm from './ContactForm'

/**
 * Modal shell around the multi-step ContactForm quiz.
 * Owns the overlay, backdrop-click / Esc close, body scroll lock and the
 * appear/exit animation; the form itself provides its own card styling.
 * The form remounts on every open (AnimatePresence), so its internal step
 * state resets automatically.
 */
// Leaving is quicker than arriving, and a tween ends on time (see ui/Dialog).
const EXIT = { duration: 0.2, ease: [0.4, 0, 1, 1] } as const

export default function ContactModal() {
  const { isOpen, close, contactPreselect, applyTarget } = useModal()
  const reduce = useReducedMotion()

  // Body scroll lock while open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: EXIT }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-6"
        >
          {/* Backdrop */}
          <div onClick={close} className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" aria-hidden="true" />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={applyTarget ? 'Форма отклика на вакансию' : 'Форма заявки'}
            data-lenis-prevent
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0, transition: EXIT } : { opacity: 0, scale: 0.97, y: 16, transition: EXIT }}
            transition={reduce ? { duration: 0.15 } : { type: 'spring', damping: 30, stiffness: 320 }}
            className="relative h-[100dvh] max-h-[100dvh] w-full overflow-y-auto overscroll-contain lg:h-auto lg:max-h-[90dvh] lg:max-w-[920px]"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть"
              className="absolute right-3 top-3 z-30 grid h-11 w-11 touch-manipulation place-items-center rounded-full bg-ink-950 text-white transition-colors duration-300 ease-expo hover:bg-lime hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <ContactForm initialSelected={contactPreselect} applyTarget={applyTarget} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
