import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const proxy = {
  '/api': { target: 'http://localhost:5000', changeOrigin: false },
  '/sanctum': { target: 'http://localhost:5000', changeOrigin: false },
  '/storage': { target: 'http://localhost:5000', changeOrigin: false },
}

// https://vite.dev/config/
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  server: { port: 5174, strictPort: true, proxy },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
      },
    },
  },
})
