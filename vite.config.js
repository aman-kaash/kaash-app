import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html'
      },
      output: {
        // CRITICAL FIX: force all Firebase code into one dedicated chunk.
        // Without this, the multi-entry build (main + admin) splits Firebase
        // across circular shared chunks, causing the runtime crash:
        // "ReferenceError: Cannot access 'k' before initialization"
        manualChunks: {
          firebase: [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage'
          ],
          react: ['react', 'react-dom'],
          icons: ['lucide-react']
        }
      }
    }
  }
})
