# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

A monorepo with **three independently-deployed apps** that talk over an HTTP API:

| Dir | What | Stack | Dev port |
|---|---|---|---|
| `backend/` | REST API + data + Django admin | Django 6 + DRF, SQLite (local), JWT | 8000 |
| `frontend/` | Public marketing site (Webrand) | React 18 + Vite + TS + Tailwind + Framer Motion | 5173 |
| `admin-panel/` | Internal CMS for site content | React 18 + Vite + TS + Tailwind | 5174 |

Each app has its own deeper docs — **read these before working in that app**:
`frontend/CLAUDE.md` (public-site architecture + the local-dev server rule), `admin-panel/README.md` (auth/token model + deploy).

The two frontends are separate Vite apps with their own `package.json`; there is no shared workspace/root `package.json`. The brand identity is duplicated intentionally (same `brand.50–900` scale anchored to `#2B5ED3` = `brand-600`, Manrope font) so each app ships alone. The real logo assets live in `frontend/public/logos/` (`main-logo.png` lockup, `favicon-logo.png` mark) and are copied into `admin-panel/public/logos/` together with a generated dark-theme lockup (`main-logo-dark.png`); in the admin always render them via `src/components/Brand.tsx` (`BrandLogo`/`BrandMark`) — never a bare "W" glyph.

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
Secrets come from `backend/.env` via `python-decouple` (see `.env.example`). **`DEBUG` defaults to `False`** — set `DEBUG=True` in `backend/.env` for local dev (it also gates Swagger/ReDoc at `/swagger/`, `/redoc/`, which are not registered in prod). There is **no backend test suite** and no linter configured.

**Frontends** (`frontend/` and `admin-panel/`):
```bash
npm install
npm run dev      # frontend: 5173 · admin-panel: 5174 (strictPort)
npm run build    # tsc -b (typecheck, strict) then vite build
```
`npm run build` is the **only correctness gate** for both — there are no tests. It fails on TS errors but NOT on unused vars (`noUnusedLocals`/`noUnusedParameters` are off).

### Local dev server rule (important)
The public Vite on **5173 is started and owned by the human** (HMR). Do **not** run `npm run dev`/`preview` for `frontend/`, and never touch 5173 — see `frontend/CLAUDE.md`. The `admin-panel/` dev server (5174) is fine to start yourself. You may run the Django server (8000) for testing.

## Architecture — the big picture

### Backend (`backend/`, project `config/`, apps under `apps/`)
- **`apps/catalog`** — `Vacancy` (PK = `slug`) and `Project` (logo `ImageField`). Both exposed as DRF `ModelViewSet`s: **GET is public, writes require `IsAdminUser`** (the `ReadOnlyOrAdmin` permission). Anonymous reads see only `is_published=True`; staff see drafts too (`get_queryset` branches on `request.user.is_staff`). `ProjectViewSet` accepts multipart so the logo can be uploaded as a file and is serialized back as an **absolute URL** (`ProjectSerializer.to_representation`). These endpoints are **un-paginated** (frontends consume plain arrays) — don't add global DRF pagination.
- **`apps/news`** — `News` (PK = `slug`): the SEO blog behind `/news` on the public site. Same `ReadOnlyOrAdmin` posture (imported from catalog), but **paginated** via its own `NewsPagination` (page_size 9, `?page_size=` up to 1000) and with two serializers: a light list shape (no `body`) for feeds and a full detail shape for the article page / admin edit. Cover `ImageField` → absolute URL, public storage like logos. Seed content lives in `_articles_a/_b/_b2/_c.py` (plain `ARTICLES` lists); `seed_news` interleaves categories for the date-ordered feed, attaches generated covers from `_covers/` (category-motif covers without logo; the WeBrand logo cover **only** for `brand=True` articles), and never overwrites a cover uploaded via the admin. `_generate_covers.py` regenerates the cover PNGs (Pillow).
- **`apps/leads`** — single `Lead` model with `kind ∈ {lead, application}`. `POST /api/leads/` is **public** intake (multipart — applications must attach a PDF resume, validated by extension + content type + `%PDF-` magic bytes, ≤10 MB): server-side validation, a `company` honeypot (filled → silent 200, no save), `AnonRateThrottle` (`leads` scope, 5/min), and **fail-safe Telegram delivery** (`telegram.py` never raises; lead is saved even if the token is missing/the call fails; applications route to `TELEGRAM_APPLICATIONS_CHAT_ID` if set). `GET /api/leads/journal/` (list) and `/api/leads/journal/<pk>/` (retrieve/delete) are **admin-only** endpoints for the admin panel; the public POST is untouched.
- **Resumes are PII with signed-URL access** (`apps/leads/resume_access.py`). Uploaded resumes get a random unguessable filename (`resume_upload_path`), and `config/urls.py`'s `protected_media_serve` 404s anything under `/media/resumes/` (other media — project logos, news covers — stays public). The only way to download a resume is `GET /api/leads/journal/<pk>/resume/?token=…` where the token is a `django.core.signing` signature bound to that lead's pk, valid 7 days (links also go to Telegram, hence the long window). The journal serializer and Telegram messages emit these signed URLs — never serve `lead.resume.url` directly.
- **Auth** — `djangorestframework-simplejwt`. `POST /api/auth/login/` → `{access, refresh}`, `POST /api/auth/refresh/` → new access. Login has its own throttle scope (`login`, 5/min) against brute force. DRF `DEFAULT_AUTHENTICATION_CLASSES` = JWT + Session (Session keeps Django admin working). Access ~60 min, refresh ~7 days.
- **Security posture** — hardening headers are always on in `settings.py`; HTTPS-only bits (SSL redirect, secure cookies, HSTS, proxy header) switch on via `SECURE_SSL=True` in prod. Django is pinned to the patched `>=6.0.6,<6.1` line — don't downgrade to 6.0.0.

### Cross-app contracts (the non-obvious coupling)
These string sets are a contract enforced in multiple places — changing one means changing the others:
- **Vacancy `slug` ↔ frontend `Vacancy.id`.** The API serializes `slug`; both frontends map `slug → id`. Applying to a vacancy POSTs `{kind:'application', role: <slug>}`.
- **Quiz direction ids.** `frontend/src/components/ContactForm.tsx` `DIRECTIONS` (`smm/design/dev/ads/unsure`) must match `KNOWN_SELECTED` in `backend/apps/leads/serializers.py`, or valid leads 400.
- **Constrained vocab.** Vacancy `icon` ∈ 6 lucide names, `accent` ∈ `brand-500/600/700`; Project `category` ∈ `Разработка|SMM`. Defined in `backend/apps/catalog/models.py` (`*_CHOICES`) and mirrored in `frontend` icon/accent maps + `admin-panel/src/lib/options.ts`. The admin form offers exactly these.
- **Experience enum + age bounds.** `backend/apps/choices.py` defines `EXPERIENCE_VALUES` (Russian strings, stored verbatim on `Lead.experience` and `Vacancy.experience_required`) and `AGE_MIN/AGE_MAX` — mirrored in `admin-panel/src/lib/options.ts` and `frontend/src/data/content.ts`.
- **CORS.** `CORS_ALLOWED_ORIGINS` whitelists the two frontend dev origins (5173, 5174) + the prod domain.

### Ordering contract (vacancies, projects, news)
Display order is **drag-and-drop only** — there is no manual sort-order input in any admin form. The backend orders by `sort_order` (asc; news falls back to `-published_at` for ties), the admin tables reorder via dnd-kit (whole row draggable, optimistic update, PATCH only changed rows, rollback on error, disabled while filters are active), and the public site consumes the API order as-is. Keep all three resources on this same pattern.

### Frontends → API
Both use `const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'` (default in code so HMR picks it up; set `VITE_API_URL` per Vercel project in prod).
- **Public site** fetches vacancies (`/api/vacancies/`), projects (`/api/projects/`) and news (`/api/news/`, paginated) from the API; the rest of the page data (services, partners, contacts, nav) still lives in `frontend/src/data/content.ts`. Contact form and "Откликнуться" POST to `/api/leads/`. (Details: `frontend/CLAUDE.md`.)
- **Admin panel** is JWT-gated CRUD: refresh token in `localStorage`, access token **in memory** (re-minted from refresh on boot); the `api/client.ts` fetch wrapper attaches `Bearer` and transparently refreshes + retries once on a `401`, else logs out. Forms are right-side drawers; project/news edits send multipart for the logo/cover. The news list endpoint returns a paginated envelope — `listNews()` unwraps it; the edit drawer fetches the full article first (the list shape has no `body`). (Details: `admin-panel/README.md`.)

### Public-site SEO (head management + sitemap)
- **`react-helmet-async` fully owns the `<head>`** via the shared `frontend/src/components/Seo.tsx` — every route renders exactly one `<Seo>` (title, description, canonical, OG/Twitter, optional JSON-LD; the home page carries the LocalBusiness schema, article pages carry `NewsArticle`). `frontend/index.html` intentionally has **no static SEO meta** — re-adding any there creates duplicate/conflicting canonicals because Helmet appends rather than replaces.
- **News routes**: `/news` (list, `?page=N`) and `/news/<slug>` (semantic `<article>`, one `<h1>`, `.article-body` typography defined in `index.css`). The section is deliberately **absent from the header nav** (`nav` in `content.ts`) and linked only from the footer («Блог») for crawl discovery — do not add it to the header.
- **`sitemap.xml` is a Vercel serverless function** (`frontend/api/sitemap.js`) wired through a rewrite in `vercel.json`; it pulls published news from the API (follows pagination, degrades to the static pages if the API is down). Do **not** add a static `public/sitemap.xml` — it would shadow the rewrite. Prod env vars on the public-site Vercel project: `SITE_URL` (public origin) and `SITE_API_URL` (backend origin; falls back to `VITE_API_URL`). `robots.txt` points at the sitemap.

## Deploy
Three separate targets: the public site and the admin panel each deploy as their **own** Vercel project (admin e.g. `admin.webrand.tj`) with their own `VITE_API_URL`; the backend deploys separately (gunicorn + Postgres via `DATABASE_URL`, object storage for media). The admin panel never ships with the public site. After a backend deploy run `migrate` + `seed` + `seed_news`.
