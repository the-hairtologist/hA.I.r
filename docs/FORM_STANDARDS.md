# Form Implementation Standards

## Quick Start

### 1. Define Your Schema (or use existing)
```typescript
import { z } from 'zod';
import { emailSchema, nameSchema, clientSchema } from '@/lib/validation';

// Use existing schemas from validation.ts or create custom
const myFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  customField: z.string().min(5),
});
```

### 2. Use the Enhanced Hook
```typescript
import { useFormSubmit } from '@/hooks/useFormSubmit';

const { values, errors, touched, handleSubmit, setFieldValue, isSubmitting } = useFormSubmit(
  async (data) => {
    // Your submission logic
    await supabase.from('table').insert(data);
  },
  {
    schema: myFormSchema,
    initialValues: { name: '', email: '', customField: '' },
    successMessage: 'Success!',
    onSuccess: () => console.log('Done!'),
  }
);
```

### 3. Render Fields with StandardFormField
```typescript
import { StandardFormField } from '@/components/forms/StandardFormField';

<form onSubmit={handleSubmit}>
  <StandardFormField
    name="name"
    label="Name"
    value={values.name}
    onChange={(val) => setFieldValue('name', val)}
    error={errors.name}
    touched={touched.name}
    required
  />
  <StandardFormField
    name="email"
    label="Email"
    type="email"
    value={values.email}
    onChange={(val) => setFieldValue('email', val)}
    error={errors.email}
    touched={touched.email}
  />
  <Button type="submit" disabled={isSubmitting}>
    Submit
  </Button>
</form>
```

## Available Validation Schemas

All schemas are in `src/lib/validation.ts`:

### Base Schemas (Reusable)
- `emailSchema` - Optional email validation
- `requiredEmailSchema` - Required email validation
- `phoneSchema` - Optional phone with format validation
- `nameSchema` - Required name (2-100 chars)
- `passwordSchema` - Password (6-100 chars)
- `urlSchema` - Optional URL validation
- `textareaSchema(maxLength)` - Helper function for textareas
- `currencySchema` - Price validation (0-10,000)
- `durationSchema` - Duration in minutes (15-480)

### Domain Schemas (Ready to Use)
- `clientSchema` - For adding clients
- `appointmentSchema` - For appointments
- `serviceSchema` - For services (with deposit validation)
- `reviewSchema` - For reviews
- `invitationSchema` - For invitations
- `profileSchema` - For user profiles
- `authSchema` - For authentication

## Features

### Automatic Validation
```typescript
// Schema is automatically validated on submit
const { handleSubmit } = useFormSubmit(
  async (data) => { /* ... */ },
  { schema: mySchema }  // ✅ Auto-validates before submission
);
```

### Field-Level Errors
```typescript
// Access errors by field name
errors.email      // "Invalid email address"
errors.name       // "Name must be at least 2 characters"
```

### Touched State Tracking
```typescript
// Only show errors for fields user has interacted with
touched.email     // true/false
```

### Double-Submit Prevention
```typescript
// Automatically prevents double submissions (< 1s apart)
// Built into useFormSubmit by default
```

### Character Counters
```typescript
// Automatically shows for textareas with maxLength
<StandardFormField
  type="textarea"
  maxLength={500}
  // Shows: "45/500" at bottom right
/>
```

## Anti-Patterns (DON'T)

❌ **Manual state management**
```typescript
// DON'T
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [errors, setErrors] = useState({});
```

✅ **Use the hook**
```typescript
// DO
const { values, setFieldValue } = useFormSubmit(...);
```

❌ **Manual validation**
```typescript
// DON'T
if (!email.includes('@')) {
  setError('Invalid email');
}
```

✅ **Use schema**
```typescript
// DO
const schema = z.object({
  email: emailSchema
});
```

❌ **Inline schemas**
```typescript
// DON'T - Schema in component
const schema = z.object({
  email: z.string().email(),
});
```

✅ **Centralized schemas**
```typescript
// DO - Schema in validation.ts
import { emailSchema } from '@/lib/validation';
```

## Accessibility Built-In

StandardFormField automatically handles:
- ✅ `aria-invalid` on validation errors
- ✅ `aria-describedby` linking errors to fields
- ✅ `role="alert"` on error messages
- ✅ Required field indicators
- ✅ Proper label associations

## Migration Checklist

When updating an existing form:

- [ ] Remove manual `useState` for each field
- [ ] Replace with `useFormSubmit` hook
- [ ] Add/update schema in `validation.ts`
- [ ] Replace input components with `StandardFormField`
- [ ] Remove manual validation logic
- [ ] Test form submission
- [ ] Test validation errors display
- [ ] Test accessibility (keyboard nav, screen reader)

## Example: Complete Form

```typescript
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { StandardFormField } from '@/components/forms/StandardFormField';
import { clientSchema } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export function AddClientForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    values,
    errors,
    touched,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    isSubmitting,
  } = useFormSubmit(
    async (data) => {
      const { error } = await supabase
        .from('client_profiles')
        .insert(data);
      
      if (error) throw error;
    },
    {
      schema: clientSchema,
      initialValues: {
        full_name: '',
        email: '',
        phone: '',
        notes: '',
        allergies: '',
        medical_info_consent: false,
      },
      successMessage: 'Client added successfully!',
      onSuccess,
    }
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <StandardFormField
        name="full_name"
        label="Full Name"
        value={values.full_name}
        onChange={(val) => setFieldValue('full_name', val)}
        onBlur={() => setFieldTouched('full_name')}
        error={errors.full_name}
        touched={touched.full_name}
        required
      />
      
      <StandardFormField
        name="email"
        label="Email"
        type="email"
        value={values.email}
        onChange={(val) => setFieldValue('email', val)}
        onBlur={() => setFieldTouched('email')}
        error={errors.email}
        touched={touched.email}
      />
      
      <StandardFormField
        name="phone"
        label="Phone"
        type="tel"
        value={values.phone}
        onChange={(val) => setFieldValue('phone', val)}
        onBlur={() => setFieldTouched('phone')}
        error={errors.phone}
        touched={touched.phone}
      />
      
      <StandardFormField
        name="notes"
        label="Notes"
        type="textarea"
        value={values.notes}
        onChange={(val) => setFieldValue('notes', val)}
        error={errors.notes}
        touched={touched.notes}
        maxLength={500}
        rows={3}
      />
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Client'}
      </Button>
    </form>
  );
}
```

## Advanced: Cross-Field Validation

```typescript
const serviceSchema = z.object({
  require_deposit: z.boolean(),
  deposit_amount: z.number().min(0),
}).refine(
  (data) => !data.require_deposit || data.deposit_amount > 0,
  {
    message: 'Deposit amount required when deposit is enabled',
    path: ['deposit_amount'], // Error shows on this field
  }
);
```

## Next Steps

**Phase 1 Complete** ✅
- Enhanced `useFormSubmit` hook
- Created `StandardFormField` component
- Updated validation schemas

**Phase 2 - Form Migration** (Next)
- Migrate high-priority forms
- Update existing implementations
- Remove deprecated hooks

---

**Questions?** Check existing forms using the pattern or create an issue.
