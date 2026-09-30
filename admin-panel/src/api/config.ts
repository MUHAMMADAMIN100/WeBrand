// Default in code so the dev server works with no .env; override via VITE_API_URL in prod.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// The public site. It serves cached pages and has to be told when content
// changes (see api/site.ts). Follows the API it is paired with: a local API
// means the local site, anything else the live one — so neither a dev server
// nor a local preview build needs configuring, and a local build never pokes
// production. Override with VITE_SITE_URL if the site ever moves.
export const SITE_BASE =
  import.meta.env.VITE_SITE_URL ||
  (/\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(API_BASE) ? 'http://localhost:3000' : 'https://www.webrand.tj')
