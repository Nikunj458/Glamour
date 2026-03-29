import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Ensures assets are referenced with absolute paths — required for Render static hosting
  base: '/',

  build: {
    outDir: 'dist',
    // Don't inline small assets — keeps CSS/JS paths consistent
    assetsInlineLimit: 0,
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
