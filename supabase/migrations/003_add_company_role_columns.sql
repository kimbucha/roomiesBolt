-- Migration: Add company and role columns to users table
-- These fields support the School/Job toggle functionality in the education section

-- Add company and role columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS role text;

-- Add comments for documentation
COMMENT ON COLUMN public.users.company IS 'Company name where user works (alternative to university)';
COMMENT ON COLUMN public.users.role IS 'Job title/role at company (alternative to major)';

-- Add indexes for efficient searching/filtering
CREATE INDEX IF NOT EXISTS idx_users_company ON public.users(company);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role); 