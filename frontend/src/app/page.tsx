import type { Metadata } from 'next'
import HomeContent from '../components/HomeContent'
import { pageMetadata } from '../lib/seo'

// Rendered once and served from the cache; refreshed when the admin saves
// something and re-checked every five minutes (see lib/api.ts, REVALIDATE).
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
