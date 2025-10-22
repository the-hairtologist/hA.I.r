#!/usr/bin/env node

// Pre-build environment validation for Lovable Cloud
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_PROJECT_ID'
];

console.log('🔍 Checking environment variables...\n');

let hasErrors = false;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ Missing: ${varName}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found: ${varName}`);
  }
});

if (hasErrors) {
  console.error('\n❌ Environment validation failed!');
  console.error('💡 Ensure your .env file contains all required variables.');
  process.exit(1);
}

console.log('\n✅ All environment variables validated successfully!');
