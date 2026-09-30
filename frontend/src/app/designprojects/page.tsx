import type { Metadata } from 'next'
import HomeContent from '../../components/HomeContent'
import { pageMetadata } from '../../lib/seo'

// /designprojects is a client-side filter of the same home content, so its
// canonical points at the home page (matches /devprojects, /smmprojects).
// Cached like the home page it mirrors (see app/page.tsx).
export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: 'Webrand — Комплексные digital-решения для бизнеса',
  description:
    'Webrand — digital-агентство в Душанбе. Разработка сайтов, дизайн и брендинг, SMM, эквайринг и продвижение для бизнеса.',
  path: '/',
})

export default function Page() {
  return <HomeContent />
}
