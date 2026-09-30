// API + SEO origins and server-side data helpers.
//
// API_BASE / SITE_URL default in code so local dev works with no .env.
//
// Pages are rendered once and served from the cache (ISR): the helpers below
// fetch through Next's data cache with a time limit and a tag, so a page costs
// the visitor no server work and no round trip to Django. Two things refresh it:
//   - the admin panel, right after a save, calls /api/revalidate (on demand);
//   - a time-based re-check every REVALIDATE seconds, as the safety net for
//     edits made elsewhere (Django admin, seeds, a missed call).
//
// What a helper does when the API cannot be reached depends on when it runs:
//   - While a cached page is being refreshed in production it THROWS. Next then
//     keeps serving the last good page and retries on a later request — so the
//     site stays up, with real content, while the backend is down.
//   - During `next build` and in `next dev` it returns the `error` shape and the
//     page renders its "could not load" state: a build never depends on the
//     backend being up, and a developer sees the state instead of an overlay.

import type { PortfolioItem, Vacancy } from '../data/content'

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://webrand.tj').replace(/\/$/, '')

/** Seconds a cached page and its data are served before being checked again.
 *  Every page file repeats this number in `export const revalidate` — Next reads
 *  that export statically and cannot follow an import. Keep them equal. */
export const REVALIDATE = 300

/** Every API response is cached under this tag; /api/revalidate drops it. */
export const API_TAG = 'api'

type Loaded<T> = { kind: 'ok'; data: T } | { kind: 'notfound' } | { kind: 'error' }

const BUILDING = process.env.NEXT_PHASE === 'phase-production-build'
/** Refreshing a cached page in production: failing loudly keeps the old page. */
const THROW_ON_FAILURE = process.env.NODE_ENV === 'production' && !BUILDING

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** GET `path` from the API through the data cache. A 404 is an answer, not a
 *  failure. Anything else that is not a 2xx — a network error, a response that
 *  takes over 10 s — is retried, then handled as described at the top. */
async function load<T>(path: string, tag: string): Promise<Loaded<T>> {
  const attempts = BUILDING ? 3 : 2
  let failure: unknown
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await wait(BUILDING ? 1500 * attempt : 300)
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        next: { revalidate: REVALIDATE, tags: [API_TAG, tag] },
        signal: AbortSignal.timeout(10_000),
      })
      if (res.status === 404) return { kind: 'notfound' }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return { kind: 'ok', data: (await res.json()) as T }
    } catch (error) {
      failure = error
    }
  }
  if (THROW_ON_FAILURE) {
    throw new Error(`API unavailable: ${path} (${failure instanceof Error ? failure.message : String(failure)})`)
  }
  return { kind: 'error' }
}

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
  const res = await load<PortfolioItem[]>('/api/projects/', 'projects')
  return res.kind === 'ok' ? { data: res.data, error: false } : { data: [], error: true }
}

// SMM-only projects for the /smm page. The backend already orders by
// `sort_order` and only anonymous-visible (published) rows come back.
export async function getSmmProjects(): Promise<{ data: ProjectItem[]; error: boolean }> {
  const res = await load<ProjectItem[]>('/api/projects/?category=SMM', 'projects')
  return res.kind === 'ok' ? { data: res.data, error: false } : { data: [], error: true }
}

// Single project for the case page. Picked out of the full list rather than
// asked for by `?slug=`: the list is already in the cache for the home page, so
// twenty case pages cost the API one request between them, not twenty.
// 'notfound' when no published project has that slug, 'error' when the list
// could not be loaded — same shape as getNewsArticle.
export async function getProjectBySlug(
  slug: string,
): Promise<{ data: PortfolioItem | null; status: 'ready' | 'notfound' | 'error' }> {
  const res = await load<PortfolioItem[]>('/api/projects/', 'projects')
  if (res.kind !== 'ok') return { data: null, status: 'error' }
  const project = res.data.find((p) => p.slug === slug)
  return project ? { data: project, status: 'ready' } : { data: null, status: 'notfound' }
}

export async function getReels(): Promise<{ data: Reel[]; error: boolean }> {
  const res = await load<Reel[]>('/api/reels/', 'reels')
  return res.kind === 'ok' ? { data: res.data, error: false } : { data: [], error: true }
}

export async function getPartners(): Promise<{ data: Partner[]; error: boolean }> {
  const res = await load<Partner[]>('/api/partners/', 'partners')
  return res.kind === 'ok' ? { data: res.data, error: false } : { data: [], error: true }
}

export async function getVacancies(): Promise<{ data: Vacancy[]; error: boolean }> {
  const res = await load<ApiVacancy[]>('/api/vacancies/', 'vacancies')
  if (res.kind !== 'ok') return { data: [], error: true }
  // Map slug -> id so the existing Vacancy type/contract is preserved.
  return { data: res.data.map(({ slug, ...rest }) => ({ id: slug, ...rest })), error: false }
}

// A page of the news feed. 'notfound' when the page number is past the end
// (the API answers 404 "Invalid page").
export async function getNewsPage(
  page: number,
): Promise<{ data: Paginated<NewsListItem> | null; status: 'ready' | 'notfound' | 'error' }> {
  const res = await load<Paginated<NewsListItem>>(`/api/news/?page=${page}&page_size=${NEWS_PAGE_SIZE}`, 'news')
  if (res.kind === 'ok') return { data: res.data, status: 'ready' }
  return { data: null, status: res.kind }
}

// Returns the article, or 'notfound' on a 404, or 'error' on any other failure.
export async function getNewsArticle(
  slug: string,
): Promise<{ data: NewsArticle | null; status: 'ready' | 'notfound' | 'error' }> {
  const res = await load<NewsArticle>(`/api/news/${encodeURIComponent(slug)}/`, 'news')
  if (res.kind === 'ok') return { data: res.data, status: 'ready' }
  return { data: null, status: res.kind }
}

// Every published article, light shape, for the sitemap. Follows pagination in
// pages of 1000 (the endpoint's ceiling) — one request until the blog outgrows it.
export async function getAllNews(): Promise<{ data: NewsListItem[]; error: boolean }> {
  const items: NewsListItem[] = []
  for (let page = 1; page <= 20; page++) {
    const res = await load<Paginated<NewsListItem>>(`/api/news/?page=${page}&page_size=1000`, 'news')
    if (res.kind !== 'ok') return { data: items, error: true }
    items.push(...res.data.results)
    if (!res.data.next) break
  }
  return { data: items, error: false }
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
