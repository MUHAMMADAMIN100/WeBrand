// Vercel serverless function: dynamic sitemap.xml.
//
// Served at /sitemap.xml via the rewrite in vercel.json. Lists the core pages
// plus every PUBLISHED news article pulled from the backend API (paginated —
// it follows the `next` links). Resilient: if the API is unreachable it still
// returns the static pages so the sitemap never errors.
//
// Config (Vercel env vars on the public-site project):
//   SITE_URL      — public origin, e.g. https://webrand.tj   (default below)
//   SITE_API_URL  — backend origin, e.g. https://api.webrand.tj
//                   (falls back to VITE_API_URL, then localhost for `vercel dev`)

const SITE_URL = (process.env.SITE_URL || 'https://webrand-flame.vercel.app').replace(/\/$/, '')
const API_BASE = (
  process.env.SITE_API_URL ||
  process.env.VITE_API_URL ||
  'http://localhost:8000'
).replace(/\/$/, '')

const STATIC_PATHS = ['/', '/vacancies', '/news']

function xmlEscape(s) {
  return String(s).replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]),
  )
}

async function fetchAllNews() {
  const items = []
  let url = `${API_BASE}/api/news/?page_size=100`
  // Follow pagination; cap iterations as a safety net.
  for (let i = 0; i < 50 && url; i++) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const results = Array.isArray(data) ? data : data.results || []
    for (const a of results) items.push(a)
    url = (!Array.isArray(data) && data.next) || null
  }
  return items
}

export default async function handler(req, res) {
  const today = new Date().toISOString().slice(0, 10)

  const urls = STATIC_PATHS.map((p) => ({ loc: SITE_URL + p, lastmod: today }))

  try {
    const news = await fetchAllNews()
    for (const a of news) {
      if (a.is_published === false) continue
      const lastmod = (a.published_at || a.updated_at || '').slice(0, 10) || today
      urls.push({ loc: `${SITE_URL}/news/${a.slug}`, lastmod })
    }
  } catch (err) {
    // Degrade gracefully: keep the static pages, skip the news block.
    res.setHeader('X-Sitemap-News', 'unavailable')
  }

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`,
      )
      .join('\n') +
    '\n</urlset>\n'

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(body)
}
