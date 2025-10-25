# Development Guide

## Getting Started

This project is a React + TypeScript application built with Vite, featuring a comprehensive hair color analysis AI tool.

### Prerequisites

- Node.js 18+ 
- npm or bun
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Ha-i-r/ai-hair-genius.git
cd ai-hair-genius

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Build for production
npm run build
```

### Testing

The project uses Vitest for testing with:
- jsdom environment for DOM testing
- @testing-library/react for component testing
- @testing-library/jest-dom for enhanced assertions

### Accessibility Testing

The A11yTester component is available in development mode to help identify accessibility issues:
- Automatically scans for common a11y problems
- Provides WCAG compliance indicators
- Development-only tool (not included in production builds)

### Environment Variables

See `.env.example` for required environment variables:
- Supabase configuration
- API keys
- Feature flags

### CI/CD

The project uses GitHub Actions for:
- Automated testing
- Type checking
- Linting
- Build verification

CI runs on:
- Pushes to feature branches
- Pull requests to main

### Architecture

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui components
- **State**: React hooks + Context
- **Testing**: Vitest + Testing Library
- **Styling**: Tailwind CSS
- **Mobile**: Capacitor for native mobile apps

### Contributing

1. Create a feature branch
2. Make your changes
3. Add tests if needed
4. Ensure all CI checks pass
5. Create a pull request