#!/usr/bin/env node

/**
 * Query Analysis Script
 * Analyzes codebase for query patterns and optimization opportunities
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const results = {
  totalQueries: 0,
  componentQueries: {},
  duplicatePatterns: [],
  optimizationOpportunities: [],
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(srcDir, filePath);

  // Count supabase queries
  const supabaseQueries = (content.match(/supabase\.from\(/g) || []).length;

  // Count useQuery hooks
  const reactQueries = (content.match(/useQuery\(/g) || []).length;

  const totalQueries = supabaseQueries + reactQueries;

  if (totalQueries > 0) {
    results.totalQueries += totalQueries;
    results.componentQueries[relativePath] = totalQueries;

    // Flag components with many queries
    if (totalQueries > 3) {
      results.optimizationOpportunities.push({
        file: relativePath,
        queries: totalQueries,
        suggestion: 'Consider combining queries or using batch fetching',
      });
    }

    // Check for potential duplicate queries
    const queryPattern = content.match(/supabase\.from\('(\w+)'\)/g) || [];
    const tables = queryPattern.map(q => q.match(/'(\w+)'/)[1]);
    const duplicates = tables.filter((t, i) => tables.indexOf(t) !== i);

    if (duplicates.length > 0) {
      results.duplicatePatterns.push({
        file: relativePath,
        tables: [...new Set(duplicates)],
      });
    }
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.match(/\.(ts|tsx)$/)) {
      analyzeFile(filePath);
    }
  }
}

console.log('🔍 Analyzing query patterns...\n');

walkDir(srcDir);

console.log('📊 Query Analysis Results');
console.log('========================\n');
console.log(`Total queries found: ${results.totalQueries}`);
console.log(
  `Components with queries: ${Object.keys(results.componentQueries).length}`
);
console.log(
  `Optimization opportunities: ${results.optimizationOpportunities.length}`
);
console.log(`Potential duplicates: ${results.duplicatePatterns.length}\n`);

if (results.optimizationOpportunities.length > 0) {
  console.log('⚠️  Optimization Opportunities:');
  results.optimizationOpportunities.slice(0, 5).forEach(opp => {
    console.log(`  - ${opp.file}: ${opp.queries} queries`);
    console.log(`    ${opp.suggestion}`);
  });
  console.log('');
}

if (results.duplicatePatterns.length > 0) {
  console.log('🔄 Potential Duplicate Queries:');
  results.duplicatePatterns.slice(0, 5).forEach(dup => {
    console.log(`  - ${dup.file}: ${dup.tables.join(', ')}`);
  });
  console.log('');
}

// Write detailed report
const reportPath = path.join(__dirname, '../query-analysis-report.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`📄 Detailed report saved to: query-analysis-report.json\n`);

// Exit with warning if too many optimization opportunities
if (results.optimizationOpportunities.length > 10) {
  console.log('⚠️  Warning: Many optimization opportunities found!');
  process.exit(1);
}

process.exit(0);
