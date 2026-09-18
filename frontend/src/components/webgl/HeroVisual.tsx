'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { useCapabilities } from '../../lib/capabilities'
import { cn } from '../../lib/utils'

// Its own chunk, never server-rendered: phones and reduced-motion visitors do
// not download a byte of the shader.
const WMarkCanvas = dynamic(() => import('./WMarkCanvas'), { ssr: false })

/** The hero's brand mark. Everyone gets the static "We" image immediately; devices
 *  that can afford it swap to the live WebGL version once the page is idle, and
 *  only after its first frame has actually been drawn — so there is never a
 *  hole where the mark should be. */
export default function HeroVisual({ className }: { className?: string }) {
  const caps = useCapabilities()
  const [mount, setMount] = useState(false)
  const [live, setLive] = useState(false)
  const wantsWebGL = caps.ready && caps.rich && caps.webgl

  useEffect(() => {
    if (!wantsWebGL) {
      setMount(false)
      setLive(false)
      return
    }
    // After first paint, when the main thread has nothing better to do.
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setMount(true), { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(() => setMount(true), 300)
    return () => clearTimeout(id)
  }, [wantsWebGL])

  // Stable identity: WMarkCanvas re-creates its GL context when this changes.
  const onReady = useCallback(() => setLive(true), [])

  return (
    <div className={cn('relative', className)} aria-hidden="true">
      <StaticMark
        className={cn(
          'transition-opacity duration-700 ease-expo',
          live ? 'opacity-0' : 'opacity-100',
        )}
      />
      {mount && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-expo',
            live ? 'opacity-100' : 'opacity-0',
          )}
        >
          <WMarkCanvas onReady={onReady} />
        </div>
      )}
    </div>
  )
}

/** A frame captured from the shader itself (scratch script: screenshot the live
 *  canvas with a transparent background, resize to 960px, WebP). Phones get the
 *  same balloon as desktop for 34 KB and zero GPU work, and on desktop it is the
 *  poster the live canvas fades in over — same pose, so the swap is invisible.
 *  Explicit width/height reserve the box: no layout shift when it decodes. */
function StaticMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/hero/w-mark.webp"
      // The poster is the page's LCP element on phones (it outweighs any single
      // line of the headline), so it is fetched ahead of the JS chunks, in a
      // size that fits the slot: ~54vw on phones, ~52% of the container above.
      srcSet="/hero/w-mark-480.webp 480w, /hero/w-mark-640.webp 640w, /hero/w-mark.webp 960w"
      sizes="(min-width: 1024px) 46rem, (min-width: 640px) 40vw, 54vw"
      fetchPriority="high"
      alt=""
      width={960}
      height={720}
      decoding="async"
      draggable={false}
      className={cn('h-full w-full select-none object-contain', className)}
    />
  )
}
