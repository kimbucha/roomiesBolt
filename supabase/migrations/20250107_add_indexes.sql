-- Migration: Add Performance Indexes
-- Created: 2025-01-07
-- Purpose: Improve query performance for common operations

-- =============================================================================
-- MESSAGES TABLE INDEXES
-- =============================================================================

-- Index for fetching messages by conversation in chronological order
-- This is the most common query pattern for the chat interface
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at);

-- Index for finding unread messages by conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_read 
ON messages(conversation_id, read_at) 
WHERE read_at IS NULL;

-- Index for finding messages by sender (useful for user-specific queries)
CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON messages(sender_id, created_at);

-- =============================================================================
-- SWIPES TABLE INDEXES
-- =============================================================================

-- Composite index for swipe lookups (checking if user A swiped on user B)
-- This is critical for match detection and preventing duplicate swipes
CREATE INDEX IF NOT EXISTS idx_swipes_swiper_swipee 
ON swipes(swiper_id, swipee_id);

-- Index for finding all swipes by a specific user
CREATE INDEX IF NOT EXISTS idx_swipes_swiper_created 
ON swipes(swiper_id, created_at);

-- Index for finding who swiped on a specific user
CREATE INDEX IF NOT EXISTS idx_swipes_swipee_created 
ON swipes(swipee_id, created_at);

-- Index for swipe type filtering (like, dislike, super_like)
CREATE INDEX IF NOT EXISTS idx_swipes_type 
ON swipes(swipe_type, created_at);

-- =============================================================================
-- MATCHES TABLE INDEXES
-- =============================================================================

-- Index for finding matches by user1_id
CREATE INDEX IF NOT EXISTS idx_matches_user1 
ON matches(user1_id, created_at);

-- Index for finding matches by user2_id
CREATE INDEX IF NOT EXISTS idx_matches_user2 
ON matches(user2_id, created_at);

-- Composite index for finding matches between two specific users
CREATE INDEX IF NOT EXISTS idx_matches_users 
ON matches(user1_id, user2_id);

-- Index for finding matches with conversations
CREATE INDEX IF NOT EXISTS idx_matches_conversation 
ON matches(conversation_id) 
WHERE conversation_id IS NOT NULL;

-- Index for finding matches by status
CREATE INDEX IF NOT EXISTS idx_matches_status 
ON matches(status, created_at);

-- =============================================================================
-- CONVERSATIONS TABLE INDEXES
-- =============================================================================

-- GIN index for participant array lookups
-- This allows efficient queries like "find conversations where user X participates"
CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON conversations USING GIN(participants);

-- Index for conversation ordering by last activity
CREATE INDEX IF NOT EXISTS idx_conversations_updated 
ON conversations(updated_at DESC);

-- =============================================================================
-- USERS TABLE INDEXES (if not already present)
-- =============================================================================

-- Index for user lookups by email (for auth integration)
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email) 
WHERE email IS NOT NULL;

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_users_location 
ON users(location) 
WHERE location IS NOT NULL;

-- Index for date of birth filtering (equivalent to age)
CREATE INDEX IF NOT EXISTS idx_users_date_of_birth 
ON users(date_of_birth) 
WHERE date_of_birth IS NOT NULL;

-- Index for verification status
CREATE INDEX IF NOT EXISTS idx_users_verified 
ON users(is_verified, created_at) 
WHERE is_verified IS NOT NULL;

-- Index for onboarding completion status
CREATE INDEX IF NOT EXISTS idx_users_onboarding 
ON users(onboarding_completed) 
WHERE onboarding_completed IS NOT NULL;

-- =============================================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =============================================================================

-- Index for finding potential matches (users that haven't been swiped on)
-- This supports the main discovery query
CREATE INDEX IF NOT EXISTS idx_users_discovery 
ON users(onboarding_completed, is_verified, created_at) 
WHERE onboarding_completed = true;

-- Index for message threading (conversation + timestamp)
CREATE INDEX IF NOT EXISTS idx_messages_thread 
ON messages(conversation_id, created_at DESC, sender_id);

-- =============================================================================
-- PARTIAL INDEXES FOR SPECIFIC USE CASES
-- =============================================================================

-- Index for active conversations (those with recent messages)
-- Note: Using a static date instead of NOW() to make it immutable
CREATE INDEX IF NOT EXISTS idx_conversations_active 
ON conversations(updated_at DESC) 
WHERE updated_at IS NOT NULL;

-- Index for recent matches - simplified without date filter
CREATE INDEX IF NOT EXISTS idx_matches_recent 
ON matches(created_at DESC, user1_id, user2_id) 
WHERE created_at IS NOT NULL;

-- =============================================================================
-- VERIFICATION QUERY
-- =============================================================================

-- Query to verify all indexes were created successfully
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('matches', 'conversations', 'messages', 'swipes', 'users')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname; 