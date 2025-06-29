-- Migration: Add education columns to users table
-- These fields support education information in the profile/onboarding

-- Add education columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS university text,
ADD COLUMN IF NOT EXISTS major text,
ADD COLUMN IF NOT EXISTS year text;

-- Add comments for documentation
COMMENT ON COLUMN public.users.university IS 'University/College name where user studies';
COMMENT ON COLUMN public.users.major IS 'Field of study/major at university';
COMMENT ON COLUMN public.users.year IS 'Academic year (e.g., "1", "2", "3", "4", "Graduate")';

-- Add indexes for efficient searching/filtering
CREATE INDEX IF NOT EXISTS idx_users_university ON public.users(university);
CREATE INDEX IF NOT EXISTS idx_users_major ON public.users(major);
CREATE INDEX IF NOT EXISTS idx_users_year ON public.users(year); 