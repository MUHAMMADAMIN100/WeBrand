import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import ContactModal from './ContactModal'
import ServiceDetailModal from './ServiceDetailModal'

// Shared page chrome: the Navbar + Footer + the two always-mounted modals that
// every real page in the Vite app rendered around its content. Kept out of the
// root layout on purpose so the standalone 404 (not-found.tsx) renders without
// it. A server component — it just composes the client chrome around the
// server-rendered `children`.
export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />
      {children}
      <Footer />
      <ContactModal />
      <ServiceDetailModal />
    </div>
  )
}
