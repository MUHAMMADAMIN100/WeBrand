'use client'

import { partners, type Partner } from '../data/content'
import { useReducedMotionSafe } from '../lib/capabilities'
import Marquee from './motion/Marquee'
import RevealText from './motion/RevealText'

function Plate({ partner }: { partner: Partner }) {
  return (
    <div className="mx-2 grid h-24 w-44 shrink-0 place-items-center rounded-2xl border border-ink-200 bg-white px-6 lg:mx-2.5 lg:h-28 lg:w-52">
      {partner.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={partner.logo}
          alt={partner.name}
          loading="lazy"
          decoding="async"
          className="max-h-12 max-w-[8.5rem] object-contain"
        />
      ) : (
        <span className="text-center font-display text-base font-bold tracking-tight text-ink-950">{partner.name}</span>
      )}
    </div>
  )
}

export default function Partners() {
  // False on the server and on the first client render, so the markup below
  // hydrates cleanly; the static wall swaps in a tick later for those visitors.
  const reduce = useReducedMotionSafe()

  // Split across two rows by parity so each row carries a distinct,
  // width-balanced mix of logos (wide and narrow marks alternate).
  const row1 = partners.filter((_, i) => i % 2 === 0)
  const row2 = partners.filter((_, i) => i % 2 === 1)

  return (
    <section className="relative overflow-x-clip py-16 md:py-24 lg:py-32">
      <div className="mx-auto mb-10 flex max-w-[88rem] flex-col gap-5 px-5 md:mb-14 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <RevealText as="h2" className="font-display text-display-xl font-black text-ink-950">
          Нам доверяют
        </RevealText>
        <p className="max-w-sm text-base leading-relaxed text-ink-600 lg:pb-2 lg:text-right">
          Компании из разных отраслей выбирают Webrand для роста своего бизнеса.
        </p>
      </div>

      {reduce ? (
        // Nothing moves, so nothing may hide off-screen either: every logo in a grid.
        <ul className="mx-auto grid max-w-[88rem] grid-cols-2 gap-3 px-5 sm:grid-cols-3 lg:grid-cols-4 lg:px-10">
          {partners.map((p) => (
            <li key={p.name} className="[&>div]:mx-0 [&>div]:w-full">
              <Plate partner={p} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mask-fade-edges flex flex-col gap-4 lg:gap-5">
          <Marquee speed={2.2} copies={4}>
            {row1.map((p) => (
              <Plate key={p.name} partner={p} />
            ))}
          </Marquee>
          <Marquee speed={2.2} copies={4} reverse>
            {row2.map((p) => (
              <Plate key={p.name} partner={p} />
            ))}
          </Marquee>
        </div>
      )}
    </section>
  )
}
