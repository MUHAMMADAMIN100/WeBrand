'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ExternalLink, Sparkles } from 'lucide-react'
import { contacts } from '../data/content'
import type { ProjectItem } from '../lib/api'
import { openTelegram } from '../lib/telegram'

// Section 2 of /smm: a curated «Топ-кейсы» showcase (is_featured, max 3) followed
// by the rest of the SMM projects in the standard portfolio-card grid. The card
// style mirrors the home Portfolio block (category badge, logo on an accent
// gradient, floating colour dots).
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
    <section className="relative bg-white py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-6 lg:px-10">
        {error ? (
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
            <p className="text-base font-semibold text-neutral-800">Не удалось загрузить работы</p>
            <p className="mt-2 text-sm text-neutral-600">
              Попробуйте обновить страницу или напишите нам в{' '}
              <a
                href={contacts.telegram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={openTelegram}
                className="font-semibold text-brand-600 hover:underline"
              >
                Telegram
              </a>
              .
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-20 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-neutral-300" />
            <p className="mt-4 text-base font-semibold text-neutral-800">SMM-кейсы скоро появятся</p>
            <p className="mt-2 text-sm text-neutral-600">
              Мы готовим подборку работ — загляните чуть позже.
            </p>
          </div>
        ) : (
          <div className="space-y-12 md:space-y-16">
            {featured.length > 0 && (
              <div>
                <div className="mb-6 md:mb-8">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Топ-кейсы
                  </span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {featured.map((item, i) => (
                    <SmmProjectCard key={item.id} item={item} index={i} featured />
                  ))}
                </div>
              </div>
            )}

            {rest.length > 0 && (
              <div>
                {featured.length > 0 && (
                  <h2 className="mb-6 text-xl font-bold text-neutral-900 md:mb-8 md:text-2xl">
                    Другие работы
                  </h2>
                )}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {rest.map((item, i) => (
                    <SmmProjectCard key={item.id} item={item} index={i} />
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
  index,
  featured = false,
}: {
  item: ProjectItem
  index: number
  featured?: boolean
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
      whileHover={{ y: -8 }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white transition-all hover:shadow-2xl hover:shadow-brand-600/10 ${
        featured
          ? 'border-2 border-brand-600/30 ring-1 ring-brand-600/10 hover:border-brand-600'
          : 'border border-neutral-200 hover:border-brand-600'
      }`}
    >
      <div
        className={`relative overflow-hidden ${featured ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}
        style={{ background: `linear-gradient(135deg, ${item.accent}15, ${item.accent}05 50%, #ffffff)` }}
      >
        <SmmProjectVisual item={item} />

        <div className="absolute left-3 top-3 z-10">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-neutral-900 shadow-sm backdrop-blur">
            {item.category}
          </span>
        </div>

        {featured && (
          <div className="absolute right-3 top-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-brand-600/30">
              <Sparkles className="h-3.5 w-3.5" />
              Топ
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 lg:p-7">
        <h3 className="text-xl font-bold leading-tight text-neutral-900">
          {item.name}{' '}
          <span className="text-base font-normal text-neutral-400">— {item.subtitle}</span>
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-600">
          {item.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors group-hover:bg-brand-50 group-hover:text-brand-700"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-6">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/20 transition-colors group-hover:bg-brand-700 group-hover:shadow-xl group-hover:shadow-brand-600/30"
            >
              Смотреть кейс
              <ExternalLink className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-1" />
            </a>
          ) : (
            <div className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-neutral-100 py-3.5 font-semibold text-neutral-500">
              Кейс скоро
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}

function SmmProjectVisual({ item }: { item: ProjectItem }) {
  const initials = item.initials ?? item.name.slice(0, 4).toUpperCase()
  const [imgError, setImgError] = useState(false)
  const reduce = useReducedMotion()
  const showLogo = item.logo && !imgError
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <motion.div whileHover={{ scale: 1.05, rotate: -2 }} transition={{ type: 'spring' }} className="relative">
        <div className="absolute inset-0 rounded-full opacity-40 blur-2xl" style={{ background: item.accent }} />
        <div className="relative flex h-32 w-44 items-center justify-center overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-xl">
          {showLogo ? (
            <img
              src={item.logo}
              alt={item.name}
              className="max-h-20 max-w-[140px] object-contain"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="px-6 text-center">
              <div className="mb-2 text-4xl font-extrabold tracking-tight" style={{ color: item.accent }}>
                {initials}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                {item.category}
              </div>
            </div>
          )}
        </div>

        <motion.div
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -right-3 -top-3 h-6 w-6 rounded-full shadow-md"
          style={{ background: item.accent }}
        />
        <motion.div
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full border-2 bg-white shadow"
          style={{ borderColor: item.accent }}
        />
      </motion.div>
    </div>
  )
}
