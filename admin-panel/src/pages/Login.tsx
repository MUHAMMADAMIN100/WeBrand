import { Lock, User, LogIn, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'
import { BrandLogo } from '../components/Brand'

export default function Login() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (status === 'authed') return <Navigate to={from} replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }

  return (
    // One cohesive tone per theme: a calm neutral surface family with the brand
    // blue reserved for accents only (logo, focus, primary button). No split.
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-5 py-8 dark:bg-ink-950">
      {/* The site's faint grid — the same paper the public pages sit on. */}
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <main className="relative w-full max-w-[25rem] motion-safe:animate-toast-in">
        {/* Real Webrand lockup (themed: full-colour / blue+white) */}
        <div className="mb-8 flex justify-center">
          <BrandLogo className="h-9" />
        </div>

        {/* Elevated card */}
        <div className="rounded-[1.75rem] border border-ink-200 bg-white p-7 shadow-[0_1px_2px_rgba(11,13,18,0.04),0_24px_48px_-20px_rgba(11,13,18,0.18)] dark:border-ink-800 dark:bg-ink-900 dark:shadow-[0_28px_80px_-32px_rgba(0,0,0,0.9)] sm:p-8">
          <div className="mb-7">
            <h1 className="font-display text-[1.45rem] font-black tracking-tight text-ink-950 dark:text-white">
              Вход в панель
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
              Войдите с учётной записью администратора.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Имя пользователя" required htmlFor="login-username">
              <div className="group relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-ink-500 transition-colors duration-150 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-300" />
                <Input
                  id="login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  autoFocus
                  required
                  className="pl-11"
                />
              </div>
            </Field>

            <Field label="Пароль" required htmlFor="login-password">
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-ink-500 transition-colors duration-150 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-300" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="pl-11 pr-11"
                />
                {/* type="button": a bare button inside a form submits it. */}
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  aria-pressed={showPassword}
                  title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-950 dark:hover:bg-ink-800 dark:hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
            </Field>

            {error && (
              <div
                role="alert"
                className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              icon={<LogIn className="h-4 w-4" />}
              className="h-12 w-full"
            >
              Войти
            </Button>
          </form>
        </div>

        {/* Quiet footer in the same tone */}
        <div className="mt-7 flex items-center justify-center gap-4 text-xs text-ink-600 dark:text-ink-500">
          <span>© {new Date().getFullYear()} Webrand</span>
          <span className="h-3 w-px bg-ink-300 dark:bg-ink-700" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Защищённый вход
          </span>
        </div>
      </main>
    </div>
  )
}
