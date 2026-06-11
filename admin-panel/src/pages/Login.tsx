import { Lock, User, LogIn, ShieldCheck } from 'lucide-react'
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
  const from = (location.state as { from?: string })?.from || '/vacancies'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-100 to-neutral-200/70 px-5 py-8 dark:from-neutral-950 dark:to-neutral-950">
      {/* Depth layers — same tonal family, barely-there brand tint (dark only) */}
      <div className="pointer-events-none absolute left-1/2 top-[-20%] hidden h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand-600/[0.07] blur-[140px] dark:block" />
      <div className="pointer-events-none absolute bottom-[-30%] left-1/2 hidden h-[30rem] w-[50rem] -translate-x-1/2 rounded-full bg-brand-900/[0.12] blur-[120px] dark:block" />
      {/* Light theme: a whisper of warm white light behind the card */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[26rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 blur-[100px] dark:hidden" />

      <main className="relative w-full max-w-[25rem] motion-safe:animate-toast-in">
        {/* Real Webrand lockup (themed: full-colour / blue+white) */}
        <div className="mb-8 flex justify-center">
          <BrandLogo className="h-9" />
        </div>

        {/* Elevated card */}
        <div className="rounded-3xl border border-neutral-200/90 bg-white p-7 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_48px_-20px_rgba(16,24,40,0.16)] dark:border-white/[0.07] dark:bg-neutral-900 dark:shadow-[0_28px_80px_-32px_rgba(0,0,0,0.9)] dark:ring-1 dark:ring-white/[0.03] sm:p-8">
          <div className="mb-7">
            <h1 className="text-[1.45rem] font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Вход в панель
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Войдите с учётной записью администратора.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Имя пользователя" required>
              <div className="group relative rounded-xl transition-shadow duration-200 focus-within:shadow-[0_0_0_4px_rgba(43,94,211,0.10)] dark:focus-within:shadow-[0_0_0_4px_rgba(64,111,219,0.16)]">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-400 transition-colors duration-150 group-focus-within:text-brand-500 dark:text-neutral-500 dark:group-focus-within:text-brand-400" />
                <Input
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

            <Field label="Пароль" required>
              <div className="group relative rounded-xl transition-shadow duration-200 focus-within:shadow-[0_0_0_4px_rgba(43,94,211,0.10)] dark:focus-within:shadow-[0_0_0_4px_rgba(64,111,219,0.16)]">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-400 transition-colors duration-150 group-focus-within:text-brand-500 dark:text-neutral-500 dark:group-focus-within:text-brand-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="pl-11"
                />
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
              className="w-full !transition-all duration-200 shadow-lg shadow-brand-600/20 hover:shadow-xl hover:shadow-brand-600/30 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0"
            >
              Войти
            </Button>
          </form>
        </div>

        {/* Quiet footer in the same tone */}
        <div className="mt-7 flex items-center justify-center gap-4 text-xs text-neutral-400 dark:text-neutral-600">
          <span>© {new Date().getFullYear()} Webrand</span>
          <span className="h-3 w-px bg-neutral-300 dark:bg-neutral-800" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Защищённый вход
          </span>
        </div>
      </main>
    </div>
  )
}
