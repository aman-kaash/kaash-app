import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ADMIN PANEL — separate single-entry build.
// Output goes into dist/ alongside the main app, with its own
// hashed asset filenames (no collision with the main app's assets).
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: { admin: 'admin.html' },
      output: {
        entryFileNames: 'assets/admin-[hash].js',
        chunkFileNames: 'assets/admin-chunk-[hash].js',
        assetFileNames: 'assets/admin-[hash][extname]'
      }
    }
  }
})
