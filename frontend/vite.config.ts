/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'API_PROXY_')

  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api': env.API_PROXY_TARGET || 'http://localhost:5180',
      },
      watch: {
        usePolling: true,
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      // TODO(for Senior+ candidates): improve tests setup with coverage and other improvements?
    },
  }
})
