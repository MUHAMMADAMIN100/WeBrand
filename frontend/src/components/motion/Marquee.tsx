'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

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

/** Scroll speed (px/s) at which the surge reaches its ceiling, and the ceiling:
 *  the ticker runs up to five times its base speed. */
const SURGE_AT = 1500
const SURGE_MAX = 4

/** Endless ticker whose speed surges with scroll velocity, so the page feels
 *  like it has momentum. The content is laid out several times and the track
 *  slides over exactly one copy; the duplicates are hidden from assistive tech.
 *
 *  The drift itself is a CSS animation (`marquee-track`, globals.css): it runs
 *  on the compositor, starts with the first paint — before any script — and
 *  costs the main thread nothing. Script only turns its speed up while the page
 *  is being scrolled and pauses it off screen. Under prefers-reduced-motion the
 *  CSS gives it no animation at all, and there is nothing for the script to find. */
export default function Marquee({ children, speed = 3, reverse = false, copies = 2, className }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const rootEl = root.current
    const trackEl = track.current
    if (!rootEl || !trackEl || typeof trackEl.getAnimations !== 'function') return
    const animation = trackEl.getAnimations()[0]
    if (!animation) return

    let frame = 0
    let rate = 1
    let target = 1
    let lastY = window.scrollY
    let lastScroll = 0 // time of the previous scroll event
    let lastFrame = 0 // time of the previous frame of the loop below

    // Runs only from a scroll until the speed is back to normal.
    const settle = (now: number) => {
      const dt = Math.min(now - lastFrame, 50) / 1000
      lastFrame = now
      target += (1 - target) * Math.min(1, dt * 6) // the push fades once scrolling stops
      rate += (target - rate) * Math.min(1, dt * 9) // and the ticker follows it smoothly
      // Not before scrolling has actually stopped: the very first frame after
      // a rest has no speed yet, and ending there would end it every time.
      if (now - lastScroll > 200 && Math.abs(rate - 1) < 0.02 && target - 1 < 0.02) {
        animation.updatePlaybackRate(1)
        rate = target = 1
        frame = 0
        return
      }
      animation.updatePlaybackRate(rate)
      frame = requestAnimationFrame(settle)
    }

    const onScroll = () => {
      const now = performance.now()
      const y = window.scrollY
      // Two events close together give a speed; one after a rest does not.
      if (now - lastScroll < 200) {
        const velocity = (Math.abs(y - lastY) / Math.max(now - lastScroll, 1)) * 1000
        target = Math.max(target, 1 + Math.min(velocity / SURGE_AT, 1) * SURGE_MAX)
      }
      lastY = y
      lastScroll = now
      if (!frame) {
        lastFrame = now
        frame = requestAnimationFrame(settle)
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animation.play()
          window.addEventListener('scroll', onScroll, { passive: true })
        } else {
          animation.pause()
          window.removeEventListener('scroll', onScroll)
        }
      },
      { rootMargin: '200px 0px' },
    )
    observer.observe(rootEl)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={root} className={cn('overflow-hidden', className)}>
      <div
        ref={track}
        className="marquee-track flex w-max will-change-transform"
        data-reverse={reverse ? '' : undefined}
        style={
          {
            // One copy per cycle, at `speed` percent of a copy per second.
            '--marquee-duration': `${(100 / speed).toFixed(2)}s`,
            '--marquee-shift': `${-100 / copies}%`,
          } as CSSProperties
        }
      >
        {Array.from({ length: copies }, (_, i) => (
          // Only the first copy is content; the rest are scenery.
          <div key={i} className="flex shrink-0 items-center" aria-hidden={i > 0 ? true : undefined}>
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
