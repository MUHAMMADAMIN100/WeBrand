'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { contacts, type PortfolioItem } from '../data/content'
import BrowserMockup from './BrowserMockup'
import { openTelegram } from '../lib/telegram'

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
      const id = window.setTimeout(() => {
        document
          .getElementById('portfolio')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 250)
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
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="portfolio" className="relative snap-start min-h-dvh py-14 md:py-24 lg:py-32 bg-white anchor-target">
      <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-8 md:mb-12 flex-wrap gap-6"
        >
          <div>
            <span className="text-sm font-bold text-brand-600 uppercase tracking-[0.2em]">
              — Портфолио
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.05]">
              Наши работы
            </h2>
          </div>
          <div className="flex max-w-md flex-col items-start gap-3 md:items-end md:text-right">
            <p className="text-base text-neutral-600 leading-relaxed">
              Реальные кейсы — реальные результаты для бизнеса наших клиентов.
            </p>
            <Link
              href="/smm"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Все работы по SMM
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex p-1.5 rounded-full bg-neutral-100 mb-8 md:mb-10 border border-neutral-200"
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => handleSetFilter(f)}
              className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                active === f
                  ? 'text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {active === f && (
                <motion.div
                  layoutId="filter-pill"
                  className="absolute inset-0 bg-brand-600 rounded-full shadow-lg shadow-brand-600/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{f}</span>
            </button>
          ))}
        </motion.div>

        {status === 'error' ? (
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
            <p className="text-base font-semibold text-neutral-800">Не удалось загрузить проекты</p>
            <p className="mt-2 text-sm text-neutral-600">
              Попробуйте обновить страницу или напишите нам в{' '}
              <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" onClick={openTelegram} className="font-semibold text-brand-600 hover:underline">
                Telegram
              </a>
              .
            </p>
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
            <p className="text-base font-semibold text-neutral-800">В этой категории пока нет проектов</p>
          </div>
        ) : (
          <>
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              <AnimatePresence mode="popLayout">
                {pageList.map((item, i) => (
                  <ProjectCard key={item.id} item={item} index={i} />
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
    'grid h-10 w-10 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40 [&:not(:disabled)]:hover:border-brand-600 [&:not(:disabled)]:hover:text-brand-600'
  return (
    <nav className="mt-10 flex items-center justify-center gap-2 md:mt-12" aria-label="Постраничная навигация">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className={arrow} aria-label="Предыдущая страница">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3.5 text-sm font-semibold transition-colors ${
            p === page
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
              : 'border border-neutral-200 text-neutral-600 hover:border-brand-600 hover:text-brand-600'
          }`}
        >
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className={arrow} aria-label="Следующая страница">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

function ProjectCard({ item, index }: { item: PortfolioItem; index: number }) {
  const href = item.slug ? `/portfolio/${item.slug}` : null
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
      whileHover={{ y: -8 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-all hover:border-brand-600 hover:shadow-2xl hover:shadow-brand-600/10"
    >
      {/* Device mockup on a light, brand-tinted stage */}
      <div
        className="relative px-5 pb-3 pt-7 sm:px-6"
        style={{ background: `linear-gradient(135deg, ${item.accent}12, ${item.accent}05 60%, #ffffff)` }}
      >
        <div className="absolute left-4 top-4 z-10">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-neutral-900 shadow-sm backdrop-blur">
            {item.category}
          </span>
        </div>
        <BrowserMockup item={item} tilt />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6 lg:p-7">
        <h3 className="text-xl font-bold leading-tight text-neutral-900">
          {item.name}{' '}
          <span className="text-base font-normal text-neutral-400">— {item.subtitle}</span>
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-600">{item.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors group-hover:bg-brand-50 group-hover:text-brand-700"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <span
            className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold transition-colors ${
              href
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 group-hover:bg-brand-700 group-hover:shadow-xl group-hover:shadow-brand-600/30'
                : 'cursor-not-allowed bg-neutral-100 text-neutral-500'
            }`}
          >
            {href ? 'Смотреть кейс' : 'Кейс скоро'}
            {href && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
          </span>
        </div>
      </div>

      {/* Stretched link — the whole card opens the case page */}
      {href && (
        <Link href={href} aria-label={`Смотреть кейс: ${item.name}`} className="absolute inset-0 z-20" />
      )}
    </motion.article>
  )
}
