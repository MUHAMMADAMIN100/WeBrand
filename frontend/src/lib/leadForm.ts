// What the lead forms share: the quiz in the contact modal (ContactForm), the
// brief page (BriefForm) — the directions, the one question per direction, and
// the contact validators. Kept apart from the forms themselves so that a page
// which needs only this does not pull in a thousand-line form component.
//
// Cross-app contract: the direction ids below must match KNOWN_SELECTED in
// backend/apps/leads/serializers.py, or valid leads are rejected with a 400.

import {
  Building2, Code2, Eye, FileText, Heart, HelpCircle, Image, LayoutGrid, Megaphone, Monitor,
  MousePointerClick, Package, Palette, PhoneCall, Presentation, Radio, Rocket, ShoppingBag,
  ShoppingCart, Smartphone, Sparkles, Store, Target, TrendingUp,
  type LucideIcon,
} from 'lucide-react'

export type Direction = { id: string; label: string; sub: string; icon: LucideIcon; wide?: boolean };
export type QOption = { l: string; icon: LucideIcon };
export type Question = { q: string; multi: boolean; options: QOption[] };
export type Answers = Record<string, string | string[]>;

export const DIRECTIONS: Direction[] = [
  { id: "smm", label: "SMM", sub: "соцсети и контент", icon: Megaphone },
  { id: "design", label: "Дизайн", sub: "лого, баннеры, UI", icon: Palette },
  { id: "dev", label: "Разработка", sub: "сайты и приложения", icon: Code2 },
  { id: "ads", label: "Реклама", sub: "таргет и Google", icon: Target },
  { id: "unsure", label: "Не знаю — помогите", sub: "подскажем направление", icon: HelpCircle, wide: true },
];

// One main question per direction.
export const QUESTIONS: Record<string, Question> = {
  dev: { q: "Что хотите сделать?", multi: false, options: [
    { l: "Landing page", icon: FileText },
    { l: "Корпоративный сайт", icon: Building2 },
    { l: "Интернет-магазин", icon: ShoppingCart },
    { l: "Маркетплейс", icon: Store },
    { l: "Мобильное приложение", icon: Smartphone },
    { l: "Веб-портал", icon: LayoutGrid },
  ]},
  smm: { q: "Что хотите получить?", multi: false, options: [
    { l: "Заявки и продажи (лиды)", icon: TrendingUp },
    { l: "Узнаваемость бренда", icon: Eye },
    { l: "Вовлечённость и охваты", icon: Heart },
    { l: "Запуск продукта", icon: Rocket },
  ]},
  design: { q: "Что нужно нарисовать?", multi: true, options: [
    { l: "Логотип", icon: Sparkles },
    { l: "Фирменный стиль / брендбук", icon: Palette },
    { l: "Креативы для соцсетей", icon: Image },
    { l: "UI/UX дизайн сайта", icon: Monitor },
    { l: "Полиграфия / упаковка", icon: Package },
    { l: "Презентация", icon: Presentation },
  ]},
  ads: { q: "Что хотите от рекламы?", multi: false, options: [
    { l: "Заявки и звонки (лиды)", icon: PhoneCall },
    { l: "Продажи", icon: ShoppingBag },
    { l: "Трафик на сайт", icon: MousePointerClick },
    { l: "Охваты и узнаваемость", icon: Radio },
  ]},
};

// === Валидация контактов ===
export const PHONE_PREFIX = "+992 ";
const NAME_RE = /^[\p{L}][\p{L}\s'’-]*$/u; // буквы (любой алфавит), пробел, апостроф, дефис
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TG_RE = /^@?[A-Za-z0-9_]{5,32}$/;

// 9 национальных цифр после фиксированного префикса "+992 "
export const nationalDigits = (v: string): string => {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("992")) d = d.slice(3);
  return d.slice(0, 9);
};
// Группировка 9 цифр: "98 864 55 43"
export const formatPhone = (d: string): string => {
  let out = d.slice(0, 2);
  if (d.length > 2) out += " " + d.slice(2, 5);
  if (d.length > 5) out += " " + d.slice(5, 7);
  if (d.length > 7) out += " " + d.slice(7, 9);
  return out;
};

export function validateName(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Введите имя";
  if (t.length < 2) return "Минимум 2 символа";
  if (t.length > 50) return "Максимум 50 символов";
  if (!NAME_RE.test(t)) return "Только буквы, пробел и дефис";
  return undefined;
}
export function validateContact(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Укажите email или Telegram";
  if (!EMAIL_RE.test(t) && !TG_RE.test(t)) return "Введите email или Telegram (@username)";
  return undefined;
}
export function validatePhone(v: string): string | undefined {
  if (nationalDigits(v).length !== 9) return "Введите 9 цифр номера";
  return undefined;
}
