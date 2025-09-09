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
          org_id: string | null
          phone: string | null
          status: string
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
          org_id?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          vehicle_type?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          email?: string | null
          id?: string
          name?: string
          org_id?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      job_assignments: {
        Row: {
          actual_arrival: string | null
          created_at: string
          distance_km: number | null
          duration_minutes: number | null
          estimated_arrival: string | null
          id: string
          job_id: string
          order_id: string
          partner_id: string
          sequence: number
          status: string
          updated_at: string
        }
        Insert: {
          actual_arrival?: string | null
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          estimated_arrival?: string | null
          id?: string
          job_id: string
          order_id: string
          partner_id: string
          sequence: number
          status?: string
          updated_at?: string
        }
        Update: {
          actual_arrival?: string | null
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          estimated_arrival?: string | null
          id?: string
          job_id?: string
          order_id?: string
          partner_id?: string
          sequence?: number
          status?: string
          updated_at?: string
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
          actual_time: number | null
          assigned_partners: number | null
          completed_at: string | null
          cost_savings: number | null
          created_at: string
          estimated_time: number | null
          id: string
          name: string
          optimization_type: string
          org_id: string | null
          status: string
          total_distance: number | null
          total_orders: number | null
          updated_at: string
        }
        Insert: {
          actual_time?: number | null
          assigned_partners?: number | null
          completed_at?: string | null
          cost_savings?: number | null
          created_at?: string
          estimated_time?: number | null
          id?: string
          name: string
          optimization_type?: string
          org_id?: string | null
          status?: string
          total_distance?: number | null
          total_orders?: number | null
          updated_at?: string
        }
        Update: {
          actual_time?: number | null
          assigned_partners?: number | null
          completed_at?: string | null
          cost_savings?: number | null
          created_at?: string
          estimated_time?: number | null
          id?: string
          name?: string
          optimization_type?: string
          org_id?: string | null
          status?: string
          total_distance?: number | null
          total_orders?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string | null
          dimensions: string | null
          drop_address: string
          drop_lat: number | null
          drop_lng: number | null
          id: string
          order_number: string
          org_id: string | null
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          priority: number | null
          special_instructions: string | null
          status: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          dimensions?: string | null
          drop_address: string
          drop_lat?: number | null
          drop_lng?: number | null
          id?: string
          order_number: string
          org_id?: string | null
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          priority?: number | null
          special_instructions?: string | null
          status?: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          dimensions?: string | null
          drop_address?: string
          drop_lat?: number | null
          drop_lng?: number | null
          id?: string
          order_number?: string
          org_id?: string | null
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          priority?: number | null
          special_instructions?: string | null
          status?: string
          updated_at?: string
          weight?: number | null
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
