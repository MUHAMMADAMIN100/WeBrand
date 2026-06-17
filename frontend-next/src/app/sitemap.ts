import type { MetadataRoute } from 'next'
import { API_BASE, SITE_URL } from '../lib/api'

// Generated per request from the API (mirrors the Vite app's serverless
// sitemap): the core pages plus every PUBLISHED news article (follows
// pagination). Resilient — if the API is unreachable it still returns the static
// pages, so the sitemap never errors and the build never depends on the backend.
export const dynamic = 'force-dynamic'

const STATIC_PATHS = ['/', '/smm', '/brief', '/vacancies', '/news']

async function fetchAllNews(): Promise<Array<Record<string, unknown>>> {
  const items: Array<Record<string, unknown>> = []
  let url: string | null = `${API_BASE}/api/news/?page_size=100`
  // Follow pagination; cap iterations as a safety net.
  for (let i = 0; i < 50 && url; i++) {
    const res: Response = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const results = Array.isArray(data) ? data : data.results || []
    for (const a of results) items.push(a)
    url = (!Array.isArray(data) && data.next) || null
  }
  return items
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
  }))

  try {
    const news = await fetchAllNews()
    for (const a of news) {
      if (a.is_published === false) continue
      const raw = (a.published_at as string) || (a.updated_at as string) || ''
      entries.push({
        url: `${SITE_URL}/news/${a.slug}`,
        lastModified: raw ? new Date(raw) : now,
      })
    }
  } catch {
    // Degrade gracefully: keep the static pages, skip the news block.
  }

  // Project case pages (/portfolio/<slug>). The endpoint returns a plain array
  // of published projects; degrade gracefully if the API is unreachable.
  try {
    const res = await fetch(`${API_BASE}/api/projects/`, { cache: 'no-store' })
    if (res.ok) {
      const projects = (await res.json()) as Array<{ slug?: string; is_published?: boolean }>
      for (const p of projects) {
        if (!p.slug || p.is_published === false) continue
        entries.push({ url: `${SITE_URL}/portfolio/${p.slug}`, lastModified: now })
      }
    }
  } catch {
    // Skip the portfolio block on failure.
  }

  return entries
}
