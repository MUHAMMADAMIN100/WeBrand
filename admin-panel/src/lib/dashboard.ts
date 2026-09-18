import type { Lead, NewsListItem, Project, Vacancy } from './types'

/** Local-midnight timestamp of a date (the journal's `created_at` is ISO/UTC). */
export function dayStart(d: Date): number {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

const DAY = 86_400_000

export type DayCount = { day: number; count: number }

/** Leads per local day for the last `days` days, oldest first, zero-filled. */
export function leadsByDay(leads: Lead[], days = 30, now = new Date()): DayCount[] {
  const today = dayStart(now)
  const first = today - (days - 1) * DAY
  const buckets = new Map<number, number>()
  for (let i = 0; i < days; i++) buckets.set(first + i * DAY, 0)
  for (const l of leads) {
    const d = dayStart(new Date(l.created_at))
    if (buckets.has(d)) buckets.set(d, (buckets.get(d) ?? 0) + 1)
  }
  return [...buckets.entries()].map(([day, count]) => ({ day, count }))
}

export function countSince(leads: Lead[], daysBack: number, now = new Date()): number {
  const from = dayStart(now) - daysBack * DAY
  return leads.filter((l) => new Date(l.created_at).getTime() >= from).length
}

export type Kpis = {
  leadsToday: number
  leads7d: number
  leadsPrev7d: number
  applications7d: number
  vacancies: { published: number; draft: number }
  projects: { published: number; draft: number }
  news: { published: number; draft: number }
}

export function computeKpis(
  all: Lead[],
  vacancies: Vacancy[],
  projects: Project[],
  news: NewsListItem[],
  now = new Date(),
): Kpis {
  const leads = all.filter((l) => l.kind === 'lead')
  const apps = all.filter((l) => l.kind === 'application')
  const split = <T extends { is_published: boolean }>(xs: T[]) => ({
    published: xs.filter((x) => x.is_published).length,
    draft: xs.filter((x) => !x.is_published).length,
  })
  const leads7d = countSince(leads, 6, now)
  const leads14d = countSince(leads, 13, now)
  return {
    leadsToday: countSince(leads, 0, now),
    leads7d,
    leadsPrev7d: leads14d - leads7d,
    applications7d: countSince(apps, 6, now),
    vacancies: split(vacancies),
    projects: split(projects),
    news: split(news),
  }
}

/** Latest first, `n` of them. */
export function latest(all: Lead[], n = 5): Lead[] {
  return [...all].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, n)
}

/** Russian plural: 1 заявка, 2 заявки, 5 заявок. */
export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}
