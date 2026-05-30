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
  },
});