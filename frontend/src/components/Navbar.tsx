'use client'

import { useEffect, useRef, useState } from 'react'
import { Phone } from 'lucide-react'
import Link from 'next/link'
import { useReducedMotionSafe as useReducedMotion } from '../lib/capabilities'
import { usePathname } from '../lib/usePathname'
import { nav, contacts } from '../data/content'
import { useModal } from '../context/ModalContext'
import { cn } from '../lib/utils'
import Button from './ui/Button'
import Magnetic from './motion/Magnetic'
import SlidingMarker from './motion/SlidingMarker'
import SectionLink from './ui/SectionLink'

// The header is on every page and its code is on the path to the first screen
// answering a click, so it uses no animation library: every movement here is a
// CSS transition or keyframe, and the markup it is server-rendered with is
// already in its final, visible state (it used to arrive pushed off screen and
// wait for the scripts to bring it in).

/** How long the mobile menu takes to open or close; the panel stays mounted
 *  that long after closing so the way out can play. Mirrors `duration-[550ms]`
 *  on the panel. */
const MENU_MS = 550

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState('')
  const { open: openModal } = useModal()
  const reduce = useReducedMotion()
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Past the first 24px the bar lifts off into a floating pill. The state only
  // changes at that threshold, so the listener costs a comparison per scroll.
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  // Active section indicator via IntersectionObserver
  useEffect(() => {
    const els = nav
      .map((n) => document.getElementById(n.href.slice(1)))
      .filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id)
          // Left the band without another tracked section entering it (the
          // hero, FAQ, CTA…): no nav item describes this spot, so mark none.
          else setActiveId((current) => (current === e.target.id ? '' : current))
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // The mobile menu is only in the DOM while it is open or on its way out.
  // `menuShown` trails `open` by a frame on the way in, so the closed state is
  // painted once and the transition has somewhere to start from.
  const [menuMounted, setMenuMounted] = useState(false)
  const [menuShown, setMenuShown] = useState(false)
  useEffect(() => {
    if (open) {
      setMenuMounted(true)
      let id = requestAnimationFrame(() => {
        id = requestAnimationFrame(() => setMenuShown(true))
      })
      return () => cancelAnimationFrame(id)
    }
    setMenuShown(false)
    const timer = setTimeout(() => setMenuMounted(false), MENU_MS)
    return () => clearTimeout(timer)
  }, [open])

  // Lock body scroll + close on Esc + trap focus while the mobile menu is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusables = () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
    const focusTimer = setTimeout(() => focusables()[0]?.focus(), 80)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const nodes = focusables()
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      clearTimeout(focusTimer)
    }
  }, [open])

  const isActive = (href: string) =>
    href.startsWith('/') ? pathname === href : activeId === href.slice(1)

  // Once the page scrolls the bar lifts off into a floating pill. While the
  // mobile menu is open it goes transparent instead, so the ink overlay reads
  // as one surface with the logo and the close button sitting on it.
  const floating = scrolled && !open

  // Each menu row rises in turn on the way in; on the way out they all leave
  // with the panel.
  const menuItem = (index: number) => ({
    className: cn(
      'transition-[opacity,transform] duration-500 ease-expo',
      menuShown ? 'translate-y-0 opacity-100' : reduce ? 'opacity-0' : 'translate-y-7 opacity-0',
    ),
    style: { transitionDelay: menuShown && !reduce ? `${100 + index * 60}ms` : '0ms' },
  })

  return (
    <>
      <header className="nav-enter fixed inset-x-0 top-0 z-50 px-3 lg:px-6">
        <div
          className={cn(
            'mx-auto flex items-center justify-between border transition-all duration-500 ease-expo',
            floating
              ? 'mt-3 h-14 max-w-6xl rounded-full border-ink-200/80 bg-white/95 pl-5 pr-2 shadow-[0_10px_40px_-18px_rgba(11,13,18,0.35)] lg:bg-white/85 lg:backdrop-blur-xl'
              : 'mt-0 h-20 max-w-[88rem] rounded-none border-transparent bg-transparent px-2 lg:px-4',
          )}
        >
          {/* Logo */}
          <SectionLink
            hash="#top"
            className="relative z-50 flex shrink-0 select-none items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-4"
            aria-label="Webrand — на главную"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={open ? '/logos/main-logo-dark.webp' : '/logos/main-logo.webp'}
              alt="Webrand"
              width={388}
              height={81}
              className={cn(
                'w-auto object-contain transition-[height] duration-500 ease-expo',
                floating ? 'h-7' : 'h-8 sm:h-9',
              )}
            />
          </SectionLink>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Основная навигация">
            {nav.map((item) => {
              const isRoute = item.href.startsWith('/')
              const active = isActive(item.href)
              const className = cn(
                'relative rounded-full px-3.5 py-2 text-[0.94rem] font-semibold transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
                active ? 'text-ink-950' : 'text-ink-600 hover:text-ink-950',
              )
              return isRoute ? (
                <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={className}>
                  {active && <SlidingMarker group="nav" className="-z-10 bg-lime" />}
                  {item.label}
                </Link>
              ) : (
                <SectionLink key={item.href} hash={item.href} aria-current={active ? 'true' : undefined} className={className}>
                  {active && <SlidingMarker group="nav" className="-z-10 bg-lime" />}
                  {item.label}
                </SectionLink>
              )
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-1 lg:flex">
            <a
              href={`tel:${contacts.phoneRaw}`}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ink-700 transition-colors duration-200 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {contacts.phone}
            </a>
            <Magnetic strength={0.25}>
              <Button onClick={() => openModal()} variant="ink" size="md" className={floating ? 'h-10' : undefined}>
                Напишите нам
              </Button>
            </Magnetic>
          </div>

          {/* Mobile hamburger -> X */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="relative z-50 grid h-11 w-11 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 lg:hidden"
          >
            <span className="relative block h-6 w-6">
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className={cn(
                    'absolute left-0 top-[calc(50%-1px)] block h-0.5 w-6 rounded-full transition-[transform,background-color] duration-[350ms] ease-expo motion-reduce:transition-none',
                    open ? 'bg-white' : 'bg-ink-950',
                    open ? (i === 0 ? 'rotate-45' : '-rotate-45') : i === 0 ? '-translate-y-[5px]' : 'translate-y-[5px]',
                  )}
                />
              ))}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile full-screen menu — rendered as a sibling of the header (NOT a
          child) so its `fixed inset-0` resolves against the viewport rather than
          the header's transformed box. The header (z-50) stays above this overlay
          (z-40), so it remains fully visible and the close button stays tappable
          even after the page has been scrolled. */}
      {menuMounted && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className={cn(
            'fixed inset-0 z-40 overflow-y-auto bg-ink-950 text-white lg:hidden',
            // A curtain drawn down from the header; a plain fade for those who
            // asked for less motion.
            reduce
              ? cn('transition-opacity duration-200', menuShown ? 'opacity-100' : 'opacity-0')
              : cn(
                  'transition-[clip-path] duration-[550ms] ease-expo',
                  menuShown ? '[clip-path:inset(0_0_0%_0)]' : '[clip-path:inset(0_0_100%_0)]',
                ),
          )}
        >
          <nav
            aria-label="Мобильная навигация"
            className="flex min-h-full flex-col justify-center gap-1 px-6 pb-10 pt-28"
          >
            {nav.map((item, i) => {
              const isRoute = item.href.startsWith('/')
              const active = isActive(item.href)
              const row = menuItem(i)
              const className = cn(
                'rounded-lg py-2 font-display text-[clamp(1.6rem,8vw,2.4rem)] font-black leading-tight tracking-tight',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime',
                active ? 'text-lime' : 'text-white',
                row.className,
              )
              return isRoute ? (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={className} style={row.style}>
                  {item.label}
                </Link>
              ) : (
                <SectionLink key={item.href} hash={item.href} onClick={() => setOpen(false)} className={className} style={row.style}>
                  {item.label}
                </SectionLink>
              )
            })}

            <a
              href={`tel:${contacts.phoneRaw}`}
              onClick={() => setOpen(false)}
              className={cn(
                'mt-8 inline-flex w-fit items-center gap-3 rounded-lg py-1 text-lg font-semibold text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime',
                menuItem(nav.length).className,
              )}
              style={menuItem(nav.length).style}
            >
              <Phone className="h-5 w-5 text-lime" aria-hidden="true" />
              {contacts.phone}
            </a>

            <div className={cn('mt-4', menuItem(nav.length + 1).className)} style={menuItem(nav.length + 1).style}>
              <Button
                variant="lime"
                size="lg"
                onClick={() => {
                  setOpen(false)
                  openModal()
                }}
              >
                Напишите нам
              </Button>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
