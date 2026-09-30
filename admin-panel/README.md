# Webrand — Admin Panel

A **separate** standalone app (Vite + React 18 + TS + Tailwind) for managing the
Webrand site content. It is **not** part of the public site — it ships and deploys
on its own.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5174 (strict port)
npm run build      # tsc -b + vite build -> dist/
```

The Django API must be running on `http://localhost:8000` (default). The admin
origin `http://localhost:5174` is whitelisted in the backend's `CORS_ALLOWED_ORIGINS`.

Log in with any Django **staff/superuser** account.

## Configuration

`VITE_API_URL` — base URL of the Django API. Defaults in code to
`http://localhost:8000`; set it in the deployment environment for production.

`VITE_SITE_URL` — origin of the public site. Optional: by default it follows the
API (a local API means `http://localhost:3000`, anything else
`https://www.webrand.tj`), so nothing needs setting unless the site moves.

## Telling the site about a change

The public site serves cached pages. After every successful write to
vacancies, projects, news, reels or partners, `api/client.ts` calls
`POST <site>/api/revalidate` with the admin's own access token (`api/site.ts`);
the site asks the API whether the token is a staff user's and then drops its
cache, so the edit is live within seconds. Calls made close together collapse
into one (a drag reorder saves several rows at once). It is best effort: if the
call fails nothing is shown here, and the site picks the change up with its own
re-check five minutes later at the latest.

## Auth / tokens

- `POST /api/auth/login/` → `{ access, refresh }`.
- **Refresh token** → `localStorage` (long-lived, must survive reloads).
- **Access token** → in memory only (short-lived; kept out of storage to shrink
  the XSS blast radius). On boot it is re-minted from the stored refresh.
- The fetch wrapper attaches `Authorization: Bearer <access>` and, on a `401`,
  transparently calls `POST /api/auth/refresh/` once and retries. If the refresh
  fails it clears tokens and redirects to `/login`.

## Deploy

Deploy as its **own Vercel project** (e.g. `admin.webrand.tj`), separate from the
public site. Set `VITE_API_URL` to the production API URL in that project's env.
Framework preset: Vite. Build: `npm run build`. Output: `dist/`.
