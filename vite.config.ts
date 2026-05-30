import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4020',
        changeOrigin: true,
      },
      '/product-images': {
        target: 'http://localhost:4020',
        changeOrigin: true,
      },
    },
  },
})
