'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useCapabilities } from '../../lib/capabilities'

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  // The floor is an accessibility number, not a taste one: this is large text
  // (>= 24px), which must keep 3:1 even while "unread". Ink at 0.5 on paper is
  // 3.7:1; the 0.2 it started at was 1.56:1.
  const opacity = useTransform(progress, range, [0.5, 1])
  return <motion.span style={{ opacity }}>{children}</motion.span>
}

/** A paragraph whose words light up one by one as it scrolls through the
 *  viewport — reading pace set by the scroll.
 *
 *  The server (and any no-JS visitor, and anyone who asked for reduced motion)
 *  gets the plain paragraph at full strength. The dimmed per-word version only
 *  swaps in after mount, and the section sits below the fold, so nobody watches
 *  it happen. Screen readers get the sentence once, from a visually hidden copy. */
export default function ScrollFillText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { ready, reducedMotion } = useCapabilities()
  const [live, setLive] = useState(false)
  useEffect(() => setLive(ready && !reducedMotion), [ready, reducedMotion])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })
  const words = text.split(' ')

  return (
    <p ref={ref} className={className}>
      {live ? (
        <>
          {/* One clean sentence for screen readers; the per-word spans are
              scenery. (Not aria-label: ARIA forbids naming a plain <p>.) */}
          <span className="sr-only">{text}</span>
          <span aria-hidden="true">
            {words.map((word, i) => (
              <span key={i}>
                <Word progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                  {word}
                </Word>
                {i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </span>
        </>
      ) : (
        text
      )}
    </p>
  )
}
