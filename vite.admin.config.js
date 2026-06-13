import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
