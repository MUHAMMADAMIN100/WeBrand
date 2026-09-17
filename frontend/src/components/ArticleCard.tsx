import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { formatDate, type NewsListItem } from '../lib/api'

/** A post in the blog feed. A plain server component: the blog is for reading
 *  and for crawlers, so it ships no animation library — the hover is CSS.
 *  Titles are set in Manrope, not the display face: real headlines run long,
 *  and a wide grotesque turns them into a wall. */
export default function ArticleCard({ item }: { item: NewsListItem; index?: number }) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[1.75rem] bg-paper-2">
        {item.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.cover}
            alt=""
            width={800}
            height={500}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.04]"
          />
        ) : (
          <span aria-hidden="true" className="grid h-full w-full place-items-center font-display text-5xl font-black tracking-tight text-ink-950/10">
            webrand
          </span>
        )}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-ink-950/10" />
      </div>

      <div className="mt-5 flex flex-1 flex-col px-1">
        <time className="text-sm font-semibold text-ink-600" dateTime={item.published_at}>
          {formatDate(item.published_at)}
        </time>
        <h2 className="mt-2 line-clamp-3 text-xl font-extrabold leading-snug tracking-tight text-ink-950 lg:text-[1.375rem]">
          {/* Stretched link: the whole card is the target, the title is its name. */}
          <Link
            href={`/news/${item.slug}`}
            className="rounded after:absolute after:inset-0 after:rounded-[1.75rem] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-600 focus-visible:after:ring-offset-4 focus-visible:after:ring-offset-paper"
          >
            {item.title}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-3 text-base leading-relaxed text-ink-600">{item.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-ink-950" aria-hidden="true">
          Читать статью
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-expo group-hover:rotate-45" />
        </span>
      </div>
    </article>
  )
}
