// News (SEO blog) API layer + helpers. Mirrors the inline fetch pattern used by
// Portfolio.tsx: API_BASE defaults in code so the running dev server picks it up.

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Canonical/OG absolute URLs are built from the public site origin. Override via
// VITE_SITE_URL in prod; otherwise fall back to the current origin at runtime.
export const SITE_URL: string =
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://webrand-flame.vercel.app')

export type NewsListItem = {
  slug: string
  title: string
  excerpt: string
  cover: string | null
  keywords: string[]
  is_published: boolean
  published_at: string
  sort_order: number
}

export type NewsArticle = NewsListItem & {
  body: string
  meta_title: string
  meta_description: string
  created_at: string
  updated_at: string
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const NEWS_PAGE_SIZE = 9

export async function fetchNewsPage(page: number, signal?: AbortSignal): Promise<Paginated<NewsListItem>> {
  const res = await fetch(`${API_BASE}/api/news/?page=${page}`, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchNewsArticle(slug: string, signal?: AbortSignal): Promise<NewsArticle> {
  const res = await fetch(`${API_BASE}/api/news/${slug}/`, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// Russian long date, e.g. «11 июня 2026». Falls back to the raw string on error.
export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
