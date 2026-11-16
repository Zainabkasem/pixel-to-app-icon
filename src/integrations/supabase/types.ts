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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      physics_formulas: {
        Row: {
          chapter_number: number | null
          chapter_title: string
          context: string | null
          equation: string
          grade: string
          id: string
          name: string
          page_number: number | null
          sort_order: number
          source_url: string | null
          variables: string
          verification_status: string
        }
        Insert: {
          chapter_number?: number | null
          chapter_title: string
          context?: string | null
          equation: string
          grade: string
          id?: string
          name: string
          page_number?: number | null
          sort_order?: number
          source_url?: string | null
          variables: string
          verification_status?: string
        }
        Update: {
          chapter_number?: number | null
          chapter_title?: string
          context?: string | null
          equation?: string
          grade?: string
          id?: string
          name?: string
          page_number?: number | null
          sort_order?: number
          source_url?: string | null
          variables?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "physics_formulas_grade_fkey"
            columns: ["grade"]
            isOneToOne: false
            referencedRelation: "physics_textbooks"
            referencedColumns: ["grade"]
          },
        ]
      }
      physics_quizzes: {
        Row: {
          answers: Json
          created_at: string
          id: string
          level: string
          questions: Json
          result: Json | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          level: string
          questions: Json
          result?: Json | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          level?: string
          questions?: Json
          result?: Json | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      physics_textbooks: {
        Row: {
          edition_year: number
          grade: string
          reviewed_pages: number
          source_url: string | null
          title: string
          total_pages: number | null
          verification_status: string
        }
        Insert: {
          edition_year?: number
          grade: string
          reviewed_pages?: number
          source_url?: string | null
          title: string
          total_pages?: number | null
          verification_status?: string
        }
        Update: {
          edition_year?: number
          grade?: string
          reviewed_pages?: number
          source_url?: string | null
          title?: string
          total_pages?: number | null
          verification_status?: string
        }
        Relationships: []
      }
      study_progress: {
        Row: {
          badges: string[]
          focus_hours: number | null
          focus_started_at: string | null
          last_commit_at: string | null
          last_study_day: string | null
          stars: number
          streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          badges?: string[]
          focus_hours?: number | null
          focus_started_at?: string | null
          last_commit_at?: string | null
          last_study_day?: string | null
          stars?: number
          streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          badges?: string[]
          focus_hours?: number | null
          focus_started_at?: string | null
          last_commit_at?: string | null
          last_study_day?: string | null
          stars?: number
          streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_study_action: {
        Args: {
          p_action: string
          p_badge?: string
          p_hours?: number
          p_reward?: number
          p_user: string
        }
        Returns: {
          badges: string[]
          focus_hours: number | null
          focus_started_at: string | null
          last_commit_at: string | null
          last_study_day: string | null
          stars: number
          streak: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "study_progress"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      finish_physics_quiz: {
        Args: { p_id: string; p_result: Json; p_reward: number; p_user: string }
        Returns: {
          badges: string[]
          focus_hours: number | null
          focus_started_at: string | null
          last_commit_at: string | null
          last_study_day: string | null
          stars: number
          streak: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "study_progress"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
