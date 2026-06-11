import { Helmet } from 'react-helmet-async'
import { SITE_URL } from '../lib/news'

/**
 * Single source of truth for per-route <head> SEO (title, description,
 * canonical, Open Graph, Twitter, optional JSON-LD). Every page renders exactly
 * one <Seo>; index.html intentionally carries NO SEO meta so there are never
 * duplicate/ conflicting tags — Helmet fully owns the head.
 */
export function Seo({
  title,
  description,
  path,
  image,
  type = 'website',
  keywords,
  jsonLd,
  publishedTime,
  modifiedTime,
}: {
  title: string
  description: string
  path: string
  image?: string | null
  type?: 'website' | 'article'
  keywords?: string
  jsonLd?: Record<string, unknown>
  publishedTime?: string
  modifiedTime?: string
}) {
  const url = SITE_URL + path
  const img = image || `${SITE_URL}/og-image.png`
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:site_name" content="Webrand" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
