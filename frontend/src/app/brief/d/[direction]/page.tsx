import type { Metadata } from 'next'
import SiteShell from '../../../../components/SiteShell'
import BriefForm from '../../../../components/BriefForm'
import { LOCKABLE_DIRECTIONS, briefMetadata } from '../../metadata'

// The brief with its direction locked — what `/brief?direction=<id>` shows.
// Visitors never see this path: next.config.mjs rewrites the query form onto
// it, so the four variants are plain static pages.
export const metadata: Metadata = briefMetadata

// Only the known directions exist; anything else is a 404 here (and never
// reaches this route anyway — the rewrite only matches these four).
export const dynamicParams = false

type Params = { direction: string }

export function generateStaticParams(): Params[] {
  return LOCKABLE_DIRECTIONS.map((direction) => ({ direction }))
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { direction } = await params

  return (
    <SiteShell>
      <BriefForm initialDirection={direction} />
    </SiteShell>
  )
}
