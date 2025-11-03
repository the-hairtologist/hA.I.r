# hA.I.r - AI-Powered Hair Salon Management Platform

[![CI Fast](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci-fast.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci-fast.yml)
[![Deep Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deep-tests.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deep-tests.yml)
[![Security Scan](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/security-scan.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/security-scan.yml)
[![Performance](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/performance-analysis.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/performance-analysis.yml)

AI-powered platform for hair stylists to manage clients, appointments, formulas, and business operations with intelligent automation.

> **Note**: Replace `YOUR_USERNAME/YOUR_REPO` in the badge URLs above with your actual GitHub repository details.

---

## 🎯 **Lost? Read This: [WHAT TO DO NEXT →](./WHAT_TO_DO_NEXT.md)**

**Ultra-quick guide**: 30 seconds to know exactly what to do.

## 🚀 **New Here? [START WITH THIS GUIDE →](./GETTING_STARTED.md)**

**Complete guide**: Everything you need to get started in one place.

**Looking for something specific?** Check the [Documentation Index](./DOCUMENTATION_INDEX.md) which organizes all 495+ documentation files into easy-to-find categories.

---

## 🚀 Features

### 🤖 AI-Powered Intelligence

- **Smart Appointment Scheduling** - Automated booking optimization
- **Client Retention Analysis** - Predictive insights for at-risk clients
- **Automated Upsell Recommendations** - AI-driven product suggestions
- **Visual Hair Analysis** - Color matching and formula optimization
- **Intelligent Maintenance** - Self-healing error recovery and performance optimization

### 📊 Real-Time Sync

- **Live Appointment Updates** - Instant synchronization across devices
- **Real-Time Messaging** - Instant client communication
- **Automatic Data Sync** - Seamless multi-device experience

### 🛡️ Self-Healing Infrastructure

- **Automatic Error Recovery** - Circuit breakers and exponential backoff
- **Performance Optimization** - Intelligent caching and resource management
- **Health Monitoring** - 24/7 system health checks
- **Data Integrity Checks** - Automated validation and repair

### ♿ WCAG 2.2 AA Compliant

- **Full Accessibility Support** - Screen reader optimized
- **Keyboard Navigation** - Complete keyboard support
- **44px Touch Targets** - Mobile-friendly interactions
- **High Contrast** - AA-compliant color contrast ratios

### 📱 Mobile-First Design

- **Responsive Layout** - Optimized for 320px to 1920px+ screens
- **PWA Ready** - Installable on mobile devices
- **Offline Capable** - Core features work without internet
- **Touch Optimized** - Gesture support and haptic feedback

## 🧪 Testing

Run the comprehensive E2E test suite:

```bash
# Run all tests
npm test

# Interactive test UI
npm run test:ui

# Run tests with browser visible
npm run test:headed

# Debug specific test
npm run test:debug

# Mobile-specific tests
npm run test:mobile

# Accessibility tests
npm run test:a11y

# View test report
npm run test:report
```

### Test Coverage

- ✅ 81 E2E test files
- ✅ Desktop (Chrome, Firefox, Safari)
- ✅ Mobile (iOS, Android)
- ✅ Accessibility (WCAG 2.2 AA)
- ✅ Performance (Core Web Vitals)
- ✅ Cross-browser compatibility

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL with Row Level Security
- **Auth**: Supabase Auth (Email, Google)
- **Storage**: Supabase Storage
- **AI**: Lovable AI (Gemini, GPT models)
- **Testing**: Playwright, Vitest
- **Monitoring**: Sentry, Custom Performance Tracking

## 📦 Getting Started

### Prerequisites

- Node.js 20+ and npm
- Git

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### 🚀 VS Code Development Shortcuts

If using VS Code, you get automatic shell integration with these shortcuts:

```bash
# Development
dev          # Start development server
test         # Run tests
testw        # Run tests in watch mode
build        # Build for production
lint         # Run ESLint
format       # Format code with Prettier

# Git Workflow
gs           # git status
ga           # git add all
gcommit 'msg' # git commit with message
gpush        # git push
glog         # git log (last 10)

# Navigation
src          # Go to src folder
components   # Go to components
pages        # Go to pages
supabase     # Go to supabase

# Utilities
Test-Environment     # Check development environment
Show-HairGeniusHelp  # Show all available commands
```

**📋 Available via VS Code Command Palette (`Ctrl+Shift+P`):**

- Tasks: Start Development Server
- Tasks: Run Tests
- Tasks: Build Production
- Tasks: Lint Code

See [VSCODE_SHORTCUTS_REFERENCE.md](./VSCODE_SHORTCUTS_REFERENCE.md) for complete documentation.

## 🔐 Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
# Supabase (Auto-configured by Lovable Cloud)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# Analytics (Optional)
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry (Optional)
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

## 🚢 Deployment

### Via Lovable

1. Open [Lovable Project](https://lovable.dev/projects/a1a18f9d-b2f9-4d81-aa8c-e28408bee3a2)
2. Click **Share → Publish**
3. Your app is live!

### Custom Domain

1. Navigate to **Project > Settings > Domains**
2. Click **Connect Domain**
3. Follow DNS configuration steps

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain)

## 📊 Performance

- **Lighthouse Score**: 95+ (Mobile & Desktop)
- **Core Web Vitals**: All Green
- **LCP**: < 2.5s
- **FID/INP**: < 100ms
- **CLS**: < 0.1

## 🔒 Security

- Row Level Security (RLS) on all tables
- SQL injection protection via search_path
- Secure token storage in Supabase Vault
- HTTPS-only in production
- Regular security audits

## 🤝 Contributing

This is a Lovable-managed project. Changes can be made via:

1. **Lovable Editor** (Recommended)
2. **Local IDE** - Clone, edit, push
3. **GitHub Web Editor** - Direct file editing
4. **GitHub Codespaces** - Cloud development environment

### Contribution Workflow

1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the project guidelines
   - Follow TypeScript/React best practices
   - Maintain WCAG 2.2 AA compliance
   - Add tests for new features
   - Update documentation as needed

3. **Test locally**
   ```bash
   npm test          # Run all tests
   npm run lint      # Check code quality
   npm run build     # Verify build
   ```

4. **Submit a Pull Request**
   - Use the [PR template](.github/pull_request_template.md)
   - Reference related issues
   - Ensure all CI checks pass
   - Request review from code owners

### Reporting Issues

- 🐛 **Bugs**: Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml)
- ✨ **Features**: Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.yml)
- 🔒 **Security**: Follow the [Security Vulnerability Process](.github/ISSUE_TEMPLATE/security_vulnerability.md)

### Branch Protection

The `main` branch is protected. See [Branch Protection Guide](.github/BRANCH_PROTECTION.md) for setup instructions.

## 📝 License

Copyright © 2025 hA.I.r. All Rights Reserved.

## 🔗 Links

- **Live App**: [Deploy via Lovable](https://lovable.dev/projects/a1a18f9d-b2f9-4d81-aa8c-e28408bee3a2)
- **Documentation**: [Lovable Docs](https://docs.lovable.dev/)
- **Support**: [Lovable Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)

---

Built with ❤️ using [Lovable](https://lovable.dev)
