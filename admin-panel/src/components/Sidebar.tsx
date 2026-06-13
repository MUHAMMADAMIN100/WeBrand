import {
  Briefcase,
  ChevronDown,
  FolderKanban,
  Inbox,
  Newspaper,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BrandLogo } from './Brand'

type Child = { to: string; label: string; end?: boolean }
type Item =
  | { kind: 'link'; to: string; label: string; Icon: LucideIcon }
  | { kind: 'group'; base: string; label: string; Icon: LucideIcon; children: Child[] }

const NAV: Item[] = [
  {
    kind: 'group',
    base: '/vacancies',
    label: 'Вакансии',
    Icon: Briefcase,
    children: [
      { to: '/vacancies', label: 'Все вакансии', end: true },
      { to: '/vacancies/applications', label: 'Заявки' },
    ],
  },
  { kind: 'link', to: '/projects', label: 'Проекты', Icon: FolderKanban },
  { kind: 'link', to: '/news', label: 'Новости', Icon: Newspaper },
  { kind: 'link', to: '/leads', label: 'Заявки', Icon: Inbox },
]

const linkClass = (isActive: boolean) =>
  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
    isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
  }`

const iconClass = (isActive: boolean) =>
  `h-[18px] w-[18px] ${
    isActive
      ? 'text-brand-600 dark:text-brand-300'
      : 'text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300'
  }`

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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`${linkClass(sectionActive)} w-full`}
      >
        <item.Icon className={iconClass(sectionActive)} />
        {item.label}
        <ChevronDown
          className={`ml-auto h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 dark:text-neutral-500 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="mt-1 space-y-1 pl-4">
          {item.children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              end={c.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg py-2 pl-4 pr-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                      isActive ? 'bg-brand-500' : 'bg-neutral-300 dark:bg-neutral-600'
                    }`}
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
    <aside className="flex h-full w-64 flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      {/* Brand — the real Webrand lockup (themed), wordmark included */}
      <div className="px-5 py-5">
        <BrandLogo className="h-7" />
        <div className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Админ-панель
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) =>
          item.kind === 'group' ? (
            <NavGroup key={item.base} item={item} onNavigate={onNavigate} />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) => linkClass(isActive)}
            >
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
      <div className="border-t border-neutral-200 dark:border-neutral-800 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-600 dark:text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-400"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Выход
        </button>
      </div>
    </aside>
  )
}
