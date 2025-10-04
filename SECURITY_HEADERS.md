# Security Headers Configuration

## Overview
Security headers protect against common web vulnerabilities like XSS, clickjacking, and MIME sniffing.

---

## REQUIRED HEADERS (For Production)

### 1. Content Security Policy (CSP)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://checkout.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.stripe.com; frame-src https://checkout.stripe.com https://js.stripe.com;
```

**Protection:** Prevents XSS attacks by controlling resource loading

---

### 2. X-Frame-Options
```
X-Frame-Options: DENY
```

**Protection:** Prevents clickjacking attacks

---

### 3. X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```

**Protection:** Prevents MIME type sniffing

---

### 4. Strict-Transport-Security (HSTS)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Protection:** Forces HTTPS connections

---

### 5. Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```

**Protection:** Controls referrer information leakage

---

### 6. Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Protection:** Restricts browser features

---

## IMPLEMENTATION

### Via vercel.json (Recommended)
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
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

## CURRENT STATUS

✅ **Implemented:**
- HTTPS enforced (Lovable hosting)
- CORS headers on edge functions

⚠️ **Missing:**
- CSP header
- X-Frame-Options
- X-Content-Type-Options
- HSTS header

---

## NEXT STEPS

1. Add headers to vercel.json
2. Test CSP policy doesn't break functionality
3. Verify HSTS in production
4. Run security scan to confirm

---

**Note:** Lovable hosting automatically provides some security headers, but explicit configuration ensures comprehensive protection.
