import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  root: path.resolve(__dirname, 'frontend'),
  base: command === 'serve' ? '/' : '/wp-content/themes/ecosfera/assets/build/',
  build: {
    outDir: path.resolve(__dirname, 'assets/build'),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'frontend/src/main.jsx'),
    },
  },
  server: {
    cors: true,
    port: 5173,
    strictPort: true,
    origin: 'http://localhost:5173',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'frontend/src'),
    },
  },
}));
