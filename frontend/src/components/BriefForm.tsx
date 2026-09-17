'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlignLeft,
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Building2,
  Check,
  ClipboardList,
  FileText,
  Mail,
  Paperclip,
  Phone,
  Send,
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
import { scrollToElement } from '../lib/scroll'
import { openTelegram } from '../lib/telegram'
import { cn } from '../lib/utils'

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

// One look for every text control of the page.
const CONTROL =
  'w-full border bg-white text-base text-ink-950 placeholder:text-ink-500 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4'
const CONTROL_OK = 'border-ink-200 hover:border-ink-300 focus:border-brand-600 focus:ring-brand-600/15'
const CONTROL_BAD = 'border-red-500 focus:border-red-600 focus:ring-red-500/15'

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
  // Bumped by a submit that validation stopped: the effect below then walks the
  // person to the first thing that needs fixing.
  const [attempt, setAttempt] = useState(0)
  const rootRef = useRef<HTMLElement>(null)

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

  // Arrow keys inside a single-choice question: move to the neighbour and choose
  // it, as a native radio group does.
  const onRadioKey = (e: React.KeyboardEvent<HTMLDivElement>, dir: string, labels: string[]) => {
    const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    const radios = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')]
    const at = radios.indexOf(document.activeElement as HTMLElement)
    if (at < 0) return
    e.preventDefault()
    const next = (at + step + radios.length) % radios.length
    setAnswer(dir, labels[next], false)
    radios[next].focus()
  }

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

  // After a stopped submit: bring the first invalid control into view and focus it.
  useEffect(() => {
    if (!attempt) return
    const el = rootRef.current?.querySelector<HTMLElement>('[data-invalid="true"]')
    if (!el) return
    scrollToElement(el.closest<HTMLElement>('.anchor-target') ?? el)
    el.focus({ preventScroll: true })
  }, [attempt])

  const submit = async () => {
    if (!canSubmit) {
      setTouched({ name: true, contact: true, phone: true, dir: true, desc: true })
      setAttempt((n) => n + 1)
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
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-5 py-28 lg:px-10">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-lime text-ink-950">
          <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <h1 className="mt-8 font-display text-display-lg font-black text-ink-950">Заявка отправлена!</h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-600 lg:text-lg">
          Спасибо! Изучим задачу и свяжемся с вами в течение пары часов в рабочее время.
        </p>
        <a
          href="/"
          className="group mt-9 inline-flex h-14 items-center gap-2.5 rounded-full bg-ink-950 px-8 text-base font-semibold text-white transition-colors duration-300 ease-expo hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          На главную
          <ArrowRight className="h-5 w-5 transition-transform duration-300 ease-expo group-hover:translate-x-1" aria-hidden="true" />
        </a>
      </main>
    )
  }

  const dirInvalid = Boolean(touched.dir && errDir)
  const descInvalid = Boolean(touched.desc && errDesc)

  return (
    <main ref={rootRef} className="mx-auto max-w-[88rem] px-5 pb-20 pt-28 md:pb-28 md:pt-36 lg:px-10">
      {/* Header */}
      <header>
        <h1 className="font-display text-display-xl font-black text-ink-950">Обсудить проект</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-600 lg:text-lg">
          Расскажите о задаче — свободным текстом или по короткому брифу. Ответим в течение пары часов,
          предложим решение и сроки. Бесплатно и ни к чему не обязывает.
        </p>
        {locked && lockedLabel && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink-950">
            <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            Направление: {lockedLabel}
          </p>
        )}
      </header>

      <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="min-w-0 max-w-3xl">
          {/* Mode toggle */}
          <div className="flex rounded-full bg-paper-2 p-1.5 sm:inline-flex">
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
                  aria-pressed={active}
                  className={cn(
                    'relative inline-flex h-11 flex-1 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2 sm:flex-none sm:px-6',
                    active ? 'text-white' : 'text-ink-600 hover:text-ink-950',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="brief-mode-pill"
                      className="absolute inset-0 rounded-full bg-ink-950"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
                    <m.icon className="hidden h-4 w-4 min-[400px]:block" aria-hidden="true" />
                    {m.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Direction selector — hidden entirely when locked by ?direction=. */}
          {!locked && (
            <section className="anchor-target mt-10">
              <SectionLabel
                id="brief-dir-title"
                n={1}
                title="Направление проекта"
                hint="можно выбрать несколько"
                error={dirInvalid ? errDir : undefined}
              />
              <div
                role="group"
                aria-labelledby="brief-dir-title"
                tabIndex={-1}
                data-invalid={dirInvalid}
                className="mt-5 grid gap-2.5 rounded-2xl focus:outline-none sm:grid-cols-2"
              >
                {DIRECTIONS.map((d) => {
                  const active = selected.includes(d.id)
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDir(d.id)}
                      aria-pressed={active}
                      className={cn(
                        CHOICE,
                        'min-h-[4.25rem] p-3.5',
                        active ? CHOICE_ON : dirInvalid ? 'border-red-500 bg-white' : CHOICE_OFF,
                        d.wide && 'sm:col-span-2',
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors duration-200',
                          active ? 'bg-white/15 text-white' : 'bg-paper text-brand-600',
                        )}
                      >
                        <d.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold">{d.label}</span>
                        <span className={cn('block text-sm', active ? 'text-white/80' : 'text-ink-600')}>{d.sub}</span>
                      </span>
                      <Mark on={active} shape="check" />
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* Mode body */}
          {mode === 'free' ? (
            <section className="anchor-target mt-10">
              <SectionLabel
                id="brief-desc-title"
                n={bodyStep}
                title="Описание проекта"
                error={descInvalid ? errDesc : undefined}
                errorId="brief-desc-error"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, desc: true }))}
                rows={6}
                maxLength={2000}
                aria-labelledby="brief-desc-title"
                aria-invalid={descInvalid}
                aria-describedby={descInvalid ? 'brief-desc-error' : undefined}
                data-invalid={descInvalid}
                placeholder="Что нужно сделать, какие цели, сроки, бюджет, примеры — всё, что важно. Чем подробнее, тем точнее предложим решение."
                className={cn(CONTROL, 'mt-5 resize-y rounded-2xl px-4 py-3.5 leading-relaxed', descInvalid ? CONTROL_BAD : CONTROL_OK)}
              />
            </section>
          ) : (
            <section className="mt-10">
              <SectionLabel n={bodyStep} title="Бриф" hint="ответьте на пару вопросов" />
              {questionDirs.length === 0 ? (
                <p className="mt-5 rounded-2xl border border-dashed border-ink-300 px-5 py-6 text-sm leading-relaxed text-ink-600">
                  Выберите направление выше — появятся вопросы. Для «Не знаю — помогите» вопросов нет, просто оставьте контакты.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {questionDirs.map((dir) => {
                    const q = QUESTIONS[dir]
                    const value = answers[dir]
                    const dirLabel = DIRECTIONS.find((d) => d.id === dir)?.label ?? dir
                    return (
                      <div key={dir} role="group" aria-labelledby={`brief-q-${dir}`} className="rounded-[1.75rem] border border-ink-200 bg-white p-5 sm:p-6">
                        <p className="text-sm font-semibold text-brand-600">{dirLabel}</p>
                        <h3 id={`brief-q-${dir}`} className="mt-1 font-display text-lg font-bold tracking-tight text-ink-950">
                          {q.q}
                        </h3>
                        <p className="mt-1 text-sm text-ink-600">{q.multi ? 'Можно выбрать несколько' : 'Выберите один вариант'}</p>
                        <div
                          role={q.multi ? undefined : 'radiogroup'}
                          aria-labelledby={q.multi ? undefined : `brief-q-${dir}`}
                          onKeyDown={q.multi ? undefined : (e) => onRadioKey(e, dir, q.options.map((o) => o.l))}
                          className="mt-4 grid gap-2.5 sm:grid-cols-2"
                        >
                          {q.options.map((opt, i) => {
                            const Ico = opt.icon
                            const isActive = q.multi
                              ? Array.isArray(value) && value.includes(opt.l)
                              : value === opt.l
                            // One stop in the tab order per radio group: the chosen
                            // option, or the first while nothing is chosen.
                            const tabStop = isActive || (!value && i === 0)
                            return (
                              <button
                                key={opt.l}
                                type="button"
                                onClick={() => setAnswer(dir, opt.l, q.multi)}
                                {...(q.multi
                                  ? { 'aria-pressed': isActive }
                                  : { role: 'radio', 'aria-checked': isActive, tabIndex: tabStop ? 0 : -1 })}
                                className={cn(CHOICE, 'min-h-[3.5rem] p-2.5 pr-3.5 text-[15px]', isActive ? CHOICE_ON : CHOICE_OFF)}
                              >
                                <span
                                  className={cn(
                                    'grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors duration-200',
                                    isActive ? 'bg-white/15 text-white' : 'bg-paper text-brand-600',
                                  )}
                                >
                                  <Ico className="h-[18px] w-[18px]" aria-hidden="true" />
                                </span>
                                <span className="flex-1 font-medium">{opt.l}</span>
                                <Mark on={isActive} shape={q.multi ? 'check' : 'radio'} />
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
                aria-label="Комментарий или детали"
                placeholder="Комментарий или детали (необязательно)"
                className={cn(CONTROL, CONTROL_OK, 'mt-4 resize-y rounded-2xl px-4 py-3.5 leading-relaxed')}
              />
            </section>
          )}

          {/* Contacts */}
          <section className="mt-10">
            <SectionLabel n={contactsStep} title="Контакты" />
            <div className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2">
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
                autoComplete="name"
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
                autoComplete="tel"
              />
              <Field
                icon={Building2}
                label="Компания"
                value={companyName}
                onChange={setCompanyName}
                placeholder="Название (необязательно)"
                maxLength={120}
                autoComplete="organization"
                className="sm:col-span-2"
              />
            </div>

            {/* File upload → attachment */}
            <div className="anchor-target mt-5">
              <p id="brief-file-label" className="mb-2 block text-sm font-semibold text-ink-950">
                Прикрепить файлы (ТЗ/материалы)
                <span className="ml-2 font-normal text-ink-600">необязательно</span>
              </p>
              <input
                ref={fileRef}
                type="file"
                accept={FILE_ACCEPT}
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-ink-950 bg-white py-1.5 pl-4 pr-1.5">
                  <FileText className="h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink-950">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => onFile(null)}
                    aria-label="Убрать файл"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-600 transition-colors duration-200 hover:bg-paper hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-describedby="brief-file-label brief-file-hint"
                  data-invalid={Boolean(fileError)}
                  className={cn(
                    'flex min-h-14 w-full items-center gap-3 rounded-2xl border border-dashed bg-white px-4 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/15',
                    fileError ? 'border-red-500' : 'border-ink-300 hover:border-ink-950 focus-visible:border-brand-600',
                  )}
                >
                  <Paperclip className="h-5 w-5 shrink-0 text-ink-500" aria-hidden="true" />
                  <span className="text-[15px] text-ink-600">Выбрать файл — ТЗ, бриф, презентация, скриншоты…</span>
                </button>
              )}
              <p
                id="brief-file-hint"
                role={fileError ? 'alert' : undefined}
                className={cn('mt-2 text-sm', fileError ? 'font-medium text-red-700' : 'text-ink-600')}
              >
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
            <p role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] leading-relaxed text-red-800">
              Не получилось отправить. Попробуйте ещё раз или напишите нам в{' '}
              <a
                href={contacts.telegram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={openTelegram}
                className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800"
              >
                Telegram
              </a>
              .
            </p>
          )}

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {/* Never disabled for being incomplete: a press then shows what is
                missing and goes there. A dead grey button explains nothing. */}
            <button
              type="button"
              onClick={submit}
              disabled={sending}
              className="group inline-flex h-14 w-full shrink-0 items-center justify-center gap-2.5 rounded-full bg-ink-950 px-8 text-base font-semibold text-white transition-colors duration-300 ease-expo hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-wait disabled:opacity-60 sm:w-auto"
            >
              {sending ? 'Отправляем…' : 'Отправить заявку'}
              <Send className="h-[18px] w-[18px] transition-transform duration-300 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
            <p className="text-sm leading-relaxed text-ink-600">
              Нажимая «Отправить», вы соглашаетесь, что мы свяжемся с вами по указанным контактам.
            </p>
          </div>
        </div>

        {/* The other way in: write or call directly. */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-ink-950 p-7 text-white sm:p-8">
            <div className="bg-grid-dark pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold leading-tight tracking-tight">Или напишите напрямую</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70">Отвечаем за пару часов в рабочее время.</p>
            <ul className="mt-6 space-y-2">
              <DirectLink href={contacts.telegram} icon={Send} label="Telegram" external onClick={openTelegram} />
              <DirectLink href={`tel:${contacts.phoneRaw}`} icon={Phone} label={contacts.phone} />
              <DirectLink href={`mailto:${contacts.email}`} icon={Mail} label={contacts.email} />
            </ul>
          </div>
        </aside>
      </div>
    </main>
  )
}

// A selectable card: a project direction or a brief answer.
const CHOICE =
  'group flex w-full items-center gap-3 rounded-2xl border text-left transition-[background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/25'
const CHOICE_OFF = 'border-ink-200 bg-white text-ink-950 hover:border-ink-950'
const CHOICE_ON = 'border-brand-600 bg-brand-600 text-white'

/** The tick of a selectable card: lime when chosen. */
function Mark({ on, shape }: { on: boolean; shape: 'check' | 'radio' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid h-6 w-6 shrink-0 place-items-center border-2 transition-colors duration-200',
        shape === 'radio' ? 'rounded-full' : 'rounded-[7px]',
        on ? 'border-lime bg-lime text-ink-950' : 'border-ink-300 text-transparent group-hover:border-ink-950',
      )}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
    </span>
  )
}

function SectionLabel({
  id,
  n,
  title,
  hint,
  error,
  errorId,
}: {
  id?: string
  n: number
  title: string
  hint?: string
  error?: string
  errorId?: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {/* Numbered on purpose: these are the steps of one form, in order. */}
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-950 font-display text-xs font-bold text-white" aria-hidden="true">
        {n}
      </span>
      <h2 id={id} className="font-display text-lg font-bold tracking-tight text-ink-950 sm:text-xl">
        {title}
      </h2>
      {hint && !error && <span className="text-sm text-ink-600">{hint}</span>}
      {error && (
        <span id={errorId} role="alert" className="text-sm font-medium text-red-700">
          {error}
        </span>
      )}
    </div>
  )
}

function DirectLink({
  href,
  icon: Icon,
  label,
  external,
  onClick,
}: {
  href: string
  icon: typeof User
  label: string
  external?: boolean
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <li>
      <a
        href={href}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group flex min-h-14 items-center gap-3 rounded-2xl border border-white/15 px-4 py-2 text-[15px] font-semibold transition-colors duration-300 ease-expo hover:border-lime hover:bg-lime hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
      >
        <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ArrowUpRight className="h-[18px] w-[18px] shrink-0 opacity-60 transition-[opacity,transform] duration-300 ease-expo group-hover:rotate-45 group-hover:opacity-100" aria-hidden="true" />
      </a>
    </li>
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
  autoComplete,
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
  autoComplete?: string
  className?: string
}) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className={cn('anchor-target', className)}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink-950">
        {label}
        {required && (
          <span className="ml-0.5 text-brand-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <Icon
          className={cn('pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2', error ? 'text-red-600' : 'text-ink-500')}
          aria-hidden="true"
        />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          inputMode={inputMode}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          data-invalid={!!error}
          className={cn(CONTROL, 'h-14 rounded-2xl pl-12 pr-4', error ? CONTROL_BAD : CONTROL_OK)}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
