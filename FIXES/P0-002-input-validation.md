# Fix P0-002: Input Validation Insufficient

## Issue

**Priority**: P0 - Critical  
**Audit Finding**: A-002  
**Location**: Auth.tsx, ClientRequests.tsx, Services.tsx

**Problem**: Missing or incomplete validation allows invalid data to be submitted, causing:

- Security vulnerabilities
- Database errors
- Poor user experience
- Invalid phone numbers/emails stored

**User Impact**:

- Users can submit empty forms
- Invalid emails accepted
- Weak passwords allowed
- Budget fields accept negative values
- Phone numbers in wrong format

---

## Current State

### Auth.tsx

✅ **GOOD**: Uses Zod schema validation

```typescript
const validation = authSchema.safeParse({
  email: state.email,
  password: state.password,
  fullName: state.fullName,
});

if (!validation.success) {
  toast.error(validation.error.errors[0].message);
  return;
}
```

**Status**: Already well-implemented

---

### ClientRequests.tsx

❌ **BAD**: No validation before submit

**Current Code**:

```typescript
const handleSubmit = async () => {
  // No validation!
  const { error } = await supabase.from('client_hair_posts').insert({
    title,
    description,
    // ...
  });
};
```

**Problems**:

- No title length check
- Budget can be negative
- No service type validation
- Empty description allowed

---

### Services.tsx

❌ **BAD**: Minimal validation

**Current Code**:

```typescript
// Only HTML5 required attribute, no JS validation
<Input
  type="number"
  required
  min="0"
/>
```

**Problems**:

- Can bypass HTML5 validation
- No maximum price check
- Duration not validated
- Deposit logic not enforced

---

## Solution

### 1. Create Validation Schemas

**New File**: `src/lib/validationSchemas.ts`

```typescript
import { z } from 'zod';

// Client Hair Post Schema
export const clientPostSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),

  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description must be less than 500 characters')
    .trim(),

  serviceType: z.enum(['color', 'cut', 'styling', 'treatment'], {
    errorMap: () => ({ message: 'Please select a valid service type' }),
  }),

  budgetRange: z
    .string()
    .regex(/^\$\d+-\$\d+$/, 'Budget must be in format $50-$200')
    .optional()
    .or(z.literal('')),

  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(100, 'Location too long')
    .optional(),

  preferredDate: z
    .date()
    .min(new Date(), 'Date must be in the future')
    .optional(),

  photoUrls: z
    .array(z.string().url())
    .max(5, 'Maximum 5 photos allowed')
    .optional(),
});

// Service Schema
export const serviceSchema = z.object({
  serviceName: z
    .string()
    .min(3, 'Service name must be at least 3 characters')
    .max(50, 'Service name too long')
    .trim(),

  price: z
    .number()
    .positive('Price must be positive')
    .max(10000, 'Price cannot exceed $10,000')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),

  durationMinutes: z
    .number()
    .int('Duration must be a whole number')
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),

  description: z.string().max(500, 'Description too long').optional(),

  requireDeposit: z.boolean(),

  depositAmount: z
    .number()
    .positive('Deposit must be positive')
    .optional()
    .refine((val, ctx) => {
      const requireDeposit = (ctx as any).requireDeposit;
      if (requireDeposit && !val) {
        return false;
      }
      return true;
    }, 'Deposit amount required when deposit is enabled'),

  depositType: z.enum(['fixed', 'percentage']),
});

// Phone Number Schema
export const phoneSchema = z
  .string()
  .regex(
    /^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
    'Invalid phone number. Use format: (555) 123-4567'
  )
  .or(z.literal(''));

// Email Schema (reusable)
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email too long')
  .toLowerCase()
  .trim();

// Budget Range Helper
export const parseBudgetRange = (
  budget: string
): { min: number; max: number } | null => {
  const match = budget.match(/^\$?(\d+)-\$?(\d+)$/);
  if (!match) return null;

  const min = parseInt(match[1]);
  const max = parseInt(match[2]);

  if (min > max) return null;
  if (min < 0 || max > 10000) return null;

  return { min, max };
};
```

---

### 2. Update ClientRequests.tsx

**Before**:

```typescript
const handleSubmit = async () => {
  const { error } = await supabase
    .from("client_hair_posts")
    .insert({ title, description, ... });
};
```

**After**:

```typescript
import { clientPostSchema } from '@/lib/validationSchemas';

const handleSubmit = async () => {
  // Validate input
  const validation = clientPostSchema.safeParse({
    title,
    description,
    serviceType,
    budgetRange,
    location,
    preferredDate,
    photoUrls,
  });

  if (!validation.success) {
    // Show first error
    toast.error(validation.error.errors[0].message);

    // Optionally show all errors
    const errors = validation.error.errors.map(e => e.message).join(', ');
    console.error('Validation errors:', errors);
    return;
  }

  // Validated data
  const validData = validation.data;

  const { error } = await supabase.from('client_hair_posts').insert({
    client_id: clientProfile.id,
    ...validData,
  });

  if (error) {
    toast.error('Failed to create post: ' + error.message);
    return;
  }

  toast.success('Post created successfully!');
  navigate('/client-discovery');
};
```

---

### 3. Update Services.tsx

**Add Real-Time Validation**:

```typescript
import { serviceSchema } from '@/lib/validationSchemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const ServiceForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      serviceName: '',
      price: 0,
      durationMinutes: 90,
      requireDeposit: false,
      depositAmount: 0,
      depositType: 'fixed',
    },
  });

  const requireDeposit = watch('requireDeposit');

  const onSubmit = async (data: z.infer<typeof serviceSchema>) => {
    // Data is already validated by Zod
    const { error } = await supabase
      .from('stylist_services')
      .insert({
        stylist_id: stylistProfile.id,
        ...data,
      });

    if (error) {
      toast.error('Failed to create service');
      return;
    }

    toast.success('Service created!');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="serviceName">
          Service Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="serviceName"
          {...register('serviceName')}
          aria-invalid={!!errors.serviceName}
          aria-describedby="serviceName-error"
        />
        {errors.serviceName && (
          <p id="serviceName-error" className="text-sm text-destructive mt-1">
            {errors.serviceName.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="price">
          Price <span className="text-destructive">*</span>
        </Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          {...register('price', { valueAsNumber: true })}
          aria-invalid={!!errors.price}
          aria-describedby="price-error"
        />
        {errors.price && (
          <p id="price-error" className="text-sm text-destructive mt-1">
            {errors.price.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="durationMinutes">
          Duration (minutes) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="durationMinutes"
          type="number"
          {...register('durationMinutes', { valueAsNumber: true })}
          aria-invalid={!!errors.durationMinutes}
        />
        {errors.durationMinutes && (
          <p className="text-sm text-destructive mt-1">
            {errors.durationMinutes.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="requireDeposit"
          {...register('requireDeposit')}
        />
        <Label htmlFor="requireDeposit">Require Deposit</Label>
      </div>

      {requireDeposit && (
        <div>
          <Label htmlFor="depositAmount">Deposit Amount</Label>
          <Input
            id="depositAmount"
            type="number"
            step="0.01"
            {...register('depositAmount', { valueAsNumber: true })}
          />
          {errors.depositAmount && (
            <p className="text-sm text-destructive mt-1">
              {errors.depositAmount.message}
            </p>
          )}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Service'}
      </Button>
    </form>
  );
};
```

---

### 4. Add Client-Side Phone Validation

**Update Profile Forms**:

```typescript
import { phoneSchema } from '@/lib/validationSchemas';

const validatePhone = (phone: string) => {
  const result = phoneSchema.safeParse(phone);
  return result.success;
};

<Input
  type="tel"
  value={phone}
  onChange={(e) => {
    setPhone(e.target.value);
    if (e.target.value && !validatePhone(e.target.value)) {
      setPhoneError('Invalid phone format. Use: (555) 123-4567');
    } else {
      setPhoneError('');
    }
  }}
  aria-invalid={!!phoneError}
  aria-describedby="phone-error"
/>
{phoneError && (
  <p id="phone-error" className="text-sm text-destructive">
    {phoneError}
  </p>
)}
```

---

## Implementation Checklist

### Phase 1: Core Schemas (Day 1)

- [ ] Create validationSchemas.ts
- [ ] Add Zod schemas for all forms
- [ ] Add phone number validation
- [ ] Add budget range validation

### Phase 2: Form Updates (Day 2)

- [ ] Update ClientRequests.tsx with validation
- [ ] Update Services.tsx with validation
- [ ] Update Settings.tsx profile forms
- [ ] Update Clients.tsx with validation

### Phase 3: Error Handling (Day 2)

- [ ] Improve error messages
- [ ] Add aria-describedby to error messages
- [ ] Test with screen reader
- [ ] Add field-level validation feedback

---

## Testing

### Manual Testing

```
Test Case 1: Empty Fields
1. Open form
2. Leave required fields empty
3. Click submit
Expected: Error message appears, form not submitted

Test Case 2: Invalid Email
1. Enter "notanemail" in email field
2. Submit form
Expected: "Invalid email address" error

Test Case 3: Weak Password
1. Enter "123" as password
2. Submit
Expected: "Password must be at least 6 characters"

Test Case 4: Negative Price
1. Enter "-50" in price field
2. Submit
Expected: "Price must be positive"

Test Case 5: Invalid Phone
1. Enter "123" in phone field
2. Blur field
Expected: Real-time error: "Invalid phone format"
```

### Automated Tests

```typescript
describe('Validation Schemas', () => {
  describe('clientPostSchema', () => {
    it('should reject short title', () => {
      const result = clientPostSchema.safeParse({
        title: 'ab',
        description: 'Valid description here',
        serviceType: 'color',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          'at least 5 characters'
        );
      }
    });

    it('should accept valid post', () => {
      const result = clientPostSchema.safeParse({
        title: 'Need blonde highlights',
        description:
          'Looking for a stylist who can give me beautiful blonde highlights',
        serviceType: 'color',
        budgetRange: '$100-$300',
      });

      expect(result.success).toBe(true);
    });
  });
});
```

---

## Acceptance Criteria

- ✅ All forms validate before submission
- ✅ Clear, actionable error messages
- ✅ Real-time validation for email, phone, price
- ✅ Errors announced to screen readers
- ✅ Invalid data cannot be submitted
- ✅ Error messages disappear when field corrected

---

## Estimated Time

- Schema creation: 1 day
- Form updates: 2 days
- Testing: 0.5 days
- **Total**: 3.5 days

---

## Related Fixes

- See P0-001-double-submit-prevention.md
- See P1-004-error-messages.md
