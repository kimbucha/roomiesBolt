-- Comprehensive SQL script to fully clean up the problematic user
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/hybyjgpcbcqpndxrquqv/sql)

-- First, check if the user exists in auth.users
SELECT id, email, created_at, last_sign_in_at, confirmation_sent_at
FROM auth.users
WHERE email = 't@roomies.com';

-- Check for any identities linked to this user
SELECT *
FROM auth.identities
WHERE email = 't@roomies.com';

-- Check for any refresh tokens
SELECT *
FROM auth.refresh_tokens rt
JOIN auth.users u ON rt.user_id = u.id
WHERE u.email = 't@roomies.com';

-- Check for any sessions
SELECT *
FROM auth.sessions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 't@roomies.com';

-- Check if the user exists in the public.users table
SELECT *
FROM public.users
WHERE email = 't@roomies.com';

-- Now perform the cleanup (uncomment and run these after confirming the user exists)

-- 1. Delete from auth.sessions
DELETE FROM auth.sessions s
USING auth.users u
WHERE s.user_id = u.id AND u.email = 't@roomies.com';

-- 2. Delete from auth.refresh_tokens
DELETE FROM auth.refresh_tokens rt
USING auth.users u
WHERE rt.user_id = u.id AND u.email = 't@roomies.com';

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