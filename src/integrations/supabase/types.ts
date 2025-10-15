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
      access_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          notes: string | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          image_urls: string[] | null
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          context_id: string | null
          context_type: string | null
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_corrections: {
        Row: {
          correction_steps: Json
          created_at: string
          id: string
          notes: string | null
          problem_description: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          correction_steps: Json
          created_at?: string
          id?: string
          notes?: string | null
          problem_description: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          correction_steps?: Json
          created_at?: string
          id?: string
          notes?: string | null
          problem_description?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_feedback: {
        Row: {
          comment: string | null
          context_id: string | null
          context_type: string
          created_at: string
          feedback_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          context_id?: string | null
          context_type: string
          created_at?: string
          feedback_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          context_id?: string | null
          context_type?: string
          created_at?: string
          feedback_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_formulas: {
        Row: {
          created_at: string
          formula_content: string
          formula_name: string
          id: string
          is_favorite: boolean | null
          prompt: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          formula_content: string
          formula_name: string
          id?: string
          is_favorite?: boolean | null
          prompt: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          formula_content?: string
          formula_name?: string
          id?: string
          is_favorite?: boolean | null
          prompt?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      appointment_calendar_events: {
        Row: {
          appointment_id: string
          calendar_connection_id: string
          error_message: string | null
          external_event_id: string
          id: string
          last_updated_at: string | null
          provider: string
          sync_status: string | null
          synced_at: string | null
        }
        Insert: {
          appointment_id: string
          calendar_connection_id: string
          error_message?: string | null
          external_event_id: string
          id?: string
          last_updated_at?: string | null
          provider: string
          sync_status?: string | null
          synced_at?: string | null
        }
        Update: {
          appointment_id?: string
          calendar_connection_id?: string
          error_message?: string | null
          external_event_id?: string
          id?: string
          last_updated_at?: string | null
          provider?: string
          sync_status?: string | null
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_calendar_events_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_calendar_events_calendar_connection_id_fkey"
            columns: ["calendar_connection_id"]
            isOneToOne: false
            referencedRelation: "calendar_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_timers: {
        Row: {
          appointment_id: string
          created_at: string | null
          duration_seconds: number
          end_time: string | null
          id: string
          notes: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          duration_seconds?: number
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          duration_seconds?: number
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_timers_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          cancellation_reason: string | null
          cancelled_at: string | null
          client_id: string
          created_at: string
          duration_minutes: number | null
          followup_sent: boolean | null
          id: string
          notes: string | null
          rebook_reminder_sent: boolean | null
          reminder_sent: boolean | null
          service_id: string | null
          service_type: string
          status: string | null
          stylist_id: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_id: string
          created_at?: string
          duration_minutes?: number | null
          followup_sent?: boolean | null
          id?: string
          notes?: string | null
          rebook_reminder_sent?: boolean | null
          reminder_sent?: boolean | null
          service_id?: string | null
          service_type: string
          status?: string | null
          stylist_id: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_id?: string
          created_at?: string
          duration_minutes?: number | null
          followup_sent?: boolean | null
          id?: string
          notes?: string | null
          rebook_reminder_sent?: boolean | null
          reminder_sent?: boolean | null
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
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["client_id"]
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
            referencedRelation: "public_stylist_profiles_safe"
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
      calendar_connections: {
        Row: {
          access_token_vault_id: string
          calendar_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          last_token_refresh: string | null
          provider: string
          refresh_token_vault_id: string | null
          suspicious_activity_detected: boolean | null
          sync_enabled: boolean | null
          token_expires_at: string | null
          token_refresh_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_vault_id: string
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_token_refresh?: string | null
          provider: string
          refresh_token_vault_id?: string | null
          suspicious_activity_detected?: boolean | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          token_refresh_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_vault_id?: string
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_token_refresh?: string | null
          provider?: string
          refresh_token_vault_id?: string | null
          suspicious_activity_detected?: boolean | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          token_refresh_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendar_token_access_log: {
        Row: {
          access_type: string
          accessed_at: string
          connection_id: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_type: string
          accessed_at?: string
          connection_id: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          accessed_at?: string
          connection_id?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_token_access_log_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "calendar_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      client_hair_posts: {
        Row: {
          budget_range: string | null
          claimed_at: string | null
          claimed_by_stylist_id: string | null
          client_id: string
          created_at: string
          description: string
          id: string
          location: string | null
          photo_urls: string[] | null
          preferred_date: string | null
          service_type: string
          status: string
          title: string
          updated_at: string
          video_analysis: Json | null
          video_url: string | null
        }
        Insert: {
          budget_range?: string | null
          claimed_at?: string | null
          claimed_by_stylist_id?: string | null
          client_id: string
          created_at?: string
          description: string
          id?: string
          location?: string | null
          photo_urls?: string[] | null
          preferred_date?: string | null
          service_type: string
          status?: string
          title: string
          updated_at?: string
          video_analysis?: Json | null
          video_url?: string | null
        }
        Update: {
          budget_range?: string | null
          claimed_at?: string | null
          claimed_by_stylist_id?: string | null
          client_id?: string
          created_at?: string
          description?: string
          id?: string
          location?: string | null
          photo_urls?: string[] | null
          preferred_date?: string | null
          service_type?: string
          status?: string
          title?: string
          updated_at?: string
          video_analysis?: Json | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_hair_posts_claimed_by_stylist_id_fkey"
            columns: ["claimed_by_stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_hair_posts_claimed_by_stylist_id_fkey"
            columns: ["claimed_by_stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_hair_posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_hair_posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["client_id"]
          },
        ]
      }
      client_invitations: {
        Row: {
          accepted: boolean | null
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          stylist_id: string
          token: string
        }
        Insert: {
          accepted?: boolean | null
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          stylist_id: string
          token?: string
        }
        Update: {
          accepted?: boolean | null
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          stylist_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_invitations_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invitations_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_milestones: {
        Row: {
          celebrated: boolean | null
          client_id: string
          created_at: string
          discount_amount: number | null
          discount_code: string | null
          id: string
          milestone_type: string
          milestone_value: number
          stylist_id: string
        }
        Insert: {
          celebrated?: boolean | null
          client_id: string
          created_at?: string
          discount_amount?: number | null
          discount_code?: string | null
          id?: string
          milestone_type: string
          milestone_value: number
          stylist_id: string
        }
        Update: {
          celebrated?: boolean | null
          client_id?: string
          created_at?: string
          discount_amount?: number | null
          discount_code?: string | null
          id?: string
          milestone_type?: string
          milestone_value?: number
          stylist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_milestones_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_milestones_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          allergies: string | null
          appointment_reminders_enabled: boolean | null
          birthday: string | null
          client_since: string | null
          communication_preference: string | null
          created_at: string
          email: string | null
          full_name: string | null
          hair_goals: string | null
          hair_type: string | null
          id: string
          medical_info_consent: boolean | null
          notes: string | null
          phone: string | null
          preferred_stylist_id: string | null
          preferred_stylist_notes: string | null
          preferred_time_of_day: string | null
          referral_source: string | null
          sensitivity_notes: string | null
          special_requests: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          allergies?: string | null
          appointment_reminders_enabled?: boolean | null
          birthday?: string | null
          client_since?: string | null
          communication_preference?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          hair_goals?: string | null
          hair_type?: string | null
          id?: string
          medical_info_consent?: boolean | null
          notes?: string | null
          phone?: string | null
          preferred_stylist_id?: string | null
          preferred_stylist_notes?: string | null
          preferred_time_of_day?: string | null
          referral_source?: string | null
          sensitivity_notes?: string | null
          special_requests?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          allergies?: string | null
          appointment_reminders_enabled?: boolean | null
          birthday?: string | null
          client_since?: string | null
          communication_preference?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          hair_goals?: string | null
          hair_type?: string | null
          id?: string
          medical_info_consent?: boolean | null
          notes?: string | null
          phone?: string | null
          preferred_stylist_id?: string | null
          preferred_stylist_notes?: string | null
          preferred_time_of_day?: string | null
          referral_source?: string | null
          sensitivity_notes?: string | null
          special_requests?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_preferred_stylist_id_fkey"
            columns: ["preferred_stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "public_stylist_profiles_safe"
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
      dashboard_layout: {
        Row: {
          created_at: string
          id: string
          section_order: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          section_order?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          section_order?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deletion_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          email: string
          id: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      email_preferences: {
        Row: {
          appointment_reminders_enabled: boolean | null
          client_id: string | null
          created_at: string | null
          email: string
          id: string
          marketing_emails_enabled: boolean | null
          rebooking_reminders_enabled: boolean | null
          unsubscribe_token: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_reminders_enabled?: boolean | null
          client_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          marketing_emails_enabled?: boolean | null
          rebooking_reminders_enabled?: boolean | null
          unsubscribe_token?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_reminders_enabled?: boolean | null
          client_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          marketing_emails_enabled?: boolean | null
          rebooking_reminders_enabled?: boolean | null
          unsubscribe_token?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "client_statistics"
            referencedColumns: ["client_id"]
          },
        ]
      }
      email_sequence_enrollments: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          enrolled_at: string | null
          id: string
          metadata: Json | null
          next_send_at: string | null
          sequence_id: string
          status: string | null
          stylist_id: string
          unenrolled_at: string | null
          unenrolled_reason: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          metadata?: Json | null
          next_send_at?: string | null
          sequence_id: string
          status?: string | null
          stylist_id: string
          unenrolled_at?: string | null
          unenrolled_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          metadata?: Json | null
          next_send_at?: string | null
          sequence_id?: string
          status?: string | null
          stylist_id?: string
          unenrolled_at?: string | null
          unenrolled_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_enrollments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sequence_enrollments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "email_sequence_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sequence_enrollments_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sequence_enrollments_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequence_logs: {
        Row: {
          bounce_reason: string | null
          bounced: boolean | null
          clicked_at: string | null
          client_id: string
          created_at: string | null
          email_address: string
          enrollment_id: string
          id: string
          opened_at: string | null
          resend_email_id: string | null
          sent_at: string | null
          step_id: string
          stylist_id: string
          subject: string
          unsubscribed: boolean | null
        }
        Insert: {
          bounce_reason?: string | null
          bounced?: boolean | null
          clicked_at?: string | null
          client_id: string
          created_at?: string | null
          email_address: string
          enrollment_id: string
          id?: string
          opened_at?: string | null
          resend_email_id?: string | null
          sent_at?: string | null
          step_id: string
          stylist_id: string
          subject: string
          unsubscribed?: boolean | null
        }
        Update: {
          bounce_reason?: string | null
          bounced?: boolean | null
          clicked_at?: string | null
          client_id?: string
          created_at?: string | null
          email_address?: string
          enrollment_id?: string
          id?: string
          opened_at?: string | null
          resend_email_id?: string | null
          sent_at?: string | null
          step_id?: string
          stylist_id?: string
          subject?: string
          unsubscribed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sequence_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "email_sequence_logs_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "email_sequence_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sequence_logs_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "email_sequence_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sequence_logs_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sequence_logs_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequence_steps: {
        Row: {
          body_html: string
          created_at: string | null
          delay_amount: number
          delay_unit: string
          id: string
          name: string
          send_time_preference: string | null
          sequence_id: string
          step_order: number
          stop_on_conditions: Json | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          body_html: string
          created_at?: string | null
          delay_amount?: number
          delay_unit?: string
          id?: string
          name: string
          send_time_preference?: string | null
          sequence_id: string
          step_order: number
          stop_on_conditions?: Json | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          body_html?: string
          created_at?: string | null
          delay_amount?: number
          delay_unit?: string
          id?: string
          name?: string
          send_time_preference?: string | null
          sequence_id?: string
          step_order?: number
          stop_on_conditions?: Json | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequences: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_global_template: boolean | null
          name: string
          stylist_id: string | null
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_global_template?: boolean | null
          name: string
          stylist_id?: string | null
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_global_template?: boolean | null
          name?: string
          stylist_id?: string | null
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sequences_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sequences_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          business_logo_url: string | null
          created_at: string | null
          custom_message: string | null
          id: string
          rebooking_closing: string | null
          rebooking_cta_text: string | null
          rebooking_enabled: boolean | null
          rebooking_headline: string | null
          rebooking_opening: string | null
          rebooking_subject: string | null
          show_business_logo: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_logo_url?: string | null
          created_at?: string | null
          custom_message?: string | null
          id?: string
          rebooking_closing?: string | null
          rebooking_cta_text?: string | null
          rebooking_enabled?: boolean | null
          rebooking_headline?: string | null
          rebooking_opening?: string | null
          rebooking_subject?: string | null
          show_business_logo?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_logo_url?: string | null
          created_at?: string | null
          custom_message?: string | null
          id?: string
          rebooking_closing?: string | null
          rebooking_cta_text?: string | null
          rebooking_enabled?: boolean | null
          rebooking_headline?: string | null
          rebooking_opening?: string | null
          rebooking_subject?: string | null
          show_business_logo?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          html_content: string
          id: string
          is_global: boolean | null
          name: string
          preview_text: string | null
          stylist_id: string | null
          subject_template: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          html_content: string
          id?: string
          is_global?: boolean | null
          name: string
          preview_text?: string | null
          stylist_id?: string | null
          subject_template: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          html_content?: string
          id?: string
          is_global?: boolean | null
          name?: string
          preview_text?: string | null
          stylist_id?: string | null
          subject_template?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          action: string
          attempt_count: number | null
          component: string
          context: Json | null
          created_at: string | null
          error_message: string
          error_stack: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          attempt_count?: number | null
          component: string
          context?: Json | null
          created_at?: string | null
          error_message: string
          error_stack?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          attempt_count?: number | null
          component?: string
          context?: Json | null
          created_at?: string | null
          error_message?: string
          error_stack?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      favorite_stylists: {
        Row: {
          client_id: string
          created_at: string
          id: string
          stylist_profile_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          stylist_profile_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          stylist_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_stylists_stylist_profile_id_fkey"
            columns: ["stylist_profile_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_stylists_stylist_profile_id_fkey"
            columns: ["stylist_profile_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_upvotes: {
        Row: {
          created_at: string
          feedback_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_upvotes_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "product_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      formula_access_log: {
        Row: {
          access_type: string
          accessed_at: string
          accessed_by: string | null
          formula_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string
          accessed_by?: string | null
          formula_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          accessed_by?: string | null
          formula_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formula_access_log_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "formulas"
            referencedColumns: ["id"]
          },
        ]
      }
      formula_products: {
        Row: {
          created_at: string
          formula_id: string
          id: string
          product_id: string
          quantity_used: number
        }
        Insert: {
          created_at?: string
          formula_id: string
          id?: string
          product_id: string
          quantity_used: number
        }
        Update: {
          created_at?: string
          formula_id?: string
          id?: string
          product_id?: string
          quantity_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "formula_products_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formula_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      formulas: {
        Row: {
          application_notes: string | null
          client_id: string
          color_line: string | null
          created_at: string
          developer_volume: string | null
          formula_text: string
          hair_photo_url: string | null
          id: string
          instructions: string | null
          processing_time_minutes: number | null
          result_notes: string | null
          stylist_id: string
          tags: string[] | null
          updated_at: string
          what_to_avoid: string | null
          what_worked: string | null
        }
        Insert: {
          application_notes?: string | null
          client_id: string
          color_line?: string | null
          created_at?: string
          developer_volume?: string | null
          formula_text: string
          hair_photo_url?: string | null
          id?: string
          instructions?: string | null
          processing_time_minutes?: number | null
          result_notes?: string | null
          stylist_id: string
          tags?: string[] | null
          updated_at?: string
          what_to_avoid?: string | null
          what_worked?: string | null
        }
        Update: {
          application_notes?: string | null
          client_id?: string
          color_line?: string | null
          created_at?: string
          developer_volume?: string | null
          formula_text?: string
          hair_photo_url?: string | null
          id?: string
          instructions?: string | null
          processing_time_minutes?: number | null
          result_notes?: string | null
          stylist_id?: string
          tags?: string[] | null
          updated_at?: string
          what_to_avoid?: string | null
          what_worked?: string | null
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
            foreignKeyName: "formulas_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "formulas_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
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
      medical_data_access_log: {
        Row: {
          access_type: string
          accessed_at: string
          accessor_user_id: string | null
          client_profile_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string
          accessor_user_id?: string | null
          client_profile_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          accessor_user_id?: string | null
          client_profile_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_data_access_log_client_profile_id_fkey"
            columns: ["client_profile_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_data_access_log_client_profile_id_fkey"
            columns: ["client_profile_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["client_id"]
          },
        ]
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
      onboarding_progress: {
        Row: {
          completed_at: string | null
          completed_steps: Json | null
          created_at: string
          current_step: number | null
          id: string
          is_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: Json | null
          created_at?: string
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: Json | null
          created_at?: string
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          client_id: string
          created_at: string
          id: string
          is_deposit: boolean | null
          payment_method: string | null
          payment_type: string | null
          remaining_balance: number | null
          status: string | null
          stylist_id: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          client_id: string
          created_at?: string
          id?: string
          is_deposit?: boolean | null
          payment_method?: string | null
          payment_type?: string | null
          remaining_balance?: number | null
          status?: string | null
          stylist_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
          is_deposit?: boolean | null
          payment_method?: string | null
          payment_type?: string | null
          remaining_balance?: number | null
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
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
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
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_photos_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_feedback: {
        Row: {
          admin_response: string | null
          category: string | null
          created_at: string
          description: string
          feedback_type: string
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          category?: string | null
          created_at?: string
          description: string
          feedback_type: string
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          admin_response?: string | null
          category?: string | null
          created_at?: string
          description?: string
          feedback_type?: string
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      product_inventory: {
        Row: {
          brand: string
          category: string
          cost_per_unit: number | null
          created_at: string
          current_quantity: number
          id: string
          notes: string | null
          product_name: string
          reorder_threshold: number
          stylist_id: string
          unit_type: string
          updated_at: string
        }
        Insert: {
          brand: string
          category: string
          cost_per_unit?: number | null
          created_at?: string
          current_quantity?: number
          id?: string
          notes?: string | null
          product_name: string
          reorder_threshold?: number
          stylist_id: string
          unit_type?: string
          updated_at?: string
        }
        Update: {
          brand?: string
          category?: string
          cost_per_unit?: number | null
          created_at?: string
          current_quantity?: number
          id?: string
          notes?: string | null
          product_name?: string
          reorder_threshold?: number
          stylist_id?: string
          unit_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_stylist_id_fkey"
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
          dashboard_preferences: Json | null
          deleted_at: string | null
          email: string
          email_digest_enabled: boolean | null
          full_name: string | null
          gender: string | null
          id: string
          notification_preferences: Json | null
          phone: string | null
          share_contact_with_clients: boolean | null
          share_contact_with_stylists: boolean | null
          sms_consent: boolean | null
          sms_consent_date: string | null
          theme_preference: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          dashboard_preferences?: Json | null
          deleted_at?: string | null
          email: string
          email_digest_enabled?: boolean | null
          full_name?: string | null
          gender?: string | null
          id: string
          notification_preferences?: Json | null
          phone?: string | null
          share_contact_with_clients?: boolean | null
          share_contact_with_stylists?: boolean | null
          sms_consent?: boolean | null
          sms_consent_date?: string | null
          theme_preference?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          dashboard_preferences?: Json | null
          deleted_at?: string | null
          email?: string
          email_digest_enabled?: boolean | null
          full_name?: string | null
          gender?: string | null
          id?: string
          notification_preferences?: Json | null
          phone?: string | null
          share_contact_with_clients?: boolean | null
          share_contact_with_stylists?: boolean | null
          sms_consent?: boolean | null
          sms_consent_date?: string | null
          theme_preference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rebooking_reminders: {
        Row: {
          appointment_id: string
          client_id: string
          created_at: string
          id: string
          rebooked: boolean | null
          rebooked_appointment_id: string | null
          reminder_type: string
          sent_at: string
          status: string
          stylist_id: string
        }
        Insert: {
          appointment_id: string
          client_id: string
          created_at?: string
          id?: string
          rebooked?: boolean | null
          rebooked_appointment_id?: string | null
          reminder_type?: string
          sent_at?: string
          status?: string
          stylist_id: string
        }
        Update: {
          appointment_id?: string
          client_id?: string
          created_at?: string
          id?: string
          rebooked?: boolean | null
          rebooked_appointment_id?: string | null
          reminder_type?: string
          sent_at?: string
          status?: string
          stylist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rebooking_reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rebooking_reminders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rebooking_reminders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "rebooking_reminders_rebooked_appointment_id_fkey"
            columns: ["rebooked_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rebooking_reminders_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rebooking_reminders_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_tracking: {
        Row: {
          created_at: string
          id: string
          is_qualified: boolean | null
          qualified_at: string | null
          referral_code: string
          referred_stylist_id: string
          referrer_id: string
          signup_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_qualified?: boolean | null
          qualified_at?: string | null
          referral_code: string
          referred_stylist_id: string
          referrer_id: string
          signup_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_qualified?: boolean | null
          qualified_at?: string | null
          referral_code?: string
          referred_stylist_id?: string
          referrer_id?: string
          signup_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_tracking_referred_stylist_id_fkey"
            columns: ["referred_stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_tracking_referred_stylist_id_fkey"
            columns: ["referred_stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_tracking_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_tracking_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_statistics"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "reviews_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
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
      sensitive_data_access_log: {
        Row: {
          access_type: string
          accessed_at: string
          accessed_by: string | null
          id: string
          ip_address: unknown | null
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string
          accessed_by?: string | null
          id?: string
          ip_address?: unknown | null
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          accessed_by?: string | null
          id?: string
          ip_address?: unknown | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      service_templates: {
        Row: {
          created_at: string | null
          id: string
          name: string
          services: string[]
          stylist_id: string
          total_duration: number
          total_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          services?: string[]
          stylist_id: string
          total_duration?: number
          total_price?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          services?: string[]
          stylist_id?: string
          total_duration?: number
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_templates_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_templates_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_type_colors: {
        Row: {
          color: string
          created_at: string
          id: string
          service_type: string
          stylist_id: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          service_type: string
          stylist_id: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          service_type?: string
          stylist_id?: string
          updated_at?: string
        }
        Relationships: []
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
            referencedRelation: "public_stylist_profiles_safe"
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
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stylist_blocked_dates_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stylist_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stylist_profiles: {
        Row: {
          accepts_new_clients: boolean | null
          average_rating: number | null
          bio: string | null
          booking_instructions: string | null
          booking_link: string | null
          buffer_time_minutes: number | null
          business_email: string | null
          business_name: string | null
          business_phone: string | null
          cancellation_policy: string | null
          color_line: string | null
          commission_rate: number | null
          created_at: string
          deposit_percentage: number | null
          deposit_required: boolean | null
          id: string
          instant_booking_enabled: boolean | null
          is_available: boolean | null
          is_public_listing: boolean | null
          location: string | null
          max_clients_per_day: number | null
          parking_instructions: string | null
          preferred_communication: string | null
          social_media_facebook: string | null
          social_media_instagram: string | null
          social_media_tiktok: string | null
          special_accommodations: string | null
          specialty: string | null
          timezone: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          weekly_schedule: Json | null
          years_experience: number | null
        }
        Insert: {
          accepts_new_clients?: boolean | null
          average_rating?: number | null
          bio?: string | null
          booking_instructions?: string | null
          booking_link?: string | null
          buffer_time_minutes?: number | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          cancellation_policy?: string | null
          color_line?: string | null
          commission_rate?: number | null
          created_at?: string
          deposit_percentage?: number | null
          deposit_required?: boolean | null
          id?: string
          instant_booking_enabled?: boolean | null
          is_available?: boolean | null
          is_public_listing?: boolean | null
          location?: string | null
          max_clients_per_day?: number | null
          parking_instructions?: string | null
          preferred_communication?: string | null
          social_media_facebook?: string | null
          social_media_instagram?: string | null
          social_media_tiktok?: string | null
          special_accommodations?: string | null
          specialty?: string | null
          timezone?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          weekly_schedule?: Json | null
          years_experience?: number | null
        }
        Update: {
          accepts_new_clients?: boolean | null
          average_rating?: number | null
          bio?: string | null
          booking_instructions?: string | null
          booking_link?: string | null
          buffer_time_minutes?: number | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          cancellation_policy?: string | null
          color_line?: string | null
          commission_rate?: number | null
          created_at?: string
          deposit_percentage?: number | null
          deposit_required?: boolean | null
          id?: string
          instant_booking_enabled?: boolean | null
          is_available?: boolean | null
          is_public_listing?: boolean | null
          location?: string | null
          max_clients_per_day?: number | null
          parking_instructions?: string | null
          preferred_communication?: string | null
          social_media_facebook?: string | null
          social_media_instagram?: string | null
          social_media_tiktok?: string | null
          special_accommodations?: string | null
          specialty?: string | null
          timezone?: string | null
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
      stylist_referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_by: string | null
          reward_tier: string | null
          stylist_id: string
          successful_referrals: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_by?: string | null
          reward_tier?: string | null
          stylist_id: string
          successful_referrals?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_by?: string | null
          reward_tier?: string | null
          stylist_id?: string
          successful_referrals?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stylist_referrals_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stylist_referrals_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stylist_referrals_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stylist_referrals_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stylist_schedule_overrides: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_recurring: boolean | null
          label: string | null
          start_date: string
          stylist_id: string
          weekly_schedule: Json
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_recurring?: boolean | null
          label?: string | null
          start_date: string
          stylist_id: string
          weekly_schedule: Json
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_recurring?: boolean | null
          label?: string | null
          start_date?: string
          stylist_id?: string
          weekly_schedule?: Json
        }
        Relationships: [
          {
            foreignKeyName: "stylist_schedule_overrides_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stylist_schedule_overrides_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stylist_services: {
        Row: {
          buffer_time_minutes: number | null
          created_at: string
          deposit_amount: number | null
          deposit_type: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          price: number
          require_deposit: boolean | null
          service_name: string
          stylist_id: string
          updated_at: string
        }
        Insert: {
          buffer_time_minutes?: number | null
          created_at?: string
          deposit_amount?: number | null
          deposit_type?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          price: number
          require_deposit?: boolean | null
          service_name: string
          stylist_id: string
          updated_at?: string
        }
        Update: {
          buffer_time_minutes?: number | null
          created_at?: string
          deposit_amount?: number | null
          deposit_type?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          price?: number
          require_deposit?: boolean | null
          service_name?: string
          stylist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stylist_services_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stylist_services_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stylist_todos: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          stylist_id: string
          task: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          stylist_id: string
          task: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          stylist_id?: string
          task?: string
          updated_at?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          completed: boolean
          created_at: string
          due_date: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_dashboard_preferences: {
        Row: {
          created_at: string | null
          dashboard_layout: Json | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dashboard_layout?: Json | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dashboard_layout?: Json | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_sidebar_preferences: {
        Row: {
          created_at: string
          id: string
          sidebar_order: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sidebar_order?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sidebar_order?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          id: string
          notes: string | null
          notified_at: string | null
          preferred_date: string | null
          preferred_time: string | null
          service_type: string
          status: string
          stylist_id: string
        }
        Insert: {
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          notified_at?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          service_type: string
          status?: string
          stylist_id: string
        }
        Update: {
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          notified_at?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          service_type?: string
          status?: string
          stylist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_activity_log: {
        Row: {
          action: string | null
          actor_email: string | null
          actor_name: string | null
          created_at: string | null
          id: string | null
          new_data: Json | null
          old_data: Json | null
          table_name: string | null
          user_id: string | null
        }
        Relationships: []
      }
      client_statistics: {
        Row: {
          client_id: string | null
          completed_appointments: number | null
          email: string | null
          full_name: string | null
          last_appointment_date: string | null
          phone: string | null
          preferred_stylist_id: string | null
          total_appointments: number | null
          upcoming_appointments: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_preferred_stylist_id_fkey"
            columns: ["preferred_stylist_id"]
            isOneToOne: false
            referencedRelation: "public_stylist_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_profiles_preferred_stylist_id_fkey"
            columns: ["preferred_stylist_id"]
            isOneToOne: false
            referencedRelation: "stylist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_stylist_profiles_safe: {
        Row: {
          average_rating: number | null
          bio: string | null
          business_name: string | null
          created_at: string | null
          id: string | null
          is_available: boolean | null
          is_public_listing: boolean | null
          location: string | null
          specialty: string | null
          total_reviews: number | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          average_rating?: number | null
          bio?: string | null
          business_name?: string | null
          created_at?: string | null
          id?: string | null
          is_available?: boolean | null
          is_public_listing?: boolean | null
          location?: string | null
          specialty?: string | null
          total_reviews?: number | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          average_rating?: number | null
          bio?: string | null
          business_name?: string | null
          created_at?: string | null
          id?: string | null
          is_available?: boolean | null
          is_public_listing?: boolean | null
          location?: string | null
          specialty?: string | null
          total_reviews?: number | null
          user_id?: string | null
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
      security_audit_summary: {
        Row: {
          records_with_pii: number | null
          status: string | null
          table_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_client_invitation: {
        Args: {
          client_email: string
          client_full_name: string
          client_phone?: string
          client_user_id: string
          consent_to_medical_info?: boolean
          invitation_token: string
        }
        Returns: string
      }
      anonymize_old_client_data: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      assign_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      can_access_stylist_services: {
        Args: { _stylist_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_client_stats: {
        Args: { _client_id: string }
        Returns: boolean
      }
      can_view_referral_tracking: {
        Args: {
          _referred_stylist_id: string
          _referrer_id: string
          _user_id: string
        }
        Returns: boolean
      }
      can_view_security_audit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_client_milestones: {
        Args: { p_client_id: string; p_stylist_id: string }
        Returns: undefined
      }
      cleanup_old_error_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_referral_code: {
        Args: { stylist_name: string }
        Returns: string
      }
      get_calendar_token: {
        Args: { p_connection_id: string }
        Returns: {
          access_token: string
          refresh_token: string
        }[]
      }
      get_client_profile_id: {
        Args: { _user_id: string }
        Returns: string
      }
      get_stylist_profile_id: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_stylist_ids: {
        Args: { _user_id: string }
        Returns: string[]
      }
      grant_admin_role: {
        Args: { _user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_stylist_relationship: {
        Args: { _stylist_id: string; _user_id: string }
        Returns: boolean
      }
      is_client_connected_to_stylist: {
        Args: { _client_user_id: string; _stylist_id: string }
        Returns: boolean
      }
      is_stylist_owner: {
        Args: { _stylist_id: string; _user_id: string }
        Returns: boolean
      }
      needs_rebooking_reminder: {
        Args: { appointment_id_param: string }
        Returns: boolean
      }
      profile_shares_contact_with_stylists: {
        Args: { _profile_id: string }
        Returns: boolean
      }
      redeem_access_code: {
        Args: { _code: string; _user_id: string }
        Returns: boolean
      }
      revoke_admin_role: {
        Args: { _user_id: string }
        Returns: undefined
      }
      store_calendar_token: {
        Args: {
          p_access_token: string
          p_provider: string
          p_refresh_token?: string
          p_user_id: string
        }
        Returns: string
      }
      stylist_has_client_access: {
        Args: { _client_id: string; _stylist_user_id: string }
        Returns: boolean
      }
      trigger_appointment_reminders: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      user_owns_formula: {
        Args: { _formula_id: string; _user_id: string }
        Returns: boolean
      }
      validate_access_code: {
        Args: { code_input: string }
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
