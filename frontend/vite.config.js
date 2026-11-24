import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite para Vercel. El directorio de salida es `dist`.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
