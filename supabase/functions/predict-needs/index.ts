import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  corsHeaders,
  compressedJsonResponse,
  compressedErrorResponse,
} from '../_shared/compression.ts';
import { authenticateRequest } from '../_shared/auth.ts';
import { handleError, checkRateLimit } from '../_shared/error-handler.ts';

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate and verify stylist/admin role
    const { user, supabase, stylistId } = await authenticateRequest(req, {
      allowStylistOrAdmin: true,
    });

    if (!stylistId) {
      throw new Error('Stylist profile not found');
    }

    // Rate limiting (1 prediction per minute - expensive operation)
    if (!checkRateLimit(user.id, 1, 60000)) {
      return await compressedErrorResponse(
        'Please wait before requesting new predictions.',
        429
      );
    }

    const { data: stylist } = await supabase
      .from('stylist_profiles')
      .select('business_name')
      .eq('id', stylistId)
      .single();

    if (!stylist) {
      throw new Error('Stylist profile not found');
    }

    console.log('Generating predictions for stylist:', stylistId);

    // Get upcoming appointments (next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: appointments } = await supabase
      .from('appointments')
      .select(
        `
        id,
        appointment_date,
        service_type,
        notes,
        client_profiles (
          full_name,
          hair_type,
          hair_goals
        )
      `
      )
      .eq('stylist_id', stylistId)
      .gte('appointment_date', now.toISOString())
      .lte('appointment_date', nextWeek.toISOString())
      .eq('status', 'scheduled')
      .order('appointment_date', { ascending: true });

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({
          insights: [],
          message: 'No upcoming appointments in the next 7 days',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${appointments.length} upcoming appointments`);

    // Analyze patterns
    const serviceTypes: Record<string, number> = {};
    appointments.forEach(apt => {
      serviceTypes[apt.service_type] =
        (serviceTypes[apt.service_type] || 0) + 1;
    });

    const insights = [];

    // Pattern 1: Multiple balayages
    if (serviceTypes['Balayage'] >= 2) {
      insights.push({
        type: 'service_pattern',
        title: `${serviceTypes['Balayage']} Balayage Appointments This Week`,
        description: 'High volume of blonde work scheduled',
        actions: [
          'Pre-generate blonde balayage formulas',
          'Check inventory: lightener, toner, bond builder',
          'Review balayage placement techniques',
        ],
        confidence: 0.95,
        inventory_items: [
          'Bleach/Lightener',
          'T18/T14 Toner',
          'Olaplex/Bond Builder',
          '20-30vol Developer',
        ],
      });
    }

    // Pattern 2: Color corrections
    if (serviceTypes['Color Correction'] >= 1) {
      insights.push({
        type: 'service_pattern',
        title: `${serviceTypes['Color Correction']} Color Correction${serviceTypes['Color Correction'] > 1 ? 's' : ''} Scheduled`,
        description: 'Complex correction work ahead',
        actions: [
          'Review correction formulas and techniques',
          'Ensure extra time allocated',
          'Check strand test supplies',
          'Prepare client expectation scripts',
        ],
        confidence: 0.9,
        inventory_items: [
          'Color Remover',
          'Multiple Developer Volumes',
          'Bond Treatment',
          'Filler Colors',
        ],
      });
    }

    // Pattern 3: Root touch-ups
    const rootTouchups =
      (serviceTypes['Root Touch-up'] || 0) +
      (serviceTypes['Root Retouch'] || 0);
    if (rootTouchups >= 3) {
      insights.push({
        type: 'service_pattern',
        title: `${rootTouchups} Root Touch-ups This Week`,
        description: 'High maintenance client volume',
        actions: [
          'Pre-measure common root formulas',
          'Streamline application setup',
          'Prepare consultation shortcuts',
        ],
        confidence: 0.85,
        inventory_items: [
          'Common Root Shades',
          '20vol Developer',
          'Application Brushes',
        ],
      });
    }

    // Pattern 4: New vs returning clients
    const clientNames = appointments
      .map(a => {
        const profiles = a.client_profiles as any;
        return Array.isArray(profiles)
          ? profiles[0]?.full_name
          : profiles?.full_name;
      })
      .filter((name): name is string => Boolean(name));
    const uniqueClients = new Set(clientNames).size;
    if (uniqueClients !== appointments.length) {
      insights.push({
        type: 'client_pattern',
        title: 'Mix of New and Returning Clients',
        description: `${uniqueClients} unique clients across ${appointments.length} appointments`,
        actions: [
          'Review returning client history before appointments',
          'Prepare new client consultation forms',
          'Check previous formulas for returning clients',
        ],
        confidence: 0.8,
      });
    }

    // Store predictions in database
    for (const insight of insights) {
      await supabase.from('predictive_insights').insert({
        stylist_id: stylistId,
        insight_type: insight.type,
        insight_data: insight,
        confidence_score: insight.confidence,
        expires_at: nextWeek.toISOString(),
      });
    }

    console.log(`Generated ${insights.length} predictions`);

    return await compressedJsonResponse(
      {
        insights,
        period: {
          start: now.toISOString(),
          end: nextWeek.toISOString(),
        },
        appointments_analyzed: appointments.length,
      },
      200
    );
  } catch (error: any) {
    console.error('Prediction error:', error);
    return handleError(error);
  }
});
