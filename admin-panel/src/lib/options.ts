import { Palette, Megaphone, Handshake, Code2, Target, Clapperboard, type LucideIcon } from 'lucide-react'

// The 6 icon names the backend accepts (ICON_CHOICES) + their lucide components.
export const ICON_OPTIONS: { value: string; Icon: LucideIcon }[] = [
  { value: 'Palette', Icon: Palette },
  { value: 'Megaphone', Icon: Megaphone },
  { value: 'Handshake', Icon: Handshake },
  { value: 'Code2', Icon: Code2 },
  { value: 'Target', Icon: Target },
  { value: 'Clapperboard', Icon: Clapperboard },
]

export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map((o) => [o.value, o.Icon]),
)

// Russian captions shown in the admin icon picker. The stored VALUE stays the
// lucide name (icon ∈ ICON_CHOICES cross-contract — mirrored in the frontend +
// backend); only the displayed label is localized.
export const ICON_LABEL: Record<string, string> = {
  Palette: 'Дизайн',
  Megaphone: 'Маркетинг',
  Handshake: 'Партнёрство',
  Code2: 'Разработка',
  Target: 'Реклама',
  Clapperboard: 'Видео',
}

// Employment-type vocabulary offered in the admin form (Russian only). The
// backend `type` stays a free CharField with no hard choices, so legacy values
// (e.g. "Полная занятость · Душанбе") still load — the form injects the current
// value as an extra option when it isn't one of these, so nothing is lost.
export const TYPE_OPTIONS = ['Полная занятость', 'Частичная занятость'] as const

// NOTE: `accent` is intentionally not surfaced in the admin UI — the backend
// field is preserved (the public site may style from it) but there is no
// admin control/option set for it.

// Cross-app contract: mirror backend CATEGORY_CHOICES + the public
// Portfolio.tsx filters. Adding a value here surfaces it in the project form +
// the projects list category filter automatically.
export const CATEGORY_OPTIONS = ['Разработка', 'SMM', 'Дизайн', 'Реклама'] as const

// Applicant experience enum — cross-app contract. Keep in sync with
// backend/apps/choices.py (EXPERIENCE_VALUES) and frontend/src/data/content.ts.
export const EXPERIENCE_OPTIONS = [
  'без опыта',
  'до 1 года',
  '1–3 года',
  '3–5 лет',
  '5+ лет',
] as const

// Lead quiz direction ids — cross-app contract: mirror of KNOWN_SELECTED in
// backend/apps/leads/serializers.py and DIRECTIONS in the public ContactForm.
// Kept here as the single in-app source so the Заявки facet derives labels/order
// from one place. The leads journal facet only OFFERS directions present in data.
export const LEAD_DIRECTIONS = ['smm', 'design', 'dev', 'ads', 'unsure'] as const
export type LeadDirection = (typeof LEAD_DIRECTIONS)[number]

export const LEAD_DIRECTION_LABEL: Record<string, string> = {
  smm: 'SMM',
  design: 'Дизайн',
  dev: 'Разработка',
  ads: 'Реклама',
  unsure: 'Не определился',
}
