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

// A press on a button the scripts have not reached yet is not lost.
//
// The page is server-rendered, so its buttons are on screen before the code
// that answers them has loaded — and on a slow or lossy connection that gap can
// be seconds. This runs first, before any of that code: it remembers the last
// button pressed in the gap, marks it (`data-pending`, styled in globals.css)
// so the press is visibly taken, and clicks it again once React can answer.
// Links need none of this — they navigate on their own.
//
// "Can answer" is two things, and the order matters:
//   - the root has been committed: <html data-hydrated>, set by Providers in a
//     layout effect. Until then React drops a click, even on a node it has
//     already touched while rendering;
//   - React has attached to that button: it marks the DOM nodes it hydrates
//     with a `__reactProps$…` property. For a button inside a section that
//     loads later (HomeSections) this comes after the root.
// A press React can already answer is left alone. One it answers by hydrating
// the section on the spot (it does that for a click on a loaded but not yet
// hydrated section) is recognised a tick later and not replayed. A press older
// than 15 s is dropped rather than replayed out of nowhere.
const EARLY_CLICKS = `(function(){var d=document,h=d.documentElement,p=null,t=0,n=0;function alive(e){return Object.keys(e).some(function(k){return k.lastIndexOf('__reactProps$',0)===0})}function ready(e){return h.hasAttribute('data-hydrated')&&alive(e)}function hold(e){if(p&&p!==e)p.removeAttribute('data-pending');p=e;t=Date.now();e.setAttribute('data-pending','')}d.addEventListener('click',function(ev){var e=ev.target&&ev.target.closest&&ev.target.closest('button');if(!e||e.disabled||ready(e))return;if(!h.hasAttribute('data-hydrated')){hold(e);return}setTimeout(function(){if(!alive(e))hold(e)},0)},true);var i=setInterval(function(){if(++n>600){clearInterval(i);if(p)p.removeAttribute('data-pending');return}if(!p)return;if(!p.isConnected){p=null;return}if(ready(p)){var e=p;p=null;e.removeAttribute('data-pending');if(Date.now()-t<15000)e.click()}},100)})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_FLAG }} />
        <script dangerouslySetInnerHTML={{ __html: EARLY_CLICKS }} />
      </head>
      <body>
        {/* The intro: CSS-only (globals.css). Shown only while html[data-intro="play"]. */}
        <div className="intro" aria-hidden="true">
          {/* The logo is a CSS background (globals.css), fetched only when the
              curtain actually plays. */}
          <div className="intro-logo" />
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
