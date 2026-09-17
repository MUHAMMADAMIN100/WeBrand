import './globals.css'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Manrope, Unbounded } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Providers } from './providers'
import { SITE_URL } from '../lib/api'

// All three are self-hosted by next/font. `cyrillic` is essential — the whole
// site is in Russian, and it is the reason these faces were picked: most display
// fonts in fashion ship Latin only. Each is exposed as a CSS variable that
// tailwind.config.ts maps to `font-sans` / `font-display` / `font-mono`.
const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
})

// Headlines. A wide geometric grotesque that rhymes with the logo lockup.
const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-unbounded',
  display: 'swap',
})

// Section labels, indices, counters — not body copy, so it is not preloaded.
const jbMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jbmono',
  display: 'swap',
  preload: false,
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
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable} ${jbMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
        {/* GA4 via the official @next/third-parties — loads only when
            NEXT_PUBLIC_GA_ID is set; it handles App Router pageview tracking
            itself, so no manual gtag/route wiring is needed. */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  )
}
