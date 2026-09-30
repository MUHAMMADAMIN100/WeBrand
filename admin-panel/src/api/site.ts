import { SITE_BASE } from './config'
import { getAccess } from './tokens'

// The public site renders each page once and serves it from a cache, so a
// change saved here would otherwise wait for the site's own five-minute
// re-check. This tells the site to drop its cache right away.
//
// It sends the admin's own access token; the site asks the API whether that
// token belongs to a staff user before it does anything (POST /api/revalidate
// on the site). No secret is shared with this bundle.
//
// Best effort by design: if the call fails — the site is down, the network
// hiccups — nothing is shown and nothing breaks; the change simply appears with
// the next re-check instead of at once.

let timer: number | undefined

/** Ask the site to rebuild its pages. Calls made close together collapse into
 *  one: a drag-and-drop reorder saves several rows in a burst. */
export function notifySite(): void {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    const token = getAccess()
    if (!token) return
    fetch(`${SITE_BASE}/api/revalidate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      // Finish even if the tab is closed or navigates right after the save.
      keepalive: true,
    }).catch(() => {})
  }, 400)
}
