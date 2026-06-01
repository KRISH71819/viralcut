import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        processing: resolve(__dirname, 'processing.html'),
        pricing: resolve(__dirname, 'pricing.html'),
      },
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    allowedHosts: true,

    // Proxy API routes and app pages to Next.js backend (port 3001)
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/_next': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/signup': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/dashboard': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/processing': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/pricing': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});