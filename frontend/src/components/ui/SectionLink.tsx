'use client'

import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'
import { usePathname } from '../../lib/usePathname'

type Props = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  /** The section's anchor on the home page: `#services`, `#top`. */
  hash: string
}

/** A link to a section of the home page (the header's «Услуги», the logo…).
 *
 *  On the home page it is a plain in-page anchor, which SmoothScroll animates.
 *  On any other page it is a client-side navigation to `/#section`: the home
 *  page is prefetched (the header is always on screen), so it opens at once,
 *  and SmoothScroll holds the section in place while the page settles. It used
 *  to be a plain `/#section` link there too — a full reload of the site, a
 *  second or two on a slow connection, behind the most-used links we have. */
export default function SectionLink({ hash, ...rest }: Props) {
  const pathname = usePathname()
  if (pathname === '/') return <a href={hash} {...rest} />
  return <Link href={'/' + hash} {...rest} />
}
