#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * Checks that all required secrets are configured before deployment
 */

// Define required and optional secrets
const requiredSecrets = [
  {
    name: 'RESEND_API_KEY',
    description: 'Email delivery via Resend',
    pattern: /^re_[a-zA-Z0-9]+$/,
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Payment processing',
    pattern: /^sk_(test|live)_[a-zA-Z0-9]+$/,
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    description: 'Webhook signature verification',
    pattern: /^whsec_[a-zA-Z0-9]+$/,
  },
];

const optionalSecrets = [
  {
    name: 'SENTRY_DSN',
    description: 'Error tracking and monitoring',
    pattern: /^https:\/\/.+@.+\.ingest\.sentry\.io\/\d+$/,
  },
  {
    name: 'VITE_GA_MEASUREMENT_ID',
    description: 'Google Analytics 4',
    pattern: /^G-[A-Z0-9]+$/,
  },
];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Mock Deno.env for Node.js environment
const getEnv = (key: string): string | undefined => {
  return process.env[key];
};

console.log(`\n${colors.cyan}${colors.bold}🔍 Environment Variables Verification${colors.reset}\n`);
console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

let hasErrors = false;
let hasWarnings = false;

// Check required secrets
console.log(`${colors.bold}Required Secrets:${colors.reset}\n`);

requiredSecrets.forEach(({ name, description, pattern }) => {
  const value = getEnv(name);
  
  if (!value) {
    console.log(`${colors.red}❌ MISSING: ${name}${colors.reset}`);
    console.log(`   ${colors.red}↳ ${description}${colors.reset}`);
    console.log(`   ${colors.red}⚠️  App will fail without this!${colors.reset}\n`);
    hasErrors = true;
  } else if (!pattern.test(value)) {
    console.log(`${colors.yellow}⚠️  INVALID FORMAT: ${name}${colors.reset}`);
    console.log(`   ${colors.yellow}↳ Value doesn't match expected pattern${colors.reset}`);
    console.log(`   ${colors.yellow}↳ Current: ${value.substring(0, 15)}...${colors.reset}\n`);
    hasWarnings = true;
  } else {
    const maskedValue = value.substring(0, 10) + '...' + value.substring(value.length - 4);
    console.log(`${colors.green}✅ ${name}: ${maskedValue}${colors.reset}`);
    console.log(`   ${colors.green}↳ ${description}${colors.reset}\n`);
  }
});

// Check optional secrets
console.log(`${colors.bold}Optional Secrets:${colors.reset}\n`);

optionalSecrets.forEach(({ name, description, pattern }) => {
  const value = getEnv(name);
  
  if (!value) {
    console.log(`${colors.yellow}⚠️  NOT SET: ${name}${colors.reset}`);
    console.log(`   ${colors.yellow}↳ ${description} (optional but recommended)${colors.reset}\n`);
    hasWarnings = true;
  } else if (!pattern.test(value)) {
    console.log(`${colors.yellow}⚠️  INVALID FORMAT: ${name}${colors.reset}`);
    console.log(`   ${colors.yellow}↳ Value doesn't match expected pattern${colors.reset}\n`);
    hasWarnings = true;
  } else {
    const maskedValue = value.substring(0, 10) + '...';
    console.log(`${colors.green}✅ ${name}: ${maskedValue}${colors.reset}`);
    console.log(`   ${colors.green}↳ ${description}${colors.reset}\n`);
  }
});

// Check Supabase environment variables (auto-configured by Lovable)
console.log(`${colors.bold}Lovable Cloud (Auto-configured):${colors.reset}\n`);

const supabaseVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_PROJECT_ID',
];

supabaseVars.forEach((name) => {
  const value = getEnv(name);
  if (value) {
    const maskedValue = value.substring(0, 25) + '...';
    console.log(`${colors.green}✅ ${name}: ${maskedValue}${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  ${name}: Not detected (should be auto-configured)${colors.reset}`);
  }
});

// Final summary
console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

if (hasErrors) {
  console.log(`${colors.red}${colors.bold}❌ VERIFICATION FAILED${colors.reset}`);
  console.log(`${colors.red}Missing required secrets. Add them in Lovable Cloud:${colors.reset}`);
  console.log(`${colors.red}1. Open your project in Lovable${colors.reset}`);
  console.log(`${colors.red}2. Click "View Backend"${colors.reset}`);
  console.log(`${colors.red}3. Go to Settings → Secrets${colors.reset}`);
  console.log(`${colors.red}4. Add the missing secrets listed above${colors.reset}\n`);
  process.exit(1);
} else if (hasWarnings) {
  console.log(`${colors.yellow}${colors.bold}⚠️  VERIFICATION PASSED (WITH WARNINGS)${colors.reset}`);
  console.log(`${colors.yellow}Some optional secrets are missing or invalid.${colors.reset}`);
  console.log(`${colors.yellow}The app will work, but some features may be limited.${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.green}${colors.bold}✅ VERIFICATION PASSED${colors.reset}`);
  console.log(`${colors.green}All required secrets are configured correctly!${colors.reset}`);
  console.log(`${colors.green}Your app is ready for deployment. 🚀${colors.reset}\n`);
  process.exit(0);
}
