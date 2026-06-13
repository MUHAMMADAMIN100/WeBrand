'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { partners, type Partner } from '../data/content'

export default function Partners() {
  const reduce = useReducedMotion()

  // Split across two rows by parity so each row carries a distinct,
  // width-balanced mix of logos (wide and narrow marks alternate).
  const row1 = partners.filter((_, i) => i % 2 === 0)
  const row2 = partners.filter((_, i) => i % 2 === 1)

  return (
    <section className="relative py-14 md:py-24 lg:py-32 overflow-hidden bg-neutral-50">
      {/* Single soft brand-tinted glow for depth behind the logo wall */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[460px] bg-[radial-gradient(55%_60%_at_50%_50%,rgba(43,94,211,0.07),transparent_72%)]"
      />

      <div className="relative max-w-7xl mx-auto px-5 md:px-6 lg:px-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="text-sm font-bold text-brand-600 uppercase tracking-[0.2em]">
            — Партнёры
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.05]">
            Нам доверяют
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-base text-neutral-600 leading-relaxed">
            Компании из разных отраслей выбирают Webrand для роста своего бизнеса.
          </p>
        </motion.div>
      </div>

      {reduce ? (
        /* Reduced motion: calm, static, centered wall — full-color logos, no autoscroll */
        <motion.div
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-5"
        >
          {partners.map((p, i) => (
            <PartnerCard key={`s-${i}`} partner={p} grid reduce />
          ))}
        </motion.div>
      ) : (
        <div className="relative mask-fade-edges space-y-5 py-10">
          {/* py-10 gives this masked band vertical slack so a hovered card's lift +
              scale never reaches the mask-clip (border-box) top/bottom edge */}
          {/* Row 1 — scrolls left */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="group/row flex w-max animate-marquee hover:[animation-play-state:paused]"
              style={{ animationDuration: '40s' }}
            >
              {[...row1, ...row1].map((p, i) => (
                <PartnerCard key={`a-${i}`} partner={p} />
              ))}
            </div>
          </motion.div>

          {/* Row 2 — scrolls right, faster, for opposing parallax */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="group/row flex w-max animate-marquee-reverse hover:[animation-play-state:paused]"
              style={{ animationDuration: '30s' }}
            >
              {[...row2, ...row2].map((p, i) => (
                <PartnerCard key={`b-${i}`} partner={p} />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </section>
  )
}

function PartnerCard({
  partner,
  grid = false,
  reduce = false,
}: {
  partner: Partner
  grid?: boolean
  reduce?: boolean
}) {
  const [imgError, setImgError] = useState(false)
  const showLogo = partner.logo && !imgError
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -8, scale: 1.06 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`group/card relative shrink-0 h-28 w-52 rounded-2xl bg-white flex items-center justify-center
          border border-neutral-200/80
          shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_28px_-14px_rgba(16,24,40,0.18)]
          transition-[box-shadow,border-color,transform] duration-300 ease-out
          hover:z-10 hover:-translate-y-1 hover:border-brand-200
          hover:shadow-[0_6px_14px_-4px_rgba(16,24,40,0.10),0_22px_48px_-16px_rgba(16,24,40,0.22),0_28px_60px_-28px_rgba(43,94,211,0.22)]
          ${grid ? '' : 'mr-5'}`}
    >
      {showLogo ? (
        <img
          src={partner.logo}
          alt={partner.name}
          /* Full colour, full opacity at rest. On row hover, non-hovered logos
             dim + desaturate (spotlight); the hovered one stays vivid and zooms. */
          className="max-h-12 max-w-[8.5rem] object-contain mix-blend-multiply opacity-100 saturate-100
            transition duration-300 ease-out
            group-hover/row:opacity-40 group-hover/row:saturate-[.45]
            group-hover/card:!opacity-100 group-hover/card:!saturate-100 group-hover/card:scale-110"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="text-2xl font-extrabold tracking-tight text-brand-600
            transition duration-300
            group-hover/row:opacity-40 group-hover/card:!opacity-100 group-hover/card:scale-110"
        >
          {partner.name}
        </span>
      )}
    </motion.div>
  )
}
