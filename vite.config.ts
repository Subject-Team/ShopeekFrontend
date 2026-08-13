import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            '@reduxjs/toolkit',
            'decimal.js-light',
            'd3-scale',
            'd3-shape',
            'eventemitter3',
            'react',
            'react-redux'
          ],
          'vendor-charts': ['recharts']
        }
      }
    }
  }
})
