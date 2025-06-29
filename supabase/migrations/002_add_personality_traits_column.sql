-- Migration: Add personality_traits column to users table
-- This column stores the array of personality traits from the about-you onboarding step

-- Add personality_traits column as text array
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS personality_traits text[];

-- Add comment for documentation
COMMENT ON COLUMN public.users.personality_traits IS 'Array of personality traits selected during onboarding (e.g., studious, creative, etc.)';

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_users_personality_traits_gin ON public.users USING gin(personality_traits); 