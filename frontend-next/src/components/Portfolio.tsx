'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { contacts, type PortfolioItem } from '../data/content'

type Filter = 'Все' | 'Разработка' | 'SMM'

const filters: Filter[] = ['Все', 'Разработка', 'SMM']

const pathToFilter: Record<string, Filter> = {
  '/': 'Все',
  '/devprojects': 'Разработка',
  '/smmprojects': 'SMM',
}

const filterToPath: Record<Filter, string> = {
  Все: '/',
  Разработка: '/devprojects',
  SMM: '/smmprojects',
}

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
    if (pathname === '/devprojects' || pathname === '/smmprojects') {
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
          <p className="max-w-md text-base text-neutral-600 leading-relaxed">
            Реальные кейсы — реальные результаты для бизнеса наших клиентов.
          </p>
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
              <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 hover:underline">
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
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
      whileHover={{ y: -8 }}
      className="group relative h-full flex flex-col rounded-3xl overflow-hidden bg-white border border-neutral-200 hover:border-brand-600 hover:shadow-2xl hover:shadow-brand-600/10 transition-all"
    >
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${item.accent}15, ${item.accent}05 50%, #ffffff)` }}
      >
        <ProjectVisual item={item} />

        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-xs font-bold text-neutral-900 shadow-sm">
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-6 lg:p-7 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-neutral-900 leading-tight">
          {item.name}{' '}
          <span className="text-neutral-400 font-normal text-base">
            — {item.subtitle}
          </span>
        </h3>
        <p className="mt-3 text-sm text-neutral-600 leading-relaxed line-clamp-2">
          {item.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-6">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-full bg-brand-600 text-white font-semibold flex items-center justify-center gap-2 group-hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 group-hover:shadow-xl group-hover:shadow-brand-600/30"
            >
              Смотреть кейс
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          ) : (
            <div className="w-full py-3.5 rounded-full bg-neutral-100 text-neutral-500 font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
              Кейс скоро
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}

function ProjectVisual({ item }: { item: PortfolioItem }) {
  const initials = item.initials ?? item.name.slice(0, 4).toUpperCase()
  const [imgError, setImgError] = useState(false)
  const reduce = useReducedMotion()
  const showLogo = item.logo && !imgError
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <motion.div
        whileHover={{ scale: 1.05, rotate: -2 }}
        transition={{ type: 'spring' }}
        className="relative"
      >
        <div
          className="absolute inset-0 blur-2xl rounded-full opacity-40"
          style={{ background: item.accent }}
        />
        <div className="relative w-44 h-32 rounded-3xl bg-white shadow-xl border border-neutral-100 flex items-center justify-center overflow-hidden">
          {showLogo ? (
            <img
              src={item.logo}
              alt={item.name}
              className="max-h-20 max-w-[140px] object-contain"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="text-center px-6">
              <div
                className="text-4xl font-extrabold mb-2 tracking-tight"
                style={{ color: item.accent }}
              >
                {initials}
              </div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                {item.category}
              </div>
            </div>
          )}
        </div>

        <motion.div
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-3 -right-3 w-6 h-6 rounded-full shadow-md"
          style={{ background: item.accent }}
        />
        <motion.div
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-white border-2 shadow"
          style={{ borderColor: item.accent }}
        />
      </motion.div>
    </div>
  )
}
