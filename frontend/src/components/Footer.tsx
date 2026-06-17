'use client'

import { motion } from 'framer-motion'
import { Instagram, Send, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { contacts, nav } from '../data/content'
import { useModal } from '../context/ModalContext'

export default function Footer() {
  const { open: openModal } = useModal()
  const pathname = usePathname()

  // On non-home routes, prefix hash links with "/" so they navigate home first.
  const resolveHash = (href: string) =>
    pathname === '/' ? href : '/' + href

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 pt-12 pb-8 md:pt-20 md:pb-10">
      <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 mb-10 pb-10 md:gap-12 md:mb-16 md:pb-16 border-b border-neutral-200">
          <div>
            <a href={resolveHash('#top')} className="inline-flex items-center group">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src="/logos/main-logo.png"
                alt="Webrand"
                width={388}
                height={81}
                className="h-12 w-auto object-contain"
              />
            </a>
            <p className="mt-6 max-w-md text-neutral-600 text-lg leading-relaxed">
              Комплексные digital-решения для бизнеса в Душанбе. Сайты, дизайн, SMM и продвижение.
            </p>

            <div className="mt-8 space-y-2">
              <a
                href={`mailto:${contacts.email}`}
                className="block text-neutral-700 hover:text-brand-600 transition-colors font-medium"
              >
                {contacts.email}
              </a>
              <a
                href={`tel:${contacts.phoneRaw}`}
                className="block text-neutral-700 hover:text-brand-600 transition-colors font-medium"
              >
                {contacts.phone}
              </a>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-6 md:gap-8">
            <nav className="flex flex-wrap gap-x-8 gap-y-3">
              {nav.map((item) => {
                const className =
                  'text-neutral-700 hover:text-brand-600 transition-colors font-semibold'
                return item.href.startsWith('/') ? (
                  <Link key={item.href} href={item.href} className={className}>
                    {item.label}
                  </Link>
                ) : (
                  <a key={item.href} href={resolveHash(item.href)} className={className}>
                    {item.label}
                  </a>
                )
              })}
              {/* Blog/News — intentionally not in the header nav, but linked here
                  so crawlers can discover the /news section. */}
              <Link
                href="/news"
                className="text-neutral-700 hover:text-brand-600 transition-colors font-semibold"
              >
                Блог
              </Link>
            </nav>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openModal()}
              className="px-8 py-4 rounded-full bg-neutral-900 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Напишите нам
            </motion.button>

            <div className="flex gap-3">
              {[
                { Icon: Send, href: contacts.socials.telegram, label: 'Telegram' },
                { Icon: Instagram, href: contacts.socials.instagram, label: 'Instagram' },
                { Icon: WhatsappIcon, href: contacts.socials.whatsapp, label: 'WhatsApp' },
              ].map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-11 h-11 rounded-full bg-white border border-neutral-200 hover:border-brand-600 hover:text-brand-600 flex items-center justify-center text-neutral-700 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} «ВиБренд». Все права защищены.</p>
          <div className="flex items-center gap-6">
            <p>Создано с любовью в Душанбе.</p>
            <motion.a
              whileHover={{ y: -3 }}
              href={resolveHash('#top')}
              className="w-10 h-10 rounded-full bg-white border border-neutral-200 hover:border-brand-600 hover:text-brand-600 flex items-center justify-center transition-colors"
              aria-label="Наверх"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.a>
          </div>
        </div>
      </div>
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
