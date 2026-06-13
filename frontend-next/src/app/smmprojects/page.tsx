import type { Metadata } from 'next'
import HomeContent from '../../components/HomeContent'
import { pageMetadata } from '../../lib/seo'

// /smmprojects is a client-side filter of the same home content, so its
// canonical points at the home page (matching the Vite app's <Seo path="/">).
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
