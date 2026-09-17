'use client'

import { useRef, type ReactNode } from 'react'
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'
import { useReducedMotionSafe as useReducedMotion } from '../../lib/capabilities'
import { cn } from '../../lib/utils'

const wrap = (min: number, max: number, v: number) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

type Props = {
  children: ReactNode
  /** Base drift, in percent of one copy's width per second. */
  speed?: number
  reverse?: boolean
  /** How many times the content is laid out. Two is enough when one copy is
   *  wider than any screen; a short row (eight logos ≈ 1500px) needs more, or a
   *  wide monitor shows a gap where the track runs out. */
  copies?: number
  className?: string
}

/** Endless ticker whose speed surges with scroll velocity, so the page feels
 *  like it has momentum. The content is laid out several times and the track
 *  wraps over exactly one copy; the duplicates are hidden from assistive tech. */
export default function Marquee({ children, speed = 3, reverse = false, copies = 2, className }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, { margin: '200px 0px' })
  const reduce = useReducedMotion()

  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 })
  const boost = useTransform(smoothVelocity, [-1500, 0, 1500], [4, 0, 4], { clamp: true })
  // The track holds `copies` copies and wraps over exactly one of them.
  const x = useTransform(baseX, (v) => `${wrap(-100 / copies, 0, v)}%`)

  useAnimationFrame((_, delta) => {
    if (reduce || !inView) return
    const direction = reverse ? 1 : -1
    const perSecond = (speed / copies) * (1 + boost.get())
    baseX.set(baseX.get() + direction * perSecond * (delta / 1000))
  })

  return (
    <div ref={root} className={cn('overflow-hidden', className)}>
      <motion.div className="flex w-max will-change-transform" style={{ x }}>
        {Array.from({ length: copies }, (_, i) => (
          // Only the first copy is content; the rest are scenery.
          <div key={i} className="flex shrink-0 items-center" aria-hidden={i > 0 ? true : undefined}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
