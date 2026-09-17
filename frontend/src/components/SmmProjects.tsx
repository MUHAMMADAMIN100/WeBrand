'use client'

import { ArrowUpRight } from 'lucide-react'
import { contacts } from '../data/content'
import type { ProjectItem } from '../lib/api'
import { openTelegram } from '../lib/telegram'
import { cn } from '../lib/utils'
import CasePoster from './portfolio/CasePoster'

// Section 2 of /smm: a curated «Топ-кейсы» showcase (is_featured, max 3) followed
// by the rest of the SMM projects. The cards share the home portfolio's poster
// (cover, or accent + logo), but unlike there they do not open a case page:
// an SMM project's proof is the live account, so the card links out to `url`.
export default function SmmProjects({
  projects,
  error = false,
}: {
  projects: ProjectItem[]
  error?: boolean
}) {
  // The API already returns SMM projects ordered by sort_order (asc): take the
  // flagged ones for the top showcase (max 3); everything else fills the grid.
  const featured = projects.filter((p) => p.is_featured).slice(0, 3)
  const featuredIds = new Set(featured.map((p) => p.id))
  const rest = projects.filter((p) => !featuredIds.has(p.id))

  return (
    <section className="relative py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[88rem] px-5 lg:px-10">
        {error ? (
          <div className="rounded-[1.75rem] border border-ink-200 bg-white px-6 py-16 text-center">
            <p className="font-display text-lg font-bold text-ink-950">Не удалось загрузить работы</p>
            <p className="mt-2 text-sm text-ink-600">
              Обновите страницу или напишите нам в{' '}
              <a
                href={contacts.telegram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={openTelegram}
                className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-700"
              >
                Telegram
              </a>
              .
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-[1.75rem] border border-ink-200 bg-white px-6 py-20 text-center">
            <p className="font-display text-lg font-bold text-ink-950">SMM-кейсы скоро появятся</p>
            <p className="mt-2 text-sm text-ink-600">Мы готовим подборку работ — загляните чуть позже.</p>
          </div>
        ) : (
          <div className="space-y-14 md:space-y-20">
            {featured.length > 0 && (
              <div>
                <h2 className="mb-7 font-display text-display-md font-black text-ink-950 md:mb-10">Топ-кейсы</h2>
                {/* Two top cases get the wider two-column grid; a full set of three lines up with the rest. */}
                <div className={cn('grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:gap-x-8', featured.length === 3 && 'xl:grid-cols-3')}>
                  {featured.map((item) => (
                    <SmmProjectCard key={item.id} item={item} featured titleLevel="h3" />
                  ))}
                </div>
              </div>
            )}

            {rest.length > 0 && (
              <div>
                {featured.length > 0 && (
                  <h2 className="mb-7 font-display text-display-md font-black text-ink-950 md:mb-10">Другие работы</h2>
                )}
                <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-8">
                  {/* Under «Другие работы» a card title is an h3; with no top cases
                      there is no such heading, and it sits right under the page's h1. */}
                  {rest.map((item) => (
                    <SmmProjectCard key={item.id} item={item} titleLevel={featured.length > 0 ? 'h3' : 'h2'} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function SmmProjectCard({
  item,
  featured = false,
  titleLevel: Title,
}: {
  item: ProjectItem
  featured?: boolean
  /** One level under whatever heads the grid, so the outline never skips a step. */
  titleLevel: 'h2' | 'h3'
}) {
  return (
    <article className="group/case relative flex flex-col">
      <div className="relative">
        <CasePoster item={item} className="aspect-[4/3] rounded-[1.75rem]" />

        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-ink-950 shadow-sm">
          {item.category}
        </span>
        {featured && (
          <span className="absolute right-4 top-4 rounded-full bg-lime px-3 py-1.5 text-xs font-bold text-ink-950 shadow-sm">
            Топ
          </span>
        )}

        {item.url && (
          <span
            aria-hidden="true"
            className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-white text-ink-950 shadow-lg transition-[background-color,transform] duration-500 ease-expo group-hover/case:scale-110 group-hover/case:bg-lime"
          >
            <ArrowUpRight className="h-5 w-5 transition-transform duration-500 ease-expo group-hover/case:rotate-45" />
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col px-1">
        <Title className="font-display text-xl font-bold leading-tight tracking-tight text-ink-950 lg:text-2xl">{item.name}</Title>
        <p className="mt-1.5 text-base leading-snug text-ink-600">{item.subtitle}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-600">{item.description}</p>

        {item.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((t) => (
              <li key={t} className="rounded-full border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-600">
                {t}
              </li>
            ))}
          </ul>
        )}

        {!item.url && <p className="mt-4 text-sm font-semibold text-ink-500">Кейс скоро</p>}
      </div>

      {/* Stretched link — the whole card opens the live account in a new tab. */}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Смотреть кейс: ${item.name} (откроется в новой вкладке)`}
          data-cursor="Открыть"
          className="absolute inset-0 z-10 rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
        />
      )}
    </article>
  )
}
