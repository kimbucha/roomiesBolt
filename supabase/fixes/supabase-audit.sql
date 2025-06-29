-- Roomies Database Audit Script
-- Run this in Supabase SQL Editor to assess current state

-- =============================================================================
-- TABLE COUNTS AND HEALTH CHECK
-- =============================================================================
SELECT 
  'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'swipes', COUNT(*) FROM swipes  
UNION ALL
SELECT 'matches', COUNT(*) FROM matches
UNION ALL  
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
ORDER BY table_name;

-- =============================================================================
-- PLACEHOLDER ID DETECTION
-- =============================================================================
SELECT 'PLACEHOLDER_ANALYSIS' as section, '' as details
UNION ALL
SELECT 'matches_with_placeholders' as issue, COUNT(*)::text as count
FROM matches 
WHERE user1_id ILIKE '%currentuser%' OR user2_id ILIKE '%currentuser%'
UNION ALL
SELECT 'swipes_with_placeholders', COUNT(*)::text
FROM swipes 
WHERE swiper_id ILIKE '%currentuser%' OR swipee_id ILIKE '%currentuser%'
UNION ALL
SELECT 'conversations_with_placeholders', COUNT(*)::text
FROM conversations 
WHERE participants::text ILIKE '%currentuser%';

-- =============================================================================
-- ORPHANED RECORDS DETECTION
-- =============================================================================
SELECT 'ORPHAN_ANALYSIS' as section, '' as details
UNION ALL
SELECT 'orphaned_conversations' as issue, COUNT(*)::text as count
FROM conversations c 
LEFT JOIN matches m ON m.conversation_id = c.id 
WHERE m.conversation_id IS NULL
UNION ALL
SELECT 'orphaned_messages', COUNT(*)::text
FROM messages m 
LEFT JOIN conversations c ON c.id = m.conversation_id 
WHERE c.id IS NULL;

-- =============================================================================
-- AUTH VS PROFILE LINKING
-- =============================================================================
SELECT 'AUTH_PROFILE_ANALYSIS' as section, '' as details
UNION ALL
SELECT 'users_without_profiles' as issue, COUNT(*)::text as count
FROM auth.users u 
LEFT JOIN profiles p ON p.id = u.id 
WHERE p.id IS NULL;

-- =============================================================================
-- SAMPLE DATA INSPECTION
-- =============================================================================
SELECT 'SAMPLE_DATA' as section, '' as details
UNION ALL
SELECT 'sample_matches', 
       CONCAT('user1_id: ', user1_id, ', user2_id: ', user2_id, ', conv_id: ', COALESCE(conversation_id, 'NULL'))
FROM matches 
LIMIT 3
UNION ALL
SELECT 'sample_conversations',
       CONCAT('id: ', id, ', participants: ', participants::text)
FROM conversations
LIMIT 3;

-- =============================================================================
-- FOREIGN KEY CONSTRAINTS CHECK
-- =============================================================================
SELECT 'CONSTRAINT_ANALYSIS' as section, '' as details
UNION ALL
SELECT 'existing_foreign_keys', 
       CONCAT(tc.table_name, '.', kcu.column_name, ' -> ', ccu.table_name, '.', ccu.column_name)
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('matches', 'conversations', 'messages', 'swipes');

-- =============================================================================
-- INDEX ANALYSIS
-- =============================================================================
SELECT 'INDEX_ANALYSIS' as section, '' as details
UNION ALL
SELECT 'existing_indexes',
       CONCAT(schemaname, '.', tablename, '.', indexname)
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('matches', 'conversations', 'messages', 'swipes')
ORDER BY tablename, indexname; 