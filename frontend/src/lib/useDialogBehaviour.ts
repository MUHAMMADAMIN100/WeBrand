import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** What every modal of the site owes the person using it, in one place:
 *  the page behind stops scrolling, focus moves into the dialog and comes back
 *  to whatever opened it, Tab stays inside, Esc closes.
 *
 *  Keys are heard on the document, not on the dialog: focus can drop to <body>
 *  while the dialog is open (the submit button unmounts when the form turns into
 *  its "sent" screen), and a listener on the dialog would go deaf right then.
 *  The document hears a key after React's own handlers have run, so a child
 *  that already used it — Esc closing the form's custom select, whose list is
 *  portalled to <body> — has marked it `defaultPrevented`, and one press never
 *  closes two things. */
export function useDialogBehaviour(open: boolean, onClose: () => void, panelRef: RefObject<HTMLElement | null>) {
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Lock body scroll while open (SmoothScroll pauses Lenis off the same signal).
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Focus the dialog on open; hand focus back to the trigger on close.
  useEffect(() => {
    if (!open) return
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    const t = setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 60)
    return () => {
      clearTimeout(t)
      restoreFocusRef.current?.focus?.({ preventScroll: true })
    }
  }, [open, panelRef])

  // Esc to close + focus trap.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      const panel = panelRef.current
      if (e.key !== 'Tab' || !panel) return
      // Visible and in the tab order: not the hidden file inputs, not the honeypot.
      const nodes = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null && n.tabIndex >= 0)
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      // Focus that is not on a control inside the panel — on <body>, or in a
      // portalled list that has just closed — is brought in, never let out to
      // the page behind. (On the panel itself a forward Tab needs no help.)
      const lost = !active || !panel.contains(active)
      if (e.shiftKey ? active === first || active === panel || lost : active === last || lost) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, panelRef])
}
