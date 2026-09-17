import type { PortfolioItem } from '../../data/content'
import { cn } from '../../lib/utils'

/** Which text colour reads better on `hex`: ink or white. WCAG relative
 *  luminance, then whichever contrast ratio is higher. On the current project
 *  accents the winner never drops below 4.5:1. */
export function readableOn(hex: string): 'ink' | 'white' {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return 'white'
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const INK_LUM = 0.0041 // #0B0D12
  const onInk = (lum + 0.05) / (INK_LUM + 0.05)
  const onWhite = 1.05 / (lum + 0.05)
  return onInk >= onWhite ? 'ink' : 'white'
}

type Props = {
  item: PortfolioItem
  /** Larger type and plate, for the case page. */
  size?: 'card' | 'hero'
  className?: string
}

/** The picture of a case. A project with a `cover` shows it. One without —
 *  today that is all of them — gets a poster built from what every project does
 *  have: its accent colour, its name and (usually) its logo. So the grid looks
 *  finished whatever the admin has uploaded, and a cover simply takes over the
 *  day it arrives. Hover effects hang off the parent's `group/case`. */
export default function CasePoster({ item, size = 'card', className }: Props) {
  const tone = readableOn(item.accent)

  if (item.cover) {
    return (
      <div className={cn('relative overflow-hidden bg-paper-2', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.cover}
          alt={`${item.name} — ${item.subtitle}`}
          width={1600}
          height={1000}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-expo group-hover/case:scale-[1.04]"
        />
        {/* A hairline over the image (an inset ring on the wrapper would sit
            under it): keeps a light screenshot from dissolving into the page. */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-ink-950/10" />
      </div>
    )
  }

  return (
    <div
      className={cn('relative isolate overflow-hidden', className)}
      style={{ backgroundColor: item.accent }}
    >
      {/* The name as texture: oversized, tone on tone, cropped by the frame. */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -bottom-[0.18em] left-[0.04em] -z-10 select-none whitespace-nowrap font-display font-black leading-none tracking-[-0.05em] transition-transform duration-700 ease-expo group-hover/case:-translate-x-[4%]',
          size === 'hero' ? 'text-[clamp(7rem,22vw,20rem)]' : 'text-[clamp(5.5rem,11vw,9.5rem)]',
          tone === 'ink' ? 'text-ink-950/[0.13]' : 'text-white/[0.14]',
        )}
      >
        {item.name}
      </span>

      <div className="grid h-full w-full place-items-center p-[12%]">
        {item.logo ? (
          <div
            className={cn(
              'relative rounded-2xl bg-white shadow-[0_24px_60px_-24px_rgba(11,13,18,0.55)] transition-transform duration-700 ease-expo group-hover/case:-translate-y-1.5 group-hover/case:-rotate-2',
              size === 'hero' ? 'h-[52%] w-[46%] md:w-[34%]' : 'h-[54%] w-[58%]',
            )}
          >
            {/* Pinned to the plate and contained: a square or portrait logo
                would otherwise size itself by width and spill out underneath. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.logo}
              alt={`Логотип ${item.name}`}
              loading="lazy"
              decoding="async"
              className={cn('absolute inset-0 h-full w-full object-contain', size === 'hero' ? 'p-[6%]' : 'p-[8%]')}
            />
          </div>
        ) : (
          <span
            className={cn(
              'text-center font-display font-black leading-none tracking-[-0.04em]',
              size === 'hero' ? 'text-[clamp(2.5rem,7vw,6rem)]' : 'text-[clamp(1.75rem,3.4vw,3rem)]',
              tone === 'ink' ? 'text-ink-950' : 'text-white',
            )}
          >
            {item.initials || item.name}
          </span>
        )}
      </div>
    </div>
  )
}
