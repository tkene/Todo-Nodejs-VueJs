import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      // sassVariables: 'src/quasar-variables.sass',
    })
  ],
  // Configuration pour la production
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  // Base URL pour les assets
  base: '/'
})
