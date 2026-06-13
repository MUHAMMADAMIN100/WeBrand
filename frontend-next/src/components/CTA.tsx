'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Mail, Phone, Send } from 'lucide-react'
import { contacts } from '../data/content'
import { useModal } from '../context/ModalContext'

export default function CTA() {
  const { open: openModal } = useModal()
  const reduce = useReducedMotion()
  return (
    <section id="cta" className="relative py-14 md:py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-7 md:p-10 lg:p-20"
        >
          {/* Decor */}
          <motion.div
            animate={reduce ? undefined : {
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={reduce ? undefined : {
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-brand-900/40 rounded-full blur-3xl"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

          <div className="relative grid lg:grid-cols-5 gap-8 md:gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm font-semibold text-white mb-6"
              >
                <span className={`w-2 h-2 rounded-full bg-emerald-400 ${reduce ? '' : 'animate-pulse'}`} />
                Свободны для новых проектов
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.05] text-balance"
              >
                Готовы вырасти?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-5 text-lg text-white/80 max-w-lg leading-relaxed"
              >
                Расскажите о вашем проекте — обсудим стратегию, цели и план запуска. Первая консультация бесплатно.
              </motion.p>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-3">
              <motion.button
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal()}
                className="group flex items-center justify-between p-5 rounded-2xl bg-white text-neutral-900 shadow-xl text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">
                      Оставить заявку
                    </div>
                    <div className="font-bold">Написать сейчас</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.a
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                href={`tel:${contacts.phoneRaw}`}
                className="group flex items-center justify-between p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-white/70 uppercase tracking-wider">
                      Позвонить
                    </div>
                    <div className="font-bold">{contacts.phone}</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <motion.a
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                href={`mailto:${contacts.email}`}
                className="group flex items-center justify-between p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-white/70 uppercase tracking-wider">
                      Email
                    </div>
                    <div className="font-bold">{contacts.email}</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
