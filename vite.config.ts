import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const PROXY_TARGET = process.env.VITE_PROXY_TARGET

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  server: {
    proxy: PROXY_TARGET
      ? {
          '/ussd-proxy': {
            target: PROXY_TARGET,
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/ussd-proxy/, ''),
          },
        }
      : undefined,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 4500,
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['monaco-editor'],
          vue: ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
})
