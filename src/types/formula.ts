/**
 * Formula Type Definitions
 */

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

export interface FormulaWithClient extends Formula {
  client_profiles?: {
    id: string;
    full_name: string | null;
  } | null;
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

export interface FormulaFilters {
  search?: string;
  colorLine?: string;
  clientId?: string;
  sortBy?: 'recent' | 'client' | 'color';
}
