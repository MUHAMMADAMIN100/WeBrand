'use client'

import { ArrowDownRight } from 'lucide-react'
import { heroTags } from '../data/content'
import { useModal } from '../context/ModalContext'
import { requestServiceHighlight } from '../lib/serviceAnchors'
import Button from './ui/Button'
import Magnetic from './motion/Magnetic'
import HeroVisual from './webgl/HeroVisual'

// Real clients, real logos (public/logos) — the faces behind «30+ компаний».
const TRUSTED = [
  { src: '/logos/sabt.png', alt: 'SABT' },
  { src: '/logos/todo.webp', alt: 'Todo' },
  { src: '/logos/asan.webp', alt: 'ASAN' },
  { src: '/logos/aiva.webp', alt: 'Aiva' },
  { src: '/logos/getup.jpg', alt: 'GetUp' },
]

export default function Hero() {
  const { open: openModal } = useModal()

  return (
    <section
      id="top"
      className="relative isolate flex flex-col overflow-x-clip pb-10 pt-28 lg:min-h-[100svh] lg:pb-10 lg:pt-36"
    >
      <div className="bg-grid pointer-events-none absolute inset-0 -z-20" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-[88rem] flex-1 flex-col px-5 lg:px-10">
        {/* The page's LCP element, so its entrance is pure CSS (globals.css):
            nothing here waits for JS. Line two swells from hairline to black —
            the brand "gaining weight" is the one orchestrated moment.

            The size is set by measurement, not taste. At weight 300 «Превращаем
            бизнес» runs 11.97em and at 900 «в digital-бренд» runs 9.18em
            (Unbounded, -0.04em tracking). Line two never breaks — `nowrap` also
            keeps the preposition «в» from hanging at a line end — so on phones
            it sets the ceiling (9.4vw fits a 320px screen); from `lg` up line
            one fits on a single row and sets it instead (7.6vw, capped where
            the 88rem container stops growing). */}
        <div className="relative flex flex-1 flex-col">
          <h1 className="relative z-10 font-display text-[9.4vw] leading-none tracking-[-0.04em] text-ink-950 sm:text-[8vw] lg:text-[min(7.6vw,6.85rem)]">
            <span className="hero-line">
              <span className="font-light">Превращаем бизнес</span>
            </span>{' '}
            <span className="hero-line">
              <span className="hero-heavy whitespace-nowrap">в digital-бренд</span>
            </span>
          </h1>

          <div className="hero-fade relative z-10 mt-8 flex max-w-xl flex-col gap-8 lg:mt-12">
            <p className="max-w-lg text-pretty text-base leading-relaxed text-ink-600 lg:text-lg">
              Разрабатываем сайты, выстраиваем бренд, привлекаем клиентов через SMM и контекстную
              рекламу. Комплексные решения, которые приносят прибыль.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Magnetic>
                <Button size="lg" variant="ink" onClick={() => openModal()} className="w-full sm:w-auto">
                  Связаться с нами
                </Button>
              </Magnetic>
              <Button size="lg" variant="outline" href="#portfolio" className="w-full sm:w-auto">
                Смотреть работы
              </Button>
            </div>
          </div>

          {/* The mark is out of flow at every size, so it never sets the hero's
              height, and it only ever sits behind display type — never behind
              body copy, which it would make unreadable.
              Phones: tucked into the gap right of «бизнес», behind the heavy line.
              Desktop: rises behind the end of the headline's second line; its top
              tracks the headline's height (2 lines × the 7.6vw / 6.85rem size). */}
          <div className="pointer-events-none absolute -right-[9%] top-[7vw] -z-10 w-[54%] sm:-right-[4%] sm:top-[5vw] sm:w-[40%] lg:-right-[5%] lg:top-[calc(min(15.2vw,13.7rem)-4.5rem)] lg:w-[52%]">
            <HeroVisual className="aspect-[4/3] w-full" />
            {/* Contact shadow: grounds the balloon on the page. */}
            <div className="absolute inset-x-[16%] -bottom-[3%] hidden h-[9%] rounded-[50%] bg-ink-950/25 blur-2xl lg:block" />
          </div>
        </div>

        <div className="hero-fade hero-fade-late relative z-10 mt-10 flex flex-col gap-6 border-t border-ink-200 pt-6 lg:mt-6 lg:flex-row lg:items-center lg:justify-between lg:pt-7">
          <ul className="flex flex-wrap gap-2">
            {heroTags.map((tag) => (
              <li key={tag.label}>
                <a
                  href={tag.href}
                  onClick={() => requestServiceHighlight(tag.href)}
                  className="group inline-flex h-11 items-center gap-1.5 rounded-full border border-ink-200 bg-white pl-4 pr-3 text-sm font-semibold text-ink-800 transition-colors duration-300 ease-expo hover:border-ink-950 hover:bg-ink-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  {tag.label}
                  <ArrowDownRight
                    className="h-4 w-4 text-ink-400 transition-[color,transform] duration-300 ease-expo group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:text-lime"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-3.5">
            <ul className="flex -space-x-2.5" aria-hidden="true">
              {TRUSTED.map((logo) => (
                <li
                  key={logo.src}
                  className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border-2 border-paper bg-white shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo.src} alt="" width={40} height={40} loading="lazy" className="h-full w-full object-contain p-1.5" />
                </li>
              ))}
            </ul>
            <p className="text-sm leading-snug text-ink-600">
              <span className="font-display text-base font-bold text-ink-950">30+</span> компаний
              <br />
              уже работают с нами
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
