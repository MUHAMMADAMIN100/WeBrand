/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No test/lint gate in this repo (parity with the Vite app); `next build`'s
  // type-check is the correctness gate. Skip ESLint during build.
  eslint: { ignoreDuringBuilds: true },
}

export default nextConfig
