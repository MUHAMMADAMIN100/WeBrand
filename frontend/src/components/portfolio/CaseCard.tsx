'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { PortfolioItem } from '../../data/content'
import CasePoster from './CasePoster'

/** One case in the portfolio grid. The whole card is the link (a stretched
 *  `<Link>` over it), so the target is the full poster rather than a small
 *  button. A project without a slug has no case page yet and says so. */
export default function CaseCard({ item }: { item: PortfolioItem }) {
  const href = item.slug ? `/portfolio/${item.slug}` : null

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="group/case relative flex flex-col"
    >
      <div className="relative">
        <CasePoster item={item} className="aspect-[4/3] rounded-[1.75rem]" />

        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-ink-950 shadow-sm">
          {item.category}
        </span>

        {href && (
          <span
            aria-hidden="true"
            className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-white text-ink-950 shadow-lg transition-[background-color,color,transform] duration-500 ease-expo group-hover/case:scale-110 group-hover/case:bg-lime"
          >
            <ArrowUpRight className="h-5 w-5 transition-transform duration-500 ease-expo group-hover/case:rotate-45" />
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col px-1">
        <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-ink-950 lg:text-2xl">
          {item.name}
        </h3>
        <p className="mt-1.5 text-base leading-snug text-ink-600">{item.subtitle}</p>

        {item.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((t) => (
              <li key={t} className="rounded-full border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-600">
                {t}
              </li>
            ))}
          </ul>
        )}

        {!href && <p className="mt-4 text-sm font-semibold text-ink-500">Кейс скоро</p>}
      </div>

      {/* Stretched link — the whole card opens the case page */}
      {href && (
        <Link
          href={href}
          aria-label={`Смотреть кейс: ${item.name}`}
          className="absolute inset-0 z-10 rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
        />
      )}
    </motion.article>
  )
}
