import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ADMIN PANEL build — same esnext target as main, see vite.config.js for why.
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    target: 'esnext',
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
  },
  optimizeDeps: {
    esbuildOptions: { target: 'esnext' }
  }
})
