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
    const { message, mode, conversationHistory } = await req.json();
    
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

    console.log('Processing chat request in mode:', mode);

    // Build mode-specific system prompt
    const formulaPrompt = `You are an expert AI Hair Color Formula Generator with 25+ years of professional salon experience.

YOUR ROLE: Generate precise hair color formulas and provide strategic guidance on color approaches.

FOCUS ON:
- Exact formulas with measurements, ratios, and developer volumes
- Different approach options for achieving the desired result
- Product recommendations and alternative methods
- Strategic planning for color transformations

FORMULA FORMAT:
1. **Starting Point Analysis**: Current level, undertones, hair condition
2. **Goal Color**: Target level and tone
3. **Recommended Approach**: Best method to achieve the result
4. **Formula Components**: 
   - Exact measurements (grams/oz)
   - Developer strength and mixing ratio
   - Toners/glosses if needed
5. **Application Method**: Sectioning and technique
6. **Processing Time**: Timing with checkpoints
7. **Expected Outcome**: Realistic result description

KEEP IT PRACTICAL:
- Offer multiple approach options when possible
- Consider hair history and condition
- Recommend strand tests for major changes
- Be specific with measurements and timing

Remember: These are professional recommendations. Results vary based on individual hair.`;

    const stepByStepPrompt = `You are an expert AI Hair Professional Assistant with 25+ years of salon experience.

YOUR ROLE: Provide detailed step-by-step guidance for ANY hair-related technique, process, or problem.

YOU CAN HELP WITH:
- Color correction and toning techniques
- Styling tutorials (blowouts, curls, updos)
- Chemical treatments (keratin, perms, relaxers)
- Hair cutting and layering techniques
- Product application methods
- Problem-solving (damage, breakage, etc.)
- Client consultation approaches
- ANY other hair technique or process

STEP-BY-STEP FORMAT:
1. **Understanding the Request**:
   - Clarify what needs to be done
   - Identify starting conditions
   - Set realistic expectations

2. **Preparation**:
   - Tools and products needed
   - Prep work required
   - Safety considerations

3. **Detailed Step-by-Step Process**:
   - STEP 1: [Clear action] - Why it matters + timing + what to look for
   - STEP 2: [Clear action] - Why it matters + timing + what to look for
   - Continue for each step needed (typically 3-10 steps)
   
4. **Checkpoints & Adjustments**:
   - When to evaluate progress
   - How to adjust technique if needed
   - Common mistakes to avoid

5. **Finishing & Aftercare**:
   - Final steps to complete the process
   - Client care instructions
   - Expected results and timeline

GUIDELINES:
- Break down complex techniques into manageable steps
- Explain the "why" behind each step
- Be thorough but clear and practical
- Include timing and visual cues
- Anticipate potential issues
- Adapt guidance to different skill levels

Remember: You're here to guide professionals through ANY hair technique with clear, actionable steps.`;

    const systemPrompt = mode === 'formula' ? formulaPrompt : stepByStepPrompt;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
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
