# Form Patterns Guide

Standardized form implementation patterns for the hA.I.r app.

## StandardFormField Component

Use the `StandardFormField` component for all form inputs to ensure consistency.

### Basic Usage

```typescript
import { StandardFormField } from '@/components/forms/StandardFormField';

<StandardFormField
  name="email"
  label="Email Address"
  type="email"
  value={email}
  onChange={setEmail}
  error={errors.email}
  touched={touched.email}
  required
  placeholder="your@email.com"
/>
```

## Supported Input Types

- `text` - Single-line text input
- `email` - Email with validation
- `tel` - Phone number
- `number` - Numeric input
- `textarea` - Multi-line text
- `password` - Password with masking

## Field Properties

### Required Props

```typescript
name: string;           // Unique field identifier
label: string;          // Display label
type: string;           // Input type
value: string | number; // Current value
onChange: (value: string | number) => void; // Update handler
```

### Optional Props

```typescript
onBlur?: () => void;        // Blur event handler (for touched state)
error?: string;             // Error message to display
touched?: boolean;          // Whether field has been interacted with
required?: boolean;         // Is field required
placeholder?: string;       // Placeholder text
maxLength?: number;         // Maximum character length
description?: string;       // Helper text below field
disabled?: boolean;         // Disable field
rows?: number;              // Rows for textarea (default: 4)
min?: number;               // Min value for number input
max?: number;               // Max value for number input
step?: number;              // Step for number input
```

## Validation Pattern

### 1. State Management

```typescript
const [email, setEmail] = useState('');
const [errors, setErrors] = useState<Record<string, string>>({});
const [touched, setTouched] = useState<Record<string, boolean>>({});
```

### 2. Field-Level Validation

```typescript
const validateEmail = (value: string) => {
  if (!value) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Invalid email format';
  }
  return '';
};

// On blur
const handleEmailBlur = () => {
  setTouched(prev => ({ ...prev, email: true }));
  const error = validateEmail(email);
  setErrors(prev => ({ ...prev, email: error }));
};
```

### 3. Form-Level Validation

```typescript
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
});

const handleSubmit = async () => {
  try {
    formSchema.parse({ email, name, phone });
    // Submit form
  } catch (error) {
    if (error instanceof z.ZodError) {
      const newErrors: Record<string, string> = {};
      error.errors.forEach(err => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      toast.error('Please fix validation errors');
    }
  }
};
```

## Complete Form Example

```typescript
import { useState } from 'react';
import { StandardFormField } from '@/components/forms/StandardFormField';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { z } from 'zod';

const clientSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  notes: z.string().max(500, 'Notes must be less than 500 characters'),
});

export const ClientForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      notes: true,
    });

    try {
      // Validate
      clientSchema.parse({ fullName, email, phone, notes });

      // Submit
      setSaving(true);
      // ... API call here
      toast.success('Client added successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
        toast.error('Please fix validation errors');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <StandardFormField
        name="fullName"
        label="Full Name"
        type="text"
        value={fullName}
        onChange={setFullName}
        onBlur={() => setTouched(prev => ({ ...prev, fullName: true }))}
        error={errors.fullName}
        touched={touched.fullName}
        required
        placeholder="John Doe"
      />

      <StandardFormField
        name="email"
        label="Email Address"
        type="email"
        value={email}
        onChange={setEmail}
        onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
        error={errors.email}
        touched={touched.email}
        required
        placeholder="john@example.com"
      />

      <StandardFormField
        name="phone"
        label="Phone Number"
        type="tel"
        value={phone}
        onChange={setPhone}
        onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
        error={errors.phone}
        touched={touched.phone}
        required
        placeholder="1234567890"
        description="10 digits, no spaces or dashes"
      />

      <StandardFormField
        name="notes"
        label="Notes"
        type="textarea"
        value={notes}
        onChange={setNotes}
        onBlur={() => setTouched(prev => ({ ...prev, notes: true }))}
        error={errors.notes}
        touched={touched.notes}
        maxLength={500}
        rows={4}
        placeholder="Optional notes about the client"
      />

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={saving}
          className="min-h-[44px]"
        >
          {saving ? 'Saving...' : 'Save Client'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {/* Cancel logic */}}
          className="min-h-[44px]"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
```

## Accessibility Features

StandardFormField automatically includes:

- ✅ Proper label association (`htmlFor` / `id`)
- ✅ ARIA attributes (`aria-invalid`, `aria-describedby`)
- ✅ Error announcements (`role="alert"`)
- ✅ Required field indicators
- ✅ Touch-friendly sizing (min-h-[44px])

## Visual Validation Feedback

- **Neutral**: Default state (no validation yet)
- **Invalid**: Shows red border + AlertCircle icon + error message
- **Valid**: Can optionally show checkmark (not implemented by default)

## Character Counter

For textarea fields with `maxLength`:

```typescript
<StandardFormField
  name="bio"
  label="Bio"
  type="textarea"
  value={bio}
  onChange={setBio}
  maxLength={200}
  rows={4}
/>
// Automatically shows: "150/200" character counter
```

## Best Practices

1. **Always provide `label`**: No placeholder-only fields
2. **Use `description` for helpful hints**: Don't overload the label
3. **Mark required fields**: Use the `required` prop
4. **Show errors only after touch**: Use `touched` state
5. **Validate on blur, not on every keystroke**: Prevents annoying UX
6. **Provide clear error messages**: Explain what's wrong and how to fix
7. **Ensure touch targets**: All fields meet 44px minimum height

## Migration Checklist

When migrating forms to StandardFormField:

- [ ] Replace all `<Label>` + `<Input>` pairs
- [ ] Replace all `<Label>` + `<Textarea>` pairs
- [ ] Add validation schema using Zod
- [ ] Implement touched state tracking
- [ ] Add field-level error messages
- [ ] Test on mobile (320px, 390px, 768px)
- [ ] Verify keyboard navigation works
- [ ] Verify error messages are announced
