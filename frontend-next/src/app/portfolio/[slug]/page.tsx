import type { Metadata } from 'next'
import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink } from 'lucide-react'
import SiteShell from '../../../components/SiteShell'
import BrowserMockup from '../../../components/BrowserMockup'
import { SITE_URL, getProjectBySlug } from '../../../lib/api'
import { pageMetadata } from '../../../lib/seo'
import type { PortfolioItem } from '../../../data/content'

// Cases are server-rendered fresh from the API on every request (SSR) so the
// content + meta tags are in the initial HTML for crawlers.
export const dynamic = 'force-dynamic'

// React.cache dedupes the fetch across generateMetadata + the page render.
const getProject = cache(getProjectBySlug)

type Params = { slug: string }

// Pre-select the quiz direction on the brief from the project's category:
// SMM → smm, Разработка (everything else) → dev.
function directionFor(category: string): string {
  return category === 'SMM' ? 'smm' : 'dev'
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const { data: project, status } = await getProject(slug)
  if (status === 'notfound' || !project) {
    return { title: 'Кейс не найден — Webrand', robots: { index: false } }
  }
  const description = (project.case_description || project.description || project.subtitle || '').slice(0, 300)
  return pageMetadata({
    title: `${project.name} — кейс Webrand`,
    description,
    path: `/portfolio/${project.slug ?? slug}`,
    image: project.cover || undefined,
    keywords: project.tags?.length ? project.tags.join(', ') : undefined,
  })
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const { data: project, status } = await getProject(slug)

  // A missing project is a real 404 — render the standalone NotFound (404 SEO).
  if (status === 'notfound') notFound()

  return (
    <SiteShell>
      {status === 'ready' && project && <CaseJsonLd project={project} slug={project.slug ?? slug} />}

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36 lg:px-8">
        <Link
          href="/#portfolio"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Все работы
        </Link>

        {status === 'error' || !project ? (
          <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-20 text-center">
            <p className="text-base font-semibold text-neutral-800">Не удалось загрузить кейс</p>
            <p className="mt-2 text-sm text-neutral-600">Попробуйте обновить страницу позже.</p>
          </div>
        ) : (
          <CaseBody project={project} />
        )}
      </main>
    </SiteShell>
  )
}

function CaseBody({ project }: { project: PortfolioItem }) {
  const body = project.case_description?.trim() || project.description?.trim() || ''
  const direction = directionFor(project.category)
  const siteUrl = project.site_url?.trim()

  return (
    <>
      {/* Heading */}
      <div className="mt-6">
        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
          {project.category}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
          {project.name}
        </h1>
        {project.subtitle && (
          <p className="mt-3 max-w-2xl text-lg text-neutral-500">{project.subtitle}</p>
        )}
      </div>

      {/* Big mockup */}
      <BrowserMockup item={project} aspect="aspect-[16/9]" className="mt-8 md:mt-10" />

      {/* Description */}
      {body && (
        <div className="mt-10 max-w-3xl md:mt-12">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-brand-600">О проекте</h2>
          <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-neutral-700 md:text-lg">
            {body}
          </p>
        </div>
      )}

      {/* Tags */}
      {project.tags?.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span key={t} className="rounded-full bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-700">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* CTA — calculate a similar project, direction pre-selected on the brief */}
      <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-7 text-white sm:p-10 md:mt-16">
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
              Хотите похожий проект?
            </h2>
            <p className="mt-2 max-w-md text-white/80">
              Рассчитаем стоимость и сроки под вашу задачу — бесплатно.
            </p>
          </div>
          <Link
            href={`/brief?direction=${direction}`}
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-brand-700 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Рассчитать похожий проект
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Live-site link — only when a site_url is set */}
      {siteUrl && (
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-5 flex items-center justify-between gap-4 rounded-3xl border border-neutral-200 bg-white px-6 py-5 transition-all hover:border-brand-600 hover:shadow-lg hover:shadow-brand-600/10"
        >
          <span className="flex items-center gap-3 min-w-0">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <ExternalLink className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-neutral-900">Перейти на сайт</span>
              <span className="block truncate text-sm text-neutral-500">{siteUrl}</span>
            </span>
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-neutral-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600" />
        </a>
      )}
    </>
  )
}

/** Per-case JSON-LD (CreativeWork), server-rendered into the page. */
function CaseJsonLd({ project, slug }: { project: PortfolioItem; slug: string }) {
  const url = `${SITE_URL}/portfolio/${slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.name,
    headline: project.name,
    description: project.case_description || project.description || project.subtitle || project.name,
    ...(project.cover ? { image: [project.cover] } : {}),
    inLanguage: 'ru-RU',
    creator: { '@type': 'Organization', name: 'Webrand', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  )
}
