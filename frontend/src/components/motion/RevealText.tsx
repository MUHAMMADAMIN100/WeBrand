'use client'

import { useEffect, useRef, useState, type ElementType } from 'react'

type Props = {
  as?: ElementType
  /** Seconds to wait before the first line moves. */
  delay?: number
  className?: string
  /** Plain text. It is split into the lines it actually wraps to. */
  children: string
}

const DURATION_MS = 950
const STAGGER_MS = 90

type Phase =
  | 'rest' // plain text, exactly what the server sent
  | 'armed' // below the fold and waiting: invisible, still in the layout
  | 'playing' // split into masked lines, rising

/** Masked rise-in for a heading, line by line, played once as it scrolls into
 *  view.
 *
 *  The text is server-rendered as plain text; crawlers, no-JS visitors and
 *  anyone who asked for less motion get exactly that. It is split only for the
 *  second the animation runs and put back afterwards, so at rest the heading is
 *  byte-for-byte the server markup (a heading left split measured differently
 *  and used to shift the page on client-side navigation). Screen readers hear
 *  the sentence once, from `aria-label`, while the line spans are on screen.
 *
 *  No animation library: the line breaks are read with a DOM Range, the motion
 *  is one CSS keyframe (`rt-rise` in globals.css). Not for the page's LCP
 *  heading — that one must not wait for JS (see Hero). */
export default function RevealText({ as: Tag = 'div', delay = 0, className, children }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState<Phase>('rest')
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Already on screen — a deep link, a restored scroll position. It is being
    // read; hiding it to make an entrance would be a flash, not an effect.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.88) return

    let cancelled = false
    setPhase('armed')
    // Fires when the heading's top crosses the line 12% above the viewport's
    // bottom edge — the same "top 88%" start the scroll trigger used.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        // Line breaks measured against the fallback font would be wrong.
        document.fonts.ready.then(() => {
          if (cancelled) return
          setLines(measureLines(el))
          setPhase('playing')
        })
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    observer.observe(el)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [])

  if (phase === 'playing') {
    const last = lines.length - 1
    return (
      <Tag ref={ref} className={className} aria-label={children}>
        {lines.map((line, i) => (
          // `rt-line-mask` widens its clip edge (globals.css) so «?», «Й» and
          // Cyrillic descenders survive display leading without touching layout.
          <span key={i} aria-hidden="true" className="rt-line-mask block overflow-clip">
            <span
              className="rt-line block"
              style={{ animationDelay: `${delay * 1000 + i * STAGGER_MS}ms`, animationDuration: `${DURATION_MS}ms` }}
              onAnimationEnd={i === last ? () => setPhase('rest') : undefined}
            >
              {line}
            </span>
          </span>
        ))}
      </Tag>
    )
  }

  return (
    <Tag ref={ref} className={phase === 'armed' ? `${className ?? ''} rt-armed` : className}>
      {children}
    </Tag>
  )
}

/** The lines `el`'s text wraps to right now, read without touching the DOM: a
 *  Range over each word reports where that word sits. A hyphen stays with the
 *  word before it, because that is where a line may legally break
 *  («digital-» / «бренд»). Anything but a single text node is one "line". */
function measureLines(el: HTMLElement): string[] {
  const text = el.textContent ?? ''
  const node = el.firstChild
  if (!node || node.nodeType !== Node.TEXT_NODE || el.childNodes.length !== 1) return [text]

  const range = document.createRange()
  const lines: string[] = []
  let lineStart = 0
  let lineEnd = 0
  let lineTop: number | null = null
  const word = /[^\s-]+-?|-+/g
  let match: RegExpExecArray | null
  while ((match = word.exec(text))) {
    range.setStart(node, match.index)
    range.setEnd(node, match.index + match[0].length)
    const rect = range.getClientRects()[0]
    if (!rect) continue
    if (lineTop !== null && Math.abs(rect.top - lineTop) > rect.height / 2) {
      lines.push(text.slice(lineStart, lineEnd).trim())
      lineStart = match.index
    }
    lineTop = rect.top
    lineEnd = match.index + match[0].length
  }
  lines.push(text.slice(lineStart).trim())
  return lines.filter(Boolean)
}
