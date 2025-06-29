/**
 * User-related types for Roomies
 * 
 * Centralized type definitions to ensure consistency
 * across the unified store architecture.
 */

// Core user identifier type
export type UserId = string; // UUID from Supabase auth

// User profile from Supabase profiles table
export interface UserProfile {
  id: UserId;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'other';
  location?: string;
  university?: string;
  personality_type?: string;
  looking_for?: 'roommate' | 'place' | 'both';
  housing_status?: 'has_place' | 'needs_place' | 'flexible';
  budget_min?: number;
  budget_max?: number;
  move_in_date?: string;
  lease_length?: number;
  verified?: boolean;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

// Authenticated user from Supabase auth
export interface AuthUser {
  id: UserId;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
}

// Combined user data (auth + profile)
export interface User {
  id: UserId;
  email?: string;
  profile?: UserProfile;
  isAuthenticated: boolean;
}

// User preferences for matching
export interface UserPreferences {
  id: UserId;
  age_range_min: number;
  age_range_max: number;
  max_distance: number;
  gender_preference: 'male' | 'female' | 'any';
  lifestyle_preferences: {
    non_smoker?: boolean;
    pet_friendly?: boolean;
    quiet_hours?: boolean;
    social?: boolean;
  };
  housing_preferences: {
    room_type?: 'private' | 'shared' | 'any';
    furnished?: boolean;
    parking?: boolean;
    laundry?: boolean;
  };
  created_at: string;
  updated_at: string;
}

// User verification status
export interface UserVerification {
  id: UserId;
  email_verified: boolean;
  phone_verified: boolean;
  identity_verified: boolean;
  university_verified: boolean;
  background_check: boolean;
  created_at: string;
  updated_at: string;
}

// Helper type for user state in stores
export interface UserState {
  user: User | null;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  verification: UserVerification | null;
  loading: boolean;
  error: string | null;
} 