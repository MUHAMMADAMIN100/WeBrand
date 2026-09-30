import type { Metadata } from 'next'
import NewsIndex, { newsIndexMetadata } from '../../components/NewsIndex'

// Rendered once and served from the cache; refreshed when the admin saves
// something and re-checked every five minutes (see lib/api.ts, REVALIDATE).
// This is page 1 of the feed; `/news?page=<n>` is served by ./page/[page].
export const revalidate = 300

export const metadata: Metadata = newsIndexMetadata(1)

export default function Page() {
  return <NewsIndex page={1} />
}
