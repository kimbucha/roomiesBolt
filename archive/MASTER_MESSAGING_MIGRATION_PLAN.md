# Roomies Messaging & Matches Unification — Master Plan

_Last updated: 2025-01-07_  
_Status: IMPLEMENTATION READY_

This document provides **complete implementation details** for migrating from the current mixed legacy/Supabase state to a unified, production-ready messaging & matching system.

---
## 🎯 Executive Summary
**Problem**: Multiple stores for same entities, placeholder user IDs, navigation inconsistencies, excessive logging noise.  
**Solution**: Single source of truth per entity, real UUIDs only, centralized navigation, structured logging.  
**Timeline**: 6 days development + 2 days QA/rollout  
**Risk Level**: Medium (feature flags provide rollback safety)

---
## Phase 0: Snapshot & Audit (4 hours)

### 0.1 Export Supabase Schema
```bash
# Run in project root
supabase db dump --schema-only > docs/schema_$(date +%Y%m%d).sql
```

### 0.2 Database Audit
Run these queries in Supabase SQL Editor:

```sql
-- Table counts and health check
SELECT 
  'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'swipes', COUNT(*) FROM swipes  
UNION ALL
SELECT 'matches', COUNT(*) FROM matches
UNION ALL  
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;

-- Placeholder ID detection
SELECT 'matches_with_placeholders' as issue, COUNT(*) as count
FROM matches 
WHERE user1_id ILIKE '%currentuser%' OR user2_id ILIKE '%currentuser%'
UNION ALL
SELECT 'swipes_with_placeholders', COUNT(*)
FROM swipes 
WHERE swiper_id ILIKE '%currentuser%' OR swipee_id ILIKE '%currentuser%'
UNION ALL
SELECT 'conversations_with_placeholders', COUNT(*)
FROM conversations 
WHERE participants::text ILIKE '%currentuser%';

-- Orphaned records
SELECT 'orphaned_conversations' as issue, COUNT(*) as count
FROM conversations c 
LEFT JOIN matches m ON m.conversation_id = c.id 
WHERE m.conversation_id IS NULL
UNION ALL
SELECT 'orphaned_messages', COUNT(*)
FROM messages m 
LEFT JOIN conversations c ON c.id = m.conversation_id 
WHERE c.id IS NULL;

-- Auth vs Profile linking
SELECT 'users_without_profiles' as issue, COUNT(*) as count
FROM auth.users u 
LEFT JOIN profiles p ON p.id = u.id 
WHERE p.id IS NULL;
```

### 0.3 Create Audit Report
```bash
# Create audit document
touch docs/SUPABASE_AUDIT_$(date +%Y%m%d).md
```

### 0.4 Git Safety
```bash
git checkout -b messaging-migration-$(date +%Y%m%d)
git tag messaging-hotfix-backup
```

**✅ Exit Criteria**: Schema exported, audit results documented, backup branch created.

---
## Phase 1: User ID Consistency (4 hours)

### 1.1 Update Mock Data Generator
**File**: `data/mockDataSetup.ts` or similar

```typescript
// BEFORE: Hard-coded placeholder
const currentUserId = 'currentUser';

// AFTER: Real authenticated UUID
import { useSupabaseAuthStore } from '../store/supabaseAuthStore';

const getCurrentUserId = (): string => {
  const { user } = useSupabaseAuthStore.getState();
  if (!user?.id) {
    throw new Error('No authenticated user found for mock data generation');
  }
  return user.id;
};

// Use in mock data generation
const currentUserId = getCurrentUserId();
```

### 1.2 Database Migration Script
**File**: `scripts/migrate-placeholder-ids.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for admin operations
);

async function migratePlaceholderIds() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');
  
  const realUserId = user.id;
  const placeholders = ['currentUser', 'current-user', 'currentuser'];
  
  console.log(`Migrating placeholder IDs to: ${realUserId}`);
  
  // Update matches table
  for (const placeholder of placeholders) {
    await supabase
      .from('matches')
      .update({ user1_id: realUserId })
      .eq('user1_id', placeholder);
      
    await supabase
      .from('matches')  
      .update({ user2_id: realUserId })
      .eq('user2_id', placeholder);
  }
  
  // Update swipes table
  for (const placeholder of placeholders) {
    await supabase
      .from('swipes')
      .update({ swiper_id: realUserId })
      .eq('swiper_id', placeholder);
  }
  
  // Update conversations participants array
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, participants');
    
  for (const conv of conversations || []) {
    const updatedParticipants = conv.participants.map((p: string) => 
      placeholders.includes(p) ? realUserId : p
    );
    
    if (JSON.stringify(updatedParticipants) !== JSON.stringify(conv.participants)) {
      await supabase
        .from('conversations')
        .update({ participants: updatedParticipants })
        .eq('id', conv.id);
    }
  }
  
  console.log('Migration completed');
}

// Run: npx tsx scripts/migrate-placeholder-ids.ts
migratePlaceholderIds().catch(console.error);
```

### 1.3 Remove Helper Functions
**Files to update**:
- `app/(tabs)/matches/[matchId].tsx`
- `app/conversation/[id].tsx`  
- `store/messageStore.ts`

```typescript
// DELETE these functions entirely:
// - isCurrentUser()
// - isCurrentParticipant() 
// - isCurrent()

// REPLACE with simple comparison:
const isCurrentUser = (id: string) => id === user?.id;
```

### 1.4 Add Type Safety
**File**: `types/user.ts`

```typescript
export type UserId = string; // UUID from Supabase auth
export type UserProfile = {
  id: UserId;
  name: string;
  email: string;
  // ... other profile fields
};
```

**✅ Exit Criteria**: No placeholder IDs in database, mock data uses real UUIDs, helper functions removed.

---
## Phase 2: Store Unification (12 hours)

### 2.1 Create Feature Flags
**File**: `constants/featureFlags.ts`

```typescript
export const FEATURE_FLAGS = {
  UNIFIED_MATCHES: true,
  UNIFIED_MESSAGES: true,
  STRUCTURED_LOGGING: true,
} as const;

export const isFeatureEnabled = (flag: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[flag];
};
```

### 2.2 Build Supabase Conversations Store
**File**: `store/supabaseConversationsStore.ts`

```typescript
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { supabase } from '../services/supabase';
import type { UserId } from '../types/user';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: UserId;
  content: string;
  created_at: string;
  read_at?: string;
}

export interface Conversation {
  id: string;
  participants: UserId[];
  created_at: string;
  updated_at: string;
  last_message?: Message;
}

interface ConversationsState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchConversations: () => Promise<void>;
  ensureConversation: (matchId: string) => Promise<Conversation>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  subscribeToMessages: (conversationId: string) => () => void;
  markAsRead: (conversationId: string) => Promise<void>;
  
  // Selectors
  getConversationById: (id: string) => Conversation | undefined;
  getMessagesByConversation: (id: string) => Message[];
  getUnreadCount: () => number;
}

export const useSupabaseConversationsStore = create<ConversationsState>()(
  subscribeWithSelector((set, get) => ({
    conversations: [],
    messages: {},
    loading: false,
    error: null,

    fetchConversations: async () => {
      set({ loading: true, error: null });
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: conversations, error } = await supabase
          .from('conversations')
          .select(`
            *,
            messages (
              id,
              sender_id,
              content,
              created_at,
              read_at
            )
          `)
          .contains('participants', [user.id])
          .order('updated_at', { ascending: false });

        if (error) throw error;

        // Organize messages by conversation
        const messagesByConv: Record<string, Message[]> = {};
        conversations?.forEach(conv => {
          messagesByConv[conv.id] = (conv.messages || [])
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });

        set({ 
          conversations: conversations || [],
          messages: messagesByConv,
          loading: false 
        });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
      }
    },

    ensureConversation: async (matchId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if conversation already exists for this match
      const { data: match } = await supabase
        .from('matches')
        .select('*, conversation_id')
        .eq('id', matchId)
        .single();

      if (!match) throw new Error('Match not found');

      if (match.conversation_id) {
        // Return existing conversation
        const existing = get().getConversationById(match.conversation_id);
        if (existing) return existing;
      }

      // Create new conversation
      const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
      const participants = [user.id, otherUserId];

      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          participants,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update match with conversation_id
      await supabase
        .from('matches')
        .update({ conversation_id: conversation.id })
        .eq('id', matchId);

      // Update local state
      set(state => ({
        conversations: [...state.conversations, conversation],
        messages: { ...state.messages, [conversation.id]: [] }
      }));

      return conversation;
    },

    sendMessage: async (conversationId: string, content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Update local state
      set(state => ({
        messages: {
          ...state.messages,
          [conversationId]: [...(state.messages[conversationId] || []), message]
        }
      }));
    },

    subscribeToMessages: (conversationId: string) => {
      const subscription = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            set(state => ({
              messages: {
                ...state.messages,
                [conversationId]: [...(state.messages[conversationId] || []), newMessage]
              }
            }));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    },

    markAsRead: async (conversationId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);
    },

    // Selectors
    getConversationById: (id: string) => {
      return get().conversations.find(c => c.id === id);
    },

    getMessagesByConversation: (id: string) => {
      return get().messages[id] || [];
    },

    getUnreadCount: () => {
      const { messages } = get();
      const { data: { user } } = supabase.auth.getUser();
      if (!user) return 0;

      let unreadCount = 0;
      Object.values(messages).forEach(convMessages => {
        unreadCount += convMessages.filter(
          msg => msg.sender_id !== user.id && !msg.read_at
        ).length;
      });
      return unreadCount;
    },
  }))
);
```

### 2.3 Update Conversation Screen
**File**: `app/conversation/[id].tsx`

```typescript
// REPLACE messageStore imports with:
import { useSupabaseConversationsStore } from '../../store/supabaseConversationsStore';
import { isFeatureEnabled } from '../../constants/featureFlags';

export default function ConversationScreen() {
  // Feature flag check
  const useUnifiedMessages = isFeatureEnabled('UNIFIED_MESSAGES');
  
  // Conditional store usage
  const {
    getConversationById,
    getMessagesByConversation,
    sendMessage,
    subscribeToMessages,
    markAsRead
  } = useUnifiedMessages 
    ? useSupabaseConversationsStore()
    : useMessageStore(); // Fallback to legacy

  // Rest of component logic remains the same
  // ...
}
```

### 2.4 Update Matches Components
**File**: `components/matches/NewMatchesSection.tsx`

```typescript
import { useSupabaseMatchesStore } from '../../store/supabaseMatchesStore';
import { useSupabaseConversationsStore } from '../../store/supabaseConversationsStore';
import { isFeatureEnabled } from '../../constants/featureFlags';

// Replace handleNavigateToMessageLobby:
const handleNavigateToMessageLobby = async (matchId: string) => {
  if (!isFeatureEnabled('UNIFIED_MESSAGES')) {
    // Legacy flow
    return legacyNavigateToMessageLobby(matchId);
  }

  try {
    const conversation = await ensureConversation(matchId);
    router.push({
      pathname: '/conversation/[id]',
      params: { 
        id: conversation.id,
        source: 'newMatch',
        matchId 
      }
    });
  } catch (error) {
    console.error('Failed to create conversation:', error);
  }
};
```

**✅ Exit Criteria**: New stores implemented, feature flags control store usage, legacy stores still functional.

---
## Phase 3: Navigation Service (2 hours)

### 3.1 Create Navigation Service
**File**: `services/NavigationService.ts`

```typescript
import { router } from 'expo-router';

export class NavigationService {
  static goToMatchesRoot() {
    router.replace('/(tabs)/matches');
  }

  static goToMatch(matchId: string) {
    router.push({
      pathname: '/(tabs)/matches/[matchId]',
      params: { matchId }
    });
  }

  static goToConversation(
    conversationId: string, 
    options?: {
      source?: 'newMatch' | 'contextMenu' | 'messagesList';
      matchId?: string;
    }
  ) {
    router.push({
      pathname: '/conversation/[id]',
      params: {
        id: conversationId,
        source: options?.source || 'direct',
        matchId: options?.matchId || ''
      }
    });
  }

  static goToProfile(userId: string) {
    router.push({
      pathname: '/profile/[userId]',
      params: { userId }
    });
  }

  static goBack(fallback?: () => void) {
    if (router.canGoBack()) {
      router.back();
    } else if (fallback) {
      fallback();
    } else {
      this.goToMatchesRoot();
    }
  }

  static backToMatches() {
    this.goToMatchesRoot();
  }
}

// Convenience exports
export const { 
  goToMatchesRoot, 
  goToMatch, 
  goToConversation, 
  goToProfile, 
  goBack, 
  backToMatches 
} = NavigationService;
```

### 3.2 Update All Navigation Usage
**Files to update**:
- `app/conversation/[id].tsx`
- `components/matches/NewMatchesSection.tsx`
- `app/(tabs)/matches/[matchId].tsx`

```typescript
// REPLACE direct router calls:
// router.replace('/(tabs)/matches');
// WITH:
import { backToMatches } from '../../services/NavigationService';
backToMatches();

// REPLACE:
// router.push('/conversation/' + convId);
// WITH:
import { goToConversation } from '../../services/NavigationService';
goToConversation(convId, { source: 'newMatch', matchId });
```

**✅ Exit Criteria**: All navigation goes through NavigationService, no hardcoded route strings in components.

---
## Phase 4: Backend Schema Improvements (4 hours)

### 4.1 Add Foreign Keys
**File**: `supabase/migrations/20250107_add_foreign_keys.sql`

```sql
-- Add foreign key constraints
ALTER TABLE matches 
ADD CONSTRAINT fk_matches_conversation 
FOREIGN KEY (conversation_id) 
REFERENCES conversations(id) 
ON DELETE SET NULL;

ALTER TABLE messages 
ADD CONSTRAINT fk_messages_conversation 
FOREIGN KEY (conversation_id) 
REFERENCES conversations(id) 
ON DELETE CASCADE;

-- Add user foreign keys if not exists
ALTER TABLE matches 
ADD CONSTRAINT fk_matches_user1 
FOREIGN KEY (user1_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

ALTER TABLE matches 
ADD CONSTRAINT fk_matches_user2 
FOREIGN KEY (user2_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;
```

### 4.2 Add Performance Indexes
**File**: `supabase/migrations/20250107_add_indexes.sql`

```sql
-- Message ordering and filtering
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at);

-- Swipe lookups
CREATE INDEX IF NOT EXISTS idx_swipes_swiper_swipee 
ON swipes(swiper_id, swipee_id);

-- Match lookups by user
CREATE INDEX IF NOT EXISTS idx_matches_user1 
ON matches(user1_id);

CREATE INDEX IF NOT EXISTS idx_matches_user2 
ON matches(user2_id);

-- Conversation participant lookups
CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON conversations USING GIN(participants);
```

### 4.3 Add RLS Policies
**File**: `supabase/migrations/20250107_add_rls_policies.sql`

```sql
-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations: users can only see conversations they participate in
CREATE POLICY "Users can view own conversations" ON conversations
FOR SELECT USING (auth.uid()::text = ANY(participants));

CREATE POLICY "Users can create conversations" ON conversations
FOR INSERT WITH CHECK (auth.uid()::text = ANY(participants));

-- Messages: users can only see messages in conversations they participate in
CREATE POLICY "Users can view messages in own conversations" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = messages.conversation_id 
    AND auth.uid()::text = ANY(participants)
  )
);

CREATE POLICY "Users can send messages to own conversations" ON messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid()::text AND
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = messages.conversation_id 
    AND auth.uid()::text = ANY(participants)
  )
);
```

**✅ Exit Criteria**: Foreign keys enforced, indexes improve query performance, RLS policies secure data access.

---
## Phase 5: Logging & Telemetry (2 hours)

### 5.1 Create Logger Service
**File**: `services/Logger.ts`

```typescript
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

interface LogEntry {
  level: LogLevel;
  tag: string;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private level: LogLevel;
  private throttleMap = new Map<string, number>();

  constructor() {
    this.level = __DEV__ 
      ? (process.env.LOG_LEVEL === 'debug' ? LogLevel.DEBUG : LogLevel.INFO)
      : LogLevel.WARN;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private throttle(key: string, intervalMs: number = 1000): boolean {
    const now = Date.now();
    const lastLog = this.throttleMap.get(key) || 0;
    
    if (now - lastLog < intervalMs) {
      return false;
    }
    
    this.throttleMap.set(key, now);
    return true;
  }

  private log(level: LogLevel, tag: string, message: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      tag,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    const prefix = `[${LogLevel[level]}][${tag}]`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(prefix, message, data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, data);
        break;
      default:
        console.log(prefix, message, data);
    }
  }

  trace(tag: string, message: string, data?: any) {
    this.log(LogLevel.TRACE, tag, message, data);
  }

  debug(tag: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, tag, message, data);
  }

  info(tag: string, message: string, data?: any) {
    this.log(LogLevel.INFO, tag, message, data);
  }

  warn(tag: string, message: string, data?: any) {
    this.log(LogLevel.WARN, tag, message, data);
  }

  error(tag: string, message: string, data?: any) {
    this.log(LogLevel.ERROR, tag, message, data);
  }

  // Throttled logging for noisy operations
  debugThrottled(tag: string, message: string, data?: any, intervalMs?: number) {
    const key = `${tag}:${message}`;
    if (this.throttle(key, intervalMs)) {
      this.debug(tag, message, data);
    }
  }
}

export const logger = new Logger();
```

### 5.2 Replace Console Logs
**Script**: `scripts/replace-console-logs.sh`

```bash
#!/bin/bash
# Replace common console.log patterns with structured logging

find app components store -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/console\.log(\"\[DEBUG_\([^]]*\)\]/logger.debug("\1",/g' \
  -e 's/console\.log(\"\[\([^]]*\)\]/logger.info("\1",/g' \
  -e 's/console\.error(/logger.error("ERROR",/g' \
  -e 's/console\.warn(/logger.warn("WARN",/g'

echo "Console.log replacement completed. Review changes before committing."
```

**✅ Exit Criteria**: Structured logging in place, debug logs throttled, production logs clean.

---
## Phase 6: Automated QA (8 hours)

### 6.1 Setup Detox Testing
**File**: `e2e/messaging-flow.e2e.js`

```javascript
describe('Messaging Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete full messaging flow', async () => {
    // Login
    await element(by.id('login-email')).typeText('test@example.com');
    await element(by.id('login-password')).typeText('password');
    await element(by.id('login-submit')).tap();

    // Wait for main app
    await waitFor(element(by.id('discover-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Swipe right on first profile
    await element(by.id('profile-card-0')).swipe('left', 'fast', 0.8);
    
    // Check for match notification
    await waitFor(element(by.id('match-notification')))
      .toBeVisible()
      .withTimeout(3000);

    // Close match notification
    await element(by.id('match-close-button')).tap();

    // Navigate to matches
    await element(by.id('matches-tab')).tap();

    // Tap on new match card
    await element(by.id('new-match-card-0')).tap();

    // Verify conversation screen
    await expect(element(by.id('conversation-screen'))).toBeVisible();
    await expect(element(by.id('chat-header'))).toBeVisible();

    // Send message
    await element(by.id('message-input')).typeText('Hello there!');
    await element(by.id('send-button')).tap();

    // Verify message appears
    await waitFor(element(by.text('Hello there!')))
      .toBeVisible()
      .withTimeout(2000);

    // Navigate back
    await element(by.id('back-button')).tap();

    // Verify we're back on matches screen
    await expect(element(by.id('matches-screen'))).toBeVisible();
  });

  it('should handle deep link to conversation', async () => {
    // Test deep linking
    await device.openURL({ url: 'roomies://conversation/test-conv-id' });
    
    await waitFor(element(by.id('conversation-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

### 6.2 Unit Tests for Stores
**File**: `__tests__/supabaseConversationsStore.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useSupabaseConversationsStore } from '../store/supabaseConversationsStore';

// Mock Supabase
jest.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => ({ data: { user: { id: 'test-user-id' } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({ data: [], error: null })),
      insert: jest.fn(() => ({ data: {}, error: null })),
      update: jest.fn(() => ({ data: {}, error: null })),
    })),
  },
}));

describe('SupabaseConversationsStore', () => {
  it('should fetch conversations', async () => {
    const { result } = renderHook(() => useSupabaseConversationsStore());

    await act(async () => {
      await result.current.fetchConversations();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.conversations).toEqual([]);
  });

  it('should send message', async () => {
    const { result } = renderHook(() => useSupabaseConversationsStore());

    await act(async () => {
      await result.current.sendMessage('conv-id', 'Test message');
    });

    // Verify message was added to local state
    expect(result.current.getMessagesByConversation('conv-id')).toHaveLength(1);
  });
});
```

**✅ Exit Criteria**: E2E tests pass, unit tests cover store logic, CI pipeline includes test gates.

---
## Phase 7: Legacy Code Removal (2 hours)

### 7.1 Remove Feature Flags
```typescript
// Delete constants/featureFlags.ts
// Remove all isFeatureEnabled() checks
// Keep only new store imports
```

### 7.2 Delete Legacy Files
```bash
rm store/messageStore.ts
rm store/matchesStore.ts
# Remove legacy helper functions
# Clean up unused imports
```

### 7.3 Update Documentation
Update `README.md` and `implementation_plan.md` to reflect new architecture.

**✅ Exit Criteria**: No legacy code remains, documentation updated, app size reduced.

---
## Phase 8: Production Rollout (4 hours)

### 8.1 Version Bump
```json
// package.json
{
  "version": "2.0.0"
}
```

### 8.2 Database Migration
```bash
supabase db push --include-all
```

### 8.3 Monitoring Setup
- Enable Supabase real-time monitoring
- Set up Sentry error tracking
- Configure performance monitoring

### 8.4 Rollout Plan
1. Deploy to staging
2. Run full test suite
3. Deploy to production
4. Monitor for 48 hours
5. Tag stable release

**✅ Exit Criteria**: Production deployment successful, monitoring active, no critical issues.

---
## 📊 Success Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Store count per entity | 2-3 | 1 | Code audit |
| Console log noise | High | Minimal | DevTools inspection |
| Navigation bugs | Frequent | Zero | QA testing |
| Message delivery time | Variable | <500ms | Performance monitoring |
| Test coverage | <50% | >80% | Jest coverage report |

---
## 🚨 Rollback Plan

If critical issues arise:
1. Revert to `messaging-hotfix-backup` tag
2. Re-enable feature flags with legacy stores
3. Deploy hotfix
4. Investigate issues offline

---
## 📝 Implementation Checklist

### Phase 0: Audit ✅
- [ ] Export schema
- [ ] Run database audit queries  
- [ ] Document findings
- [ ] Create backup branch

### Phase 1: User IDs ✅
- [ ] Update mock data generator
- [ ] Run placeholder migration script
- [ ] Remove helper functions
- [ ] Add type safety

### Phase 2: Store Unification ✅
- [ ] Create feature flags
- [ ] Build supabaseConversationsStore
- [ ] Update conversation screen
- [ ] Update matches components

### Phase 3: Navigation ✅
- [ ] Create NavigationService
- [ ] Update all navigation calls
- [ ] Test navigation flows

### Phase 4: Backend ✅
- [ ] Add foreign keys
- [ ] Add indexes
- [ ] Add RLS policies
- [ ] Test schema changes

### Phase 5: Logging ✅
- [ ] Create Logger service
- [ ] Replace console.log calls
- [ ] Test log levels

### Phase 6: QA ✅
- [ ] Setup Detox tests
- [ ] Write unit tests
- [ ] Configure CI pipeline

### Phase 7: Cleanup ✅
- [ ] Remove feature flags
- [ ] Delete legacy files
- [ ] Update documentation

### Phase 8: Rollout ✅
- [ ] Version bump
- [ ] Database migration
- [ ] Production deployment
- [ ] Monitor and verify

---
_Implementation ready. Execute phases sequentially for best results._ 