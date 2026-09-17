# Редизайн WeBrand — Этап 2: внутренние страницы и формы

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести все внутренние страницы публичного сайта и все формы/модалки на дизайн-систему Bold Kinetic, не меняя логику, данные, SEO и контракты с бэкендом.

**Architecture:** Ветка `redesign`, те же токены и примитивы, что на главной (`Button`, `RevealText`, `CasePoster`, `cn`, `useCapabilities`, `scrollToElement`). Серверные страницы остаются серверными (данные и metadata не трогаем) — меняется только разметка представления. Формы: логика, валидация, шаги, honeypot, отправка — без изменений; меняются классы/стили.

**Tech Stack:** Next.js 15 App Router · React 19 · Tailwind 3.4 · Framer Motion 11.

**Spec:** `docs/superpowers/specs/2026-09-17-webrand-redesign-design.md` (§5.2, §7).

## Global Constraints

- `main` не трогать. Коммиты заканчиваются `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Не менять: `generateMetadata`/`metadata`, JSON-LD, canonical, один `<h1>` на страницу, семантику `<article>` в блоге, `.article-body` как контракт с HTML из админки, `sitemap`/`robots`.
- Не менять контракты форм: id направлений квиза (`smm/design/dev/ads/unsure`), `kind: 'lead' | 'application'`, `role = slug` вакансии, PDF-резюме ≤ 10 МБ, honeypot `company`, enum опыта и границы возраста, тексты ошибок сервера.
- Блог — читаемость важнее эффектов: светлая страница, колонка ≤ 75 знаков, без сюжетных анимаций.
- Кастомные `text-*` размеры — только через зарегистрированные в `lib/utils.ts`. Разметка не ветвится по reduced-motion при первом рендере. Контраст ≥ 4.5:1 (крупный текст ≥ 3:1), тач-цели ≥ 44px, нет горизонтального скролла на 390px.
- Гейты: `tsc`, `npm run build`, существующие наборы (`test_chips`, `test_concept`, `test_tg`, `test_phase1`) + новый `test_phase2.py`, Lighthouse не ниже этапа 1 на `/` и ≥ 90 a11y на внутренних.

---

### Task 1: Страница кейса `/portfolio/[slug]`
**Files:** Modify `src/app/portfolio/[slug]/page.tsx`. Delete `src/components/BrowserMockup.tsx`, если больше нигде не используется.
- [ ] Шапка кейса: категория, `<h1>` названием проекта (`font-display`), подзаголовок; крупный `CasePoster size="hero"` (обложка или постер из акцента/логотипа); описание (`case_description` → fallback `description`), теги, ссылка на живой сайт (`site_url`), «Все работы», блок CTA «Обсудить похожий проект».
- [ ] Приёмка: metadata/JSON-LD как были; несуществующий slug → 404; ссылка «Все работы» ведёт на `/#portfolio`.

### Task 2: Блог `/news` и `/news/[slug]`
**Files:** Modify `src/app/news/page.tsx`, `src/app/news/[slug]/page.tsx`, `src/components/ArticleCard.tsx`, `.article-body` в `globals.css`.
- [ ] Список: заголовок `font-display`, карточки статей в новой системе, пагинация `?page=N` без изменений логики.
- [ ] Статья: `<article>`, один `<h1>`, дата, обложка, типографика `.article-body` на токенах `ink`/`brand` (заголовки статьи — Manrope, не Unbounded: длинные заголовки в широком гротеске нечитаемы).
- [ ] Приёмка: `NewsArticle` JSON-LD на месте; пагинация работает; локально новостей нет → проверка пустого состояния + проверка на данных прода через `NEXT_PUBLIC_API_URL`.

### Task 3: Вакансии `/vacancies`
**Files:** Modify `src/components/Careers.tsx`, `src/app/vacancies/page.tsx`.
- [ ] Список вакансий — строки/карточки в новой системе; «Откликнуться» по-прежнему вызывает `openApply({ role: slug, title, … })`.
- [ ] Приёмка: клик открывает модалку в режиме отклика с названием вакансии; черновик-вакансия не показывается анониму.

### Task 4: SMM `/smm`
**Files:** Modify `src/app/smm/page.tsx`, `src/components/SmmReels.tsx`, `SmmPartners.tsx`, `SmmProjects.tsx`.
- [ ] Hero страницы, рилсы (YouTube), партнёры с модалкой, SMM-проекты (через `CaseCard`). Пустые состояния (локально рилсов/партнёров нет) — осмысленные.
- [ ] Приёмка: модалка партнёра открывается/закрывается, Esc, скролл под ней заблокирован.

### Task 5: Бриф `/brief` и 404
**Files:** Modify `src/components/BriefForm.tsx`, `src/app/brief/page.tsx`, `src/app/not-found.tsx`.
- [ ] Бриф: поля, группы, кнопки — на токенах; логика и отправка без изменений.
- [ ] 404: гигантское «404» `font-display`, кнопка на главную; страница остаётся без `SiteShell`.

### Task 6: Модалки и квиз
**Files:** Modify `src/components/ContactModal.tsx`, `ContactForm.tsx`, `ServiceDetailModal.tsx`.
- [ ] Только внешний вид: палитра (`ink`/`paper`/`brand`/`lime`), шрифты, радиусы, кнопки, фокус-кольца. Шаги, валидация, preselect, режим отклика с PDF, сообщения об ошибках — без изменений.
- [ ] Приёмка (локально, с `http://localhost:3000` в CORS локального `.env`): полный квиз → 201 → заявка видна в `/api/leads/journal/`; отклик с PDF → заявка `kind=application` с резюме; не-PDF отклоняется; honeypot → тихий 200 без записи. Тестовые записи после проверки удалить.

### Task 7: Сквозная приёмка этапа 2
- [ ] `tsc`, `npm run build`, все наборы тестов, Lighthouse (`/`, `/news`, `/vacancies`, `/portfolio/<slug>`).
- [ ] Все маршруты на 390px без горизонтального скролла; ошибок консоли нет.
- [ ] Пуш `redesign`, проверка preview, отчёт владельцу.
