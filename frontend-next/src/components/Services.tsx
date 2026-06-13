'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { services, contacts, type Service, type SubService } from '../data/content'
import { useModal } from '../context/ModalContext'
import { directionsForService } from './ContactForm'

export default function Services() {
  const { open: openModal, openServiceDetail } = useModal()
  const reduce = useReducedMotion()

  return (
    <section
      id="services"
      className="relative anchor-target snap-start min-h-dvh py-14 md:py-24 lg:py-32 bg-gradient-to-b from-white via-brand-50/30 to-white overflow-hidden"
    >
      <div className="absolute top-20 -right-40 w-[30rem] h-[30rem] bg-brand-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-10 md:mb-16 flex-wrap gap-6"
        >
          <div>
            <span className="text-sm font-bold text-brand-600 uppercase tracking-[0.2em]">
              — Услуги
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.05]">
              Что мы делаем
            </h2>
          </div>
          <p className="max-w-md text-base text-neutral-600 leading-relaxed">
            Кликните на любую подуслугу — расскажем подробно.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={i}
              onOrder={() => openModal(directionsForService(service.title))}
              onSubClick={(sub) =>
                openServiceDetail({ parent: service.title, sub })
              }
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 md:mt-16 flex flex-col items-center"
        >
          <motion.a
            href={contacts.telegram}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group px-10 py-5 rounded-full bg-neutral-900 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-shadow inline-flex items-center gap-3"
          >
            Написать в TG
            <motion.span
              animate={reduce ? undefined : { x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.a>
          <p className="mt-3 text-sm text-neutral-500">Ответим быстро.</p>
        </motion.div>
      </div>
    </section>
  )
}

type CardProps = {
  service: Service
  index: number
  onOrder: () => void
  onSubClick: (sub: SubService) => void
}

function ServiceCard({ service, index, onOrder, onSubClick }: CardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover="hover"
      className="group relative p-8 lg:p-10 rounded-3xl bg-white border border-neutral-200 hover:border-brand-600 transition-all duration-500 overflow-hidden"
    >
      <motion.div
        variants={{ hover: { opacity: 1 } }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-800 pointer-events-none"
      />

      <motion.span
        variants={{ hover: { scale: 1.2, opacity: 0.1, color: '#FFFFFF' } }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 right-8 text-9xl font-extrabold text-neutral-100 group-hover:text-white/10 transition-colors pointer-events-none leading-none select-none"
      >
        {service.number}
      </motion.span>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <span className="text-sm font-bold text-brand-600 group-hover:text-white/80 transition-colors uppercase tracking-widest">
            {service.number}
          </span>
          <motion.button
            type="button"
            onClick={onOrder}
            aria-label="Заказать услугу"
            variants={{ hover: { rotate: 45, scale: 1.1 } }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-12 h-12 rounded-full bg-neutral-100 group-hover:bg-white flex items-center justify-center transition-colors cursor-pointer relative z-20"
          >
            <ArrowUpRight className="w-5 h-5 text-neutral-900 group-hover:text-brand-600" />
          </motion.button>
        </div>

        <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 group-hover:text-white transition-colors mb-3 leading-tight">
          {service.title}
        </h3>
        <p className="text-neutral-600 group-hover:text-white/90 transition-colors text-base leading-relaxed mb-5">
          {service.description}
        </p>

        <ul className="space-y-1.5 pt-5 border-t border-neutral-100 group-hover:border-white/20 transition-colors">
          {service.items.map((sub) => (
            <li key={sub.id}>
              <button
                type="button"
                onClick={() => onSubClick(sub)}
                className="group/sub w-full flex items-center justify-between gap-3 py-2.5 px-3 -mx-3 rounded-xl text-left hover:bg-brand-50 group-hover:hover:bg-white/15 transition-colors"
              >
                <span className="flex items-center gap-3 text-neutral-800 group-hover:text-white/95 transition-colors text-sm sm:text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 group-hover:bg-white shrink-0 transition-colors" />
                  <span className="font-medium">{sub.title}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-white/70 group-hover/sub:translate-x-1 transition-all shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  )
}
