import type { Metadata } from 'next'
import { pageMetadata } from '../../lib/seo'

// One <head> for the brief, with or without a locked direction: the canonical
// is `/brief` either way (a direction changes the form, not the page).
export const briefMetadata: Metadata = pageMetadata({
  title: 'Обсудить проект — бриф | Webrand',
  description:
    'Расскажите о задаче свободным текстом или по короткому брифу — разработка сайтов, дизайн, SMM, реклама. Ответим в течение пары часов. Webrand, Душанбе.',
  path: '/brief',
})

// The directions a `?direction=` may lock. Mirrors LOCKABLE_DIRECTIONS in
// components/BriefForm.tsx and the rewrite in next.config.mjs.
export const LOCKABLE_DIRECTIONS = ['smm', 'design', 'dev', 'ads'] as const
