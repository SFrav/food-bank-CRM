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
        ]
      }
      contacts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string | null
          phone: string | null
          postcode: string | null
          status: Database["public"]["Enums"]["beneficiary_enum"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          postcode?: string | null
          status?: Database["public"]["Enums"]["beneficiary_enum"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          postcode?: string | null
          status?: Database["public"]["Enums"]["beneficiary_enum"]
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
            referencedColumns: ["user_id"]
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
      notifications: {
        Row: {
          calendar_id: string | null
          created_at: string
          id: string
          link: string | null
          message: string
          meta: Json | null
          org_role: string | null
          title: string | null
          type: Database["public"]["Enums"]["notification_type_enum"]
        }
        Insert: {
          calendar_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message: string
          meta?: Json | null
          org_role?: string | null
          title?: string | null
          type: Database["public"]["Enums"]["notification_type_enum"]
        }
        Update: {
          calendar_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          meta?: Json | null
          org_role?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["notification_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_notifications_calendar"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "calendar"
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
            foreignKeyName: "notifications_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_notify_id_fk"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_notify_id_fk"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "user_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
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
          service?: string | null
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
      user_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_notifications: {
        Row: {
          created_at: string | null
          id: string | null
          is_read: boolean | null
          link: string | null
          message: string | null
          meta: Json | null
          org_role: string | null
          title: string | null
          type: Database["public"]["Enums"]["notification_type_enum"] | null
        }
        Relationships: []
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
      delete_calendar: { Args: { p_id: string }; Returns: undefined }
      delete_division: { Args: { p_id: string }; Returns: undefined }
      ensure_admin_profile: { Args: never; Returns: undefined }
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
      get_current_profile: {
        Args: never
        Returns: {
          division_id: string
          entity_id: string
          id: string
          role: Database["public"]["Enums"]["role_enum"]
          user_id: string
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
          name: string
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
      get_tasks: {
        Args: never
        Returns: {
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
      mark_notifications_read_by_type: {
        Args: {
          p_org_role?: string
          p_type: Database["public"]["Enums"]["notification_type_enum"]
        }
        Returns: undefined
      }
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
      update_division: {
        Args: {
          p_entity_id: string
          p_head_id?: string
          p_id: string
          p_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      beneficiary_enum: "pending" | "active" | "inactive" | "banned"
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
      beneficiary_enum: ["pending", "active", "inactive", "banned"],
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

