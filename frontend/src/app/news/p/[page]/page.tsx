import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import NewsIndex, { newsIndexMetadata } from '../../../../components/NewsIndex'

// The pages of the blog feed behind `/news?page=<n>`. Visitors never see this
// path: next.config.mjs rewrites `/news?page=<n>` onto it, which lets each page
// be rendered once and cached instead of being built from the query string on
// every request. Canonical and pagination links keep the `?page=` form.
export const revalidate = 300

type Params = { page: string }

// Nothing is built ahead of time; each page is rendered on its first visit and
// cached from then on. (An empty list is what tells Next the route is static.)
export function generateStaticParams(): Params[] {
  return []
}

function parsePage(raw: string): number | null {
  if (!/^[1-9][0-9]{0,4}$/.test(raw)) return null
  return Number(raw)
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const page = parsePage((await params).page)
  return page ? newsIndexMetadata(page) : { title: 'Страница не найдена — Webrand', robots: { index: false } }
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const page = parsePage((await params).page)
  if (!page) notFound()
  return <NewsIndex page={page} />
}
