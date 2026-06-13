import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Vite SPA fallback: if the request is not for an asset, serve index.html
  // This handles 404s on page refresh for Vercel / any static host
  appType: 'spa',
});
