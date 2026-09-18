import {
  Briefcase,
  ChevronDown,
  Clapperboard,
  FolderKanban,
  Handshake,
  Inbox,
  LayoutDashboard,
  Newspaper,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/cn'
import { BrandLogo } from './Brand'

type Child = { to: string; label: string; end?: boolean }
type Item =
  | { kind: 'link'; to: string; label: string; Icon: LucideIcon; end?: boolean }
  | { kind: 'group'; base: string; label: string; Icon: LucideIcon; children: Child[] }

const NAV: Item[] = [
  { kind: 'link', to: '/', label: 'Обзор', Icon: LayoutDashboard, end: true },
  {
    kind: 'group',
    base: '/vacancies',
    label: 'Вакансии',
    Icon: Briefcase,
    children: [
      { to: '/vacancies', label: 'Все вакансии', end: true },
      { to: '/vacancies/applications', label: 'Отклики' },
    ],
  },
  { kind: 'link', to: '/projects', label: 'Проекты', Icon: FolderKanban },
  { kind: 'link', to: '/reels', label: 'Рилсы', Icon: Clapperboard },
  { kind: 'link', to: '/partners', label: 'Партнёры', Icon: Handshake },
  { kind: 'link', to: '/news', label: 'Новости', Icon: Newspaper },
  { kind: 'link', to: '/leads', label: 'Заявки', Icon: Inbox },
]

// The active item is an ink pill (lime on ink in the dark theme) — the same
// marker the public site's navigation uses.
const linkClass = (isActive: boolean) =>
  cn(
    'group flex h-11 items-center gap-3 rounded-full px-3.5 text-sm font-semibold transition-colors duration-200',
    isActive
      ? 'bg-ink-950 text-white dark:bg-lime dark:text-ink-950'
      : 'text-ink-600 hover:bg-ink-100 hover:text-ink-950 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white',
  )

const iconClass = (isActive: boolean) =>
  cn(
    'h-[18px] w-[18px] shrink-0',
    isActive ? 'text-lime dark:text-ink-950' : 'text-ink-500 group-hover:text-ink-950 dark:text-ink-500 dark:group-hover:text-white',
  )

function NavGroup({ item, onNavigate }: { item: Extract<Item, { kind: 'group' }>; onNavigate?: () => void }) {
  const { pathname } = useLocation()
  const sectionActive = pathname === item.base || pathname.startsWith(item.base + '/')
  const [open, setOpen] = useState(sectionActive)

  // Always reveal the group when navigating into its section so the active
  // sub-page stays visible.
  useEffect(() => {
    if (sectionActive) setOpen(true)
  }, [sectionActive])

  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={cn(linkClass(sectionActive), 'w-full')}>
        <item.Icon className={iconClass(sectionActive)} />
        {item.label}
        <ChevronDown
          className={cn(
            'ml-auto h-4 w-4 shrink-0 transition-transform duration-200',
            sectionActive ? 'text-white/70 dark:text-ink-950/70' : 'text-ink-400',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="mt-1 space-y-0.5 pl-4">
          {item.children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              end={c.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex h-10 items-center gap-2.5 rounded-full py-2 pl-4 pr-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-ink-950 dark:text-white'
                    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-950 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                      isActive ? 'bg-lime-deep dark:bg-lime' : 'bg-ink-300 dark:bg-ink-600',
                    )}
                  />
                  {c.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAuth()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
      {/* Brand — the real Webrand lockup (themed), wordmark included */}
      <div className="px-5 pb-4 pt-5">
        <BrandLogo className="h-7" />
        <div className="mt-2 text-xs font-medium text-ink-600 dark:text-ink-400">Панель управления</div>
      </div>

      {/* Nav */}
      <nav className="scroll-thin flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Разделы">
        {NAV.map((item) =>
          item.kind === 'group' ? (
            <NavGroup key={item.base} item={item} onNavigate={onNavigate} />
          ) : (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => linkClass(isActive)}>
              {({ isActive }) => (
                <>
                  <item.Icon className={iconClass(isActive)} />
                  {item.label}
                </>
              )}
            </NavLink>
          ),
        )}
      </nav>

      {/* Logout */}
      <div className="border-t border-ink-200 p-3 dark:border-ink-800">
        <button
          onClick={logout}
          className="flex h-11 w-full items-center gap-3 rounded-full px-3.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-ink-300 dark:hover:bg-red-500/15 dark:hover:text-red-300"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Выход
        </button>
      </div>
    </aside>
  )
}
