import { Manrope, Unbounded } from 'next/font/google'

// Both are self-hosted by next/font. `cyrillic` is essential — the whole site
// is in Russian, and it is the reason these faces were picked: most display
// fonts in fashion ship Latin only. Each is exposed as a CSS variable that
// tailwind.config.ts maps to `font-sans` / `font-display`.
//
// Defined once, here, because two roots use them: the App Router layout and the
// Pages Router `_app` that exists only to style the 500 page. next/font emits
// one set of files however many modules import these.
export const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
})

// Headlines. A wide geometric grotesque that rhymes with the logo lockup.
// Loaded as a variable font (no `weight` list) so the full 200–900 axis is
// available — the hero animates it.
export const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-unbounded',
  display: 'swap',
})

export const fontVariables = `${manrope.variable} ${unbounded.variable}`
