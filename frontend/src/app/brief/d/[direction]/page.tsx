import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SiteShell from '../../../../components/SiteShell'
import BriefForm from '../../../../components/BriefForm'
import { LOCKABLE_DIRECTIONS, briefMetadata } from '../../metadata'

// The brief with its direction locked — what `/brief?direction=<id>` shows.
// Visitors never see this path: next.config.mjs rewrites the query form onto
// it, so the four variants are plain static pages.
export const metadata: Metadata = briefMetadata

type Params = { direction: string }

export function generateStaticParams(): Params[] {
  return LOCKABLE_DIRECTIONS.map((direction) => ({ direction }))
}

// Anything but the four known directions is a 404 (and never reaches this
// route anyway — the rewrite only matches those four). Checked here rather
// than with `dynamicParams = false`: with that flag, the first request after
// the cache has been dropped (POST /api/revalidate) answered 404 for the
// known directions too.
const isLockable = (value: string): value is (typeof LOCKABLE_DIRECTIONS)[number] =>
  (LOCKABLE_DIRECTIONS as readonly string[]).includes(value)

export default async function Page({ params }: { params: Promise<Params> }) {
  const { direction } = await params
  if (!isLockable(direction)) notFound()

  return (
    <SiteShell>
      <BriefForm initialDirection={direction} />
    </SiteShell>
  )
}
