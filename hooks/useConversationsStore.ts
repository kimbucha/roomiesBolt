/**
 * Migration Wrapper Hook for Conversations Store
 * 
 * This hook provides a unified interface that switches between:
 * - Legacy messageStore (current implementation)
 * - New supabaseConversationsStore (unified implementation)
 * 
 * Based on feature flags, allowing for gradual rollout and easy rollback.
 */

import React from 'react';
import { FEATURE_FLAGS } from '../constants/featureFlags';
import { logger } from '../services/Logger';

// Legacy store import
import { useMessageStore } from '../store/messageStore';

// New unified store import
import { useMessagingStore, selectConversations, selectActiveConversations, selectNewMatches, selectLoading, selectError } from '../store/messagingStore';

// Unified interface type
export interface UnifiedConversationsStore {
  // Core state
  conversations: any[];
  messages: Record<string, any[]>;
  loading: boolean;
  isLoading: boolean; // Legacy compatibility
  error: string | null;
  unreadCount: number;
  activeConversationId: string | null;

  // Core actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  createConversation: (participants: string[], matchId?: string) => Promise<string | null>;
  sendMessage: (conversationId: string, content: string, senderId: string) => Promise<void>;
  markAsRead: (conversationId: string, userId?: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  
  // Utility methods
  getConversationById: (id: string) => any | null;
  getMessagesByMatchId: (matchId: string) => any[];
  getFormattedMessages: (conversationId: string, currentUserId: string) => any[];
  getUnreadCount: (conversationId: string) => number;
  getTotalUnreadCount: () => number;
  
  // Real-time subscriptions
  subscribeToConversation?: (conversationId: string) => () => void;
  subscribeToUserConversations?: (userId: string) => () => void;
}

/**
 * Main hook that switches between stores based on feature flags
 */
export function useConversationsStore(): UnifiedConversationsStore {
  // Always call hooks at the top level
  const messageStore = useMessageStore();
  const messagingStore = useMessagingStore();
  
  // Use useMemo with empty dependency array since stores are stable
  // and we're accessing them inside the memo function
  return React.useMemo(() => {
  if (FEATURE_FLAGS.UNIFIED_MESSAGES) {
      logger.info('ConversationsStore', 'Using new unified messaging store');
    
      // Return the unified messaging store mapped to unified interface
      return mapMessagingStoreToUnified(messagingStore);
  } else {
    logger.debug('ConversationsStore', 'Using legacy message store');
    return mapLegacyStoreToUnified(messageStore);
  }
  }, [FEATURE_FLAGS.UNIFIED_MESSAGES]); // Only depend on the flag, not the store objects
}

/**
 * Map legacy messageStore to unified interface
 */
function mapLegacyStoreToUnified(messageStore: any): UnifiedConversationsStore {
  return {
    // Map legacy state to unified interface - use stable references
    conversations: messageStore.conversations || [],
    messages: messageStore.messages || {},
    loading: messageStore.isLoading || false,
    isLoading: messageStore.isLoading || false,
    error: messageStore.error || null,
    unreadCount: messageStore.unreadCount || 0,
    activeConversationId: messageStore.activeConversationId || null,
    
    // Map legacy actions to unified interface with proper async wrappers
    fetchConversations: messageStore.fetchConversations || (() => Promise.resolve()),
    fetchMessages: messageStore.fetchMessages || (() => Promise.resolve()),
    createConversation: async (participants: string[], matchId?: string) => {
      if (messageStore.createConversation) {
      return messageStore.createConversation(participants, matchId);
      }
      return null;
    },
    sendMessage: async (conversationId: string, content: string, senderId: string) => {
      if (messageStore.sendMessage) {
      messageStore.sendMessage(conversationId, content, senderId);
      }
    },
    markAsRead: async (conversationId: string, userId?: string) => {
      if (messageStore.markAsRead) {
      messageStore.markAsRead(conversationId);
      }
    },
    setActiveConversation: messageStore.setActiveConversation || (() => {}),
    
    // Map utility methods
    getConversationById: messageStore.getConversationById || (() => null),
    getMessagesByMatchId: messageStore.getMessagesByMatchId || (() => []),
    getFormattedMessages: messageStore.getFormattedMessages || (() => []),
    getUnreadCount: messageStore.getUnreadCount || (() => 0),
    getTotalUnreadCount: messageStore.getTotalUnreadCount || (() => 0),
    
    // Legacy store doesn't have real-time subscriptions
    subscribeToConversation: undefined,
    subscribeToUserConversations: undefined,
  };
}

/**
 * Map unified messaging store to unified interface
 */
function mapMessagingStoreToUnified(messagingStore: any): UnifiedConversationsStore {
  // Get current messaging store state directly
  const messagingStoreState = messagingStore;
  
  // Convert Map to Array for conversations
  const conversations = messagingStoreState.conversations ? Array.from(messagingStoreState.conversations.values()) : [];
  const loading = messagingStoreState.loading || false;
  const error = messagingStoreState.error || null;

  return {
    // Map messaging store state to unified interface
    conversations: conversations,
    messages: messagingStore.messages ? Object.fromEntries(messagingStore.messages) : {},
    loading: loading,
    isLoading: loading,
    error: error,
    unreadCount: messagingStore.getTotalUnreadCount ? messagingStore.getTotalUnreadCount() : 0,
    activeConversationId: null, // Not tracked in new store
    
    // Map messaging store actions to unified interface
    fetchConversations: async () => {
      if (messagingStore.loadConversations) {
        const userId = 'current-user'; // TODO: Get from auth store
        await messagingStore.loadConversations(userId);
      }
    },
    fetchMessages: async (conversationId: string) => {
      if (messagingStore.loadMessages) {
        await messagingStore.loadMessages(conversationId);
      }
    },
    createConversation: async (participants: string[], matchId?: string) => {
      if (!matchId || !messagingStore.createConversationFromMatch) return null;
      const userId = 'current-user'; // TODO: Get from auth store
      const conversation = await messagingStore.createConversationFromMatch(matchId, userId);
      
      // CRITICAL FIX: After creating conversation, ensure we reload conversations
      // to make sure the new conversation is available in the store
      if (conversation && messagingStore.loadConversations) {
        await messagingStore.loadConversations(userId);
      }
      
      return conversation?.id || null;
    },
    sendMessage: async (conversationId: string, content: string, senderId: string) => {
      if (messagingStore.sendMessage) {
        await messagingStore.sendMessage(conversationId, content, senderId);
      }
    },
    markAsRead: async (conversationId: string, userId?: string) => {
      if (messagingStore.markMessagesAsRead) {
        const actualUserId = userId || 'current-user'; // TODO: Get from auth store
        await messagingStore.markMessagesAsRead(conversationId, actualUserId);
      }
    },
    setActiveConversation: () => {
      // Not implemented in new store yet
    },
    
    // Map utility methods with safe fallbacks
    getConversationById: (id: string) => {
      if (messagingStore.conversations && messagingStore.conversations.get) {
        return messagingStore.conversations.get(id) || null;
      }
      return null;
    },
    getMessagesByMatchId: (matchId: string) => {
      if (!messagingStore.conversations || !messagingStore.messages) return [];
      
      // Find conversation by match_id and return messages
      const conversation = conversations.find((conv: any) => conv.match_id === matchId || conv.matchId === matchId);
      if (conversation?.id && messagingStore.messages.get) {
        return messagingStore.messages.get(conversation.id) || [];
      }
      return [];
    },
    getFormattedMessages: (conversationId: string, currentUserId: string) => {
      console.log('[DEBUG] getFormattedMessages called with:', conversationId);
      
      // CRITICAL FIX: Import and access store directly inside function to avoid closure issues
      const { useMessagingStore: getMessagingStore } = require('../store/messagingStore');
      const currentMessagingStore = getMessagingStore.getState ? getMessagingStore.getState() : getMessagingStore();
      
      if (!currentMessagingStore) {
        console.log('[DEBUG] No messaging store state available');
        return [];
      }
      
      // Access conversations and messages Maps directly
      const conversations = currentMessagingStore.conversations;
      const messages = currentMessagingStore.messages;
      
      if (!conversations || !messages) {
        console.log('[DEBUG] No conversations or messages maps available');
        return [];
      }
      
      console.log('[DEBUG] Store access successful:', {
        conversationsCount: conversations.size,
        messagesCount: messages.size,
        conversationsType: conversations.constructor.name,
        messagesType: messages.constructor.name
      });
      
      // Try direct conversation lookup first
      let conversation: any = conversations.get(conversationId);
      console.log('[DEBUG] Direct conversation lookup:', conversation ? `found: ${conversation.id}` : 'not found');
      
      if (!conversation) {
        // Try to find conversation by participants or match relationship
        const allConversations = Array.from(conversations.values());
        console.log('[DEBUG] Searching through conversations:', {
          totalConversations: allConversations.length,
          searchingFor: conversationId
        });
        
        // Look for match-based conversation
        conversation = allConversations.find((conv: any) => {
          const hasMatchId = conv.match_id === conversationId || conv.matchId === conversationId;
          console.log('[DEBUG] Checking conversation for match:', {
            id: conv?.id || 'unknown',
            matchId: conv?.match_id || conv?.matchId || 'none',
            matches: hasMatchId
          });
          return hasMatchId;
        });
        
        console.log('[DEBUG] Match-based conversation lookup:', conversation ? `found: ${conversation?.id || 'unknown'}` : 'not found');
      }
      
      if (!conversation || !conversation.id) {
        console.log('[DEBUG] No valid conversation found, returning empty array');
        return [];
      }
      
      // Get messages for this conversation
      const conversationMessages = messages.get(conversation.id) || [];
      console.log('[DEBUG] Found messages:', {
        conversationId: conversation.id,
        messageCount: conversationMessages.length,
        messagesPreview: conversationMessages.slice(0, 2).map((m: any) => ({ 
          id: m?.id || 'unknown', 
          content: m?.content || 'no content', 
          sender: m?.sender_id || 'unknown' 
        }))
      });
      
      // Format messages for UI
      return conversationMessages.map((message: any) => ({
        id: message.id,
        text: message.content,
        timestamp: new Date(message.created_at),
        sender: {
          id: message.sender_id === 'current-user' ? currentUserId : message.sender_id,
          name: message.sender_id === 'current-user' ? 'You' : 'Other User',
          avatar: undefined // TODO: Add avatar support
        },
        isMe: message.sender_id === 'current-user',
        status: 'sent' // TODO: Add proper status tracking
      }));
    },
    getUnreadCount: (conversationId: string) => {
      if (messagingStore.getUnreadCount) {
        return messagingStore.getUnreadCount(conversationId);
      }
      return 0;
    },
    getTotalUnreadCount: () => {
      if (messagingStore.getTotalUnreadCount) {
        return messagingStore.getTotalUnreadCount();
      }
      return 0;
    },
    
    // Messaging store has real-time subscriptions
    subscribeToConversation: messagingStore.subscribeToMessages ? (conversationId: string) => {
      return messagingStore.subscribeToMessages(conversationId);
    } : undefined,
    subscribeToUserConversations: messagingStore.subscribeToConversations ? (userId: string) => {
      return messagingStore.subscribeToConversations(userId);
    } : undefined,
  };
}

/**
 * Direct access to legacy store (for components that need specific legacy features)
 */
export function useLegacyMessageStore() {
  return useMessageStore();
}

/**
 * Direct access to new unified messaging store
 */
export function useMessagingStoreHook() {
  return useMessagingStore();
}

/**
 * Hook for migration status and debugging
 */
export function useConversationsStoreMigration() {
  return {
    isUsingUnifiedStore: FEATURE_FLAGS.UNIFIED_MESSAGES,
    isSupabaseStoreReady: false, // TODO: Update when implemented
    migrationPhase: 'legacy', // 'legacy' | 'transition' | 'unified'
    
    // Debug helpers
    getCurrentStoreType: () => FEATURE_FLAGS.UNIFIED_MESSAGES ? 'supabase' : 'legacy',
    getFeatureFlags: () => FEATURE_FLAGS,
  };
}

/**
 * Specific hook for unified messaging implementation (for testing/debugging)
 */
export function useUnifiedMessagingStore() {
  return useMessagingStore();
}

/**
 * Hook for components that need to know which implementation is active
 */
export function useConversationsStoreInfo() {
  return {
    isUsingSupabase: FEATURE_FLAGS.UNIFIED_MESSAGES,
    storeName: FEATURE_FLAGS.UNIFIED_MESSAGES ? 'Supabase' : 'Legacy'
  };
} 