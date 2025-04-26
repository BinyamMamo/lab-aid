// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'features': path.resolve(__dirname, './src/features'),
      'utils': path.resolve(__dirname, './src/utils'),
      'assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: true,
    // Add this to allow your ngrok domain
    allowedHosts: ['localhost', '.ngrok-free.app'],
    hmr: {
      // Enable HMR over ngrok tunneling
      clientPort: 443,
      host: '0.0.0.0',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    chunkSizeWarningLimit: 1600,
  },
});