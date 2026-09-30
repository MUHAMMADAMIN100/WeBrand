import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import LazyChrome from './LazyChrome'

// Shared page chrome: the Navbar + Footer around the page's content, plus the
// parts that load on demand (the two dialogs and the custom cursor — see
// LazyChrome). Kept out of the root layout on purpose so the standalone 404
// (not-found.tsx) renders without it. A server component — it just composes
// the client chrome around the server-rendered `children`.
export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      {children}
      <Footer />
      <LazyChrome />
    </div>
  )
}
