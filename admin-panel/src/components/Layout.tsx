import { Menu, Moon, Sun, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/cn'
import { Sidebar } from './Sidebar'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
      title={dark ? 'Светлая тема' : 'Тёмная тема'}
      className="grid h-10 w-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-950 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white"
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  )
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const { username } = useAuth()
  const initial = (username || 'A').charAt(0).toUpperCase()
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-paper/85 px-4 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/85 lg:px-8">
      <button
        onClick={onMenu}
        className="grid h-10 w-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 lg:hidden"
        aria-label="Меню"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2.5">
        <ThemeToggle />
        <div className="hidden text-right leading-tight sm:block">
          <div className="text-sm font-semibold text-ink-950 dark:text-ink-100">{username || 'Администратор'}</div>
          <div className="text-[11px] text-ink-600 dark:text-ink-400">Администратор</div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-ink-950 font-display text-sm font-bold text-lime dark:bg-lime dark:text-ink-950">
          {initial}
        </div>
      </div>
    </header>
  )
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-paper dark:bg-ink-950">
      {/* Desktop / tablet sidebar (>= lg) */}
      <div className="hidden lg:block">
        <div className="fixed inset-y-0 left-0">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar (< lg) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink-950/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 animate-slide-in [animation-name:none]">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute left-[17rem] top-3 grid h-11 w-11 place-items-center rounded-full bg-white text-ink-950 shadow dark:bg-ink-800 dark:text-white"
            aria-label="Закрыть меню"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Topbar onMenu={() => setMobileOpen(true)} />
        {/* overflow-x-clip is a backstop: the page can never scroll sideways
            (so the title/filters are never cut off). `clip` keeps the Y axis
            visible, so dropdowns/modals are unaffected. min-w-0 lets the flex
            column shrink instead of being stretched by wide content. */}
        <main className="min-w-0 flex-1 overflow-x-clip px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    // Stack on mobile (title, then full-width action); side-by-side from sm up.
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-black tracking-tight text-ink-950 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-600 dark:text-ink-400">{subtitle}</p>}
      </div>
      {action && <div className="w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">{action}</div>}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[1.25rem] border border-ink-200 bg-white shadow-card dark:border-ink-800 dark:bg-ink-900',
        className,
      )}
    >
      {children}
    </div>
  )
}
