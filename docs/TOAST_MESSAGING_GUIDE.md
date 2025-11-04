# Toast Messaging Guide

Professional, consistent toast notifications for the hA.I.r app.

## Core Principles

1. **Professional but Friendly**: No casual slang or overly informal language
2. **Clear and Concise**: Tell the user exactly what happened
3. **Actionable**: When appropriate, provide guidance on what to do next
4. **Consistent Patterns**: Use standard patterns for common scenarios

## Standard Patterns

### Success Messages

```typescript
// Simple confirmation
toast.success('Profile saved successfully');
toast.success('Client added successfully');
toast.success('Appointment created successfully');

// With context
toast.success('Photo uploaded successfully');
toast.success('Formula duplicated successfully');
toast.success('Password changed successfully');
```

### Error Messages

```typescript
// Simple error (when action is obvious)
toast.error('Failed to save changes');
toast.error('Failed to load data');

// With actionable guidance
toast.error('Failed to save changes', {
  description: 'Check connection and try again'
});

toast.error('Failed to upload photo', {
  description: 'Check connection and try again'
});

// With specific context
toast.error('Failed to load profile', {
  description: 'Check connection and try again'
});
```

### Offline/Connection Errors

```typescript
// Offline state
toast.error('Connection unavailable', {
  description: 'Changes will sync when connection is restored'
});

// For uploads
toast.success('Photo queued for upload', {
  description: 'Will sync when connection is restored'
});
```

### Warning Messages

```typescript
toast.warning('Connection unstable', {
  description: 'Changes will sync when online'
});

toast.warning('Feature not available', {
  description: 'This feature requires a stylist account'
});
```

### Info Messages

```typescript
toast.info('AI analytics feature coming soon');
toast.info('Feature not available for this account');
```

## Anti-Patterns (Avoid These)

❌ **Casual Language**
- "That didn't stick" → ✅ "Failed to save changes"
- "Let's give that another shot" → ✅ "Please try again"
- "Couldn't load your profile" → ✅ "Failed to load profile"
- "Nice! All done" → ✅ "Changes saved successfully"
- "Mind trying again?" → ✅ "Please try again"

❌ **Vague Messages**
- "Something went wrong" → ✅ "Failed to save changes"
- "Error occurred" → ✅ "Failed to load data"

❌ **Overly Technical**
- "Network request failed with status 500" → ✅ "Failed to load data"
- "Unauthorized access" → ✅ "Failed to save changes"

## Validation Errors

For form validation, use specific field-level messages:

```typescript
toast.error('Please fix validation errors');
toast.error('No formulas to export');
toast.error('Invalid file type', {
  description: 'Please select a video file'
});
```

## File Operations

```typescript
// Upload success
toast.success('Photo uploaded successfully');
toast.success('Video sent successfully');

// Upload errors
toast.error('Failed to upload photo', {
  description: 'Check connection and try again'
});

toast.error('File too large', {
  description: 'Video must be less than 50MB'
});

// Delete
toast.success('Photo deleted');
toast.error('Failed to delete photo');
```

## Export Operations

```typescript
toast.success('Formulas exported successfully');
toast.success('Payments exported successfully');
toast.error('Failed to export data');
toast.error('No formulas to export');
```

## Copy to Clipboard

```typescript
toast.success('Code copied to clipboard', {
  icon: '✓',
  duration: 2000,
});
```

## Loading/Progress Messages

For long-running operations, show progress:

```typescript
const loadingToast = toast.loading('Processing...');

// Update on completion
toast.success('Formula analysis completed successfully');
toast.dismiss(loadingToast);
```

## Message Length Guidelines

- **Title**: 3-6 words max
- **Description**: 1-2 short sentences max
- Prefer brevity over verbosity

## Tone Guidelines

✅ **Professional**: "Failed to save changes"
✅ **Direct**: "Password changed successfully"
✅ **Helpful**: "Check connection and try again"

❌ **Casual**: "That didn't work"
❌ **Unclear**: "Something happened"
❌ **Apologetic**: "Sorry, we couldn't save that"

## Icon Usage

- ✓ for success (when using custom success messages)
- Standard error/warning/info icons (automatic)
- No emoji in production toast messages

## Testing Checklist

When adding new toast messages:
- [ ] Message is professional and clear
- [ ] No casual language or slang
- [ ] Provides actionable guidance when needed
- [ ] Description is concise (1-2 sentences max)
- [ ] Follows standard patterns from this guide
- [ ] Tested on mobile (doesn't overflow)
