import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SiteShell from '../../components/SiteShell'
import CTA from '../../components/CTA'
import SmmProjects from '../../components/SmmProjects'
import SmmReels from '../../components/SmmReels'
import SmmPartners from '../../components/SmmPartners'
import { getPartners, getReels, getSmmProjects } from '../../lib/api'
import { pageMetadata } from '../../lib/seo'

// Data is fetched fresh from the API on every request (SSR) so the work is
// crawlable; force-dynamic keeps the build from trying to prerender it.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Наши работы по SMM — кейсы, рилсы и партнёры | Webrand',
  description:
    'SMM-кейсы агентства Webrand в Душанбе: топовые проекты, видео и рилсы, сильные партнёры. Реальные работы по продвижению бизнеса в социальных сетях.',
  path: '/smm',
})

export default async function Page() {
  const [projects, reels, partners] = await Promise.all([
    getSmmProjects(),
    getReels(),
    getPartners(),
  ])

  return (
    <SiteShell>
      <main>
        {/* Section 1 — page header, styled like the home «Портфолио» block. */}
        <section className="mx-auto max-w-7xl px-5 pt-28 md:px-6 md:pt-36 lg:px-10">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">
            — Работы по SMM
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            Наши работы по SMM
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
            Топовые кейсы, видео и рилсы, а также сильные партнёры — реальные результаты
            продвижения бизнеса в социальных сетях.
          </p>
          <Link
            href="/brief?direction=smm"
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30"
          >
            Обсудить проект
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </section>

        {/* Section 2 — top cases + the rest of the SMM projects. */}
        <SmmProjects projects={projects.data} error={projects.error} />

        {/* Section 3 — reels (hides itself when there are none). */}
        <SmmReels reels={reels.data} />

        {/* Section 4 — partner cards (hides itself when there are none). */}
        <SmmPartners partners={partners.data} />

        {/* Section 5 — CTA: the site's existing contact mechanism. */}
        <CTA />
      </main>
    </SiteShell>
  )
}
