'use client'

import { getImageProps } from 'next/image'
import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height' | 'sizes' | 'alt' | 'onError'> & {
  /** Absolute URL of a file the admin uploaded (logo, cover). */
  src: string
  alt: string
  /** Intrinsic ratio hint and the widest copy worth asking for. */
  width: number
  height: number
  /** How wide the image is drawn — this is what picks the copy to download. */
  sizes: string
  /** Above the fold: load now, ahead of everything else. */
  priority?: boolean
  /** The file itself failed too (not just the optimised copy). */
  onGiveUp?: () => void
}

/** An image uploaded through the admin, served the size it is drawn at.
 *
 *  Uploads arrive as they left the designer's machine — a logo shown 150px wide
 *  can weigh a megabyte — and the audience is on mobile data. Next's optimiser
 *  re-encodes each file to WebP at the width the layout asks for.
 *
 *  The original URL stays as the safety net: if the optimiser refuses or is
 *  down, the image falls back to the file itself instead of breaking. SVG is
 *  never sent through (the optimiser rejects it, and it needs no resizing). */
export default function MediaImage({ src, alt, width, height, sizes, priority = false, onGiveUp, ...rest }: Props) {
  const direct = /\.svg(?:$|[?#])/i.test(src)
  const [raw, setRaw] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  const fail = () => {
    if (raw || direct) onGiveUp?.()
    else setRaw(true)
  }

  // An error that fired before hydration never reached onError — catch up.
  // Once, on mount: from then on the handler is attached and hears everything.
  useEffect(() => {
    const el = ref.current
    if (el && el.complete && el.naturalWidth === 0) fail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { props } = getImageProps({ src, alt, width, height, sizes, priority, unoptimized: raw || direct })

  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- alt comes in with `props`
  return <img {...props} {...rest} ref={ref} onError={fail} />
}
