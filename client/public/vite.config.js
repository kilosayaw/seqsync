// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Import path module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Setup path alias for @/*
    },
  },
  server: {
    port: 5173, // Default Vite port
    // Optional: proxy API requests to backend during development
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5001', // Your backend URL
    //     changeOrigin: true,
    //     // secure: false, // if your backend is not https
    //   }
    // }
  },
  build: {
    outDir: 'dist',
  }
})