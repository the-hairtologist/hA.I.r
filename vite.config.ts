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
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Critical user data - cache for 7 days
          {
            urlPattern: /client_profiles|stylist_profiles|appointments|formulas/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'user-data-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // API responses - shorter cache
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 30 // 30 minutes
              },
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Images - cache for 30 days
          {
            urlPattern: /\.(jpg|jpeg|png|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
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
    cssMinify: 'lightningcss',
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-core';
          }
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }
          
          // UI libraries
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix-ui';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          
          // Data fetching and state
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          
          // Charts and visualization
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }
          
          // AI and transformers
          if (id.includes('node_modules/@huggingface')) {
            return 'ai-models';
          }
          
          // Forms and validation
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/zod')) {
            return 'forms';
          }
          
          // Utilities
          if (id.includes('node_modules/date-fns')) {
            return 'date-utils';
          }
        },
        // Optimize output filenames
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      // Tree shaking optimizations
      treeshake: {
        moduleSideEffects: 'no-external',
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
