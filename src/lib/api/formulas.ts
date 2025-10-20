/**
 * Formula API Layer
 * Centralized formula data operations
 */

import { supabase } from "@/integrations/supabase/client";
import { trackSelect, trackInsert, trackUpdate, trackDelete } from "@/lib/logging/supabaseTracker";
import { logger } from "@/lib/logging/productionLogger";

export interface Formula {
  id: string;
  stylist_id: string;
  client_id: string;
  formula_text: string;
  color_line?: string | null;
  developer_volume?: string | null;
  processing_time_minutes?: number | null;
  instructions?: string | null;
  application_notes?: string | null;
  what_worked?: string | null;
  what_to_avoid?: string | null;
  hair_photo_url?: string | null;
  created_at: string;
}

export interface CreateFormulaData {
  stylist_id: string;
  client_id: string;
  formula_text: string;
  color_line?: string;
  developer_volume?: string;
  processing_time_minutes?: number;
  instructions?: string;
  application_notes?: string;
  what_worked?: string;
  what_to_avoid?: string;
  hair_photo_url?: string;
}

export interface UpdateFormulaData extends Partial<CreateFormulaData> {
  id: string;
}

/**
 * Fetch formulas for a stylist
 */
export const fetchFormulasByStylist = async (stylistId: string): Promise<Formula[]> => {
  return trackSelect(
    async () => {
      const { data, error } = await supabase
        .from("formulas")
        .select(`
          *,
          client_profiles!client_id (
            id,
            full_name
          )
        `)
        .eq("stylist_id", stylistId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    "formulas",
    "FormulaAPI.fetchByStylist"
  );
};

/**
 * Fetch formulas for a client
 */
export const fetchFormulasByClient = async (clientId: string): Promise<Formula[]> => {
  return trackSelect(
    async () => {
      const { data, error } = await supabase
        .from("formulas")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    "formulas",
    "FormulaAPI.fetchByClient"
  );
};

/**
 * Fetch a single formula
 */
export const fetchFormulaById = async (formulaId: string): Promise<Formula | null> => {
  return trackSelect(
    async () => {
      const { data, error } = await supabase
        .from("formulas")
        .select("*")
        .eq("id", formulaId)
        .single();

      if (error) throw error;
      return data;
    },
    "formulas",
    "FormulaAPI.fetchById"
  );
};

/**
 * Create a new formula
 */
export const createFormula = async (formulaData: CreateFormulaData): Promise<Formula> => {
  return trackInsert(
    async () => {
      const { data, error } = await supabase
        .from("formulas")
        .insert([formulaData])
        .select()
        .single();

      if (error) throw error;
      
      logger.info("Formula created", { 
        context: "FormulaAPI.create",
        formulaId: data.id 
      });
      
      return data;
    },
    "formulas",
    "FormulaAPI.create"
  );
};

/**
 * Update a formula
 */
export const updateFormula = async (updateData: UpdateFormulaData): Promise<Formula> => {
  const { id, ...updates } = updateData;
  
  return trackUpdate(
    async () => {
      const { data, error } = await supabase
        .from("formulas")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      logger.info("Formula updated", { 
        context: "FormulaAPI.update",
        formulaId: id 
      });
      
      return data;
    },
    "formulas",
    "FormulaAPI.update"
  );
};

/**
 * Delete a formula
 */
export const deleteFormula = async (formulaId: string): Promise<void> => {
  return trackDelete(
    async () => {
      const { error } = await supabase
        .from("formulas")
        .delete()
        .eq("id", formulaId);

      if (error) throw error;
      
      logger.info("Formula deleted", { 
        context: "FormulaAPI.delete",
        formulaId 
      });
    },
    "formulas",
    "FormulaAPI.delete"
  );
};

/**
 * Update formula text
 */
export const updateFormulaText = async (
  formulaId: string,
  formulaText: string
): Promise<Formula> => {
  return trackUpdate(
    async () => {
      const { data, error } = await supabase
        .from("formulas")
        .update({ formula_text: formulaText })
        .eq("id", formulaId)
        .select()
        .single();

      if (error) throw error;
      
      logger.info("Formula text updated", { 
        context: "FormulaAPI.updateText",
        formulaId 
      });
      
      return data;
    },
    "formulas",
    "FormulaAPI.updateText"
  );
};

/**
 * Search formulas
 */
export const searchFormulas = async (
  stylistId: string,
  searchTerm: string
): Promise<Formula[]> => {
  return trackSelect(
    async () => {
      const { data, error } = await supabase
        .from("formulas")
        .select("*")
        .eq("stylist_id", stylistId)
        .or(`formula_text.ilike.%${searchTerm}%,instructions.ilike.%${searchTerm}%`);

      if (error) throw error;
      return data || [];
    },
    "formulas",
    "FormulaAPI.search"
  );
};
