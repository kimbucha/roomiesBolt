-- Migration: Add missing columns to users table for onboarding data
-- This migration adds all the columns that the onboarding flow expects

-- Add missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS budget_min integer,
ADD COLUMN IF NOT EXISTS budget_max integer,
ADD COLUMN IF NOT EXISTS preferred_locations jsonb,
ADD COLUMN IF NOT EXISTS location jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_preferences jsonb,
ADD COLUMN IF NOT EXISTS lifestyle_answers jsonb,
ADD COLUMN IF NOT EXISTS personality_type text,
ADD COLUMN IF NOT EXISTS personality_dimensions jsonb,
ADD COLUMN IF NOT EXISTS housing_goals jsonb,
ADD COLUMN IF NOT EXISTS move_in_timeframe text,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS roommate_preferences jsonb,
ADD COLUMN IF NOT EXISTS additional_photos jsonb,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS completed_steps text[],
ADD COLUMN IF NOT EXISTS profile_strength integer DEFAULT 0;

-- Add indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_users_budget_min ON public.users(budget_min);
CREATE INDEX IF NOT EXISTS idx_users_budget_max ON public.users(budget_max);
CREATE INDEX IF NOT EXISTS idx_users_personality_type ON public.users(personality_type);
CREATE INDEX IF NOT EXISTS idx_users_gender ON public.users(gender);
CREATE INDEX IF NOT EXISTS idx_users_profile_strength ON public.users(profile_strength);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON public.users(onboarding_completed);

-- Add GIN indexes for JSONB columns for efficient querying
CREATE INDEX IF NOT EXISTS idx_users_preferred_locations_gin ON public.users USING gin(preferred_locations);
CREATE INDEX IF NOT EXISTS idx_users_location_gin ON public.users USING gin(location);
CREATE INDEX IF NOT EXISTS idx_users_lifestyle_preferences_gin ON public.users USING gin(lifestyle_preferences);
CREATE INDEX IF NOT EXISTS idx_users_personality_dimensions_gin ON public.users USING gin(personality_dimensions);
CREATE INDEX IF NOT EXISTS idx_users_housing_goals_gin ON public.users USING gin(housing_goals);

-- Drop the existing function first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_full_user_profile(uuid);

-- Create the updated get_full_user_profile function to include new columns
CREATE OR REPLACE FUNCTION get_full_user_profile(user_uuid uuid)
RETURNS TABLE (
  -- User basic info
  id uuid,
  email text,
  name text,
  is_premium boolean,
  is_verified boolean,
  profile_image_url text,
  onboarding_completed boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  
  -- New onboarding fields
  budget_min integer,
  budget_max integer,
  preferred_locations jsonb,
  location jsonb,
  lifestyle_preferences jsonb,
  lifestyle_answers jsonb,
  personality_type text,
  personality_dimensions jsonb,
  housing_goals jsonb,
  move_in_timeframe text,
  gender text,
  roommate_preferences jsonb,
  additional_photos jsonb,
  date_of_birth date,
  completed_steps text[],
  profile_strength integer,
  
  -- Roommate profile info
  roommate_profile_id uuid,
  age integer,
  university text,
  major text,
  year text,
  bio text,
  budget jsonb,
  roommate_location jsonb,
  neighborhood text,
  room_photos text[],
  traits text[],
  compatibility_score numeric,
  has_place boolean,
  room_type text,
  amenities text[],
  bedrooms integer,
  bathrooms numeric,
  is_furnished boolean,
  lease_duration text,
  move_in_date date,
  flexible_stay boolean,
  lease_type text,
  utilities_included text[],
  pet_policy text,
  sublet_allowed boolean,
  roommate_gender text,
  roommate_date_of_birth date,
  user_role text,
  personality_traits text[],
  roommate_personality_type text,
  roommate_personality_dimensions jsonb,
  social_media jsonb,
  roommate_lifestyle_preferences jsonb,
  personal_preferences jsonb,
  description text,
  address text,
  monthly_rent text,
  place_details jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- User basic info
    u.id,
    u.email,
    u.name,
    u.is_premium,
    u.is_verified,
    u.profile_image_url,
    u.onboarding_completed,
    u.created_at,
    u.updated_at,
    
    -- New onboarding fields
    u.budget_min,
    u.budget_max,
    u.preferred_locations,
    u.location,
    u.lifestyle_preferences,
    u.lifestyle_answers,
    u.personality_type,
    u.personality_dimensions,
    u.housing_goals,
    u.move_in_timeframe,
    u.gender,
    u.roommate_preferences,
    u.additional_photos,
    u.date_of_birth,
    u.completed_steps,
    u.profile_strength,
    
    -- Roommate profile info
    rp.id as roommate_profile_id,
    rp.age,
    rp.university,
    rp.major,
    rp.year,
    rp.bio,
    rp.budget,
    rp.location as roommate_location,
    rp.neighborhood,
    rp.room_photos,
    rp.traits,
    rp.compatibility_score,
    rp.has_place,
    rp.room_type,
    rp.amenities,
    rp.bedrooms,
    rp.bathrooms,
    rp.is_furnished,
    rp.lease_duration,
    rp.move_in_date,
    rp.flexible_stay,
    rp.lease_type,
    rp.utilities_included,
    rp.pet_policy,
    rp.sublet_allowed,
    rp.gender as roommate_gender,
    rp.date_of_birth as roommate_date_of_birth,
    rp.user_role,
    rp.personality_traits,
    rp.personality_type as roommate_personality_type,
    rp.personality_dimensions as roommate_personality_dimensions,
    rp.social_media,
    rp.lifestyle_preferences as roommate_lifestyle_preferences,
    rp.personal_preferences,
    rp.description,
    rp.address,
    rp.monthly_rent,
    rp.place_details
  FROM public.users u
  LEFT JOIN public.roommate_profiles rp ON u.id = rp.user_id
  WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON COLUMN public.users.budget_min IS 'Minimum budget for housing in dollars';
COMMENT ON COLUMN public.users.budget_max IS 'Maximum budget for housing in dollars';
COMMENT ON COLUMN public.users.preferred_locations IS 'Array of preferred location objects with lat/lng, address, radius';
COMMENT ON COLUMN public.users.location IS 'Primary location object with lat/lng, address, city, state';
COMMENT ON COLUMN public.users.lifestyle_preferences IS 'Lifestyle preferences from onboarding quiz';
COMMENT ON COLUMN public.users.lifestyle_answers IS 'Raw answers from lifestyle questionnaire';
COMMENT ON COLUMN public.users.personality_type IS 'MBTI personality type (e.g., INFP)';
COMMENT ON COLUMN public.users.personality_dimensions IS 'Personality dimension scores (ei, sn, tf, jp)';
COMMENT ON COLUMN public.users.housing_goals IS 'Housing goals and user role preferences';
COMMENT ON COLUMN public.users.move_in_timeframe IS 'Preferred move-in timeframe';
COMMENT ON COLUMN public.users.gender IS 'User gender identity';
COMMENT ON COLUMN public.users.roommate_preferences IS 'Preferences for potential roommates';
COMMENT ON COLUMN public.users.additional_photos IS 'Array of additional profile photos';
COMMENT ON COLUMN public.users.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN public.users.completed_steps IS 'Array of completed onboarding steps';
COMMENT ON COLUMN public.users.profile_strength IS 'Profile completion percentage (0-100)'; 