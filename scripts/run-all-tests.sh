#!/bin/bash

# Run All Tests Script
# Executes all testing phases in sequence

echo "🚀 Running Complete Test Suite"
echo "=============================="
echo ""

# Phase 1: Pre-Deploy Audit
echo "📋 Phase 1: Pre-Deploy Audit"
echo "----------------------------"
npm run audit:pre-deploy
AUDIT_EXIT=$?

if [ $AUDIT_EXIT -ne 0 ]; then
  echo "❌ Pre-deploy audit failed!"
  exit 1
fi

echo "✅ Pre-deploy audit passed"
echo ""

# Phase 2: Comprehensive Test Suite
echo "🧪 Phase 2: Comprehensive Testing (All Mindsets)"
echo "------------------------------------------------"
tsx scripts/comprehensive-test-suite.ts
TEST_EXIT=$?

if [ $TEST_EXIT -ne 0 ]; then
  echo "❌ Comprehensive tests failed!"
  exit 1
fi

echo "✅ Comprehensive tests passed"
echo ""

# Phase 3: Bundle Analysis
echo "📦 Phase 3: Bundle Analysis"
echo "--------------------------"
if [ -d "dist" ]; then
  echo "Bundle size:"
  du -sh dist
  echo ""
  echo "Largest chunks:"
  find dist -type f -name "*.js" -exec ls -lh {} \; | sort -k5 -rh | head -5
else
  echo "⚠️  No dist/ folder found. Run 'npm run build' first."
fi

echo ""
echo "=============================="
echo "✅ All tests completed successfully!"
echo "=============================="
