/**
 * SimpleMessagingService - Clean Supabase-First Implementation
 * 
 * This service uses the existing repository pattern and interfaces
 * to provide a clean, robust messaging solution without complex state management.
 */

import { supabase } from './supabaseClient';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { MessageRepository } from '../repositories/MessageRepository';
import { logger } from './Logger';
import { 
  ConversationWithParticipants, 
  MessageWithSender, 
  CreateMessageDTO 
} from '../types/messaging';

export class SimpleMessagingService {
  private conversationRepo: ConversationRepository;
  private messageRepo: MessageRepository;

  constructor() {
    this.conversationRepo = new ConversationRepository();
    this.messageRepo = new MessageRepository();
  }

  /**
   * Get or create conversation for a match
   */
  async ensureConversationForMatch(matchId: string, userId: string): Promise<ConversationWithParticipants> {
    try {
      logger.info('[SimpleMessagingService] Ensuring conversation for match:', matchId);
      
      // Use the existing repository method
      const conversation = await this.conversationRepo.ensureFromMatch(matchId, userId);
      
      return conversation;
    } catch (error) {
      logger.error('[SimpleMessagingService] Error ensuring conversation:', error);
      throw error;
    }
  }

  /**
   * Send a message to a conversation
   */
  async sendMessage(conversationId: string, content: string): Promise<MessageWithSender> {
    try {
      logger.info('[SimpleMessagingService] Sending message to conversation:', conversationId);
      
      const messageData: CreateMessageDTO = {
        conversation_id: conversationId,
        content,
        message_type: 'text'
      };

      const message = await this.messageRepo.create(messageData);
      
      return message;
    } catch (error) {
      logger.error('[SimpleMessagingService] Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, limit: number = 50): Promise<MessageWithSender[]> {
    try {
      logger.info('[SimpleMessagingService] Getting messages for conversation:', conversationId);
      
      const messages = await this.messageRepo.findByConversationId(conversationId, limit);
      
      return messages;
    } catch (error) {
      logger.error('[SimpleMessagingService] Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Get conversations for a user
   */
  async getConversations(userId: string): Promise<ConversationWithParticipants[]> {
    try {
      logger.info('[SimpleMessagingService] Getting conversations for user:', userId);
      
      const conversations = await this.conversationRepo.findByUserId(userId);
      
      return conversations;
    } catch (error) {
      logger.error('[SimpleMessagingService] Error getting conversations:', error);
      throw error;
    }
  }

  /**
   * Set up real-time subscription for messages in a conversation
   */
  subscribeToMessages(
    conversationId: string, 
    callback: (messages: MessageWithSender[]) => void
  ): () => void {
    logger.info('[SimpleMessagingService] Setting up messages subscription for conversation:', conversationId);

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
        async () => {
          try {
            // Refetch messages when new message arrives
            const messages = await this.getMessages(conversationId);
            callback(messages);
          } catch (error) {
            logger.error('[SimpleMessagingService] Error in messages subscription callback:', error);
          }
        }
      )
      .subscribe();

    return () => {
      logger.info('[SimpleMessagingService] Unsubscribing from messages');
      supabase.removeChannel(subscription);
    };
  }
}

// Singleton instance
export const simpleMessagingService = new SimpleMessagingService(); 