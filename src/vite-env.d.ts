/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base da API. Vazio = mesma origem (o Vite repassa /api em desenvolvimento). */
  readonly VITE_API_URL?: string
  /** Destino do proxy do Vite em desenvolvimento. Padrão: http://localhost:5171 */
  readonly VITE_API_PROXY?: string
  /** "true" usa a API simulada (MSW) no lugar do backend. */
  readonly VITE_USE_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
