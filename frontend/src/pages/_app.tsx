import type { AppProps } from 'next/app'
import '../app/globals.css'
import { fontVariables } from '../lib/fonts'

// The site lives in the App Router (src/app). This Pages Router root exists for
// one page only: 500.tsx, which Next serves when a page fails to render on the
// server — the App Router's own error.tsx is not reached in that case. It gives
// that page the site's stylesheet and fonts.
export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${fontVariables} font-sans`}>
      <Component {...pageProps} />
    </div>
  )
}
