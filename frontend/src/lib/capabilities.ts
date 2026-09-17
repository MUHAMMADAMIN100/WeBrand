'use client'

import { useEffect, useState } from 'react'

export type Capabilities = {
  /** False on the server and on the first client render, so both agree. */
  ready: boolean
  /** A mouse/trackpad is the primary pointer (hover states are real). */
  finePointer: boolean
  reducedMotion: boolean
  /** A WebGL context can actually be created on this device. */
  webgl: boolean
  /** The visitor asked the browser to save data. */
  saveData: boolean
  /** Gate for the heavy effects: WebGL, pinned scenes, custom cursor. */
  rich: boolean
}

const INITIAL: Capabilities = {
  ready: false,
  finePointer: false,
  reducedMotion: false,
  webgl: false,
  saveData: false,
  rich: false,
}

let webglProbe: boolean | null = null

function canWebGL(): boolean {
  if (webglProbe !== null) return webglProbe
  try {
    // Debugging aid: headless browsers render WebGL in software, which the
    // `failIfMajorPerformanceCaveat` probe below (rightly) rejects. Setting
    // localStorage['webrand:webgl'] = 'force' lets automated checks see the
    // live canvas anyway.
    if (window.localStorage.getItem('webrand:webgl') === 'force') return (webglProbe = true)
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
    webglProbe = !!gl
    // Hand the probe context back straight away — browsers cap live contexts.
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglProbe = false
  }
  return webglProbe
}

function read(): Capabilities {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
  const rich = finePointer && !reducedMotion && !saveData
  // Only probe WebGL where it could be used — the probe itself is not free.
  const webgl = rich ? canWebGL() : false
  return { ready: true, finePointer, reducedMotion, webgl, saveData, rich }
}

/** What this device can afford. The audience is mostly phones on slow mobile
 *  data, so the expensive effects are opt-in by capability, never the default:
 *  everything reports `false` until the client has measured. */
// The last measurement, kept for the life of the page. The very first render
// (hydration) must still report INITIAL so it matches the server HTML — and it
// does, because nothing has measured yet. But a client-side navigation remounts
// the whole page subtree, and without this every capability-gated layout would
// snap back to its fallback for a frame: the Process scene alone is ~1600px
// taller than its fallback, which threw the viewport around on a filter click.
let cached: Capabilities | null = null

export function useCapabilities(): Capabilities {
  const [caps, setCaps] = useState<Capabilities>(() => cached ?? INITIAL)

  useEffect(() => {
    const update = () => {
      cached = read()
      setCaps(cached)
    }
    update()
    const queries = [
      window.matchMedia('(hover: hover) and (pointer: fine)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ]
    queries.forEach((q) => q.addEventListener('change', update))
    return () => queries.forEach((q) => q.removeEventListener('change', update))
  }, [])

  return caps
}

/** Drop-in for Framer Motion's `useReducedMotion()` wherever the answer shapes
 *  what gets *rendered* (a different `initial`, a class, a whole branch).
 *
 *  Framer's hook answers `false` on the server and `true` on a reduced-motion
 *  client's very first render, so such markup disagrees with the server HTML
 *  and React throws a hydration error, then re-renders the tree from scratch.
 *  This one stays `false` until after mount, so the first client render always
 *  matches the server; the real preference applies one tick later. */
export function useReducedMotionSafe(): boolean {
  const { ready, reducedMotion } = useCapabilities()
  return ready && reducedMotion
}
