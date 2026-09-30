'use client'

import { useEffect, useRef } from 'react'
import { useModal } from '../context/ModalContext'
import { useCapabilities } from '../lib/capabilities'
import { useLazy } from '../lib/useLazy'

const loadContactModal = () => import('./ContactModal')
const loadServiceDetailModal = () => import('./ServiceDetailModal')
const loadCursor = () => import('./motion/Cursor')

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
  cancelIdleCallback?: (id: number) => void
}

/** Run `task` once the browser has nothing better to do. Returns a canceller. */
function whenIdle(task: () => void, timeout: number): () => void {
  const w = window as IdleWindow
  if (w.requestIdleCallback && w.cancelIdleCallback) {
    const id = w.requestIdleCallback(task, { timeout })
    return () => w.cancelIdleCallback?.(id)
  }
  const id = window.setTimeout(task, Math.min(timeout, 1500))
  return () => window.clearTimeout(id)
}

/** The parts of the page chrome nobody needs in order to read the page or to
 *  press its first button: the two dialogs (with the thousand-line lead form)
 *  and the custom cursor. They used to be in every page's bundle, in front of
 *  the first interaction; now each is a chunk of its own.
 *
 *  - A dialog's code is fetched once the page has gone quiet, and it is mounted
 *    (closed) as soon as it arrives — so a click normally opens it in the same
 *    frame, exactly as when it was bundled.
 *  - A click that beats the fetch is answered at once with the dialog's own ink
 *    backdrop; the dialog follows as soon as its code is in.
 *  - If the code cannot be fetched at all, the lead form's click goes to /brief
 *    — the same form as a page — rather than leaving a dead button.
 *  - The cursor exists only where `rich` is true (a real mouse, no
 *    reduced-motion, no save-data); phones never download it. */
export default function LazyChrome() {
  const { isOpen, close, serviceDetail, closeServiceDetail } = useModal()
  const { rich, saveData } = useCapabilities()

  // The latest `isOpen`, for the error callback below (which outlives a render).
  const isOpenRef = useRef(isOpen)
  isOpenRef.current = isOpen

  const [ContactModal, loadContact] = useLazy(loadContactModal, () => {
    if (isOpenRef.current) window.location.assign('/brief')
  })
  const [ServiceDetailModal, loadDetail] = useLazy(loadServiceDetailModal, closeServiceDetail)
  const [Cursor, loadCursorNow] = useLazy(loadCursor)

  // Asked for: fetch now if it is not here yet.
  useEffect(() => {
    if (isOpen) loadContact()
  }, [isOpen, loadContact])
  useEffect(() => {
    if (serviceDetail) loadDetail()
  }, [serviceDetail, loadDetail])

  // Not asked for yet: fetch ahead, when it costs nothing. Not under Save-Data.
  useEffect(() => {
    if (saveData) return
    return whenIdle(() => {
      loadContact()
      // Only the home page has service cards to open this one from.
      if (document.querySelector('[data-service-card]')) loadDetail()
    }, 4000)
  }, [saveData, loadContact, loadDetail])

  useEffect(() => {
    if (!rich) return
    return whenIdle(loadCursorNow, 3000)
  }, [rich, loadCursorNow])

  return (
    <>
      {ContactModal ? <ContactModal /> : isOpen && <Backdrop onClick={close} />}
      {ServiceDetailModal ? <ServiceDetailModal /> : serviceDetail && <Backdrop onClick={closeServiceDetail} />}
      {Cursor && rich && <Cursor />}
    </>
  )
}

/** What is on screen between a click and the dialog's code arriving: the same
 *  ink backdrop the dialog itself opens with. A click on it takes the request
 *  back, as it does on the real one. */
function Backdrop({ onClick }: { onClick: () => void }) {
  return <div onClick={onClick} className="fixed inset-0 z-[100] bg-ink-950/70 lg:backdrop-blur-sm" aria-hidden="true" />
}
