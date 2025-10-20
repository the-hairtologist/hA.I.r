/**
 * A/B Testing System with Supabase Backend
 * Production-grade conversion optimization tracking
 */

import { supabase } from "@/integrations/supabase/client";

export type Variant = 'A' | 'B';

interface VariantConfig {
  hero: {
    headline: string;
    subheadline: string;
  };
  cta: {
    primary: string;
    secondary: string;
  };
}

// Variant A: Pain-focused (STOP THE PROBLEM)
const VARIANT_A: VariantConfig = {
  hero: {
    headline: "STOP LOSING CLIENTS TO MISSED TEXTS",
    subheadline: "Automated reminders, instant booking, zero chaos—stylists save 10+ hours/week",
  },
  cta: {
    primary: "START FREE TRIAL",
    secondary: "✓ No Credit Card Required • ✓ 14-Day Free Trial • ✓ Cancel Anytime",
  },
};

// Variant B: Aspiration-focused (BUILD THE DREAM)
const VARIANT_B: VariantConfig = {
  hero: {
    headline: "BUILD YOUR DREAM SALON IN 10 MINUTES",
    subheadline: "5,000+ stylists ditched spreadsheets and phone tag. Join them today.",
  },
  cta: {
    primary: "TRY IT FREE NOW",
    secondary: "✓ Setup in 10 Minutes • ✓ No Credit Card • ✓ 14-Day Free Trial",
  },
};

export const VARIANTS = { A: VARIANT_A, B: VARIANT_B };

const EXPERIMENT_ID_KEY = 'hair_experiment_id';
const VISITOR_ID_KEY = 'hair_visitor_id';
const ASSIGNED_VARIANT_KEY = 'hair_assigned_variant';

/**
 * Get or create visitor ID
 */
function getVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

/**
 * Get active experiment ID
 */
async function getActiveExperiment(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('ab_experiments' as any)
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.warn('[A/B Test] No active experiment found');
      return null;
    }

    localStorage.setItem(EXPERIMENT_ID_KEY, (data as any).id);
    return (data as any).id;
  } catch (error) {
    console.error('[A/B Test] Error fetching experiment:', error);
    return null;
  }
}

/**
 * Get or assign user to a variant
 */
export async function getVariant(): Promise<Variant> {
  // Check if already assigned
  const cached = localStorage.getItem(ASSIGNED_VARIANT_KEY);
  if (cached === 'A' || cached === 'B') {
    return cached as Variant;
  }

  const visitorId = getVisitorId();
  const experimentId = await getActiveExperiment();
  
  if (!experimentId) {
    // Fallback to variant A if no active experiment
    return 'A';
  }

  try {
    // Check if already assigned in database
    const { data: existing, error: assignError } = await supabase
      .from('ab_assignments' as any)
      .select('variant_id')
      .eq('experiment_id', experimentId)
      .eq('visitor_id', visitorId)
      .single();

    if (!assignError && existing) {
      // Get the variant details
      const { data: variantData } = await supabase
        .from('ab_variants' as any)
        .select('variant_key')
        .eq('id', (existing as any).variant_id)
        .single();

      if (variantData) {
        const variantKey = (variantData as any).variant_key as Variant;
        localStorage.setItem(ASSIGNED_VARIANT_KEY, variantKey);
        await trackView(variantKey);
        return variantKey;
      }
    }

    // Get variants for this experiment
    const { data: variants } = await supabase
      .from('ab_variants' as any)
      .select('id, variant_key')
      .eq('experiment_id', experimentId);

    if (!variants || variants.length === 0) {
      return 'A'; // Fallback
    }

    // Randomly assign variant (50/50 split)
    const assignedVariant = (variants as any)[Math.floor(Math.random() * variants.length)];
    const variantKey = (assignedVariant as any).variant_key as Variant;

    // Store assignment
    await supabase
      .from('ab_assignments' as any)
      .insert({
        experiment_id: experimentId,
        variant_id: (assignedVariant as any).id,
        visitor_id: visitorId,
      } as any);

    localStorage.setItem(ASSIGNED_VARIANT_KEY, variantKey);
    
    // Track initial view
    await trackView(variantKey);

    return variantKey;
  } catch (error) {
    console.error('[A/B Test] Error assigning variant:', error);
    return 'A'; // Fallback
  }
}

/**
 * Get variant configuration
 */
export function getVariantConfig(variant: Variant): VariantConfig {
  return VARIANTS[variant];
}

/**
 * Track a page view
 */
async function trackView(variant: Variant) {
  const experimentId = localStorage.getItem(EXPERIMENT_ID_KEY);
  if (!experimentId) return;

  const visitorId = getVisitorId();

  try {
    // Get variant ID
    const { data: variantData } = await supabase
      .from('ab_variants' as any)
      .select('id')
      .eq('experiment_id', experimentId)
      .eq('variant_key', variant)
      .single();

    if (!variantData) return;

    // Track view event (only if not already tracked today)
    const today = new Date().toISOString().split('T')[0];
    const viewKey = `view_tracked_${variant}_${today}`;
    
    if (!sessionStorage.getItem(viewKey)) {
      await supabase
        .from('ab_events' as any)
        .insert({
          experiment_id: experimentId,
          variant_id: (variantData as any).id,
          visitor_id: visitorId,
          event_type: 'view',
          event_data: { page: '/', timestamp: new Date().toISOString() },
        } as any);
      
      sessionStorage.setItem(viewKey, 'true');
    }
  } catch (error) {
    console.error('[A/B Test] Error tracking view:', error);
  }
}

/**
 * Track a conversion (signup)
 */
export async function trackConversion() {
  const experimentId = localStorage.getItem(EXPERIMENT_ID_KEY);
  const variant = localStorage.getItem(ASSIGNED_VARIANT_KEY);
  const visitorId = getVisitorId();

  if (!experimentId || !variant) {
    console.warn('[A/B Test] Cannot track conversion - missing data');
    return;
  }

  try {
    // Get variant ID
    const { data: variantData } = await supabase
      .from('ab_variants' as any)
      .select('id')
      .eq('experiment_id', experimentId)
      .eq('variant_key', variant)
      .single();

    if (!variantData) return;

    // Track conversion event
    await supabase
      .from('ab_events' as any)
      .insert({
        experiment_id: experimentId,
        variant_id: (variantData as any).id,
        visitor_id: visitorId,
        event_type: 'conversion',
        event_data: { timestamp: new Date().toISOString() },
      } as any);

    console.log(`[A/B Test] ✅ Conversion tracked for Variant ${variant}`);
  } catch (error) {
    console.error('[A/B Test] Error tracking conversion:', error);
  }
}

/**
 * Get experiment results (admin only)
 */
export async function getExperimentResults(experimentId: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_experiment_results' as any, { exp_id: experimentId } as any);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[A/B Test] Error fetching results:', error);
    return [];
  }
}

/**
 * Initialize a new experiment (admin only)
 */
export async function initializeExperiment(name: string, description: string) {
  try {
    // Create experiment
    const { data: experiment, error: expError } = await supabase
      .from('ab_experiments' as any)
      .insert({
        name,
        description,
        is_active: true,
      } as any)
      .select()
      .single();

    if (expError) throw expError;

    // Create variants
    const variants = [
      { experiment_id: (experiment as any).id, variant_key: 'A', config: VARIANT_A },
      { experiment_id: (experiment as any).id, variant_key: 'B', config: VARIANT_B },
    ];

    const { error: varError } = await supabase
      .from('ab_variants' as any)
      .insert(variants as any);

    if (varError) throw varError;

    console.log('[A/B Test] ✅ Experiment initialized:', (experiment as any).id);
    return (experiment as any).id;
  } catch (error) {
    console.error('[A/B Test] Error initializing experiment:', error);
    return null;
  }
}
