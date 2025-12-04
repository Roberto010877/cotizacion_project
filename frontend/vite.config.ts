import path from "node:path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    middlewareMode: false,
    port: 5173,
    strictPort: true,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws',
    },
    watch: {
      usePolling: false, // Desactiva polling para mejorar rendimiento
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'], // Pre-bundle dependencias críticas
    exclude: [], // No excluir nada innecesariamente
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000, // Aumenta el límite de advertencia
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'redux': ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  },
  cacheDir: 'node_modules/.vite', // Usa caché de node_modules
})
