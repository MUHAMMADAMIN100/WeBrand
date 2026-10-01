// Uploaded media (project logos and covers, news covers, partner logos) lives
// on the API host. The image optimiser may fetch from there and nowhere else.
const api = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
if (process.env.VERCEL && !process.env.NEXT_PUBLIC_API_URL) {
  // Without it the site has no data at all, and the optimiser would only trust
  // localhost: every image would fail once and fall back to its original file.
  console.warn('[webrand] NEXT_PUBLIC_API_URL is not set for this Vercel build — content and optimised images will not load.')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No test/lint gate in this repo (parity with the Vite app); `next build`'s
  // type-check is the correctness gate. Skip ESLint during build.
  eslint: { ignoreDuringBuilds: true },
  // Metadata always in <head>, for every user agent. By default Next streams it
  // into <body> for clients it believes run JavaScript, and /brief was served
  // that way: no <title>, description or canonical in <head> for any crawler
  // outside Next's built-in list. Our metadata costs nothing to resolve up
  // front, so there is no first-byte win to give up.
  htmlLimitedBots: /.*/,
  experimental: {
    // The stylesheet travels inside the HTML instead of as its own file. As a
    // file it was requested together with the font files, and the CDN sent the
    // fonts first: the page stayed blank until ~120 KB of fonts had arrived,
    // and the scripts were not even requested before it (Chrome holds back
    // low-priority requests while a render-blocking stylesheet is in flight).
    // The CSS is one small Tailwind file shared by every page, so inlining it
    // costs ~13 KB of HTML. Production builds only; client-side navigations to
    // our (prerendered) pages still use the cached file.
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      { protocol: api.protocol.replace(':', ''), hostname: api.hostname, port: api.port, pathname: '/media/**' },
    ],
    // An upload keeps its URL for life (a replacement gets a new file name), so
    // an optimised copy can be kept for a month instead of the default minute.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  // Retired portfolio filter routes. The tab is gone from the site; a saved or
  // indexed link still lands on the portfolio instead of a 404.
  async redirects() {
    return [{ source: '/adsprojects', destination: '/#portfolio', permanent: true }]
  },
  // Two public addresses carry a query string that changes what the page shows.
  // A page that reads its query string cannot be cached — it would be rendered
  // on the server for every visit — so each variant is a static route of its
  // own and the public address is mapped onto it here. The address bar, the
  // canonical and every link keep the `?…` form.
  // `beforeFiles`, because both sources are also real pages (/news, /brief).
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/news',
          has: [{ type: 'query', key: 'page', value: '(?<page>[1-9][0-9]{0,4})' }],
          destination: '/news/p/:page',
        },
        {
          source: '/brief',
          // Mirrors LOCKABLE_DIRECTIONS (app/brief/metadata.ts, BriefForm.tsx).
          has: [{ type: 'query', key: 'direction', value: '(?<direction>smm|design|dev|ads)' }],
          destination: '/brief/d/:direction',
        },
      ],
    }
  },
}

export default nextConfig
