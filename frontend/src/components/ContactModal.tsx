'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRef } from 'react'
import { useReducedMotionSafe as useReducedMotion } from '../lib/capabilities'
import { useDialogBehaviour } from '../lib/useDialogBehaviour'
import { useModal } from '../context/ModalContext'
import ContactForm from './ContactForm'
import { DIALOG_EXIT, DialogClose } from './ui/Dialog'

/**
 * Modal shell around the multi-step ContactForm quiz.
 * Its own shell rather than ui/Dialog because of its geometry (the whole screen
 * below lg, and the form brings its own card), but the same behaviour: scroll
 * lock, focus in and back out, focus trap, Esc — all from useDialogBehaviour.
 * The form remounts on every open (AnimatePresence), so its internal step
 * state resets automatically.
 */
export default function ContactModal() {
  const { isOpen, close, contactPreselect, applyTarget } = useModal()
  const reduce = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  useDialogBehaviour(isOpen, close, panelRef)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: DIALOG_EXIT }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-6"
        >
          {/* Backdrop */}
          <div onClick={close} className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" aria-hidden="true" />

          {/* Dialog */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={applyTarget ? 'Форма отклика на вакансию' : 'Форма заявки'}
            tabIndex={-1}
            data-lenis-prevent
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0, transition: DIALOG_EXIT } : { opacity: 0, scale: 0.97, y: 16, transition: DIALOG_EXIT }}
            transition={reduce ? { duration: 0.15 } : { type: 'spring', damping: 30, stiffness: 320 }}
            className="relative h-[100dvh] max-h-[100dvh] w-full overflow-y-auto overscroll-contain outline-none lg:h-auto lg:max-h-[90dvh] lg:max-w-[920px]"
          >
            <DialogClose onClick={close} className="absolute right-3 top-3 z-30" />

            <ContactForm initialSelected={contactPreselect} applyTarget={applyTarget} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
