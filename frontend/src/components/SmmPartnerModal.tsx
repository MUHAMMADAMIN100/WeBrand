'use client'

import { TrendingUp } from 'lucide-react'
import type { Partner } from '../lib/api'
import LogoOrInitials from './SmmPartnerLogo'
import Button from './ui/Button'
import Dialog, { DialogHeader } from './ui/Dialog'

/** The details dialog of a partner card. Its own file so that it — and the
 *  dialog machinery it needs — loads when a card is first opened, not with the
 *  page (see SmmPartners). */
export default function PartnerModal({ partner, onClose }: { partner: Partner | null; onClose: () => void }) {
  return (
    <Dialog open={!!partner} onClose={onClose} labelledBy="partner-modal-title" className="max-w-lg">
      {partner && (
        <>
          <DialogHeader>
            <div className="flex items-center gap-4">
              <LogoOrInitials
                key={partner.id}
                partner={partner}
                className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-2"
                imgClassName="h-auto max-h-12 w-auto max-w-12 object-contain"
                initialsClassName="font-display text-xl font-black text-brand-600"
              />
              <div className="min-w-0">
                <h2
                  id="partner-modal-title"
                  className="font-display text-2xl font-black leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-3xl"
                >
                  {partner.name}
                </h2>
                {partner.niche && (
                  <p className="mt-2.5 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{partner.niche}</p>
                )}
              </div>
            </div>
          </DialogHeader>

          {(partner.result || partner.description) && (
            <div className="space-y-6 p-6 sm:p-9">
              {partner.result && (
                <div className="flex items-start gap-3.5 rounded-2xl bg-lime-soft p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-ink-950">
                    <TrendingUp className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink-600">Результат</h3>
                    <p className="mt-0.5 font-semibold text-ink-950">{partner.result}</p>
                  </div>
                </div>
              )}

              {partner.description && (
                <div>
                  <h3 className="mb-2 font-display text-base font-bold text-ink-950">О компании</h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700 sm:text-base">{partner.description}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end border-t border-ink-100 px-6 py-4 sm:px-9">
            <Button variant="ink" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </>
      )}
    </Dialog>
  )
}
