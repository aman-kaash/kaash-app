import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

// Plugin to copy static files into dist after build
function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    closeBundle() {
      const files = [
        { src: 'manifest.json',  dst: 'dist/manifest.json' },
        { src: 'privacy.html',   dst: 'dist/privacy.html' },
        { src: 'terms.html',     dst: 'dist/terms.html' },
      ]
      files.forEach(({ src, dst }) => {
        if (existsSync(src)) {
          copyFileSync(src, dst)
          console.log(`Copied ${src} → ${dst}`)
        }
      })
      // Copy .well-known/assetlinks.json
      const wkDir = 'dist/.well-known'
      if (!existsSync(wkDir)) mkdirSync(wkDir, { recursive: true })
      const wkSrc = '.well-known/assetlinks.json'
      if (existsSync(wkSrc)) {
        copyFileSync(wkSrc, `${wkDir}/assetlinks.json`)
        console.log(`Copied ${wkSrc} → ${wkDir}/assetlinks.json`)
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), copyStaticFiles()],
  publicDir: false,
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: { main: 'index.html' }
    }
  }
})
