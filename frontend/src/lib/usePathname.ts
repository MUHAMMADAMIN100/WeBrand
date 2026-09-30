'use client'

import { usePathname as useNextPathname } from 'next/navigation'

/** The current pathname, always a string.
 *
 *  Next types its own hook as `string | null` the moment a `pages` directory
 *  exists next to `app` — and one does, for the 500 page (src/pages). Inside the
 *  App Router, where every component of this site renders, it is never null.
 *  Import this instead of the hook from `next/navigation`. */
export function usePathname(): string {
  return useNextPathname() ?? '/'
}
