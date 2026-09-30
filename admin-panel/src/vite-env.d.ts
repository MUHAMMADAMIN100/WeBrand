/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Django API. Defaults to http://localhost:8000 in code. */
  readonly VITE_API_URL?: string
  /** Origin of the public site (told to refresh after a save). Defaults in code: see api/config.ts. */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
