/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Build-time constants
declare const __GIT_COMMIT_HASH__: string;
declare const __BUILD_TIME__: string;

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_API_URL: string;
  readonly VITE_USE_MOCK_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
