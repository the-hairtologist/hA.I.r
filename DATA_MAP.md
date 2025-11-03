# Data Map

**GDPR/CCPA Compliance - Data Inventory**

## Personal Data Categories

### User Accounts

- **Fields:** email, full_name, phone, avatar_url
- **Legal Basis:** Consent, Contract
- **Retention:** Active + 2 years inactive
- **Location:** Supabase (US)

### Appointments

- **Fields:** date, time, service, notes
- **Legal Basis:** Contract
- **Retention:** 7 years (tax compliance)
- **Location:** Supabase (US)

### Payments

- **Fields:** amount, stripe_id, status
- **Legal Basis:** Legal Obligation
- **Retention:** 7 years (required by law)
- **Location:** Stripe + Supabase

### Medical Information

- **Fields:** allergies
- **Legal Basis:** Explicit Consent
- **Retention:** Until consent withdrawn
- **Special Category:** Yes (health data)

### Communications

- **Fields:** messages, SMS logs
- **Legal Basis:** Consent
- **Retention:** 2 years
- **Location:** Supabase + Twilio

## Data Flows

1. User signs up → Profile created → Supabase
2. Book appointment → Payment → Stripe → Confirmation email
3. SMS consent → Phone stored → Twilio sends notifications
4. Data export → Edge function → JSON download
5. Account deletion → Anonymization → 72h confirmation

## Third-Party Processors

- **Supabase:** Database, auth (DPA in place)
- **Stripe:** Payments (PCI DSS Level 1)
- **Twilio:** SMS (TCPA compliant)
- **Lovable AI:** AI features (data not retained)

## User Rights Implementation

- ✅ Access: Settings page
- ✅ Export: Download My Data button
- ✅ Delete: Account deletion workflow
- ✅ Rectify: Edit profile anytime
- ✅ Withdraw consent: Cookie preferences, SMS opt-out
