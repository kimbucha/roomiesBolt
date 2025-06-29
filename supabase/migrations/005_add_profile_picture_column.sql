-- Migration: Add profile_picture column to users table
-- This column is expected by the onboarding system but was missing from the schema

-- Add the missing profile_picture column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_picture text;

-- Add comment for documentation
COMMENT ON COLUMN public.users.profile_picture IS 'Profile picture identifier (can be URL, local identifier like local://potato.png, or personality_image)';

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_users_profile_picture ON public.users(profile_picture);

-- Migration complete
SELECT 'Added profile_picture column to users table' as migration_status; 