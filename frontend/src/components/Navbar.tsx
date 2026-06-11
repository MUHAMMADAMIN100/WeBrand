import { useEffect, useRef, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion'
import { Phone, ArrowRight } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { nav, contacts } from '../data/content'
import { useModal } from '../context/ModalContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState('')
  const { open: openModal } = useModal()
  const reduce = useReducedMotion()
  const menuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Hash links scroll within the home page; when we're on another route
  // (e.g. /vacancies) prefix them with "/" so the browser navigates home and
  // then jumps to the section.
  const resolveHash = (href: string) =>
    location.pathname === '/' ? href : '/' + href

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
      transition: reduce ? {} : { staggerChildren: 0.07, delayChildren: 0.12 },
    },
  }
  const itemVariants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
    },
  }

  return (
    <>
      <motion.header
        initial={reduce ? false : { y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ease-out ${scrolled
          ? 'border-b border-black/[0.06] bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_-14px_rgba(16,24,40,0.18),inset_0_-1px_0_rgba(255,255,255,0.6)]'
          : 'border-b border-transparent bg-transparent'
        }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-[height] duration-300 ease-out lg:px-10 ${scrolled ? 'h-16' : 'h-20'
          }`}
      >
        {/* Logo */}
        <a href={resolveHash('#top')} className="relative z-50 flex select-none items-center" aria-label="Webrand — на главную">
          <motion.img
            whileHover={reduce ? undefined : { scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            src="/logos/main-logo.png"
            alt="Webrand"
            width={388}
            height={81}
            className={`w-auto object-contain transition-[height] duration-300 ${scrolled ? 'h-8' : 'h-9 sm:h-10'
              }`}
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-9 lg:flex">
          {nav.map((item) => {
            const isRoute = item.href.startsWith('/')
            const active = isRoute
              ? location.pathname === item.href
              : activeId === item.href.slice(1)
            const className = `group relative text-sm font-semibold transition-colors duration-200 ${active ? 'text-brand-600' : 'text-neutral-700 hover:text-brand-600'
              }`
            const underline = (
              <span
                className={`absolute -bottom-1.5 left-0 h-0.5 w-full origin-left rounded-full bg-brand-600 transition-transform duration-300 ease-out ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
              />
            )
            return isRoute ? (
              <Link key={item.href} to={item.href} aria-current={active ? 'true' : undefined} className={className}>
                {item.label}
                {underline}
              </Link>
            ) : (
              <a key={item.href} href={resolveHash(item.href)} aria-current={active ? 'true' : undefined} className={className}>
                {item.label}
                {underline}
              </a>
            )
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={`tel:${contacts.phoneRaw}`}
            className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors duration-200 hover:text-brand-600"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-600 transition-colors duration-200 group-hover:bg-brand-100">
              <Phone className="h-3.5 w-3.5" />
            </span>
            {contacts.phone}
          </a>
          <motion.button
            whileHover={reduce ? undefined : { scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            onClick={() => openModal()}
            className="group ml-1 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-600/40"
          >
            Напишите нам
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </motion.button>
        </div>

        {/* Mobile hamburger -> X */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="relative z-50 grid h-10 w-10 place-items-center lg:hidden"
        >
          <span className="relative block h-6 w-6">
            {/* верхняя полоска */}
            <motion.span
              className="absolute left-0 block h-0.5 w-6 rounded-full bg-neutral-900"
              style={{ top: 'calc(50% - 1px)', transformOrigin: 'center' }}
              animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* средняя полоска — исчезает при открытии */}
            <motion.span
              className="absolute left-0 block h-0.5 w-6 rounded-full bg-neutral-900"
              style={{ top: 'calc(50% - 1px)', transformOrigin: 'center' }}
              animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: reduce ? 0 : 0.2, ease: 'easeOut' }}
            />
            {/* нижняя полоска */}
            <motion.span
              className="absolute left-0 block h-0.5 w-6 rounded-full bg-neutral-900"
              style={{ top: 'calc(50% - 1px)', transformOrigin: 'center' }}
              animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-white/85 backdrop-blur-xl lg:hidden"
          >
            <motion.nav
              variants={menuVariants}
              initial="hidden"
              animate="show"
              className="flex h-full flex-col justify-center gap-3 px-8"
            >
              {nav.map((item) => {
                const isRoute = item.href.startsWith('/')
                const active = isRoute
                  ? location.pathname === item.href
                  : activeId === item.href.slice(1)
                return (
                  <motion.a
                    key={item.href}
                    variants={itemVariants}
                    href={isRoute ? item.href : resolveHash(item.href)}
                    onClick={(e) => {
                      setOpen(false)
                      if (isRoute) {
                        e.preventDefault()
                        navigate(item.href)
                      }
                    }}
                    className={`text-4xl font-extrabold tracking-tight transition-colors ${active ? 'text-brand-600' : 'text-neutral-900'
                      }`}
                  >
                    {item.label}
                  </motion.a>
                )
              })}

              <motion.a
                variants={itemVariants}
                href={`tel:${contacts.phoneRaw}`}
                onClick={() => setOpen(false)}
                className="mt-6 inline-flex items-center gap-3 text-lg font-semibold text-neutral-700"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <Phone className="h-4 w-4" />
                </span>
                {contacts.phone}
              </motion.a>

              <motion.button
                variants={itemVariants}
                onClick={() => {
                  setOpen(false)
                  openModal()
                }}
                className="group mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/30"
              >
                Напишите нам
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
