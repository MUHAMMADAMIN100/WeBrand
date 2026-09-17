'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useCapabilities } from '../../lib/capabilities'

/** A lime disc that follows the pointer and names what a click will do —
 *  but only over elements that ask for it with `data-cursor="Смотреть"`.
 *
 *  The native cursor is never hidden: this is a label, not a replacement, so
 *  nothing about pointing gets harder. It exists only where `rich` is true (a
 *  real mouse, no reduced-motion, no save-data), and it is inert to assistive
 *  tech and to pointer events. */
export default function Cursor() {
  const { rich } = useCapabilities()
  const [label, setLabel] = useState<string | null>(null)

  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const sx = useSpring(x, { stiffness: 420, damping: 34, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 420, damping: 34, mass: 0.5 })

  useEffect(() => {
    if (!rich) return
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const onOver = (e: PointerEvent) => {
      const host = (e.target as Element | null)?.closest?.('[data-cursor]')
      setLabel(host ? host.getAttribute('data-cursor') : null)
    }
    // Scrolling moves content under a still pointer without any pointer event.
    const onScroll = () => setLabel(null)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      window.removeEventListener('scroll', onScroll)
    }
  }, [rich, x, y])

  if (!rich) return null

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[70]"
    >
      <motion.span
        initial={false}
        animate={{ scale: label ? 1 : 0, opacity: label ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="absolute left-0 top-0 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime text-center text-sm font-bold text-ink-950 shadow-[0_18px_40px_-16px_rgba(11,13,18,0.5)]"
      >
        {label}
      </motion.span>
    </motion.div>
  )
}
