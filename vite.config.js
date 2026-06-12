import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/football-api': {
        target: 'https://api.football-data.org/v4',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/football-api/, ''),
      },
    },
  },
})
