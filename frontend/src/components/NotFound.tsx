import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  // Vercel переписывает все пути на / — мусорные URL отдают 200 (soft 404).
  // Динамический noindex говорит Google не индексировать такие страницы;
  // убираем тег при анмаунте, чтобы он не «протёк» на клиентскую навигацию.
  useEffect(() => {
    document.title = 'Страница не найдена — Webrand'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => {
      meta.remove()
    }
  }, [])

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 text-center">
      {/* Soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/10 blur-3xl"
      />

      <div className="relative">
        <p className="text-8xl font-extrabold tracking-tight text-brand-600 sm:text-9xl">404</p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
          Страница не найдена
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-neutral-600">
          Возможно, ссылка устарела или была введена с ошибкой. Вернитесь на главную — там всё на месте.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 font-semibold text-white shadow-lg transition-shadow hover:shadow-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          На главную
        </Link>
      </div>
    </main>
  )
}
