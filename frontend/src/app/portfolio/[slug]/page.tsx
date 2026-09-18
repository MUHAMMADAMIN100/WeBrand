import type { Metadata } from 'next'
import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight, Instagram } from 'lucide-react'
import Button from '../../../components/ui/Button'
import SiteShell from '../../../components/SiteShell'
import CasePoster from '../../../components/portfolio/CasePoster'
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

// The live project behind a case: the admin's «Ссылка на кейс» (`url`), filled
// for every project — a website for development cases, an Instagram account
// for SMM ones. The older `site_url` is honoured if it is ever set.
// Returns what to say about the link, judged by where it points: an Instagram
// URL is shown as the account («@handle»), anything else as the site's host.
type LiveLink = { href: string; kind: 'instagram' | 'site'; label: string; display: string }

function liveLinkFor(project: PortfolioItem): LiveLink | null {
  const href = project.url?.trim() || project.site_url?.trim()
  if (!href) return null
  try {
    const u = new URL(href)
    const host = u.hostname.replace(/^www\./, '')
    if (/(^|\.)instagram\.com$/i.test(host)) {
      const handle = u.pathname.split('/').filter(Boolean)[0]
      return { href, kind: 'instagram', label: 'Смотреть в Instagram', display: handle ? `@${handle}` : host }
    }
    return { href, kind: 'site', label: 'Перейти на сайт', display: host }
  } catch {
    return { href, kind: 'site', label: 'Перейти на сайт', display: href }
  }
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

      <main className="mx-auto max-w-[88rem] px-5 pb-20 pt-28 md:pb-28 md:pt-36 lg:px-10">
        <Link
          href="/#portfolio"
          className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-ink-600 transition-colors hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Все работы
        </Link>

        {status === 'error' || !project ? (
          <div className="mt-8 rounded-[1.75rem] border border-ink-200 bg-white px-6 py-20 text-center">
            <p className="font-display text-lg font-bold text-ink-950">Не удалось загрузить кейс</p>
            <p className="mt-2 text-sm text-ink-600">Обновите страницу чуть позже.</p>
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
  const live = liveLinkFor(project)
  const LiveIcon = live?.kind === 'instagram' ? Instagram : ArrowUpRight

  return (
    <>
      <header className="mt-7">
        <span className="inline-flex rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-bold text-ink-950">
          {project.category}
        </span>
        <h1 className="mt-5 font-display text-display-xl font-black text-ink-950">{project.name}</h1>
        {project.subtitle && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-600 lg:text-xl">{project.subtitle}</p>
        )}
        {/* The way in to the real thing, right under the name. */}
        {live && (
          <Button
            href={live.href}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            className="mt-7 w-full sm:w-auto"
            aria-label={`${live.label}: ${live.display} (откроется в новой вкладке)`}
          >
            {live.kind === 'instagram' && <Instagram className="h-5 w-5" aria-hidden="true" />}
            {live.label}
            <ArrowUpRight
              className="h-5 w-5 transition-transform duration-300 ease-expo group-hover/btn:rotate-45"
              aria-hidden="true"
            />
          </Button>
        )}
      </header>

      {/* The cover when the project has one; otherwise the same accent poster
          the portfolio grid shows, at hero scale. */}
      <CasePoster item={project} size="hero" className="mt-9 aspect-[16/10] rounded-[2rem] md:mt-12 md:aspect-[16/8]" />

      <div className="mt-12 grid gap-10 md:mt-16 lg:grid-cols-12 lg:gap-10">
        {body && (
          <section className="lg:col-span-8">
            <h2 className="font-display text-display-md font-black text-ink-950">О проекте</h2>
            <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink-700 lg:text-lg">{body}</p>
          </section>
        )}

        <aside className="flex flex-col gap-6 lg:col-span-4">
          {project.tags?.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Теги проекта">
              {project.tags.map((t) => (
                <li key={t} className="rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-sm font-medium text-ink-700">
                  {t}
                </li>
              ))}
            </ul>
          )}

          {/* The same link again beside the tags, where the eye lands after
              reading «О проекте». Only when the project has one. */}
          {live && (
            <a
              href={live.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${live.label}: ${live.display} (откроется в новой вкладке)`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-ink-200 bg-white px-5 py-4 transition-colors duration-300 ease-expo hover:border-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <span className="flex min-w-0 items-center gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-950 text-white transition-colors duration-300 ease-expo group-hover:bg-brand-600">
                  <LiveIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink-950">{live.label}</span>
                  <span className="block truncate text-sm text-ink-600">{live.display}</span>
                </span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-ink-950 transition-transform duration-300 ease-expo group-hover:rotate-45" aria-hidden="true" />
            </a>
          )}
        </aside>
      </div>

      {/* CTA — calculate a similar project, direction pre-selected on the brief */}
      <section className="relative mt-14 overflow-hidden rounded-[2rem] bg-brand-600 p-7 text-white sm:p-10 md:mt-20 lg:p-14">
        <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <h2 className="font-display text-display-lg font-black">Хотите похожий проект?</h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/90 lg:text-lg">
              Рассчитаем стоимость и сроки под вашу задачу — бесплатно.
            </p>
          </div>
          <Link
            href={`/brief?direction=${direction}`}
            className="group inline-flex h-14 shrink-0 items-center gap-2.5 rounded-full bg-lime px-8 text-base font-semibold text-ink-950 transition-colors duration-300 ease-expo hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
          >
            Рассчитать похожий проект
            <ArrowRight className="h-5 w-5 transition-transform duration-300 ease-expo group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </section>
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
