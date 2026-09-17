import type { Metadata } from 'next'
import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SiteShell from '../../../components/SiteShell'
import { SITE_URL, formatDate, getNewsArticle, type NewsArticle } from '../../../lib/api'
import { pageMetadata } from '../../../lib/seo'

// Articles are server-rendered fresh from the API on every request (SSR) so the
// full body + meta tags are in the initial HTML for crawlers.
export const dynamic = 'force-dynamic'

// React.cache dedupes the fetch across generateMetadata + the page render in a
// single request.
const getArticle = cache(getNewsArticle)

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const { data: article, status } = await getArticle(slug)
  if (status === 'notfound' || !article) {
    return { title: 'Страница не найдена — Webrand', robots: { index: false } }
  }
  return pageMetadata({
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt,
    path: `/news/${article.slug}`,
    type: 'article',
    image: article.cover || undefined,
    keywords: article.keywords?.length ? article.keywords.join(', ') : undefined,
    publishedTime: article.published_at,
    modifiedTime: article.updated_at || article.published_at,
  })
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const { data: article, status } = await getArticle(slug)

  // A missing article is a real 404 — render the standalone NotFound (also 404 SEO).
  if (status === 'notfound') notFound()

  return (
    <SiteShell>
      {status === 'ready' && article && <ArticleJsonLd article={article} />}

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36 lg:px-8">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 transition-colors hover:text-ink-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Все статьи
        </Link>

        {status === 'error' ? (
          <div className="mt-8 rounded-[1.75rem] border border-ink-200 bg-white px-6 py-20 text-center">
            <p className="font-display text-lg font-bold text-ink-950">Не удалось загрузить статью</p>
            <p className="mt-2 text-sm text-ink-600">Попробуйте обновить страницу позже.</p>
          </div>
        ) : article ? (
          <article className="mt-6">
            <time
              className="text-sm font-semibold text-ink-600"
              dateTime={article.published_at}
            >
              {formatDate(article.published_at)}
            </time>
            <h1 className="mt-3 text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-ink-950 md:text-[2.75rem]">
              {article.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-600">{article.excerpt}</p>

            {article.cover && (
              <img
                src={article.cover}
                alt={article.title}
                className="mt-9 aspect-[16/9] w-full rounded-[1.75rem] object-cover ring-1 ring-inset ring-ink-950/10"
              />
            )}

            <div
              className="article-body mt-10"
              // Body is editorial HTML authored in the admin / seed — rendered as-is.
              dangerouslySetInnerHTML={{ __html: article.body }}
            />

            <div className="mt-14 border-t border-ink-200 pt-8">
              <Link
                href="/news"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink-950 px-6 text-sm font-semibold text-white transition-colors duration-300 ease-expo hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Читать другие статьи
              </Link>
            </div>
          </article>
        ) : null}
      </main>
    </SiteShell>
  )
}

/** Per-article JSON-LD NewsArticle schema, server-rendered into the page. */
function ArticleJsonLd({ article }: { article: NewsArticle }) {
  const url = `${SITE_URL}/news/${article.slug}`
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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
