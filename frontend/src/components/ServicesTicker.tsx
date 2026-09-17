'use client'

import { Fragment } from 'react'
import { services } from '../data/content'
import Marquee from './motion/Marquee'

// Straight from the services data, so the band can never advertise something
// the Services section below does not actually list.
const HEADLINE = services.map((s) => s.title)
const DETAIL = services.flatMap((s) => s.items.map((i) => i.title))

/** The lime dot is the one from the logo's «ё». */
function Dot({ className }: { className: string }) {
  return <span className={`inline-block shrink-0 rounded-full bg-lime ${className}`} />
}

/** A dark band between the hero and the page: what the agency does, in motion.
 *  Purely decorative — every word is repeated as real, linked content in the
 *  Services section — so the whole thing is hidden from assistive tech. The two
 *  rows repeat the hero's contrast: one black-weight, one hairline outline. */
export default function ServicesTicker() {
  return (
    <div aria-hidden="true" className="relative select-none overflow-hidden bg-ink-950 py-7 text-paper lg:py-10">
      <Marquee speed={3}>
        {HEADLINE.map((title) => (
          <Fragment key={title}>
            <span className="whitespace-nowrap font-display text-[clamp(2.25rem,6.6vw,6rem)] font-black leading-none tracking-[-0.04em]">
              {title}
            </span>
            <Dot className="mx-6 h-3 w-3 lg:mx-10 lg:h-5 lg:w-5" />
          </Fragment>
        ))}
      </Marquee>

      <Marquee speed={2} reverse className="mt-4 lg:mt-6">
        {DETAIL.map((title) => (
          <Fragment key={title}>
            <span className="text-stroke whitespace-nowrap font-display text-[clamp(1.35rem,3.2vw,3rem)] font-light leading-none tracking-[-0.02em] text-paper/60">
              {title}
            </span>
            <Dot className="mx-4 h-1.5 w-1.5 lg:mx-7 lg:h-2.5 lg:w-2.5" />
          </Fragment>
        ))}
      </Marquee>
    </div>
  )
}
