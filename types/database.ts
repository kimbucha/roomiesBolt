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
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          match_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          match_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      health_check: {
        Row: {
          checked_at: string | null
          id: number
          status: string
        }
        Insert: {
          checked_at?: string | null
          id?: number
          status?: string
        }
        Update: {
          checked_at?: string | null
          id?: number
          status?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          has_read: boolean | null
          id: string
          status: string
          updated_at: string | null
          user1_action: string | null
          user1_id: string
          user2_action: string | null
          user2_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          has_read?: boolean | null
          id: string
          status: string
          updated_at?: string | null
          user1_action?: string | null
          user1_id: string
          user2_action?: string | null
          user2_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          has_read?: boolean | null
          id?: string
          status?: string
          updated_at?: string | null
          user1_action?: string | null
          user1_id?: string
          user2_action?: string | null
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      roommate_profiles: {
        Row: {
          address: string | null
          age: number | null
          amenities: string[] | null
          bathrooms: number | null
          bedrooms: number | null
          bio: string | null
          budget: Json | null
          compatibility_score: number | null
          created_at: string | null
          date_of_birth: string | null
          description: string | null
          flexible_stay: boolean | null
          gender: string | null
          has_place: boolean | null
          id: string
          is_furnished: boolean | null
          lease_duration: string | null
          lease_type: string | null
          lifestyle_preferences: Json | null
          location: Json | null
          major: string | null
          monthly_rent: string | null
          move_in_date: string | null
          neighborhood: string | null
          personal_preferences: Json | null
          personality_dimensions: Json | null
          personality_traits: string[] | null
          personality_type: string | null
          pet_policy: string | null
          place_details: Json | null
          room_photos: string[] | null
          room_type: string | null
          social_media: Json | null
          sublet_allowed: boolean | null
          traits: string[] | null
          university: string | null
          updated_at: string | null
          user_id: string
          user_role: string | null
          utilities_included: string[] | null
          year: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          bio?: string | null
          budget?: Json | null
          compatibility_score?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          description?: string | null
          flexible_stay?: boolean | null
          gender?: string | null
          has_place?: boolean | null
          id?: string
          is_furnished?: boolean | null
          lease_duration?: string | null
          lease_type?: string | null
          lifestyle_preferences?: Json | null
          location?: Json | null
          major?: string | null
          monthly_rent?: string | null
          move_in_date?: string | null
          neighborhood?: string | null
          personal_preferences?: Json | null
          personality_dimensions?: Json | null
          personality_traits?: string[] | null
          personality_type?: string | null
          pet_policy?: string | null
          place_details?: Json | null
          room_photos?: string[] | null
          room_type?: string | null
          social_media?: Json | null
          sublet_allowed?: boolean | null
          traits?: string[] | null
          university?: string | null
          updated_at?: string | null
          user_id: string
          user_role?: string | null
          utilities_included?: string[] | null
          year?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          bio?: string | null
          budget?: Json | null
          compatibility_score?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          description?: string | null
          flexible_stay?: boolean | null
          gender?: string | null
          has_place?: boolean | null
          id?: string
          is_furnished?: boolean | null
          lease_duration?: string | null
          lease_type?: string | null
          lifestyle_preferences?: Json | null
          location?: Json | null
          major?: string | null
          monthly_rent?: string | null
          move_in_date?: string | null
          neighborhood?: string | null
          personal_preferences?: Json | null
          personality_dimensions?: Json | null
          personality_traits?: string[] | null
          personality_type?: string | null
          pet_policy?: string | null
          place_details?: Json | null
          room_photos?: string[] | null
          room_type?: string | null
          social_media?: Json | null
          sublet_allowed?: boolean | null
          traits?: string[] | null
          university?: string | null
          updated_at?: string | null
          user_id?: string
          user_role?: string | null
          utilities_included?: string[] | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roommate_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_places: {
        Row: {
          created_at: string | null
          id: string
          is_priority: boolean | null
          place_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_priority?: boolean | null
          place_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_priority?: boolean | null
          place_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "roommate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_places_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          action: string
          created_at: string | null
          id: string
          target_user_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          target_user_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          target_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          additional_photos: Json | null
          budget_max: number | null
          budget_min: number | null
          company: string | null
          completed_steps: string[] | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          email_verified: boolean | null
          gender: string | null
          housing_goals: Json | null
          id: string
          is_premium: boolean | null
          is_verified: boolean | null
          lifestyle_answers: Json | null
          lifestyle_preferences: Json | null
          location: Json | null
          major: string | null
          move_in_timeframe: string | null
          name: string
          onboarding_completed: boolean | null
          personality_dimensions: Json | null
          personality_traits: string[] | null
          personality_type: string | null
          preferred_locations: Json | null
          profile_image_url: string | null
          profile_strength: number | null
          role: string | null
          roommate_preferences: Json | null
          university: string | null
          updated_at: string | null
          year: string | null
        }
        Insert: {
          additional_photos?: Json | null
          budget_max?: number | null
          budget_min?: number | null
          company?: string | null
          completed_steps?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          email_verified?: boolean | null
          gender?: string | null
          housing_goals?: Json | null
          id: string
          is_premium?: boolean | null
          is_verified?: boolean | null
          lifestyle_answers?: Json | null
          lifestyle_preferences?: Json | null
          location?: Json | null
          major?: string | null
          move_in_timeframe?: string | null
          name: string
          onboarding_completed?: boolean | null
          personality_dimensions?: Json | null
          personality_traits?: string[] | null
          personality_type?: string | null
          preferred_locations?: Json | null
          profile_image_url?: string | null
          profile_strength?: number | null
          role?: string | null
          roommate_preferences?: Json | null
          university?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          additional_photos?: Json | null
          budget_max?: number | null
          budget_min?: number | null
          company?: string | null
          completed_steps?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          email_verified?: boolean | null
          gender?: string | null
          housing_goals?: Json | null
          id?: string
          is_premium?: boolean | null
          is_verified?: boolean | null
          lifestyle_answers?: Json | null
          lifestyle_preferences?: Json | null
          location?: Json | null
          major?: string | null
          move_in_timeframe?: string | null
          name?: string
          onboarding_completed?: boolean | null
          personality_dimensions?: Json | null
          personality_traits?: string[] | null
          personality_type?: string | null
          preferred_locations?: Json | null
          profile_image_url?: string | null
          profile_strength?: number | null
          role?: string | null
          roommate_preferences?: Json | null
          university?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_all_existing_emails: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_user_profile: {
        Args: {
          user_id: string
          user_email: string
          user_name: string
          is_user_premium?: boolean
          is_user_verified?: boolean
          is_onboarding_completed?: boolean
        }
        Returns: boolean
      }
      get_full_user_profile: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          email: string
          name: string
          is_premium: boolean
          is_verified: boolean
          profile_image_url: string
          onboarding_completed: boolean
          created_at: string
          updated_at: string
          budget_min: number
          budget_max: number
          preferred_locations: Json
          location: Json
          lifestyle_preferences: Json
          lifestyle_answers: Json
          personality_type: string
          personality_dimensions: Json
          housing_goals: Json
          move_in_timeframe: string
          gender: string
          roommate_preferences: Json
          additional_photos: Json
          date_of_birth: string
          completed_steps: string[]
          profile_strength: number
          roommate_profile_id: string
          age: number
          university: string
          major: string
          year: string
          bio: string
          budget: Json
          roommate_location: Json
          neighborhood: string
          room_photos: string[]
          traits: string[]
          compatibility_score: number
          has_place: boolean
          room_type: string
          amenities: string[]
          bedrooms: number
          bathrooms: number
          is_furnished: boolean
          lease_duration: string
          move_in_date: string
          flexible_stay: boolean
          lease_type: string
          utilities_included: string[]
          pet_policy: string
          sublet_allowed: boolean
          roommate_gender: string
          roommate_date_of_birth: string
          user_role: string
          personality_traits: string[]
          roommate_personality_type: string
          roommate_personality_dimensions: Json
          social_media: Json
          roommate_lifestyle_preferences: Json
          personal_preferences: Json
          description: string
          address: string
          monthly_rent: string
          place_details: Json
        }[]
      }
      get_matches_with_profiles: {
        Args: { user_id: string }
        Returns: Json
      }
      get_unread_message_count: {
        Args: { user_id: string }
        Returns: number
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
