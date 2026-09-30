// Which direction of the lead form a service card opens it with. No icons and
// no form code in here on purpose: the Services section imports this, and the
// section must not drag the contact form into its chunk.

// Maps a Service title from content.ts to a form direction id, so opening the
// form from a specific service pre-selects the matching direction.
const SERVICE_TO_DIRECTION: Record<string, string> = {
  "Разработка сайтов": "dev",
  "Онлайн-эквайринг": "dev",
  "Дизайн и брендинг": "design",
  "SMM-маркетинг": "smm",
};

export function directionsForService(title: string): string[] {
  const dir = SERVICE_TO_DIRECTION[title];
  return dir ? [dir] : [];
}
