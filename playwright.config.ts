import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration
 * Comprehensive device and browser testing setup
 */
export default defineConfig({
  testDir: './tests',
  
  // Maximum time one test can run
  timeout: 30 * 1000,
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:8080',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers and devices
  projects: [
    // === DESKTOP BROWSERS ===
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'Desktop Firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'Desktop Safari',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'Desktop Edge',
      use: { 
        ...devices['Desktop Edge'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    // === MOBILE DEVICES (iOS) ===
    {
      name: 'iPhone 15 Pro',
      use: { 
        ...devices['iPhone 15 Pro'],
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'iPhone 12',
      use: { 
        ...devices['iPhone 12'],
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'iPhone SE',
      use: { 
        ...devices['iPhone SE'],
        hasTouch: true,
        isMobile: true,
      },
    },

    // === MOBILE DEVICES (Android) ===
    {
      name: 'Samsung Galaxy S23',
      use: { 
        ...devices['Galaxy S23'],
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'Pixel 7',
      use: { 
        ...devices['Pixel 7'],
        hasTouch: true,
        isMobile: true,
      },
    },

    // === TABLETS ===
    {
      name: 'iPad Air',
      use: { 
        ...devices['iPad (gen 7)'],
        hasTouch: true,
        isMobile: false,
      },
    },
    {
      name: 'iPad Mini',
      use: { 
        ...devices['iPad Mini'],
        hasTouch: true,
        isMobile: false,
      },
    },

    // === RESPONSIVE BREAKPOINTS ===
    {
      name: 'Mobile Small (320px)',
      use: { 
        ...devices['iPhone SE'],
        viewport: { width: 320, height: 568 },
        hasTouch: true,
      },
    },
    {
      name: 'Tablet Portrait (768px)',
      use: { 
        viewport: { width: 768, height: 1024 },
        hasTouch: true,
      },
    },
    {
      name: 'Desktop Small (1366px)',
      use: { 
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: '4K Display (3840px)',
      use: { 
        viewport: { width: 3840, height: 2160 },
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});