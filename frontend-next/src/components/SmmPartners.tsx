'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Sparkles, TrendingUp, X } from 'lucide-react'
import type { Partner } from '../lib/api'

// Section 4 of /smm: «сильные партнёры» cards. Every field except `name` is
// optional — a missing logo/niche/description/result is handled gracefully.
// Clicking a card opens a details modal (the `link` field is intentionally
// unused on the site).
export default function SmmPartners({ partners }: { partners: Partner[] }) {
  const [selected, setSelected] = useState<Partner | null>(null)

  if (!partners || partners.length === 0) return null

  return (
    <section className="relative bg-white py-14 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-6 lg:px-10">
        <div className="mb-8 md:mb-12">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">— Партнёры</span>
          <h2 className="mt-5 text-3xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 sm:text-4xl">
            Сильные партнёры
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
            Бренды и компании, с которыми мы работаем над продвижением в социальных сетях.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {partners.map((partner, i) => (
            <PartnerCard key={partner.id} partner={partner} index={i} onOpen={() => setSelected(partner)} />
          ))}
        </div>
      </div>

      <PartnerModal partner={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

function LogoOrInitials({
  partner,
  className,
  imgClassName,
  initialsClassName,
}: {
  partner: Partner
  className: string
  imgClassName: string
  initialsClassName: string
}) {
  const [imgError, setImgError] = useState(false)
  const showLogo = Boolean(partner.logo) && !imgError
  return (
    <div className={className}>
      {showLogo ? (
        <img
          src={partner.logo as string}
          alt={partner.name}
          loading="lazy"
          onError={() => setImgError(true)}
          className={imgClassName}
        />
      ) : (
        <span className={initialsClassName}>{partner.name.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  )
}

function PartnerCard({ partner, index, onOpen }: { partner: Partner; index: number; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
      aria-label={`Подробнее о партнёре: ${partner.name}`}
      className="group flex h-full flex-col rounded-3xl border border-neutral-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-brand-600 hover:shadow-xl hover:shadow-brand-600/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 lg:p-7"
    >
      <LogoOrInitials
        partner={partner}
        className="flex h-16 items-center"
        imgClassName="max-h-14 max-w-[160px] object-contain"
        initialsClassName="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-lg font-extrabold text-brand-600"
      />

      <h3 className="mt-5 text-lg font-bold text-neutral-900">{partner.name}</h3>
      {partner.niche && <p className="mt-1 text-sm font-semibold text-brand-600">{partner.niche}</p>}
      {partner.result && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-600">{partner.result}</p>
      )}

      <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-brand-600">
        Подробнее
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </motion.button>
  )
}

function PartnerModal({ partner, onClose }: { partner: Partner | null; onClose: () => void }) {
  const reduce = useReducedMotion()
  const isOpen = !!partner
  const modalRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  // Lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  // Focus the dialog on open; restore focus to the trigger on close.
  useEffect(() => {
    if (!isOpen) return
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    const t = setTimeout(() => modalRef.current?.focus(), 60)
    return () => {
      clearTimeout(t)
      restoreFocusRef.current?.focus?.()
    }
  }, [isOpen])

  // Esc to close + focus trap, scoped to the dialog.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
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

  return (
    <AnimatePresence>
      {isOpen && partner && (
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
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-modal-title"
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={reduce ? { duration: 0.15 } : { type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl outline-none"
          >
            {/* Header gradient */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-6 text-white sm:p-8">
              <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="absolute right-4 top-4 z-30 flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 active:bg-white/30"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative flex items-center gap-4">
                <LogoOrInitials
                  key={partner.id}
                  partner={partner}
                  className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg"
                  imgClassName="max-h-12 max-w-12 object-contain"
                  initialsClassName="text-xl font-extrabold text-brand-600"
                />
                <div className="min-w-0">
                  <h2 id="partner-modal-title" className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                    {partner.name}
                  </h2>
                  {partner.niche && (
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      <Sparkles className="h-3.5 w-3.5" />
                      {partner.niche}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            {(partner.result || partner.description) && (
              <div className="space-y-6 p-6 sm:p-8">
                {partner.result && (
                  <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600/10 text-brand-600">
                      <TrendingUp className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-brand-600">Результат</div>
                      <p className="mt-0.5 font-semibold text-neutral-900">{partner.result}</p>
                    </div>
                  </div>
                )}

                {partner.description && (
                  <div>
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.15em] text-brand-600">О компании</h3>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700 sm:text-base">
                      {partner.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end border-t border-neutral-100 px-6 py-4 sm:px-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="rounded-xl bg-brand-50 px-6 py-3 font-semibold text-brand-700 transition-colors hover:bg-brand-100"
              >
                Закрыть
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
