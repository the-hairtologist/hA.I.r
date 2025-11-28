# AI Cost Optimization Guide - hA.I.r App

## 📊 Current Setup (After Optimization)

### Model Pricing (Lovable AI)

- **Flash-Lite**: ~$0.10 per 1M tokens (cheapest)
- **Flash**: ~$0.30 per 1M tokens (balanced) ⭐ Default
- **Pro**: ~$1.00 per 1M tokens (expensive)

### Edge Functions by Cost Tier

#### 💰 **High-Cost (Pro Model)**

**None** - Successfully migrated all to Flash! 🎉

#### 💚 **Medium-Cost (Flash Model)** - 15 Functions

1. `analyze-hair-photo` - Vision analysis (optimized from Pro)
2. `analyze-portfolio` - Adaptive (Flash for <20 images, Pro for >20)
3. `ai-visual-analysis` - Vision analysis (optimized from Pro)
4. `ai-formula-analyzer` - Formula validation
5. `ai-message-generator` - Client outreach
6. `ai-nudge-optimizer` - Engagement optimization
7. `ai-schedule-predictor` - Scheduling AI
8. `ai-smart-upsell` - Upsell recommendations
9. `analyze-hair-video` - Video analysis
10. `generate-ad` - Ad copy generation
11. `generate-formula` - Formula creation
12. `hair-assistant-chat` - Adaptive chatbot
13. `search-stylists` - Search optimization
14. `smart-scheduling-suggestions` - Smart scheduling

#### ⚡ **Low-Cost (Flash-Lite Model)** - 1 Function

1. `quick-formula` - Fast formula generation

---

## 🎯 Estimated Cost Savings

### Before Optimization

- **Pro usage**: 3 functions × 100 calls/day × 2K tokens = 600K tokens/day
- **Daily cost**: $0.60/day = **$18/month**

### After Optimization

- **Flash usage**: 3 functions × 100 calls/day × 2K tokens = 600K tokens/day
- **Daily cost**: $0.18/day = **$5.40/month**

**💰 Monthly Savings: $12.60 (70% reduction on vision functions)**

---

## 📈 Monitoring AI Costs

### Track Usage in Lovable Dashboard

1. Go to **Settings → Workspace → Usage**
2. Monitor:
   - Total AI credits used
   - Credits remaining
   - Top functions by usage
   - Rate limit hits (429 errors)

### Set Up Alerts

- **Budget Alert**: Email when 80% of credits used
- **Rate Limit Alert**: Monitor 429 errors in function logs

---

## 🔧 Advanced Optimization Strategies

### 1. **Request Batching**

Combine multiple requests into one:

```typescript
// ❌ Bad - 3 separate AI calls
await analyzePhoto1();
await analyzePhoto2();
await analyzePhoto3();

// ✅ Good - 1 AI call with all photos
await analyzeMultiplePhotos([photo1, photo2, photo3]);
```

### 2. **Response Caching**

Cache AI responses for common queries:

```typescript
// Check cache first
const cached = await getCachedAnalysis(photoHash);
if (cached) return cached;

// Call AI only if not cached
const analysis = await analyzePhoto(photo);
await cacheAnalysis(photoHash, analysis, '24h');
```

### 3. **Smart Model Selection**

Already implemented in `ai-assistant` and `hair-assistant-chat`:

```typescript
// Simple queries → Flash-Lite (10x cheaper)
if (query.length < 50) return 'google/gemini-2.5-flash-lite';

// Complex analysis → Flash (balanced)
if (query.includes('analyze')) return 'google/gemini-2.5-flash';

// Vision/reasoning → Pro (only when needed)
if (hasImages && complex) return 'google/gemini-2.5-pro';
```

### 4. **Input Optimization**

- Compress images before sending (max 1024px width)
- Trim unnecessary context from prompts
- Use structured outputs (tool calling) to reduce token usage

---

## 🚨 Error Handling for Rate Limits

### Already Implemented ✅

All functions handle:

- **429 (Rate Limit)**: Retry with exponential backoff
- **402 (Payment Required)**: Alert user to add credits

### User-Facing Messages

```typescript
if (response.status === 429) {
  toast.error('AI is busy, please try again in a moment');
}
if (response.status === 402) {
  toast.error('AI credits exhausted. Please add credits in Settings.');
}
```

---

## 📱 Frontend Optimization

### 1. **Debounce AI Calls**

Don't call AI on every keystroke:

```typescript
const debouncedAnalyze = useMemo(
  () => debounce(analyzePhoto, 1000), // Wait 1s after typing stops
  []
);
```

### 2. **Loading States**

Show loading indicators to prevent duplicate calls:

```typescript
const [isAnalyzing, setIsAnalyzing] = useState(false);

if (isAnalyzing) return <Spinner />;
```

### 3. **Lazy Load AI Features**

Only load AI features when user needs them:

```typescript
const AIAnalyzer = lazy(() => import('./AIAnalyzer'));

{showAnalyzer && <AIAnalyzer />}
```

---

## 🎓 Best Practices Summary

### ✅ DO

- Use Flash-Lite for simple tasks (<50 tokens)
- Use Flash for most vision/analysis tasks
- Use Pro only for complex reasoning or >20 images
- Cache AI responses when possible
- Batch multiple requests together
- Monitor usage in Lovable Dashboard

### ❌ DON'T

- Call AI on every user input (debounce!)
- Send full-resolution images (compress first)
- Use Pro when Flash is sufficient
- Ignore rate limits (handle 429/402 errors)
- Skip caching (waste of money)

---

## 📊 ROI Analysis

### Current AI Budget (Paid Plan)

- **Free tier**: $10/month included
- **Additional credits**: $20/month (estimated)
- **Total budget**: $30/month

### Features Enabled by AI

1. **Hair Analysis** - $15/month value to stylists
2. **Smart Scheduling** - Saves 5hrs/month ($100 value)
3. **Client Insights** - Boosts retention 10% ($200 value)
4. **Formula Generation** - Reduces errors ($50 value)

**Total Value: $365/month**  
**Cost: $30/month**  
**ROI: 12x return** 🚀

---

## 🔮 Future Optimizations

### Phase 3 (When needed)

1. **Implement Redis caching** for AI responses
2. **Add image compression** pipeline (reduce token usage 30%)
3. **Build analytics dashboard** for per-function cost tracking
4. **Create AI usage quotas** per stylist tier

### Monitor These Metrics

- AI calls per user per day
- Average tokens per request
- Cache hit rate (target: 40%+)
- Cost per active user (target: <$0.50)

---

## 📞 Support

**Rate Limit Issues?**

- Check Lovable Dashboard for usage
- Contact support@lovable.dev to increase limits

**Cost Optimization Questions?**

- Review this guide quarterly
- Join Lovable Discord for community tips
- Lovable team can provide custom optimization advice

---

**Last Updated**: Phase 2 Completion  
**Next Review**: After 1,000 AI calls (check analytics)
