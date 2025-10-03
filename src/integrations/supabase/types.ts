export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          client_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          service_id: string | null
          service_type: string
          status: string | null
          stylist_id: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          client_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          service_id?: string | null
          service_type: string
          status?: string | null
          stylist_id: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          client_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          service_id?: string | null
          service_type?: string
          status?: string | null
          stylist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "stylist_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          allergies: string | null
          created_at: string
          email: string | null
          full_name: string | null
          hair_type: string | null
          id: string
          notes: string | null
          phone: string | null
          preferred_stylist_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          allergies?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          hair_type?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          preferred_stylist_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          allergies?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          hair_type?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          preferred_stylist_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_preferred_stylist_id_fkey"
            columns: ["preferred_stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          brand_id: string | null
          commission_amount: number
          created_at: string
          id: string
          product_name: string
          product_url: string | null
          purchase_date: string | null
          referral_code_used: string | null
          status: string | null
          stylist_id: string
        }
        Insert: {
          brand_id?: string | null
          commission_amount: number
          created_at?: string
          id?: string
          product_name: string
          product_url?: string | null
          purchase_date?: string | null
          referral_code_used?: string | null
          status?: string | null
          stylist_id: string
        }
        Update: {
          brand_id?: string | null
          commission_amount?: number
          created_at?: string
          id?: string
          product_name?: string
          product_url?: string | null
          purchase_date?: string | null
          referral_code_used?: string | null
          status?: string | null
          stylist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "hair_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      formulas: {
        Row: {
          client_id: string
          color_line: string | null
          created_at: string
          formula_text: string
          hair_photo_url: string | null
          id: string
          instructions: string | null
          result_notes: string | null
          stylist_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          color_line?: string | null
          created_at?: string
          formula_text: string
          hair_photo_url?: string | null
          id?: string
          instructions?: string | null
          result_notes?: string | null
          stylist_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          color_line?: string | null
          created_at?: string
          formula_text?: string
          hair_photo_url?: string | null
          id?: string
          instructions?: string | null
          result_notes?: string | null
          stylist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formulas_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formulas_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hair_brands: {
        Row: {
          affiliate_program_url: string | null
          base_commission_rate: number
          created_at: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
        }
        Insert: {
          affiliate_program_url?: string | null
          base_commission_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
        }
        Update: {
          affiliate_program_url?: string | null
          base_commission_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      knowledge_resources: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_free: boolean | null
          resource_url: string | null
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_free?: boolean | null
          resource_url?: string | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_free?: boolean | null
          resource_url?: string | null
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message_text: string | null
          recipient_id: string
          sender_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_text?: string | null
          recipient_id: string
          sender_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_text?: string | null
          recipient_id?: string
          sender_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          client_id: string
          created_at: string
          id: string
          payment_method: string | null
          status: string | null
          stylist_id: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          client_id: string
          created_at?: string
          id?: string
          payment_method?: string | null
          status?: string | null
          stylist_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
          payment_method?: string | null
          status?: string | null
          stylist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_photos: {
        Row: {
          before_photo_url: string | null
          caption: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_before_after: boolean | null
          photo_url: string
          stylist_id: string
          updated_at: string | null
        }
        Insert: {
          before_photo_url?: string | null
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_before_after?: boolean | null
          photo_url: string
          stylist_id: string
          updated_at?: string | null
        }
        Update: {
          before_photo_url?: string | null
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_before_after?: boolean | null
          photo_url?: string
          stylist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_photos_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          gender: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          gender?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: string | null
          client_id: string
          created_at: string
          id: string
          rating: number
          review_text: string | null
          stylist_id: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          client_id: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          stylist_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          stylist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stylist_affiliate_codes: {
        Row: {
          affiliate_link: string | null
          brand_id: string | null
          created_at: string
          custom_commission_rate: number | null
          id: string
          is_active: boolean | null
          referral_code: string
          stylist_id: string
        }
        Insert: {
          affiliate_link?: string | null
          brand_id?: string | null
          created_at?: string
          custom_commission_rate?: number | null
          id?: string
          is_active?: boolean | null
          referral_code: string
          stylist_id: string
        }
        Update: {
          affiliate_link?: string | null
          brand_id?: string | null
          created_at?: string
          custom_commission_rate?: number | null
          id?: string
          is_active?: boolean | null
          referral_code?: string
          stylist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stylist_affiliate_codes_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "hair_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stylist_affiliate_codes_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stylist_blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          reason: string | null
          stylist_id: string
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          reason?: string | null
          stylist_id: string
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          reason?: string | null
          stylist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stylist_blocked_dates_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stylist_profiles: {
        Row: {
          average_rating: number | null
          bio: string | null
          business_name: string | null
          color_line: string | null
          commission_rate: number | null
          created_at: string
          id: string
          is_available: boolean | null
          location: string | null
          specialty: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          weekly_schedule: Json | null
          years_experience: number | null
        }
        Insert: {
          average_rating?: number | null
          bio?: string | null
          business_name?: string | null
          color_line?: string | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_available?: boolean | null
          location?: string | null
          specialty?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          weekly_schedule?: Json | null
          years_experience?: number | null
        }
        Update: {
          average_rating?: number | null
          bio?: string | null
          business_name?: string | null
          color_line?: string | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_available?: boolean | null
          location?: string | null
          specialty?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          weekly_schedule?: Json | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stylist_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stylist_services: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          price: number
          service_name: string
          stylist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          price: number
          service_name: string
          stylist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          price?: number
          service_name?: string
          stylist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stylist_services_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "stylist" | "client" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["stylist", "client", "admin"],
    },
  },
} as const
