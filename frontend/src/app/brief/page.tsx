import type { Metadata } from 'next'
import SiteShell from '../../components/SiteShell'
import BriefForm from '../../components/BriefForm'
import { briefMetadata } from './metadata'

// A static page. `/brief?direction=<id>` — the form with its direction locked —
// is served by ./d/[direction] through a rewrite in next.config.mjs, so neither
// variant has to read the query string (which would mean a server render on
// every visit). Anything that is not a lockable direction lands here.
export const metadata: Metadata = briefMetadata

export default function Page() {
  return (
    <SiteShell>
      <BriefForm />
    </SiteShell>
  )
}
