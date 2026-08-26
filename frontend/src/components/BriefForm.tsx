'use client'

import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlignLeft,
  ArrowRight,
  AtSign,
  Building2,
  Check,
  ClipboardList,
  FileText,
  Paperclip,
  Phone,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import {
  DIRECTIONS,
  PHONE_PREFIX,
  QUESTIONS,
  formatPhone,
  nationalDigits,
  validateContact,
  validateName,
  validatePhone,
  type Answers,
} from './ContactForm'
import { contacts } from '../data/content'
import { openTelegram } from '../lib/telegram'

// Same intake the quiz modal uses — no hardcoded origin.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// A ?direction= among these locks the project direction: the «Направление
// проекта» step is hidden entirely and can't be changed (the value still ships
// in the lead). No param → the user picks on the step as usual.
const LOCKABLE_DIRECTIONS = new Set(['smm', 'design', 'dev', 'ads'])

// Mirrors the backend ATTACHMENT_EXTS / 20 MB cap (apps/leads/serializers.py).
const ATTACH_EXTS = new Set([
  'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'md',
  'xls', 'xlsx', 'csv', 'ppt', 'pptx',
  'png', 'jpg', 'jpeg', 'webp', 'gif', 'heic',
  'zip', 'rar', '7z',
])
const MAX_ATTACH_MB = 20
const FILE_ACCEPT =
  '.pdf,.doc,.docx,.txt,.rtf,.odt,.md,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,.zip,.rar,.7z'

type Mode = 'free' | 'quiz'

export default function BriefForm({ initialDirection = '' }: { initialDirection?: string }) {
  // A valid ?direction= locks the direction and hides its selection step.
  const locked = LOCKABLE_DIRECTIONS.has(initialDirection)
  const lockedLabel = locked ? DIRECTIONS.find((d) => d.id === initialDirection)?.label : undefined
  const [mode, setMode] = useState<Mode>('free')
  const [selected, setSelected] = useState<string[]>(locked ? [initialDirection] : [])
  const [answers, setAnswers] = useState<Answers>({})
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState(PHONE_PREFIX)
  const [companyName, setCompanyName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  // Honeypot — bots fill it; humans never see it. Stays empty for real users.
  const [company, setCompany] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const errName = validateName(name)
  const errContact = validateContact(contact)
  const errPhone = validatePhone(phone)
  const errDir = selected.length === 0 ? 'Выберите хотя бы одно направление' : undefined
  const errDesc = mode === 'free' && !description.trim() ? 'Опишите задачу' : undefined

  // Step numbers shift up by one when the direction step is hidden (locked).
  const bodyStep = locked ? 1 : 2
  const contactsStep = locked ? 2 : 3

  const canSubmit = !errName && !errContact && !errPhone && !errDir && !errDesc && !fileError && !sending

  const toggleDir = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((s) => s !== id) : [...p, id]))

  const setAnswer = (dir: string, opt: string, multi: boolean) =>
    setAnswers((prev) => {
      const cur = prev[dir]
      if (multi) {
        const a = Array.isArray(cur) ? cur : []
        return { ...prev, [dir]: a.includes(opt) ? a.filter((o) => o !== opt) : [...a, opt] }
      }
      return { ...prev, [dir]: opt }
    })

  const onPhone = (v: string) => setPhone(PHONE_PREFIX + formatPhone(nationalDigits(v)))

  const onFile = (f: File | null) => {
    if (!f) {
      setFile(null)
      setFileError(null)
      return
    }
    const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ATTACH_EXTS.has(ext)) {
      setFile(null)
      setFileError('Недопустимый тип файла')
      return
    }
    if (f.size > MAX_ATTACH_MB * 1024 * 1024) {
      setFile(null)
      setFileError(`Файл больше ${MAX_ATTACH_MB} МБ`)
      return
    }
    setFile(f)
    setFileError(null)
  }

  // Questions to show: one per selected direction that has a question defined.
  const questionDirs = useMemo(
    () => selected.filter((id) => QUESTIONS[id]),
    [selected],
  )

  const submit = async () => {
    if (!canSubmit) {
      setTouched({ name: true, contact: true, phone: true, dir: true, desc: true })
      return
    }
    setError(false)
    setSending(true)
    try {
      // Only keep answers for still-selected directions (backend requires
      // answers keys ⊆ selected). Free mode sends no answers.
      const cleanAnswers =
        mode === 'quiz'
          ? Object.fromEntries(Object.entries(answers).filter(([k]) => selected.includes(k)))
          : {}

      const fd = new FormData()
      fd.append('kind', 'lead')
      fd.append('name', name.trim())
      fd.append('contact', contact.trim())
      fd.append('phone', phone)
      fd.append('company_name', companyName.trim()) // VISIBLE company → company_name
      fd.append('message', description.trim())
      fd.append('selected', JSON.stringify(selected)) // direction(s)
      fd.append('answers', JSON.stringify(cleanAnswers))
      if (file) fd.append('attachment', file)
      fd.append('company', company) // honeypot — empty for humans
      // No Content-Type header: the browser sets the multipart boundary.
      const res = await fetch(`${API_BASE}/api/leads/`, { method: 'POST', body: fd })
      let data: { ok?: boolean } = {}
      try {
        data = await res.json()
      } catch {
        /* non-JSON (e.g. throttle HTML) — treated as error below */
      }
      if (res.ok && data.ok) setSubmitted(true)
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-28 text-center md:px-6">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-50">
          <Sparkles className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-neutral-900">Заявка отправлена!</h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-neutral-600">
          Спасибо! Изучим задачу и свяжемся с вами в течение пары часов в рабочее время.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-shadow hover:shadow-xl hover:shadow-brand-600/30"
        >
          На главную
          <ArrowRight className="h-4 w-4" />
        </a>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36 lg:px-8">
      {/* Header */}
      <header>
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">— Обсудить проект</span>
        <h1 className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
          Обсудить проект
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">
          Расскажите о задаче — свободным текстом или по короткому брифу. Ответим в течение пары часов,
          предложим решение и сроки. Бесплатно и ни к чему не обязывает.
        </p>
        {locked && lockedLabel && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
            <Check className="h-4 w-4" />
            Направление: {lockedLabel}
          </div>
        )}
      </header>

      {/* Mode toggle */}
      <div className="mt-8 inline-flex rounded-full border border-neutral-200 bg-neutral-100 p-1.5">
        {([
          { id: 'free', label: 'Свободная форма', icon: AlignLeft },
          { id: 'quiz', label: 'Анкета (бриф)', icon: ClipboardList },
        ] as const).map((m) => {
          const active = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                active ? 'text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="brief-mode-pill"
                  className="absolute inset-0 rounded-full bg-brand-600 shadow-lg shadow-brand-600/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-2">
                <m.icon className="h-4 w-4" />
                {m.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Direction selector — hidden entirely when locked by ?direction=. */}
      {!locked && (
      <section className="mt-8">
        <SectionLabel n={1} title="Направление проекта" hint="можно выбрать несколько" error={touched.dir ? errDir : undefined} />
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {DIRECTIONS.map((d) => {
            const active = selected.includes(d.id)
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleDir(d.id)}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                  active
                    ? 'border-brand-600 bg-brand-50 shadow-sm shadow-brand-600/10'
                    : 'border-neutral-200 bg-white hover:border-brand-300 hover:shadow-sm'
                } ${d.wide ? 'sm:col-span-2' : ''}`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${active ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600'}`}>
                  <d.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-neutral-900">{d.label}</span>
                  <span className="block text-xs text-neutral-500">{d.sub}</span>
                </span>
                {active && <Check className="h-4 w-4 shrink-0 text-brand-600" />}
              </button>
            )
          })}
        </div>
      </section>
      )}

      {/* Mode body */}
      {mode === 'free' ? (
        <section className="mt-8">
          <SectionLabel n={bodyStep} title="Описание проекта" error={touched.desc ? errDesc : undefined} />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, desc: true }))}
            rows={6}
            maxLength={2000}
            placeholder="Что нужно сделать, какие цели, сроки, бюджет, примеры — всё, что важно. Чем подробнее, тем точнее предложим решение."
            className={`mt-4 w-full resize-y rounded-2xl border bg-white px-4 py-3 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
              touched.desc && errDesc ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : 'border-neutral-300 focus:border-brand-500'
            }`}
          />
        </section>
      ) : (
        <section className="mt-8">
          <SectionLabel n={bodyStep} title="Бриф" hint="ответьте на пару вопросов" />
          {questionDirs.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-6 text-sm text-neutral-500">
              Выберите направление выше — появятся вопросы. Для «Не знаю — помогите» вопросов нет, просто оставьте контакты.
            </p>
          ) : (
            <div className="mt-4 space-y-6">
              {questionDirs.map((dir) => {
                const q = QUESTIONS[dir]
                const value = answers[dir]
                const dirLabel = DIRECTIONS.find((d) => d.id === dir)?.label ?? dir
                return (
                  <div key={dir} className="rounded-2xl border border-neutral-200 bg-white p-5">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-600">{dirLabel}</div>
                    <div className="text-base font-semibold text-neutral-900">{q.q}</div>
                    <div className="mt-1 text-xs text-neutral-500">{q.multi ? 'Можно выбрать несколько' : 'Выберите один вариант'}</div>
                    <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                      {q.options.map((opt) => {
                        const Ico = opt.icon
                        const isActive = q.multi
                          ? Array.isArray(value) && value.includes(opt.l)
                          : value === opt.l
                        return (
                          <button
                            key={opt.l}
                            type="button"
                            onClick={() => setAnswer(dir, opt.l, q.multi)}
                            className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all ${
                              isActive ? 'border-brand-600 bg-brand-50' : 'border-neutral-200 bg-white hover:border-brand-300'
                            }`}
                          >
                            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600'}`}>
                              <Ico className="h-4 w-4" />
                            </span>
                            <span className="flex-1 font-medium text-neutral-800">{opt.l}</span>
                            <span className={`grid h-5 w-5 shrink-0 place-items-center border ${q.multi ? 'rounded-md' : 'rounded-full'} ${isActive ? 'border-brand-600 bg-brand-600 text-white' : 'border-neutral-300'}`}>
                              {isActive && <Check className="h-3 w-3" strokeWidth={3} />}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Optional free-text comment in brief mode */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Комментарий или детали (необязательно)"
            className="mt-4 w-full resize-y rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </section>
      )}

      {/* Contacts */}
      <section className="mt-8">
        <SectionLabel n={contactsStep} title="Контакты" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            icon={User}
            label="Имя"
            required
            value={name}
            onChange={setName}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            error={touched.name ? errName : undefined}
            placeholder="Как к вам обращаться"
            maxLength={50}
            className="sm:col-span-2"
          />
          <Field
            icon={AtSign}
            label="Telegram или email"
            required
            value={contact}
            onChange={setContact}
            onBlur={() => setTouched((t) => ({ ...t, contact: true }))}
            error={touched.contact ? errContact : undefined}
            placeholder="@username или email"
            maxLength={60}
          />
          <Field
            icon={Phone}
            label="Телефон"
            required
            value={phone}
            onChange={onPhone}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            error={touched.phone ? errPhone : undefined}
            placeholder="+992 ..."
            inputMode="tel"
            maxLength={17}
          />
          <Field
            icon={Building2}
            label="Компания"
            value={companyName}
            onChange={setCompanyName}
            placeholder="Название (необязательно)"
            maxLength={120}
            className="sm:col-span-2"
          />
        </div>

        {/* File upload → attachment */}
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Прикрепить файлы (ТЗ/материалы)
            <span className="ml-2 font-normal text-neutral-400">необязательно</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept={FILE_ACCEPT}
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50/50 px-4 py-3">
              <FileText className="h-5 w-5 shrink-0 text-brand-600" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-800">{file.name}</span>
              <button
                type="button"
                onClick={() => onFile(null)}
                aria-label="Убрать файл"
                className="text-neutral-400 transition-colors hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-3 text-left transition-colors hover:border-brand-400 hover:bg-brand-50/30"
            >
              <Paperclip className="h-5 w-5 shrink-0 text-neutral-400" />
              <span className="text-sm text-neutral-500">Выбрать файл — ТЗ, бриф, презентация, скриншоты…</span>
            </button>
          )}
          <p className={`mt-1.5 text-xs ${fileError ? 'text-red-600' : 'text-neutral-400'}`}>
            {fileError ?? `PDF / DOC / XLS / изображения / архив · до ${MAX_ATTACH_MB} МБ`}
          </p>
        </div>
      </section>

      {/* Honeypot — visually hidden, off the tab order. Bots fill it; humans don't.
          The visible «Компания» field above maps to company_name, NOT this. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="pointer-events-none absolute left-[-9999px] h-px w-px opacity-0"
      />

      {/* Error + submit */}
      {error && (
        <p className="mt-6 text-sm leading-relaxed text-red-600">
          Не получилось отправить. Попробуйте ещё раз или напишите нам в{' '}
          <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" onClick={openTelegram} className="font-semibold text-brand-600 hover:underline">
            Telegram
          </a>
          .
        </p>
      )}

      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 disabled:cursor-not-allowed disabled:bg-brand-300 disabled:shadow-none"
        >
          {sending ? 'Отправляем…' : 'Отправить заявку'}
          <Send className="h-4 w-4" />
        </button>
        <p className="text-xs text-neutral-400">
          Нажимая «Отправить», вы соглашаетесь, что мы свяжемся с вами по указанным контактам.
        </p>
      </div>
    </main>
  )
}

function SectionLabel({ n, title, hint, error }: { n: number; title: string; hint?: string; error?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
        {n}
      </span>
      <span className="text-lg font-bold text-neutral-900">{title}</span>
      {hint && !error && <span className="text-xs text-neutral-400">{hint}</span>}
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  required,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  maxLength,
  inputMode,
  className = '',
}: {
  icon: typeof User
  label: string
  required?: boolean
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  error?: string
  placeholder?: string
  maxLength?: number
  inputMode?: 'text' | 'tel' | 'email' | 'numeric'
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
        {label}
        {required && <span className="ml-0.5 text-brand-600">*</span>}
      </label>
      <div className="relative">
        <Icon className={`pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 ${error ? 'text-red-400' : 'text-neutral-400'}`} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          inputMode={inputMode}
          aria-invalid={!!error}
          className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-[15px] text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
              : 'border-neutral-300 focus:border-brand-500 focus:ring-brand-500/30'
          }`}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}
