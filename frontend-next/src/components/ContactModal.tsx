'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
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
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-neutral-950/55 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={applyTarget ? 'Форма отклика на вакансию' : 'Форма заявки'}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 16 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative h-[100dvh] max-h-[100dvh] w-full overflow-y-auto lg:h-auto lg:max-h-[90dvh] lg:max-w-[920px]"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть"
              className="absolute right-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-neutral-500 backdrop-blur transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <X className="h-5 w-5" />
            </button>

            <ContactForm initialSelected={contactPreselect} applyTarget={applyTarget} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
