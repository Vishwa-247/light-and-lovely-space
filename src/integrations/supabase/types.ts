export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      courses: {
        Row: {
          content: Json | null
          created_at: string
          difficulty: string
          id: string
          purpose: string
          summary: string
          title: string
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          difficulty: string
          id?: string
          purpose: string
          summary: string
          title: string
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          difficulty?: string
          id?: string
          purpose?: string
          summary?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      interview_analysis: {
        Row: {
          created_at: string
          facial_data: Json | null
          id: string
          interview_id: string
          language_feedback: string | null
          pronunciation_feedback: string | null
          recommendations: Json | null
          technical_feedback: string | null
        }
        Insert: {
          created_at?: string
          facial_data?: Json | null
          id?: string
          interview_id: string
          language_feedback?: string | null
          pronunciation_feedback?: string | null
          recommendations?: Json | null
          technical_feedback?: string | null
        }
        Update: {
          created_at?: string
          facial_data?: Json | null
          id?: string
          interview_id?: string
          language_feedback?: string | null
          pronunciation_feedback?: string | null
          recommendations?: Json | null
          technical_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_analysis_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "mock_interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          created_at: string
          id: string
          interview_id: string
          order_number: number
          question: string
          user_answer: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          interview_id: string
          order_number: number
          question: string
          user_answer?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interview_id?: string
          order_number?: number
          question?: string
          user_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "mock_interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_interviews: {
        Row: {
          completed: boolean | null
          created_at: string
          experience: string
          id: string
          job_role: string
          tech_stack: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          experience: string
          id?: string
          job_role: string
          tech_stack: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          experience?: string
          id?: string
          job_role?: string
          tech_stack?: string
          user_id?: string
        }
        Relationships: []
      }
      study_material: {
        Row: {
          course_id: string
          course_layout: Json | null
          course_type: string
          created_at: string
          created_by: string
          difficulty_level: string | null
          id: number
          status: string | null
          topic: string
        }
        Insert: {
          course_id: string
          course_layout?: Json | null
          course_type: string
          created_at?: string
          created_by: string
          difficulty_level?: string | null
          id?: number
          status?: string | null
          topic: string
        }
        Update: {
          course_id?: string
          course_layout?: Json | null
          course_type?: string
          created_at?: string
          created_by?: string
          difficulty_level?: string | null
          id?: number
          status?: string | null
          topic?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_member: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_member?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_member?: boolean | null
          name?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
