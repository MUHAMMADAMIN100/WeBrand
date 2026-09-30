import type Lenis from 'lenis'

/** The live Lenis instance, or null: before it has loaded, after unmount, and
 *  always on touch devices, which scroll natively (see SmoothScroll). Module
 *  scope on purpose: scroll calls come from event handlers all over the tree,
 *  and threading a context through every one of them buys nothing. */
let lenis: Lenis | null = null

export function setLenis(instance: Lenis | null) {
  lenis = instance
}

export function getLenis(): Lenis | null {
  return lenis
}

/** How every programmatic scroll (anchor links, "scroll to section") moves
 *  under Lenis.
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

/** Scroll an element into view, animated. Give the element `.anchor-target` if
 *  it must clear the sticky header. `to` overrides where to land (the page top
 *  for `#top`).
 *
 *  Goes through Lenis when it is running — a native smooth scroll would be
 *  fought frame by frame by Lenis' own loop. Without Lenis the browser's own
 *  smooth scroll does it, off the main thread; both honour scroll-margin-top. */
export function scrollToElement(target: HTMLElement | null, to?: number) {
  if (!target) return
  if (lenis) {
    // Adopt the real position first — Lenis measures targets from its cached
    // one, which lags a native scroll by a frame (see SmoothScroll).
    lenis.scrollTo(window.scrollY, { immediate: true, force: true })
    lenis.scrollTo(to ?? target, PROGRAMMATIC_SCROLL)
    return
  }
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  if (to !== undefined) window.scrollTo({ top: to, behavior })
  else target.scrollIntoView({ block: 'start', behavior })
}

/** Put an element at its anchor position at once, no animation. */
export function jumpToElement(target: HTMLElement) {
  if (lenis) {
    lenis.resize()
    lenis.scrollTo(target, { immediate: true, force: true })
    return
  }
  target.scrollIntoView({ block: 'start', behavior: 'instant' })
}
