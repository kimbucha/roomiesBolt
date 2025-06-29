-- SQL script to delete the problematic user from Supabase Auth
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/hybyjgpcbcqpndxrquqv/sql)

-- First, verify the user exists and get its ID
SELECT id, email, created_at
FROM auth.users
WHERE email = 't@roomies.com';

-- Then delete the user (uncomment and run after confirming the user ID)
DELETE FROM auth.users
WHERE email = 't@roomies.com';

-- Verify the user is deleted
SELECT id, email, created_at
FROM auth.users
WHERE email = 't@roomies.com'; 