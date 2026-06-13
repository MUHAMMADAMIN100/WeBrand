'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Newspaper } from 'lucide-react'
import Link from 'next/link'
import { formatDate, type NewsListItem } from '../lib/api'

export default function ArticleCard({ item, index }: { item: NewsListItem; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index % 9) * 0.05 }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-all hover:border-brand-600 hover:shadow-2xl hover:shadow-brand-600/10"
    >
      <Link href={`/news/${item.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-50 to-neutral-50">
          {item.cover ? (
            <img
              src={item.cover}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Newspaper className="h-12 w-12 text-brand-200" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6 lg:p-7">
          <time className="text-xs font-semibold uppercase tracking-wider text-brand-600" dateTime={item.published_at}>
            {formatDate(item.published_at)}
          </time>
          <h2 className="mt-3 text-xl font-bold leading-snug text-neutral-900 line-clamp-2">{item.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 line-clamp-3">{item.excerpt}</p>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand-600">
            Читать статью
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
