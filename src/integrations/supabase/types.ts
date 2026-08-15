export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      calendar: {
        Row: {
          beneficiary_id: string | null
          created_at: string
          created_by: string | null
          due_at: string | null
          entry_type: string
          id: string
          location: string | null
          notes: string | null
          pic_id: string | null
          scheduled_at: string | null
          status: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          beneficiary_id?: string | null
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          entry_type: string
          id?: string
          location?: string | null
          notes?: string | null
          pic_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          beneficiary_id?: string | null
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          entry_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          pic_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "contacts_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "calendar_pic_id_fkey"
            columns: ["pic_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_pic_id_fkey"
            columns: ["pic_id"]
            isOneToOne: false
            referencedRelation: "contacts_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          adults_count: number | null
          allergies: boolean | null
          children_gt16: number | null
          children_lt16: number | null
          created_at: string | null
          created_by: string | null
          email: string | null
          hallal: boolean | null
          id: string
          infant: boolean | null
          name: string
          notes: string | null
          owner_id: string | null
          phone: string | null
          postcode: string | null
          region_id: string | null
          status: Database["public"]["Enums"]["beneficiary_enum"]
          street_address: string | null
          updated_at: string | null
          updated_by: string | null
          vegetarian: boolean | null
        }
        Insert: {
          adults_count?: number | null
          allergies?: boolean | null
          children_gt16?: number | null
          children_lt16?: number | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          hallal?: boolean | null
          id?: string
          infant?: boolean | null
          name: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          postcode?: string | null
          region_id?: string | null
          status?: Database["public"]["Enums"]["beneficiary_enum"]
          street_address?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vegetarian?: boolean | null
        }
        Update: {
          adults_count?: number | null
          allergies?: boolean | null
          children_gt16?: number | null
          children_lt16?: number | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          hallal?: boolean | null
          id?: string
          infant?: boolean | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          postcode?: string | null
          region_id?: string | null
          status?: Database["public"]["Enums"]["beneficiary_enum"]
          street_address?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vegetarian?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      contacts_allotment: {
        Row: {
          attended: boolean
          contact_id: string
          date: string
          id: string
          served: boolean
          serving: boolean
          type: Database["public"]["Enums"]["allotment_type_enum"]
          updated_at: string
          visit_num: number | null
        }
        Insert: {
          attended?: boolean
          contact_id: string
          date: string
          id?: string
          served?: boolean
          serving?: boolean
          type: Database["public"]["Enums"]["allotment_type_enum"]
          updated_at?: string
          visit_num?: number | null
        }
        Update: {
          attended?: boolean
          contact_id?: string
          date?: string
          id?: string
          served?: boolean
          serving?: boolean
          type?: Database["public"]["Enums"]["allotment_type_enum"]
          updated_at?: string
          visit_num?: number | null
        }
        Relationships: []
      }
      contacts_notes: {
        Row: {
          contact_id: string
          created_at: string | null
          created_by: string | null
          id: string
          note: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          note?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          note?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      contacts_referrer: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          contact_id: string
          created_at: string | null
          first_referred_by: string | null
          id: string
          message: string | null
          referrer_id: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          contact_id: string
          created_at?: string | null
          first_referred_by?: string | null
          id?: string
          message?: string | null
          referrer_id: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          contact_id?: string
          created_at?: string | null
          first_referred_by?: string | null
          id?: string
          message?: string | null
          referrer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrer_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrer_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrer_user_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      division_settings: {
        Row: {
          division_id: string
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          division_id: string
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          division_id?: string
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      divisions: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          entity_id: string | null
          head_id: string | null
          id: string
          is_active: boolean
          manager_id: string | null
          name: string
          region_id: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          head_id?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name: string
          region_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          head_id?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name?: string
          region_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "divisions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "divisions_head_id_fkey"
            columns: ["head_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "divisions_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "divisions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          code: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          is_referrer: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_referrer?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_referrer?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      entity_settings: {
        Row: {
          division_id: string | null
          entity_id: string
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          division_id?: string | null
          entity_id: string
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          division_id?: string | null
          entity_id?: string
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          calendar_id: string | null
          contact_id: string | null
          created_at: string
          id: string
          link: string | null
          message: string | null
          meta: Json | null
          org_role: string | null
          title: string | null
          type: Database["public"]["Enums"]["notification_type_enum"]
        }
        Insert: {
          calendar_id?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          meta?: Json | null
          org_role?: string | null
          title?: string | null
          type: Database["public"]["Enums"]["notification_type_enum"]
        }
        Update: {
          calendar_id?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          meta?: Json | null
          org_role?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["notification_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_calendar_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_conctacts_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_conctacts_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_user: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          notification_id: string | null
          read_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          notification_id?: string | null
          read_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          notification_id?: string | null
          read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_notify_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          address: Json | null
          approval_status: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          org_type: Database["public"]["Enums"]["org_type_enum"]
          phone: string | null
          region_id: string | null
          service: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          approval_status?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          org_type?: Database["public"]["Enums"]["org_type_enum"]
          phone?: string | null
          region_id?: string | null
          service?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          approval_status?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          org_type?: Database["public"]["Enums"]["org_type_enum"]
          phone?: string | null
          region_id?: string | null
          service?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organisations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      regions: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          division_id: string | null
          email: string | null
          entity_id: string | null
          full_name: string
          id: string
          is_active: boolean
          manager_id: string | null
          phone: string | null
          region_id: string | null
          role: Database["public"]["Enums"]["role_enum"]
          status: Database["public"]["Enums"]["user_status_enum"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          division_id?: string | null
          email?: string | null
          entity_id?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          manager_id?: string | null
          phone?: string | null
          region_id?: string | null
          role?: Database["public"]["Enums"]["role_enum"]
          status?: Database["public"]["Enums"]["user_status_enum"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          division_id?: string | null
          email?: string | null
          entity_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          manager_id?: string | null
          phone?: string | null
          region_id?: string | null
          role?: Database["public"]["Enums"]["role_enum"]
          status?: Database["public"]["Enums"]["user_status_enum"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      contacts_queue: {
        Row: {
          adults: number | null
          allergies: boolean | null
          attended_at: string | null
          children_gt16: number | null
          children_lt16: number | null
          created_at: string | null
          email: string | null
          hallal: boolean | null
          id: string | null
          infant: boolean | null
          name: string | null
          notes: string | null
          owner_id: string | null
          phone: string | null
          postcode: string | null
          region_id: string | null
          status: Database["public"]["Enums"]["beneficiary_enum"] | null
          street_address: string | null
          user_id: string | null
          vegetarian: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_audit_log_complete: {
        Row: {
          action_type: string | null
          created_at: string | null
          entity_id: string | null
          entity_name: string | null
          id: string | null
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          session_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_profiles_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_clear_audit_logs: { Args: { p_filters: Json }; Returns: number }
      admin_create_entity: {
        Args: { p_code?: string; p_name: string; p_referrer?: boolean }
        Returns: string
      }
      admin_delete_entity: { Args: { p_entity_id: string }; Returns: boolean }
      admin_delete_user: { Args: { p_id: string }; Returns: Json }
      admin_update_entity: {
        Args: {
          p_code?: string
          p_entity_id: string
          p_is_active?: boolean
          p_name?: string
        }
        Returns: boolean
      }
      admin_update_user_profile: {
        Args: {
          p_division_id?: string
          p_entity_id?: string
          p_manager_id?: string
          p_profile_id: string
          p_region_id?: string
          p_role?: Database["public"]["Enums"]["role_enum"]
        }
        Returns: boolean
      }
      create_calendar: {
        Args: {
          p_beneficiary_id: string
          p_created_by: string
          p_entry_type: string
          p_location: string
          p_notes: string
          p_pic_id: string
          p_scheduled_at: string
          p_status: string
          p_subject: string
        }
        Returns: undefined
      }
      create_calendar_bulk: { Args: { events: Json }; Returns: undefined }
      create_contact: {
        Args: {
          p_address?: string
          p_adults?: number
          p_children_gt16?: number
          p_children_lt16?: number
          p_email?: string
          p_name?: string
          p_notes?: string
          p_owner_id?: string
          p_phone?: string
          p_postcode?: string
          p_region_id?: string
          p_status?: Database["public"]["Enums"]["beneficiary_enum"]
          p_user_id?: string
        }
        Returns: string
      }
      create_division: {
        Args: { p_entity_id: string; p_head_id?: string; p_name: string }
        Returns: string
      }
      create_notification: {
        Args: {
          p_calendar_id?: string
          p_link: string
          p_message: string
          p_org_role?: string
          p_target_user?: string
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type_enum"]
        }
        Returns: string
      }
      create_organisation: {
        Args: {
          p_address: Json
          p_approval_status: string
          p_created_by: string
          p_email: string
          p_is_active: boolean
          p_name: string
          p_notes: string
          p_org_type: Database["public"]["Enums"]["org_type_enum"]
          p_phone: string
          p_region_id: string
          p_service: string
          p_website: string
        }
        Returns: string
      }
      create_region: {
        Args: { p_code: string; p_name: string }
        Returns: string
      }
      delete_calendar: { Args: { p_id: string }; Returns: undefined }
      delete_contact: { Args: { p_id: string }; Returns: Json }
      delete_contact_note: { Args: { p_note_id: string }; Returns: boolean }
      delete_division: { Args: { p_id: string }; Returns: undefined }
      delete_organisation: { Args: { p_id: string }; Returns: undefined }
      delete_region: { Args: { p_id: string }; Returns: undefined }
      get_allotment: {
        Args: { p_contact_id: string }
        Returns: {
          allotment_id: string
          attended: boolean
          date: string
          served: boolean
          serving: boolean
          updated_at: string
          visit_num: number
          visit_type: Database["public"]["Enums"]["allotment_type_enum"]
        }[]
      }
      get_audit_logs: {
        Args: { p_filters: Json; p_page?: number; p_page_size?: number }
        Returns: {
          action_type: string
          created_at: string
          entity_id: string
          entity_name: string
          id: string
          ip_address: string
          metadata: Json
          new_values: Json
          old_values: Json
          record_id: string
          session_id: string
          table_name: string
          user_agent: string
          user_id: string
          user_name: string
          user_role: string
        }[]
      }
      get_calendar: {
        Args: { end_date: string; start_date: string }
        Returns: {
          created_at: string
          created_by: string
          entry_type: string
          id: string
          location: string
          notes: string
          scheduled_at: string
          status: string
          subject: string
        }[]
      }
      get_contact_duplicates: {
        Args: {
          p_email: string
          p_exact: boolean
          p_name: string
          p_phone: string
          p_postcode: string
          p_street_address: string
        }
        Returns: {
          created_at: string
          email: string
          id: string
          name: string
          notes: string
          owner_id: string
          phone: string
          postcode: string
          region_id: string
          status: string
          street_address: string
          user_id: string
        }[]
      }
      get_contact_notes: {
        Args: { p_contact_id: string }
        Returns: {
          created_at: string
          created_by: string
          creator_name: string
          note_id: string
          note_text: string
        }[]
      }
      get_contacts: {
        Args: { p_order_desc?: boolean }
        Returns: {
          adults: number
          allergies: boolean
          children_gt16: number
          children_lt16: number
          created_at: string
          email: string
          hallal: boolean
          id: string
          infant: boolean
          name: string
          notes: string
          owner_id: string
          phone: string
          postcode: string
          region_id: string
          status: string
          street_address: string
          user_id: string
          vegetarian: boolean
        }[]
      }
      get_contacts_queue: {
        Args: { p_order_desc?: boolean }
        Returns: {
          adults: number
          allergies: boolean
          attended_at: string
          children_gt16: number
          children_lt16: number
          created_at: string
          email: string
          hallal: boolean
          id: string
          infant: boolean
          name: string
          notes: string
          owner_id: string
          phone: string
          postcode: string
          region_id: string
          status: string
          street_address: string
          user_id: string
          vegetarian: boolean
        }[]
      }
      get_division_settings: {
        Args: { p_division_id: string }
        Returns: {
          division_id: string
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }[]
      }
      get_division_summary: {
        Args: { p_entity_id?: string }
        Returns: {
          beneficiaries: number
          id: string
          name: string
          pending_beneficiaries: number
          referrers: number
          workforce: number
        }[]
      }
      get_divisions_by_entity: {
        Args: { p_entity_id?: string }
        Returns: {
          created_at: string
          entity_id: string
          head_id: string
          id: string
          manager_id: string
          name: string
          region_id: string
        }[]
      }
      get_entities: {
        Args: never
        Returns: {
          code: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          is_referrer: boolean
          name: string
          updated_at: string
        }[]
      }
      get_entity_settings: {
        Args: { p_entity_id: string }
        Returns: {
          division_id: string
          entity_id: string
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }[]
      }
      get_manager_by_division: {
        Args: { p_division_id: string }
        Returns: string
      }
      get_my_profile: {
        Args: never
        Returns: {
          division_id: string
          entity_id: string
          role: string
        }[]
      }
      get_organisations: {
        Args: { p_region_id: string }
        Returns: {
          address: Json
          approval_status: string
          created_by: string
          email: string
          id: string
          is_active: boolean
          name: string
          notes: string
          org_type: Database["public"]["Enums"]["org_type_enum"]
          phone: string
          region_id: string
          service: string
          website: string
        }[]
      }
      get_profile_names: {
        Args: never
        Returns: {
          full_name: string
          user_id: string
        }[]
      }
      get_regions: {
        Args: never
        Returns: {
          code: string
          id: string
          is_active: boolean
          name: string
        }[]
      }
      get_system_settings: {
        Args: never
        Returns: {
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
          updated_by: string
        }[]
      }
      get_tasks: {
        Args: never
        Returns: {
          beneficiary_id: string
          beneficiary_name: string
          created_at: string
          created_by: string
          entry_type: string
          id: string
          notes: string
          pic_id: string
          pic_name: string
          scheduled_at: string
          status: string
        }[]
      }
      get_user_notifications: {
        Args: { p_include_read?: boolean }
        Returns: {
          created_at: string
          id: string
          is_read: boolean
          link: string
          message: string
          meta: Json
          org_role: string
          title: string
          type: Database["public"]["Enums"]["notification_type_enum"]
        }[]
      }
      get_user_settings: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
          user_id: string
        }[]
      }
      get_users_with_profiles: {
        Args: { p_query?: string; p_role?: string }
        Returns: {
          division_id: string
          email: string
          entity_id: string
          full_name: string
          id: string
          manager_id: string
          region_id: string
          role: string
          status: string
        }[]
      }
      insert_allotment_discretionary: {
        Args: {
          p_contact_id?: string
          p_date?: string
          p_note?: string
          p_type?: Database["public"]["Enums"]["allotment_type_enum"]
          p_user_id?: string
        }
        Returns: string
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_new_values?: Json
          p_old_values?: Json
          p_record_id: string
          p_table_name: string
        }
        Returns: string
      }
      mark_all_notifications_read: { Args: never; Returns: undefined }
      mark_allotment_attendance: { Args: { p_id: string }; Returns: undefined }
      mark_allotment_served: { Args: { p_id: string }; Returns: undefined }
      mark_allotment_serving: { Args: { p_id: string }; Returns: undefined }
      mark_notification_read: { Args: { p_id: string }; Returns: undefined }
      mark_notifications_read_by_type: {
        Args: {
          p_org_role?: string
          p_type: Database["public"]["Enums"]["notification_type_enum"]
        }
        Returns: undefined
      }
      merge_contacts: {
        Args: { p_primary: string; p_secondary: string }
        Returns: undefined
      }
      toggle_allotment_serving: { Args: { p_id: string }; Returns: undefined }
      update_calendar: {
        Args: {
          p_beneficiary_id: string
          p_entry_type: string
          p_id: string
          p_location: string
          p_notes: string
          p_pic_id: string
          p_scheduled_at: string
          p_status: string
          p_subject: string
        }
        Returns: undefined
      }
      update_calendar_status: {
        Args: { p_id: string; p_status: string }
        Returns: undefined
      }
      update_contact: {
        Args: {
          p_address?: string
          p_adults?: number
          p_allergies?: boolean
          p_children_gt16?: number
          p_children_lt16?: number
          p_email?: string
          p_hallal?: boolean
          p_id?: string
          p_infant?: boolean
          p_name?: string
          p_notes?: string
          p_owner_id?: string
          p_phone?: string
          p_postcode?: string
          p_region_id?: string
          p_status?: Database["public"]["Enums"]["beneficiary_enum"]
          p_user_id?: string
          p_vegetarian?: boolean
        }
        Returns: Json
      }
      update_division: {
        Args: {
          p_entity_id: string
          p_head_id?: string
          p_id: string
          p_name: string
        }
        Returns: undefined
      }
      update_region: {
        Args: {
          p_code: string
          p_id: string
          p_is_active: boolean
          p_name: string
        }
        Returns: undefined
      }
      upsert_division_setting: {
        Args: {
          p_division_id: string
          p_setting_key: string
          p_setting_value: string
        }
        Returns: undefined
      }
      upsert_entity_setting: {
        Args: {
          p_entity_id: string
          p_setting_key: string
          p_setting_value: string
        }
        Returns: undefined
      }
      upsert_system_setting: {
        Args: { p_setting_key: string; p_setting_value: string }
        Returns: undefined
      }
      upsert_user_setting: {
        Args: {
          p_setting_key: string
          p_setting_value: string
          p_user_id: string
        }
        Returns: undefined
      }
      user_get_profile: { Args: never; Returns: Record<string, unknown> }
      user_update_profile: {
        Args: { p_full_name: string; p_phone: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      allotment_type_enum: "referral" | "drop_in"
      beneficiary_enum: "pending" | "active" | "inactive" | "banned" | "merged"
      notification_type_enum:
        | "alert"
        | "dm"
        | "task"
        | "calendar"
        | "referral"
        | "ref_decision"
        | "system"
      org_type_enum: "government" | "ngo" | "faith_based"
      role_enum:
        | "admin"
        | "head"
        | "manager"
        | "referrer"
        | "branch_manager"
        | "staff"
        | "volunteer"
        | "pending"
      user_status_enum: "active" | "inactive" | "suspended"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      allotment_type_enum: ["referral", "drop_in"],
      beneficiary_enum: ["pending", "active", "inactive", "banned", "merged"],
      notification_type_enum: [
        "alert",
        "dm",
        "task",
        "calendar",
        "referral",
        "ref_decision",
        "system",
      ],
      org_type_enum: ["government", "ngo", "faith_based"],
      role_enum: [
        "admin",
        "head",
        "manager",
        "referrer",
        "branch_manager",
        "staff",
        "volunteer",
        "pending",
      ],
      user_status_enum: ["active", "inactive", "suspended"],
    },
  },
} as const

