'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCapabilities } from '../lib/capabilities'
import { cn } from '../lib/utils'

// A real sequence, so it is the one place on the page that carries numbers.
const steps = [
  { num: '01', title: 'Брифинг', desc: 'Изучаем ваш бизнес, цели, аудиторию и конкурентов.' },
  { num: '02', title: 'Стратегия', desc: 'Создаём план роста, визуальную концепцию и тех. задание.' },
  { num: '03', title: 'Реализация', desc: 'Разрабатываем, дизайним и запускаем — на согласованных этапах.' },
  { num: '04', title: 'Рост', desc: 'Привлекаем клиентов, измеряем результат и масштабируем.' },
]

// Survive the page-subtree remount of a client-side navigation (see the note in
// lib/capabilities.ts): start from what was last known, not from the fallback.
let lastWide = false
let lastDistance = 0

export default function Process() {
  const { rich } = useCapabilities()
  const [wide, setWide] = useState(lastWide)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => {
      lastWide = mq.matches
      setWide(mq.matches)
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // The sideways scene is for a wide screen with a mouse and no motion
  // objection. The server and everyone else get the plain top-to-bottom list.
  const horizontal = rich && wide

  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)
  const distanceRef = useRef(lastDistance)
  const [distance, setDistance] = useState(lastDistance)

  useEffect(() => {
    if (!horizontal) {
      lastDistance = 0
      distanceRef.current = 0
      setDistance(0)
      return
    }
    const measure = () => {
      const track = trackRef.current
      if (!track) return
      const d = Math.max(0, track.scrollWidth - window.innerWidth)
      lastDistance = d
      distanceRef.current = d
      setDistance(d)
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (trackRef.current) observer.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [horizontal])

  // The section grows by the scene's travel, which moves everything below it:
  // scroll-triggered reveals further down must re-measure.
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [horizontal, distance])

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  // Reads the distance from a ref so a re-measure never needs a new transform.
  const x = useTransform(scrollYProgress, (v) => -v * distanceRef.current)

  return (
    <section
      ref={sectionRef}
      // One screen to sit in, plus exactly the sideways travel to scroll through:
      // vertical scroll maps 1:1 onto the track's horizontal movement.
      style={horizontal ? { height: `calc(100vh + ${distance}px)` } : undefined}
      className="relative bg-ink-950 text-paper"
    >
      <div className={cn(horizontal ? 'sticky top-0 flex h-screen flex-col overflow-hidden' : 'py-16 md:py-24')}>
        <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

        <div
          className={cn(
            'relative mx-auto flex w-full max-w-[88rem] flex-col gap-5 px-5 lg:flex-row lg:items-end lg:justify-between lg:px-10',
            horizontal ? 'pt-28' : '',
          )}
        >
          <h2 className="font-display text-display-xl font-black">Как мы работаем</h2>
          <p className="max-w-sm text-base leading-relaxed text-paper/65 lg:pb-2 lg:text-right">
            Прозрачный процесс — от первой встречи до запуска и масштабирования. Без сюрпризов и
            срывов сроков.
          </p>
        </div>

        <motion.ol
          ref={trackRef}
          style={horizontal ? { x } : undefined}
          className={cn(
            'relative',
            horizontal
              ? 'mt-10 flex w-max flex-1 items-stretch gap-6 px-10 pb-6 will-change-transform'
              : 'mx-auto mt-10 grid max-w-[88rem] gap-4 px-5 sm:grid-cols-2 md:mt-14 lg:px-10',
          )}
        >
          {steps.map((step, i) => {
            const last = i === steps.length - 1
            return (
              <li
                key={step.num}
                className={cn(
                  'relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-7 lg:p-10',
                  horizontal ? 'w-[min(74vw,46rem)] shrink-0' : 'min-h-[15rem]',
                  // The sequence pays off in lime: growth is the point of the other three.
                  last ? 'bg-lime text-ink-950' : 'border border-white/10 bg-white/[0.04]',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'hollow font-display text-[clamp(4.5rem,11vw,10rem)] font-black leading-none tracking-[-0.05em]',
                    last ? 'text-ink-950/50' : 'text-paper/35',
                  )}
                >
                  {step.num}
                </span>
                <div className="mt-8">
                  <h3 className="font-display text-display-md font-black">
                    <span className="sr-only">Шаг {i + 1}. </span>
                    {step.title}
                  </h3>
                  <p className={cn('mt-3 max-w-md text-base leading-relaxed lg:text-lg', last ? 'text-ink-950/75' : 'text-paper/65')}>
                    {step.desc}
                  </p>
                </div>
              </li>
            )
          })}
        </motion.ol>

        {horizontal && (
          <div className="relative mx-auto mb-10 w-full max-w-[88rem] px-10" aria-hidden="true">
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/15">
              <motion.div className="h-full origin-left rounded-full bg-lime" style={{ scaleX: scrollYProgress }} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
