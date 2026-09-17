'use client'

import { useRef, type ReactNode } from 'react'
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'
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
  className?: string
}

/** Endless ticker whose speed surges with scroll velocity, so the page feels
 *  like it has momentum. The content is rendered twice and the track wraps over
 *  exactly one copy; the duplicate is hidden from assistive tech. */
export default function Marquee({ children, speed = 3, reverse = false, className }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, { margin: '200px 0px' })
  const reduce = useReducedMotion()

  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 })
  const boost = useTransform(smoothVelocity, [-1500, 0, 1500], [4, 0, 4], { clamp: true })
  // The track holds two copies, so one copy is 50% of its width.
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`)

  useAnimationFrame((_, delta) => {
    if (reduce || !inView) return
    const direction = reverse ? 1 : -1
    const perSecond = (speed / 2) * (1 + boost.get())
    baseX.set(baseX.get() + direction * perSecond * (delta / 1000))
  })

  return (
    <div ref={root} className={cn('overflow-hidden', className)}>
      <motion.div className="flex w-max will-change-transform" style={{ x }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
