# 🚀 Gemini AI Enhancement Roadmap

**Last Updated:** 2025-10-11  
**Status:** ✅ **COMPLETED** - 5 of 6 features implemented (Live Voice API skipped)  
**Total Estimated Value:** High Impact, Low-Medium Cost  
**Implementation Timeline:** Completed in 1 session

---

## 🎉 Implementation Summary

**Completed Features:**
- ✅ **Structured Output (Native JSON)** - All edge functions now use `response_format` for reliable JSON
- ✅ **Video Understanding** - Hair video analysis with detailed texture/condition insights  
- ✅ **Multi-Turn Image Context** - AI Assistant maintains image references across conversations
- ✅ **Text-to-Speech Audio Guides** - Formula instructions converted to downloadable audio
- ✅ **Long Context Portfolio Analysis** - AI analyzes entire portfolio for actionable insights

**Skipped:**
- ⏭️ **Live Voice API** - Existing booking UI is sufficient, would add unnecessary complexity

---

## 📊 Executive Summary

Hair AI currently uses **Google Gemini 2.5 Flash** for basic text generation (formulas, ads, chat). We've now implemented the most valuable Gemini capabilities:

| Feature | Status | Impact | Effort | Cost | Priority |
|---------|--------|--------|--------|------|----------|
| 1. Structured Output | ✅ Complete | High | Low | Free | ⭐⭐⭐ Must-Have |
| 2. Video Understanding | ✅ Complete | High | Medium | Low | ⭐⭐⭐ Must-Have |
| 3. Multi-Turn Image Context | ✅ Complete | Medium | Low | Free | ⭐⭐ Should-Have |
| 4. Text-to-Speech Audio | ✅ Complete | High | Medium | Low | ⭐⭐ Should-Have |
| 5. Live Voice API | ⏭️ Skipped | Very High | High | Medium | ⭐ Nice-to-Have |
| 6. Long Context Analysis | ✅ Complete | Medium | Medium | Low | ⭐ Nice-to-Have |

**Competitive Advantage:** Most hair salon apps don't have ANY of these features. Implementing even 2-3 would be game-changing.

---

## 🎯 Phase 1: Quick Wins (Week 1)

### ✅ 1. Structured Output (Native JSON)

**Current Problem:**
- AI responses come back as strings
- Manual JSON parsing with try/catch fallbacks
- Unreliable, error-prone, requires complex error handling

**Solution:**
Use Gemini's built-in `response_format` parameter to guarantee valid JSON every time.

**Implementation Steps:**

- [ ] **Update `generate-formula` function** (30 min)
  ```typescript
  // Add to request body
  response_format: {
    type: "json_object",
    schema: {
      type: "object",
      properties: {
        formula: { type: "string" },
        instructions: { type: "string" },
        warnings: { type: "array", items: { type: "string" } }
      },
      required: ["formula", "instructions"]
    }
  }
  ```

- [ ] **Update `generate-ad` function** (20 min)
  ```typescript
  response_format: {
    type: "json_object",
    schema: {
      type: "object",
      properties: {
        headline: { type: "string" },
        body: { type: "string" },
        cta: { type: "string" }
      }
    }
  }
  ```

- [ ] **Update `hair-assistant-chat` function** (30 min)
  - Add structured output for product recommendations
  - Remove all try/catch JSON parsing
  - Simplify error handling

- [ ] **Test all functions** (1 hour)
  - Verify JSON validation works
  - Test error cases
  - Remove fallback code

**Cost:** Free (included in Gemini usage)  
**Time:** 2-3 hours  
**Risk:** Low  
**Success Metric:** Zero JSON parsing errors

---

### ✅ 2. Video Understanding

**Current State:**
- Only accepts images for client discovery
- Missing rich context from video consultations

**Opportunity:**
- Analyze hair videos (texture, movement, damage)
- Process before/after video comparisons
- Extract multiple frames for comprehensive analysis

**Implementation Steps:**

- [ ] **Update client discovery form** (1 hour)
  - Add video upload field (max 10MB)
  - Support MP4, MOV, WEBM formats
  - Add progress indicator

- [ ] **Create/update edge function** (2 hours)
  ```typescript
  // In supabase/functions/analyze-hair-video/index.ts
  const videoBase64 = await convertToBase64(videoFile);
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this hair video. Describe texture, movement, condition, damage, and styling recommendations.'
          },
          {
            type: 'video',
            video: videoBase64
          }
        ]
      }],
      response_format: {
        type: "json_object",
        schema: {
          type: "object",
          properties: {
            texture: { type: "string" },
            movement: { type: "string" },
            condition: { type: "string" },
            damage_level: { type: "string", enum: ["minimal", "moderate", "severe"] },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      }
    })
  });
  ```

- [ ] **Update database schema** (15 min)
  - Add `video_url` field to `client_hair_posts`
  - Add `video_analysis` jsonb field

- [ ] **Update UI to display video insights** (1 hour)
  - Show video analysis card on stylist view
  - Display extracted insights
  - Add video player

- [ ] **Test with sample videos** (30 min)

**Cost:** ~$0.002 per 10-second video  
**Time:** 4-5 hours  
**Risk:** Low  
**Success Metric:** 50% of discovery posts include video within 2 weeks

---

### ✅ 3. Multi-Turn Image Context

**Current State:**
- Each chat message is isolated
- Images aren't remembered across conversation

**Opportunity:**
- Client uploads photo, AI analyzes it
- Client asks follow-up questions about SAME photo
- AI remembers all images in conversation history

**Implementation Steps:**

- [ ] **Update chat state management** (1 hour)
  - Modify `useRealtimeChat.ts` to store image references
  - Keep image URLs in conversation history
  - Pass images with each message

- [ ] **Update edge function** (1.5 hours)
  ```typescript
  // Build messages array with persistent images
  const messages = conversationHistory.map(msg => {
    if (msg.imageUrls) {
      return {
        role: msg.role,
        content: [
          { type: 'text', text: msg.content },
          ...msg.imageUrls.map(url => ({
            type: 'image_url',
            image_url: { url }
          }))
        ]
      };
    }
    return { role: msg.role, content: msg.content };
  });
  ```

- [ ] **Add "Attach Another Photo" button** (30 min)
  - Allow clients to add multiple photos during chat
  - Show thumbnail preview in chat

- [ ] **Test multi-image conversations** (30 min)

**Cost:** Free (standard Gemini usage)  
**Time:** 3-4 hours  
**Risk:** Low  
**Success Metric:** 30% of chat conversations include images

---

## 🎯 Phase 2: Game Changers (Week 2-3)

### ✅ 4. Text-to-Speech Audio Guides

**Opportunity:**
- Convert hair care instructions to audio
- Personalized audio guides clients can listen to at home
- Multi-speaker support (male/female voices)

**Use Cases:**
1. **Post-Appointment Care Audio** → "Here's how to maintain your new color at home"
2. **Product Application Guides** → "Let me walk you through applying this treatment"
3. **Styling Tutorial Audio** → "Here's how to recreate this style yourself"

**Implementation Steps:**

- [ ] **Create new edge function** (2 hours)
  ```typescript
  // supabase/functions/generate-audio-guide/index.ts
  import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
  
  serve(async (req) => {
    const { text, voice } = await req.json();
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-preview-tts',
        messages: [{
          role: 'user',
          content: text
        }],
        modalities: ['audio'],
        voice: voice || 'Puck' // Options: Puck, Charon, Kore, Fenrir, Aoede
      })
    });
    
    const audioData = await response.json();
    const audioBase64 = audioData.choices[0].message.audio;
    
    return new Response(JSON.stringify({ audioBase64 }), {
      headers: { 'Content-Type': 'application/json' }
    });
  });
  ```

- [ ] **Add audio player component** (2 hours)
  - Create `AudioGuidePlayer.tsx`
  - Support play/pause/skip
  - Download functionality

- [ ] **Update formulas page** (1 hour)
  - Add "Listen to Care Guide" button
  - Generate audio from formula instructions
  - Store audio URL in database

- [ ] **Update appointments page** (1 hour)
  - Add "Audio Follow-up" button for completed appointments
  - Generate personalized care instructions

- [ ] **Test with multiple voices** (30 min)

**Cost:** ~$0.016 per minute of audio generated  
**Time:** 1 day  
**Risk:** Low  
**Success Metric:** 20% of clients listen to audio guides within 1 month

---

### ✅ 5. Live Voice API for Booking

**Opportunity:**
- Real-time voice conversations
- "Call AI assistant to book appointment"
- Natural back-and-forth dialogue

**Use Cases:**
1. **Voice Appointment Booking** → "I'd like to book a color correction for next Tuesday"
2. **Quick Rescheduling** → "Can you move my appointment to Friday?"
3. **Consultation Questions** → "What services do you recommend for damaged hair?"

**Implementation Steps:**

- [ ] **Create WebSocket edge function** (4 hours)
  ```typescript
  // supabase/functions/voice-booking/index.ts
  import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
  
  serve(async (req) => {
    if (req.headers.get('upgrade') !== 'websocket') {
      return new Response('Expected websocket', { status: 400 });
    }
    
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.onopen = () => {
      // Connect to Gemini Live API
      const geminiWs = new WebSocket(
        'wss://ai.gateway.lovable.dev/v1/realtime?model=google/gemini-2.5-flash-live'
      );
      
      // Set up bidirectional streaming
      socket.onmessage = (e) => geminiWs.send(e.data);
      geminiWs.onmessage = (e) => socket.send(e.data);
    };
    
    return response;
  });
  ```

- [ ] **Create voice booking UI** (3 hours)
  - Add "Book by Voice" button on booking page
  - Microphone permission handling
  - Real-time transcription display
  - Waveform visualization

- [ ] **Implement conversation state** (2 hours)
  - Track booking context (date, time, service)
  - Validate availability
  - Confirm booking details
  - Create appointment record

- [ ] **Add fallback to human** (1 hour)
  - "Would you like to speak with a person?"
  - Seamless handoff to stylist contact

- [ ] **Test conversation flows** (2 hours)
  - Happy path (successful booking)
  - Edge cases (no availability, unclear request)
  - Interruptions and corrections

**Cost:** ~$0.06 per minute of conversation  
**Time:** 2-3 days  
**Risk:** Medium (requires WebSocket infrastructure)  
**Success Metric:** 10% of bookings completed via voice within 2 months

---

## 🎯 Phase 3: Advanced Features (Week 4+)

### ✅ 6. Long Context Portfolio Analysis

**Opportunity:**
- Upload entire stylist portfolio (100+ images)
- AI analyzes trends, color palettes, signature styles
- Generates insights and recommendations

**Use Cases:**
1. **Portfolio Review Report** → "You excel at balayage but rarely showcase vivid colors"
2. **Style Trend Analysis** → "Your most popular work features warm tones and face-framing layers"
3. **Client Matching** → "This client request matches your portfolio style at 92%"

**Implementation Steps:**

- [ ] **Create batch upload function** (2 hours)
  - Allow stylists to upload multiple images at once
  - Process up to 100 images in single request

- [ ] **Create portfolio analysis edge function** (3 hours)
  ```typescript
  // Use Gemini's 2M token context window
  const allImages = await fetchStylistPortfolio(stylistId);
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this stylist's complete portfolio. Identify:
            1. Signature techniques and styles
            2. Most common color palettes
            3. Client demographics
            4. Strengths and gaps
            5. Recommendations for portfolio diversification`
          },
          ...allImages.map(img => ({
            type: 'image_url',
            image_url: { url: img.url }
          }))
        ]
      }],
      response_format: {
        type: "json_object",
        schema: {
          type: "object",
          properties: {
            signature_styles: { type: "array" },
            color_analysis: { type: "object" },
            strengths: { type: "array" },
            gaps: { type: "array" },
            recommendations: { type: "array" }
          }
        }
      }
    })
  });
  ```

- [ ] **Create Portfolio Insights dashboard** (4 hours)
  - Display analysis results
  - Visual charts for color trends
  - Actionable recommendations
  - "Refresh Analysis" button

- [ ] **Add automated monthly reports** (2 hours)
  - Schedule portfolio analysis
  - Email summary to stylist
  - Track improvements over time

**Cost:** ~$0.50 per full portfolio analysis  
**Time:** 1 week  
**Risk:** Low  
**Success Metric:** 50% of stylists use portfolio analysis within 3 months

---

## 📋 Technical Requirements Checklist

### Edge Functions

- [ ] Update `supabase/config.toml` for new functions:
  - [ ] `analyze-hair-video`
  - [ ] `generate-audio-guide`
  - [ ] `voice-booking`
  - [ ] `portfolio-analysis`

- [ ] Increase timeout limits for video/portfolio processing
- [ ] Add WebSocket support for Live API
- [ ] Implement proper error handling for all new endpoints

### Frontend Components

- [ ] `VideoUpload.tsx` - Video upload with preview
- [ ] `VideoInsights.tsx` - Display video analysis
- [ ] `AudioGuidePlayer.tsx` - Audio playback UI
- [ ] `VoiceBooking.tsx` - Voice interface for appointments
- [ ] `PortfolioInsights.tsx` - Portfolio analysis dashboard

### Database Schema

- [ ] Add `video_url` to `client_hair_posts`
- [ ] Add `video_analysis` jsonb field
- [ ] Add `audio_guide_url` to `formulas`
- [ ] Create `portfolio_analyses` table
- [ ] Add indexes for performance

### File Storage

- [ ] Update storage bucket policies for videos
- [ ] Increase file upload limits (10MB → 50MB)
- [ ] Set up audio file storage bucket
- [ ] Configure CDN for audio delivery

### Environment Variables

All required variables already exist:
- ✅ `LOVABLE_API_KEY` - Already configured
- ✅ `VITE_SUPABASE_URL` - Already configured
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY` - Already configured

---

## 💰 Cost Tracking & Monitoring

### Monthly Budget Calculator

| Feature | Usage Estimate | Cost per Use | Monthly Total |
|---------|----------------|--------------|---------------|
| Structured Output | 1,000 calls | Free | $0 |
| Video Analysis | 200 videos (10s each) | $0.002 | $0.40 |
| Multi-Turn Image Chat | 500 conversations | Free | $0 |
| Text-to-Speech | 100 min audio | $0.016/min | $1.60 |
| Live Voice API | 50 calls (5 min avg) | $0.06/min | $15 |
| Portfolio Analysis | 50 portfolios | $0.50 | $25 |
| **TOTAL** | | | **~$42/month** |

### Current Spending

- **Baseline (current usage):** ~$10/month
- **After Phase 1:** ~$11/month (+$1)
- **After Phase 2:** ~$27/month (+$16)
- **After Phase 3:** ~$42/month (+$15)

### Cost Optimization Strategies

- [ ] Cache portfolio analyses (refresh monthly only)
- [ ] Batch video processing to reduce API calls
- [ ] Use shorter audio guides where appropriate
- [ ] Set per-user rate limits on voice booking
- [ ] Monitor usage with Lovable AI dashboard

---

## 🧪 Testing & Rollout Strategy

### Beta Testing Approach

**Week 1-2: Internal Testing**
- [ ] Test all Phase 1 features with test accounts
- [ ] Document any bugs or issues
- [ ] Refine prompts based on quality

**Week 3: Closed Beta (5-10 stylists)**
- [ ] Invite power users to test
- [ ] Collect detailed feedback
- [ ] Monitor usage patterns
- [ ] Iterate on UX

**Week 4: Open Beta (All users)**
- [ ] Announce new features
- [ ] Create tutorial videos
- [ ] Monitor support tickets
- [ ] Track success metrics

### User Feedback Collection

- [ ] Add in-app feedback button for AI features
- [ ] Create survey for beta testers
- [ ] Track feature adoption in analytics
- [ ] Monitor edge function logs for errors

### Success Criteria

Each feature must meet these before full rollout:

| Feature | Success Metric | Target |
|---------|----------------|--------|
| Structured Output | Error rate | <1% |
| Video Analysis | Upload rate | 50% of posts |
| Multi-Turn Images | Adoption | 30% of chats |
| Audio Guides | Listen rate | 20% of clients |
| Voice Booking | Completion rate | 80% success |
| Portfolio Analysis | Usage | 50% of stylists |

### Rollback Plan

For each feature:
- [ ] Keep old code path as fallback
- [ ] Add feature flags to enable/disable
- [ ] Monitor error rates in real-time
- [ ] Prepare rollback documentation

---

## 🎯 Next Steps

1. **This Week:** Implement Phase 1 (Quick Wins)
2. **Next Week:** Begin Phase 2 (Game Changers)
3. **Week 3-4:** Phase 3 if resources allow

### Ready to Start?

Begin with **Feature #1: Structured Output** - it's the easiest win and will make all subsequent features more reliable.

**Estimated Total Time:** 3-4 weeks  
**Estimated Total Cost:** ~$42/month ongoing  
**Expected Impact:** 10-20x improvement in AI capabilities

---

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Lovable AI Gateway Docs](https://docs.lovable.dev/features/ai)
- [Structured Output Guide](https://ai.google.dev/gemini-api/docs/json-mode)
- [Multimodal Capabilities](https://ai.google.dev/gemini-api/docs/vision)

---

**Questions or Need Help?** Reference this document during implementation. Each feature has detailed steps and code examples to guide you.
