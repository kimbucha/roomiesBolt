/**
 * useConversation - Simplified Supabase-First Hook
 * 
 * Uses existing repositories directly for clean, reliable messaging.
 * Simplified to avoid messaging store integration issues.
 */

import { useState, useEffect, useCallback } from 'react';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { MessageRepository } from '../repositories/MessageRepository';
import { logger } from '../services/Logger';

export function useConversation(matchId: string, userId: string) {
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationRepo = new ConversationRepository();
  const messageRepo = new MessageRepository();

  // Ensure conversation exists for this match
  const ensureConversation = useCallback(async () => {
    try {
      logger.info('[useConversation] Ensuring conversation for match:', matchId);
      setLoading(true);
      
      const existingConversation = await conversationRepo.ensureFromMatch(matchId, userId);
      setConversation(existingConversation);
      
      return existingConversation;
    } catch (err) {
      const errorMessage = 'Failed to load conversation';
      setError(errorMessage);
      logger.error('[useConversation] Error ensuring conversation:', String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [matchId, userId]);

  // Load messages for the conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const conversationMessages = await messageRepo.findByConversationId(conversationId, 50);
      
      // Format messages for Chat component
      const formattedMessages = conversationMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        timestamp: msg.created_at,
        sender: {
          id: msg.sender_id,
          name: msg.sender_id === userId ? 'You' : msg.sender?.name || 'Unknown'
        },
        isMe: msg.sender_id === userId
      }));
      
      setMessages(formattedMessages);
      return formattedMessages;
    } catch (err) {
      logger.error('[useConversation] Error loading messages:', String(err));
      return [];
    }
  }, [userId]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!conversation) {
      throw new Error('No conversation available');
    }

    try {
      logger.info('[useConversation] Sending message to conversation:', conversation.id);
      
      const newMessage = await messageRepo.create({
        conversation_id: conversation.id,
        content,
        message_type: 'text'
      });

      // Add message to local state immediately for instant UI update
      const formattedMessage = {
        id: newMessage.id,
        content: newMessage.content,
        timestamp: newMessage.created_at,
        sender: {
          id: userId,
          name: 'You'
        },
        isMe: true
      };

      setMessages(prev => [formattedMessage, ...prev]);
      
      return newMessage;
    } catch (err) {
      const errorMessage = 'Failed to send message';
      setError(errorMessage);
      logger.error('[useConversation] Error sending message:', String(err));
      throw err;
    }
  }, [conversation, userId]);

  // Initialize conversation and messages
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const conv = await ensureConversation();
        if (mounted && conv) {
          await loadMessages(conv.id);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to initialize conversation');
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [ensureConversation, loadMessages]);

  return {
    conversation,
    messages,
    loading,
    error,
    sendMessage,
    refreshMessages: () => conversation ? loadMessages(conversation.id) : Promise.resolve([])
  };
} 