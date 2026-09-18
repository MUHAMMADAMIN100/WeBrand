'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

// The portfolio filters are routes (/ ↔ /devprojects ↔ …) that navigate with
// `scroll: false`. To the visitor that is a tab click, not a page change.
const FILTER_ROUTES = new Set(['/', '/devprojects', '/smmprojects', '/designprojects'])

// Survives the remount this file exists to react to. `null` until the first
// page has rendered — on the server as well, so hydration agrees.
let previousPath: string | null = null

/** A template re-mounts on every navigation, which makes it the one reliable
 *  hook for an *entering* transition in the App Router: an ink curtain that
 *  lifts off the new page. Exit animations are deliberately not attempted —
 *  Next gives no supported way to hold the old page. */
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Decided once, when this instance mounts.
  const [play] = useState(() => {
    if (previousPath === null) return false // first load: the intro owns that moment
    if (previousPath === pathname) return false
    if (FILTER_ROUTES.has(previousPath) && FILTER_ROUTES.has(pathname)) return false
    return true
  })

  useEffect(() => {
    previousPath = pathname
  }, [pathname])

  return (
    <>
      {play && <div className="route-curtain" aria-hidden="true" />}
      {children}
    </>
  )
}
