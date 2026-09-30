'use client'

import dynamic from 'next/dynamic'

// The home page below its first screen, one chunk per section.
//
// Every section is still rendered on the server — the HTML, the text and the
// links are all there from the first byte. What changes is when its script
// arrives and wakes it up: each `dynamic()` is a boundary React hydrates on its
// own, so the header and the hero answer clicks as soon as their own small
// share of the code is in, instead of waiting for the whole page's. On a slow
// or lossy connection that is the difference between a page that works in a
// second and one that sits dead until its last file lands.
//
// The sections that lean on the animation library (the sticky stack, the
// horizontal scene, the portfolio's layout animation) take it with them, off
// the critical path.
//
// (`dynamic` has to be called from a client module for the split to happen —
// hence this file rather than lazy imports in HomeContent, a server component.)

export const About = dynamic(() => import('./About'))
export const Services = dynamic(() => import('./Services'))
export const Process = dynamic(() => import('./Process'))
export const Portfolio = dynamic(() => import('./Portfolio'))
export const Partners = dynamic(() => import('./Partners'))
export const Faq = dynamic(() => import('./Faq'))
export const CTA = dynamic(() => import('./CTA'))
