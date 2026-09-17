import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react'
import SiteShell from '../../components/SiteShell'
import ArticleCard from '../../components/ArticleCard'
import { NEWS_PAGE_SIZE, getNewsPage } from '../../lib/api'
import { pageMetadata } from '../../lib/seo'

// News list is server-rendered fresh from the API on every request (SSR) so the
// articles are crawlable.
export const dynamic = 'force-dynamic'

const PAGE_TITLE = 'Блог и новости Webrand — digital, сайты, SMM и реклама в Душанбе'
const PAGE_DESC =
  'Статьи о веб-разработке, дизайне, брендинге, SMM, рекламе и онлайн-эквайринге для бизнеса в Таджикистане. Экспертный блог digital-агентства Webrand.'

type SearchParams = { page?: string | string[] }

function parsePage(v: string | string[] | undefined): number {
  return Math.max(1, Number(Array.isArray(v) ? v[0] : v) || 1)
}

function pageHref(p: number): string {
  return p > 1 ? `/news?page=${p}` : '/news'
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const page = parsePage((await searchParams).page)
  return pageMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESC,
    path: page > 1 ? `/news?page=${page}` : '/news',
  })
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const page = parsePage((await searchParams).page)
  const { data, error } = await getNewsPage(page)
  const items = data?.results ?? []
  const count = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(count / NEWS_PAGE_SIZE))

  return (
    <SiteShell>
      <main className="mx-auto max-w-[88rem] px-5 pb-20 pt-28 md:pb-28 md:pt-36 lg:px-10">
        {/* Header */}
        <header className="mb-10 md:mb-14">
          <h1 className="font-display text-display-xl font-black text-ink-950">
            Новости и статьи
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-600 lg:text-lg">
            Экспертные материалы о веб-разработке, дизайне, SMM, рекламе и digital-продвижении бизнеса
            в&nbsp;Душанбе и&nbsp;Таджикистане.
          </p>
        </header>

        {error ? (
          <div className="rounded-[1.75rem] border border-ink-200 bg-white px-6 py-20 text-center">
            <p className="font-display text-lg font-bold text-ink-950">Не удалось загрузить новости</p>
            <p className="mt-2 text-sm text-ink-600">Попробуйте обновить страницу позже.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[1.75rem] border border-ink-200 bg-white px-6 py-20 text-center">
            <Newspaper className="mx-auto h-10 w-10 text-ink-300" />
            <p className="mt-4 font-display text-lg font-bold text-ink-950">Статей пока нет</p>
            <p className="mt-2 text-sm text-ink-600">Загляните чуть позже — мы готовим материалы.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
              {items.map((item, i) => (
                <ArticleCard key={item.slug} item={item} index={i} />
              ))}
            </div>

            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
          </>
        )}
      </main>
    </SiteShell>
  )
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages

  const arrowBase =
    'grid h-11 w-11 place-items-center rounded-full border border-ink-200 bg-white text-ink-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2'
  const arrowActive = 'hover:border-ink-950 hover:text-ink-950'
  const arrowOff = 'cursor-not-allowed opacity-40'

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Постраничная навигация">
      {prevDisabled ? (
        <span className={`${arrowBase} ${arrowOff}`} aria-hidden="true">
          <ChevronLeft className="h-4 w-4" />
        </span>
      ) : (
        <Link href={pageHref(page - 1)} className={`${arrowBase} ${arrowActive}`} aria-label="Предыдущая страница">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}

      {pages.map((p) =>
        p === page ? (
          <span
            key={p}
            aria-current="page"
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-ink-950 px-3.5 text-sm font-semibold text-white"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(p)}
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-ink-200 bg-white px-3.5 text-sm font-semibold text-ink-600 transition-colors hover:border-ink-950 hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            {p}
          </Link>
        ),
      )}

      {nextDisabled ? (
        <span className={`${arrowBase} ${arrowOff}`} aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </span>
      ) : (
        <Link href={pageHref(page + 1)} className={`${arrowBase} ${arrowActive}`} aria-label="Следующая страница">
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  )
}
