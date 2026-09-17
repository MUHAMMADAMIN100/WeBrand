import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Standalone 404 — intentionally without the site chrome (Navbar/Footer), like
// the Vite app's NotFound. Next serves this with a real HTTP 404 status; the
// inline <meta robots="noindex"> (hoisted to <head> by Next) reinforces it.
export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden px-5 py-16 lg:px-10">
      <title>Страница не найдена — Webrand</title>
      <meta name="robots" content="noindex" />

      <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto w-full max-w-[88rem]">
        {/* The number is the picture: hollow, as wide as the screen allows. */}
        <p aria-hidden="true" className="hollow font-display text-[clamp(7rem,30vw,26rem)] font-black leading-[0.85] tracking-[-0.06em] text-ink-950/25">
          404
        </p>
        <h1 className="mt-6 font-display text-display-lg font-black text-ink-950">Страница не найдена</h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-600 lg:text-lg">
          Возможно, ссылка устарела или была введена с ошибкой. Вернитесь на главную — там всё на месте.
        </p>

        <Link
          href="/"
          className="group mt-9 inline-flex h-14 items-center gap-2.5 rounded-full bg-ink-950 px-8 text-base font-semibold text-white transition-colors duration-300 ease-expo hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5 transition-transform duration-300 ease-expo group-hover:-translate-x-1" aria-hidden="true" />
          На главную
        </Link>
      </div>
    </main>
  )
}
