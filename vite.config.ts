/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Em desenvolvimento, /api é repassado para o backend (evita CORS e o redirecionamento para HTTPS).
  const alvoApi = env.VITE_API_PROXY ?? 'http://localhost:5171'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target: alvoApi, changeOrigin: true },
        '/health': { target: alvoApi, changeOrigin: true },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
      css: false,
    },
  }
})
