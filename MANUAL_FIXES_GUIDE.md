# MANUAL FIXES GUIDE FOR AI HAIR GENIUS CRITICAL ERRORS

## =========================================================

## FIXES ALREADY APPLIED

1. Escape character in validation.ts
2. Starting interface fixes...

## REMAINING MANUAL FIXES NEEDED

### 1. FIX REACT HOOKS VIOLATIONS (CRITICAL)

#### AdminUsers.tsx - Lines 49-52

CURRENT PROBLEM:

```tsx
if (loading) {
  return <LoadingSpinner message="Verifying access..." />;
}

useEffect(() => {
  //  Hook called after conditional return!
  loadUsers();
}, []);
```

FIXED VERSION:

```tsx
// Move useEffect BEFORE conditional returns
useEffect(() => {
  if (!loading && user && isAdmin) {
    loadUsers();
  }
}, [loading, user, isAdmin]);

// Then the conditionals
if (!loading && (!user || !isAdmin)) {
  return <Navigate to="/dashboard" replace />;
}

if (loading) {
  return <LoadingSpinner message="Verifying access..." />;
}
```

#### AuditLogs.tsx - Lines 54-57

CURRENT PROBLEM:

```tsx
if (authLoading) {
  return <LoadingSpinner message="Verifying access..." />;
}

useEffect(() => {
  //  Hook called after conditional return!
  loadLogs();
}, [dateRange]);
```

FIXED VERSION:

```tsx
// Move useEffect BEFORE conditional returns
useEffect(() => {
  if (!authLoading && user && isAdmin) {
    loadLogs();
  }
}, [authLoading, user, isAdmin, dateRange]);

// Then the conditionals
if (!authLoading && (!user || !isAdmin)) {
  return <Navigate to="/dashboard" replace />;
}

if (authLoading) {
  return <LoadingSpinner message="Verifying access..." />;
}
```

### 2. FIX EMPTY INTERFACES

#### command.tsx - Line 24

CHANGE:

```tsx
interface CommandDialogProps extends DialogProps {}
```

TO:

```tsx
interface CommandDialogProps extends DialogProps {
  // Inherits all DialogProps without adding new properties
}
```

#### textarea.tsx - Line 5

CHANGE:

```tsx
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
```

TO:

```tsx
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Inherits all textarea attributes without adding new properties
}
```

### 3. FIX UNSAFE FUNCTION TYPES (analytics.ts)

#### Lines 103, 130, 144, 163

CHANGE:

```tsx
export const trackFunction = (fn: Function, eventName: string) => {
```

TO:

```tsx
export const trackFunction = (fn: (...args: any[]) => any, eventName: string) => {
```

### 4. FIX EMPTY BLOCKS

#### IntegrationTester.tsx - Lines 107, 113, 119

CHANGE:

```tsx
} catch (error) {
  // Empty block
}
```

TO:

```tsx
} catch (error) {
  console.warn('Integration test failed:', error);
}
```

### 5. FIX LEXICAL DECLARATIONS IN CASE BLOCKS

#### IntegrationTester.tsx - Lines 109, 112, 117, 123

WRAP EACH CASE CONTENT IN BRACES:

```tsx
case 'supabase': {
  const result = await testSupabase();
  break;
}
case 'stripe': {
  const result = await testStripe();
  break;
}
```

## APPLY THESE FIXES IN ORDER

1. Fix React hooks violations (CRITICAL)
2. Fix empty interfaces
3. Fix unsafe Function types
4. Fix empty blocks
5. Fix lexical declarations

## EXPECTED RESULTS

- Critical errors: 22 ~8-10
- React hooks violations: RESOLVED
- Empty interface errors: RESOLVED
- Better code quality overall

Apply these fixes manually and then run:
npm run lint

Let me know when you've applied them!
