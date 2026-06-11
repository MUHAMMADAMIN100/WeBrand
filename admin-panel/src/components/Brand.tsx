/**
 * Real Webrand logo assets (shared with the public site), themed for both
 * admin themes. Use these everywhere instead of ad-hoc "W" glyphs.
 *
 * - BrandLogo — full lockup («Webrand»): original full-colour on light,
 *   blue-«We» + white-«brand» variant on dark (main-logo-dark.png, generated
 *   from the original asset).
 * - BrandMark — the square brand mark (white «We» on brand blue); it carries
 *   its own background, so it reads on any surface in both themes.
 */

export function BrandLogo({ className = 'h-8' }: { className?: string }) {
  return (
    <>
      <img
        src="/logos/main-logo.png"
        alt="Webrand"
        width={388}
        height={81}
        className={`w-auto object-contain dark:hidden ${className}`}
      />
      <img
        src="/logos/main-logo-dark.png"
        alt="Webrand"
        width={388}
        height={81}
        className={`hidden w-auto object-contain dark:block ${className}`}
      />
    </>
  )
}

export function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <img
      src="/logos/favicon-logo.png"
      alt="Webrand"
      width={180}
      height={180}
      className={`rounded-xl object-contain shadow-sm shadow-brand-600/30 ${className}`}
    />
  )
}
