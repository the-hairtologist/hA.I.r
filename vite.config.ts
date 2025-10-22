import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    mode === "production" && visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png', 'og-image.png'],
        manifest: {
          name: 'Hair AI Pro - Professional Hair Color Assistant',
          short_name: 'Hair AI Pro',
          description: 'AI-powered hair color formulas, corrections, and salon management for professional stylists. Quick formulas in 2 seconds!',
          theme_color: '#8B5CF6',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          categories: ['business', 'productivity', 'utilities'],
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          screenshots: [
            {
              src: '/screenshot-1.png',
              sizes: '1170x2532',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'AI Assistant Chat'
            }
          ],
          shortcuts: [
            {
              name: 'AI Assistant',
              short_name: 'AI Chat',
              description: 'Get instant AI formula help',
              url: '/ai-assistant',
              icons: [{ src: '/icon-192.png', sizes: '192x192' }]
            },
            {
              name: 'Quick Formula',
              short_name: 'Quick',
              description: 'Generate formula in 2 seconds',
              url: '/quick-formula',
              icons: [{ src: '/icon-192.png', sizes: '192x192' }]
            },
            {
              name: 'Dashboard',
              short_name: 'Home',
              description: 'View your dashboard',
              url: '/dashboard',
              icons: [{ src: '/icon-192.png', sizes: '192x192' }]
            }
          ]
        },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          // 1. Google Fonts (critical)
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: { 
                maxEntries: 20, 
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          
          // 2. API + User Data (combined)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { 
                maxEntries: 150, 
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          
          // 3. Images
          {
            urlPattern: /\.(jpg|jpeg|png|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { 
                maxEntries: 200, 
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'esbuild',
    cssMinify: 'esbuild',
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React (must load first)
          if (id.includes('node_modules/react')) {
            return 'react-vendor';
          }
          
          // UI layer (depends on React)
          if (id.includes('node_modules/@radix-ui') || 
              id.includes('node_modules/lucide-react')) {
            return 'ui-vendor';
          }
          
          // Data layer (depends on React)
          if (id.includes('node_modules/@supabase') || 
              id.includes('node_modules/@tanstack/react-query')) {
            return 'data-vendor';
          }
          
          // Everything else
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize output filenames
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      // Tree shaking optimizations
      treeshake: {
        moduleSideEffects: true,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
    // Enable compression
    cssCodeSplit: true,
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
