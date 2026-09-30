import { revalidatePath, revalidateTag } from 'next/cache'
import { API_BASE, API_TAG } from '../../../lib/api'

// The admin panel calls this right after it saves, deletes or reorders content,
// so the cached pages are rebuilt on their next visit instead of waiting out
// the five-minute re-check.
//
// Who may call it: whoever holds a valid admin token. The caller sends the same
// `Authorization: Bearer <access>` it uses against the API; this handler asks
// the API whether that token belongs to a staff user and drops the cache only
// if it does. No shared secret to configure, none to leak from a browser bundle.

// A token-authenticated endpoint carries no ambient credentials (no cookies),
// so any origin may reach it: the admin's origin, a preview build, localhost.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Max-Age': '86400',
}

const json = (body: unknown, status: number) =>
  Response.json(body, { status, headers: { ...CORS, 'Cache-Control': 'no-store' } })

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization') ?? ''
  // Shaped like a JWT, or the API is not bothered at all.
  if (!/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/.test(authorization)) {
    return json({ revalidated: false, detail: 'Missing or malformed token' }, 401)
  }

  let staff = false
  try {
    const res = await fetch(`${API_BASE}/api/auth/me/`, {
      headers: { Authorization: authorization },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    if (res.status === 401 || res.status === 403) {
      return json({ revalidated: false, detail: 'Not an admin token' }, 403)
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    staff = (await res.json())?.is_staff === true
  } catch {
    return json({ revalidated: false, detail: 'Could not verify the token' }, 502)
  }
  if (!staff) return json({ revalidated: false, detail: 'Not an admin token' }, 403)

  // The data, then every page rendered from it (and the sitemap).
  revalidateTag(API_TAG)
  revalidatePath('/', 'layout')
  return json({ revalidated: true }, 200)
}
