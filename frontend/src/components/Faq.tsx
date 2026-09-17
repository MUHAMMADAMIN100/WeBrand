'use client'

import { useId, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { faq } from '../data/content'
import { useModal } from '../context/ModalContext'
import { cn } from '../lib/utils'
import Button from './ui/Button'
import RevealText from './motion/RevealText'

export default function Faq() {
  const { open: openModal } = useModal()
  const uid = useId()
  // One answer open at a time; the first starts open so the pattern is obvious.
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="anchor-target relative py-16 md:py-24 lg:py-32">
      <div className="mx-auto grid max-w-[88rem] gap-10 px-5 lg:grid-cols-12 lg:gap-10 lg:px-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <RevealText as="h2" className="font-display text-display-xl font-black text-ink-950">
              Частые вопросы
            </RevealText>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-ink-600">
              Не нашли ответ? Напишите — расскажем про ваш случай.
            </p>
            <div className="mt-7">
              <Button variant="outline" size="lg" onClick={() => openModal()}>
                Задать вопрос
              </Button>
            </div>
          </div>
        </div>

        <ul className="border-t border-ink-200 lg:col-span-7">
          {faq.map((item, i) => {
            const expanded = open === i
            const panelId = `${uid}-panel-${i}`
            const buttonId = `${uid}-button-${i}`
            return (
              <li key={item.q} className="border-b border-ink-200">
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 rounded-lg py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-4 focus-visible:ring-offset-paper lg:py-6"
                  >
                    <span className="font-display text-lg font-bold leading-snug tracking-tight text-ink-950 lg:text-xl">
                      {item.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-500 ease-expo',
                        expanded
                          ? 'rotate-45 border-ink-950 bg-ink-950 text-lime'
                          : 'border-ink-200 bg-white text-ink-950 group-hover:border-ink-950',
                      )}
                    >
                      <Plus className="h-5 w-5" />
                    </span>
                  </button>
                </h3>
                {/* Collapsed answers stay in the HTML (height 0), they are not
                    unmounted: crawlers read them, and the FAQPage structured data
                    on the home page must match text that is really on the page. */}
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!expanded}
                  initial={false}
                  animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 pr-14 text-base leading-relaxed text-ink-600 lg:pb-7 lg:text-lg">
                    {item.a}
                  </p>
                </motion.div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
