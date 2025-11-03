# 🎯 Referral System Testing Guide

## Quick Test (2 minutes)

### Test Flow

1. **Generate Referral Code**
   - Go to `/referrals`
   - Click "Generate My Referral Code"
   - Code format: `STYL1234` (4 letters + 4 digits)
   - Share link: `your-domain.com/referrals?code=STYL1234`

2. **Use Referral Code**
   - Open share link in incognito/different browser
   - Create new account
   - Enter referral code during signup
   - Verify credit applied

3. **Check Tracking**
   - Go back to `/referrals`
   - View "My Referrals" section
   - See newly referred stylist
   - Check reward status

---

## Detailed Testing Checklist

### ✅ Code Generation

- [ ] Referral code is unique
- [ ] Code follows format (4 letters + 4 digits)
- [ ] Share link works
- [ ] QR code generates correctly
- [ ] Copy to clipboard works

### ✅ Code Usage

- [ ] Can enter code during signup
- [ ] Invalid code shows error
- [ ] Valid code shows success
- [ ] Duplicate code prevention works
- [ ] Self-referral blocked

### ✅ Rewards Tracking

- [ ] Referrer sees referred stylist in list
- [ ] Status updates from "pending" → "active"
- [ ] Reward amount calculates correctly
- [ ] Milestone rewards trigger at 5, 10, 25 referrals

### ✅ Milestone Celebrations

- [ ] Confetti triggers on milestones
- [ ] Toast notification shows
- [ ] Discount code generated
- [ ] Code can be copied

---

## Test Data Setup

### Create Test Accounts

**Account 1 (Referrer)**

- Email: `referrer@test.com`
- Role: Stylist
- Action: Generate referral code

**Account 2 (Referee)**

- Email: `referee1@test.com`
- Role: Stylist
- Action: Use referral code from Account 1

**Account 3 (Referee)**

- Email: `referee2@test.com`
- Role: Stylist
- Action: Use same referral code

---

## Expected Results

### After 1 Referral

- Referrer sees 1 pending referral
- Reward: $25 credit (when referee completes first appointment)

### After 5 Referrals

- Confetti celebration 🎉
- Milestone badge unlocked
- Bonus discount code generated
- Total rewards: $125+ base + $50 milestone

### After 10 Referrals

- Bigger confetti celebration 🎊
- "Top Referrer" badge
- Enhanced discount code
- Total rewards: $250+ base + $100 milestone

---

## Database Verification

### Check Referral Records

```sql
-- View all referrals
SELECT * FROM stylist_referrals
ORDER BY created_at DESC;

-- View referral tracking
SELECT * FROM stylist_referral_tracking
ORDER BY referred_at DESC;

-- Check rewards
SELECT
  r.referral_code,
  COUNT(rt.id) as total_referrals,
  SUM(CASE WHEN rt.status = 'active' THEN 1 ELSE 0 END) as active_referrals,
  SUM(rt.reward_earned) as total_rewards
FROM stylist_referrals r
LEFT JOIN stylist_referral_tracking rt ON rt.referrer_id = r.stylist_id
GROUP BY r.referral_code;
```

---

## Edge Cases to Test

### Invalid Scenarios

- [ ] Using own referral code → Shows error
- [ ] Using code twice → Prevented
- [ ] Using expired code → Handled gracefully
- [ ] Non-existent code → Shows helpful error

### Valid Scenarios

- [ ] Multiple people use same code → All tracked
- [ ] Referral code survives account deletion → Code disabled
- [ ] Referred stylist becomes inactive → Status reflects

---

## Monitoring

### Check Referral Performance

1. Go to `/referrals`
2. View **Referral Stats** card:
   - Total referrals made
   - Total rewards earned
   - Active vs pending
   - Conversion rate

### Track Milestones

1. Go to `/referrals`
2. View **Milestones** section:
   - Progress to next milestone
   - Completed milestones
   - Available rewards

---

## Common Issues & Fixes

### Code Not Generating

- **Issue**: Button click does nothing
- **Fix**: Check if stylist profile exists
- **SQL**: `SELECT * FROM stylist_profiles WHERE user_id = 'YOUR_USER_ID'`

### Code Not Validating

- **Issue**: Valid code shows as invalid
- **Fix**: Check `stylist_referrals` table
- **SQL**: `SELECT * FROM stylist_referrals WHERE referral_code = 'CODE'`

### Rewards Not Tracking

- **Issue**: Referral not appearing in list
- **Fix**: Check `stylist_referral_tracking` table
- **SQL**: `SELECT * FROM stylist_referral_tracking WHERE referrer_id = 'STYLIST_ID'`

### Milestones Not Triggering

- **Issue**: No celebration at milestone
- **Fix**: Check milestone logic in `useMilestoneCheck.ts`
- **Test**: Manually insert test referrals to trigger milestone

---

## Production Launch Checklist

Before launching referral program:

- [ ] Test complete flow with 3+ accounts
- [ ] Verify all database records are created
- [ ] Test share links on mobile devices
- [ ] Verify QR codes work
- [ ] Test email/SMS sharing
- [ ] Check analytics tracking
- [ ] Verify reward calculations
- [ ] Test milestone celebrations
- [ ] Review RLS policies for security
- [ ] Test concurrent usage (multiple users)

---

## Success Metrics to Track

### KPIs

1. **Referral Rate**: % of stylists who generate code
2. **Conversion Rate**: % of codes that are used
3. **Activation Rate**: % of referred stylists who complete setup
4. **Retention Rate**: % of referred stylists still active after 90 days

### Goals (from Phase Completion Summary)

- **Target**: 30% stylist referral adoption
- **Track**: Weekly referral velocity
- **Measure**: Revenue from referred stylists

---

## Analytics Events Tracked

The system automatically tracks:

- `referral_code_generated`
- `referral_code_used`
- `referral_milestone_reached`
- `referral_reward_earned`
- `referral_link_shared`

View these in your analytics dashboard or in the `ai_analytics_events` table.

---

## Next Steps

1. **Test Now**: Follow "Quick Test" section above
2. **Monitor**: Check database records
3. **Refine**: Adjust reward amounts if needed
4. **Launch**: Enable for all stylists
5. **Promote**: Share referral benefits in app

---

**Status**: ✅ Fully Implemented  
**Location**: `/referrals` page  
**Time to Test**: 2 minutes

**Ready to drive viral growth! 🚀**
