-- Fixed SQL script to clean up the problematic user
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/hybyjgpcbcqpndxrquqv/sql)

-- First, check if the user exists in auth.users
SELECT id, email, created_at, last_sign_in_at, confirmation_sent_at
FROM auth.users
WHERE email = 't@roomies.com';

-- Check for any identities linked to this user
SELECT *
FROM auth.identities
WHERE email = 't@roomies.com';

-- Get the user ID first (if it exists)
SELECT id 
FROM auth.users 
WHERE email = 't@roomies.com';

-- If you found a user ID above, replace 'user-id-here' with that ID in the queries below

-- Check for any refresh tokens (use the actual user ID)
SELECT * 
FROM auth.refresh_tokens 
WHERE user_id = 'user-id-here';

-- Check for any sessions (use the actual user ID)
SELECT * 
FROM auth.sessions 
WHERE user_id = 'user-id-here';

-- Check if the user exists in the public.users table
SELECT *
FROM public.users
WHERE email = 't@roomies.com';

-- Now perform the cleanup (uncomment and run these after confirming the user exists)

-- 1. Delete from auth.sessions (use the actual user ID)
DELETE FROM auth.sessions
WHERE user_id = 'user-id-here';

-- 2. Delete from auth.refresh_tokens (use the actual user ID)
DELETE FROM auth.refresh_tokens
WHERE user_id = 'user-id-here';

-- 3. Delete from auth.identities
DELETE FROM auth.identities
WHERE email = 't@roomies.com';

-- 4. Delete from public.users (if it exists)
DELETE FROM public.users
WHERE email = 't@roomies.com';

-- 5. Finally, delete from auth.users
DELETE FROM auth.users
WHERE email = 't@roomies.com';

-- Verify the user is completely removed
SELECT id, email FROM auth.users WHERE email = 't@roomies.com';
SELECT * FROM auth.identities WHERE email = 't@roomies.com';
SELECT * FROM public.users WHERE email = 't@roomies.com'; 