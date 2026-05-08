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
          changes: Json | null
          created_at: string | null
          id: string
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
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
      contacts: {
        Row: {
          company: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string | null
          id: string
          is_deleted: boolean | null
          name: string
          notes: string | null
          owner_id: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          id?: string
          is_deleted?: boolean | null
          name: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          id?: string
          is_deleted?: boolean | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      manager_team_members: {
        Row: {
          account_manager_id: string
          created_at: string
          manager_id: string
        }
        Insert: {
          account_manager_id: string
          created_at?: string
          manager_id: string
        }
        Update: {
          account_manager_id?: string
          created_at?: string
          manager_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_team_members_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_team_members_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          meta: Json | null
          org_role: string | null
          title: string | null
          type: Database["public"]["Enums"]["notification_type_enum"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          meta?: Json | null
          org_role?: string | null
          title?: string | null
          type: Database["public"]["Enums"]["notification_type_enum"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          meta?: Json | null
          org_role?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["notification_type_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      organization_contacts: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          is_primary: boolean
          mobile: string | null
          organization_id: string
          phone: string | null
          title: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          mobile?: string | null
          organization_id: string
          phone?: string | null
          title?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          mobile?: string | null
          organization_id?: string
          phone?: string | null
          title?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "organization_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_master_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_master_end_user"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          addresses: Json | null
          approval_status: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          industry: string | null
          is_active: boolean
          market_size: string | null
          name: string
          notes: string | null
          org_type: Database["public"]["Enums"]["org_type_enum"]
          phone: string | null
          tax_id: string | null
          type: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          addresses?: Json | null
          approval_status?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          market_size?: string | null
          name: string
          notes?: string | null
          org_type?: Database["public"]["Enums"]["org_type_enum"]
          phone?: string | null
          tax_id?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          addresses?: Json | null
          approval_status?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          market_size?: string | null
          name?: string
          notes?: string | null
          org_type?: Database["public"]["Enums"]["org_type_enum"]
          phone?: string | null
          tax_id?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
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
      sales_activities: {
        Row: {
          activity_type: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          due_at: string | null
          id: string
          notes: string | null
          pic_id: string | null
          scheduled_at: string | null
          status: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          notes?: string | null
          pic_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          notes?: string | null
          pic_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sales_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_master_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_master_end_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_activities_pic_id_fkey"
            columns: ["pic_id"]
            isOneToOne: false
            referencedRelation: "organization_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      titles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
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
          title_id: string | null
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
          title_id?: string | null
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
          title_id?: string | null
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
          {
            foreignKeyName: "user_profiles_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      activities: {
        Row: {
          activity_type: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          description: string | null
          due_at: string | null
          id: string | null
          notes: string | null
          scheduled_at: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          activity_type?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string | null
          notes?: string | null
          scheduled_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_type?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string | null
          notes?: string | null
          scheduled_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sales_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_master_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_master_end_user"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_activity: {
        Row: {
          activity_type: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          date: string | null
          id: string | null
          notes: string | null
          time: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_activities_created_by_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sales_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_master_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_master_end_user"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_activity_v2: {
        Row: {
          activity_type: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          customer_name: string | null
          description: string | null
          due_at: string | null
          id: string | null
          notes: string | null
          pic_id: string | null
          scheduled_at: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sales_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_master_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_master_end_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_activities_pic_id_fkey"
            columns: ["pic_id"]
            isOneToOne: false
            referencedRelation: "organization_contacts"
            referencedColumns: ["id"]
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
      v_master_customer: {
        Row: {
          created_at: string | null
          id: string | null
          industry: string | null
          is_active: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          industry?: string | null
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          industry?: string | null
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      v_master_end_user: {
        Row: {
          created_at: string | null
          id: string | null
          industry: string | null
          is_active: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          industry?: string | null
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          industry?: string | null
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _get_effective_user_profile: {
        Args: { p_user_id?: string }
        Returns: {
          division_id: string
          entity_id: string
          profile_id: string
          role: Database["public"]["Enums"]["role_enum"]
          user_id: string
        }[]
      }
      admin_create_entity: {
        Args: { p_code?: string; p_name: string }
        Returns: string
      }
      admin_delete_contact: { Args: { p_id: string }; Returns: Json }
      admin_delete_entity: { Args: { p_entity_id: string }; Returns: boolean }
      admin_delete_user: { Args: { p_id: string }; Returns: Json }
      admin_update_contact: {
        Args: {
          p_company: string
          p_email: string
          p_id: string
          p_name: string
          p_notes: string
          p_phone: string
        }
        Returns: Json
      }
      admin_update_entity: {
        Args: {
          p_code?: string
          p_entity_id: string
          p_is_active?: boolean
          p_name?: string
        }
        Returns: boolean
      }
      admin_update_profile: {
        Args: {
          p_division?: string
          p_id: string
          p_role: Database["public"]["Enums"]["role_enum"]
        }
        Returns: boolean
      }
      admin_update_user_profile: {
        Args: {
          p_division_id?: string
          p_entity_id?: string
          p_manager_id?: string
          p_profile_id: string
          p_role?: Database["public"]["Enums"]["role_enum"]
        }
        Returns: boolean
      }
      can_manage_contact: {
        Args: { target_owner_id: string }
        Returns: boolean
      }
      ensure_admin_profile: { Args: never; Returns: undefined }
      get_current_profile: {
        Args: never
        Returns: {
          division_id: string
          id: string
          role: Database["public"]["Enums"]["role_enum"]
          user_id: string
        }[]
      }
      get_head_manager_archived: {
        Args: { p_end_date?: string; p_period?: string; p_start_date?: string }
        Returns: {
          division_id: string
          entity_id: string
          manager_id: string
          manager_name: string
          margin: number
          project_count: number
          revenue: number
        }[]
      }
      get_manager_archived: {
        Args: {
          p_end_date?: string
          p_manager_id: string
          p_period?: string
          p_start_date?: string
        }
        Returns: {
          margin: number
          project_count: number
          revenue: number
        }[]
      }
      get_my_profile: {
        Args: never
        Returns: {
          division_id: string
          entity_id: string
          role: string
        }[]
      }
      get_my_role: { Args: never; Returns: string }
      get_users_with_profiles: {
        Args: { p_query?: string; p_role?: string }
        Returns: {
          division_id: string
          email: string
          entity_id: string
          full_name: string
          id: string
          role: string
          status: string
          title_id: string
        }[]
      }
      is_admin_or_head: { Args: never; Returns: boolean }
      log_audit_event: {
        Args: {
          p_action: string
          p_changes?: Json
          p_record_id: string
          p_table_name: string
        }
        Returns: string
      }
      mark_all_notifications_read: { Args: never; Returns: undefined }
      mark_notification_read: { Args: { p_id: string }; Returns: undefined }
    }
    Enums: {
      approval_status_enum: "pending" | "approved" | "rejected"
      notification_type_enum: "alert" | "target" | "task" | "ai" | "system"
      org_type_enum: "customer" | "end_user" | "partner" | "vendor"
      role_enum:
        | "admin"
        | "head"
        | "manager"
        | "account_manager"
        | "staff"
        | "sales"
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
      approval_status_enum: ["pending", "approved", "rejected"],
      notification_type_enum: ["alert", "target", "task", "ai", "system"],
      org_type_enum: ["customer", "end_user", "partner", "vendor"],
      role_enum: [
        "admin",
        "head",
        "manager",
        "account_manager",
        "staff",
        "sales",
        "pending",
      ],
      user_status_enum: ["active", "inactive", "suspended"],
    },
  },
} as const

