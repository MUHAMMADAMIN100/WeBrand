'use client'

import { useCallback, useRef, useState, type ComponentType } from 'react'

type Loader<P> = () => Promise<{ default: ComponentType<P> }>

/** A component whose code is fetched on demand — `const [Modal, load] = useLazy(loader)`.
 *  `Modal` is null until `load()` has finished; calling `load` again is free.
 *
 *  Why not `next/dynamic` / `React.lazy`: those go through Suspense, and React
 *  holds back a just-resolved Suspense boundary for about 300 ms so fallbacks do
 *  not flicker. For content that is fine. For a dialog opened by a click it is a
 *  third of a second of nothing, every first time — even when the code had
 *  already been fetched ahead of the click. Here the component simply appears
 *  in the next render.
 *
 *  `loader` must be a stable reference (declare it at module scope). `onError`
 *  runs if the chunk cannot be fetched; a later `load()` tries again. */
export function useLazy<P>(loader: Loader<P>, onError?: () => void) {
  const [Component, setComponent] = useState<ComponentType<P> | null>(null)
  const started = useRef(false)
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const load = useCallback(() => {
    if (started.current) return
    started.current = true
    loader().then(
      (mod) => setComponent(() => mod.default),
      () => {
        started.current = false
        onErrorRef.current?.()
      },
    )
  }, [loader])

  return [Component, load] as const
}
