import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          'leaflet': ['leaflet', 'react-leaflet', 'react-leaflet-markercluster'],
          'axios': ['axios'],
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
