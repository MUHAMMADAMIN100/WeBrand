import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import { Providers } from './providers'
import { SITE_URL } from '../lib/api'

// Manrope, self-hosted by next/font. `cyrillic` is essential — the whole site
// is in Russian. Exposed as the --font-manrope CSS variable so Tailwind's
// `font-sans` (see tailwind.config.ts) resolves to it.
const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Webrand — Комплексные digital-решения для бизнеса',
  description:
    'Webrand — digital-агентство в Душанбе. Разработка сайтов, дизайн и брендинг, SMM, эквайринг и продвижение для бизнеса.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/logos/favicon-logo.png' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#2B5ED3',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
