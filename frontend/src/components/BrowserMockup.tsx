'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import type { PortfolioItem } from '../data/content'

type MockupItem = Pick<
  PortfolioItem,
  'name' | 'category' | 'accent' | 'logo' | 'cover' | 'initials' | 'site_url' | 'url'
>

function hostnameOf(u?: string | null): string {
  if (!u) return ''
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

// A light, on-brand browser-window mockup. Shows the project screenshot (`cover`)
// inside the frame; falls back to the logo, then the initials. The `tilt` variant
// renders a subtle 3D lean that straightens when the parent `.group` is hovered
// (used on the portfolio cards); the case page uses it flat and large.
export default function BrowserMockup({
  item,
  tilt = false,
  aspect = 'aspect-[16/10]',
  className = '',
}: {
  item: MockupItem
  tilt?: boolean
  aspect?: string
  className?: string
}) {
  const [coverError, setCoverError] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const showCover = !!item.cover && !coverError
  const showLogo = !showCover && !!item.logo && !logoError
  const initials = item.initials ?? item.name.slice(0, 4).toUpperCase()
  const host = hostnameOf(item.site_url || item.url) || 'webrand.tj'

  const tiltCls = tilt
    ? 'transition-transform duration-500 ease-out [transform:perspective(1400px)_rotateX(7deg)_rotateY(-9deg)] group-hover:[transform:perspective(1400px)_rotateX(0deg)_rotateY(0deg)]'
    : ''

  return (
    <div className={className}>
      <div
        className={`overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_24px_60px_-24px_rgba(16,24,40,0.4)] ${tiltCls}`}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-3 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </span>
          <span className="ml-1.5 flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-400 ring-1 ring-neutral-200">
            <Lock className="h-3 w-3 shrink-0 text-neutral-300" />
            <span className="truncate">{host}</span>
          </span>
        </div>

        {/* Screen */}
        <div
          className={`relative w-full ${aspect} overflow-hidden`}
          style={{ background: `linear-gradient(135deg, ${item.accent}14, ${item.accent}06 55%, #ffffff)` }}
        >
          {showCover ? (
            <img
              src={item.cover as string}
              alt={item.name}
              loading="lazy"
              onError={() => setCoverError(true)}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          ) : showLogo ? (
            <div className="absolute inset-0 grid place-items-center p-8">
              <img
                src={item.logo as string}
                alt={item.name}
                loading="lazy"
                onError={() => setLogoError(true)}
                className="max-h-[60%] max-w-[62%] object-contain"
              />
            </div>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ color: item.accent }}>
                  {initials}
                </div>
                <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                  {item.category}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
