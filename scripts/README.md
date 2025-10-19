# Scripts Documentation

## Pre-Deployment Audit Script

### Purpose
Automated safety checks before deploying to production. Catches common mistakes and ensures code quality standards are met.

### Usage

```bash
# Run the audit (requires build first)
npm run build
npm run audit:pre-deploy

# Or run both together
npm run build:check
```

### Checks Performed

1. **TypeScript Compilation** (ERROR)
   - Ensures no TypeScript errors in the codebase
   - Must pass for deployment

2. **Bundle Size** (ERROR)
   - Checks that total dist/ size is under 5MB
   - Prevents bloated deployments
   - Threshold: 5MB

3. **Console Logs** (WARNING)
   - Detects console.log in production build
   - Should be stripped by esbuild automatically
   - Non-blocking warning

4. **Environment Variables** (ERROR)
   - Verifies required env vars are set:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Must pass for deployment

5. **Localhost References** (WARNING)
   - Finds hardcoded localhost in source code
   - Non-blocking but should be investigated

### Exit Codes

- `0`: All checks passed (or warnings only)
- `1`: Critical errors found - deployment blocked

### Integration

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run Pre-Deploy Audit
  run: |
    npm run build
    npm run audit:pre-deploy
```

### Extending

Add new checks by creating a function in `pre-deploy-audit.ts`:

```typescript
function checkMyThing(): AuditResult {
  // Your check logic
  return {
    passed: true,
    message: 'Check passed',
    severity: 'info',
  };
}

// Add to checks array
const checks = [
  // ... existing checks
  { name: 'My Check', fn: checkMyThing },
];
```
