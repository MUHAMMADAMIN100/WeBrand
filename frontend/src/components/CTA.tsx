'use client'

import { ArrowUpRight, Mail, Phone } from 'lucide-react'
import { useModal } from '../context/ModalContext'
import { contacts } from '../data/content'
import Button from './ui/Button'
import Magnetic from './motion/Magnetic'
import RevealText from './motion/RevealText'

const rowClass =
  'group flex items-center justify-between gap-6 rounded-2xl border border-white/20 px-5 py-5 transition-colors duration-300 ease-expo hover:border-white hover:bg-white hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600 lg:px-7 lg:py-6'

export default function CTA() {
  const { open: openModal } = useModal()

  return (
    <section id="cta" className="anchor-target relative px-3 py-6 lg:px-6 lg:py-10">
      {/* Blue as a surface, not an accent: the page's closing statement. */}
      <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-brand-600 px-6 py-14 text-white sm:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="bg-grid-dark pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden="true" />

        <div className="mx-auto grid max-w-[82rem] gap-12 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold">
              {/* motion-safe: a CSS media query, so nothing here depends on JS. */}
              <span className="h-2 w-2 rounded-full bg-lime motion-safe:animate-pulse" aria-hidden="true" />
              Свободны для новых проектов
            </p>

            <RevealText as="h2" className="mt-7 font-display text-[clamp(2.4rem,8.4vw,8rem)] font-black leading-[0.95] tracking-[-0.045em]">
              Готовы вырасти?
            </RevealText>

            <p className="mt-7 max-w-xl text-base leading-relaxed text-white/90 lg:text-lg">
              Расскажите о вашем проекте — обсудим стратегию, цели и план запуска. Первая
              консультация бесплатно.
            </p>

            <div className="mt-9">
              <Magnetic>
                <Button size="lg" variant="lime" onClick={() => openModal()} className="focus-visible:ring-offset-brand-600">
                  Оставить заявку
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 ease-expo group-hover/btn:rotate-45" aria-hidden="true" />
                </Button>
              </Magnetic>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:col-span-5">
            <a href={`tel:${contacts.phoneRaw}`} className={rowClass}>
              <span className="flex items-center gap-4">
                <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block text-sm text-white/90 transition-colors group-hover:text-ink-600">Позвонить</span>
                  <span className="block font-display text-lg font-bold tracking-tight lg:text-xl">{contacts.phone}</span>
                </span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-expo group-hover:rotate-45" aria-hidden="true" />
            </a>

            <a href={`mailto:${contacts.email}`} className={rowClass}>
              <span className="flex items-center gap-4">
                <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block text-sm text-white/90 transition-colors group-hover:text-ink-600">Email</span>
                  <span className="block font-display text-lg font-bold tracking-tight lg:text-xl">{contacts.email}</span>
                </span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-expo group-hover:rotate-45" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
