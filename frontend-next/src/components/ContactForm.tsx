'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  User, AtSign, Phone, Clock, ShieldCheck, Send, ArrowRight, ArrowLeft,
  Check, Sparkles, Megaphone, Palette, Code2, Target, HelpCircle,
  FileText, Building2, ShoppingCart, Store, Smartphone, LayoutGrid,
  TrendingUp, Eye, Heart, Rocket, Image, Monitor, Package, Presentation,
  PhoneCall, ShoppingBag, MousePointerClick, Radio, Briefcase, CalendarDays, Paperclip, X, ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { contacts, EXPERIENCE_OPTIONS } from "../data/content";
import type { ApplyTarget } from "../context/ModalContext";

// Default in code so local dev works without a .env (mirrors the Vite app).
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Direction = { id: string; label: string; sub: string; icon: LucideIcon; wide?: boolean };
type QOption = { l: string; icon: LucideIcon };
type Question = { q: string; multi: boolean; options: QOption[] };
type Answers = Record<string, string | string[]>;

const DIRECTIONS: Direction[] = [
  { id: "smm", label: "SMM", sub: "соцсети и контент", icon: Megaphone },
  { id: "design", label: "Дизайн", sub: "лого, баннеры, UI", icon: Palette },
  { id: "dev", label: "Разработка", sub: "сайты и приложения", icon: Code2 },
  { id: "ads", label: "Реклама", sub: "таргет и Google", icon: Target },
  { id: "unsure", label: "Не знаю — помогите", sub: "подскажем направление", icon: HelpCircle, wide: true },
];

// Maps a Service title from content.ts to a form direction id, so opening the
// form from a specific service pre-selects the matching direction.
const SERVICE_TO_DIRECTION: Record<string, string> = {
  "Разработка сайтов": "dev",
  "Онлайн-эквайринг": "dev",
  "Дизайн и брендинг": "design",
  "SMM-маркетинг": "smm",
};

export function directionsForService(title: string): string[] {
  const dir = SERVICE_TO_DIRECTION[title];
  return dir ? [dir] : [];
}

// One main question per direction.
const QUESTIONS: Record<string, Question> = {
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

// Заявки уходят на бэкенд (Django), который валидирует, сохраняет лид и
// пересылает его в Telegram серверно. Токен бота больше не живёт в браузере.

// === Валидация контактов ===
const PHONE_PREFIX = "+992 ";
const NAME_RE = /^[\p{L}][\p{L}\s'’-]*$/u; // буквы (любой алфавит), пробел, апостроф, дефис
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TG_RE = /^@?[A-Za-z0-9_]{5,32}$/;

// 9 национальных цифр после фиксированного префикса "+992 "
const nationalDigits = (v: string): string => {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("992")) d = d.slice(3);
  return d.slice(0, 9);
};
// Группировка 9 цифр: "98 864 55 43"
const formatPhone = (d: string): string => {
  let out = d.slice(0, 2);
  if (d.length > 2) out += " " + d.slice(2, 5);
  if (d.length > 5) out += " " + d.slice(5, 7);
  if (d.length > 7) out += " " + d.slice(7, 9);
  return out;
};

function validateName(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Введите имя";
  if (t.length < 2) return "Минимум 2 символа";
  if (t.length > 50) return "Максимум 50 символов";
  if (!NAME_RE.test(t)) return "Только буквы, пробел и дефис";
  return undefined;
}
function validateContact(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Укажите email или Telegram";
  if (!EMAIL_RE.test(t) && !TG_RE.test(t)) return "Введите email или Telegram (@username)";
  return undefined;
}
function validatePhone(v: string): string | undefined {
  if (nationalDigits(v).length !== 9) return "Введите 9 цифр номера";
  return undefined;
}

// === Применительно к отклику на вакансию: возраст + резюме (зеркало бэкенда) ===
const AGE_MIN = 14;
const AGE_MAX = 80;
const MAX_RESUME_MB = 10;

function validateAge(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Укажите возраст";
  if (!/^\d{1,3}$/.test(t)) return "Только цифры";
  const n = Number(t);
  if (n < AGE_MIN || n > AGE_MAX) return `Возраст должен быть от ${AGE_MIN} до ${AGE_MAX}`;
  return undefined;
}
// Resume is always required and must be a PDF (≤10 MB) — mirrors the server.
function validateResume(file: File | null): string | undefined {
  if (!file) return "Прикрепите резюме (PDF)";
  const isPdf = file.name.toLowerCase().endsWith(".pdf") &&
    (file.type === "application/pdf" || file.type === "application/x-pdf" || file.type === "");
  if (!isPdf) return "Принимается только PDF";
  if (file.size > MAX_RESUME_MB * 1024 * 1024) return `Файл больше ${MAX_RESUME_MB} МБ`;
  return undefined;
}

type ContactErrors = { name?: string; contact?: string; phone?: string; experience?: string; age?: string; resume?: string };
type ContactTouched = { name?: boolean; contact?: boolean; phone?: boolean; experience?: boolean; age?: boolean; resume?: boolean };

const CSS = `
.cqf, .cqf * { box-sizing: border-box; }
.cqf {
  --brand:#2B5ED3; --brand-dark:#1E47A8; --brand-soft:#EEF3FC;
  --spring: cubic-bezier(.34,1.56,.64,1);
  font-family: system-ui, -apple-system, sans-serif;
}
@keyframes cqf-pop { 0%{transform:scale(0)} 60%{transform:scale(1.18)} 100%{transform:scale(1)} }
@keyframes cqf-ready { 0%,100%{box-shadow:0 8px 20px rgba(43,94,211,.28)} 50%{box-shadow:0 8px 28px rgba(43,94,211,.5)} }
@keyframes cqf-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
.cqf .up { animation: cqf-up .5s var(--spring) both; }

/* All cards are a single fixed size everywhere. Hover/selected change only
   colour/border/shadow — never the box geometry (no scale/translate), so a card
   can never grow past the top of its container. */
.cqf .dircard {
  position:relative; display:flex; align-items:center; gap:13px;
  min-height:48px; padding:8px 13px; border-radius:12px; border:1.5px solid #E6E9F0;
  background:#fff; cursor:pointer; text-align:left; width:100%;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}
.cqf .dircard.wide { width:100%; }
.cqf .dircard:hover { border-color:#BFD0F0; box-shadow:0 6px 18px rgba(43,94,211,.12); }
.cqf .dircard.active { border-color:var(--brand); background:var(--brand-soft); box-shadow:0 6px 18px rgba(43,94,211,.14); }
.cqf .iconwrap {
  width:36px;height:36px;border-radius:10px;flex-shrink:0;
  background:#EFF3FB; color:var(--brand); display:flex;align-items:center;justify-content:center;
  transition: background .2s ease, color .2s ease;
}
.cqf .dircard.active .iconwrap { background:var(--brand); color:#fff; }
.cqf .dirlabel { display:block; font-size:14.5px; font-weight:600; color:#1F2937; }
.cqf .dircard.active .dirlabel { color:var(--brand-dark); }
.cqf .dirsub { display:block; font-size:12.5px; color:#9AA0AA; margin-top:1px; }
.cqf .badge {
  position:absolute; top:11px; right:11px; width:21px;height:21px;border-radius:50%;
  background:var(--brand); color:#fff; display:flex;align-items:center;justify-content:center;
  transform:scale(0); transition: transform .3s var(--spring);
}
.cqf .dircard.active .badge { animation: cqf-pop .35s var(--spring) forwards; }

.cqf .opt {
  display:flex; align-items:center; gap:12px; width:100%;
  min-height:46px; padding:8px 12px; border-radius:12px; border:1.5px solid #E6E9F0; background:#fff;
  color:#1F2937; font-size:14px; font-weight:500; cursor:pointer; text-align:left;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}
.cqf .opt:hover { border-color:#BFD0F0; box-shadow:0 6px 18px rgba(43,94,211,.12); }
.cqf .opt.active { border-color:var(--brand); background:var(--brand-soft); box-shadow:0 6px 18px rgba(43,94,211,.14); }
.cqf .opticon {
  width:34px;height:34px;border-radius:9px;flex-shrink:0;
  background:#EFF3FB; color:var(--brand); display:flex;align-items:center;justify-content:center;
  transition: background .2s ease, color .2s ease;
}
.cqf .opt.active .opticon { background:var(--brand); color:#fff; }
.cqf .optlabel { flex:1; }
.cqf .opt.active .optlabel { color:var(--brand-dark); }
.cqf .ind {
  width:21px;height:21px;flex-shrink:0; border:1.5px solid #CBD2DE; color:#fff;
  display:flex;align-items:center;justify-content:center;
  transition: background .2s ease, border-color .2s ease;
}
.cqf .ind.radio { border-radius:50%; }
.cqf .ind.check { border-radius:7px; }
.cqf .opt.active .ind { background:var(--brand); border-color:var(--brand); }
.cqf .ind > svg { opacity:0; transform:scale(.3); transition: opacity .18s ease, transform .3s var(--spring); }
.cqf .opt.active .ind > svg { opacity:1; transform:scale(1); }

.cqf .btn-primary {
  flex:1; padding:13px; border-radius:13px; border:none; background:var(--brand); color:#fff;
  font-size:15px; font-weight:600; cursor:pointer; display:flex; align-items:center;
  justify-content:center; gap:8px; transition: transform .15s var(--spring), background .2s ease, box-shadow .2s ease;
}
.cqf .btn-primary:hover:not(:disabled) { box-shadow:0 10px 24px rgba(43,94,211,.3); transform:translateY(-1px); }
.cqf .btn-primary:active:not(:disabled) { transform:translateY(0) scale(.98); }
.cqf .btn-primary:disabled { background:#BFD0F0; cursor:not-allowed; }
.cqf .btn-primary.ready { animation: cqf-ready 1.8s ease-in-out infinite; }
.cqf .btn-ghost {
  padding:12px 18px; border-radius:13px; border:1.5px solid #E6E9F0; background:#fff;
  color:#6B7280; font-size:14px; font-weight:500; cursor:pointer; display:flex;
  align-items:center; gap:6px; transition: border-color .2s ease, transform .15s var(--spring);
}
.cqf .btn-ghost:hover { border-color:#CBD2DE; }
.cqf .btn-ghost:active { transform:scale(.97); }

.cqf .field { position:relative; border:1.5px solid #E6E9F0; border-radius:12px;
  padding:6px 14px 6px 40px; background:#fff; transition: border-color .2s ease, box-shadow .2s ease; }
.cqf .field.focus { border-color:var(--brand); box-shadow:0 0 0 4px rgba(43,94,211,.1); }
.cqf .field.done { border-color:#BFD0F0; }
.cqf .field input { border:none; outline:none; width:100%; font-size:14.5px; color:#1F2937;
  background:transparent; padding:1px 0 0; }
.cqf .field input::placeholder { color:#B6BCC6; }
.cqf .tick { position:absolute; right:14px; top:13px; width:21px;height:21px;border-radius:50%;
  background:var(--brand); color:#fff; display:flex;align-items:center;justify-content:center;
  opacity:0; transform:scale(.4); transition: opacity .2s ease, transform .3s var(--spring); }
.cqf .field.done .tick { opacity:1; transform:scale(1); }

.cqf .field.error { border-color:#E5484D; box-shadow:0 0 0 4px rgba(229,72,77,.1); }
.cqf a.cqf-tglink { transition: opacity .2s ease; }
.cqf a.cqf-tglink:hover { opacity:.82; text-decoration:underline !important; }

/* Custom select dropdown (опыт работы). The options panel is rendered in a
   portal at <body> (so the modal's overflow/rounded corners can't clip it), so
   this rule is intentionally UNSCOPED (no .cqf prefix). */
@keyframes wb-pop-in { from { opacity:0; transform:scale(.97); } to { opacity:1; transform:scale(1); } }

/* Compact 2-column grid for the application step (collapses to 1 col on mobile) */
/* Paired fields stay 2-up even on mobile so the whole form fits one screen by height.
   Name + Resume span both columns; submit is full width below. */
.cqf .appgrid { display:grid; grid-template-columns:1fr 1fr; gap:8px 10px; }
.cqf .appgrid .span2 { grid-column:1 / -1; }

/* === Quiz one-screen flex layout: fixed head + progress on top, options area
   flexes to the viewport (no inner scroll unless the viewport is tiny), footer
   with Назад/Далее always fully visible at the bottom. === */
.cqf { max-height:90dvh; }
.cqf-flow { position:relative; display:flex; flex-direction:column; flex:1 1 auto; min-height:0; }
.cqf-step { display:flex; flex-direction:column; flex:1 1 auto; min-height:0; }
.cqf-stephead { flex-shrink:0; padding-right:44px; }
.cqf-stepbody { display:flex; flex-direction:column; flex:1 1 auto; min-height:0; }
.cqf-scroll { flex:1 1 auto; min-height:0; overflow-y:auto; overscroll-behavior:contain; }
.cqf-scroll::-webkit-scrollbar { width:7px; }
.cqf-scroll::-webkit-scrollbar-thumb { background:#D9DEE8; border-radius:9px; }
.cqf-foot { flex-shrink:0; padding-top:12px; }

/* Single column, full-width cards on every step. */
.cqf .optgrid { display:flex; flex-direction:column; gap:6px; }

/* Brief "fixating" highlight on the chosen option before an auto-advance —
   colour only, no scale (card size never changes). */
.cqf .opt.picking { border-color:var(--brand); background:var(--brand-soft); box-shadow:0 6px 18px rgba(43,94,211,.16); }

/* Below lg the modal is full-screen: the card fills the viewport, no rounding/shadow,
   and the marketing side panel is hidden (its inline display needs an !important here). */
@media (max-width:1023px){
  .cqf { border-radius:0 !important; height:100%; max-height:100dvh !important; box-shadow:none !important; max-width:none !important; }
  .cqf-side { display:none !important; }
  .cqf-body { padding:24px 18px 18px !important; }
}

/* Reduced motion: drop entrance/loop/pulse animations (step slide is gated in JS). */
@media (prefers-reduced-motion: reduce){
  .cqf .up,
  .cqf .btn-primary.ready,
  .cqf .opt.picking,
  .cqf .dircard.active .badge { animation:none !important; }
}

/* === Мобильный адаптив (≤640px). !important — чтобы перебить инлайн-стили карточки. === */
@media (max-width:640px) {
  /* Левая синяя панель не нужна на телефоне */
  .cqf .cqf-side { display:none !important; }
  /* Форма занимает всю ширину, отступы компактнее — без тесноты и гориз. скролла */
  .cqf .cqf-body { padding:22px 16px 20px !important; }
  /* Заголовок-строка: правый отступ под кнопку-крестик модалки, чтобы «Шаг X из Y» не перекрывался */
  .cqf .cqf-head { padding-right:40px !important; }
  /* Карточки направлений — в один столбец на всю ширину; компактные паддинги,
     тап-таргет держит min-height из базовых правил. */
  .cqf .dircard { width:100% !important; padding:10px 14px !important; }
  .cqf .opt { padding:10px 14px !important; }
  .cqf .field { padding-top:12px !important; padding-bottom:12px !important; }
  .cqf .field input { font-size:16px !important; } /* ≥16px — iOS не зумит при фокусе */
  .cqf .btn-primary,
  .cqf .btn-ghost { padding:16px 16px !important; font-size:16px !important; }
}
`;

export default function ContactForm({
  initialSelected = [],
  applyTarget = null,
}: {
  initialSelected?: string[];
  applyTarget?: ApplyTarget | null;
}) {
  const isApplication = !!applyTarget;
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [answers, setAnswers] = useState<Answers>({});
  const [screen, setScreen] = useState(0);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState(PHONE_PREFIX);
  const [message, setMessage] = useState("");
  // Job-application-only fields
  const [experience, setExperience] = useState("");
  const [age, setAge] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  // Honeypot: bots fill this hidden field; humans never see it. A non-empty
  // value makes the backend silently 200 without saving.
  const [company, setCompany] = useState("");
  const [touched, setTouched] = useState<ContactTouched>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  // In application mode there is no quiz — go straight to the contacts step.
  const questionDirs = isApplication
    ? []
    : DIRECTIONS.filter((d) => selected.includes(d.id) && QUESTIONS[d.id]).map((d) => d.id);
  const totalSteps = isApplication ? 1 : 1 + questionDirs.length + 1;
  const contactsScreen = isApplication ? 0 : 1 + questionDirs.length;
  const onSelection = !isApplication && screen === 0;
  const onContacts = screen === contactsScreen;
  const currentDir = !onSelection && !onContacts ? questionDirs[screen - 1] : null;
  const unsureOnly = selected.includes("unsure") && questionDirs.length === 0;

  // Step-transition direction (1 = forward, -1 = back) + first-render guard so the
  // very first step doesn't slide in on top of the modal's own open animation.
  const reduce = useReducedMotion();
  const dirRef = useRef(1);
  const firstRef = useRef(true);
  useEffect(() => { firstRef.current = false; }, []);
  const goNext = () => { dirRef.current = 1; setScreen((s) => s + 1); };
  const goBack = () => { dirRef.current = -1; setScreen((s) => s - 1); };

  const toggleDirection = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((s) => s !== id) : [...p, id]));

  const setAnswer = (dir: string, opt: string, multi: boolean) =>
    setAnswers((prev) => {
      const cur = prev[dir];
      if (multi) {
        const a = Array.isArray(cur) ? cur : [];
        return { ...prev, [dir]: a.includes(opt) ? a.filter((o) => o !== opt) : [...a, opt] };
      }
      return { ...prev, [dir]: opt };
    });

  // Keep the fixed "+992 " prefix, accept only digits, cap at 9, auto-format
  const onPhoneChange = (v: string) => setPhone(PHONE_PREFIX + formatPhone(nationalDigits(v)));
  const blur = (k: keyof ContactTouched) => setTouched((t) => ({ ...t, [k]: true }));

  const errName = validateName(name);
  const errContact = validateContact(contact);
  const errPhone = validatePhone(phone);
  const errExperience = isApplication && !experience ? "Выберите опыт работы" : undefined;
  const errAge = isApplication ? validateAge(age) : undefined;
  const errResume = isApplication ? validateResume(resumeFile) : undefined;
  const errors: ContactErrors = {
    name: touched.name ? errName : undefined,
    contact: touched.contact ? errContact : undefined,
    phone: touched.phone ? errPhone : undefined,
    experience: touched.experience ? errExperience : undefined,
    age: touched.age ? errAge : undefined,
    resume: touched.resume ? errResume : undefined,
  };

  const filled = (errName ? 0 : 1) + (errContact ? 0 : 1) + (errPhone ? 0 : 1);
  const progress = onContacts
    ? Math.round(((screen + filled / 3) / totalSteps) * 100)
    : Math.round((screen / totalSteps) * 100) + (selected.length ? 8 : 0);
  const canSubmit =
    !errName && !errContact && !errPhone &&
    (!isApplication || (!errExperience && !errAge && !errResume));

  const handleSubmit = async () => {
    if (!canSubmit || sending) {
      setTouched({ name: true, contact: true, phone: true, experience: true, age: true, resume: true });
      return;
    }
    setError(false);

    try {
      setSending(true);
      let res: Response;
      if (isApplication) {
        // Applications go as multipart so a resume file can ride along.
        const fd = new FormData();
        fd.append("kind", "application");
        fd.append("role", applyTarget!.role);
        fd.append("name", name.trim());
        fd.append("contact", contact.trim());
        fd.append("phone", phone);
        fd.append("message", message.trim());
        fd.append("experience", experience);
        fd.append("age", age);
        if (resumeFile) fd.append("resume", resumeFile);
        fd.append("company", company); // honeypot
        // No Content-Type header — the browser sets the multipart boundary.
        res = await fetch(`${API_BASE}/api/leads/`, { method: "POST", body: fd });
      } else {
        const payload = {
          kind: "lead", selected, answers,
          name: name.trim(), contact: contact.trim(), phone, company,
        };
        res = await fetch(`${API_BASE}/api/leads/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      // 2xx + {ok:true} = saved (or honeypot silently accepted). Anything else is an error.
      let data: { ok?: boolean } = {};
      try {
        data = await res.json();
      } catch {
        /* non-JSON (e.g. throttle HTML) — treated as error below */
      }
      if (res.ok && data.ok) setSubmitted(true);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  let heading = "";
  let subtitle = "";
  if (onSelection) {
    heading = "С чего начнём?";
    subtitle = "Выберите одно или несколько направлений.";
  } else if (currentDir) {
    heading = QUESTIONS[currentDir].q;
    subtitle = QUESTIONS[currentDir].multi ? "Можно выбрать несколько." : "Нажмите вариант — двинемся дальше.";
  } else if (onContacts && isApplication) {
    heading = "Отклик на вакансию";
    subtitle = `${applyTarget!.title} — оставьте контакты, и мы свяжемся с вами.`;
  } else if (onContacts) {
    heading = "Куда прислать ответ?";
    subtitle = unsureOnly
      ? "Оставьте контакты — свяжемся и вместе разберёмся, что нужно."
      : "Пришлём 2-3 варианта с ценами в течение пары часов.";
  }

  // Left-panel copy differs for a job application vs. a project lead.
  const side = isApplication
    ? {
        badge: "Вакансия",
        title: (<>Откликнитесь<br />на роль</>),
        text: "Короткая форма — ответим в течение пары дней и расскажем о следующем шаге.",
        trust: [
          { icon: Clock, title: "Ответ за пару дней", sub: "в рабочие дни" },
          { icon: ShieldCheck, title: "Честный отбор", sub: "смотрим на навыки и опыт" },
        ],
      }
    : {
        badge: "Новый проект",
        title: (<>Расскажите<br />о задаче</>),
        text: "Один вопрос — и подберём решение. Позвоним только если сами попросите.",
        trust: [
          { icon: Clock, title: "Отвечаем за пару часов", sub: "в рабочее время" },
          { icon: ShieldCheck, title: "30+ компаний доверяют", sub: "медицина, e-commerce, услуги" },
        ],
      };

  return (
    <div className="cqf" style={{ width: "100%", maxWidth: 920, display: "flex", borderRadius: 24,
      overflow: "hidden", boxShadow: "0 30px 80px rgba(43,94,211,0.18)", background: "#fff" }}>
      <style>{CSS}</style>

        <div className="hidden lg:flex cqf-side" style={{ width: "38%",
          background: "linear-gradient(160deg, #2B5ED3 0%, #1E47A8 100%)", color: "#fff",
          padding: "30px 26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12,
              letterSpacing: 1, textTransform: "uppercase", opacity: 0.85 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} /> {side.badge}
            </div>
            <h2 style={{ fontSize: 24, lineHeight: 1.14, fontWeight: 700, margin: "14px 0 10px" }}>
              {side.title}
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.9 }}>
              {side.text}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {side.trust.map((t) => <Trust key={t.title} icon={t.icon} title={t.title} sub={t.sub} />)}
          </div>
          <div style={{ fontSize: 14, lineHeight: 2 }}>
            <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" className="cqf-tglink"
              style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", textDecoration: "none" }}>
              <Send size={15} /> Написать в Telegram
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={15} /> {contacts.phone}</div>
          </div>
        </div>

        <div className="cqf-body" style={{ flex: 1, padding: "26px 30px 22px", minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {submitted ? (
            <SuccessView selected={selected} unsure={unsureOnly} isApplication={isApplication} roleTitle={applyTarget?.title} />
          ) : (
            <>
              {/* Fixed top: step counter + progress stay put while steps slide. The
                  step counter sits on its own line so it never collides with the
                  close (X) button in the top-right corner. */}
              <div className="cqf-head" style={{ paddingRight: 44, flexShrink: 0 }}>
                {totalSteps > 1 && (
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", color: "#9AA0AA", marginBottom: 8 }}>
                    Шаг {screen + 1} из {totalSteps}
                  </div>
                )}
                {totalSteps > 1 && (
                  <div style={{ height: 6, borderRadius: 99, background: "#EDF0F5", margin: "0 0 4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(progress, 100)}%`,
                      background: "#2B5ED3", borderRadius: 99, transition: "width .4s cubic-bezier(.34,1.56,.64,1)" }} />
                  </div>
                )}
              </div>

              {/* Honeypot — visually hidden, off the tab order. Bots fill it; humans don't. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />

              {/* Animated step region: heading + subtitle + options + footer move as one. */}
              <div className="cqf-flow">
                <motion.div
                  key={screen}
                  initial={firstRef.current || reduce ? false : { opacity: 0, x: dirRef.current > 0 ? 28 : -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduce ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
                  className="cqf-step"
                >
                  <div className="cqf-stephead">
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{heading}</h3>
                    <p style={{ fontSize: 13.5, color: "#6B7280", margin: "5px 0 0" }}>{subtitle}</p>
                  </div>
                  <div style={{ height: 12, flexShrink: 0 }} />

                  {onSelection && (
                    <StepSelection selected={selected} toggle={toggleDirection} onNext={goNext} />
                  )}
                  {currentDir && (
                    <StepQuestion dir={currentDir} value={answers[currentDir]} reduce={!!reduce}
                      setAnswer={setAnswer} onBack={goBack} onNext={goNext} />
                  )}
                  {onContacts && isApplication && (
                    <ApplicationStep
                      name={name} setName={setName} contact={contact} setContact={setContact}
                      phone={phone} setPhone={onPhoneChange}
                      experience={experience} setExperience={setExperience} age={age} setAge={setAge}
                      resumeFile={resumeFile} setResumeFile={setResumeFile}
                      errors={errors} onBlur={blur} canSubmit={canSubmit} sending={sending} error={error}
                      onSubmit={handleSubmit}
                      experienceRequired={applyTarget!.experienceRequired}
                      ageMin={applyTarget!.ageMin} ageMax={applyTarget!.ageMax}
                    />
                  )}
                  {onContacts && !isApplication && (
                    <StepContacts name={name} setName={setName} contact={contact}
                      setContact={setContact} phone={phone} setPhone={onPhoneChange} canSubmit={canSubmit}
                      sending={sending} error={error} errors={errors} onBlur={blur}
                      onBack={goBack} onSubmit={handleSubmit} />
                  )}
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>
  );
}

function Trust({ icon: Icon, title, sub }: { icon: LucideIcon; title: string; sub: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={18} /></div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12.5, opacity: 0.8 }}>{sub}</div>
      </div>
    </div>
  );
}

function StepSelection({ selected, toggle, onNext }: {
  selected: string[]; toggle: (id: string) => void; onNext: () => void;
}) {
  return (
    <div className="cqf-stepbody">
      <div className="cqf-scroll">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {DIRECTIONS.map(({ id, label, sub, icon: Icon, wide }) => {
            const active = selected.includes(id);
            return (
              <button key={id} onClick={() => toggle(id)}
                className={`dircard ${active ? "active" : ""} ${wide ? "wide" : ""}`}>
                <span className="iconwrap"><Icon size={20} /></span>
                <span style={{ minWidth: 0 }}>
                  <span className="dirlabel">{label}</span>
                  <span className="dirsub">{sub}</span>
                </span>
                <span className="badge"><Check size={13} strokeWidth={3} /></span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="cqf-foot">
        <NavButtons onNext={onNext} nextLabel="Далее" nextDisabled={!selected.length}
          ready={selected.length > 0} footer="Бесплатно. Ни к чему не обязывает." />
      </div>
    </div>
  );
}

function StepQuestion({ dir, value, setAnswer, onBack, onNext, reduce }: {
  dir: string;
  value: string | string[] | undefined;
  setAnswer: (dir: string, opt: string, multi: boolean) => void;
  onBack: () => void;
  onNext: () => void;
  reduce: boolean;
}) {
  const { options, multi } = QUESTIONS[dir];
  // For single-select: which option was just picked (brief highlight before auto-advance).
  const [picking, setPicking] = useState<string | null>(null);

  const choose = (label: string) => {
    setAnswer(dir, label, multi);
    if (!multi && !picking) {
      setPicking(label);
      // Let the choice "fixate" visually, then slide to the next step. Instant
      // under reduced-motion (no delay, no slide).
      if (reduce) onNext();
      else setTimeout(onNext, 260);
    }
  };

  const isActive = (l: string) => (multi ? Array.isArray(value) && value.includes(l) : value === l);
  const hasAnswer = multi ? Array.isArray(value) && value.length > 0 : !!value;

  return (
    <div className="cqf-stepbody">
      <div className="cqf-scroll">
        <div className="optgrid">
          {options.map((opt) => {
            const Ico = opt.icon;
            return (
              <button key={opt.l}
                className={`opt ${isActive(opt.l) ? "active" : ""} ${picking === opt.l ? "picking" : ""}`}
                onClick={() => choose(opt.l)}>
                <span className="opticon"><Ico size={20} /></span>
                <span className="optlabel">{opt.l}</span>
                <span className={`ind ${multi ? "check" : "radio"}`}><Check size={13} strokeWidth={3.5} /></span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="cqf-foot">
        {multi ? (
          <NavButtons onBack={onBack} onNext={onNext} nextLabel="Далее" ready={hasAnswer} nextDisabled={!hasAnswer} />
        ) : (
          <div>
            <button className="btn-ghost" onClick={onBack}><ArrowLeft size={17} /> Назад</button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepContacts({ name, setName, contact, setContact, phone, setPhone, canSubmit, sending, error, errors, onBlur, onBack, onSubmit }: {
  name: string; setName: (v: string) => void;
  contact: string; setContact: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  canSubmit: boolean; sending: boolean; error: boolean;
  errors: ContactErrors; onBlur: (k: keyof ContactTouched) => void;
  onBack?: () => void; onSubmit: () => void;
}) {
  return (
    <div className="cqf-stepbody">
      <div className="cqf-scroll">
        <Field icon={User} label="Имя" value={name} onChange={setName} maxLength={50}
          placeholder="Как к вам обращаться" done={name.trim().length > 0}
          error={errors.name} onBlur={() => onBlur("name")} />
        <Field icon={AtSign} label="Telegram или email" value={contact} onChange={setContact} maxLength={60}
          placeholder="@username или email" done={contact.trim().length > 0}
          error={errors.contact} onBlur={() => onBlur("contact")} />
        <Field icon={Phone} label="Телефон" value={phone} onChange={setPhone} placeholder="+992 ..."
          inputMode="tel" maxLength={17}
          hint="Нужен, чтобы связаться, если в мессенджере не ответите. Без спам-звонков."
          done={validatePhone(phone) === undefined}
          error={errors.phone} onBlur={() => onBlur("phone")} />
      </div>
      <div className="cqf-foot">
        {error && (
          <p style={{ fontSize: 13, color: "#D14545", margin: "0 2px 8px", lineHeight: 1.4 }}>
            Не получилось отправить. Напишите нам в{" "}
            <a href="https://t.me/bobodushanbe" style={{ color: "#2B5ED3", fontWeight: 600 }}>Telegram</a>.
          </p>
        )}
        <NavButtons onBack={onBack} onNext={onSubmit}
          nextLabel={sending ? "Отправляем…" : "Получить решение"} nextIcon={Send}
          nextDisabled={!canSubmit || sending} ready={canSubmit && !sending}
          footer="Позвоним только если сами попросите. По умолчанию пишем в Telegram." />
      </div>
    </div>
  );
}

// Compact, single-screen application step: 2-column grid on desktop, 1 column on mobile.
function ApplicationStep({
  name, setName, contact, setContact, phone, setPhone,
  experience, setExperience, age, setAge, resumeFile, setResumeFile,
  errors, onBlur, canSubmit, sending, error, onSubmit,
  experienceRequired, ageMin, ageMax,
}: {
  name: string; setName: (v: string) => void;
  contact: string; setContact: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  experience: string; setExperience: (v: string) => void;
  age: string; setAge: (v: string) => void;
  resumeFile: File | null; setResumeFile: (f: File | null) => void;
  errors: ContactErrors; onBlur: (k: keyof ContactTouched) => void;
  canSubmit: boolean; sending: boolean; error: boolean; onSubmit: () => void;
  experienceRequired?: string; ageMin?: number | null; ageMax?: number | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const reqParts: string[] = [];
  if (experienceRequired) reqParts.push(`опыт ${experienceRequired}`);
  if (ageMin && ageMax) reqParts.push(`возраст ${ageMin}–${ageMax}`);
  else if (ageMin) reqParts.push(`возраст от ${ageMin}`);
  else if (ageMax) reqParts.push(`возраст до ${ageMax}`);

  return (
    <div className="cqf-stepbody">
      <div className="cqf-scroll">
      {reqParts.length > 0 && (
        <div style={{ fontSize: 12.5, color: "#6B7280", margin: "0 2px 12px", lineHeight: 1.5 }}>
          <b style={{ color: "#1F2937" }}>Требования:</b> {reqParts.join(" · ")}
        </div>
      )}

      <div className="appgrid">
        <div className="span2">
          <Field compact icon={User} label="Имя" value={name} onChange={setName} maxLength={50}
            placeholder="Как к вам обращаться" done={name.trim().length > 0}
            error={errors.name} onBlur={() => onBlur("name")} />
        </div>
        <Field compact icon={AtSign} label="Telegram или email" value={contact} onChange={setContact} maxLength={60}
          placeholder="@username или email" done={contact.trim().length > 0}
          error={errors.contact} onBlur={() => onBlur("contact")} />
        <Field compact icon={Phone} label="Телефон" value={phone} onChange={setPhone} placeholder="+992 ..."
          inputMode="tel" maxLength={17} done={validatePhone(phone) === undefined}
          error={errors.phone} onBlur={() => onBlur("phone")} />
        <FieldSelect compact icon={Briefcase} label="Опыт работы" value={experience} options={EXPERIENCE_OPTIONS}
          placeholder="Выберите…" error={errors.experience}
          onChange={setExperience} onBlur={() => onBlur("experience")} />
        <Field compact icon={CalendarDays} label="Возраст" value={age}
          onChange={(v) => setAge(v.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" maxLength={3}
          placeholder="например, 25" done={validateAge(age) === undefined}
          error={errors.age} onBlur={() => onBlur("age")} />

        <div className="span2">
          <label style={{ display: "block", fontSize: 11.5, color: errors.resume ? "#E5484D" : "#9AA0AA", fontWeight: 500, margin: "0 2px 5px" }}>
            Резюме (PDF) <span style={{ color: "#2B5ED3" }}>*</span>
          </label>
          <input ref={fileRef} type="file" accept="application/pdf,.pdf" style={{ display: "none" }}
            onChange={(e) => { setResumeFile(e.target.files?.[0] ?? null); onBlur("resume"); }} />
          {resumeFile ? (
            <div className={`field ${errors.resume ? "error" : "done"}`} style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 14 }}>
              <FileText size={18} color="#2B5ED3" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, color: "#1F2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resumeFile.name}</span>
              <button type="button" onClick={() => { setResumeFile(null); onBlur("resume"); }} aria-label="Убрать файл"
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#9AA0AA", display: "flex" }}><X size={16} /></button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className={`field ${errors.resume ? "error" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", cursor: "pointer", paddingLeft: 14, textAlign: "left", background: "#fff" }}>
              <Paperclip size={18} color={errors.resume ? "#E5484D" : "#9AA0AA"} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 15, color: "#6B7280" }}>Прикрепить PDF</span>
            </button>
          )}
          <p style={{ fontSize: 12, color: errors.resume ? "#E5484D" : "#9AA0AA", margin: "4px 4px 0", lineHeight: 1.4 }}>
            {errors.resume ?? "Только PDF · до 10 МБ"}
          </p>
        </div>
      </div>
      </div>

      <div className="cqf-foot">
        {error && (
          <p style={{ fontSize: 13, color: "#D14545", margin: "0 2px 8px", lineHeight: 1.4 }}>
            Не получилось отправить. Напишите нам в{" "}
            <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" style={{ color: "#2B5ED3", fontWeight: 600 }}>Telegram</a>.
          </p>
        )}

        <button type="button" onClick={onSubmit} disabled={!canSubmit || sending}
          className={`btn-primary ${canSubmit && !sending ? "ready" : ""}`}
          style={{ width: "100%" }}>
          {sending ? "Отправляем…" : "Отправить отклик"} <Send size={18} />
        </button>
        <p style={{ textAlign: "center", fontSize: 12.5, color: "#9AA0AA", marginTop: 10 }}>
          Резюме в PDF обязательно. Свяжемся после рассмотрения.
        </p>
      </div>
    </div>
  );
}

// Accessible custom dropdown styled like the form's text fields (no native OS list).
// Keyboard: open with Enter/Space/↑/↓, navigate ↑/↓/Home/End, Enter selects, Esc
// closes, plus type-ahead. Roving focus across options.
function FieldSelect({ icon: Icon, label, value, options, placeholder, error, onChange, onBlur, compact }: {
  icon: LucideIcon;
  label: string;
  value: string;
  options: readonly string[];
  placeholder?: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // Panel geometry. Always opens downward from the trigger; compact rows keep the
  // full list visible without an inner scroll.
  const [coords, setCoords] = useState<{ left: number; width: number; top: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const optRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const typed = useRef({ buf: "", timer: 0 });
  const selIndex = options.indexOf(value);
  const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    setCoords({ left: r.left, width: r.width, top: Math.round(r.bottom + 6) });
  }, []);

  const openMenu = (i = selIndex >= 0 ? selIndex : 0) => { reposition(); setActive(i); setOpen(true); };
  const close = (refocus = true) => { setOpen(false); if (refocus) triggerRef.current?.focus(); onBlur?.(); };
  const choose = (i: number) => { if (options[i] != null) onChange(options[i]); close(); };

  // Keep the panel glued to the trigger if the page/modal scrolls or resizes.
  useLayoutEffect(() => { if (open) reposition(); }, [open, reposition]);
  useEffect(() => {
    if (!open) return;
    const onWin = () => reposition();
    window.addEventListener("scroll", onWin, true);
    window.addEventListener("resize", onWin);
    return () => {
      window.removeEventListener("scroll", onWin, true);
      window.removeEventListener("resize", onWin);
    };
  }, [open, reposition]);

  // Outside click (the panel is portaled, so check it too) + roving focus.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
      onBlur?.();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onBlur]);
  useEffect(() => { if (open) optRefs.current[active]?.focus(); }, [open, active]);

  const move = (d: number) => setActive((i) => (((i + d) % options.length) + options.length) % options.length);
  const typeahead = (k: string) => {
    if (k.length !== 1) return;
    window.clearTimeout(typed.current.timer);
    typed.current.buf += k.toLowerCase();
    const idx = options.findIndex((o) => o.toLowerCase().startsWith(typed.current.buf));
    if (idx >= 0) setActive(idx);
    typed.current.timer = window.setTimeout(() => (typed.current.buf = ""), 600);
  };

  return (
    <div ref={rootRef} style={{ position: "relative", marginBottom: compact ? 0 : 14 }}>
      <button ref={triggerRef} type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); openMenu(); }
          else if (e.key === "ArrowUp") { e.preventDefault(); openMenu(selIndex >= 0 ? selIndex : options.length - 1); }
        }}
        className={`field ${value ? "done" : ""} ${error ? "error" : ""}`}
        style={{ display: "flex", alignItems: "center", width: "100%", paddingLeft: 42, cursor: "pointer", textAlign: "left", background: "#fff" }}>
        <Icon size={18} color={error ? "#E5484D" : value ? "#2B5ED3" : "#9AA0AA"} style={{ position: "absolute", left: 13, top: 13 }} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 11.5, color: error ? "#E5484D" : "#9AA0AA", fontWeight: 500 }}>
            {label} <span style={{ color: "#2B5ED3" }}>*</span>
          </span>
          <span style={{ display: "block", fontSize: 15, color: value ? "#1F2937" : "#B6BCC6", marginTop: 2 }}>
            {value || placeholder || "Выберите…"}
          </span>
        </span>
        <ChevronDown size={18} color="#9AA0AA"
          style={{ flexShrink: 0, transition: "transform .2s ease", transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && coords && createPortal(
        <ul
          ref={panelRef}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`exp-opt-${active}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
            else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
            else if (e.key === "Home") { e.preventDefault(); setActive(0); }
            else if (e.key === "End") { e.preventDefault(); setActive(options.length - 1); }
            else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(active); }
            else if (e.key === "Escape") { e.preventDefault(); close(); }
            else if (e.key === "Tab") { setOpen(false); }
            else typeahead(e.key);
          }}
          className="wb-exp-pop"
          style={{
            boxSizing: "border-box",
            position: "fixed",
            left: coords.left,
            width: coords.width,
            top: coords.top,
            listStyle: "none",
            margin: 0,
            padding: 6,
            background: "#fff",
            border: "1px solid #E3E8F0",
            borderRadius: 14,
            boxShadow: "0 18px 44px rgba(16,24,40,0.20), 0 4px 12px rgba(16,24,40,0.10)",
            zIndex: 1000,
            transformOrigin: "top center",
            animation: reduceMotion ? undefined : "wb-pop-in .12s ease-out",
          }}
        >
          {options.map((o, i) => {
            const isSel = o === value;
            const isAct = i === active;
            return (
              <li key={o} role="none">
                <button
                  ref={(el) => { optRefs.current[i] = el; }}
                  id={`exp-opt-${i}`}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  tabIndex={-1}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                  style={{
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    minHeight: 36,
                    padding: "7px 12px 7px 36px",
                    borderRadius: 9,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    textAlign: "left",
                    outline: "none",
                    transition: "background .12s ease, color .12s ease",
                    background: isSel ? "#EAF1FC" : isAct ? "#F1F4F9" : "transparent",
                    color: isSel ? "#1E47A8" : "#1F2937",
                    fontWeight: isSel ? 600 : 400,
                  }}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>{o}</span>
                  {isSel && <Check size={16} color="#2B5ED3" style={{ flexShrink: 0 }} />}
                </button>
              </li>
            );
          })}
        </ul>,
        document.body,
      )}
      {error && <p role="alert" style={{ fontSize: 12, color: "#E5484D", margin: "5px 4px 0", lineHeight: 1.4 }}>{error}</p>}
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel, nextIcon: NextIcon = ArrowRight, nextDisabled, ready, footer }: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextIcon?: LucideIcon;
  nextDisabled?: boolean;
  ready?: boolean;
  footer?: string;
}) {
  return (
    <>
      <div style={{ display: "flex", gap: 12 }}>
        {onBack && <button className="btn-ghost" onClick={onBack}><ArrowLeft size={17} /> Назад</button>}
        <button className={`btn-primary ${ready && !nextDisabled ? "ready" : ""}`} onClick={onNext} disabled={nextDisabled}>
          {nextLabel} <NextIcon size={18} />
        </button>
      </div>
      {footer && <p style={{ textAlign: "center", fontSize: 12.5, color: "#9AA0AA", marginTop: 12 }}>{footer}</p>}
    </>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder, hint, done, error, onBlur, maxLength, inputMode, compact }: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  done: boolean;
  error?: string;
  onBlur?: () => void;
  maxLength?: number;
  inputMode?: "text" | "email" | "tel" | "numeric";
  compact?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  const accent = error ? "#E5484D" : focus || done ? "#2B5ED3" : "#9AA0AA";
  return (
    <div style={{ marginBottom: compact ? 0 : 14 }}>
      <div className={`field ${focus ? "focus" : ""} ${done && !error ? "done" : ""} ${error ? "error" : ""}`}>
        <Icon size={18} color={accent}
          style={{ position: "absolute", left: 13, top: 13, transition: "color .25s ease" }} />
        <label style={{ display: "block", fontSize: 11.5, color: error ? "#E5484D" : focus ? "#2B5ED3" : "#9AA0AA",
          fontWeight: 500, transition: "color .25s ease" }}>
          {label} <span style={{ color: "#2B5ED3" }}>*</span>
        </label>
        <input value={value} maxLength={maxLength} inputMode={inputMode} aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)} onFocus={() => setFocus(true)}
          onBlur={() => { setFocus(false); onBlur?.(); }} placeholder={placeholder} />
        <span className="tick"><Check size={13} strokeWidth={3} /></span>
      </div>
      {error ? (
        <p role="alert" style={{ fontSize: 12, color: "#E5484D", margin: "5px 4px 0", lineHeight: 1.4 }}>{error}</p>
      ) : hint ? (
        <p style={{ fontSize: 12, color: "#9AA0AA", margin: "5px 4px 0", lineHeight: 1.4 }}>{hint}</p>
      ) : null}
    </div>
  );
}

function SuccessView({ selected, unsure, isApplication, roleTitle }: {
  selected: string[]; unsure: boolean; isApplication?: boolean; roleTitle?: string;
}) {
  const labels = DIRECTIONS.filter((s) => selected.includes(s.id) && s.id !== "unsure").map((s) => s.label);
  return (
    <div style={{ height: "100%", minHeight: 380, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center", gap: 16 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(43,94,211,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Sparkles size={30} color="#2B5ED3" />
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
        {isApplication ? "Отклик отправлен!" : "Заявка отправлена!"}
      </h3>
      <p style={{ fontSize: 15, color: "#6B7280", maxWidth: 330, lineHeight: 1.5 }}>
        {isApplication
          ? `Спасибо за отклик${roleTitle ? ` на «${roleTitle}»` : ""}! Посмотрим и свяжемся с вами в течение пары дней.`
          : unsure
          ? "Напишем в Telegram в течение пары часов, зададим пару вопросов и поможем разобраться."
          : `Напишем в Telegram в течение пары часов и пришлём варианты решения${labels.length ? ` по: ${labels.join(", ")}` : ""}.`}
      </p>
    </div>
  );
}
