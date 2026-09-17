'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis, PROGRAMMATIC_SCROLL, setLenis } from '../../lib/scroll'

gsap.registerPlugin(ScrollTrigger)

/** Owns page scrolling: Lenis smooths the wheel, GSAP's ticker drives it so
 *  ScrollTrigger scenes and the scroll position never drift a frame apart.
 *
 *  Lenis already honours prefers-reduced-motion (lerp is forced to 1 and
 *  programmatic scrolls turn instant), so it stays mounted in that mode too —
 *  that keeps one code path for "land this anchor below the sticky header". */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.11,
      // In-page `#hash` links ease to their target (see PROGRAMMATIC_SCROLL for
      // why that is timed and carries no offset).
      anchors: PROGRAMMATIC_SCROLL,
      // Modals and the mobile menu scroll natively inside the locked page.
      allowNestedScroll: true,
    })
    setLenis(lenis)

    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Every overlay in the app (contact modal, service modal, partner modal,
    // mobile menu) locks the page the same way: `body.style.overflow = 'hidden'`.
    // That stops the user's wheel but not Lenis, which scrolls programmatically.
    // Watching the one shared signal covers all of them, present and future,
    // without each overlay having to know Lenis exists.
    const syncLock = () => {
      if (document.body.style.overflow === 'hidden') lenis.stop()
      else lenis.start()
    }
    const lockObserver = new MutationObserver(syncLock)
    lockObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    syncLock()

    // Webfonts change text metrics, and with them every trigger position.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => {
      lockObserver.disconnect()
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  // A route change moves the page natively — Next jumps to the top, or the
  // browser restores a position on back/forward. If Lenis is mid-animation at
  // that moment it ignores the native scroll and, a frame later, drags the new
  // page back toward the old target. So drop whatever it was doing and adopt
  // the position the navigation produced. Adopt, never impose: forcing 0 here
  // would break scroll restoration and the portfolio filter routes, which
  // navigate with `scroll: false` precisely to stay put.
  useEffect(() => {
    getLenis()?.scrollTo(window.scrollY, { immediate: true, force: true })
    ScrollTrigger.refresh()
  }, [pathname])

  return <>{children}</>
}
