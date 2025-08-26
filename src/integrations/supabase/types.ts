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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      delivery_partners: {
        Row: {
          capacity: number | null
          created_at: string
          current_lat: number | null
          current_lng: number | null
          email: string | null
          id: string
          name: string
          org_id: string
          phone: string | null
          shift_end: string | null
          shift_start: string | null
          status: string | null
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          email?: string | null
          id?: string
          name: string
          org_id: string
          phone?: string | null
          shift_end?: string | null
          shift_start?: string | null
          status?: string | null
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          email?: string | null
          id?: string
          name?: string
          org_id?: string
          phone?: string | null
          shift_end?: string | null
          shift_start?: string | null
          status?: string | null
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_partners_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_assignments: {
        Row: {
          created_at: string
          estimated_distance: number | null
          estimated_duration: number | null
          id: string
          job_id: string
          order_id: string
          partner_id: string
          sequence_order: number
        }
        Insert: {
          created_at?: string
          estimated_distance?: number | null
          estimated_duration?: number | null
          id?: string
          job_id: string
          order_id: string
          partner_id: string
          sequence_order: number
        }
        Update: {
          created_at?: string
          estimated_distance?: number | null
          estimated_duration?: number | null
          id?: string
          job_id?: string
          order_id?: string
          partner_id?: string
          sequence_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "delivery_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          assigned_partners: number | null
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          name: string
          optimization_type: string | null
          org_id: string
          status: string | null
          total_orders: number | null
          updated_at: string
        }
        Insert: {
          assigned_partners?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name: string
          optimization_type?: string | null
          org_id: string
          status?: string | null
          total_orders?: number | null
          updated_at?: string
        }
        Update: {
          assigned_partners?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          optimization_type?: string | null
          org_id?: string
          status?: string | null
          total_orders?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          drop_lat: number
          drop_lng: number
          drop_name: string
          external_id: string
          id: string
          job_id: string | null
          org_id: string
          pickup_lat: number
          pickup_lng: number
          pickup_name: string
          priority: number | null
          service_minutes: number | null
          status: string | null
          tw_end: string | null
          tw_start: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          drop_lat: number
          drop_lng: number
          drop_name: string
          external_id: string
          id?: string
          job_id?: string | null
          org_id: string
          pickup_lat: number
          pickup_lng: number
          pickup_name: string
          priority?: number | null
          service_minutes?: number | null
          status?: string | null
          tw_end?: string | null
          tw_start?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          drop_lat?: number
          drop_lng?: number
          drop_name?: string
          external_id?: string
          id?: string
          job_id?: string | null
          org_id?: string
          pickup_lat?: number
          pickup_lng?: number
          pickup_name?: string
          priority?: number | null
          service_minutes?: number | null
          status?: string | null
          tw_end?: string | null
          tw_start?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
