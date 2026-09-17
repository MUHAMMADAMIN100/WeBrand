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
        {/* Section 1 — page header, the same scale as the other inner pages. */}
        <section className="mx-auto max-w-[88rem] px-5 pt-28 md:pt-36 lg:px-10">
          <h1 className="font-display text-display-xl font-black text-ink-950">Наши работы по SMM</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-600 lg:text-lg">
            Топовые кейсы, видео и рилсы, а также сильные партнёры — реальные результаты
            продвижения бизнеса в социальных сетях.
          </p>
          <Link
            href="/brief?direction=smm"
            className="group mt-8 inline-flex h-14 items-center gap-2.5 rounded-full bg-ink-950 px-8 text-base font-semibold text-white transition-colors duration-300 ease-expo hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Обсудить проект
            <ArrowRight className="h-5 w-5 transition-transform duration-300 ease-expo group-hover:translate-x-1" aria-hidden="true" />
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
