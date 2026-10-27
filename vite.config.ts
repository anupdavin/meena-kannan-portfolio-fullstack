import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')
          if (normalizedId.includes('node_modules')) {
            if (normalizedId.includes('react-router-dom') || normalizedId.includes('react-dom') || normalizedId.includes('/react/')) {
              return 'vendor'
            }
            if (normalizedId.includes('framer-motion')) {
              return 'motion'
            }
            if (normalizedId.includes('lucide-react')) {
              return 'icons'
            }
          }
          if (
            normalizedId.includes('src/data/byteByteGoConfigs') || 
            normalizedId.includes('src/data/architectureSystems') ||
            normalizedId.includes('src/data/architecturalDecisions') ||
            normalizedId.includes('src/components/architecture/workbenchConfigs')
          ) {
            return 'architecture-data'
          }
          if (normalizedId.includes('src/components/architecture/')) {
            return 'architecture'
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    open: false,
    allowedHosts: true,
  },
})
