'use client'

import type { ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { ModalProvider } from '../context/ModalContext'
import SmoothScroll from '../components/motion/SmoothScroll'

// Client boundary that provides the shared modal context to the whole tree.
// The modal components themselves are mounted per-page (via SiteShell) so the
// standalone 404 page stays free of site chrome — matching the Vite app.
export function Providers({ children }: { children: ReactNode }) {
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
