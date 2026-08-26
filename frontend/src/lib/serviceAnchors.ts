/** Anchor ids of the service cards in <Services>, plus the event the hero chips
 *  fire to flag which card they just sent the user to.
 *
 *  Why an event and not just the hash: two chips point at the same card («SMM»
 *  and «SEO / Контекстная реклама»), and clicking one chip twice leaves the hash
 *  untouched. `hashchange` never fires in either case, so a hash-only highlight
 *  would play once and then stay silent. */

export const SERVICE_HIGHLIGHT_EVENT = 'webrand:service-highlight'

/** Mirrors the `id` ServiceCard renders. */
export function serviceAnchorId(serviceId: number): string {
  return `service-${serviceId}`
}

/** Ask <Services> to briefly highlight the card `href` points at. Harmless for
 *  an href that is not a card (e.g. plain `#services`) — nothing lights up. */
export function requestServiceHighlight(href: string): void {
  window.dispatchEvent(
    new CustomEvent(SERVICE_HIGHLIGHT_EVENT, { detail: href.replace(/^#/, '') }),
  )
}
