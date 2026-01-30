import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'MediZone',
        short_name: 'MediZone',
        description: 'Your personal medical zone',
        theme_color: '#3498db',
        icons: [
                  {
                    src: 'android-192.png',  // Das neue blaue Bild (Kopie)
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any maskable'  // Wichtig für den Vollbild-Look ohne weißen Rand
                  },
                  {
                    src: 'android-512.png',  // Das neue blaue Bild (Original)
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable'  // Wichtig für den Vollbild-Look ohne weißen Rand
                  }
                ]
              }
            })
          ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})