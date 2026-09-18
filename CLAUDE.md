# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

A monorepo with **three independently-deployed apps** that talk over an HTTP API:

| Dir | What | Stack | Dev port |
|---|---|---|---|
| `backend/` | REST API + data + Django admin | Django 6 + DRF, SQLite (local) / Postgres (prod), JWT | 8000 |
| `frontend/` | Public marketing site (Webrand) | **Next.js 15 (App Router) + React 19** + TS + Tailwind 3.4 + Framer Motion + GSAP + Lenis | 3000 |
| `admin-panel/` | Internal CMS for site content | React 18 + Vite + TS + Tailwind 3.4 | 5174 |

Each app has its own deeper docs — **read these before working in that app**:
`admin-panel/README.md` (auth/token model + deploy), `docs/superpowers/specs/2026-09-17-webrand-redesign-design.md` (the design system both frontends share: tokens, type, motion, budgets) and the phase plans in `docs/superpowers/plans/` (what was built, what was found and fixed).

The two frontends are separate apps with their own `package.json`; there is no shared workspace/root `package.json`. The design system is duplicated intentionally so each app ships alone: brand scale anchored to `#2B5ED3` = `brand-600`, near-black `ink` scale (950 = `#0B0D12`), cool page `paper` `#F4F6FA`, one accent `lime` `#C8F135`, fonts Manrope (body) + Unbounded (display, Cyrillic). The admin binds Tailwind's `neutral` to `ink`. The real logo assets live in `frontend/public/logos/` (`main-logo.png` lockup, `main-logo-dark.png` for dark surfaces, `favicon-logo.png` mark) and are copied into `admin-panel/public/logos/`; in the admin always render them via `src/components/Brand.tsx` (`BrandLogo`/`BrandMark`) — never a bare "W" glyph.

## Commands

**Backend** (run from `backend/`, using the venv interpreter that owns `manage.py` — Windows):
```bash
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe manage.py migrate
.venv/Scripts/python.exe manage.py seed            # idempotent: 6 vacancies + 14 projects (+logos)
.venv/Scripts/python.exe manage.py seed_news       # idempotent: 50 news articles (+covers); --prune deletes articles not in the seed set
.venv/Scripts/python.exe manage.py createsuperuser # needed to log into the admin panel / Django admin
.venv/Scripts/python.exe manage.py runserver 8000
```
Secrets come from `backend/.env` via `python-decouple` (see `.env.example`). **`DEBUG` defaults to `False`** — set `DEBUG=True` in `backend/.env` for local dev (it also gates Swagger/ReDoc at `/swagger/`, `/redoc/`, which are not registered in prod). There is **no backend test suite** and no linter configured. Env vars in the shell override `.env` (decouple reads `os.environ` first) — handy for test runs, e.g. an empty `TELEGRAM_BOT_TOKEN` keeps test leads out of the real chat.

**Public site** (`frontend/`):
```bash
npm install
npm run dev      # Next dev server on 3000
npm run build    # next build (type-checks; ESLint is skipped during builds)
npm run start    # serves the production build on 3000 — acceptance runs happen here, not on dev
```
Never run `next build` while `next dev` is running: they share `.next/` and the build corrupts it. Stop dev first (on Windows kill the process that owns port 3000; `rm -rf .next` if in doubt). After editing `tailwind.config.ts` restart dev with a clean `.next/`.

**Admin panel** (`admin-panel/`):
```bash
npm install
npm run dev      # 5174 (strictPort)
npm run build    # tsc -b (typecheck, strict) then vite build
npx vite preview --port 5174 --strictPort   # production build under the same CORS origin as dev
```
`npm run build` is the **only correctness gate** for both frontends — there are no unit tests. It fails on TS errors but NOT on unused vars. End-to-end acceptance is done with Playwright scripts against a production build (see the phase plans for what they cover).

## Architecture — the big picture

### Backend (`backend/`, project `config/`, apps under `apps/`)
- **`apps/catalog`** — `Vacancy` (PK = `slug`) and `Project` (logo and optional `cover` `ImageField`s). Both exposed as DRF `ModelViewSet`s: **GET is public, writes require `IsAdminUser`** (the `ReadOnlyOrAdmin` permission). Anonymous reads see only `is_published=True`; staff see drafts too. `ProjectViewSet` accepts multipart so files can be uploaded and serializes them back as **absolute URLs**; `?category=SMM` and `?slug=` filters serve the SMM page and the case page. These endpoints are **un-paginated** (frontends consume plain arrays) — don't add global DRF pagination.
- **`apps/showcase`** — `Reel` (YouTube URL, any link shape) and `Partner` (logo, niche, description, result) for the public `/smm` page. Same `ReadOnlyOrAdmin` posture, un-paginated, ordered by `sort_order`.
- **`apps/news`** — `News` (PK = `slug`): the SEO blog behind `/news`. **Paginated** via its own `NewsPagination` (page_size 9, `?page_size=` up to 1000) with a light list shape (no `body`) and a full detail shape. Seed content lives in `_articles_*.py`; `seed_news` attaches generated covers and never overwrites a cover uploaded via the admin.
- **`apps/leads`** — single `Lead` model with `kind ∈ {lead, application}`. `POST /api/leads/` is **public** intake (JSON for the quiz, multipart for the brief and for applications, which must attach a PDF résumé validated by extension + content type + `%PDF-` magic, ≤10 MB): server-side validation, a `company` honeypot (filled → silent 200, no save), `AnonRateThrottle` (`leads` scope, **5/min per IP** — test runs must pace themselves), and **fail-safe Telegram delivery** (`telegram.py` never raises; the lead is saved even if the token is missing). `GET /api/leads/journal/` and `/api/leads/journal/<pk>/` (retrieve/delete) are admin-only. Résumés and brief attachments are PII behind **signed URLs** (`resume_access.py`, 7-day tokens); `/media/resumes/` 404s directly. Phones are normalised to digits on save (`+992988645543`).
- **Auth** — `djangorestframework-simplejwt`. `POST /api/auth/login/` → `{access, refresh}`, `POST /api/auth/refresh/`. Login throttled 5/min. Access ~60 min, refresh ~7 days.
- **Security posture** — hardening headers always on; HTTPS-only bits via `SECURE_SSL=True` in prod. Django pinned to `>=6.0.6,<6.1`.

### Cross-app contracts (the non-obvious coupling)
These string sets are a contract enforced in multiple places — changing one means changing the others:
- **Vacancy `slug` ↔ frontend `Vacancy.id`.** Applying to a vacancy POSTs `{kind:'application', role: <slug>}`.
- **Quiz direction ids.** `frontend/src/components/ContactForm.tsx` `DIRECTIONS` (`smm/design/dev/ads/unsure`) must match `KNOWN_SELECTED` in `backend/apps/leads/serializers.py`, or valid leads 400. `BriefForm.tsx` imports the same list; `/brief?direction=<id>` locks it.
- **Constrained vocab.** Vacancy `icon` ∈ 6 lucide names, `accent` ∈ `brand-500/600/700`; Project `category` ∈ `Разработка|SMM`. Defined in `backend/apps/catalog/models.py` (`*_CHOICES`) and mirrored in `frontend` icon maps + `admin-panel/src/lib/options.ts`.
- **Experience enum + age bounds.** `backend/apps/choices.py` defines `EXPERIENCE_VALUES` and `AGE_MIN/AGE_MAX` — mirrored in `admin-panel/src/lib/options.ts` and `frontend/src/data/content.ts`.
- **CORS.** `CORS_ALLOWED_ORIGINS` must list the dev origins `http://localhost:3000` (site) and `http://localhost:5174` (admin) plus the prod domains. A local `.env` copied from an old example may lack `:3000` — then browser POSTs from the site fail.

### Ordering contract (vacancies, projects, reels, partners, news)
Display order is **drag-and-drop only** — no manual sort-order input in any admin form. The backend orders by `sort_order` (asc; news falls back to `-published_at`), the admin tables reorder via dnd-kit (whole row draggable, keyboard: focus row → Space → arrows → Space; optimistic update, PATCH only changed rows, rollback on error, disabled while filters are active), and the public site consumes the API order as-is.

### Public site (`frontend/`, Next.js App Router)
- **Rendering.** Server components fetch from the API in `src/lib/api.ts` (`API_BASE` = `NEXT_PUBLIC_API_URL`, default `http://localhost:8000`; `SITE_URL` = `NEXT_PUBLIC_SITE_URL`, default `https://webrand.tj`). Data pages are `force-dynamic`. Routes: `/` (+ the portfolio filter routes `/devprojects`, `/smmprojects`, `/designprojects`, `/adsprojects`, which render the home with a preselected filter and navigate with `scroll: false`), `/portfolio/[slug]`, `/smm`, `/vacancies`, `/news`, `/news/[slug]`, `/brief`, `not-found`.
- **SEO** is the Metadata API (`src/lib/seo.ts` `pageMetadata`, `generateMetadata` on dynamic pages), JSON-LD rendered in the pages (`LocalBusiness` + `FAQPage` on home, `CreativeWork` on a case, `NewsArticle` on an article), `src/app/sitemap.ts` (follows news pagination, degrades to static pages) and `robots.ts`. `next.config.mjs` sets `htmlLimitedBots: /.*/` so metadata is always in `<head>` (Next would otherwise stream it into `<body>` on `/brief`). «Блог» is linked only from the footer — do not add it to the header nav. One `<h1>` per page; article bodies come from the admin as HTML and are styled by `.article-body` in `globals.css`.
- **Design system.** Tokens in `tailwind.config.ts`; `cn()` in `src/lib/utils.ts` (tailwind-merge with the custom `text-display-*` sizes registered — register any new custom `text-*` size there too, or `cn()` drops it). Primitives: `components/ui/Button`, `ui/Dialog` (+`DialogHeader`, `DialogClose`), `ui/MediaImage` (any image uploaded through the admin — logos, covers — goes through Next's image optimiser and falls back to the original file on error; `images.remotePatterns` allows only the API host's `/media/**`), `portfolio/CasePoster` (cover, or accent + logo poster), `motion/RevealText`, `motion/Marquee`, `motion/Magnetic`, `motion/Cursor`. Modal behaviour (scroll lock, focus in/out, Tab trap, Esc, heard on `document`) lives once in `src/lib/useDialogBehaviour.ts`.
- **Motion and capability gating.** Lenis smooth scroll (`motion/SmoothScroll.tsx`) owns scrolling: it handles same-page `#hash` links, pauses while `body.style.overflow === 'hidden'`, re-measures on route change and holds a `#hash` target while a new page lays itself out. `src/lib/capabilities.ts` (`useCapabilities` → `rich = finePointer && !reducedMotion && !saveData`, `useReducedMotionSafe`) gates the heavy pieces: WebGL hero (`webgl/`), horizontal Process scene, custom cursor. Never branch first-render markup on reduced motion (hydration mismatch) — gate after mount. `hoverOnlyWhenSupported` is on in both Tailwind configs.
- **Forms.** `ContactForm` (quiz modal + job application), `BriefForm` (`/brief`), both POST to `/api/leads/`. Their validation, steps and payloads are a contract with the backend; submit buttons are never disabled for incompleteness — a press reveals the errors and focuses the first invalid control. Telegram links go through `src/lib/telegram.ts` (`tg://` first, `t.me` fallback — `t.me` is DNS-blocked for part of the audience).

### Admin panel (`admin-panel/`)
JWT-gated CRUD: refresh token in `localStorage`, access token **in memory** (re-minted from refresh on boot); `api/client.ts` attaches `Bearer` and transparently refreshes + retries once on a `401`. `/` is the dashboard (`pages/DashboardPage.tsx`: KPIs, `charts/BarsByDay.tsx`, latest leads, quick actions via `?new=1` on the list pages) — computed client-side from the existing endpoints, nothing added to the backend. Forms are right-side drawers; project/partner/news edits send multipart for the logo/cover; the news list endpoint returns a paginated envelope that `listNews()` unwraps. Theme: `darkMode: 'class'`, key `wb_admin_theme`, set before first paint in `index.html`. Sortable rows spread `rowAttributes(attributes)` (no `role=button` on a row that holds buttons) and pass `accessibility={{ container: document.body }}` to `DndContext` (its live region may not live inside `<table>`).

## Deploy
Three separate targets: the public site (`we-brand` Vercel project → www.webrand.tj, env `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`) and the admin panel (`webrand-admin` Vercel project, env `VITE_API_URL`) each deploy as their **own** Vercel project; the backend deploys separately on Railway (gunicorn + Postgres via `DATABASE_URL`; media is served by the backend itself). **`main` auto-deploys to production** — push there only when told to. Preview deployments are behind Vercel SSO; check them with `vercel curl <full-url>` from `frontend/`. After a backend deploy run `migrate` + `seed` + `seed_news`.
