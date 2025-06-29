/**
 * useSimpleMessaging - Clean React Hook for Messaging
 * 
 * This hook provides a simple interface for messaging that directly
 * uses Supabase repositories without complex state management.
 */

import { useState, useEffect, useCallback } from 'react';
import { simpleMessagingService } from '../services/SimpleMessagingService';
import { logger } from '../services/Logger';
import { ConversationWithParticipants, MessageWithSender } from '../types/messaging';

export interface UseSimpleMessagingResult {
  // Conversation operations
  ensureConversationForMatch: (matchId: string, userId: string) => Promise<ConversationWithParticipants>;
  
  // Message operations
  sendMessage: (conversationId: string, content: string) => Promise<MessageWithSender>;
  getMessages: (conversationId: string) => Promise<MessageWithSender[]>;
  
  // Real-time subscriptions
  subscribeToMessages: (conversationId: string, callback: (messages: MessageWithSender[]) => void) => () => void;
  
  // State
  loading: boolean;
  error: string | null;
}

export function useSimpleMessaging(): UseSimpleMessagingResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureConversationForMatch = useCallback(async (matchId: string, userId: string): Promise<ConversationWithParticipants> => {
    try {
      setLoading(true);
      setError(null);
      
      const conversation = await simpleMessagingService.ensureConversationForMatch(matchId, userId);
      
      return conversation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to ensure conversation';
      setError(errorMessage);
      logger.error('[useSimpleMessaging] Error ensuring conversation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (conversationId: string, content: string): Promise<MessageWithSender> => {
    try {
      setLoading(true);
      setError(null);
      
      const message = await simpleMessagingService.sendMessage(conversationId, content);
      
      return message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      logger.error('[useSimpleMessaging] Error sending message:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMessages = useCallback(async (conversationId: string): Promise<MessageWithSender[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const messages = await simpleMessagingService.getMessages(conversationId);
      
      return messages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get messages';
      setError(errorMessage);
      logger.error('[useSimpleMessaging] Error getting messages:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribeToMessages = useCallback((conversationId: string, callback: (messages: MessageWithSender[]) => void): (() => void) => {
    try {
      return simpleMessagingService.subscribeToMessages(conversationId, callback);
    } catch (err) {
      logger.error('[useSimpleMessaging] Error setting up subscription:', err);
      return () => {}; // Return empty cleanup function
    }
  }, []);

  return {
    ensureConversationForMatch,
    sendMessage,
    getMessages,
    subscribeToMessages,
    loading,
    error
  };
}

/**
 * Message formatting utility for Chat component compatibility
 */
export function formatMessagesForChat(messages: MessageWithSender[], currentUserId: string) {
  return messages.map(message => ({
    id: message.id,
    text: message.content,
    timestamp: new Date(message.created_at),
    sender: {
      id: message.sender.id,
      name: message.sender.name,
      avatar: message.sender.avatar_url
    },
    isMe: message.sender.id === currentUserId,
    status: 'sent' as const
  }));
} 