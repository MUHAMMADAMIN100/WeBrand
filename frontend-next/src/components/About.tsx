'use client'

import { motion } from 'framer-motion'
import { Zap, Target, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { useModal } from '../context/ModalContext'

const values = [
  {
    icon: Zap,
    title: 'Скорость',
    desc: 'Запускаем проекты быстро без потери качества — от идеи до релиза.',
  },
  {
    icon: Target,
    title: 'Результат',
    desc: 'Каждое решение работает на рост вашего бизнеса и приносит прибыль.',
  },
  {
    icon: Users,
    title: 'Команда',
    desc: 'Разработчики, дизайнеры и маркетологи — всё под одной крышей.',
  },
  {
    icon: TrendingUp,
    title: 'Рост',
    desc: 'Не просто запускаем, а сопровождаем и помогаем масштабироваться.',
  },
]

export default function About() {
  const { open: openModal } = useModal()
  return (
    <section id="about" className="relative anchor-target py-14 md:py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-sm font-bold text-brand-600 uppercase tracking-[0.2em]">
              — О компании
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.1]">
              Делаем <span className="text-brand-600">сильные</span> бренды для бизнеса
            </h2>
            <p className="mt-8 text-base text-neutral-600 leading-relaxed">
              Webrand — digital-агентство полного цикла. Мы помогаем бизнесу расти через современные сайты, сильный бренд и эффективный маркетинг.
            </p>
            <p className="mt-4 text-base text-neutral-600 leading-relaxed">
              Среди наших клиентов — компании из самых разных ниш: медицина, e-commerce, рестораны, мебель и услуги. Каждому подбираем индивидуальный подход и стратегию роста.
            </p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openModal()}
              className="mt-8 md:mt-10 inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-neutral-900 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Обсудить проект
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group p-6 lg:p-7 rounded-3xl bg-gradient-to-br from-neutral-50 to-white border border-neutral-100 hover:border-brand-600 hover:shadow-xl hover:shadow-brand-600/5 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg shadow-brand-600/30">
                  <v.icon className="w-7 h-7" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-neutral-900">{v.title}</h3>
                <p className="mt-2 text-neutral-600 leading-relaxed text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
