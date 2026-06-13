# Webrand public site — Next.js (App Router)

The public marketing site (Webrand), migrated from the Vite React SPA in
[`../frontend`](../frontend) to **Next.js 15 (App Router)** for SSR/SSG and SEO.
Same design, components, brand tokens (`brand-600` = `#2B5ED3`, Manrope),
animations and copy — **1:1**. Only the rendering/routing layer changed.

> This app is meant to **replace `../frontend`** once visually signed off. The
> old Vite app is left in place until then. `admin-panel/` and `backend/` are
> untouched.

## Stack

React 18-era component code on **Next.js 15 + React 19**, TypeScript (strict),
Tailwind, Framer Motion, lucide-react — the same libraries as the Vite app.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000  (own port — never touches Vite on 5173)
npm run build    # the only correctness gate (tsc strict); no tests/lint
npm run start    # serve the production build on 3000
```

## Env

```
NEXT_PUBLIC_API_URL=http://localhost:8000   # Django API (server + client fetch). Replaces VITE_API_URL.
NEXT_PUBLIC_SITE_URL=https://webrand.tj      # public origin for canonical / OG / sitemap / robots
```

Both default in code (`localhost:8000`, `https://webrand.tj`), so local dev works
with no `.env`. Set them per Vercel project in prod.

## Routing (App Router) — same routes as the SPA

| Route | Render | Notes |
|---|---|---|
| `/` | SSR (dynamic) | marketing home; **projects** fetched server-side from `/api/projects/` |
| `/devprojects`, `/smmprojects` | SSR | same home content, client-side portfolio filter; canonical → `/` |
| `/vacancies` | SSR | **vacancies** fetched server-side from `/api/vacancies/`; `<h1>` |
| `/news` (`?page=N`) | SSR | paginated list from `/api/news/` |
| `/news/[slug]` | SSR | full article from `/api/news/<slug>/`; missing → real 404 |
| `*` | 404 | standalone `not-found.tsx` (HTTP 404 + `noindex`), no site chrome |

`/news` is deliberately **not** in the header nav — linked only from the footer
(«Блог»), exactly as before.

Data pages are `force-dynamic` + `cache: 'no-store'`: they render fresh from the
API on every request (so Google sees the live content) and the build never
depends on the backend being up. Every server fetch is wrapped so a backend
hiccup degrades gracefully instead of crashing the render.

## SEO

- **Metadata API** replaces `react-helmet`: per-page `metadata` / `generateMetadata`
  (title, description, canonical on `webrand.tj`, Open Graph, Twitter) built via
  `src/lib/seo.ts`. `metadataBase` lives in `app/layout.tsx`.
- **JSON-LD**: `LocalBusiness` on the home page, `NewsArticle` on each article.
- **`app/sitemap.ts`** — core pages + every published news article (follows API
  pagination, degrades to static pages if the API is down).
- **`app/robots.ts`** — `Allow: /`, points at `/sitemap.xml`.
- **Manrope** via `next/font/google` (self-hosted, `latin` + `cyrillic`), exposed
  as `--font-manrope` and used by Tailwind's `font-sans`.

## Interactivity

The quiz/application modals, the contact form (lead + application POST to
`/api/leads/`, `company` honeypot, PDF résumé multipart, `+992` phone validation)
and all Framer Motion are `"use client"` components — behaviour identical to the
Vite app. The `DIRECTIONS` / vacancy-slug / icon / category contracts are
unchanged.

## What changed vs. the Vite app (and why)

- React Router → Next file routing (`next/link`, `usePathname`, `useRouter`).
- `react-helmet-async` → Metadata API. `index.html` is gone; the head is owned by
  Next per route.
- `frontend/api/sitemap.js` (Vercel function) → `app/sitemap.ts`. `public/robots.txt`
  → `app/robots.ts`. Do **not** add static `public/robots.txt` / `public/sitemap.xml`
  — they would shadow the generated routes.
- Project/vacancy/news fetches moved from client `useEffect` to server components,
  so the content is in the initial HTML (no loading spinner needed; error/empty
  states are kept).
- Canonical origin is `https://webrand.tj` (the task's requirement), configurable
  via `NEXT_PUBLIC_SITE_URL`.

## Deploy

Deploy as a native **Next.js** project on Vercel (its own project, like the Vite
one). Set `NEXT_PUBLIC_API_URL` to the prod backend origin and
`NEXT_PUBLIC_SITE_URL` to the public origin. The backend's `CORS_ALLOWED_ORIGINS`
must include this site's origin for the browser-side lead/application POST (server
reads are not CORS-bound).
