import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (
            id.includes('react') ||
            id.includes('scheduler') ||
            id.includes('leaflet') ||
            id.includes('react-leaflet')
          ) {
            return 'framework-vendor';
          }

          if (id.includes('axios') || id.includes('jwt-decode')) {
            return 'network-vendor';
          }

          if (id.includes('lucide-react') || id.includes('sileo')) {
            return 'ui-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
