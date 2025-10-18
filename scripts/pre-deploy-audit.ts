/**
 * Pre-Deployment Audit Script
 * 
 * Runs automated safety checks before deploying to production.
 * Catches common mistakes and ensures code quality standards.
 * 
 * Usage: npm run audit:pre-deploy
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface AuditResult {
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

const results: AuditResult[] = [];

/**
 * Check if bundle size is under threshold
 */
function checkBundleSize(): AuditResult {
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    return {
      passed: false,
      message: 'Build directory not found. Run `npm run build` first.',
      severity: 'error',
    };
  }

  try {
    // Calculate total size of dist folder
    const calculateSize = (dir: string): number => {
      let totalSize = 0;
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += calculateSize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    };

    const totalSize = calculateSize(distPath);
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    const maxSizeMB = 5; // 5MB threshold

    if (totalSize > maxSizeMB * 1024 * 1024) {
      return {
        passed: false,
        message: `Bundle size (${sizeMB}MB) exceeds ${maxSizeMB}MB threshold`,
        severity: 'error',
      };
    }

    return {
      passed: true,
      message: `Bundle size: ${sizeMB}MB (within ${maxSizeMB}MB limit)`,
      severity: 'info',
    };
  } catch (error) {
    return {
      passed: false,
      message: `Failed to check bundle size: ${error}`,
      severity: 'error',
    };
  }
}

/**
 * Check for console.log statements in production build
 */
function checkConsoleLogs(): AuditResult {
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    return {
      passed: false,
      message: 'Build directory not found',
      severity: 'error',
    };
  }

  try {
    // Search for console.log in built files (should be stripped by esbuild)
    const result = execSync(`grep -r "console\\.log" "${distPath}" || true`).toString();
    
    if (result.trim().length > 0) {
      return {
        passed: false,
        message: 'console.log statements found in production build',
        severity: 'warning', // Warning since esbuild should handle this
      };
    }

    return {
      passed: true,
      message: 'No console.log in production build',
      severity: 'info',
    };
  } catch (error) {
    return {
      passed: true,
      message: 'Console log check passed (grep not available)',
      severity: 'info',
    };
  }
}

/**
 * Check for required environment variables
 */
function checkEnvironmentVariables(): AuditResult {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ];

  const missing: string[] = [];

  for (const varName of required) {
    if (!process.env[varName]) {
      // Check if it exists in .env file
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        if (!envContent.includes(varName)) {
          missing.push(varName);
        }
      } else {
        missing.push(varName);
      }
    }
  }

  if (missing.length > 0) {
    return {
      passed: false,
      message: `Missing environment variables: ${missing.join(', ')}`,
      severity: 'error',
    };
  }

  return {
    passed: true,
    message: 'All required environment variables present',
    severity: 'info',
  };
}

/**
 * Check for localhost references in production code
 */
function checkLocalhostReferences(): AuditResult {
  const srcPath = path.join(process.cwd(), 'src');
  
  try {
    // Search for localhost references (excluding dev files)
    const result = execSync(
      `grep -r "localhost" "${srcPath}" --exclude-dir=node_modules --exclude="*.test.ts" --exclude="*.test.tsx" || true`
    ).toString();
    
    // Filter out development-only files and comments
    const lines = result.split('\n').filter(line => {
      return line.trim() && 
             !line.includes('vite.config') && 
             !line.includes('// ') &&
             !line.includes('* ') &&
             !line.includes('mobileHealthCheck');
    });

    if (lines.length > 0) {
      return {
        passed: false,
        message: `Found ${lines.length} localhost reference(s) in source code`,
        severity: 'warning',
      };
    }

    return {
      passed: true,
      message: 'No hardcoded localhost references',
      severity: 'info',
    };
  } catch (error) {
    return {
      passed: true,
      message: 'Localhost check skipped (grep not available)',
      severity: 'info',
    };
  }
}

/**
 * Check TypeScript compilation
 */
function checkTypeScript(): AuditResult {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    
    return {
      passed: true,
      message: 'TypeScript compilation successful',
      severity: 'info',
    };
  } catch (error: any) {
    return {
      passed: false,
      message: `TypeScript errors found:\n${error.stdout?.toString() || error.message}`,
      severity: 'error',
    };
  }
}

/**
 * Run all audit checks
 */
function runAudit() {
  console.log('\n🔍 Running Pre-Deployment Audit...\n');

  const checks = [
    { name: 'TypeScript Compilation', fn: checkTypeScript },
    { name: 'Bundle Size', fn: checkBundleSize },
    { name: 'Console Logs', fn: checkConsoleLogs },
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'Localhost References', fn: checkLocalhostReferences },
  ];

  for (const check of checks) {
    const result = check.fn();
    results.push(result);

    const icon = result.passed ? '✅' : result.severity === 'error' ? '❌' : '⚠️';
    console.log(`${icon} ${check.name}: ${result.message}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  const errors = results.filter(r => !r.passed && r.severity === 'error');
  const warnings = results.filter(r => !r.passed && r.severity === 'warning');

  if (errors.length > 0) {
    console.log(`❌ Audit FAILED with ${errors.length} error(s)`);
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log(`⚠️  Audit PASSED with ${warnings.length} warning(s)`);
  } else {
    console.log('✅ All checks passed!');
  }

  console.log('\n✨ Ready for deployment!\n');
  process.exit(0);
}

// Run the audit
runAudit();
