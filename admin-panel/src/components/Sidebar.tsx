import { Briefcase, FolderKanban, Inbox, Newspaper, LogOut, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BrandLogo } from './Brand'

const NAV: { to: string; label: string; Icon: LucideIcon }[] = [
  { to: '/vacancies', label: 'Вакансии', Icon: Briefcase },
  { to: '/projects', label: 'Проекты', Icon: FolderKanban },
  { to: '/news', label: 'Новости', Icon: Newspaper },
  { to: '/leads', label: 'Заявки', Icon: Inbox },
]

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
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-[18px] w-[18px] ${isActive ? 'text-brand-600 dark:text-brand-300' : 'text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300'}`}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
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
