# Редизайн WeBrand — Этап 1: главная целиком

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Довести главную до конца в утверждённом стиле Bold Kinetic: «О компании», «Процесс», «Партнёры», новый FAQ, CTA, футер, плюс кастомный курсор, интро и переходы между страницами.

**Architecture:** Продолжение этапа 0 в ветке `redesign`. Те же токены, примитивы (`Button`, `RevealText`, `Marquee`, `Magnetic`, `useCapabilities`, `useReducedMotionSafe`, `scrollToElement`). Сюжетные сцены строятся на CSS `sticky` + Framer Motion `useScroll`, а не на GSAP-pin: sticky не конфликтует с Lenis и сменой маршрутов.

**Tech Stack:** Next.js 15 · React 19 · Tailwind 3.4 · Framer Motion 11 · GSAP (только RevealText) · Lenis.

**Spec:** `docs/superpowers/specs/2026-09-17-webrand-redesign-design.md` · концепт утверждён владельцем 2026-09-17, акцент — **лайм `#C8F135`**.

## Global Constraints

- Ветка `redesign`; `main` не трогать до «мержи». Коммиты заканчиваются `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Тексты секций — существующие, слово в слово. Новое пишется только из фактов, уже заявленных на сайте; ничего не выдумывать (цены, цифры, отзывы).
- Нумерация 01–04 — только в «Процессе» (это реальная последовательность). Никаких декоративных надписей-«бровей» над заголовками.
- Сохранить якоря `#about`, `#cta`; ссылку «Блог» → `/news` в футере (SEO); `openTelegram` на ссылках Telegram; `openModal()` на CTA.
- Разметка не ветвится по reduced-motion при первом рендере (`useReducedMotionSafe`). Контраст ≥ 4.5:1. Тач-цели ≥ 44px. Нет горизонтального скролла на 390px — включая всю главную целиком (остаток 10px от старой «О компании» должен исчезнуть).
- Гейты: `npx tsc --noEmit`, `npm run build`, Playwright-приёмка (`test_concept.py`, `test_chips.py` + новые проверки), Lighthouse не ниже этапа 0 (моб. ≥ 85, a11y ≥ 95, SEO 100, CLS < 0.1).

---

### Task 1: «О компании» — манифест с заливкой при скролле
**Files:** Modify `src/components/About.tsx`. Create `src/components/motion/ScrollFillText.tsx`.
- [ ] `ScrollFillText`: делит текст на слова (`<span>`), каждое слово переходит от `ink-300` к `ink-950` по мере прокрутки абзаца (`useScroll({target, offset:['start 0.85','end 0.45']})` + `useTransform` на opacity слоя). Текст целиком в DOM (SEO); при reduced-motion — сразу полный цвет.
- [ ] Секция: заголовок «Делаем сильные бренды для бизнеса» (`RevealText`), первый абзац — крупным манифестом с заливкой, второй — обычным текстом, кнопка «Обсудить проект» → `openModal()`. Ценности (Скорость/Результат/Команда/Рост) — редакционные строки «название слева, описание справа» с волосяными разделителями, не карточки с иконками.
- [ ] Приёмка: `#about` на месте; нет `x`-въездов (они давали +10px ширины на мобильном); текст читается без JS.

### Task 2: «Процесс» — горизонтальная сцена на sticky
**Files:** Modify `src/components/Process.tsx`.
- [ ] Тёмная секция (`ink-950`). При `caps.rich` и ≥ `lg`: секция высотой ~`4 × 100vh`, внутри `sticky top-0 h-screen`; дорожка из 4 панелей сдвигается по X на `scrollYProgress` (дистанция = ширина дорожки − ширина окна, меряется `ResizeObserver`); лаймовая полоса прогресса. Иначе — вертикальный список.
- [ ] Панель: номер контуром (`text-stroke`), заголовок `display-lg`, описание. Тексты шагов прежние.
- [ ] Приёмка: на 1440 панели проезжают и секция отпускает скролл дальше; на 390 и reduced-motion — вертикально, без sticky; клавиатура/скринридер видят 4 шага по порядку (`<ol>`).

### Task 3: «Партнёры» — стена логотипов
**Files:** Modify `src/components/Partners.tsx`.
- [ ] Заголовок «Нам доверяют» + подзаголовок (прежние). Два встречных ряда на `Marquee`, логотипы на белых плашках; при reduced-motion — статичная сетка со всеми логотипами (после монтирования, без ветвления разметки на сервере).
- [ ] Приёмка: все 16 партнёров из `content.ts` присутствуют; нет горизонтального скролла.

### Task 4: FAQ — новая секция
**Files:** Modify `src/data/content.ts` (массив `faq`), create `src/components/Faq.tsx`, modify `src/components/HomeContent.tsx` (вставка после «Партнёров» + JSON-LD `FAQPage`).
- [ ] 7 вопросов, ответы собраны из уже существующих на сайте фактов: сроки из `services[].items[].timeline`, этапы из «Процесса», «первая консультация бесплатно», «отвечаем за пару часов в рабочее время», сопровождение после запуска. Цены не называются.
- [ ] Аккордеон: `<button aria-expanded aria-controls>`, высота анимируется Framer Motion, один открыт за раз, стрелка/плюс поворачивается. Работает с клавиатуры.
- [ ] Приёмка: клик/Enter раскрывает, `aria-expanded` меняется; JSON-LD валиден и совпадает с текстом.

### Task 5: CTA и футер
**Files:** Modify `src/components/CTA.tsx`, `src/components/Footer.tsx`.
- [ ] CTA `#cta`: синий блок во всю ширину, гигантское «Готовы вырасти?», бейдж «Свободны для новых проектов», действия: заявка (`openModal`), телефон, email. Лаймовая главная кнопка в `Magnetic`.
- [ ] Футер: `ink-950`, гигантский вордмарк-фактура, навигация (hash-ссылки через `resolveHash`), «Блог» → `/news`, контакты, соцсети (Telegram с `openTelegram`, Instagram, WhatsApp), копирайт, «наверх» через `scrollToElement`.
- [ ] Приёмка: `test_tg.py` зелёный (откат Telegram, Instagram/WhatsApp нативно); «наверх» возвращает к `scrollY=0`.

### Task 6: Курсор, интро, переходы
**Files:** Create `src/components/motion/Cursor.tsx`, `src/components/motion/Intro.tsx`, `src/app/template.tsx`. Modify `src/components/SiteShell.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/components/portfolio/CaseCard.tsx`.
- [ ] Курсор (только `caps.rich`): нативный курсор остаётся; следящий диск появляется лишь над `[data-cursor]` — над постерами кейсов лаймовый диск «Смотреть». `pointer-events:none`, `aria-hidden`.
- [ ] Интро: ≤ 0.9 с, раз за сессию. Крошечный inline-скрипт в `<head>` ставит `html[data-intro]` до первой отрисовки (без вспышки и без ошибки гидратации); шторка и задержка hero — чистый CSS; при reduced-motion не играет.
- [ ] Переходы: `template.tsx` — входная шторка на смене маршрута; между маршрутами-фильтрами портфолио (`/`, `/devprojects`, …) не играет.
- [ ] Приёмка: интро не играет повторно в той же сессии; фильтр портфолио не вызывает шторку; LCP не ухудшился.

### Task 7: Сквозная приёмка этапа 1
- [ ] `tsc`, `npm run build`, `test_chips.py`, `test_concept.py` (+ новые проверки секций), `test_tg.py`, Lighthouse моб./деск. на продакшен-сборке.
- [ ] Вся главная на 390px без горизонтального скролла. Скриншоты в `c:\temp\webrand-concept\`.
- [ ] Пуш `redesign`, проверка preview через `vercel curl`, отчёт владельцу.
