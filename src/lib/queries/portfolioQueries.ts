/**
 * Optimized Portfolio Queries
 * Replaces select("*") with specific field selections
 */

import { supabase } from "@/integrations/supabase/client";

export interface PortfolioPhotoFields {
  id: string;
  stylist_id: string;
  photo_url: string;
  caption?: string;
  created_at: string;
}

/**
 * Get portfolio photos for stylist
 */
export async function getPortfolioPhotos(stylistId: string) {
  const { data, error } = await supabase
    .from("portfolio_photos")
    .select(`
      id,
      stylist_id,
      photo_url,
      caption,
      created_at
    `)
    .eq("stylist_id", stylistId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as PortfolioPhotoFields[];
}

/**
 * Get portfolio photo by ID
 */
export async function getPortfolioPhotoById(photoId: string) {
  const { data, error } = await supabase
    .from("portfolio_photos")
    .select(`
      id,
      stylist_id,
      photo_url,
      caption,
      created_at
    `)
    .eq("id", photoId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get portfolio photo count for stylist
 */
export async function getPortfolioPhotoCount(stylistId: string) {
  const { count, error } = await supabase
    .from("portfolio_photos")
    .select("id", { count: "exact", head: true })
    .eq("stylist_id", stylistId);

  if (error) throw error;
  return count || 0;
}
