'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Clock, Sparkles, Target, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useModal } from '../context/ModalContext'
import { directionsForService } from './ContactForm'

export default function ServiceDetailModal() {
  const { serviceDetail, closeServiceDetail, open: openContact } = useModal()
  const reduce = useReducedMotion()
  const isOpen = !!serviceDetail

  const modalRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isOpen])

  // Focus the dialog on open; restore focus to the trigger on close
  useEffect(() => {
    if (!isOpen) return
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    const t = setTimeout(() => modalRef.current?.focus(), 60)
    return () => {
      clearTimeout(t)
      restoreFocusRef.current?.focus?.()
    }
  }, [isOpen])

  // Focus trap + Esc, scoped to the dialog
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      closeServiceDetail()
      return
    }
    if (e.key !== 'Tab' || !modalRef.current) return
    const nodes = modalRef.current.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
    )
    if (!nodes.length) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const handleOrder = () => {
    const preselect = serviceDetail ? directionsForService(serviceDetail.parent) : []
    closeServiceDetail()
    setTimeout(() => openContact(preselect), 200)
  }

  return (
    <AnimatePresence>
      {isOpen && serviceDetail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onKeyDown={onKeyDown}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeServiceDetail}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sdm-title"
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={reduce ? { duration: 0.15 } : { type: 'spring', damping: 28, stiffness: 320 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto outline-none"
          >
            {/* Header gradient */}
            <div className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-8 sm:p-10 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)] pointer-events-none" />

              <button
                type="button"
                onClick={closeServiceDetail}
                aria-label="Закрыть"
                className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur flex items-center justify-center text-white transition-colors touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  {serviceDetail.parent}
                </div>
                <h2 id="sdm-title" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.1]">
                  {serviceDetail.sub.title}
                </h2>
                <p className="mt-2 text-white/85 text-sm sm:text-base leading-relaxed max-w-xl">
                  {serviceDetail.sub.short}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 sm:p-10 space-y-8">
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                {serviceDetail.sub.description}
              </p>

              <div>
                <h3 className="text-sm font-bold text-brand-600 uppercase tracking-[0.15em] mb-4">
                  Что входит
                </h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {serviceDetail.sub.includes.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={reduce ? false : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={reduce ? { duration: 0 } : { delay: 0.15 + i * 0.04 }}
                      className="flex items-start gap-3 text-neutral-800"
                    >
                      <span className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-brand-600" strokeWidth={3} />
                      </span>
                      <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center gap-2 text-brand-600 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Срок</span>
                  </div>
                  <p className="text-neutral-900 font-semibold">{serviceDetail.sub.timeline}</p>
                </div>
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center gap-2 text-brand-600 mb-2">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Кому подходит</span>
                  </div>
                  <p className="text-neutral-900 text-sm leading-relaxed">{serviceDetail.sub.bestFor}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOrder}
                  className="flex-1 py-4 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  Заказать эту услугу
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeServiceDetail}
                  className="py-4 px-6 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold transition-colors"
                >
                  Закрыть
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
