import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom', 'react-router', 'scheduler'],
          motion: ['framer-motion', 'gsap', '@gsap/react', 'lenis'],
          forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
          icons: ['lucide-react'],
          carousel: ['embla-carousel-react', 'swiper'],
          charts: ['recharts'],
          state: ['zustand'],
        },
      },
    },
  },
});
