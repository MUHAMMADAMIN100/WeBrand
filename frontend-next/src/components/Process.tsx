'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    num: '01',
    title: 'Брифинг',
    desc: 'Изучаем ваш бизнес, цели, аудиторию и конкурентов.',
  },
  {
    num: '02',
    title: 'Стратегия',
    desc: 'Создаём план роста, визуальную концепцию и тех. задание.',
  },
  {
    num: '03',
    title: 'Реализация',
    desc: 'Разрабатываем, дизайним и запускаем — на согласованных этапах.',
  },
  {
    num: '04',
    title: 'Рост',
    desc: 'Привлекаем клиентов, измеряем результат и масштабируем.',
  },
]

export default function Process() {
  return (
    <section className="relative py-14 md:py-24 lg:py-32 bg-neutral-950 text-white overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[40rem] bg-brand-600/25 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-brand-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-20"
        >
          <span className="text-sm font-bold text-brand-400 uppercase tracking-[0.2em]">
            — Процесс
          </span>
          <h2 className="mt-5 text-5xl lg:text-7xl font-extrabold tracking-tight">
            Как мы работаем
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-neutral-400 leading-relaxed">
            Прозрачный процесс — от первой встречи до запуска и масштабирования. Без сюрпризов и срывов сроков.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -8 }}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-500/50 hover:bg-white/10 transition-all backdrop-blur-sm overflow-hidden"
            >
              <div className="absolute -top-10 -right-6 text-[10rem] font-extrabold bg-gradient-to-br from-brand-400/30 to-transparent bg-clip-text text-transparent leading-none pointer-events-none select-none">
                {step.num}
              </div>

              <div className="relative">
                <div className="inline-block text-5xl lg:text-6xl font-extrabold bg-gradient-to-br from-brand-400 to-brand-600 bg-clip-text text-transparent mb-6 group-hover:scale-110 transition-transform origin-left">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{step.desc}</p>
              </div>

              {i < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                  className="hidden lg:block absolute top-16 -right-4 w-8 h-px bg-gradient-to-r from-brand-400 to-transparent origin-left"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
