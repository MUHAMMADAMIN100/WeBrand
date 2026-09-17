'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { contacts, type PortfolioItem } from '../data/content'
import { openTelegram } from '../lib/telegram'
import { scrollToElement } from '../lib/scroll'
import { cn } from '../lib/utils'
import CaseCard from './portfolio/CaseCard'
import RevealText from './motion/RevealText'

type Filter = 'Все' | 'Разработка' | 'SMM' | 'Дизайн' | 'Реклама'

const filters: Filter[] = ['Все', 'Разработка', 'SMM', 'Дизайн', 'Реклама']

const pathToFilter: Record<string, Filter> = {
  '/': 'Все',
  '/devprojects': 'Разработка',
  '/smmprojects': 'SMM',
  '/designprojects': 'Дизайн',
  '/adsprojects': 'Реклама',
}

const filterToPath: Record<Filter, string> = {
  Все: '/',
  Разработка: '/devprojects',
  SMM: '/smmprojects',
  Дизайн: '/designprojects',
  Реклама: '/adsprojects',
}

// Filter routes (everything except home) auto-scroll to the portfolio on a
// direct landing — derived from filterToPath so new categories are covered.
const FILTER_ROUTES = new Set(
  (Object.values(filterToPath) as string[]).filter((p) => p !== '/'),
)

// Module-scoped so it survives the page-subtree remount that happens when the
// filter routes (/ ↔ /devprojects ↔ /smmprojects) navigate client-side. This
// reproduces the Vite app's behaviour exactly: auto-scroll to the portfolio
// section only on a *direct* landing on a filter URL (hard load resets this
// flag), never on an in-page filter click.
let didInitialPortfolioScroll = false

export default function Portfolio({
  initialProjects,
  initialError = false,
}: {
  initialProjects: PortfolioItem[]
  initialError?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()

  const active: Filter = pathToFilter[pathname] ?? 'Все'

  // Projects are server-rendered (passed as props) so the content is in the
  // initial HTML for SEO — no client fetch / loading spinner needed.
  const portfolio = initialProjects
  const status: 'ready' | 'error' = initialError ? 'error' : 'ready'

  // Scroll to portfolio section only when landing directly on a known filter URL.
  useEffect(() => {
    if (didInitialPortfolioScroll) return
    didInitialPortfolioScroll = true
    if (FILTER_ROUTES.has(pathname)) {
      const id = window.setTimeout(() => scrollToElement(document.getElementById('portfolio')), 250)
      return () => window.clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSetFilter = (f: Filter) => {
    if (f === active) return
    // scroll: false keeps the viewport in place on a filter click (Next would
    // otherwise jump to the top of the new route).
    router.push(filterToPath[f], { scroll: false })
  }

  const list =
    active === 'Все' ? portfolio : portfolio.filter((p) => p.category === active)

  // Client-side pagination, 12 per page. Category routing already lives in the
  // URL; the page index is local UI state (projects link out, so separate
  // crawlable page URLs add no SEO value here — unlike /news). Reset to page 1
  // whenever the active category changes.
  const PER_PAGE = 12
  const [page, setPage] = useState(1)
  useEffect(() => {
    setPage(1)
  }, [active])
  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE))
  const current = Math.min(page, totalPages)
  const pageList = list.slice((current - 1) * PER_PAGE, current * PER_PAGE)
  const goToPage = (p: number) => {
    setPage(p)
    scrollToElement(document.getElementById('portfolio'))
  }

  return (
    <section id="portfolio" className="anchor-target relative py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-[88rem] px-5 lg:px-10">
        <div className="mb-9 flex flex-col gap-5 md:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <RevealText as="h2" className="font-display text-display-xl font-black text-ink-950">
            Наши работы
          </RevealText>
          <div className="flex max-w-sm flex-col items-start gap-3 lg:items-end lg:pb-2 lg:text-right">
            <p className="text-base leading-relaxed text-ink-600">
              Реальные кейсы — реальные результаты для бизнеса наших клиентов.
            </p>
            <Link
              href="/smm"
              className="group inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Все работы по SMM
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-expo group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Five tabs are wider than a phone. The row scrolls inside itself (the
            negative margin lets it run edge to edge) instead of widening the
            page — which is what it used to do: 501px of tabs forced the whole
            layout to 521px on a 390px screen. */}
        <div className="-mx-5 mb-9 overflow-x-auto px-5 [scrollbar-width:none] md:mb-12 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
          <div role="tablist" aria-label="Категории работ" className="inline-flex gap-1 rounded-full border border-ink-200 bg-white p-1.5">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={active === f}
                onClick={() => handleSetFilter(f)}
                className={cn(
                  'relative whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
                  active === f ? 'text-white' : 'text-ink-600 hover:text-ink-950',
                )}
              >
                {active === f && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full bg-ink-950"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{f}</span>
              </button>
            ))}
          </div>
        </div>

        {status === 'error' ? (
          <div className="rounded-[1.75rem] border border-ink-200 bg-white px-6 py-16 text-center">
            <p className="font-display text-lg font-bold text-ink-950">Не удалось загрузить проекты</p>
            <p className="mt-2 text-sm text-ink-600">
              Обновите страницу или напишите нам в{' '}
              <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" onClick={openTelegram} className="font-semibold text-brand-600 hover:underline">
                Telegram
              </a>
              .
            </p>
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-[1.75rem] border border-ink-200 bg-white px-6 py-16 text-center">
            <p className="font-display text-lg font-bold text-ink-950">В этой категории пока нет проектов</p>
          </div>
        ) : (
          <>
            <motion.div layout className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-8 xl:gap-y-14">
              <AnimatePresence mode="popLayout">
                {pageList.map((item) => (
                  <CaseCard key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </motion.div>

            {totalPages > 1 && (
              <PortfolioPagination page={current} totalPages={totalPages} onChange={goToPage} />
            )}
          </>
        )}
      </div>
    </section>
  )
}

function PortfolioPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const arrow =
    'grid h-11 w-11 place-items-center rounded-full border border-ink-200 bg-white text-ink-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 [&:not(:disabled)]:hover:border-ink-950 [&:not(:disabled)]:hover:text-ink-950'
  return (
    <nav className="mt-12 flex items-center justify-center gap-2 md:mt-16" aria-label="Постраничная навигация">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className={arrow} aria-label="Предыдущая страница">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            'inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
            p === page
              ? 'bg-ink-950 text-white'
              : 'border border-ink-200 bg-white text-ink-600 hover:border-ink-950 hover:text-ink-950',
          )}
        >
          {p}
        </button>
      ))}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} className={arrow} aria-label="Следующая страница">
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
