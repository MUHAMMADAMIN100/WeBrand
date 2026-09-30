import './globals.css'
import type { Metadata, Viewport } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Providers } from './providers'
import { SITE_URL } from '../lib/api'
import { fontVariables } from '../lib/fonts'

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

// Runs before first paint, so the intro curtain is either there from the very
// first frame or never at all — no flash, and nothing for React to hydrate
// differently (the flag lives on <html>, hence suppressHydrationWarning there).
// Once per tab session; never under reduced motion; if storage is blocked it
// simply does not play. Without JS the attribute is absent and CSS hides it.
const INTRO_FLAG = `(function(){var d=document.documentElement;try{if(matchMedia('(prefers-reduced-motion: reduce)').matches||sessionStorage.getItem('wb:intro')){d.dataset.intro='seen'}else{sessionStorage.setItem('wb:intro','1');d.dataset.intro='play'}}catch(e){d.dataset.intro='seen'}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_FLAG }} />
      </head>
      <body>
        {/* The intro: CSS-only (globals.css). Shown only while html[data-intro="play"]. */}
        <div className="intro" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/main-logo-dark.png" alt="" width={388} height={81} className="intro-logo" />
        </div>
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
