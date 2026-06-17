// Pull the video id from any common YouTube link shape:
// watch?v=ID, youtu.be/ID, /shorts/ID, /embed/ID, /v/ID, /live/ID — plus a bare
// regex fallback for anything URL() can't parse. Returns null when nothing matches.
export function youtubeId(raw: string): string | null {
  if (!raw) return null
  const s = raw.trim()
  try {
    const u = new URL(s)
    const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '')
    if (host === 'youtu.be') {
      return u.pathname.split('/').filter(Boolean)[0] || null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v')
      const m = u.pathname.match(/^\/(?:shorts|embed|v|live)\/([^/?#]+)/)
      if (m) return m[1]
    }
  } catch {
    // not a parseable absolute URL — fall through to the regex below
  }
  const m = s.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|v\/|live\/))([A-Za-z0-9_-]{6,})/,
  )
  return m ? m[1] : null
}

// Always-present 480×360 preview for a given video id.
export const youtubeThumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`
