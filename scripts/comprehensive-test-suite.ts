/**
 * Comprehensive Test Suite - All Mindsets
 * Tests the app from multiple perspectives: Optimist, Pessimist, Security Expert, Performance Analyst
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  mindset: string;
}

const results: TestResult[] = [];

console.log('\n🧪 COMPREHENSIVE TEST SUITE - ALL MINDSETS\n');
console.log('='.repeat(60) + '\n');

// ============================================================================
// MINDSET 1: THE OPTIMIST (Happy Path Testing)
// ============================================================================

console.log('😊 MINDSET 1: THE OPTIMIST (Happy Path)\n');

function testOptimisticScenarios() {
  // Test 1: AI tools exist and are properly structured
  const aiToolsPath = 'src/components/ai/AdvancedAITools.tsx';
  if (fs.existsSync(aiToolsPath)) {
    const content = fs.readFileSync(aiToolsPath, 'utf-8');
    
    if (content.includes('socratic') && content.includes('strategy') && content.includes('creative')) {
      results.push({
        category: 'AI Tools',
        test: 'All 3 AI tools present in component',
        status: 'PASS',
        message: 'Socratic, Strategy, and Creative tools found',
        mindset: 'Optimist'
      });
    } else {
      results.push({
        category: 'AI Tools',
        test: 'All 3 AI tools present',
        status: 'FAIL',
        message: 'Missing one or more AI tools',
        mindset: 'Optimist'
      });
    }
  }

  // Test 2: Edge functions created
  const edgeFunctions = [
    'supabase/functions/socratic-analysis/index.ts',
    'supabase/functions/strategy-simulator/index.ts',
    'supabase/functions/creative-solver/index.ts'
  ];

  edgeFunctions.forEach(func => {
    if (fs.existsSync(func)) {
      results.push({
        category: 'Edge Functions',
        test: `${path.basename(path.dirname(func))} exists`,
        status: 'PASS',
        message: 'Edge function file created',
        mindset: 'Optimist'
      });
    } else {
      results.push({
        category: 'Edge Functions',
        test: `${path.basename(path.dirname(func))} exists`,
        status: 'FAIL',
        message: 'Edge function missing',
        mindset: 'Optimist'
      });
    }
  });

  // Test 3: Sentry integration in logger
  const loggerPath = 'src/lib/logger.ts';
  if (fs.existsSync(loggerPath)) {
    const content = fs.readFileSync(loggerPath, 'utf-8');
    
    if (content.includes('captureError') && content.includes('monitoring')) {
      results.push({
        category: 'Error Tracking',
        test: 'Sentry integrated in logger',
        status: 'PASS',
        message: 'Logger connected to Sentry',
        mindset: 'Optimist'
      });
    } else {
      results.push({
        category: 'Error Tracking',
        test: 'Sentry integration',
        status: 'WARN',
        message: 'Sentry integration unclear',
        mindset: 'Optimist'
      });
    }
  }
}

// ============================================================================
// MINDSET 2: THE PESSIMIST (Breaking Things)
// ============================================================================

console.log('😰 MINDSET 2: THE PESSIMIST (Edge Cases)\n');

function testPessimisticScenarios() {
  // Test 1: Input validation exists
  const edgeFunctions = [
    { path: 'supabase/functions/socratic-analysis/index.ts', maxChars: 5000 },
    { path: 'supabase/functions/strategy-simulator/index.ts', maxChars: 1000 },
    { path: 'supabase/functions/creative-solver/index.ts', maxChars: 1000 }
  ];

  edgeFunctions.forEach(({ path: funcPath, maxChars }) => {
    if (fs.existsSync(funcPath)) {
      const content = fs.readFileSync(funcPath, 'utf-8');
      
      const hasValidation = content.includes('trim()') && 
                           content.includes('.length') &&
                           content.includes(maxChars.toString());
      
      if (hasValidation) {
        results.push({
          category: 'Security',
          test: `${path.basename(path.dirname(funcPath))} input validation`,
          status: 'PASS',
          message: `Validates input length (${maxChars} chars)`,
          mindset: 'Pessimist'
        });
      } else {
        results.push({
          category: 'Security',
          test: `${path.basename(path.dirname(funcPath))} input validation`,
          status: 'FAIL',
          message: 'Missing input validation',
          mindset: 'Pessimist'
        });
      }
    }
  });

  // Test 2: Rate limit handling
  edgeFunctions.forEach(({ path: funcPath }) => {
    if (fs.existsSync(funcPath)) {
      const content = fs.readFileSync(funcPath, 'utf-8');
      
      if (content.includes('429') && content.includes('402')) {
        results.push({
          category: 'Error Handling',
          test: `${path.basename(path.dirname(funcPath))} rate limit handling`,
          status: 'PASS',
          message: 'Handles 429 and 402 errors',
          mindset: 'Pessimist'
        });
      } else {
        results.push({
          category: 'Error Handling',
          test: `${path.basename(path.dirname(funcPath))} rate limit handling`,
          status: 'FAIL',
          message: 'Missing rate limit handling',
          mindset: 'Pessimist'
        });
      }
    }
  });

  // Test 3: Error boundaries exist
  const errorBoundaries = [
    'src/components/errors/GlobalErrorBoundary.tsx',
    'src/components/ErrorBoundary.tsx',
    'src/components/errors/RouteErrorBoundary.tsx'
  ];

  errorBoundaries.forEach(boundary => {
    if (fs.existsSync(boundary)) {
      const content = fs.readFileSync(boundary, 'utf-8');
      
      if (content.includes('logger.error') || content.includes('captureError')) {
        results.push({
          category: 'Error Boundaries',
          test: `${path.basename(boundary)} error logging`,
          status: 'PASS',
          message: 'Connected to centralized logger',
          mindset: 'Pessimist'
        });
      } else {
        results.push({
          category: 'Error Boundaries',
          test: `${path.basename(boundary)} error logging`,
          status: 'WARN',
          message: 'May not be logging to Sentry',
          mindset: 'Pessimist'
        });
      }
    }
  });
}

// ============================================================================
// MINDSET 3: THE SECURITY EXPERT (Attack Vectors)
// ============================================================================

console.log('🔒 MINDSET 3: THE SECURITY EXPERT (Attack Vectors)\n');

function testSecurityScenarios() {
  // Test 1: No dangerouslySetInnerHTML
  const uiComponents = ['src/components/ai/AdvancedAITools.tsx', 'src/pages/AIAssistant.tsx'];
  
  uiComponents.forEach(comp => {
    if (fs.existsSync(comp)) {
      const content = fs.readFileSync(comp, 'utf-8');
      
      if (content.includes('dangerouslySetInnerHTML')) {
        results.push({
          category: 'XSS Protection',
          test: `${path.basename(comp)} XSS safety`,
          status: 'FAIL',
          message: 'Uses dangerouslySetInnerHTML - XSS risk!',
          mindset: 'Security Expert'
        });
      } else {
        results.push({
          category: 'XSS Protection',
          test: `${path.basename(comp)} XSS safety`,
          status: 'PASS',
          message: 'No dangerouslySetInnerHTML found',
          mindset: 'Security Expert'
        });
      }
    }
  });

  // Test 2: JWT verification in config
  const configPath = 'supabase/config.toml';
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf-8');
    
    const newFunctions = ['socratic-analysis', 'strategy-simulator', 'creative-solver'];
    newFunctions.forEach(func => {
      const funcConfig = content.match(new RegExp(`\\[functions\\.${func}\\][\\s\\S]*?verify_jwt = (true|false)`));
      
      if (funcConfig && funcConfig[1] === 'true') {
        results.push({
          category: 'Authentication',
          test: `${func} JWT verification`,
          status: 'PASS',
          message: 'JWT verification enabled',
          mindset: 'Security Expert'
        });
      } else {
        results.push({
          category: 'Authentication',
          test: `${func} JWT verification`,
          status: 'FAIL',
          message: 'JWT verification NOT enabled - security risk!',
          mindset: 'Security Expert'
        });
      }
    });
  }

  // Test 3: CORS headers present
  const edgeFunctions = [
    'supabase/functions/socratic-analysis/index.ts',
    'supabase/functions/strategy-simulator/index.ts',
    'supabase/functions/creative-solver/index.ts'
  ];

  edgeFunctions.forEach(func => {
    if (fs.existsSync(func)) {
      const content = fs.readFileSync(func, 'utf-8');
      
      if (content.includes('corsHeaders') && content.includes('OPTIONS')) {
        results.push({
          category: 'CORS',
          test: `${path.basename(path.dirname(func))} CORS configuration`,
          status: 'PASS',
          message: 'CORS headers and OPTIONS handler present',
          mindset: 'Security Expert'
        });
      } else {
        results.push({
          category: 'CORS',
          test: `${path.basename(path.dirname(func))} CORS`,
          status: 'FAIL',
          message: 'Missing CORS configuration',
          mindset: 'Security Expert'
        });
      }
    }
  });

  // Test 4: No raw SQL execution
  edgeFunctions.forEach(func => {
    if (fs.existsSync(func)) {
      const content = fs.readFileSync(func, 'utf-8');
      
      if (content.includes('.rpc(') && content.includes('execute_sql')) {
        results.push({
          category: 'SQL Injection',
          test: `${path.basename(path.dirname(func))} SQL safety`,
          status: 'FAIL',
          message: 'Raw SQL execution detected - injection risk!',
          mindset: 'Security Expert'
        });
      } else {
        results.push({
          category: 'SQL Injection',
          test: `${path.basename(path.dirname(func))} SQL safety`,
          status: 'PASS',
          message: 'No raw SQL execution found',
          mindset: 'Security Expert'
        });
      }
    }
  });
}

// ============================================================================
// MINDSET 4: THE PERFORMANCE ANALYST (Speed & Size)
// ============================================================================

console.log('⚡ MINDSET 4: THE PERFORMANCE ANALYST (Speed & Size)\n');

function testPerformanceScenarios() {
  // Test 1: Lazy loading for AI tools
  const aiAssistantPath = 'src/pages/AIAssistant.tsx';
  if (fs.existsSync(aiAssistantPath)) {
    const content = fs.readFileSync(aiAssistantPath, 'utf-8');
    
    if (content.includes('Collapsible') && content.includes('defaultOpen={false}')) {
      results.push({
        category: 'Performance',
        test: 'AI tools lazy loaded',
        status: 'PASS',
        message: 'Advanced tools in collapsible (not loaded until expanded)',
        mindset: 'Performance Analyst'
      });
    } else {
      results.push({
        category: 'Performance',
        test: 'AI tools lazy loading',
        status: 'WARN',
        message: 'AI tools may load on page mount',
        mindset: 'Performance Analyst'
      });
    }
  }

  // Test 2: Bundle size check
  try {
    const stats = execSync('du -sh dist 2>/dev/null || echo "0"').toString().trim();
    const sizeMatch = stats.match(/^([\d.]+)([KMG]?)/);
    
    if (sizeMatch) {
      const [, size, unit] = sizeMatch;
      const sizeNum = parseFloat(size);
      
      let isUnderLimit = false;
      if (unit === 'K' || (unit === 'M' && sizeNum < 5)) {
        isUnderLimit = true;
      }
      
      results.push({
        category: 'Bundle Size',
        test: 'Production bundle size',
        status: isUnderLimit ? 'PASS' : 'FAIL',
        message: `Bundle size: ${size}${unit} (limit: 5MB)`,
        mindset: 'Performance Analyst'
      });
    }
  } catch (e) {
    results.push({
      category: 'Bundle Size',
      test: 'Production bundle check',
      status: 'WARN',
      message: 'dist/ folder not found - run npm run build first',
      mindset: 'Performance Analyst'
    });
  }

  // Test 3: Code splitting check
  const codeSplittingPath = 'src/lib/performance/CodeSplitting.ts';
  if (fs.existsSync(codeSplittingPath)) {
    const content = fs.readFileSync(codeSplittingPath, 'utf-8');
    
    if (content.includes('lazyWithRetry')) {
      results.push({
        category: 'Code Splitting',
        test: 'Lazy loading with retry',
        status: 'PASS',
        message: 'Components use lazyWithRetry for resilience',
        mindset: 'Performance Analyst'
      });
    } else {
      results.push({
        category: 'Code Splitting',
        test: 'Code splitting',
        status: 'WARN',
        message: 'Code splitting may not be optimized',
        mindset: 'Performance Analyst'
      });
    }
  }
}

// ============================================================================
// MINDSET 5: THE ACCESSIBILITY ADVOCATE (A11y)
// ============================================================================

console.log('♿ MINDSET 5: THE ACCESSIBILITY ADVOCATE (A11y)\n');

function testAccessibilityScenarios() {
  const aiToolsPath = 'src/components/ai/AdvancedAITools.tsx';
  
  if (fs.existsSync(aiToolsPath)) {
    const content = fs.readFileSync(aiToolsPath, 'utf-8');
    
    // Test 1: Form labels
    if (content.includes('<Label')) {
      results.push({
        category: 'Accessibility',
        test: 'Form labels present',
        status: 'PASS',
        message: 'Input fields have associated labels',
        mindset: 'Accessibility Advocate'
      });
    } else {
      results.push({
        category: 'Accessibility',
        test: 'Form labels',
        status: 'FAIL',
        message: 'Missing form labels - screen reader issue',
        mindset: 'Accessibility Advocate'
      });
    }
    
    // Test 2: Loading states
    if (content.includes('Loader2') && content.includes('aria-')) {
      results.push({
        category: 'Accessibility',
        test: 'Loading state indicators',
        status: 'PASS',
        message: 'Loading states have ARIA labels',
        mindset: 'Accessibility Advocate'
      });
    } else {
      results.push({
        category: 'Accessibility',
        test: 'Loading indicators',
        status: 'WARN',
        message: 'Loading states may lack ARIA labels',
        mindset: 'Accessibility Advocate'
      });
    }
    
    // Test 3: Button disabled states
    if (content.includes('disabled={')) {
      results.push({
        category: 'Accessibility',
        test: 'Disabled states',
        status: 'PASS',
        message: 'Buttons have proper disabled states',
        mindset: 'Accessibility Advocate'
      });
    } else {
      results.push({
        category: 'Accessibility',
        test: 'Button disabled states',
        status: 'WARN',
        message: 'Buttons may not have disabled states',
        mindset: 'Accessibility Advocate'
      });
    }
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

testOptimisticScenarios();
testPessimisticScenarios();
testSecurityScenarios();
testPerformanceScenarios();
testAccessibilityScenarios();

// ============================================================================
// GENERATE REPORT
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('📊 TEST RESULTS SUMMARY\n');

const byMindset = results.reduce((acc, r) => {
  if (!acc[r.mindset]) acc[r.mindset] = [];
  acc[r.mindset].push(r);
  return acc;
}, {} as Record<string, TestResult[]>);

Object.entries(byMindset).forEach(([mindset, tests]) => {
  const pass = tests.filter(t => t.status === 'PASS').length;
  const fail = tests.filter(t => t.status === 'FAIL').length;
  const warn = tests.filter(t => t.status === 'WARN').length;
  
  console.log(`${mindset}:`);
  console.log(`  ✅ PASS: ${pass}`);
  console.log(`  ❌ FAIL: ${fail}`);
  console.log(`  ⚠️  WARN: ${warn}`);
  console.log();
});

const totalPass = results.filter(r => r.status === 'PASS').length;
const totalFail = results.filter(r => r.status === 'FAIL').length;
const totalWarn = results.filter(r => r.status === 'WARN').length;

console.log('OVERALL:');
console.log(`  ✅ PASS: ${totalPass}/${results.length}`);
console.log(`  ❌ FAIL: ${totalFail}/${results.length}`);
console.log(`  ⚠️  WARN: ${totalWarn}/${results.length}`);
console.log();

// Detailed results
console.log('\n' + '='.repeat(60));
console.log('📋 DETAILED RESULTS\n');

results.forEach(r => {
  const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${r.mindset}] ${r.category} - ${r.test}`);
  console.log(`   ${r.message}\n`);
});

// Write to file
const reportPath = 'TEST_RESULTS.json';
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\n📄 Full results saved to: ${reportPath}\n`);

// Exit code
if (totalFail > 0) {
  console.log('❌ TESTS FAILED - Fix issues before deploying\n');
  process.exit(1);
} else if (totalWarn > 0) {
  console.log('⚠️  TESTS PASSED WITH WARNINGS - Review before deploying\n');
  process.exit(0);
} else {
  console.log('✅ ALL TESTS PASSED - Ready for production!\n');
  process.exit(0);
}
