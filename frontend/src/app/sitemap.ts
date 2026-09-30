import type { MetadataRoute } from 'next'
import { SITE_URL, getAllNews, getProjects } from '../lib/api'

// The core pages plus every published article and case. Cached like the pages
// themselves (see lib/api.ts): refreshed when the admin saves something and
// re-checked every five minutes. Resilient — the helpers never fail a build, so
// with the API unreachable it still lists the static pages.
export const revalidate = 300

const STATIC_PATHS = ['/', '/smm', '/brief', '/vacancies', '/news']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
  }))

  const [news, projects] = await Promise.all([getAllNews(), getProjects()])

  for (const a of news.data) {
    if (a.is_published === false) continue
    const raw = a.published_at || ''
    entries.push({
      url: `${SITE_URL}/news/${a.slug}`,
      lastModified: raw ? new Date(raw) : now,
    })
  }

  // Project case pages (/portfolio/<slug>) — published projects only.
  for (const p of projects.data as Array<{ slug?: string; is_published?: boolean }>) {
    if (!p.slug || p.is_published === false) continue
    entries.push({ url: `${SITE_URL}/portfolio/${p.slug}`, lastModified: now })
  }

  return entries
}
