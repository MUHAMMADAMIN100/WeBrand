'use client'

import { useState } from 'react'
import { ArrowUpRight, TrendingUp } from 'lucide-react'
import type { Partner } from '../lib/api'
import RevealText from './motion/RevealText'
import Button from './ui/Button'
import Dialog, { DialogHeader } from './ui/Dialog'

// Section 4 of /smm: «сильные партнёры» cards. Every field except `name` is
// optional — a missing logo/niche/description/result is handled gracefully.
// Clicking a card opens a details modal (the `link` field is intentionally
// unused on the site).
export default function SmmPartners({ partners }: { partners: Partner[] }) {
  const [selected, setSelected] = useState<Partner | null>(null)

  if (!partners || partners.length === 0) return null

  return (
    <section className="relative py-16 md:py-24 lg:py-28">
      <div className="mx-auto max-w-[88rem] px-5 lg:px-10">
        <div className="mb-10 md:mb-14">
          <RevealText as="h2" className="font-display text-display-lg font-black text-ink-950">
            Сильные партнёры
          </RevealText>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-600 lg:text-lg">
            Бренды и компании, с которыми мы работаем над продвижением в социальных сетях.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} onOpen={() => setSelected(partner)} />
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

function PartnerCard({ partner, onOpen }: { partner: Partner; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Подробнее о партнёре: ${partner.name}`}
      className="group flex h-full flex-col rounded-[1.75rem] border border-ink-200 bg-white p-6 text-left transition-colors duration-300 ease-expo hover:border-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-4 focus-visible:ring-offset-paper lg:p-7"
    >
      <div className="flex w-full items-start justify-between gap-4">
        <LogoOrInitials
          partner={partner}
          className="flex h-14 items-center"
          imgClassName="max-h-14 max-w-[160px] object-contain"
          initialsClassName="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 font-display text-lg font-black text-white"
        />
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink-200 text-ink-950 transition-[background-color,border-color] duration-300 ease-expo group-hover:border-lime group-hover:bg-lime"
        >
          <ArrowUpRight className="h-5 w-5 transition-transform duration-500 ease-expo group-hover:rotate-45" />
        </span>
      </div>

      <h3 className="mt-6 font-display text-xl font-bold leading-tight tracking-tight text-ink-950 [overflow-wrap:anywhere]">
        {partner.name}
      </h3>
      {partner.niche && <p className="mt-1.5 text-sm font-semibold text-brand-600">{partner.niche}</p>}
      {partner.result && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-600">{partner.result}</p>}
    </button>
  )
}

function PartnerModal({ partner, onClose }: { partner: Partner | null; onClose: () => void }) {
  return (
    <Dialog open={!!partner} onClose={onClose} labelledBy="partner-modal-title" className="max-w-lg">
      {partner && (
        <>
          <DialogHeader>
            <div className="flex items-center gap-4">
              <LogoOrInitials
                key={partner.id}
                partner={partner}
                className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-2"
                imgClassName="max-h-12 max-w-12 object-contain"
                initialsClassName="font-display text-xl font-black text-brand-600"
              />
              <div className="min-w-0">
                <h2
                  id="partner-modal-title"
                  className="font-display text-2xl font-black leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-3xl"
                >
                  {partner.name}
                </h2>
                {partner.niche && (
                  <p className="mt-2.5 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{partner.niche}</p>
                )}
              </div>
            </div>
          </DialogHeader>

          {(partner.result || partner.description) && (
            <div className="space-y-6 p-6 sm:p-9">
              {partner.result && (
                <div className="flex items-start gap-3.5 rounded-2xl bg-lime-soft p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-ink-950">
                    <TrendingUp className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink-600">Результат</h3>
                    <p className="mt-0.5 font-semibold text-ink-950">{partner.result}</p>
                  </div>
                </div>
              )}

              {partner.description && (
                <div>
                  <h3 className="mb-2 font-display text-base font-bold text-ink-950">О компании</h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700 sm:text-base">{partner.description}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end border-t border-ink-100 px-6 py-4 sm:px-9">
            <Button variant="ink" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </>
      )}
    </Dialog>
  )
}
