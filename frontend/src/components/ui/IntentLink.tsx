'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ComponentProps, FocusEvent, PointerEvent, TouchEvent } from 'react'

type Props = Omit<ComponentProps<typeof Link>, 'href' | 'prefetch'> & { href: string }

/** A link that fetches its page the moment someone shows they mean to open it:
 *  the pointer arrives, a finger lands, or focus does.
 *
 *  For rows of cards. A plain `<Link>` prefetches every target that scrolls
 *  into view — a dozen pages at once for a grid, fighting the grid's own images
 *  for a slow connection, and each one rendered on the server if it was not in
 *  the cache yet. Waiting for intent costs nothing the visitor can feel: the
 *  pages are static, so the fetch is done before the click has finished. */
export default function IntentLink({ href, onPointerEnter, onTouchStart, onFocus, ...rest }: Props) {
  const router = useRouter()
  const warm = () => router.prefetch(href)

  return (
    <Link
      {...rest}
      href={href}
      prefetch={false}
      onPointerEnter={(e: PointerEvent<HTMLAnchorElement>) => {
        warm()
        onPointerEnter?.(e)
      }}
      onTouchStart={(e: TouchEvent<HTMLAnchorElement>) => {
        warm()
        onTouchStart?.(e)
      }}
      onFocus={(e: FocusEvent<HTMLAnchorElement>) => {
        warm()
        onFocus?.(e)
      }}
    />
  )
}
