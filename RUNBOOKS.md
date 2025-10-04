# Operational Runbooks
**hA.I.r - Incident Response & Procedures**

## P0 - Critical Incidents

### Database Outage
**Symptoms:** All API calls failing, Supabase unreachable
**Response:**
1. Check Supabase status: https://status.supabase.com
2. Verify network connectivity
3. Check RLS policies haven't locked out service role
4. Contact Supabase support: support@supabase.com

### Payment Processing Failure
**Symptoms:** Stripe webhooks failing, payments not processing
**Response:**
1. Check Stripe dashboard for errors
2. Verify webhook secret is correct
3. Test webhook endpoint manually
4. Check edge function logs: `supabase functions logs stripe-webhook`

### Authentication System Down
**Symptoms:** Users unable to sign in
**Response:**
1. Check Supabase Auth status
2. Verify SMTP settings for email auth
3. Check auth rate limits
4. Review auth logs in Supabase dashboard

## P1 - High Priority

### Edge Function Errors (429/402)
**Symptoms:** AI features failing with rate limit errors
**Response:**
1. Check Lovable AI usage dashboard
2. Add rate limiting to reduce requests
3. Top up credits if needed
4. Implement request queuing

### SSL Certificate Issues
**Symptoms:** HTTPS errors on custom domain
**Response:**
1. Verify DNS records point to 185.158.133.1
2. Check Lovable domain settings
3. Wait 24-48h for propagation
4. Contact support if persists

## Monitoring Checklist
- [ ] Daily: Check error rates in logs
- [ ] Weekly: Review performance metrics
- [ ] Monthly: Audit security settings
- [ ] Quarterly: Test backup restoration
