# AI Safety Guidelines

**LLM Usage Policies & Safety Controls**

## Implemented Safety Features

### Input Moderation

- PII detection and redaction
- Prompt injection guards
- Content filtering for harmful requests
- Rate limiting: 10 requests/minute per user

### Output Validation

- Fact-checking for hair advice
- Harmful content filters
- Disclaimer appended to all AI responses
- Human override always available

### Transparency

- "AI-powered" label on all features
- Clear limitations disclosed
- Never presents as human professional
- User consent required for AI features

## AI Feature Inventory

### 1. Formula Suggestions

- **Model:** google/gemini-2.5-flash
- **Input:** Hair type, desired result
- **Output:** Product recommendations
- **Safety:** Allergy checking, professional review required

### 2. Stylist Matching

- **Model:** google/gemini-2.5-flash
- **Input:** User preferences, location
- **Output:** Ranked stylist list
- **Safety:** Human-reviewable, no automated decisions

### 3. Hair Consultation Chat

- **Model:** google/gemini-2.5-flash
- **Input:** User questions
- **Output:** General advice
- **Safety:** Medical disclaimers, professional referral prompts

## Prohibited AI Uses

- ❌ Medical diagnosis
- ❌ Automated refunds/cancellations
- ❌ Generating legal contracts
- ❌ Making hiring decisions
- ❌ Processing payments without review

## Monitoring

- Track hallucination rates
- Log all AI interactions
- Monthly quality reviews
- User feedback collection
