import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  define: { __APP_BUILD_TIME__: JSON.stringify(new Date().toISOString()) },
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: [],
    includeManifestIcons: false,
    manifest: {
      name: 'Kleine Ontdekkers', short_name: 'Ontdekkers', lang: 'nl',
      description: 'Spelend wijzer, voor groep 2, 4 en 5.',
      theme_color: '#f9f8f2', background_color: '#f9f8f2', display: 'standalone',
      start_url: '/', scope: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,m4a,woff2}'],
      navigateFallback: '/index.html', cleanupOutdatedCaches: true
    }
  })]
});
