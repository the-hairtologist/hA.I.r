import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

// Vite configuration - Tailwind CSS v3 with PostCSS
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load and validate environment variables - restrict to VITE_ prefix
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  // Validate critical env vars
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_PROJECT_ID',
  ];

  const missingVars = requiredEnvVars.filter(key => !env[key]);
  
  // In development mode, warn; in production/other modes, fail
  if (missingVars.length > 0) {
    console.error(
      '❌ Missing required environment variables:',
      missingVars.join(', ')
    );
    // Only exit in non-development modes to avoid blocking local dev
    if (mode !== 'development') {
      process.exit(1);
    }
    const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}`;
    if (mode === 'development') {
      console.warn('⚠️', errorMsg);
    } else {
      console.error('❌', errorMsg);
      process.exit(1);
    }
    const message = `Missing required environment variables: ${missingVars.join(', ')}`;
    if (mode === 'development') {
      console.warn('⚠️', message);
    
    // Warn in development, fail in production/other modes
    if (mode === 'development') {
      console.warn('⚠️', message);
      console.warn('⚠️ Continuing in development mode, but app may not function correctly');
    } else {
      console.error('❌', message);
      process.exit(1);
    }
  } else if (mode === 'development') {
  } else {
    console.log('✅ All required environment variables present');
  }

  return {
    server: {
      host: '::',
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      visualizer({
        open: false, // Never auto-open to avoid browser pop-ups in CI
        open: mode !== 'production', // Open in dev, not in production
        open: mode !== 'production', // Auto-open in dev, available in production
        open: mode !== 'production', // Open in dev/test, not in production
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'icon-192.png',
          'icon-512.png',
          'og-image.png',
        ],
        manifest: {
          name: 'Hair AI Pro - Professional Hair Color Assistant',
          short_name: 'Hair AI Pro',
          description:
            'AI-powered hair color formulas, corrections, and salon management for professional stylists. Quick formulas in 2 seconds!',
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
              purpose: 'any maskable',
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
          screenshots: [
            {
              src: '/screenshot-1.png',
              sizes: '1170x2532',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'AI Assistant Chat',
            },
          ],
          shortcuts: [
            {
              name: 'AI Assistant',
              short_name: 'AI Chat',
              description: 'Get instant AI formula help',
              url: '/ai-assistant',
              icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
            {
              name: 'Quick Formula',
              short_name: 'Quick',
              description: 'Generate formula in 2 seconds',
              url: '/quick-formula',
              icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
            {
              name: 'Dashboard',
              short_name: 'Home',
              description: 'View your dashboard',
              url: '/dashboard',
              icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5000000,
          globIgnores: ['**/stats.html'],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            // JS/CSS bundles - aggressive caching
            {
              urlPattern: /\.(?:js|css)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
            // Google Fonts
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // API + User Data
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/rest/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 150,
                  maxAgeSeconds: 60 * 60, // 1 hour
                },
                networkTimeoutSeconds: 5,
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // Images
            {
              urlPattern: /\.(jpg|jpeg|png|gif|webp)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      compression(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Stub Capacitor plugins in ALL builds
        '@capacitor/haptics': path.resolve(
          __dirname,
          './src/stubs/capacitor-stub.ts'
        ),
        '@capacitor/camera': path.resolve(
          __dirname,
          './src/stubs/capacitor-stub.ts'
        ),
        '@capacitor/keyboard': path.resolve(
          __dirname,
          './src/stubs/capacitor-stub.ts'
        ),
        '@capacitor/app': path.resolve(
          __dirname,
          './src/stubs/capacitor-stub.ts'
        ),
        '@capacitor/preferences': path.resolve(
          __dirname,
          './src/stubs/capacitor-stub.ts'
        ),
        '@capacitor/share': path.resolve(
          __dirname,
          './src/stubs/capacitor-stub.ts'
        ),
        '@capacitor/status-bar': path.resolve(
          __dirname,
          './src/stubs/capacitor-stub.ts'
        ),
        '@capacitor/core': path.resolve(
          __dirname,
          './src/stubs/capacitor-stub.ts'
        ),
      },
    },
    build: {
      minify: 'esbuild',
      cssMinify: 'esbuild',
      target: 'es2020',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: id => {
            if (
              id.includes('node_modules/@supabase') ||
              id.includes('node_modules/@tanstack')
            ) {
              return 'data-vendor';
            }
            if (
              id.includes('node_modules/@radix-ui') ||
              id.includes('node_modules/lucide-react')
            ) {
              return 'ui-vendor';
            }
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/scheduler')
            ) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/recharts')) {
              return 'charts-vendor';
            }
            if (id.includes('node_modules/@huggingface/transformers')) {
              return 'ai-vendor';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
        treeshake: {
          moduleSideEffects: false,
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
      drop: [],
    },
  };
});
