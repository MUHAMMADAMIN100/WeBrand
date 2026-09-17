'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

type Props = {
  as?: ElementType
  /** Reveal unit. Lines read calmer; words suit short, punchy headings. */
  by?: 'lines' | 'words'
  delay?: number
  className?: string
  children: ReactNode
}

/** Masked rise-in for headings, played once as the element scrolls into view.
 *
 *  The text is server-rendered as plain text and only split on the client, so
 *  crawlers and no-JS visitors get the untouched heading; SplitText keeps the
 *  original string in `aria-label` for screen readers. Not for the page's LCP
 *  heading — that one must not wait for JS (see Hero). */
export default function RevealText({
  as: Tag = 'div',
  by = 'lines',
  delay = 0,
  className,
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const el = ref.current
      if (!el || !contextSafe) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      let split: SplitText | undefined
      const init = contextSafe(() => {
        split = SplitText.create(el, {
          type: by === 'lines' ? 'lines' : 'words,lines',
          mask: 'lines',
          // Re-split on resize; returning the tween from onSplit lets GSAP
          // retire the stale one instead of stacking animations.
          autoSplit: true,
          onSplit(self) {
            return gsap.from(by === 'lines' ? self.lines : self.words, {
              yPercent: 110,
              duration: 0.95,
              ease: 'expo.out',
              stagger: by === 'lines' ? 0.09 : 0.04,
              delay,
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            })
          },
        })
      })

      // Line breaks measured against the fallback font would be wrong.
      let cancelled = false
      document.fonts.ready.then(() => {
        if (!cancelled) init()
      })
      return () => {
        cancelled = true
        split?.revert()
      }
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
