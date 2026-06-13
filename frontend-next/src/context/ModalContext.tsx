'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { SubService } from '../data/content'

export type ServiceDetailPayload = {
  parent: string
  sub: SubService
}

export type ApplyTarget = {
  /** Vacancy slug — sent to the API as `role`. */
  role: string
  /** Human title for the form heading (e.g. "Frontend-разработчик"). */
  title: string
  /** Applicant requirements set on the vacancy (shown to the candidate). */
  experienceRequired?: string
  ageMin?: number | null
  ageMax?: number | null
}

type ModalContextType = {
  // Contact modal
  isOpen: boolean
  open: (preselect?: string[]) => void
  close: () => void
  /** Direction ids to pre-select in the contact form (e.g. ["dev"]). */
  contactPreselect: string[]

  // Job-application mode (same modal, application flow + role)
  openApply: (target: ApplyTarget) => void
  /** Set when the modal is opened to apply for a vacancy; null for a normal lead. */
  applyTarget: ApplyTarget | null

  // Service detail modal
  serviceDetail: ServiceDetailPayload | null
  openServiceDetail: (payload: ServiceDetailPayload) => void
  closeServiceDetail: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [contactPreselect, setContactPreselect] = useState<string[]>([])
  const [applyTarget, setApplyTarget] = useState<ApplyTarget | null>(null)
  const [serviceDetail, setServiceDetail] = useState<ServiceDetailPayload | null>(null)

  const open = useCallback((preselect?: string[]) => {
    // Guard: callers often pass `open` straight to onClick, which would hand us
    // a MouseEvent — only honour an actual array of direction ids.
    setContactPreselect(Array.isArray(preselect) ? preselect : [])
    setApplyTarget(null) // normal lead, not a job application
    setIsOpen(true)
  }, [])
  const openApply = useCallback((target: ApplyTarget) => {
    setContactPreselect([])
    setApplyTarget(target)
    setIsOpen(true)
  }, [])
  const close = useCallback(() => setIsOpen(false), [])

  const openServiceDetail = useCallback((payload: ServiceDetailPayload) => {
    setServiceDetail(payload)
  }, [])
  const closeServiceDetail = useCallback(() => setServiceDetail(null), [])

  return (
    <ModalContext.Provider
      value={{ isOpen, open, close, contactPreselect, openApply, applyTarget, serviceDetail, openServiceDetail, closeServiceDetail }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used inside ModalProvider')
  return ctx
}
