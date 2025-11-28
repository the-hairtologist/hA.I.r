# Code Citations

## License: unknown

[Source](https://github.com/atlp-rwanda/atlp-devpulse-fn/tree/de56e75655b187aa87f330d44b4169756d409e3f/src/components/validation/Register.tsx)

```ts
import { z } from 'zod';

const passwordSchema = z
  .string()
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  .regex(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^A-Za-z0-9]/, {
    message: 'Password must contain at least one special character',
  });

// Usage example:
// passwordSchema.parse("YourPassword123!");
```

(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
.regex(/[0-9]/, { message: "Password must contain at least one number" })
.regex(/[^A-Za-z0-9]/, { message: "
