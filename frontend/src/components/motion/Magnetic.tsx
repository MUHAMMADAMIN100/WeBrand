'use client'

import { useRef, type PointerEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useCapabilities } from '../../lib/capabilities'
import { cn } from '../../lib/utils'

type Props = {
  children: ReactNode
  /** Fraction of the pointer's offset from centre the child travels. */
  strength?: number
  className?: string
}

/** Pulls its child toward the cursor. Hover-only by nature, so it is inert on
 *  touch devices and under reduced motion — the child just renders in place. */
export default function Magnetic({ children, strength = 0.32, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { rich } = useCapabilities()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 })

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!rich || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  )
}
