import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Determine if we're in production mode
  const isProd = mode === 'production';
  
  return {
  // Load env variables based on mode
  envDir: '.',
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    allowedHosts: ['*'],
    proxy: {
      '/api': {
        target: 'http://localhost/app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  define: {
    // Add global variables for environment detection
    'import.meta.env.VERCEL': JSON.stringify(!!process.env.VERCEL),
    'process.env.VERCEL': JSON.stringify(!!process.env.VERCEL)
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  define: {
    // Add global variables for environment detection
    'import.meta.env.VERCEL': JSON.stringify(!!process.env.VERCEL),
    'process.env.VERCEL': JSON.stringify(!!process.env.VERCEL)
  }
};
})