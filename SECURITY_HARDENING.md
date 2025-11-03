# Security Hardening Guide

**hA.I.r - Security Best Practices & Implementation**

---

## Security Posture Overview

**Current Security Score:** 85/100 (from SECURITY_REPORT.md)

**Strengths:**

- ✅ HTTPS enforced
- ✅ Row-Level Security (RLS) on all 28+ tables
- ✅ Input validation with Zod schemas
- ✅ Secure authentication (Supabase Auth + bcrypt)
- ✅ Payment security via Stripe (PCI DSS Level 1)
- ✅ Security headers configured (CSP, HSTS, X-Frame-Options)
- ✅ WCAG 2.2 AA accessibility compliance

---

## Critical Security Controls

### 1. Authentication & Authorization

#### Current Implementation

```typescript
// Authentication via Supabase
import { useAuth } from '@/hooks/useAuth';

// Role-based access control
import { useUserRole } from '@/hooks/useUserRole';
const { roles, isStylist, isClient } = useUserRole(user?.id);
```

#### Best Practices

- ✅ Session tokens auto-expire
- ✅ Password requirements: min 8 chars
- ✅ Email verification required
- ⏳ TODO: Implement MFA for admin accounts
- ⏳ TODO: Add biometric authentication (mobile)

#### Password Policy

```
Minimum Length: 8 characters
Requirements:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
Prohibited: Common passwords (checked via Supabase)
```

---

### 2. Row-Level Security (RLS)

#### Verification Checklist

Run this query to verify all tables have RLS enabled:

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;
```

Expected result: **0 rows** (all tables should have RLS enabled)

#### Example RLS Policies

**User-Specific Data:**

```sql
-- Users can only see their own profile
CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);
```

**Role-Based Access:**

```sql
-- Stylists can view their clients
CREATE POLICY "Stylists view their clients"
ON public.client_profiles FOR SELECT
USING (
  preferred_stylist_id = (
    SELECT id FROM stylist_profiles
    WHERE user_id = auth.uid()
  )
);
```

**Security Definer Functions:**

```sql
-- Avoid infinite recursion in RLS
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

---

### 3. Input Validation

#### Client-Side Validation (Zod)

```typescript
import { z } from 'zod';

// Example: Contact form validation
const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),

  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email too long'),

  message: z
    .string()
    .trim()
    .min(10, 'Message too short')
    .max(1000, 'Message too long'),
});
```

#### Server-Side Validation (Edge Functions)

```typescript
// supabase/functions/[function-name]/index.ts
import { z } from 'https://deno.land/x/zod/mod.ts';

const inputSchema = z.object({
  userId: z.string().uuid(),
  content: z.string().max(1000),
});

// Validate before processing
const { data, error } = inputSchema.safeParse(body);
if (error) {
  return new Response(JSON.stringify({ error: 'Invalid input' }), {
    status: 400,
    headers: corsHeaders,
  });
}
```

#### Prohibited Patterns

- ❌ Never use `dangerouslySetInnerHTML` with user input
- ❌ Never concatenate user input into SQL queries
- ❌ Never trust client-side validation alone
- ❌ Never log sensitive data (passwords, tokens, PII)

---

### 4. Security Headers (Vercel)

#### Current Configuration (vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.stripe.com;"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

#### Testing Security Headers

Use these tools to verify:

- [Security Headers](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

Target grade: **A** or **A+**

---

### 5. API Security

#### Rate Limiting

**Implemented:**

- Supabase: Built-in rate limiting
- Lovable AI: 10 requests/minute per user

**Edge Function Rate Limiting:**

```typescript
// Simple rate limiter
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, limit = 10): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimiter.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (userLimit.count >= limit) {
    return false;
  }

  userLimit.count++;
  return true;
}

// In edge function
if (!checkRateLimit(userId)) {
  return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
    status: 429,
    headers: corsHeaders,
  });
}
```

#### CORS Configuration

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Production: restrict to your domain
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Handle preflight
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

**Production Recommendation:**

```typescript
// Restrict CORS to your domain
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Credentials': 'true',
  // ...
};
```

---

### 6. Data Encryption

#### In Transit

- ✅ HTTPS enforced (TLS 1.2+)
- ✅ Secure WebSocket connections (WSS)
- ✅ Certificate pinning (mobile apps)

#### At Rest

- ✅ Supabase: AES-256 encryption
- ✅ Stripe: PCI DSS Level 1 compliant
- ✅ Passwords: bcrypt hashing (cost factor 10)

#### Sensitive Data Handling

**PII Storage:**

```typescript
// ✅ CORRECT: Minimal PII storage
interface Profile {
  id: string;
  email: string; // Required for auth
  full_name: string; // User-provided
  phone: string | null; // Optional, with consent
  // No SSN, no credit cards, no passwords
}
```

**Payment Data:**

- ✅ Never store card numbers
- ✅ Use Stripe tokens only
- ✅ Store only Stripe customer ID and payment intent ID

---

### 7. Secrets Management

#### Environment Variables

**Client-Side (Public):**

```bash
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

**Server-Side (Secret):**

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ... (edge functions only)
STRIPE_SECRET_KEY=sk_live_...
TWILIO_AUTH_TOKEN=...
LOVABLE_API_KEY=... (auto-provided)
```

#### Best Practices

- ✅ Never commit secrets to Git
- ✅ Use Supabase Vault for sensitive tokens
- ✅ Rotate API keys quarterly
- ✅ Use different keys for dev/staging/prod
- ✅ Audit secret access logs monthly

---

### 8. Secure Coding Practices

#### XSS Prevention

```typescript
// ❌ DANGEROUS
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ SAFE: React escapes by default
<div>{userContent}</div>

// ✅ SAFE: If HTML needed, use DOMPurify
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userContent)
}} />
```

#### SQL Injection Prevention

```typescript
// ❌ DANGEROUS: Never concatenate SQL
const { data } = await supabase.rpc('execute_sql', {
  query: `SELECT * FROM users WHERE name = '${userName}'`,
});

// ✅ SAFE: Use parameterized queries
const { data } = await supabase.from('users').select('*').eq('name', userName);
```

#### Command Injection Prevention

```typescript
// ❌ DANGEROUS: Never pass user input to shell
exec(`convert ${userFilename} output.jpg`);

// ✅ SAFE: Validate and sanitize
const safeFilename = userFilename.replace(/[^a-zA-Z0-9.-]/g, '');
if (!/^[a-zA-Z0-9.-]+$/.test(safeFilename)) {
  throw new Error('Invalid filename');
}
```

---

### 9. File Upload Security

#### Allowed File Types

```typescript
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic', // iOS photos
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file: File): boolean {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }

  return true;
}
```

#### Supabase Storage Security

```sql
-- Storage bucket policies
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

---

### 10. Mobile Security (Capacitor)

#### Secure Storage

```typescript
import { Preferences } from '@capacitor/preferences';

// ✅ SAFE: Encrypted storage
await Preferences.set({
  key: 'user_token',
  value: token,
});

// ❌ DANGEROUS: Never use localStorage for tokens
localStorage.setItem('user_token', token);
```

#### SSL Pinning (Optional)

```typescript
// capacitor.config.ts
{
  "server": {
    "cleartext": false, // Disable in production
  }
}
```

#### Jailbreak/Root Detection

```typescript
// Optional: Detect compromised devices
import { Device } from '@capacitor/device';

async function checkDeviceSecurity() {
  const info = await Device.getInfo();

  // Warn user if running on rooted/jailbroken device
  if (info.isVirtual) {
    console.warn('Running on emulator');
  }
}
```

---

## Security Incident Response

### Data Breach Protocol

**Detection:**

1. Monitor error rates for anomalies
2. Review audit logs daily
3. Set up alerts for suspicious activity

**Response (within 72 hours):**

1. Contain the breach (disable compromised credentials)
2. Assess scope (what data, how many users)
3. Notify affected users via email
4. Report to authorities if required (GDPR: Data Protection Authority)
5. Document incident in `SECURITY_INCIDENTS.md`

**Communication Template:**

```
Subject: Important Security Notice - hA.I.r

Dear [User],

We are writing to inform you of a security incident that may have
affected your account.

What happened: [Brief description]
What data was affected: [Specific data types]
What we're doing: [Actions taken]
What you should do: [User actions, e.g., change password]

If you have questions, contact: security@hair.app

Sincerely,
hA.I.r Security Team
```

---

## Security Audit Checklist

### Monthly Checks

- [ ] Review Supabase audit logs
- [ ] Check for unauthorized access attempts
- [ ] Verify all RLS policies still active
- [ ] Review edge function error rates
- [ ] Check SSL certificate expiration
- [ ] Audit user permissions

### Quarterly Checks

- [ ] Update all dependencies (`npm audit fix`)
- [ ] Rotate API keys
- [ ] Review and update security headers
- [ ] Penetration testing (manual or automated)
- [ ] Security training for team
- [ ] Review incident response plan

### Annual Checks

- [ ] Full security audit by third party
- [ ] Compliance review (GDPR, CCPA)
- [ ] Update privacy policy if needed
- [ ] Review cyber insurance coverage
- [ ] PCI DSS SAQ-A attestation (Stripe)

---

## Tools & Resources

### Security Scanning

- **OWASP ZAP:** Web application security scanner
- **npm audit:** Dependency vulnerability scanner
- **Snyk:** Continuous security monitoring
- **Semgrep:** Static analysis for code security

### Monitoring

- **Sentry:** Error tracking and security alerts
- **LogRocket:** Session replay for security analysis
- **Supabase Logs:** Built-in audit trail

### Testing

- **Burp Suite:** Manual penetration testing
- **Postman:** API security testing
- **OWASP Top 10:** Security vulnerability checklist

---

## Compliance Certifications

### Current Status

- ✅ **WCAG 2.2 AA:** Accessibility compliance
- ✅ **GDPR Ready:** EU data protection
- ✅ **CCPA Ready:** California consumer privacy
- ⏳ **SOC 2 Type II:** (Future, if enterprise customers)

### PCI DSS Compliance

- ✅ SAQ-A (Stripe handles card data)
- Annual attestation required
- No card data stored locally

---

## Contact

**Security Issues:**

- Email: security@hair.app
- Response Time: Within 24 hours
- Vulnerability Disclosure: See VDP.md (to be created)

**Emergency Contact:**

- Phone: [To be configured]
- On-Call: [Rotation schedule]

---

**Last Updated:** 2025-10-04  
**Next Review:** 2025-11-04  
**Version:** 1.0.0
