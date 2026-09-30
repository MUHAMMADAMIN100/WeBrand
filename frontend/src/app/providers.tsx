'use client'

import { useLayoutEffect, type ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { ModalProvider } from '../context/ModalContext'
import SmoothScroll from '../components/motion/SmoothScroll'

// Client boundary that provides the shared modal context to the whole tree.
// The modal components themselves are mounted per-page (via SiteShell) so the
// standalone 404 page stays free of site chrome — matching the Vite app.
export function Providers({ children }: { children: ReactNode }) {
  // The root is now live: from here on React answers clicks. The early-click
  // script in layout.tsx waits for this mark before it replays a press made
  // while the page was still inert. A layout effect, not a passive one — it has
  // to be set in the same breath as the commit, or a click landing in between
  // would be answered by React and replayed by the script.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-hydrated', '')
  }, [])

  return (
    // reducedMotion="user": for visitors who ask for less motion Framer skips
    // transform/layout animations by itself (opacity still fades). Components
    // therefore need no `reduce ? a : b` branching for entrances — which is what
    // used to make server and client HTML disagree.
    <MotionConfig reducedMotion="user">
      <ModalProvider>
        <SmoothScroll>{children}</SmoothScroll>
      </ModalProvider>
    </MotionConfig>
  )
}
