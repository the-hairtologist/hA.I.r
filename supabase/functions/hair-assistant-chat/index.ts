import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { compressedJsonResponse, compressedErrorResponse, corsHeaders } from '../_shared/compression.ts';

/**
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 * Proprietary AI Hair Consultation System
 */

// Watermark helper
const addWatermark = (content: string, userId?: string): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${content}\n\n---\n*AI consultation by hA.I.r™ on ${timestamp}${userId ? ' | User: ' + userId.slice(0, 8) : ''} | For professional use only. Not medical advice.*`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, mode, conversationHistory, clientContext, stylistContext } = await req.json();
    
    // Get authorization header to extract user ID
    const authHeader = req.headers.get('authorization');
    let userId: string | undefined;
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.sub;
      } catch (e) {
        console.log('Could not extract user ID from token');
      }
    }
    
    // Input validation
    if (!message || typeof message !== 'string') {
      return await compressedErrorResponse('Invalid message format', 400);
    }

    // Check message length
    if (message.length > 2000) {
      return await compressedErrorResponse('Message too long (max 2000 characters)', 400);
    }

    // Rate limiting check - limit conversation history
    if (conversationHistory && conversationHistory.length > 50) {
      return await compressedErrorResponse('Conversation too long. Please start a new chat.', 400);
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing chat request with context:', { 
      hasClientContext: !!clientContext, 
      hasStylistContext: !!stylistContext 
    });

    // Build enhanced context-aware system prompt
    let contextInfo = '';
    
    if (stylistContext) {
      contextInfo += `\n\n🎨 STYLIST CONTEXT:\n`;
      if (stylistContext.business_name) contextInfo += `- Business: ${stylistContext.business_name}\n`;
      if (stylistContext.color_line) contextInfo += `- Preferred Color Line: ${stylistContext.color_line}\n`;
      if (stylistContext.specialty) contextInfo += `- Specialty: ${stylistContext.specialty}\n`;
      if (stylistContext.years_experience) contextInfo += `- Experience: ${stylistContext.years_experience} years\n`;
    }

    if (clientContext) {
      contextInfo += `\n\n👤 CLIENT CONTEXT (${clientContext.full_name}):\n`;
      if (clientContext.hair_type) contextInfo += `- Hair Type: ${clientContext.hair_type}\n`;
      if (clientContext.hair_goals) contextInfo += `- Hair Goals: ${clientContext.hair_goals}\n`;
      if (clientContext.allergies) contextInfo += `- ⚠️ ALLERGIES: ${clientContext.allergies}\n`;
      if (clientContext.sensitivity_notes) contextInfo += `- Sensitivities: ${clientContext.sensitivity_notes}\n`;
      if (clientContext.notes) contextInfo += `- Notes: ${clientContext.notes}\n`;
      if (clientContext.client_since) contextInfo += `- Client Since: ${clientContext.client_since}\n`;
      
      if (clientContext.recentFormulas?.length > 0) {
        contextInfo += `\n📋 RECENT FORMULAS:\n`;
        clientContext.recentFormulas.forEach((f: any, i: number) => {
          contextInfo += `${i + 1}. ${f.formula_name} (${new Date(f.created_at).toLocaleDateString()})\n`;
          if (f.notes) contextInfo += `   Notes: ${f.notes}\n`;
        });
      }

      if (clientContext.recentAppointments?.length > 0) {
        contextInfo += `\n📅 RECENT APPOINTMENTS:\n`;
        clientContext.recentAppointments.forEach((a: any, i: number) => {
          contextInfo += `${i + 1}. ${a.service_type} - ${new Date(a.appointment_date).toLocaleDateString()}\n`;
          if (a.notes) contextInfo += `   Notes: ${a.notes}\n`;
        });
      }
    }

    // Enhanced system prompt with context
    const basePrompt = `You are an expert AI Hair Professional Assistant with 25+ years of salon experience.

YOUR ROLE: Provide precise, personalized hair advice based on the specific client and stylist context provided.

${contextInfo}

PERSONALIZATION RULES:
${clientContext ? `- ALWAYS reference ${clientContext.full_name} by name in your responses
- Consider their hair history, past formulas, and recent appointments
- If they have allergies or sensitivities, ALWAYS check compatibility and warn if needed
- Reference their hair goals when making recommendations
- Build on their previous work together` : ''}
${stylistContext ? `- Prioritize recommendations using ${stylistContext.color_line || 'their preferred color line'}
- Align with their specialty: ${stylistContext.specialty || 'general hair services'}
- Adapt complexity to their ${stylistContext.years_experience || '10'} years of experience` : ''}

FORMULA FORMAT (when generating formulas):
1. **Client Analysis**: Current hair state and goals
2. **Historical Context**: Reference past formulas if relevant
3. **Safety Check**: ${clientContext?.allergies ? `⚠️ CRITICAL - Client has allergies: ${clientContext.allergies}. VERIFY all products are safe!` : '✓ No known allergies'}
4. **Recommended Formula**: 
   - **Base/Color Application**:
     • Product: ${stylistContext?.color_line || 'Recommended brand'} [exact shade/level]
     • Amount: X oz/g
     • Developer: [volume] at [ratio]
     • Processing: [X minutes, check at Y min]
   
   - **Lightening (if needed)**:
     • Product: [specific lightener]
     • Mix ratio: [exact measurements]
     • Processing: [time with visual cues]
   
   - **Toning (if needed)**:
     • Product: [toner shade]
     • Developer: [volume and ratio]
     • Processing: [timing]

5. **Application Steps**:
   • Section hair [describe how]
   • Apply to [which areas first]
   • Process for [time] checking at [intervals]
   • Rinse and assess

6. **Processing Guidance**:
   • Total estimated time: [X-Y minutes]
   • Check points: [when to check]
   • Visual cues: [what to look for]

7. **Aftercare Recommendations**:
   • Immediate: [post-service care]
   • Weekly: [maintenance routine]
   • Products: [specific recommendations]

8. **Cautions**:
   ${clientContext?.sensitivity_notes ? `• Client notes: ${clientContext.sensitivity_notes}` : ''}
   • Watch for: [potential issues based on hair history]
   • Skip heat if: [conditions]

9. **Expected Outcome**: [Realistic result description]

**CRITICAL SAFETY RULES:**
- ALWAYS perform strand test for new formulas or compromised hair
- If hair integrity is questionable, recommend multiple sessions
- For color corrections, prioritize hair health over speed
- Include disclaimer: "Professional recommendations - verify with strand tests"

COLOR CORRECTION PROTOCOL (if needed):
1. **Diagnosis**: Current state and desired outcome
2. **Strategy**: Gentle vs aggressive vs multi-session approach
3. **Session Breakdown**:
   - Session 1: [formula and expected result]
   - Session 2 (if needed): [next step]
4. **Integrity Assessment**: Check elasticity and porosity between sessions
5. **Recovery Plan**: Protein/moisture treatments between sessions

TECHNIQUE GUIDANCE (when teaching methods):
- Break into clear numbered steps
- Explain WHY (helps understanding)
- Include timing for each phase
- Mention common mistakes to avoid
- Reference their experience level

TONE: Professional, personalized, supportive. You know their history - use it to give truly custom advice.

**Always end formulas with:** "⚠️ These recommendations are guidance for licensed professionals. Perform strand tests and verify all products are compatible with client's known sensitivities."`;


    // Build messages array
    const messages = [
      { role: 'system', content: basePrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    // PHASE 1: Smart Model Selection for Cost Optimization
    const selectOptimalModel = (query: string): string => {
      const lowerQuery = query.toLowerCase();
      
      // Simple queries - use fastest/cheapest model
      if (query.length < 50 || lowerQuery.match(/^(hi|hello|thanks|thank you|yes|no|okay|ok)$/i)) {
        return 'google/gemini-2.5-flash-lite';
      }
      
      // Color correction (complex reasoning) - use pro model
      if (lowerQuery.includes('correction') || lowerQuery.includes('fix') || 
          lowerQuery.includes('problem') || lowerQuery.includes('damaged')) {
        return 'google/gemini-2.5-pro';
      }
      
      // Formula generation (balanced) - use flash
      if (lowerQuery.includes('formula') || lowerQuery.includes('color') || 
          lowerQuery.includes('tone') || lowerQuery.includes('dye')) {
        return 'google/gemini-2.5-flash';
      }
      
      // Default balanced model
      return 'google/gemini-2.5-flash';
    };

    const selectedModel = selectOptimalModel(message);
    const startTime = Date.now();
    
    console.log(`Smart routing: Using ${selectedModel} for query type`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return await compressedErrorResponse('Rate limit exceeded. Please try again in a moment.', 429);
      }
      
      if (response.status === 402) {
        return await compressedErrorResponse('AI usage limit reached. Please add credits to continue.', 402);
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const responseTime = Date.now() - startTime;
    console.log(`AI response received in ${responseTime}ms using ${selectedModel}`);
    
    // Track model performance for optimization
    if (userId) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        await supabase.from('ai_model_performance').insert({
          user_id: userId,
          query_text: message.substring(0, 500),
          query_type: message.toLowerCase().includes('formula') ? 'formula' : 'general',
          model_used: selectedModel,
          response_time_ms: responseTime,
          tokens_used: data.usage?.total_tokens || 0,
        });
      } catch (err) {
        console.log('Could not log performance metrics:', err);
      }
    }
    
    const assistantMessage = addWatermark(data.choices[0].message.content, userId);

    return await compressedJsonResponse({ 
      response: assistantMessage,
      usage: data.usage,
      model_used: selectedModel,
      response_time_ms: responseTime
    }, 200);
  } catch (error: any) {
    console.error('Error in hair-assistant-chat function:', error);
    return await compressedErrorResponse(error.message || 'An unexpected error occurred', 500);
  }
});