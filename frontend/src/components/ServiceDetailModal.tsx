'use client'

import { ArrowRight, Check, Clock, Target } from 'lucide-react'
import { useModal } from '../context/ModalContext'
import { directionsForService } from './ContactForm'
import Button from './ui/Button'
import Dialog, { DialogHeader } from './ui/Dialog'

export default function ServiceDetailModal() {
  const { serviceDetail, closeServiceDetail, open: openContact } = useModal()

  const handleOrder = () => {
    const preselect = serviceDetail ? directionsForService(serviceDetail.parent) : []
    closeServiceDetail()
    setTimeout(() => openContact(preselect), 200)
  }

  return (
    <Dialog open={!!serviceDetail} onClose={closeServiceDetail} labelledBy="sdm-title" className="max-w-2xl">
      {serviceDetail && (
        <>
          <DialogHeader>
            <p className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">{serviceDetail.parent}</p>
            <h2
              id="sdm-title"
              className="mt-4 font-display text-2xl font-black leading-[1.08] tracking-tight [overflow-wrap:anywhere] sm:text-3xl lg:text-4xl"
            >
              {serviceDetail.sub.title}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">{serviceDetail.sub.short}</p>
          </DialogHeader>

          <div className="space-y-8 p-6 sm:p-9">
            <p className="text-[15px] leading-relaxed text-ink-700 sm:text-base">{serviceDetail.sub.description}</p>

            <div>
              <h3 className="mb-4 font-display text-base font-bold text-ink-950">Что входит</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {serviceDetail.sub.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-ink-950">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime text-ink-950">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="text-[15px] leading-relaxed sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-paper p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-600">
                  <Clock className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  Срок
                </h3>
                <p className="mt-2 font-semibold text-ink-950">{serviceDetail.sub.timeline}</p>
              </div>
              <div className="rounded-2xl bg-paper p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-600">
                  <Target className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  Кому подходит
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-950">{serviceDetail.sub.bestFor}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <Button variant="ink" size="lg" onClick={handleOrder} className="flex-1">
                Заказать эту услугу
                <ArrowRight
                  className="h-5 w-5 transition-transform duration-300 ease-expo group-hover/btn:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
              <Button variant="outline" size="lg" onClick={closeServiceDetail}>
                Закрыть
              </Button>
            </div>
          </div>
        </>
      )}
    </Dialog>
  )
}
