'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion'
import { Phone } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { nav, contacts } from '../data/content'
import { useModal } from '../context/ModalContext'
import { cn } from '../lib/utils'
import Button from './ui/Button'
import Magnetic from './motion/Magnetic'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState('')
  const { open: openModal } = useModal()
  const reduce = useReducedMotion()
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Hash links scroll within the home page; when we're on another route
  // (e.g. /vacancies) prefix them with "/" so the browser navigates home and
  // then jumps to the section.
  const resolveHash = (href: string) =>
    pathname === '/' ? href : '/' + href

  // Scroll state via Framer's motion value (no per-frame window scroll listener)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24))
  useEffect(() => {
    setScrolled(window.scrollY > 24)
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
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

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

  const menuVariants = {
    hidden: {},
    show: {
      transition: reduce ? {} : { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  }
  const itemVariants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  }

  const isActive = (href: string) =>
    href.startsWith('/') ? pathname === href : activeId === href.slice(1)

  // Once the page scrolls the bar lifts off into a floating pill. While the
  // mobile menu is open it goes transparent instead, so the ink overlay reads
  // as one surface with the logo and the close button sitting on it.
  const floating = scrolled && !open

  return (
    <>
      <motion.header
        initial={reduce ? false : { y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-3 lg:px-6"
      >
        <div
          className={cn(
            'mx-auto flex items-center justify-between border transition-all duration-500 ease-expo',
            floating
              ? 'mt-3 h-14 max-w-6xl rounded-full border-ink-200/80 bg-white/85 pl-5 pr-2 shadow-[0_10px_40px_-18px_rgba(11,13,18,0.35)] backdrop-blur-xl'
              : 'mt-0 h-20 max-w-[88rem] rounded-none border-transparent bg-transparent px-2 lg:px-4',
          )}
        >
          {/* Logo */}
          <a
            href={resolveHash('#top')}
            className="relative z-50 flex shrink-0 select-none items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-4"
            aria-label="Webrand — на главную"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={open ? '/logos/main-logo-dark.png' : '/logos/main-logo.png'}
              alt="Webrand"
              width={388}
              height={81}
              className={cn(
                'w-auto object-contain transition-[height] duration-500 ease-expo',
                floating ? 'h-7' : 'h-8 sm:h-9',
              )}
            />
          </a>

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
              const marker = active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-10 rounded-full bg-lime"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )
              return isRoute ? (
                <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={className}>
                  {marker}
                  {item.label}
                </Link>
              ) : (
                <a key={item.href} href={resolveHash(item.href)} aria-current={active ? 'true' : undefined} className={className}>
                  {marker}
                  {item.label}
                </a>
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
              {[
                open ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 },
                open ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 },
              ].map((animate, i) => (
                <motion.span
                  key={i}
                  className={cn(
                    'absolute left-0 block h-0.5 w-6 rounded-full transition-colors duration-300',
                    open ? 'bg-white' : 'bg-ink-950',
                  )}
                  style={{ top: 'calc(50% - 1px)', transformOrigin: 'center' }}
                  animate={animate}
                  transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
            </span>
          </button>
        </div>
      </motion.header>

      {/* Mobile full-screen menu — rendered as a sibling of the header (NOT a
          child) so its `fixed inset-0` resolves against the viewport rather than
          the header's transformed box. The header (z-50) stays above this overlay
          (z-40), so it remains fully visible and the close button stays tappable
          even after the page has been scrolled. */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 overflow-y-auto bg-ink-950 text-white lg:hidden"
          >
            <motion.nav
              variants={menuVariants}
              initial="hidden"
              animate="show"
              aria-label="Мобильная навигация"
              className="flex min-h-full flex-col justify-center gap-1 px-6 pb-10 pt-28"
            >
              {nav.map((item) => {
                const isRoute = item.href.startsWith('/')
                const active = isActive(item.href)
                return (
                  <motion.a
                    key={item.href}
                    variants={itemVariants}
                    href={isRoute ? item.href : resolveHash(item.href)}
                    onClick={(e) => {
                      setOpen(false)
                      if (isRoute) {
                        e.preventDefault()
                        router.push(item.href)
                      }
                    }}
                    className={cn(
                      'rounded-lg py-2 font-display text-[clamp(1.6rem,8vw,2.4rem)] font-black leading-tight tracking-tight transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime',
                      active ? 'text-lime' : 'text-white',
                    )}
                  >
                    {item.label}
                  </motion.a>
                )
              })}

              <motion.a
                variants={itemVariants}
                href={`tel:${contacts.phoneRaw}`}
                onClick={() => setOpen(false)}
                className="mt-8 inline-flex w-fit items-center gap-3 rounded-lg py-1 text-lg font-semibold text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
              >
                <Phone className="h-5 w-5 text-lime" aria-hidden="true" />
                {contacts.phone}
              </motion.a>

              <motion.div variants={itemVariants} className="mt-4">
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
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
