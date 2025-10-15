#!/bin/bash
# Comprehensive Test Runner Script for hA.I.r Platform
# This script runs all QA tests and generates reports

set -e

echo "🧪 hA.I.r Comprehensive Test Suite"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Playwright is installed
print_status "Checking Playwright installation..."
if ! command -v npx &> /dev/null; then
    print_error "npx not found. Please install Node.js"
    exit 1
fi

# Check if browsers are installed
print_status "Checking Playwright browsers..."
if [ ! -d "$HOME/.cache/ms-playwright" ]; then
    print_warning "Playwright browsers not found. Installing..."
    npx playwright install
    print_success "Browsers installed"
fi

echo ""
echo "================================"
echo "Test Execution Options:"
echo "================================"
echo "1. Run ALL tests (72 tests)"
echo "2. Run Desktop tests only (36 tests)"
echo "3. Run Mobile tests only (36 tests)"
echo "4. Run Admin role tests"
echo "5. Run Stylist role tests"
echo "6. Run Client role tests"
echo "7. Run in headed mode (visual)"
echo "8. Generate report only"
echo ""

read -p "Select option (1-8): " option

case $option in
    1)
        print_status "Running ALL comprehensive tests..."
        npx playwright test --config=playwright.config.ts
        ;;
    2)
        print_status "Running Desktop tests only..."
        npx playwright test comprehensive-role-tests.spec.ts
        ;;
    3)
        print_status "Running Mobile tests only..."
        npx playwright test comprehensive-mobile-tests.spec.ts
        ;;
    4)
        print_status "Running Admin role tests..."
        npx playwright test -g "Admin Role"
        ;;
    5)
        print_status "Running Stylist role tests..."
        npx playwright test -g "Stylist Role"
        ;;
    6)
        print_status "Running Client role tests..."
        npx playwright test -g "Client Role"
        ;;
    7)
        print_status "Running tests in headed mode..."
        npx playwright test --headed
        ;;
    8)
        print_status "Generating report..."
        npx playwright show-report
        exit 0
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

# Check exit code
if [ $? -eq 0 ]; then
    print_success "All tests completed successfully!"
    echo ""
    print_status "Generating HTML report..."
    npx playwright show-report
else
    print_error "Some tests failed. Check the report for details."
    echo ""
    print_status "Generating HTML report..."
    npx playwright show-report
    exit 1
fi

echo ""
echo "================================"
print_success "Test execution complete!"
echo "================================"
echo ""
echo "📊 View detailed results in the HTML report"
echo "🔍 Check TEST_RESULTS_REPORT.md for analysis"
echo ""
