import type { Metadata } from 'next'
import SiteShell from '../../components/SiteShell'
import BriefForm from '../../components/BriefForm'
import { pageMetadata } from '../../lib/seo'

// Reads ?direction= per request — keep it dynamic (no static prerender).
export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Обсудить проект — бриф | Webrand',
  description:
    'Расскажите о задаче свободным текстом или по короткому брифу — разработка сайтов, дизайн, SMM, реклама. Ответим в течение пары часов. Webrand, Душанбе.',
  path: '/brief',
})

type SearchParams = { direction?: string | string[] }

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const direction = Array.isArray(sp.direction) ? sp.direction[0] : sp.direction || ''

  return (
    <SiteShell>
      <BriefForm initialDirection={direction} />
    </SiteShell>
  )
}
