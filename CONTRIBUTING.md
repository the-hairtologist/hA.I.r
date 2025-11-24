# Contributing to hA.I.r

Thank you for your interest in contributing to hA.I.r! This document provides guidelines and best practices for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Security Guidelines](#security-guidelines)
- [Pull Request Process](#pull-request-process)
- [Commit Message Convention](#commit-message-convention)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Assume good intentions

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Git

### Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/hA.I.r.git
   cd hA.I.r
   ```

3. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Verify setup**:
   ```bash
   npm run type-check
   npm run lint
   npm run test
   npm run build
   ```

## 💻 Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates
- `chore/description` - Maintenance tasks

### Development Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our [coding standards](#coding-standards)

3. **Run checks frequently**:
   ```bash
   npm run lint        # ESLint
   npm run type-check  # TypeScript
   npm run test        # Unit tests
   npm run format      # Auto-format with Prettier
   ```

4. **Commit your changes** using [conventional commits](#commit-message-convention)

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** against `main` branch

## 📝 Coding Standards

### TypeScript

- **Strict mode enabled** - All code must pass TypeScript strict checks
- **No `any` types** - Use proper types or `unknown` with type guards
- **Explicit return types** - Add return types to all functions
- **No unused variables** - Clean up all unused code

### ESLint

- **Zero warnings policy** - ESLint runs with `--max-warnings 0`
- **Fix automatically** when possible: `npm run lint:fix`
- **React Hooks rules** - Must follow exhaustive-deps rule

### Prettier

- **Auto-format before commit**: `npm run format`
- **Line width**: 80 characters
- **Single quotes** for strings
- **Semicolons required**
- **Trailing commas** in ES5 style

### File Organization

```
src/
├── components/     # Reusable UI components
├── pages/          # Page-level components
├── hooks/          # Custom React hooks
├── contexts/       # React contexts
├── lib/            # Utilities and business logic
├── integrations/   # Third-party integrations
└── routes/         # Route definitions
```

### Component Guidelines

1. **Use TypeScript** for all components
2. **Add JSDoc comments** for complex logic
3. **Export types** alongside components
4. **Use named exports** for better refactoring
5. **Keep components small** - Single responsibility principle

### Error Handling

- **Use Error Boundaries** for React components
- **Wrap async operations** in try-catch blocks
- **Log errors** using the logging utility (`src/lib/logger.ts`)
- **Provide user-friendly error messages**

Example:
```typescript
import { logger } from '@/lib/logger';
import { handleError } from '@/lib/errorHandling';

try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { error });
  handleError(error, 'Failed to complete operation');
}
```

## 🧪 Testing Requirements

### Unit Tests

- **Write tests** for new features and bug fixes
- **Maintain coverage** - Aim for 70%+ line coverage
- **Use Vitest** for unit tests
- **Follow AAA pattern** - Arrange, Act, Assert

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { title: 'Test' };
    
    // Act
    render(<MyComponent {...props} />);
    
    // Assert
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### E2E Tests

- **Use Playwright** for E2E tests
- **Test critical user flows** (authentication, booking, etc.)
- **Keep tests stable** - Use proper selectors
- **Run locally** before submitting: `npm run e2e`

### Running Tests

```bash
npm run test              # Run all unit tests
npm run test:watch        # Watch mode
npm run test:ui           # Interactive UI
npm run e2e               # E2E tests
npm run test -- --coverage # With coverage
```

## 🔒 Security Guidelines

### Secrets Management

**NEVER commit secrets to the repository!**

- ✅ Use environment variables (`.env` file)
- ✅ Document required secrets in `.env.example`
- ✅ Use `VITE_` prefix for client-side env vars
- ❌ Never hardcode API keys, tokens, or passwords
- ❌ Never commit `.env` files

### Secret Types

Document these in `.env.example`:

1. **Supabase Configuration** (Required)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`

2. **Analytics** (Optional)
   - `VITE_GA4_MEASUREMENT_ID` - Google Analytics 4
   - `VITE_SENTRY_DSN` - Sentry error monitoring

3. **GitHub Secrets** (CI/CD)
   - `CODECOV_TOKEN` - For code coverage reporting
   - `GITHUB_TOKEN` - Automatically provided by GitHub Actions

### Security Best Practices

1. **Validate all user input** - Use Zod schemas
2. **Sanitize data** before displaying to users
3. **Use parameterized queries** with Supabase
4. **Keep dependencies updated** - Review Dependabot PRs
5. **Follow OWASP guidelines** for web security
6. **Report vulnerabilities** via GitHub Security Advisories

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code passes all linting checks (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] All tests pass (`npm run test`)
- [ ] Code is properly formatted (`npm run format`)
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventions

### PR Template

When opening a PR, use our template and provide:

1. **Description** - What changes were made and why
2. **Type of change** - Feature, fix, refactor, etc.
3. **Testing** - How the changes were tested
4. **Screenshots** - For UI changes
5. **Breaking changes** - If applicable
6. **Related issues** - Link to issue numbers

### Review Process

1. **Automated checks** run on all PRs
2. **Code review** by maintainers (usually within 48 hours)
3. **Address feedback** - Make requested changes
4. **Approval required** - At least one maintainer approval
5. **Merge** - Squash and merge to main

### CI/CD Checks

Your PR must pass:

- ✅ Linting (ESLint + Prettier)
- ✅ Type checking (TypeScript)
- ✅ Unit tests
- ✅ Build verification
- ✅ Security audit
- ✅ Code coverage (informational)

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning and changelog generation.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature (minor version bump)
- `fix` - Bug fix (patch version bump)
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test additions or changes
- `build` - Build system changes
- `ci` - CI/CD changes
- `chore` - Maintenance tasks
- `revert` - Revert previous commit

### Examples

```bash
# New feature
feat(appointments): add appointment cancellation

# Bug fix
fix(auth): resolve login timeout issue

# Breaking change
feat(api)!: change appointment API structure

BREAKING CHANGE: Appointment API now returns ISO dates

# Multiple changes
feat(dashboard): add analytics dashboard
- Implement charts with recharts
- Add date range selector
- Connect to analytics API
```

### Scope

Use these common scopes:

- `auth` - Authentication
- `appointments` - Appointment management
- `clients` - Client management
- `formulas` - Formula tracking
- `dashboard` - Dashboard views
- `api` - API integration
- `ui` - UI components
- `deps` - Dependencies
- `ci` - CI/CD workflows

## 🎯 Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Quality Checks
npm run lint             # Run ESLint (strict)
npm run lint:fix         # Auto-fix lint issues
npm run type-check       # TypeScript check
npm run format           # Format with Prettier
npm run format:check     # Check formatting

# Testing
npm run test             # Run unit tests
npm run test:watch       # Watch mode
npm run test:ui          # Interactive test UI
npm run e2e              # Run E2E tests

# Maintenance
npm run clean            # Clean and reinstall
npm audit                # Check for vulnerabilities
```

### Getting Help

- **Documentation**: See [README.md](./README.md) and [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Issues**: Search [existing issues](https://github.com/the-hairtologist/hA.I.r/issues)
- **Questions**: Open a [discussion](https://github.com/the-hairtologist/hA.I.r/discussions)

## 🙏 Thank You

Your contributions make hA.I.r better! We appreciate your time and effort.

---

**License**: This project is proprietary. By contributing, you agree that your contributions will be licensed under the same license as the project.
