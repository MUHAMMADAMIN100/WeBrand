'use client'

import { ArrowUp, Instagram, Send } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { contacts, nav } from '../data/content'
import { useModal } from '../context/ModalContext'
import { openTelegram } from '../lib/telegram'
import Button from './ui/Button'

const linkClass =
  'rounded font-display text-xl font-bold tracking-tight text-paper transition-colors duration-300 hover:text-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950 lg:text-2xl'

export default function Footer() {
  const { open: openModal } = useModal()
  const pathname = usePathname()

  // On non-home routes, prefix hash links with "/" so they navigate home first.
  const resolveHash = (href: string) =>
    pathname === '/' ? href : '/' + href

  const socials = [
    { Icon: Send, href: contacts.socials.telegram, label: 'Telegram' },
    { Icon: Instagram, href: contacts.socials.instagram, label: 'Instagram' },
    { Icon: WhatsappIcon, href: contacts.socials.whatsapp, label: 'WhatsApp' },
  ]

  return (
    <footer className="relative isolate overflow-hidden bg-ink-950 pt-14 text-paper md:pt-20">
      <div className="mx-auto max-w-[88rem] px-5 lg:px-10">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:pb-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <a
              href={resolveHash('#top')}
              aria-label="Webrand — на главную"
              className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/main-logo-dark.png" alt="Webrand" width={388} height={81} loading="lazy" className="h-9 w-auto object-contain" />
            </a>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-paper/65">
              Комплексные digital-решения для бизнеса в Душанбе. Сайты, дизайн, SMM и продвижение.
            </p>
            <div className="mt-7 flex flex-col items-start gap-2">
              <a href={`mailto:${contacts.email}`} className="rounded text-base font-semibold text-paper transition-colors hover:text-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime">
                {contacts.email}
              </a>
              <a href={`tel:${contacts.phoneRaw}`} className="rounded text-base font-semibold text-paper transition-colors hover:text-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime">
                {contacts.phone}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-10 lg:col-span-7 lg:items-end">
            <nav aria-label="Навигация в подвале" className="flex flex-wrap gap-x-8 gap-y-4 lg:justify-end">
              {nav.map((item) =>
                item.href.startsWith('/') ? (
                  <Link key={item.href} href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                ) : (
                  <a key={item.href} href={resolveHash(item.href)} className={linkClass}>
                    {item.label}
                  </a>
                ),
              )}
              {/* Blog/News — intentionally not in the header nav, but linked here
                  so crawlers can discover the /news section. */}
              <Link href="/news" className={linkClass}>
                Блог
              </Link>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="lime" size="lg" onClick={() => openModal()}>
                Напишите нам
              </Button>
              <ul className="flex gap-2">
                {socials.map(({ Icon, href, label }) => (
                  <li key={label}>
                    {/* openTelegram is a no-op for anything that is not a t.me link. */}
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={openTelegram}
                      aria-label={label}
                      className="grid h-14 w-14 place-items-center rounded-full border border-white/20 text-paper transition-colors duration-300 ease-expo hover:border-lime hover:bg-lime hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-7 text-sm text-paper/65">
          <p>© {new Date().getFullYear()} «ВиБренд». Все права защищены.</p>
          <div className="flex items-center gap-5">
            <p>Создано с любовью в Душанбе.</p>
            <a
              href={resolveHash('#top')}
              aria-label="Наверх"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-paper transition-colors duration-300 ease-expo hover:border-lime hover:bg-lime hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* The wordmark as texture: tone on tone, oversized, cropped by the frame.
          Drawn by a pseudo-element (globals.css) because it is decoration, not
          content — as real text it is a 1.1:1 "contrast failure" to every
          accessibility checker, aria-hidden or not. */}
      <div aria-hidden="true" className="footer-wordmark" />
    </footer>
  )
}

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.2-.7.1c-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1-1.1 2.6 0 1.5 1.1 3 1.3 3.2.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.5.2-.7.2-1.4.2-1.5-.1-.1-.3-.2-.5-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.2-1.4c1.4.8 3 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.2.8.9-3.1-.2-.3c-.9-1.4-1.3-3-1.3-4.6 0-4.5 3.7-8.2 8.2-8.2s8.2 3.7 8.2 8.2c.1 4.6-3.6 8.6-8.1 8.6z" />
    </svg>
  )
}
