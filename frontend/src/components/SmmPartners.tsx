'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { Partner } from '../lib/api'
import { useLazy } from '../lib/useLazy'
import RevealText from './motion/RevealText'
import LogoOrInitials from './SmmPartnerLogo'

// The details dialog, and the animation library behind it, are of no use to
// someone who is only reading the page: they are fetched when a card is first
// hovered, focused or pressed (see useLazy for why not next/dynamic).
const loadPartnerModal = () => import('./SmmPartnerModal')

// Section 4 of /smm: «сильные партнёры» cards. Every field except `name` is
// optional — a missing logo/niche/description/result is handled gracefully.
// Clicking a card opens a details modal (the `link` field is intentionally
// unused on the site).
export default function SmmPartners({ partners }: { partners: Partner[] }) {
  const [selected, setSelected] = useState<Partner | null>(null)
  const [PartnerModal, loadModal] = useLazy(loadPartnerModal, () => setSelected(null))
  useEffect(() => {
    if (selected) loadModal()
  }, [selected, loadModal])

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
            <PartnerCard key={partner.id} partner={partner} onOpen={() => setSelected(partner)} onIntent={loadModal} />
          ))}
        </div>
      </div>

      {PartnerModal && <PartnerModal partner={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}

function PartnerCard({ partner, onOpen, onIntent }: { partner: Partner; onOpen: () => void; onIntent: () => void }) {
  return (
    <article className="group relative flex h-full flex-col rounded-[1.75rem] border border-ink-200 bg-white p-6 transition-colors duration-300 ease-expo hover:border-ink-950 lg:p-7">
      <div className="flex w-full items-start justify-between gap-4">
        <LogoOrInitials
          partner={partner}
          className="flex h-14 items-center"
          imgClassName="h-auto max-h-14 w-auto max-w-[160px] object-contain"
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

      {/* Stretched button — the whole card opens the details. It holds no text
          of its own (a heading may not live inside a button), so its label is
          free to say what the press does. */}
      <button
        type="button"
        onClick={onOpen}
        onPointerEnter={onIntent}
        onFocus={onIntent}
        aria-label={`Подробнее о партнёре: ${partner.name}`}
        aria-haspopup="dialog"
        className="absolute inset-0 rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
      />
    </article>
  )
}
