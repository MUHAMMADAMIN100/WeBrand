# Редизайн WeBrand — Этап 0: дизайн-основа и концепт главной

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Заложить дизайн-систему Bold Kinetic и motion-инфраструктуру в `frontend/`, собрать живой концепт главной (шапка, hero, тикер, услуги, портфолио) и выдать владельцу preview-ссылку на утверждение.

**Architecture:** Редизайн на месте в ветке `redesign`: меняется только слой представления, маршруты/`lib/api.ts`/SEO/логика форм не трогаются. Семантические токены через CSS-переменные + Tailwind 3.4 (конвенции shadcn/ui, чтобы компоненты 21st.dev вставали без переделки). Движение: GSAP (ScrollTrigger, SplitText) для сюжетных сцен, Lenis для плавного скролла, Framer Motion остаётся на компонентном уровне. Тяжёлое (WebGL, пин-скролл) — только на способных устройствах и после первой отрисовки.

**Tech Stack:** Next.js 15 App Router · React 19 · TypeScript · Tailwind 3.4 · Framer Motion 11 · GSAP 3.13+ (`gsap`, `@gsap/react`) · Lenis · raw WebGL (без three.js) · Playwright (Python) для приёмки.

**Spec:** `docs/superpowers/specs/2026-09-17-webrand-redesign-design.md`

## Global Constraints

- Ветка `redesign`; в `main` ничего не пушить до явного «мержи». Пуш ветки разрешён — он даёт preview-ссылку (спека §10).
- Tailwind остаётся **v3.4**. Новые зависимости — только перечисленные в Tech Stack плюс `clsx`, `tailwind-merge`.
- Шрифты только с кириллицей, только через `next/font`: **Unbounded** (заголовки), **Manrope** (текст), **JetBrains Mono** (метки).
- `brand-600 = #2B5ED3` не меняется. Акцент — электрик-лайм `#C8F135`, всегда с тёмным текстом поверх.
- Контраст текста ≥ 4.5:1. Тач-цели ≥ 44 px. Видимый фокус у всего интерактивного.
- `prefers-reduced-motion: reduce` → никаких сюжетных анимаций; контент обязан быть виден без JS-анимаций.
- Ровно один `<h1>` на странице; его текстовое содержимое не меняется от анимаций (SEO).
- Не ломать: якоря `#top #about #services #portfolio #cta`, `id="service-N"` у карточек услуг, событие `webrand:service-highlight`, маршруты-фильтры портфолио, `openTelegram`, `ModalContext`.
- Гейт корректности проекта — `npm run build` в `frontend/`. Приёмка поведения — Playwright-скрипты в scratchpad (в репозитории тестовой инфраструктуры нет, и спека её не вводит).
- Ширины проверки: 390, 768, 1440. Горизонтального скролла быть не должно ни на одной.
- Коммиты заканчиваются строкой `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

## Карта файлов

| Файл | Ответственность |
|---|---|
| `frontend/components.json` | конфиг shadcn-реестра (алиасы `@/components`, `@/lib/utils`) |
| `frontend/src/lib/utils.ts` | `cn()` — склейка классов (clsx + tailwind-merge) |
| `frontend/tailwind.config.ts` | токены: цвета `ink/paper/lime` + семантика, шрифты, fluid-размеры, easing, keyframes |
| `frontend/src/app/globals.css` | CSS-переменные тем, базовая типографика, утилиты; снят `scroll-snap` и CSS-smooth (их заменяет Lenis) |
| `frontend/src/app/layout.tsx` | подключение трёх шрифтов, классы переменных на `<html>` |
| `frontend/src/lib/capabilities.ts` | `useCapabilities()` — fine pointer / reduced motion / WebGL / экономия трафика |
| `frontend/src/components/motion/SmoothScroll.tsx` | Lenis + синхронизация с ScrollTrigger, якоря с отступом под шапку |
| `frontend/src/components/motion/RevealText.tsx` | проявление текста по строкам/словам (SplitText), SEO-безопасно |
| `frontend/src/components/motion/Marquee.tsx` | бегущая строка, скорость зависит от скорости скролла |
| `frontend/src/components/motion/Magnetic.tsx` | «магнитная» обёртка для кнопок (только fine pointer) |
| `frontend/src/components/webgl/BlobCanvas.tsx` | raymarched-капля на чистом WebGL, реагирует на курсор |
| `frontend/src/components/webgl/HeroVisual.tsx` | выбор: WebGL-капля или CSS-фолбэк; ленивая загрузка |
| `frontend/src/components/ui/Button.tsx` | кнопка дизайн-системы (варианты primary/ink/ghost/lime) |
| `frontend/src/components/ui/SectionLabel.tsx` | моно-метка секции «01 / УСЛУГИ» |
| `frontend/src/components/Navbar.tsx` | шапка в новом стиле; логика (активная секция, мобильное меню, фокус-ловушка) сохраняется |
| `frontend/src/components/Hero.tsx` | новый hero |
| `frontend/src/components/ServicesTicker.tsx` | тикер услуг между hero и «О компании» |
| `frontend/src/components/Services.tsx` | услуги как липкая стопка; хук подсветки и модалки сохраняются |
| `frontend/src/components/portfolio/CasePoster.tsx` | визуал кейса: обложка, иначе постер из логотипа + `accent` |
| `frontend/src/components/portfolio/CaseCard.tsx` | карточка кейса (ссылка на `/portfolio/[slug]`) |
| `frontend/src/components/Portfolio.tsx` | секция: заголовок, фильтры-маршруты, сетка, пагинация (логика прежняя) |
| `frontend/src/components/HomeContent.tsx` | вставка тикера в порядок секций |

---

### Task 1: Ветка, зависимости, shadcn-конвенции

**Files:**
- Create: `frontend/components.json`, `frontend/src/lib/utils.ts`
- Modify: `frontend/package.json` (через `npm install`)

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` из `@/lib/utils`.

- [ ] **Step 1:** `git checkout -b redesign` от актуального `main`; закоммитить спеку и этот план.
- [ ] **Step 2:** `cd frontend && npm install gsap @gsap/react lenis clsx tailwind-merge`
- [ ] **Step 3:** Создать `src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** shadcn/ui convention — every 21st.dev component imports this. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4:** Создать `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 5:** `npx tsc --noEmit` → exit 0. Коммит `chore(redesign): branch, motion deps, shadcn conventions`.

---

### Task 2: Токены, шрифты, базовая типографика

**Files:**
- Modify: `frontend/tailwind.config.ts`, `frontend/src/app/globals.css`, `frontend/src/app/layout.tsx`

**Interfaces:**
- Produces (Tailwind): цвета `ink-{50..950}`, `paper`, `paper-2`, `lime` (`DEFAULT/#C8F135`, `deep`), семантика `background/foreground/muted/border/ring/primary/accent`; `font-display`, `font-sans`, `font-mono`; размеры `text-display-xl|lg|md` (fluid, `clamp`); easing `ease-expo`; анимации `marquee`, `marquee-reverse` (существующие сохраняются).
- Produces (CSS): переменные `--header-h`, `--font-unbounded`, `--font-manrope`, `--font-jbmono`; классы `.anchor-target`, `.article-body` сохраняются.

- [ ] **Step 1:** В `layout.tsx` подключить `Unbounded` (`subsets: ['latin','cyrillic']`, `variable: '--font-unbounded'`, `display: 'swap'`) и `JetBrains_Mono` (так же, `--font-jbmono`); повесить все три `.variable` на `<html>`.
- [ ] **Step 2:** В `tailwind.config.ts` добавить `fontFamily.display = ['var(--font-unbounded)', 'var(--font-manrope)', 'system-ui']`, `fontFamily.mono = ['var(--font-jbmono)', 'ui-monospace', 'monospace']`; цвета `ink`, `paper`, `lime`; fluid-размеры:

```ts
fontSize: {
  'display-xl': ['clamp(2.6rem, 8.2vw, 9rem)', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
  'display-lg': ['clamp(2.2rem, 5.6vw, 5.5rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
  'display-md': ['clamp(1.7rem, 3.4vw, 3rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
},
transitionTimingFunction: { expo: 'cubic-bezier(0.16, 1, 0.3, 1)' },
```

- [ ] **Step 3:** В `globals.css`: объявить семантические переменные в `:root`; `body` → `bg-paper text-ink-950`; снять `scroll-behavior: smooth` и `scroll-snap-type` с `html` (их берёт на себя Lenis; иначе двойное сглаживание и «залипание» при пин-скролле); оставить `--header-h`, `.anchor-target`, `.article-body`, блок reduced-motion.
- [ ] **Step 4:** `npm run build` → успех. Playwright: `document.fonts.check('700 48px Unbounded')`-эквивалент — у `h1` в computed `font-family` присутствует значение переменной Unbounded; на 390 px `scrollWidth <= innerWidth`.
- [ ] **Step 5:** Коммит `feat(redesign): design tokens, Unbounded/Manrope/JetBrains Mono, base typography`.

---

### Task 3: Motion-инфраструктура

**Files:**
- Create: `src/lib/capabilities.ts`, `src/components/motion/{SmoothScroll,RevealText,Marquee,Magnetic}.tsx`
- Modify: `src/app/providers.tsx` (обернуть в `SmoothScroll`)

**Interfaces:**
- Produces:
  - `useCapabilities(): { ready: boolean; finePointer: boolean; reducedMotion: boolean; webgl: boolean; saveData: boolean; rich: boolean }` — `rich = finePointer && !reducedMotion && !saveData` (порог для тяжёлых эффектов). До гидрации `ready=false`, все флаги `false` → сервер и первый клиентский рендер совпадают.
  - `<SmoothScroll>{children}</SmoothScroll>` — клиентский провайдер. Якорные ссылки `a[href^="#"]` скроллят плавно с отступом `--header-h + 20`. При `reducedMotion` Lenis не создаётся.
  - `<RevealText as="h1" by="lines" delay={0.1} className="…">Текст</RevealText>` — оборачивает детей; текст остаётся в DOM как есть (SEO), `aria-label` сохраняет исходную строку; сплит после `document.fonts.ready`; при `reducedMotion` — без сплита.
  - `<Marquee speed={60} reverse={false} className="…">…</Marquee>` — дублирует детей, сдвиг на `transform`, скорость множится на скорость скролла; `aria-hidden` у дубля.
  - `<Magnetic strength={0.35}>…</Magnetic>` — только при `finePointer`.

- [ ] **Step 1:** Написать `capabilities.ts` (matchMedia `(pointer: fine)`, `(prefers-reduced-motion: reduce)`, `navigator.connection?.saveData`, проба WebGL-контекста на offscreen-canvas; подписка на изменения media query).
- [ ] **Step 2:** `SmoothScroll.tsx`: Lenis (`lerp` ≈ 0.1, `anchors: { offset: -(headerH + 20) }`), `gsap.ticker` гонит `lenis.raf`, `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.lagSmoothing(0)`; очистка на unmount.
- [ ] **Step 3:** `RevealText.tsx` на `useGSAP` + `SplitText` (`type: 'lines'|'words'`, `mask: 'lines'`, `autoSplit: true`, анимация в `onSplit` — переживает ресайз).
- [ ] **Step 4:** `Marquee.tsx` (Framer Motion: `useScroll` → `useVelocity` → `useSpring` → `useAnimationFrame`, wrap по ширине половины), `Magnetic.tsx` (`useMotionValue` + spring).
- [ ] **Step 5:** Приёмка Playwright: клик по чипу hero по-прежнему приводит карточку услуги под шапку (`top` в диапазоне 80–140 px) и включает подсветку — существующий `test_chips.py` зелёный; при `reduced_motion='reduce'` контент виден, Lenis-класса на `html` нет.
- [ ] **Step 6:** Коммит `feat(redesign): motion infrastructure — Lenis, RevealText, Marquee, Magnetic, capability gating`.

---

### Task 4: UI-примитивы и шапка

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/SectionLabel.tsx`
- Modify: `src/components/Navbar.tsx`

**Interfaces:**
- Produces: `<Button variant="primary|ink|ghost|lime" size="md|lg" asChild? />` (рендерит `button` или переданный `a`), `<SectionLabel index="02">Услуги</SectionLabel>` → моно-метка `02 / УСЛУГИ`.
- Navbar сохраняет: `nav` из `content.ts`, `resolveHash`, IntersectionObserver активной секции, мобильное меню с фокус-ловушкой и `Esc`, `openModal()` на CTA, `aria-*`.

- [ ] **Step 1:** Кнопка и метка. **Step 2:** Шапка: плавающая «пилюля» на `paper` с блюром после скролла, пункты — моно/semibold, активный — лайм-маркер под словом, CTA — `Button variant="ink"` в `Magnetic`. Мобильное меню — полноэкранное на `ink` с гигантскими пунктами `font-display`.
- [ ] **Step 3:** Приёмка: все пункты шапки кликаются и ведут куда раньше; мобильное меню открывается/закрывается, `Esc` закрывает, Tab ходит по кругу внутри; CTA открывает модалку.
- [ ] **Step 4:** Коммит `feat(redesign): Button, SectionLabel, kinetic navbar`.

---

### Task 5: Hero

**Files:**
- Create: `src/components/webgl/BlobCanvas.tsx`, `src/components/webgl/HeroVisual.tsx`
- Modify: `src/components/Hero.tsx`

**Interfaces:**
- Consumes: `RevealText`, `Magnetic`, `Button`, `useCapabilities`, `heroTags`, `requestServiceHighlight`, `useModal`.
- Produces: секция `id="top"`; ровно один `<h1>` с текстом «Превращаем бизнес в digital-бренд»; пять чипов-ссылок с прежними `href` и `onClick`; кнопка «Связаться с нами» (модалка) и ссылка «Смотреть работы» (`#portfolio`).
- `BlobCanvas`: `<canvas>` на весь блок, `alpha: true`, фрагментный шейдер — raymarching по SDF из сглаженно объединённых сфер (smooth-min), синее тело `#2B5ED3`, лаймовый контровой свет, fresnel; юниформы `uTime`, `uPointer` (сглаженный), `uRes`; `devicePixelRatio` ограничен 1.5; рендер останавливается, когда hero вне вьюпорта (IntersectionObserver) и при скрытой вкладке; обработка `webglcontextlost`.
- `HeroVisual`: при `caps.ready && caps.rich && caps.webgl` лениво (`next/dynamic`, `ssr:false`) монтирует `BlobCanvas` после `requestIdleCallback`; иначе — CSS-фолбэк (радиальные градиенты, без анимации при reduced-motion).

- [ ] **Step 1:** Вёрстка hero: сетка-фон, гигантский `h1` (`text-display-xl font-display`), слово «digital-бренд» на лаймовой плашке-маркере; справа/позади — `HeroVisual`; ниже подзаголовок, чипы, CTA, строка доверия «30+ компаний» и моно-подсказка скролла.
- [ ] **Step 2:** `BlobCanvas` + `HeroVisual`. Если за 3 итерации визуал капли не дотягивает до премиального — заменить на `@react-three/fiber` + `MeshDistortMaterial` (ленивый чанк, тот же гейтинг); решение зафиксировать в коммите.
- [ ] **Step 3:** Приёмка: один `h1`, `textContent` совпадает со строкой; на 1440 есть `canvas`, на 390 и при reduced-motion его нет; чипы проходят `test_chips.py`; нет горизонтального скролла; нет ошибок консоли; LCP-элемент — текст, не canvas.
- [ ] **Step 4:** Коммит `feat(redesign): kinetic hero with lazy WebGL blob`.

---

### Task 6: Тикер услуг

**Files:**
- Create: `src/components/ServicesTicker.tsx`
- Modify: `src/components/HomeContent.tsx`

**Interfaces:**
- Consumes: `Marquee`, `services` из `content.ts` (названия услуг и подуслуг — реальные данные, ничего не выдумывается).
- Produces: декоративная полоса (`aria-hidden`), два ряда навстречу: `font-display` гигантским кеглем, через разделитель-звёздочку; один ряд — контур (`-webkit-text-stroke`), второй — заливка; фон `ink`, текст `paper`/лайм.

- [ ] **Step 1:** Компонент. **Step 2:** Вставить после `<Hero />`. **Step 3:** Приёмка: `transform` ряда меняется со временем; при reduced-motion ряды статичны; нет горизонтального скролла страницы. **Step 4:** Коммит `feat(redesign): services ticker`.

---

### Task 7: Услуги — липкая стопка

**Files:**
- Modify: `src/components/Services.tsx`

**Interfaces:**
- Сохраняются: `id="services"`, `id={serviceAnchorId(service.id)}` и класс `anchor-target` на каждой карточке, хук `useHighlightedService`, `openServiceDetail({ parent, sub })`, `openModal(directionsForService(title))`, ссылка «Написать в TG» с `openTelegram`.
- Produces: на ≥ `lg` и `caps.rich` — каждая карточка `position: sticky; top: calc(var(--header-h) + 24px + index * 14px)`, предыдущая при наезде следующей уменьшается (`scale` до ~0.94) и слегка темнеет — через `useScroll({ target })` + `useTransform`. На мобильном — обычная вертикальная колонка без sticky. Карточки — крупные цветовые блоки: 01 `brand-600`/белый текст, 02 `ink-950`/`paper`, 03 `lime`/`ink`, 04 `paper-2`/`ink` с обводкой; огромный номер `font-display`, список подуслуг — строки с моно-индексом и стрелкой.
- Подсветка (`highlighted`) — кольцо `ring-4 ring-lime` (на синей/тёмной карточке) или `ring-brand-600` (на светлой).

- [ ] **Step 1:** Вёрстка и sticky-логика. **Step 2:** Приёмка: `test_chips.py` зелёный (порог `top` при необходимости пересчитать под новый отступ sticky — зафиксировать в тесте причину); клик по подуслуге открывает `ServiceDetailModal`; стрелка «Заказать» открывает квиз с предвыбранным направлением; клавиатурой всё достижимо.
- [ ] **Step 3:** Коммит `feat(redesign): services as a sticky card stack`.

---

### Task 8: Портфолио — обложки и постер-фолбэк

**Files:**
- Create: `src/components/portfolio/CasePoster.tsx`, `src/components/portfolio/CaseCard.tsx`
- Modify: `src/components/Portfolio.tsx`

**Interfaces:**
- `CasePoster({ item, priority? })`: если `item.cover` — `<img>` (object-cover, `loading="lazy"`, `decoding="async"`, заданные `width/height` → без CLS); иначе постер: фон — `item.accent` (с проверкой яркости → тёмный или светлый текст), гигантские инициалы/название `font-display` как фактура, логотип на белой плашке по центру, моно-метка категории. Hover (fine pointer): масштаб визуала 1.04, плашка «Смотреть кейс →» выезжает снизу.
- `CaseCard({ item, index, featured? })`: `<article>` со stretched-link на `/portfolio/${slug}`; без `slug` — не ссылка, метка «Кейс скоро». `featured` занимает 2 колонки.
- `Portfolio`: логика `pathToFilter/filterToPath/FILTER_ROUTES/didInitialPortfolioScroll/PER_PAGE` без изменений; фильтры — крупные моно-табы с лайм-индикатором (`layoutId`), сетка: первый кейс страницы `featured`, остальные 2 колонки на `md`, 3 на `xl`.
- Helper `readableOn(hex: string): 'ink' | 'paper'` — в `CasePoster.tsx`, по относительной яркости WCAG.

- [ ] **Step 1:** `CasePoster` + `readableOn`. **Step 2:** `CaseCard`. **Step 3:** Пересобрать секцию `Portfolio`.
- [ ] **Step 4:** Приёмка: фильтр меняет URL без прыжка вьюпорта; прямой заход на `/smmprojects` доскролливает к портфолио; карточки ведут на `/portfolio/<slug>`; постер читаем на всех 14 локальных проектах (контраст текста на `accent` ≥ 4.5:1 — проверить расчётом в тесте); загрузить одну обложку локально через API админки и убедиться, что карточка стала картиночной, затем удалить; пагинация работает.
- [ ] **Step 5:** Коммит `feat(redesign): portfolio with cover-led cards and accent posters`.

---

### Task 9: Сквозная приёмка концепта и preview

**Files:** только scratchpad-тесты.

- [ ] **Step 1:** `npm run build` — успех.
- [ ] **Step 2:** Полный Playwright-прогон на 1440 / 768 / 390: ошибки консоли, горизонтальный скролл, один `h1`, чипы, шапка, мобильное меню, модалки (квиз открывается из hero и из карточки услуги), фильтры и карточки портфолио, reduced-motion, только-клавиатура. Остальные маршруты (`/smm`, `/vacancies`, `/news`, `/brief`, `/portfolio/<slug>`, 404) открываются без ошибок и без поломанной вёрстки после смены глобальных токенов.
- [ ] **Step 3:** Скриншоты концепта (десктоп + мобильный) в scratchpad.
- [ ] **Step 4:** `git push -u origin redesign`; дождаться preview-деплоя Vercel (`vercel ls we-brand`); проверить, что preview получает данные API (переменная `NEXT_PUBLIC_API_URL` для окружения Preview); прогнать по preview-URL смоук-тест.
- [ ] **Step 5:** Отчёт владельцу: ссылка, скриншоты, что проверено / что нет, лаймовый и оранжевый варианты акцента → ждать «ок».

---

## Self-Review

- **Покрытие спеки (этап 0, §10):** ветка — Task 1; токены/шрифты — Task 2; motion-инфраструктура — Task 3; hero + тикер + услуги + портфолио — Tasks 5–8; preview + скриншоты — Task 9. Шапка добавлена в Task 4, потому что она видна на первом экране концепта. Курсор, интро, переходы, остальные секции — этап 1, сюда не входят.
- **Плейсхолдеры:** финальная JSX-разметка визуальных компонентов намеренно не выписана построчно — она доводится по скриншотам; вместо этого у каждого компонента зафиксированы контракт, техника и измеримая приёмка. Инфраструктурный код, где содержимое известно заранее, приведён полностью.
- **Согласованность имён:** `useCapabilities().rich` используется в Tasks 5, 7; `cn` — везде; `serviceAnchorId`/`requestServiceHighlight` — из существующего `lib/serviceAnchors.ts`; `readableOn` определён и используется в Task 8.
