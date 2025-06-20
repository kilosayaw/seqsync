// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'; // Import path module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default port, Vite will auto-increment if busy
    strictPort: false, // Allow Vite to try other ports if default is busy
    // fs: {
    //   strict: false, // Might be needed if you have symlinks or complex asset structures outside root
    // }
  },
  resolve: {
    alias: {
      // Example alias: you can set '@' to point to your 'src' directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  // build: {
  //   sourcemap: true, // Enable sourcemaps for production build if needed for debugging
  // }
})