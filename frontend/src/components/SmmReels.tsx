'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import type { Reel } from '../lib/api'
import RevealText from './motion/RevealText'

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
    // The page's one dark room: video reads best with the lights off.
    <section className="relative bg-ink-950 py-16 text-white md:py-24 lg:py-28">
      <div className="mx-auto max-w-[88rem] px-5 lg:px-10">
        <div className="mb-10 md:mb-14">
          <RevealText as="h2" className="font-display text-display-lg font-black">
            Видео и рилсы
          </RevealText>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            Короткие форматы, которые работают: посмотрите примеры наших рилсов прямо здесь.
          </p>
        </div>

        <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {prepared.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ReelCard({ reel }: { reel: PreparedReel }) {
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
    <div className="group relative aspect-[9/16] overflow-hidden rounded-[1.5rem] bg-ink-900 ring-1 ring-white/10">
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
          data-cursor="Смотреть"
          className="absolute inset-0 h-full w-full rounded-[1.5rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime"
        >
          <img
            src={thumb}
            alt=""
            loading="lazy"
            onError={() => setHiRes(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-105"
          />
          {/* Bottom gradient for title legibility. */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent" />

          {/* Centered play button. */}
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-lime text-ink-950 shadow-xl transition-transform duration-500 ease-expo group-hover:scale-110">
              <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden="true" />
            </span>
          </span>

          {/* Title overlaid on the reel. */}
          {reel.title && (
            <span className="absolute inset-x-0 bottom-0 p-4">
              <span className="line-clamp-2 text-sm font-semibold leading-snug text-white">{reel.title}</span>
            </span>
          )}
        </button>
      )}
    </div>
  )
}
