import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// MAIN APP build.
// build.target: 'esnext' is REQUIRED with Firebase v10 + Vite.
// Firebase's SDK has internal circular module references that are safe
// in native ES modules, but esbuild's default target (es2020) rewrites
// const/let bindings in a way that creates a temporal-dead-zone
// collision when those circular refs get inlined into one file.
// 'esnext' preserves native ESM semantics and avoids the rewrite.
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: { main: 'index.html' }
    }
  },
  optimizeDeps: {
    esbuildOptions: { target: 'esnext' }
  }
})
