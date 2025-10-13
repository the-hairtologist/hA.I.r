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
3. **Recommended Approach**: Method to achieve result
4. **Formula Components**: 
   - Exact measurements (grams/oz)
   - Developer strength and mixing ratio
   - ${stylistContext?.color_line ? `Using ${stylistContext.color_line} products` : 'Product recommendations'}
5. **Allergy Check**: ${clientContext?.allergies ? `⚠️ VERIFY compatibility with known allergies: ${clientContext.allergies}` : 'No known allergies'}
6. **Application Method**: Technique and sectioning
7. **Processing Time**: Timing with checkpoints
8. **Expected Outcome**: Realistic result

STEP-BY-STEP GUIDANCE (when providing techniques):
- Break down complex techniques into clear steps
- Explain the "why" behind each step
- Include timing and visual cues
- Reference past work when relevant
- Adapt to stylist's experience level

TONE: Professional, personalized, and practical. Make the stylist feel you understand their specific situation.

Remember: You have access to their full history. Use it to provide truly personalized, expert guidance.`;

    // Build messages array
    const messages = [
      { role: 'system', content: basePrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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
    console.log('AI response received successfully');
    
    const assistantMessage = addWatermark(data.choices[0].message.content, userId);

    return await compressedJsonResponse({ 
      response: assistantMessage,
      usage: data.usage 
    }, 200);
  } catch (error: any) {
    console.error('Error in hair-assistant-chat function:', error);
    return await compressedErrorResponse(error.message || 'An unexpected error occurred', 500);
  }
});