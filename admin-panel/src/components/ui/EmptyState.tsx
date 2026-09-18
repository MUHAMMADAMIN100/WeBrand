import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon
  title: string
  message: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-950 text-lime dark:bg-white/10">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-base font-bold text-ink-950 dark:text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-600 dark:text-ink-400">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
