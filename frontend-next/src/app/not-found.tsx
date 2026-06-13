import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Standalone 404 — intentionally without the site chrome (Navbar/Footer), like
// the Vite app's NotFound. Next serves this with a real HTTP 404 status; the
// inline <meta robots="noindex"> (hoisted to <head> by Next) reinforces it.
export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 text-center">
      <title>Страница не найдена — Webrand</title>
      <meta name="robots" content="noindex" />

      {/* Soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/10 blur-3xl"
      />

      <div className="relative">
        <p className="text-7xl font-extrabold tracking-tight text-brand-600 sm:text-8xl">404</p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
          Страница не найдена
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-neutral-600">
          Возможно, ссылка устарела или была введена с ошибкой. Вернитесь на главную — там всё на месте.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 font-semibold text-white shadow-lg transition-shadow hover:shadow-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          На главную
        </Link>
      </div>
    </main>
  )
}
