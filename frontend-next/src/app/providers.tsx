'use client'

import type { ReactNode } from 'react'
import { ModalProvider } from '../context/ModalContext'

// Client boundary that provides the shared modal context to the whole tree.
// The modal components themselves are mounted per-page (via SiteShell) so the
// standalone 404 page stays free of site chrome — matching the Vite app.
export function Providers({ children }: { children: ReactNode }) {
  return <ModalProvider>{children}</ModalProvider>
}
