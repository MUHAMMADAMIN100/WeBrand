'use client'

import { useLayoutEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

// Where each group's marker last sat, and when — so a marker that appears in
// another item within the same commit can slide over from there.
const lastSeen = new Map<string, { rect: DOMRect; at: number }>()

/** The pill behind the active item of a row of choices — the nav, a tab bar, a
 *  two-way toggle. Render it inside the active item (which must be `relative`);
 *  it fills that item.
 *
 *  Because it is part of the active item's own markup, it is in the server HTML
 *  and needs no script to be seen. When the active item changes, the new pill
 *  starts where the old one of the same `group` was and slides into place — by
 *  its edges, not by scaling, so it stays a true pill all the way. A pill that
 *  appears where none was a moment ago simply appears.
 *
 *  This is the one thing the animation library's shared-layout feature was used
 *  for on the critical path; twenty lines replace it. */
export default function SlidingMarker({ group, className }: { group: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const from = lastSeen.get(group)
    if (
      from &&
      performance.now() - from.at < 100 &&
      typeof el.animate === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      el.animate(
        [
          {
            left: `${from.rect.left - rect.left}px`,
            right: `${rect.right - from.rect.right}px`,
            top: `${from.rect.top - rect.top}px`,
            bottom: `${rect.bottom - from.rect.bottom}px`,
          },
          { left: '0px', right: '0px', top: '0px', bottom: '0px' },
        ],
        { duration: 450, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      )
    }
    return () => {
      // Still in the document at this point: effects are torn down before the
      // node is removed.
      lastSeen.set(group, { rect: el.getBoundingClientRect(), at: performance.now() })
    }
  }, [group])

  return <span ref={ref} aria-hidden="true" className={cn('absolute inset-0 rounded-full', className)} />
}
