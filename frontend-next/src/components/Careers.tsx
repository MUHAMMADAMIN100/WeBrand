'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
  Palette,
  Megaphone,
  Handshake,
  Code2,
  Target,
  Clapperboard,
  ArrowRight,
  Briefcase,
  Award,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react'
import { contacts, type Vacancy } from '../data/content'
import { useModal } from '../context/ModalContext'

// Map the icon name stored in the API to a real lucide component
const ICONS: Record<string, LucideIcon> = {
  Palette,
  Megaphone,
  Handshake,
  Code2,
  Target,
  Clapperboard,
}

// Literal class strings so Tailwind's JIT can detect them (no dynamic `text-${...}`)
const ACCENT_TEXT: Record<string, string> = {
  'brand-500': 'text-brand-500',
  'brand-600': 'text-brand-600',
  'brand-700': 'text-brand-700',
}

const EASE = [0.16, 1, 0.3, 1] as const

// На главной Careers — секция (h2); на странице /vacancies это главный
// заголовок страницы, поэтому роут передаёт headingLevel="h1".
export default function Careers({
  headingLevel = 'h2',
  vacancies,
  error = false,
}: {
  headingLevel?: 'h1' | 'h2'
  // Vacancies are server-rendered (passed as props) so the content is in the
  // initial HTML for SEO — no client fetch / loading spinner needed.
  vacancies: Vacancy[]
  error?: boolean
}) {
  const Heading = headingLevel
  const reduce = useReducedMotion()
  const { openApply } = useModal()

  return (
    // scroll-mt-28 keeps the heading clear of the fixed navbar when navigating to #careers.
    // Extra top padding on mobile so the heading is clearly separated from the fixed header.
    <section
      id="careers"
      className="relative scroll-mt-28 bg-white pt-28 pb-14 md:pt-24 md:pb-24 lg:pt-32 lg:pb-32"
    >
      <div className="relative mx-auto max-w-7xl px-5 md:px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-2xl"
        >
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">
            — Вакансии
          </span>
          <Heading className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Присоединяйся <span className="text-brand-600">к команде</span>
          </Heading>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">
            Мы растём и ищем людей, которым нравится делать сильные digital-продукты.
            Откликнись — расскажем подробнее и обсудим условия.
          </p>
        </motion.div>

        {/* Grid */}
        {error ? (
          <div className="mt-12 rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
            <p className="text-base font-semibold text-neutral-800">Не удалось загрузить вакансии</p>
            <p className="mt-2 text-sm text-neutral-600">
              Попробуйте обновить страницу или напишите нам в{' '}
              <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 hover:underline">
                Telegram
              </a>
              .
            </p>
          </div>
        ) : vacancies.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
            <p className="text-base font-semibold text-neutral-800">Сейчас открытых вакансий нет</p>
            <p className="mt-2 text-sm text-neutral-600">
              Но мы всегда рады талантам — напишите нам в{' '}
              <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 hover:underline">
                Telegram
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vacancies.map((v, i) => (
              <VacancyCard
                key={v.id}
                vacancy={v}
                index={i}
                reduce={!!reduce}
                onApply={() =>
                  openApply({
                    role: v.id,
                    title: v.title,
                    experienceRequired: v.experience_required,
                    ageMin: v.age_min,
                    ageMax: v.age_max,
                  })
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function VacancyCard({
  vacancy,
  index,
  reduce,
  onApply,
}: {
  vacancy: Vacancy
  index: number
  reduce: boolean
  onApply: () => void
}) {
  const Icon = ICONS[vacancy.icon] ?? Briefcase

  // Applicant requirements shown to the candidate (all optional).
  const reqs: { Icon: LucideIcon; label: string }[] = []
  if (vacancy.experience_required) reqs.push({ Icon: Award, label: vacancy.experience_required })
  if (vacancy.age_min || vacancy.age_max) {
    const { age_min: lo, age_max: hi } = vacancy
    const label = lo && hi ? `${lo}–${hi} лет` : lo ? `от ${lo} лет` : `до ${hi} лет`
    reqs.push({ Icon: CalendarDays, label })
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: EASE, delay: reduce ? 0 : index * 0.07 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_30px_-16px_rgba(16,24,40,0.18)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-[0_18px_40px_-16px_rgba(16,24,40,0.20),0_28px_60px_-28px_rgba(43,94,211,0.40)]"
    >
      {/* Brand visual header — consistent across all cards, built in code (no photos).
          NOTE: if a licensed role photo is ever wanted, swap this banner for an <img>. */}
      <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100">
        {/* soft brand blob */}
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-brand-200/50 blur-2xl" />
        {/* faint grid texture */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#2B5ED314_1px,transparent_1px),linear-gradient(to_bottom,#2B5ED314_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        {/* icon tile */}
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-lg shadow-brand-600/10 ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
          <Icon className={`h-8 w-8 ${ACCENT_TEXT[vacancy.accent] ?? 'text-brand-600'}`} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <div className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-neutral-500">
          <Briefcase className="h-3.5 w-3.5 text-brand-500" />
          {vacancy.type}
        </div>
        <h3 className="mt-3 text-xl font-bold tracking-tight text-neutral-900">
          {vacancy.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">{vacancy.tagline}</p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {vacancy.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Requirements (опыт / возраст / резюме) — shown only when set in the admin */}
        {reqs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {reqs.map(({ Icon: ReqIcon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"
              >
                <ReqIcon className="h-3.5 w-3.5" />
                {label}
              </span>
            ))}
          </div>
        )}

        {/* CTA — opens the contact modal in application mode with this vacancy's
            slug as `role` (see openApply in the parent). */}
        <button
          type="button"
          onClick={onApply}
          className="group/btn mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-700 transition-colors duration-300 hover:bg-brand-600 hover:text-white"
        >
          Откликнуться
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
      </div>
    </motion.div>
  )
}
