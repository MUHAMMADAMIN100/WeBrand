'use client'

import { useModal } from '../context/ModalContext'
import Button from './ui/Button'
import Magnetic from './motion/Magnetic'
import RevealText from './motion/RevealText'
import ScrollFillText from './motion/ScrollFillText'

const values = [
  { title: 'Скорость', desc: 'Запускаем проекты быстро без потери качества — от идеи до релиза.' },
  { title: 'Результат', desc: 'Каждое решение работает на рост вашего бизнеса и приносит прибыль.' },
  { title: 'Команда', desc: 'Разработчики, дизайнеры и маркетологи — всё под одной крышей.' },
  { title: 'Рост', desc: 'Не просто запускаем, а сопровождаем и помогаем масштабироваться.' },
]

export default function About() {
  const { open: openModal } = useModal()

  return (
    <section id="about" className="anchor-target relative py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-[88rem] px-5 lg:px-10">
        <RevealText as="h2" className="max-w-5xl font-display text-display-xl font-black text-ink-950">
          Делаем сильные бренды для бизнеса
        </RevealText>

        <div className="mt-10 grid gap-12 md:mt-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            {/* The agency's one-line pitch, set large; it fills in as it is read. */}
            <ScrollFillText
              className="font-display text-display-md font-medium text-ink-950"
              text="Webrand — digital-агентство полного цикла. Мы помогаем бизнесу расти через современные сайты, сильный бренд и эффективный маркетинг."
            />
            <p className="mt-8 max-w-xl text-base leading-relaxed text-ink-600 lg:text-lg">
              Среди наших клиентов — компании из самых разных ниш: медицина, e-commerce, рестораны,
              мебель и услуги. Каждому подбираем индивидуальный подход и стратегию роста.
            </p>
            <div className="mt-9">
              <Magnetic>
                <Button size="lg" variant="ink" onClick={() => openModal()}>
                  Обсудить проект
                </Button>
              </Magnetic>
            </div>
          </div>

          {/* A ledger, not four icon cards: name on the left, what it means on
              the right, hairlines between. */}
          <dl className="border-t border-ink-200 lg:col-span-5 lg:self-end">
            {values.map((v) => (
              <div key={v.title} className="grid gap-1 border-b border-ink-200 py-5 sm:grid-cols-[9.5rem_1fr] sm:gap-6 lg:py-6">
                <dt className="font-display text-lg font-bold tracking-tight text-ink-950">{v.title}</dt>
                <dd className="text-base leading-relaxed text-ink-600">{v.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
