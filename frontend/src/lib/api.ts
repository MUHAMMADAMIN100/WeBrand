// API + SEO origins and server-side data helpers.
//
// API_BASE / SITE_URL default in code so local dev works with no .env. The data
// helpers are written for Server Components (they use `cache: 'no-store'` so the
// pages render fresh from the Django API on every request — Google sees the real
// content) and never throw: each returns a safe `{ data, error }` shape so a
// backend hiccup degrades gracefully instead of crashing the render or the build.

import type { PortfolioItem, Vacancy } from '../data/content'

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://webrand.tj').replace(/\/$/, '')

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

export const NEWS_PAGE_SIZE = 12

// Project as returned by the API, plus the SMM-page extras (`is_featured`,
// `sort_order`) the home PortfolioItem type doesn't carry.
export type ProjectItem = PortfolioItem & {
  is_featured?: boolean
  is_published?: boolean
  sort_order?: number
}

export type Reel = {
  id: number
  youtube_url: string
  title: string
  sort_order: number
}

export type Partner = {
  id: number
  name: string
  logo: string | null
  niche: string
  description: string
  result: string
  link: string | null
  sort_order: number
}

// The API returns vacancies keyed by `slug`; the frontend Vacancy type uses `id`.
type ApiVacancy = Omit<Vacancy, 'id'> & { slug: string }

export async function getProjects(): Promise<{ data: PortfolioItem[]; error: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/projects/`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return { data: (await res.json()) as PortfolioItem[], error: false }
  } catch {
    return { data: [], error: true }
  }
}

// SMM-only projects for the /smm page. The backend already orders by
// `sort_order` and only anonymous-visible (published) rows come back.
export async function getSmmProjects(): Promise<{ data: ProjectItem[]; error: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/projects/?category=SMM`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return { data: (await res.json()) as ProjectItem[], error: false }
  } catch {
    return { data: [], error: true }
  }
}

// Single project for the case page, looked up by its stable slug via the
// backend `?slug=` filter. Returns 'notfound' when no project matches, 'error'
// on any other failure — same shape as getNewsArticle.
export async function getProjectBySlug(
  slug: string,
): Promise<{ data: PortfolioItem | null; status: 'ready' | 'notfound' | 'error' }> {
  try {
    const res = await fetch(`${API_BASE}/api/projects/?slug=${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const arr = (await res.json()) as PortfolioItem[]
    if (!Array.isArray(arr) || arr.length === 0) return { data: null, status: 'notfound' }
    return { data: arr[0], status: 'ready' }
  } catch {
    return { data: null, status: 'error' }
  }
}

export async function getReels(): Promise<{ data: Reel[]; error: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/reels/`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return { data: (await res.json()) as Reel[], error: false }
  } catch {
    return { data: [], error: true }
  }
}

export async function getPartners(): Promise<{ data: Partner[]; error: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/partners/`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return { data: (await res.json()) as Partner[], error: false }
  } catch {
    return { data: [], error: true }
  }
}

export async function getVacancies(): Promise<{ data: Vacancy[]; error: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/vacancies/`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as ApiVacancy[]
    // Map slug -> id so the existing Vacancy type/contract is preserved.
    return { data: data.map(({ slug, ...rest }) => ({ id: slug, ...rest })), error: false }
  } catch {
    return { data: [], error: true }
  }
}

export async function getNewsPage(
  page: number,
): Promise<{ data: Paginated<NewsListItem> | null; error: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/news/?page=${page}&page_size=${NEWS_PAGE_SIZE}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return { data: (await res.json()) as Paginated<NewsListItem>, error: false }
  } catch {
    return { data: null, error: true }
  }
}

// Returns the article, or 'notfound' on a 404, or 'error' on any other failure.
export async function getNewsArticle(
  slug: string,
): Promise<{ data: NewsArticle | null; status: 'ready' | 'notfound' | 'error' }> {
  try {
    const res = await fetch(`${API_BASE}/api/news/${slug}/`, { cache: 'no-store' })
    if (res.status === 404) return { data: null, status: 'notfound' }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return { data: (await res.json()) as NewsArticle, status: 'ready' }
  } catch {
    return { data: null, status: 'error' }
  }
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
