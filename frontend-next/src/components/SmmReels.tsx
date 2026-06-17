'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import type { Reel } from '../lib/api'

// Pull the video id from any common YouTube link shape:
// watch?v=ID, youtu.be/ID, /shorts/ID, /embed/ID, /v/ID, /live/ID — plus a bare
// regex fallback for anything URL() can't parse.
function youtubeId(raw: string): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  try {
    const u = new URL(trimmed)
    const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '')
    if (host === 'youtu.be') {
      return u.pathname.split('/').filter(Boolean)[0] || null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v')
      const m = u.pathname.match(/^\/(?:shorts|embed|v|live)\/([^/?#]+)/)
      if (m) return m[1]
    }
  } catch {
    // not a parseable absolute URL — fall through to the regex below
  }
  const m = trimmed.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|v\/|live\/))([A-Za-z0-9_-]{6,})/,
  )
  return m ? m[1] : null
}

type PreparedReel = { id: number; title: string; videoId: string }

export default function SmmReels({ reels }: { reels: Reel[] }) {
  const prepared = reels
    .map((r): PreparedReel | null => {
      const videoId = youtubeId(r.youtube_url)
      return videoId ? { id: r.id, title: r.title, videoId } : null
    })
    .filter((r): r is PreparedReel => r !== null)

  // Hide the whole section when there are no (valid) reels.
  if (prepared.length === 0) return null

  return (
    <section className="relative bg-neutral-50 py-14 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-6 lg:px-10">
        <div className="mb-8 md:mb-12">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">— Рилсы</span>
          <h2 className="mt-5 text-3xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 sm:text-4xl">
            Видео и рилсы
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
            Короткие форматы, которые работают: посмотрите примеры наших рилсов прямо здесь.
          </p>
        </div>

        <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {prepared.map((reel, i) => (
            <ReelCard key={reel.id} reel={reel} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ReelCard({ reel, index }: { reel: PreparedReel; index: number }) {
  const [playing, setPlaying] = useState(false)
  // Start with the always-present hqdefault; fall back to maxresdefault on error.
  const [hiRes, setHiRes] = useState(false)
  const thumb = hiRes
    ? `https://img.youtube.com/vi/${reel.videoId}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${reel.videoId}/hqdefault.jpg`

  return (
    // The whole card is the vertical 9:16 reel (Shorts-style). The title is
    // overlaid on a bottom gradient instead of a separate box; the iframe plays
    // in place on click.
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
      className="group relative aspect-[9/16] overflow-hidden rounded-3xl bg-neutral-900 shadow-md ring-1 ring-neutral-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-600/20 hover:ring-2 hover:ring-brand-500/70"
    >
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${reel.videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={reel.title || 'YouTube видео'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={reel.title ? `Смотреть видео: ${reel.title}` : 'Смотреть видео'}
          className="absolute inset-0 h-full w-full text-left"
        >
          <img
            src={thumb}
            alt={reel.title || 'Превью видео'}
            loading="lazy"
            onError={() => setHiRes(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Bottom gradient for title legibility. */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Centered play button. */}
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/95 shadow-xl ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-0.5 h-6 w-6 fill-brand-600 text-brand-600" />
            </span>
          </span>

          {/* Title overlaid on the reel. */}
          {reel.title && (
            <span className="absolute inset-x-0 bottom-0 p-4">
              <span className="line-clamp-2 text-sm font-semibold leading-snug text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]">
                {reel.title}
              </span>
            </span>
          )}
        </button>
      )}
    </motion.div>
  )
}
