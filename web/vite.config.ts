import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { VitePluginFonts } from 'vite-plugin-fonts'

export default defineConfig({
  plugins: [solidPlugin(), VitePluginFonts(
    {
      google: {
        families: ['Inter']
      }
    }
  )],
  server: {
    port: 3000
  },
  build: {
    target: 'esnext'
  }
})
