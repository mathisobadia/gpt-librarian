/// <reference types="vite/client" />
type ImportMetaEnv = {
  readonly VITE_REST_URL: string
}
type ImportMeta = {
  readonly env: ImportMetaEnv
}
