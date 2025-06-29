-- Migration: Add Foreign Key Constraints
-- Created: 2025-01-07
-- Purpose: Enforce referential integrity between tables

-- =============================================================================
-- CONVERSATIONS TABLE FOREIGN KEYS
-- =============================================================================

-- Add foreign key from matches.conversation_id to conversations.id
-- This ensures that conversation_id in matches always points to a valid conversation
ALTER TABLE matches 
ADD CONSTRAINT fk_matches_conversation 
FOREIGN KEY (conversation_id) 
REFERENCES conversations(id) 
ON DELETE SET NULL;

-- =============================================================================
-- MESSAGES TABLE FOREIGN KEYS
-- =============================================================================

-- Add foreign key from messages.conversation_id to conversations.id
-- This ensures messages always belong to a valid conversation
-- ON DELETE CASCADE means if a conversation is deleted, all its messages are deleted too
ALTER TABLE messages 
ADD CONSTRAINT fk_messages_conversation 
FOREIGN KEY (conversation_id) 
REFERENCES conversations(id) 
ON DELETE CASCADE;

-- =============================================================================
-- MATCHES TABLE USER FOREIGN KEYS
-- =============================================================================

-- Add foreign key from matches.user1_id to profiles.id
-- This ensures user1_id always points to a valid profile
ALTER TABLE matches 
ADD CONSTRAINT fk_matches_user1 
FOREIGN KEY (user1_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Add foreign key from matches.user2_id to profiles.id
-- This ensures user2_id always points to a valid profile
ALTER TABLE matches 
ADD CONSTRAINT fk_matches_user2 
FOREIGN KEY (user2_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- =============================================================================
-- SWIPES TABLE FOREIGN KEYS
-- =============================================================================

-- Add foreign key from swipes.swiper_id to profiles.id
-- This ensures swiper_id always points to a valid profile
ALTER TABLE swipes 
ADD CONSTRAINT fk_swipes_swiper 
FOREIGN KEY (swiper_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Add foreign key from swipes.swipee_id to profiles.id
-- This ensures swipee_id always points to a valid profile
ALTER TABLE swipes 
ADD CONSTRAINT fk_swipes_swipee 
FOREIGN KEY (swipee_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- =============================================================================
-- MESSAGES TABLE SENDER FOREIGN KEY
-- =============================================================================

-- Add foreign key from messages.sender_id to profiles.id
-- This ensures sender_id always points to a valid profile
ALTER TABLE messages 
ADD CONSTRAINT fk_messages_sender 
FOREIGN KEY (sender_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Query to verify all foreign keys were created successfully
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('matches', 'conversations', 'messages', 'swipes')
ORDER BY tc.table_name, kcu.column_name; 