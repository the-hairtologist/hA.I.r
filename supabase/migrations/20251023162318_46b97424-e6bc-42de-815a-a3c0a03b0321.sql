-- Fix: Add search_path hardening to get_experiment_results function
-- This prevents search path injection attacks on SECURITY DEFINER functions
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

CREATE OR REPLACE FUNCTION public.get_experiment_results(exp_id uuid)
  RETURNS TABLE(variant_key text, views bigint, conversions bigint, conversion_rate numeric)
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'  -- ADDED: Hardens against search path injection
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    v.variant_key,
    COUNT(DISTINCT e.visitor_id) as views,
    COUNT(DISTINCT CASE WHEN e.converted THEN e.visitor_id END) as conversions,
    ROUND(
      COUNT(DISTINCT CASE WHEN e.converted THEN e.visitor_id END)::numeric / 
      NULLIF(COUNT(DISTINCT e.visitor_id), 0) * 100,
      2
    ) as conversion_rate
  FROM ab_test_variants v
  LEFT JOIN ab_test_events e ON v.id = e.variant_id
  WHERE v.experiment_id = exp_id
  GROUP BY v.variant_key
  ORDER BY v.variant_key;
END;
$function$;