import Head from 'next/head'

// Served with HTTP 500 when a page cannot be rendered on the server. With the
// pages cached, that means one thing in practice: a page that is not in the
// cache yet (an article nobody has opened since the last deploy) was requested
// while the API was unreachable. Everything already cached keeps working.
//
// Static and self-contained — it must not need anything that might be failing.
// Plain links on purpose: a full page load, away from whatever went wrong.
export default function ServerError() {
  return (
    <main className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden bg-paper px-5 py-16 text-ink-950 lg:px-10">
      <Head>
        <title>Страница временно недоступна — Webrand</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto w-full max-w-[88rem]">
        <h1 className="font-display text-display-lg font-black text-ink-950">Страница временно недоступна</h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-600 lg:text-lg">
          Не получилось загрузить данные. Обновите страницу через минуту — обычно этого хватает.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href=""
            className="inline-flex h-14 items-center justify-center rounded-full bg-ink-950 px-8 text-base font-semibold text-white transition-colors duration-300 ease-expo hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            Обновить страницу
          </a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="inline-flex h-14 items-center justify-center rounded-full border-2 border-ink-950 px-8 text-base font-semibold text-ink-950 transition-colors duration-300 ease-expo hover:bg-ink-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            На главную
          </a>
        </div>
      </div>
    </main>
  )
}
