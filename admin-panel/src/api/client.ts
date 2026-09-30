import { API_BASE } from './config'
import { notifySite } from './site'
import { clearTokens, getAccess, getRefresh, setAccess } from './tokens'

// Fired when a refresh attempt fails — AuthContext listens and forces logout.
export const AUTH_LOGOUT_EVENT = 'wb-admin:auth-logout'

// Single in-flight refresh shared across concurrent 401s.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccess(): Promise<string | null> {
  const refresh = getRefresh()
  if (!refresh) return null
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then(async (r) => {
        if (!r.ok) return null
        const data = await r.json().catch(() => ({}))
        if (data.access) {
          setAccess(data.access)
          return data.access as string
        }
        return null
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

type FetchOpts = RequestInit & { auth?: boolean }

// What the public site shows. A successful write to any of these means its
// cached pages are out of date (leads and auth are not content).
const SITE_CONTENT = /^\/api\/(vacancies|projects|news|reels|partners)\//

/**
 * fetch wrapper: attaches `Authorization: Bearer <access>` and, on a 401,
 * transparently refreshes the access token once and retries. If the refresh
 * fails it clears tokens and broadcasts a logout event.
 */
export async function apiFetch(path: string, opts: FetchOpts = {}): Promise<Response> {
  const { auth = true, headers, ...rest } = opts
  const buildHeaders = (token: string | null) => {
    const h = new Headers(headers || {})
    if (auth && token) h.set('Authorization', `Bearer ${token}`)
    return h
  }

  let res = await fetch(`${API_BASE}${path}`, { ...rest, headers: buildHeaders(getAccess()) })

  if (res.status === 401 && auth) {
    const newAccess = await refreshAccess()
    if (newAccess) {
      res = await fetch(`${API_BASE}${path}`, { ...rest, headers: buildHeaders(newAccess) })
    } else {
      clearTokens()
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
    }
  }

  const method = (rest.method || 'GET').toUpperCase()
  if (res.ok && method !== 'GET' && method !== 'HEAD' && SITE_CONTENT.test(path)) notifySite()

  return res
}

/** Parse a DRF error body into a single readable string. */
export async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data === 'string') return data
    if (data.detail) return String(data.detail)
    // field errors: {field: ["msg", ...]}
    const parts: string[] = []
    for (const [k, v] of Object.entries(data)) {
      const msg = Array.isArray(v) ? v.join(', ') : String(v)
      parts.push(k === 'non_field_errors' ? msg : `${k}: ${msg}`)
    }
    return parts.join(' · ') || `Ошибка ${res.status}`
  } catch {
    return `Ошибка ${res.status}`
  }
}

/** apiFetch + JSON parse + throw readable Error on non-2xx. */
export async function apiJson<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const res = await apiFetch(path, opts)
  if (!res.ok) throw new Error(await readError(res))
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
