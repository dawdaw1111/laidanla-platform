import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/laidanla-platform/' : '/',
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: ['index', 'preview', 'review'].map(page =>
        fileURLToPath(new URL(page + '.html', import.meta.url)),
      ),
    },
  },
}))
