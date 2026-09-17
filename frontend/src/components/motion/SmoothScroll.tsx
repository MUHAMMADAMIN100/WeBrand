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
      // Modals and the mobile menu scroll natively inside the locked page.
      allowNestedScroll: true,
    })
    setLenis(lenis)

    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // In-page `#hash` links. Lenis has an `anchors` option for this, but it
    // measures the target from its own cached scroll position, which lags the
    // real one by a frame after any native scroll (the browser bringing a
    // focused link into view, a scrollbar drag, a test runner's click). A jump
    // issued in that window lands short by exactly the stale amount. So: adopt
    // the real position first, then scroll.
    const onAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null
      if (!link || link.target === '_blank') return
      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return
      const id = decodeURIComponent(url.hash.slice(1))
      if (!id) return
      const target = document.getElementById(id)
      if (!target) return

      e.preventDefault()
      // Keep what a native jump would have done: the URL, the hashchange event
      // (pushState alone does not fire it) and the keyboard's starting point.
      if (window.location.hash !== url.hash) {
        window.history.pushState(null, '', url.hash)
        window.dispatchEvent(new HashChangeEvent('hashchange'))
      }
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })

      lenis.scrollTo(window.scrollY, { immediate: true, force: true })
      lenis.scrollTo(id === 'top' ? 0 : target, PROGRAMMATIC_SCROLL)
    }
    document.addEventListener('click', onAnchorClick)

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
      document.removeEventListener('click', onAnchorClick)
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
