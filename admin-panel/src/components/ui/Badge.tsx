import type { ReactNode } from 'react'

type Tone = 'green' | 'neutral' | 'brand' | 'violet' | 'amber' | 'lime'

const TONES: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/25',
  neutral: 'bg-ink-100 text-ink-600 ring-ink-500/20 dark:bg-ink-800 dark:text-ink-300 dark:ring-ink-400/20',
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-400/25',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-400/25',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/25',
  // The site's accent: "live", "on", "chosen".
  lime: 'bg-lime-soft text-ink-950 ring-lime-deep/40 dark:bg-lime/15 dark:text-lime dark:ring-lime/30',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}

export function PublishBadge({ published }: { published: boolean }) {
  return (
    <Badge tone={published ? 'lime' : 'neutral'}>
      <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-lime-deep dark:bg-lime' : 'bg-ink-400 dark:bg-ink-500'}`} />
      {published ? 'Опубликовано' : 'Черновик'}
    </Badge>
  )
}
