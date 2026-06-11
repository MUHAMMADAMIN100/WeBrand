import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ContactModal from '../components/ContactModal'
import ServiceDetailModal from '../components/ServiceDetailModal'
import NotFound from '../components/NotFound'
import { Seo } from '../components/Seo'
import { SITE_URL, fetchNewsArticle, formatDate, type NewsArticle } from '../lib/news'

export default function NewsArticlePage() {
  const { slug = '' } = useParams()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    const ctrl = new AbortController()
    setStatus('loading')
    fetchNewsArticle(slug, ctrl.signal)
      .then((data) => {
        setArticle(data)
        setStatus('ready')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setStatus(/404/.test(err.message) ? 'notfound' : 'error')
      })
    return () => ctrl.abort()
  }, [slug])

  // A missing article is a real 404 — reuse the site's NotFound page (also 404 SEO).
  if (status === 'notfound') return <NotFound />

  return (
    <div className="relative min-h-screen bg-white">
      {status === 'ready' && article && <ArticleSeo article={article} />}

      <Navbar />

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36 lg:px-8">
        <Link
          to="/news"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Все статьи
        </Link>

        {status === 'loading' ? (
          <div className="flex items-center justify-center gap-3 py-24 text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
            <span className="text-sm font-medium">Загружаем статью…</span>
          </div>
        ) : status === 'error' ? (
          <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-20 text-center">
            <p className="text-base font-semibold text-neutral-800">Не удалось загрузить статью</p>
            <p className="mt-2 text-sm text-neutral-600">Попробуйте обновить страницу позже.</p>
          </div>
        ) : article ? (
          <article className="mt-6">
            <time
              className="text-sm font-semibold uppercase tracking-wider text-brand-600"
              dateTime={article.published_at}
            >
              {formatDate(article.published_at)}
            </time>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 md:text-5xl">
              {article.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-neutral-600">{article.excerpt}</p>

            {article.cover && (
              <img
                src={article.cover}
                alt={article.title}
                className="mt-8 aspect-[16/9] w-full rounded-3xl border border-neutral-200 object-cover"
              />
            )}

            <div
              className="article-body mt-10"
              // Body is editorial HTML authored in the admin / seed — rendered as-is.
              dangerouslySetInnerHTML={{ __html: article.body }}
            />

            <div className="mt-14 border-t border-neutral-200 pt-8">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-shadow hover:shadow-xl hover:shadow-brand-600/30"
              >
                <ArrowLeft className="h-4 w-4" />
                Читать другие статьи
              </Link>
            </div>
          </article>
        ) : null}
      </main>

      <Footer />
      <ContactModal />
      <ServiceDetailModal />
    </div>
  )
}

/** Per-article <head>: delegates the common tags to <Seo> and supplies the
 *  article-specific image, keywords, timestamps and JSON-LD NewsArticle schema. */
function ArticleSeo({ article }: { article: NewsArticle }) {
  const url = `${SITE_URL}/news/${article.slug}`
  const title = article.meta_title || article.title
  const description = article.meta_description || article.excerpt
  const image = article.cover || `${SITE_URL}/og-image.png`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description,
    image: [image],
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    inLanguage: 'ru-RU',
    author: { '@type': 'Organization', name: 'Webrand', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Webrand',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }

  return (
    <Seo
      title={title}
      description={description}
      path={`/news/${article.slug}`}
      type="article"
      image={image}
      keywords={article.keywords?.length ? article.keywords.join(', ') : undefined}
      publishedTime={article.published_at}
      modifiedTime={article.updated_at || article.published_at}
      jsonLd={jsonLd}
    />
  )
}
