import type { Metadata } from 'next'

// Per-page <head> builder — the Metadata-API equivalent of the old <Seo> helper.
// `metadataBase` (set in app/layout.tsx to SITE_URL) turns the relative
// canonical/image paths into absolute https://webrand.tj/... URLs, so every page
// gets a correct canonical, Open Graph and Twitter card with no duplication.
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
  keywords,
  publishedTime,
  modifiedTime,
}: {
  title: string
  description: string
  path: string
  image?: string | null
  type?: 'website' | 'article'
  keywords?: string
  publishedTime?: string
  modifiedTime?: string
}): Metadata {
  const img = image || '/og-image.png'
  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: 'ru_RU',
      siteName: 'Webrand',
      title,
      description,
      url: path,
      images: [img],
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      ...(type === 'article' && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [img],
    },
  }
}
