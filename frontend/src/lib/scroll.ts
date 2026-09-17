import type Lenis from 'lenis'

/** The live Lenis instance, or null before mount / after unmount. Module scope
 *  on purpose: scroll calls come from event handlers all over the tree, and
 *  threading a context through every one of them buys nothing. */
let lenis: Lenis | null = null

export function setLenis(instance: Lenis | null) {
  lenis = instance
}

export function getLenis(): Lenis | null {
  return lenis
}

/** How every programmatic scroll (anchor links, "scroll to section") moves.
 *
 *  A fixed duration rather than Lenis' default lerp: a lerp approaches its
 *  target asymptotically, so the animation is still "running" long after the
 *  page looks still — and while it runs Lenis ignores native scrolls and
 *  computes new targets from a stale position. A timed ease ends when it ends.
 *
 *  No offset on purpose. Lenis subtracts the target's CSS `scroll-margin-top`
 *  itself, and `.anchor-target` already sets that to header + air; adding an
 *  offset here lands everything a second header-height too low. */
export const PROGRAMMATIC_SCROLL = {
  duration: 1.1,
  easing: (t: number) => 1 - Math.pow(1 - t, 4),
}

/** Scroll an element into view. Give the element `.anchor-target` if it must
 *  clear the sticky header. Goes through Lenis when it is running — a native
 *  smooth `scrollIntoView` would be fought frame by frame by Lenis' own loop. */
export function scrollToElement(target: HTMLElement | null) {
  if (!target) return
  if (lenis) {
    // Adopt the real position first — Lenis measures targets from its cached
    // one, which lags a native scroll by a frame (see SmoothScroll).
    lenis.scrollTo(window.scrollY, { immediate: true, force: true })
    lenis.scrollTo(target, PROGRAMMATIC_SCROLL)
    return
  }
  // `scrollIntoView` honours scroll-margin-top natively.
  target.scrollIntoView({ block: 'start' })
}
