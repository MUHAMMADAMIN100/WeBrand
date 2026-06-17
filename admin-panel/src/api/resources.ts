import type { Lead, News, NewsListItem, Partner, Project, Reel, Vacancy } from '../lib/types'
import { apiJson } from './client'

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] }

// ---- Vacancies (JSON) ------------------------------------------------------
export const listVacancies = () => apiJson<Vacancy[]>('/api/vacancies/', { auth: true })

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const createVacancy = (data: Partial<Vacancy>) =>
  apiJson<Vacancy>('/api/vacancies/', jsonInit('POST', data))

// Edit via PATCH (partial) so fields omitted by the form — e.g. accent, which is
// no longer edited in the admin — keep their existing stored value.
export const updateVacancy = (slug: string, data: Partial<Vacancy>) =>
  apiJson<Vacancy>(`/api/vacancies/${slug}/`, jsonInit('PATCH', data))

// Lightweight inline change (e.g. publish toggle) via PATCH.
export const patchVacancy = (slug: string, data: Partial<Vacancy>) =>
  apiJson<Vacancy>(`/api/vacancies/${slug}/`, jsonInit('PATCH', data))

export const deleteVacancy = (slug: string) =>
  apiJson<void>(`/api/vacancies/${slug}/`, { method: 'DELETE' })

// ---- Projects (multipart for logo upload) ----------------------------------
export type ProjectInput = {
  name: string
  subtitle: string
  description: string
  category: string
  tags: string[]
  accent: string
  url: string
  initials: string
  sort_order: number
  is_published: boolean
  is_featured: boolean
  logo?: File | null
}

function projectFormData(data: ProjectInput): FormData {
  const fd = new FormData()
  fd.append('name', data.name)
  fd.append('subtitle', data.subtitle)
  fd.append('description', data.description)
  fd.append('category', data.category)
  fd.append('accent', data.accent)
  fd.append('url', data.url)
  fd.append('initials', data.initials)
  fd.append('sort_order', String(data.sort_order))
  fd.append('is_published', String(data.is_published))
  fd.append('is_featured', String(data.is_featured))
  fd.append('tags', JSON.stringify(data.tags)) // JSONField accepts a JSON string
  if (data.logo) fd.append('logo', data.logo)
  return fd
}

export const listProjects = () => apiJson<Project[]>('/api/projects/', { auth: true })

export const createProject = (data: ProjectInput) =>
  apiJson<Project>('/api/projects/', { method: 'POST', body: projectFormData(data) })

// PATCH so an unchanged logo is preserved when no new file is attached.
export const updateProject = (id: number, data: ProjectInput) =>
  apiJson<Project>(`/api/projects/${id}/`, { method: 'PATCH', body: projectFormData(data) })

export const patchProject = (id: number, data: Record<string, unknown>) =>
  apiJson<Project>(`/api/projects/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const deleteProject = (id: number) =>
  apiJson<void>(`/api/projects/${id}/`, { method: 'DELETE' })

// ---- Reels (JSON — no file) ------------------------------------------------
export type ReelInput = { youtube_url: string; title: string; sort_order: number }

export const listReels = () => apiJson<Reel[]>('/api/reels/', { auth: true })

export const createReel = (data: ReelInput) =>
  apiJson<Reel>('/api/reels/', jsonInit('POST', data))

// Edit / inline reorder both via PATCH (partial).
export const patchReel = (id: number, data: Partial<ReelInput>) =>
  apiJson<Reel>(`/api/reels/${id}/`, jsonInit('PATCH', data))

export const deleteReel = (id: number) =>
  apiJson<void>(`/api/reels/${id}/`, { method: 'DELETE' })

// ---- Partners (multipart for logo upload, same as projects) ----------------
export type PartnerInput = {
  name: string
  niche: string
  description: string
  result: string
  link: string
  sort_order: number
  logo?: File | null
}

function partnerFormData(data: PartnerInput): FormData {
  const fd = new FormData()
  fd.append('name', data.name)
  fd.append('niche', data.niche)
  fd.append('description', data.description)
  fd.append('result', data.result)
  fd.append('link', data.link)
  fd.append('sort_order', String(data.sort_order))
  if (data.logo) fd.append('logo', data.logo)
  return fd
}

export const listPartners = () => apiJson<Partner[]>('/api/partners/', { auth: true })

export const createPartner = (data: PartnerInput) =>
  apiJson<Partner>('/api/partners/', { method: 'POST', body: partnerFormData(data) })

// PATCH so an unchanged logo is preserved when no new file is attached.
export const updatePartner = (id: number, data: PartnerInput) =>
  apiJson<Partner>(`/api/partners/${id}/`, { method: 'PATCH', body: partnerFormData(data) })

// Lightweight inline change (e.g. drag reorder) via JSON PATCH.
export const patchPartner = (id: number, data: Record<string, unknown>) =>
  apiJson<Partner>(`/api/partners/${id}/`, jsonInit('PATCH', data))

export const deletePartner = (id: number) =>
  apiJson<void>(`/api/partners/${id}/`, { method: 'DELETE' })

// ---- News (multipart for cover upload) -------------------------------------
export type NewsInput = {
  slug: string
  title: string
  excerpt: string
  body: string
  meta_title: string
  meta_description: string
  keywords: string[]
  is_published: boolean
  published_at: string // ISO / datetime-local string; '' → omitted (server default)
  sort_order: number
  cover?: File | null
}

function newsFormData(data: NewsInput, withSlug: boolean): FormData {
  const fd = new FormData()
  if (withSlug) fd.append('slug', data.slug)
  fd.append('title', data.title)
  fd.append('excerpt', data.excerpt)
  fd.append('body', data.body)
  fd.append('meta_title', data.meta_title)
  fd.append('meta_description', data.meta_description)
  fd.append('is_published', String(data.is_published))
  fd.append('sort_order', String(data.sort_order))
  fd.append('keywords', JSON.stringify(data.keywords)) // JSONField accepts a JSON string
  if (data.published_at) fd.append('published_at', data.published_at)
  if (data.cover) fd.append('cover', data.cover)
  return fd
}

// Admin reads every article (drafts included) for client-side filtering — one
// big page, then unwrap the paginated envelope.
export const listNews = () =>
  apiJson<Paginated<NewsListItem>>('/api/news/?page_size=1000', { auth: true }).then((p) => p.results)

// Full article (incl. body + SEO) for the edit drawer.
export const getNews = (slug: string) => apiJson<News>(`/api/news/${slug}/`, { auth: true })

export const createNews = (data: NewsInput) =>
  apiJson<News>('/api/news/', { method: 'POST', body: newsFormData(data, true) })

// PATCH so an unchanged cover is preserved when no new file is attached. The
// slug is the PK and is never sent on update.
export const updateNews = (slug: string, data: NewsInput) =>
  apiJson<News>(`/api/news/${slug}/`, { method: 'PATCH', body: newsFormData(data, false) })

// Lightweight inline change (e.g. publish toggle) via JSON PATCH.
export const patchNews = (slug: string, data: Record<string, unknown>) =>
  apiJson<News>(`/api/news/${slug}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const deleteNews = (slug: string) =>
  apiJson<void>(`/api/news/${slug}/`, { method: 'DELETE' })

// ---- Leads journal (read-only) ---------------------------------------------
export const listLeads = () => apiJson<Lead[]>('/api/leads/journal/', { auth: true })

// Single lead, fetched by id for the detail drawer (admin-only).
export const getLead = (id: number) => apiJson<Lead>(`/api/leads/journal/${id}/`, { auth: true })

// Admin-only delete of a single lead (best-effort resume cleanup is server-side).
export const deleteLead = (id: number) =>
  apiJson<void>(`/api/leads/journal/${id}/`, { method: 'DELETE', auth: true })

// ---- Auth ------------------------------------------------------------------
export const login = (username: string, password: string) =>
  apiJson<{ access: string; refresh: string }>('/api/auth/login/', {
    auth: false,
    ...jsonInit('POST', { username, password }),
  })
