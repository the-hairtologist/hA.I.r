# hA.I.r - AI-Powered Hair Salon Management Platform

AI-powered platform for hair stylists to manage clients, appointments, formulas, and business operations with intelligent automation.

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

**Security Note**: Never commit `.env` files! All sensitive credentials should be stored in environment variables. See [.env.example](./.env.example) for detailed documentation of all required secrets.

## 🔄 CI/CD & Development Workflow

### Automated Workflows

This project uses GitHub Actions for continuous integration and deployment:

#### 🔍 **Lint Workflow** (`lint.yml`)

- Runs ESLint with strict mode (fails on warnings)
- Checks code formatting with Prettier
- Validates package-lock.json synchronization
- Detects extraneous packages with `npm prune`

#### 🧪 **Unit Tests** (`test.yml`)

- Runs Vitest unit tests with coverage
- TypeScript type checking
- Comments test results on PRs

#### 📊 **Code Coverage** (`coverage.yml`)

- Generates coverage reports with Vitest
- Uploads to Codecov for tracking
- Enforces coverage thresholds (70% lines/statements, 60% functions/branches)
- Comments coverage summary on PRs

#### 🔒 **Security Audit** (`audit.yml`)

- Runs `npm audit` daily and on PRs
- Checks for known vulnerabilities
- Dependency review for PRs
- Alerts on critical/high severity issues

#### 🚀 **Semantic Release** (`semantic-release.yml`)

- Automated versioning based on conventional commits
- Auto-generates CHANGELOG.md
- Creates GitHub releases
- Runs on main branch only

### Development Standards

**Code Quality Requirements:**

- ✅ ESLint passes with zero warnings
- ✅ TypeScript compiles with strict mode
- ✅ All tests pass
- ✅ Code is formatted with Prettier
- ✅ No security vulnerabilities

**Before Submitting a PR:**

```bash
npm run lint          # ESLint check
npm run type-check    # TypeScript check
npm run test          # Run unit tests
npm run format        # Auto-format code
npm audit             # Security audit
```

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for automated releases:

```bash
feat(scope): add new feature       # Minor version bump
fix(scope): fix bug                # Patch version bump
docs(scope): update docs           # Patch version bump
chore(scope): maintenance task     # No version bump
```

**Breaking changes** trigger a major version bump:

```bash
feat(api)!: change API structure

BREAKING CHANGE: API response format changed
```

### Dependency Management

- **Dependabot** automatically creates PRs for dependency updates
- Updates are grouped by ecosystem (React, Radix UI, testing, etc.)
- Reviews scheduled weekly on Mondays at 9 AM
- Major version updates require manual approval

### Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on:

- Setting up your development environment
- Coding standards and best practices
- Testing requirements
- Security guidelines
- Pull request process

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

## 📝 License

Copyright © 2025 hA.I.r. All Rights Reserved.

## 🔗 Links

- **Live App**: [Deploy via Lovable](https://lovable.dev/projects/a1a18f9d-b2f9-4d81-aa8c-e28408bee3a2)
- **Documentation**: [Lovable Docs](https://docs.lovable.dev/)
- **Support**: [Lovable Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)

---

Built with ❤️ using [Lovable](https://lovable.dev)
