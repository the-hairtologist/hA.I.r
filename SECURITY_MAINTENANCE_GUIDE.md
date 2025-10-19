# Database Security Maintenance Guide

**Purpose:** Maintain robust database security through regular auditing and proactive monitoring.  
**Frequency:** Weekly linting, monthly comprehensive audits.

---

## Database Linter Usage

### Running the Linter

The database linter automatically scans your Supabase database for security vulnerabilities, missing RLS policies, and performance issues.

**How to Run:**
1. Open Lovable Cloud Backend
2. Navigate to Database → Linter
3. Click "Run Security Scan"
4. Review findings

**Command Line Alternative:**
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data: results } = await supabase.functions.invoke('db-linter');
console.log('Security findings:', results);
```

---

## Common Findings & Fixes

### 1. Table Without RLS Enabled

**Risk Level:** 🔴 CRITICAL  
**Impact:** Unrestricted data access, potential data breaches

**Finding:**
```
Table "public.user_data" has RLS disabled
```

**Fix:**
```sql
-- Enable RLS on the table
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Add appropriate policies
CREATE POLICY "Users can view own data"
ON public.user_data
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
ON public.user_data
FOR UPDATE
USING (auth.uid() = user_id);
```

**Verification:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_data';
```

---

### 2. Overly Permissive Policy

**Risk Level:** 🟠 HIGH  
**Impact:** Users can access data they shouldn't see

**Finding:**
```
Policy allows unrestricted access: USING (true)
```

**Fix:**
```sql
-- Bad: Allows everyone to see everything
CREATE POLICY "bad_policy" ON appointments FOR SELECT USING (true);

-- Good: Restrict to relevant users
CREATE POLICY "good_policy" ON appointments FOR SELECT 
USING (
  auth.uid() = client_id OR 
  auth.uid() IN (
    SELECT user_id FROM stylist_profiles WHERE id = stylist_id
  )
);
```

**Verification:**
```sql
-- Review all policies on a table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'appointments';
```

---

### 3. Missing Policy for Operation

**Risk Level:** 🟡 MEDIUM  
**Impact:** Specific operations may fail or be unrestricted

**Finding:**
```
Table "appointments" has SELECT policy but no INSERT policy
```

**Fix:**
```sql
-- Add missing INSERT policy
CREATE POLICY "Clients can create own appointments"
ON appointments
FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT user_id FROM client_profiles WHERE id = client_id)
);

-- Add UPDATE policy
CREATE POLICY "Clients can update own appointments"
ON appointments
FOR UPDATE
USING (
  auth.uid() = (SELECT user_id FROM client_profiles WHERE id = client_id)
);

-- Add DELETE policy
CREATE POLICY "Clients can cancel own appointments"
ON appointments
FOR DELETE
USING (
  auth.uid() = (SELECT user_id FROM client_profiles WHERE id = client_id)
  AND status = 'scheduled'
);
```

---

### 4. Foreign Key Without Cascade

**Risk Level:** 🟢 LOW  
**Impact:** Orphaned records, data inconsistency

**Finding:**
```
Foreign key missing ON DELETE CASCADE
```

**Fix:**
```sql
-- Drop existing constraint
ALTER TABLE appointments 
DROP CONSTRAINT appointments_client_id_fkey;

-- Add with cascade
ALTER TABLE appointments
ADD CONSTRAINT appointments_client_id_fkey
FOREIGN KEY (client_id)
REFERENCES client_profiles(id)
ON DELETE CASCADE;
```

---

### 5. Missing Index on Queried Column

**Risk Level:** 🟢 LOW  
**Impact:** Slow query performance

**Finding:**
```
Column "appointments.stylist_id" frequently queried but not indexed
```

**Fix:**
```sql
-- Add index on frequently queried column
CREATE INDEX idx_appointments_stylist_id ON appointments(stylist_id);

-- Composite index for common query patterns
CREATE INDEX idx_appointments_stylist_date 
ON appointments(stylist_id, appointment_date);

-- Partial index for specific conditions
CREATE INDEX idx_active_appointments 
ON appointments(stylist_id) 
WHERE status = 'scheduled';
```

---

### 6. Sensitive Column Exposed

**Risk Level:** 🔴 CRITICAL  
**Impact:** PII data breach, compliance violations

**Finding:**
```
Column "users.password_hash" accessible via RLS policy
```

**Fix:**
```sql
-- Exclude sensitive columns from SELECT
CREATE POLICY "Users can view safe profile data"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- In application code, explicitly select columns
-- Bad:
SELECT * FROM profiles;

-- Good:
SELECT id, email, full_name, avatar_url FROM profiles;

-- For extremely sensitive data, use SECURITY DEFINER functions
CREATE FUNCTION get_user_sensitive_data(user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  RETURN (
    SELECT jsonb_build_object(
      'phone', phone,
      'address', address
    )
    FROM profiles
    WHERE id = user_id
  );
END;
$$;
```

---

### 7. Check Constraint Using Volatile Function

**Risk Level:** 🟡 MEDIUM  
**Impact:** Migration/restoration failures

**Finding:**
```
CHECK constraint uses now() function
```

**Fix:**
```sql
-- Bad: Uses volatile function
ALTER TABLE events 
ADD CONSTRAINT check_future_date 
CHECK (event_date > now());

-- Good: Use trigger instead
CREATE OR REPLACE FUNCTION validate_future_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_date <= now() THEN
    RAISE EXCEPTION 'Event date must be in the future';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_event_date
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION validate_future_date();
```

---

## Security Checklist

### Weekly Review (15 minutes)

- [ ] Run database linter
- [ ] Review new critical findings
- [ ] Fix any high-priority issues
- [ ] Check edge function logs for errors
- [ ] Verify RLS policies on new tables

### Monthly Audit (1 hour)

- [ ] Full security scan with linter
- [ ] Review all RLS policies
- [ ] Audit user roles and permissions
- [ ] Check for unused indexes
- [ ] Review audit logs for suspicious activity
- [ ] Test authentication flows
- [ ] Verify token expiration settings
- [ ] Check for orphaned records
- [ ] Review foreign key constraints
- [ ] Update security documentation

### Quarterly Review (2 hours)

- [ ] Comprehensive security audit
- [ ] Penetration testing
- [ ] Review all edge function permissions
- [ ] Update security policies
- [ ] Train team on new threats
- [ ] Review third-party integrations
- [ ] Update incident response plan

---

## RLS Policy Patterns

### User-Owned Data

```sql
-- Basic user ownership
CREATE POLICY "Users can manage own data"
ON user_data
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Role-Based Access

```sql
-- Admin can see everything
CREATE POLICY "Admins can view all"
ON appointments
FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR
  auth.uid() IN (
    SELECT user_id FROM stylist_profiles WHERE id = stylist_id
    UNION
    SELECT user_id FROM client_profiles WHERE id = client_id
  )
);
```

### Relationship-Based Access

```sql
-- Stylist can see their clients' data
CREATE POLICY "Stylists can view client data"
ON client_profiles
FOR SELECT
USING (
  preferred_stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM appointments
    WHERE client_id = client_profiles.id
    AND stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
    AND appointment_date >= now() - interval '90 days'
  )
);
```

### Time-Based Access

```sql
-- Users can only update recent data
CREATE POLICY "Users can update recent posts"
ON posts
FOR UPDATE
USING (
  auth.uid() = user_id AND
  created_at >= now() - interval '1 hour'
);
```

### Conditional Access

```sql
-- Different access based on status
CREATE POLICY "Conditional appointment access"
ON appointments
FOR UPDATE
USING (
  CASE 
    WHEN status = 'scheduled' THEN 
      auth.uid() IN (
        SELECT user_id FROM client_profiles WHERE id = client_id
      )
    WHEN status = 'in_progress' THEN
      auth.uid() IN (
        SELECT user_id FROM stylist_profiles WHERE id = stylist_id
      )
    ELSE false
  END
);
```

---

## Edge Function Security

### Authentication Patterns

```typescript
// Always verify user authentication
const authHeader = req.headers.get("Authorization");
if (!authHeader) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: corsHeaders,
  });
}

const token = authHeader.replace("Bearer ", "");
const { data: userData, error: userError } = await supabase.auth.getUser(token);

if (userError || !userData.user) {
  return new Response(JSON.stringify({ error: "Invalid token" }), {
    status: 401,
    headers: corsHeaders,
  });
}
```

### Input Validation

```typescript
// Validate all user inputs
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(18).max(120),
});

try {
  const validData = schema.parse(requestBody);
} catch (error) {
  return new Response(JSON.stringify({ error: "Invalid input" }), {
    status: 400,
    headers: corsHeaders,
  });
}
```

### Rate Limiting

```typescript
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, limit: number): boolean {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}
```

---

## Monitoring & Alerts

### Critical Issues (Immediate Action)

- **Table without RLS** → Alert admin immediately
- **Exposed sensitive column** → Block access, alert security team
- **Unauthorized access attempt** → Log, alert, potentially block IP

### High Priority (Within 24 hours)

- **Overly permissive policy** → Review and tighten
- **Missing policy** → Add appropriate policy
- **Foreign key without cascade** → Update constraint

### Medium Priority (Within 1 week)

- **Missing index** → Add index
- **Unused index** → Remove index
- **Suboptimal query** → Optimize query

### Low Priority (Next sprint)

- **Code smell** → Refactor
- **Documentation update** → Update docs
- **Test coverage** → Add tests

---

## Incident Response

### Data Breach Response Plan

**1. Immediate Actions (0-1 hour):**
- [ ] Identify affected tables
- [ ] Disable compromised policies
- [ ] Block suspicious IP addresses
- [ ] Revoke compromised tokens
- [ ] Alert security team

**2. Investigation (1-4 hours):**
- [ ] Review audit logs
- [ ] Identify breach source
- [ ] Determine data exposure
- [ ] Document timeline
- [ ] Preserve evidence

**3. Containment (4-24 hours):**
- [ ] Fix security vulnerability
- [ ] Update RLS policies
- [ ] Force password reset if needed
- [ ] Update edge function logic
- [ ] Deploy security patches

**4. Recovery (1-7 days):**
- [ ] Notify affected users
- [ ] Provide remediation steps
- [ ] Monitor for continued attacks
- [ ] Update security documentation
- [ ] Conduct post-mortem

**5. Prevention (Ongoing):**
- [ ] Implement additional monitoring
- [ ] Update security policies
- [ ] Train team on new threats
- [ ] Schedule penetration testing
- [ ] Review third-party integrations

---

## Best Practices

### DO ✅

- Enable RLS on all tables with user data
- Use SECURITY DEFINER functions for privileged operations
- Validate all user inputs
- Use parameterized queries
- Log security events
- Rotate secrets regularly
- Use least privilege principle
- Test policies with multiple user types
- Document security decisions
- Keep dependencies updated

### DON'T ❌

- Use `USING (true)` in production policies
- Store passwords in plain text
- Expose sensitive columns via RLS
- Trust client-side validation alone
- Use `SELECT *` for sensitive tables
- Share database credentials
- Ignore linter warnings
- Deploy without testing policies
- Use CHECK constraints with volatile functions
- Modify reserved schemas (auth, storage, vault)

---

## Resources

**Official Documentation:**
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL Security: https://www.postgresql.org/docs/current/auth-pg-hba-conf.html
- OWASP Top 10: https://owasp.org/www-project-top-ten/

**Tools:**
- Database Linter (built-in)
- Audit logs (Lovable Cloud Backend)
- Edge function logs (Lovable Cloud Backend)
- Security scan (Lovable Cloud Backend)

**Support:**
- Lovable Cloud: Open backend dashboard
- Security team: security@yourcompany.com
- Emergency: Use incident response plan

---

## Conclusion

Regular database security maintenance is essential for protecting user data and maintaining trust. Follow this guide weekly, monthly, and quarterly to ensure your database remains secure.

**Remember:**
- Security is everyone's responsibility
- Test all policy changes thoroughly
- Document all security decisions
- Stay informed about new threats
- When in doubt, be more restrictive

**Next Steps:**
1. Run your first linter scan today
2. Fix all critical issues immediately
3. Schedule recurring security reviews
4. Train your team on security best practices
5. Set up monitoring alerts

For questions or security concerns, consult your security team or Lovable Cloud support.
