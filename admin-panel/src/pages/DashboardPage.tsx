import { ArrowRight, ArrowUpRight, Briefcase, FolderKanban, Inbox, Newspaper, Plus, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader, Card } from '../components/Layout'
import { BarsByDay } from '../components/charts/BarsByDay'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'
import { listLeads, listNews, listProjects, listVacancies } from '../api/resources'
import { computeKpis, latest, leadsByDay, plural, type Kpis } from '../lib/dashboard'
import { LEAD_DIRECTION_LABEL } from '../lib/options'
import type { Lead } from '../lib/types'
import { fmtDate } from '../lib/useJournal'
import { LeadDetail } from './LeadDetail'

type Data = { kpis: Kpis; byDay: ReturnType<typeof leadsByDay>; recent: Lead[]; total: number }

function greeting(now = new Date()): string {
  const h = now.getHours()
  if (h < 5) return 'Доброй ночи'
  if (h < 12) return 'Доброе утро'
  if (h < 18) return 'Добрый день'
  return 'Добрый вечер'
}

/** A headline number with its label; the change against the previous window when there is one. */
function Stat({
  label,
  value,
  note,
  delta,
  to,
}: {
  label: string
  value: number
  note?: string
  delta?: number
  to: string
}) {
  const up = (delta ?? 0) > 0
  const down = (delta ?? 0) < 0
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-[1.25rem] border border-ink-200 bg-white p-5 shadow-card transition-colors duration-200 hover:border-ink-950 dark:border-ink-800 dark:bg-ink-900 dark:hover:border-white"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-ink-600 dark:text-ink-400">{label}</span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-400 transition-transform duration-300 ease-expo group-hover:rotate-45 group-hover:text-ink-950 dark:group-hover:text-white" aria-hidden="true" />
      </div>
      <span className="mt-3 font-display text-4xl font-black tabular-nums tracking-tight text-ink-950 dark:text-white">{value}</span>
      {(note || delta !== undefined) && (
        <span className="mt-2 flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-400">
          {delta !== undefined && delta !== 0 && (
            <span className={`inline-flex items-center gap-1 font-semibold ${up ? 'text-emerald-700 dark:text-emerald-300' : 'text-ink-950 dark:text-ink-100'}`}>
              {up ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
              {up ? '+' : '−'}
              {Math.abs(delta)}
            </span>
          )}
          {down || up ? <span>к прошлой неделе</span> : note ? <span>{note}</span> : null}
        </span>
      )}
    </Link>
  )
}

function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4 border-b border-ink-100 px-5 py-4 dark:border-ink-800">
        <h2 className="font-display text-base font-bold text-ink-950 dark:text-white">{title}</h2>
        {aside}
      </div>
      {children}
    </Card>
  )
}

function ContentStat({ icon: Icon, label, published, draft, to }: { icon: LucideIcon; label: string; published: number; draft: number; to: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3.5 rounded-2xl px-4 py-3 transition-colors hover:bg-paper dark:hover:bg-ink-800"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-950 text-lime dark:bg-white/10">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink-950 dark:text-ink-100">{label}</span>
        <span className="block text-xs text-ink-600 dark:text-ink-400">
          {published} опубл.{draft > 0 ? `, ${draft} в черновиках` : ''}
        </span>
      </span>
      <span className="font-display text-xl font-bold tabular-nums text-ink-950 dark:text-white">{published}</span>
    </Link>
  )
}

export default function DashboardPage() {
  const { username } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<Data | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [detailId, setDetailId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const [leads, vacancies, projects, news] = await Promise.all([listLeads(), listVacancies(), listProjects(), listNews()])
      const onlyLeads = leads.filter((l) => l.kind === 'lead')
      setData({
        kpis: computeKpis(leads, vacancies, projects, news),
        byDay: leadsByDay(onlyLeads, 30),
        recent: latest(leads, 5),
        total: leads.length,
      })
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const monthTotal = useMemo(() => data?.byDay.reduce((s, d) => s + d.count, 0) ?? 0, [data])

  return (
    <>
      <PageHeader
        title={`${greeting()}${username ? `, ${username}` : ''}`}
        subtitle="Что происходит с сайтом: заявки за последние дни и состояние контента."
        action={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/vacancies?new=1')}>
              Вакансия
            </Button>
            <Button size="sm" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/projects?new=1')}>
              Проект
            </Button>
            <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/news?new=1')}>
              Новость
            </Button>
          </div>
        }
      />

      {status === 'error' ? (
        <Card>
          <EmptyState
            icon={Inbox}
            title="Не удалось загрузить сводку"
            message="Проверьте, что бэкенд запущен, и попробуйте снова."
            action={<Button variant="secondary" onClick={load}>Повторить</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* KPI row */}
          {status === 'loading' || !data ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-[1.25rem] border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-4 h-10 w-16" />
                  <Skeleton className="mt-3 h-3 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label="Заявки сегодня" value={data.kpis.leadsToday} note="с полуночи" to="/leads" />
              <Stat label="Заявки за 7 дней" value={data.kpis.leads7d} delta={data.kpis.leads7d - data.kpis.leadsPrev7d} note="как и неделей раньше" to="/leads" />
              <Stat label="Отклики за 7 дней" value={data.kpis.applications7d} note="на вакансии" to="/vacancies/applications" />
              <Stat label="Всего в журнале" value={data.total} note="заявок и откликов" to="/leads" />
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            {/* Chart */}
            <Section
              title="Заявки по дням, 30 дней"
              aside={
                status === 'ready' && data ? (
                  <span className="text-sm text-ink-600 dark:text-ink-400">
                    <span className="font-semibold text-ink-950 dark:text-white">{monthTotal}</span> {plural(monthTotal, 'заявка', 'заявки', 'заявок')}
                  </span>
                ) : null
              }
            >
              <div className="px-4 pb-4 pt-8">
                {status === 'loading' || !data ? <Skeleton className="h-52 w-full" /> : <BarsByDay data={data.byDay} title="Заявки по дням за последние 30 дней" />}
              </div>
            </Section>

            {/* Content state */}
            <Section title="Контент на сайте">
              <div className="p-2">
                {status === 'loading' || !data ? (
                  <div className="space-y-2 p-2">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : (
                  <>
                    <ContentStat icon={Briefcase} label="Вакансии" to="/vacancies" {...data.kpis.vacancies} />
                    <ContentStat icon={FolderKanban} label="Проекты" to="/projects" {...data.kpis.projects} />
                    <ContentStat icon={Newspaper} label="Новости" to="/news" {...data.kpis.news} />
                  </>
                )}
              </div>
            </Section>
          </div>

          {/* Recent */}
          <Section
            title="Последние заявки"
            aside={
              <Link to="/leads" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-950 hover:text-brand-600 dark:text-white dark:hover:text-lime">
                Все заявки
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          >
            {status === 'loading' || !data ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ) : data.recent.length === 0 ? (
              <EmptyState icon={Inbox} title="Заявок пока нет" message="Здесь появятся заявки с форм сайта и отклики на вакансии." />
            ) : (
              <ul className="divide-y divide-ink-100 dark:divide-ink-800">
                {data.recent.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => setDetailId(l.id)}
                      className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-paper dark:hover:bg-ink-800"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper font-display text-sm font-bold text-ink-950 dark:bg-ink-800 dark:text-white">
                        {l.name.trim().charAt(0).toUpperCase() || '—'}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-semibold text-ink-950 dark:text-ink-100">{l.name}</span>
                          <Badge tone={l.kind === 'application' ? 'violet' : 'brand'}>{l.kind === 'application' ? 'Отклик' : 'Заявка'}</Badge>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-ink-600 dark:text-ink-400">
                          {l.kind === 'application'
                            ? l.role || 'вакансия'
                            : (l.selected ?? []).map((s) => LEAD_DIRECTION_LABEL[s] ?? s).join(', ') || l.message || l.contact}
                        </span>
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-ink-600 dark:text-ink-400">{fmtDate(l.created_at)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}

      <LeadDetail id={detailId} open={detailId !== null} onClose={() => setDetailId(null)} />
    </>
  )
}
