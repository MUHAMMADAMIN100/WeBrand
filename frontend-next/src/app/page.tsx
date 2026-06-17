import type { Metadata } from 'next'
import HomeContent from '../components/HomeContent'
import { pageMetadata } from '../lib/seo'

// Projects are fetched fresh from the API on every request (SSR) so Google sees
// the real content; force-dynamic keeps the build from trying to prerender it.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Webrand — Комплексные digital-решения для бизнеса',
  description:
    'Webrand — digital-агентство в Душанбе. Разработка сайтов, дизайн и брендинг, SMM, эквайринг и продвижение для бизнеса.',
  path: '/',
})

export default function Page() {
  return <HomeContent />
}
