# Contributing to hA.I.r

Welcome! This guide will help you get started contributing to the hA.I.r project.

## Getting Started

### Prerequisites
- **Node.js:** 18+ (LTS recommended)
- **Package Manager:** npm 9+
- **Git:** For version control
- **Editor:** VS Code recommended (with extensions below)

### Recommended VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Playwright Test for VS Code

### Initial Setup
```bash
# Clone the repository (via Lovable)
# Navigate to project directory
cd hair-ai-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

---

## Development Workflow

### 1. Understanding the Codebase

**Project Structure:**
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Radix UI primitives (shadcn)
│   └── [feature]/      # Feature-specific components
├── pages/              # Route pages
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
├── integrations/       # External service integrations
│   └── supabase/       # Database client (auto-generated)
└── styles/             # Global CSS and Tailwind config

supabase/
├── functions/          # Edge functions (Deno)
└── migrations/         # Database schema changes

E2E/
└── tests/              # Playwright E2E tests

docs/                   # Comprehensive documentation
```

**Key Conventions:**
- **Components:** PascalCase (e.g., `AppointmentCard.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAppointments.ts`)
- **Utils:** camelCase (e.g., `formatDate.ts`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### 2. Making Changes

#### Feature Development Process
1. **Understand the requirement** - Check existing issues or discuss with team
2. **Create a branch** - Use descriptive names (e.g., `feature/ai-formula-export`)
3. **Write tests first** (TDD) - See `docs/TESTING.md`
4. **Implement the feature** - Follow code style guidelines below
5. **Test thoroughly** - Unit, integration, E2E
6. **Update documentation** - README, API docs, etc.
7. **Submit for review** - Create PR with clear description

#### Code Style Guidelines

**TypeScript:**
```typescript
// ✅ GOOD - Explicit types, descriptive names
interface AppointmentFormData {
  clientId: string;
  date: Date;
  duration: number;
}

const createAppointment = async (
  data: AppointmentFormData
): Promise<Appointment> => {
  // Implementation
};

// ❌ BAD - Implicit any, unclear names
const create = async (d) => {
  // Implementation
};
```

**React Components:**
```typescript
// ✅ GOOD - Typed props, early returns, semantic HTML
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
}

export const Button = ({ children, onClick, loading }: ButtonProps) => {
  if (loading) {
    return <button disabled>Loading...</button>;
  }

  return (
    <button onClick={onClick} className="btn-primary">
      {children}
    </button>
  );
};

// ❌ BAD - No types, nested ternaries
export const Button = ({ children, onClick, loading }) => {
  return (
    <button onClick={loading ? undefined : onClick}>
      {loading ? 'Loading...' : children}
    </button>
  );
};
```

**Tailwind CSS:**
```tsx
// ✅ GOOD - Semantic tokens from design system
<div className="bg-background text-foreground border-border">
  <h1 className="text-primary">Title</h1>
</div>

// ❌ BAD - Hardcoded colors
<div className="bg-white text-black border-gray-200">
  <h1 className="text-purple-600">Title</h1>
</div>
```

### 3. Database Changes

**Using Migrations:**
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_description.sql

-- Create table
CREATE TABLE public.new_feature (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.new_feature ENABLE ROW LEVEL SECURITY;

-- Add policy
CREATE POLICY "Users can view own data"
ON public.new_feature FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_new_feature_updated_at
BEFORE UPDATE ON public.new_feature
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

**Important:**
- Always enable RLS on new tables
- Use `SECURITY DEFINER` functions with `SET search_path = public, pg_temp`
- Test policies with different user roles
- Add indexes for frequently queried columns

### 4. Edge Functions

**Creating a New Function:**
```typescript
// supabase/functions/my-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req: Request) => {
  // 1. Verify authentication
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Parse request
  const { data } = await req.json();

  // 3. Validate input
  if (!data.requiredField) {
    return new Response('Missing field', { status: 400 });
  }

  // 4. Database operations
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: result, error } = await supabase
    .from('table')
    .insert(data);

  if (error) {
    console.error('Database error:', error);
    return new Response('Internal error', { status: 500 });
  }

  // 5. Return response
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## Testing Guidelines

### Running Tests Locally
```bash
# Unit tests (fast feedback)
npm run test:watch

# Integration tests
npm test

# E2E tests (requires running dev server)
npm run dev  # Terminal 1
npm run test:e2e  # Terminal 2

# Coverage report
npm run test:coverage
```

### Writing Tests

**Unit Test Example:**
```typescript
// src/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail } from './validation';

describe('validateEmail', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
  });
});
```

**Component Test Example:**
```typescript
// src/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

---

## Design System

### Using Semantic Tokens

**Always use design system tokens:**
```tsx
// ✅ GOOD
<Card className="bg-card text-card-foreground border-border">
  <h2 className="text-primary">Title</h2>
  <p className="text-muted-foreground">Description</p>
</Card>

// ❌ BAD
<Card className="bg-white text-black border-gray-200">
  <h2 className="text-purple-600">Title</h2>
  <p className="text-gray-500">Description</p>
</Card>
```

**Available Tokens (see `src/index.css`):**
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

### Accessibility Requirements

**All interactive elements must:**
- Have visible focus indicators
- Be keyboard accessible (tab navigation)
- Have proper ARIA labels
- Meet WCAG 2.2 AA contrast ratios (4.5:1 text, 3:1 UI)
- Have touch targets ≥44px

**Example:**
```tsx
<button
  onClick={handleClick}
  aria-label="Close dialog"
  className="focus:ring-2 focus:ring-primary focus:outline-none min-h-[44px] min-w-[44px]"
>
  <X className="h-4 w-4" aria-hidden="true" />
</button>
```

---

## Common Pitfalls

### 1. Direct Supabase Client Imports
```typescript
// ❌ BAD - Never modify this file
import { supabase } from '@/integrations/supabase/client';

// ✅ GOOD - Use the pre-configured client
import { supabase } from '@/integrations/supabase/client';
// This file is auto-generated, use as-is
```

### 2. Ignoring TypeScript Errors
```typescript
// ❌ BAD - Silencing errors
const data = result as any;

// ✅ GOOD - Proper typing
interface Result {
  id: string;
  name: string;
}
const data = result as Result;
```

### 3. Missing Error Boundaries
```tsx
// ❌ BAD - Unhandled errors crash app
<MyComponent data={data} />

// ✅ GOOD - Graceful error handling
<ErrorBoundary fallback={<ErrorMessage />}>
  <MyComponent data={data} />
</ErrorBoundary>
```

---

## Resources

### Internal Documentation
- [API Reference](./API.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Architecture](./ARCHITECTURE.md)
- [Testing Guide](./TESTING.md)

### External Resources
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/primitives)
- [TanStack Query](https://tanstack.com/query)
- [Supabase Docs](https://supabase.com/docs)

---

## Getting Help

### Communication Channels
- **Questions:** Open a GitHub Discussion
- **Bugs:** Create an issue with reproducible steps
- **Features:** Submit a feature request with use case

### Code Review Process
1. Self-review your changes (use the PR checklist)
2. Address automated checks (tests, linting)
3. Request review from at least one team member
4. Respond to feedback constructively
5. Merge only after approval

---

## PR Checklist

Before submitting a pull request:

- [ ] Code follows style guidelines (linted with no errors)
- [ ] Tests added/updated (coverage ≥80% for new code)
- [ ] All tests pass locally (`npm test && npm run test:e2e`)
- [ ] Documentation updated (README, API docs, etc.)
- [ ] No console errors or warnings
- [ ] Accessibility tested (keyboard navigation, screen reader)
- [ ] Mobile tested (responsive design on 360px, 768px, 1024px)
- [ ] Database migrations approved (if applicable)
- [ ] Breaking changes documented (if applicable)

---

## License

This project is proprietary. See LICENSE file for details.

---

## Thank You!

Your contributions make hA.I.r better for stylists and clients worldwide. 🎨✨
