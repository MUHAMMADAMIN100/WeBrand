import type { MouseEvent } from 'react'

/** How long to wait for the Telegram app to take over before giving up on it. */
const HANDOFF_MS = 900

/** Tajik ISPs block `t.me` at the DNS level — resolution fails even against
 *  8.8.8.8 — so a plain https link drops most of our visitors on a browser
 *  error page. A custom scheme needs no DNS, so hand the click to the installed
 *  Telegram app first and only fall back to the web link if nothing took over.
 *
 *  Reads the target from the anchor's own href, so a link keeps working (and
 *  stays crawlable) with nothing but `onClick={openTelegram}` added. */
export function openTelegram(e: MouseEvent<HTMLAnchorElement>) {
  const webUrl = e.currentTarget.href
  const user = webUrl.match(/t\.me\/([A-Za-z0-9_]+)/)?.[1]

  // Not a Telegram link, or the visitor explicitly asked for a new tab/window —
  // in both cases the browser's own behaviour is the right one.
  if (!user || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

  e.preventDefault()

  // Opening the app backgrounds this tab; that is the only signal we get.
  let handedOff = false
  const markHandoff = () => {
    handedOff = true
  }
  window.addEventListener('blur', markHandoff, { once: true })
  document.addEventListener('visibilitychange', markHandoff, { once: true })

  window.location.href = `tg://resolve?domain=${user}`

  window.setTimeout(() => {
    window.removeEventListener('blur', markHandoff)
    document.removeEventListener('visibilitychange', markHandoff)
    if (handedOff || document.hidden) return

    // No app answered. Popup blockers may refuse a window this far from the
    // click, so fall back to navigating in place rather than doing nothing.
    const opened = window.open(webUrl, '_blank', 'noopener')
    if (!opened) window.location.href = webUrl
  }, HANDOFF_MS)
}
