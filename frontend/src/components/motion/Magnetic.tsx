'use client'

import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react'
import { useCapabilities } from '../../lib/capabilities'
import { cn } from '../../lib/utils'

type Props = {
  children: ReactNode
  /** Fraction of the pointer's offset from centre the child travels. */
  strength?: number
  className?: string
}

// The spring that carries the child: a touch of overshoot on the way back.
const STIFFNESS = 220
const DAMPING = 16
const MASS = 0.4

/** Pulls its child toward the cursor. Hover-only by nature, so it is inert on
 *  touch devices and under reduced motion — the child just renders in place.
 *
 *  A few lines of spring instead of an animation library: this wraps the
 *  hero's main button, so it is on the path to the first screen becoming
 *  interactive. The frame loop runs only while the child is actually moving. */
export default function Magnetic({ children, strength = 0.32, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { rich } = useCapabilities()
  const spring = useRef({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, frame: 0, last: 0 })

  const step = (now: number) => {
    const s = spring.current
    const el = ref.current
    if (!el) return
    // Fixed small steps keep the spring stable whatever the frame rate.
    let remaining = Math.min((now - s.last) / 1000, 0.05)
    s.last = now
    while (remaining > 0) {
      const dt = Math.min(remaining, 1 / 240)
      s.vx += ((-STIFFNESS * (s.x - s.tx) - DAMPING * s.vx) / MASS) * dt
      s.vy += ((-STIFFNESS * (s.y - s.ty) - DAMPING * s.vy) / MASS) * dt
      s.x += s.vx * dt
      s.y += s.vy * dt
      remaining -= dt
    }
    const resting =
      Math.abs(s.x - s.tx) < 0.05 && Math.abs(s.y - s.ty) < 0.05 && Math.abs(s.vx) < 0.5 && Math.abs(s.vy) < 0.5
    if (resting) {
      s.x = s.tx
      s.y = s.ty
      s.vx = s.vy = 0
      s.frame = 0
    } else {
      s.frame = requestAnimationFrame(step)
    }
    // At rest in the centre there is no transform at all: nothing for the
    // compositor to keep a layer for.
    el.style.transform = s.x === 0 && s.y === 0 ? '' : `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`
  }

  const moveTo = (x: number, y: number) => {
    const s = spring.current
    s.tx = x
    s.ty = y
    if (s.frame) return
    s.last = performance.now()
    s.frame = requestAnimationFrame(step)
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!rich || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    // The box is measured where it currently is, displaced; take that back out
    // so the pull is measured from the resting centre. Measuring from the
    // displaced centre instead — which is what this used to do — settles at
    // strength / (1 + strength) of the offset; the same figure is used here so
    // the button travels exactly as far as it always has.
    const s = spring.current
    const pull = strength / (1 + strength)
    moveTo(
      (e.clientX - (r.left - s.x + r.width / 2)) * pull,
      (e.clientY - (r.top - s.y + r.height / 2)) * pull,
    )
  }
  const onLeave = () => moveTo(0, 0)

  useEffect(() => {
    const s = spring.current
    return () => cancelAnimationFrame(s.frame)
  }, [])

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={cn('inline-block', className)}>
      {children}
    </div>
  )
}
