'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, type MotionStyle, type MotionValue } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { services, contacts, type Service, type SubService } from '../data/content'
import { useModal } from '../context/ModalContext'
import { directionsForService } from './ContactForm'
import { SERVICE_HIGHLIGHT_EVENT, serviceAnchorId } from '../lib/serviceAnchors'
import { openTelegram } from '../lib/telegram'
import { useCapabilities } from '../lib/capabilities'
import { cn } from '../lib/utils'
import Button from './ui/Button'
import RevealText from './motion/RevealText'

/** Briefly flag the card a hero chip just sent the user to. Listens to the hash
 *  (deep links and the first click) and to the chip's own event, which covers
 *  the cases the hash cannot: clicking one chip twice, and the second chip that
 *  points at the same card. Neither changes the hash, so `hashchange` is mute. */
function useHighlightedService() {
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    const highlight = (next: string) => {
      if (!next.startsWith('service-')) return
      setId(next)
      clearTimeout(timer)
      timer = setTimeout(() => setId(null), 1500)
    }

    const fromHash = () => highlight(window.location.hash.slice(1))
    const fromChip = (e: Event) => highlight((e as CustomEvent<string>).detail)

    fromHash()
    window.addEventListener('hashchange', fromHash)
    window.addEventListener(SERVICE_HIGHLIGHT_EVENT, fromChip)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('hashchange', fromHash)
      window.removeEventListener(SERVICE_HIGHLIGHT_EVENT, fromChip)
    }
  }, [])

  return id
}

// Each service is a solid block of colour rather than one more white card; the
// four surfaces are the palette itself. `ring` is the highlight colour that
// stays visible against that surface.
const THEMES = [
  {
    card: 'bg-brand-600 text-white',
    // white/75 on brand-600 is 4.0:1 and fails AA; /90 is 5.0:1.
    muted: 'text-white/90',
    rule: 'border-white/20',
    row: 'hover:bg-white/10 focus-visible:ring-lime',
    ring: 'ring-lime',
    button: 'lime',
  },
  {
    card: 'bg-ink-950 text-paper',
    muted: 'text-paper/65',
    rule: 'border-white/15',
    row: 'hover:bg-white/10 focus-visible:ring-lime',
    ring: 'ring-lime',
    button: 'lime',
  },
  {
    card: 'bg-lime text-ink-950',
    muted: 'text-ink-950/70',
    rule: 'border-ink-950/15',
    row: 'hover:bg-ink-950/10 focus-visible:ring-ink-950',
    ring: 'ring-brand-600',
    button: 'ink',
  },
  {
    card: 'border border-ink-200 bg-white text-ink-950',
    muted: 'text-ink-600',
    rule: 'border-ink-200',
    row: 'hover:bg-paper focus-visible:ring-brand-600',
    ring: 'ring-brand-600',
    button: 'ink',
  },
] as const

export default function Services() {
  const { open: openModal, openServiceDetail } = useModal()
  const highlighted = useHighlightedService()
  const { rich } = useCapabilities()

  const stackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ['start start', 'end end'] })

  return (
    <section id="services" className="anchor-target relative py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-[88rem] px-5 lg:px-10">
        <div className="mb-10 flex flex-col gap-5 md:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <RevealText as="h2" className="font-display text-display-xl font-black text-ink-950">
            Что мы делаем
          </RevealText>
          <p className="max-w-sm text-base leading-relaxed text-ink-600 lg:pb-2 lg:text-right">
            Нажмите на любую подуслугу — расскажем, что входит, сколько занимает и кому подходит.
          </p>
        </div>

        {/* On large screens the cards are `sticky` siblings inside this one tall
            box, so each parks under the header while the next slides over it. */}
        <div ref={stackRef} className="relative flex flex-col gap-5 lg:gap-8">
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={i}
              total={services.length}
              progress={scrollYProgress}
              animate={rich}
              highlighted={highlighted === serviceAnchorId(service.id)}
              onOrder={() => openModal(directionsForService(service.title))}
              onSubClick={(sub) => openServiceDetail({ parent: service.title, sub })}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center md:mt-16">
          <Button
            href={contacts.telegram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openTelegram}
            variant="outline"
            size="lg"
          >
            Написать в Telegram
          </Button>
          <p className="text-sm text-ink-600">Отвечаем в рабочее время за пару часов.</p>
        </div>
      </div>
    </section>
  )
}

type CardProps = {
  service: Service
  index: number
  total: number
  progress: MotionValue<number>
  animate: boolean
  highlighted: boolean
  onOrder: () => void
  onSubClick: (sub: SubService) => void
}

function ServiceCard({ service, index, total, progress, animate, highlighted, onOrder, onSubClick }: CardProps) {
  const theme = THEMES[index % THEMES.length]

  // While the cards after this one slide over it, it settles back a little —
  // the pile reads as depth instead of as a flat overlap. The last card has
  // nothing coming after it, so its range collapses to "no change".
  const start = index / total
  const recede = (total - 1 - index) * 0.035
  const scale = useTransform(progress, [start, 1], [1, 1 - recede])

  return (
    <>
      {/* The hero chips scroll here. It must be this static marker and not the
          card: a sticky element reports where it is *parked*, not where it lives
          in the flow, so scrolling "to the card" from below would go nowhere. */}
      <span id={serviceAnchorId(service.id)} className="anchor-target -mb-5 block h-0 lg:-mb-8" aria-hidden="true" />

      <motion.article
        data-service-card={service.id}
        style={
          {
            scale: animate ? scale : 1,
            // Each card parks a step lower than the last, so the pile shows its
            // edges. A variable, not `top` itself: below `lg` the card is
            // `relative`, where an inline `top` would shove it down the page.
            '--park': `calc(var(--header-h) + 1rem + ${index * 0.85}rem)`,
          } as MotionStyle
        }
        className={cn(
          'relative origin-top overflow-hidden rounded-[2rem] p-6 transition-shadow duration-500 sm:p-9 lg:sticky lg:top-[var(--park)] lg:min-h-[31rem] lg:p-12',
          theme.card,
          highlighted && ['ring-4 ring-offset-4 ring-offset-paper', theme.ring],
        )}
      >
        <div className="grid h-full gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col lg:col-span-5">
            <h3 className="font-display text-display-md font-black">{service.title}</h3>
            <p className={cn('mt-4 max-w-md text-base leading-relaxed lg:text-lg', theme.muted)}>
              {service.description}
            </p>
            <div className="mt-8 lg:mt-auto lg:pt-10">
              <Button onClick={onOrder} variant={theme.button} size="lg">
                Заказать
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 ease-expo group-hover/btn:rotate-45" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <ul className={cn('flex flex-col border-t lg:col-span-7', theme.rule)}>
            {service.items.map((sub) => (
              <li key={sub.id} className={cn('border-b', theme.rule)}>
                <button
                  type="button"
                  onClick={() => onSubClick(sub)}
                  className={cn(
                    'group/row flex w-full items-center gap-4 rounded-xl px-2 py-4 text-left transition-colors duration-300 ease-expo focus-visible:outline-none focus-visible:ring-2 lg:gap-6 lg:px-4 lg:py-5',
                    theme.row,
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-medium tracking-tight lg:text-2xl">
                      {sub.title}
                    </span>
                    <span className={cn('mt-1 block text-sm leading-snug lg:text-base', theme.muted)}>
                      {sub.short}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-6 w-6 shrink-0 opacity-50 transition-[transform,opacity] duration-300 ease-expo group-hover/row:translate-x-1 group-hover/row:-translate-y-1 group-hover/row:opacity-100"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </motion.article>
    </>
  )
}
