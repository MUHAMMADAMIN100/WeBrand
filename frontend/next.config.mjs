// Uploaded media (project logos and covers, news covers, partner logos) lives
// on the API host. The image optimiser may fetch from there and nowhere else.
const api = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')

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
  images: {
    remotePatterns: [
      { protocol: api.protocol.replace(':', ''), hostname: api.hostname, port: api.port, pathname: '/media/**' },
    ],
    // An upload keeps its URL for life (a replacement gets a new file name), so
    // an optimised copy can be kept for a month instead of the default minute.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
}

export default nextConfig
