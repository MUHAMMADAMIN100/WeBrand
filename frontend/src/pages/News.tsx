import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, Newspaper } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ContactModal from '../components/ContactModal'
import ServiceDetailModal from '../components/ServiceDetailModal'
import { Seo } from '../components/Seo'
import {
  NEWS_PAGE_SIZE,
  fetchNewsPage,
  formatDate,
  type NewsListItem,
} from '../lib/news'

const PAGE_TITLE = 'Блог и новости Webrand — digital, сайты, SMM и реклама в Душанбе'
const PAGE_DESC =
  'Статьи о веб-разработке, дизайне, брендинге, SMM, рекламе и онлайн-эквайринге для бизнеса в Таджикистане. Экспертный блог digital-агентства Webrand.'

export default function News() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)

  const [items, setItems] = useState<NewsListItem[]>([])
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

  useEffect(() => {
    const ctrl = new AbortController()
    setStatus('loading')
    fetchNewsPage(page, ctrl.signal)
      .then((data) => {
        setItems(data.results)
        setCount(data.count)
        setStatus('ready')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setStatus('error')
      })
    return () => ctrl.abort()
  }, [page])

  const totalPages = Math.max(1, Math.ceil(count / NEWS_PAGE_SIZE))
  const canonicalPath = page > 1 ? `/news?page=${page}` : '/news'

  const goTo = (p: number) => {
    setParams(p > 1 ? { page: String(p) } : {})
  }

  return (
    <div className="relative min-h-screen bg-white">
      <Seo title={PAGE_TITLE} description={PAGE_DESC} path={canonicalPath} />

      <Navbar />

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36 lg:px-10">
        {/* Header */}
        <header className="mb-10 md:mb-14">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">— Блог</span>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 md:text-6xl">
            Новости и статьи
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">
            Экспертные материалы о веб-разработке, дизайне, SMM, рекламе и digital-продвижении бизнеса
            в&nbsp;Душанбе и&nbsp;Таджикистане.
          </p>
        </header>

        {status === 'loading' ? (
          <div className="flex items-center justify-center gap-3 py-24 text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
            <span className="text-sm font-medium">Загружаем статьи…</span>
          </div>
        ) : status === 'error' ? (
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-20 text-center">
            <p className="text-base font-semibold text-neutral-800">Не удалось загрузить новости</p>
            <p className="mt-2 text-sm text-neutral-600">Попробуйте обновить страницу позже.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-20 text-center">
            <Newspaper className="mx-auto h-10 w-10 text-neutral-300" />
            <p className="mt-4 text-base font-semibold text-neutral-800">Статей пока нет</p>
            <p className="mt-2 text-sm text-neutral-600">Загляните чуть позже — мы готовим материалы.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {items.map((item, i) => (
                <ArticleCard key={item.slug} item={item} index={i} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onGoTo={goTo} />
            )}
          </>
        )}
      </main>

      <Footer />
      <ContactModal />
      <ServiceDetailModal />
    </div>
  )
}

function ArticleCard({ item, index }: { item: NewsListItem; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index % 9) * 0.05 }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-all hover:border-brand-600 hover:shadow-2xl hover:shadow-brand-600/10"
    >
      <Link to={`/news/${item.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-50 to-neutral-50">
          {item.cover ? (
            <img
              src={item.cover}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Newspaper className="h-12 w-12 text-brand-200" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6 lg:p-7">
          <time className="text-xs font-semibold uppercase tracking-wider text-brand-600" dateTime={item.published_at}>
            {formatDate(item.published_at)}
          </time>
          <h2 className="mt-3 text-xl font-bold leading-snug text-neutral-900 line-clamp-2">{item.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 line-clamp-3">{item.excerpt}</p>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand-600">
            Читать статью
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.article>
  )
}

function Pagination({
  page,
  totalPages,
  onGoTo,
}: {
  page: number
  totalPages: number
  onGoTo: (p: number) => void
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Постраничная навигация">
      <button
        onClick={() => onGoTo(page - 1)}
        disabled={page <= 1}
        className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-brand-600 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:text-neutral-600"
        aria-label="Предыдущая страница"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onGoTo(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`h-10 min-w-10 rounded-full px-3.5 text-sm font-semibold transition-colors ${
            p === page
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
              : 'border border-neutral-200 text-neutral-600 hover:border-brand-600 hover:text-brand-600'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onGoTo(page + 1)}
        disabled={page >= totalPages}
        className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-brand-600 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:text-neutral-600"
        aria-label="Следующая страница"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
