'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import type Lenis from 'lenis'
import { usePathname } from '../../lib/usePathname'
import { getLenis, jumpToElement, scrollToElement, setLenis } from '../../lib/scroll'

/** Owns page scrolling.
 *
 *  With a mouse or trackpad, Lenis smooths the wheel. On a touch screen there
 *  is no Lenis at all: it would smooth nothing there (touch scrolling stays
 *  native either way) and its touch listeners are non-passive, which makes the
 *  browser wait for the main thread before every scroll gesture — exactly the
 *  moments a phone has the least to spare. Touch devices scroll natively, off
 *  the main thread, and anchors use the browser's own smooth scroll.
 *
 *  Both modes share the rest: same-page `#hash` links, keeping a hash target in
 *  place while a new page settles, and holding the page still under a dialog.
 *
 *  Lenis already honours prefers-reduced-motion (the wheel stops easing and
 *  programmatic scrolls turn instant), so it stays on in that mode too. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  // True while the current page was reached by Back/Forward rather than a click.
  const traversed = useRef(false)

  useEffect(() => {
    let lenis: Lenis | null = null
    let disposed = false
    let frame = 0

    // In-page `#hash` links. Lenis has an `anchors` option for this, but it
    // measures the target from its own cached scroll position, which lags the
    // real one by a frame after any native scroll (the browser bringing a
    // focused link into view, a scrollbar drag, a test runner's click). A jump
    // issued in that window lands short by exactly the stale amount. So: adopt
    // the real position first, then scroll — which is what scrollToElement does.
    const onAnchorClick = (e: MouseEvent) => {
      traversed.current = false // whatever navigates next, a click caused it
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null
      if (!link || link.target === '_blank') return
      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return
      const id = decodeURIComponent(url.hash.slice(1))
      if (!id) return
      // `#top` needs no element: to the browser it means the top of the
      // document on any page, which is what lets the footer's «Наверх» be the
      // same link everywhere — only the home page has a hero with that id.
      const target = document.getElementById(id)
      if (!target && id !== 'top') return

      e.preventDefault()
      // Keep what a native jump would have done: the URL, the hashchange event
      // (pushState alone does not fire it) and the keyboard's starting point.
      if (window.location.hash !== url.hash) {
        window.history.pushState(null, '', url.hash)
        window.dispatchEvent(new HashChangeEvent('hashchange'))
      }
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
        target.focus({ preventScroll: true })
      }

      scrollToElement(target ?? document.documentElement, id === 'top' ? 0 : undefined)
    }
    document.addEventListener('click', onAnchorClick)
    const onTraverse = () => {
      traversed.current = true
    }
    window.addEventListener('popstate', onTraverse)

    // Every overlay in the app (contact modal, service modal, partner modal,
    // mobile menu) locks the page the same way: `body.style.overflow = 'hidden'`.
    // That stops the user's wheel but not Lenis, which scrolls programmatically;
    // and on older iOS it does not stop a finger either. Watching the one shared
    // signal covers all of them, present and future, without each overlay
    // having to know how the page scrolls.
    const blockTouch = (e: TouchEvent) => {
      // Inside an overlay's own scroller (a long form, the mobile menu on a
      // short screen) the finger scrolls that, not the page behind it.
      for (let node = e.target as Element | null; node && node !== document.body; node = node.parentElement) {
        if (node.hasAttribute('data-lenis-prevent')) return
        const overflowY = getComputedStyle(node).overflowY
        if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return
      }
      if (e.cancelable) e.preventDefault()
    }
    let touchBlocked = false
    const syncLock = () => {
      const locked = document.body.style.overflow === 'hidden'
      if (lenis) {
        if (locked) lenis.stop()
        else lenis.start()
        return
      }
      // No Lenis: the listener exists only while something is open, so normal
      // scrolling never waits on it.
      if (locked && !touchBlocked) document.addEventListener('touchmove', blockTouch, { passive: false })
      if (!locked && touchBlocked) document.removeEventListener('touchmove', blockTouch)
      touchBlocked = locked
    }
    const lockObserver = new MutationObserver(syncLock)
    lockObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    syncLock()

    // A wheel to smooth means a mouse or a trackpad.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      // Its own chunk: nothing on the page waits for it, and until it arrives
      // the wheel simply scrolls natively.
      import('lenis').then(({ default: LenisClass }) => {
        if (disposed) return
        lenis = new LenisClass({
          // How quickly the page catches up with the wheel: 90% of a notch in
          // about 0.2 s. (0.11, the old value, took 0.37 s and felt like drag.)
          lerp: 0.2,
          // Modals and the mobile menu scroll natively inside the locked page.
          allowNestedScroll: true,
        })

        // Lenis only needs a frame callback while it is animating a scroll.
        // Driving it from a permanent loop wakes the main thread a hundred
        // times a second on a 100 Hz screen for nothing, so the loop runs from
        // the moment a scroll starts until the page has settled.
        const instance = lenis
        const loop = (now: number) => {
          instance.raf(now)
          frame = instance.isScrolling === 'smooth' ? requestAnimationFrame(loop) : 0
        }
        const scrollTo = instance.scrollTo.bind(instance)
        // The one door every animated scroll goes through, Lenis's own wheel
        // handling included.
        instance.scrollTo = (...args) => {
          scrollTo(...args)
          if (frame) return
          // Its clock stood still while idle: start with a zero step, not a leap.
          instance.time = 0
          frame = requestAnimationFrame(loop)
        }

        setLenis(lenis)
        syncLock()
      })
    }

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      document.removeEventListener('click', onAnchorClick)
      window.removeEventListener('popstate', onTraverse)
      document.removeEventListener('touchmove', blockTouch)
      lockObserver.disconnect()
      lenis?.destroy()
      setLenis(null)
    }
  }, [])

  // A route change moves the page natively — Next jumps to the top, or the
  // browser restores a position on back/forward. If Lenis is mid-animation at
  // that moment it ignores the native scroll and, a frame later, drags the new
  // page back toward the old target. So drop whatever it was doing and adopt
  // the position the navigation produced. Adopt, never impose: forcing 0 here
  // would break scroll restoration and the portfolio filter, which changes the
  // address precisely without moving the page.
  //
  // Re-measure first. Lenis clamps every target to its cached scroll limit, and
  // until its own (debounced) resize runs that limit still belongs to the page
  // we came from: adopting "6000px" on a fresh long page while the limit says
  // "1583px" would impose 1583 — and did, for `/#portfolio` opened from a case
  // page and for Back to a deep position on the home page.
  useEffect(() => {
    const lenis = getLenis()
    lenis?.resize()
    lenis?.scrollTo(window.scrollY, { immediate: true, force: true })

    // A navigation that names a section (`/#portfolio` from a case page). Next
    // jumps to it once, at commit — before the new page has finished laying
    // itself out: the Process scene unfolds by a screen and a half, webfonts
    // land, and the section slides out from under the jump. So hold the section
    // in place while the page height is still changing.
    // Only for a navigation that went to the section: Back/Forward restores
    // the exact position the person left, hash or no hash, and that wins. And
    // never against the user — the first wheel, touch or key hands the page back.
    if (traversed.current) return
    const id = decodeURIComponent(window.location.hash.slice(1))
    const target = id ? document.getElementById(id) : null
    if (!target) return
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
    if (Math.abs(target.getBoundingClientRect().top - margin) > 12) return

    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
    const observer = new ResizeObserver(() => jumpToElement(target))
    const release = () => {
      observer.disconnect()
      window.clearTimeout(timer)
      events.forEach((type) => window.removeEventListener(type, release))
    }
    const timer = window.setTimeout(release, 2500)
    events.forEach((type) => window.addEventListener(type, release, { passive: true }))
    observer.observe(document.body)
    return release
  }, [pathname])

  return <>{children}</>
}
