import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// MAIN APP build — single entry point, default chunking.
// Single-entry builds never produce circular-chunk TDZ errors;
// that class of bug only occurs with multi-entry shared-chunk builds.
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: { main: 'index.html' }
    }
  }
})
