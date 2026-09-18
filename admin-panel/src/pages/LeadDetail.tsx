import { AtSign, Briefcase, Cake, CalendarClock, Check, Copy, Download, Tag, Trash2, Phone } from 'lucide-react'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { Drawer } from '../components/ui/Drawer'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { LEAD_DIRECTION_LABEL } from '../lib/options'
import type { Lead } from '../lib/types'
import { getLead } from '../api/resources'

const fmtDateFull = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '—'

type Icon = ComponentType<{ className?: string }>

/** Copy-to-clipboard button with a brief check confirmation. */
function CopyButton({ value }: { value: string }) {
  const [done, setDone] = useState(false)
  const tRef = useRef(0)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setDone(true)
      window.clearTimeout(tRef.current)
      tRef.current = window.setTimeout(() => setDone(false), 1300)
    } catch {
      /* clipboard blocked — no-op */
    }
  }
  useEffect(() => () => window.clearTimeout(tRef.current), [])
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Скопировать: ${value}`}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-500 transition-colors hover:bg-ink-950 hover:text-white dark:text-ink-400 dark:hover:bg-white dark:hover:text-ink-950"
    >
      {done ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-xs font-semibold text-ink-600 dark:text-ink-400">{title}</h3>
      {children}
    </section>
  )
}

/** Contact/phone row — value is easy to read and one tap to copy. */
function CopyField({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 px-3.5 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">{label}</div>
        <div className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">{value}</div>
      </div>
      <CopyButton value={value} />
    </div>
  )
}

function InfoCard({ icon: Icon, label, value, wide }: { icon: Icon; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-neutral-200 dark:border-neutral-800 px-3.5 py-2.5 ${wide ? 'col-span-2' : ''}`}>
      <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{value}</div>
    </div>
  )
}

/** Detail drawer for a single lead, loaded by id (admin-only retrieve). */
export function LeadDetail({
  id,
  open,
  onClose,
  onRequestDelete,
}: {
  id: number | null
  open: boolean
  onClose: () => void
  onRequestDelete?: (lead: Lead) => void
}) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!open || id == null) return
    let alive = true
    setStatus('loading')
    setLead(null)
    getLead(id)
      .then((l) => alive && (setLead(l), setStatus('ready')))
      .catch(() => alive && setStatus('error'))
    return () => {
      alive = false
    }
  }, [open, id])

  const isApp = lead?.kind === 'application'
  const directions = (lead?.selected ?? []).map((s) => LEAD_DIRECTION_LABEL[s] ?? s)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={lead?.name ?? 'Заявка'}
      subtitle={lead ? (isApp ? 'Отклик на вакансию' : 'Заявка с формы') : 'Загрузка…'}
      footer={
        lead && onRequestDelete ? (
          <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => onRequestDelete(lead)}>
            Удалить заявку
          </Button>
        ) : undefined
      }
    >
      {status === 'loading' ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      ) : status === 'error' || !lead ? (
        <p className="text-sm text-red-600 dark:text-red-400">Не удалось загрузить заявку.</p>
      ) : (
        <div className="space-y-6">
          {/* Hero: avatar + name + type */}
          <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-brand-50/80 to-white dark:from-brand-500/10 dark:to-neutral-900 p-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-600 text-lg font-extrabold text-white shadow-sm">
              {initials(lead.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-bold text-neutral-900 dark:text-neutral-100">{lead.name}</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {isApp ? <Badge tone="violet">Отклик</Badge> : <Badge tone="brand">Заявка</Badge>}
                {isApp && lead.role && (
                  <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {lead.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Section title="Контакты">
            <div className="space-y-2">
              <CopyField icon={AtSign} label="Telegram / email" value={lead.contact || '—'} />
              <CopyField icon={Phone} label="Телефон" value={lead.phone || '—'} />
            </div>
          </Section>

          <Section title="Детали">
            <div className="grid grid-cols-2 gap-2">
              {isApp && <InfoCard icon={Briefcase} label="Опыт" value={lead.experience || '—'} />}
              {isApp && <InfoCard icon={Cake} label="Возраст" value={lead.age != null ? String(lead.age) : '—'} />}
              <InfoCard icon={Tag} label="Направления" value={directions.length ? directions.join(', ') : '—'} wide={!isApp || directions.length > 0} />
            </div>
          </Section>

          {lead.message && (
            <Section title="Сообщение">
              <div className="whitespace-pre-wrap break-words rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 px-4 py-3 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
                {lead.message}
              </div>
            </Section>
          )}

          {isApp && (
            <Section title="Резюме">
              {lead.resume ? (
                <a
                  href={lead.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
                >
                  <Download className="h-4 w-4" />
                  Скачать резюме (PDF)
                </a>
              ) : (
                <p className="text-sm text-neutral-400 dark:text-neutral-500">Резюме не приложено.</p>
              )}
            </Section>
          )}

          <Section title="Отправлено">
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
              <CalendarClock className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              {fmtDateFull(lead.created_at)}
            </div>
          </Section>
        </div>
      )}
    </Drawer>
  )
}
