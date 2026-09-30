'use client'

import { useEffect } from 'react'
import { ArrowLeft, RotateCw } from 'lucide-react'

// What a visitor sees when a page throws while rendering — in practice, when a
// page that is not in the cache yet is opened while the API is unreachable.
// Standalone like the 404 (no Navbar/Footer): the chrome is part of each page,
// and the page is what failed.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden px-5 py-16 lg:px-10">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto w-full max-w-[88rem]">
        <h1 className="font-display text-display-lg font-black text-ink-950">Страница временно недоступна</h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-600 lg:text-lg">
          Не получилось загрузить данные. Попробуйте ещё раз через минуту — обычно этого хватает.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-ink-950 px-8 text-base font-semibold text-white transition-colors duration-300 ease-expo hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <RotateCw className="h-5 w-5" aria-hidden="true" />
            Попробовать снова
          </button>
          {/* A plain link on purpose: a full page load, not a client-side one,
              so whatever state failed is thrown away. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-full border-2 border-ink-950 px-8 text-base font-semibold text-ink-950 transition-colors duration-300 ease-expo hover:bg-ink-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 ease-expo group-hover:-translate-x-1" aria-hidden="true" />
            На главную
          </a>
        </div>
      </div>
    </main>
  )
}
