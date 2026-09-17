'use client'

import {
  Palette,
  Megaphone,
  Handshake,
  Code2,
  Target,
  Clapperboard,
  ArrowUpRight,
  Briefcase,
  Award,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react'
import { contacts, type Vacancy } from '../data/content'
import { useModal } from '../context/ModalContext'
import { openTelegram } from '../lib/telegram'
import Button from './ui/Button'

// Map the icon name stored in the API to a real lucide component
const ICONS: Record<string, LucideIcon> = {
  Palette,
  Megaphone,
  Handshake,
  Code2,
  Target,
  Clapperboard,
}

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
  const { openApply } = useModal()

  const telegramLink = (
    <a
      href={contacts.telegram}
      target="_blank"
      rel="noopener noreferrer"
      onClick={openTelegram}
      className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-700"
    >
      Telegram
    </a>
  )

  return (
    // anchor-target keeps the heading clear of the fixed navbar (offset = --header-h + buffer).
    <section id="careers" className="anchor-target relative pb-16 pt-28 md:pb-24 md:pt-36 lg:pb-32">
      <div className="mx-auto max-w-[88rem] px-5 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <Heading className="font-display text-display-xl font-black text-ink-950">Присоединяйся к команде</Heading>
          <p className="max-w-sm text-base leading-relaxed text-ink-600 lg:pb-2 lg:text-right">
            Мы растём и ищем людей, которым нравится делать сильные digital-продукты. Откликнись —
            расскажем подробнее и обсудим условия.
          </p>
        </div>

        {error ? (
          <div className="mt-12 rounded-[1.75rem] border border-ink-200 bg-white px-6 py-14 text-center">
            <p className="font-display text-lg font-bold text-ink-950">Не удалось загрузить вакансии</p>
            <p className="mt-2 text-sm text-ink-600">Обновите страницу или напишите нам в {telegramLink}.</p>
          </div>
        ) : vacancies.length === 0 ? (
          <div className="mt-12 rounded-[1.75rem] border border-ink-200 bg-white px-6 py-14 text-center">
            <p className="font-display text-lg font-bold text-ink-950">Сейчас открытых вакансий нет</p>
            <p className="mt-2 text-sm text-ink-600">Но мы всегда рады талантам — напишите нам в {telegramLink}.</p>
          </div>
        ) : (
          // A ledger of roles rather than a wall of cards: one row per vacancy,
          // the action always in the same place on the right.
          <ul className="mt-12 border-t border-ink-200 md:mt-16">
            {vacancies.map((v) => (
              <VacancyRow
                key={v.id}
                vacancy={v}
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
          </ul>
        )}
      </div>
    </section>
  )
}

function VacancyRow({ vacancy, onApply }: { vacancy: Vacancy; onApply: () => void }) {
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
    <li className="group grid gap-6 border-b border-ink-200 py-7 lg:grid-cols-12 lg:items-center lg:gap-8 lg:py-9">
      <div className="flex items-start gap-5 lg:col-span-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink-950 text-lime transition-colors duration-300 ease-expo group-hover:bg-brand-600 group-hover:text-white">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-ink-950 lg:text-2xl">
            {vacancy.title}
          </h3>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600">
            <Briefcase className="h-4 w-4" aria-hidden="true" />
            {vacancy.type}
          </p>
        </div>
      </div>

      <div className="lg:col-span-5">
        <p className="text-base leading-relaxed text-ink-600">{vacancy.tagline}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {vacancy.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700">
              {tag}
            </li>
          ))}
          {/* Requirements (опыт / возраст) — shown only when set in the admin */}
          {reqs.map(({ Icon: ReqIcon, label }) => (
            <li key={label} className="inline-flex items-center gap-1.5 rounded-full bg-lime-soft px-2.5 py-1 text-xs font-semibold text-ink-950">
              <ReqIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA — opens the contact modal in application mode with this vacancy's
          slug as `role` (see openApply in the parent). */}
      <div className="lg:col-span-2 lg:justify-self-end">
        <Button onClick={onApply} variant="ink" size="lg" className="w-full lg:w-auto" aria-label={`Откликнуться на вакансию: ${vacancy.title}`}>
          Откликнуться
          <ArrowUpRight className="h-5 w-5 transition-transform duration-300 ease-expo group-hover/btn:rotate-45" aria-hidden="true" />
        </Button>
      </div>
    </li>
  )
}
