/**
 * MessagingService - Supabase-First Implementation
 * 
 * This service provides the business logic layer for messaging operations,
 * using the repository pattern to interact with Supabase directly.
 * 
 * Key Features:
 * - Direct Supabase database operations
 * - Real-time subscriptions
 * - Proper error handling
 * - Type safety with TypeScript
 */

import { supabase } from './supabaseClient';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { MessageRepository } from '../repositories/MessageRepository';
import { logger } from './Logger';
import {
  ConversationWithParticipants,
  MessageWithSender,
  CreateConversationDTO,
  CreateMessageDTO,
  MessagingServiceInterface,
  MessagingError
} from '../types/messaging';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  match_id?: string;
  created_at: string;
  updated_at: string;
  last_message?: Message;
}

export class MessagingService implements MessagingServiceInterface {
  private conversationRepo: ConversationRepository;
  private messageRepo: MessageRepository;
  private subscriptions: Map<string, any> = new Map();

  constructor() {
    this.conversationRepo = new ConversationRepository();
    this.messageRepo = new MessageRepository();
  }

  /**
   * Get all conversations for a user with real-time updates
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      logger.info('[MessagingService] Getting conversations for user:', userId);
      
      const conversations = await this.conversationRepo.findByUserId(userId);
      
      // Set up real-time subscription for conversations
      this.subscribeToUserConversations(userId);
      
      return conversations;
    } catch (error) {
      logger.error('[MessagingService] Error getting conversations:', error);
      throw error;
    }
  }

  /**
   * Get messages for a conversation with real-time updates
   */
  async getMessages(conversationId: string, limit: number = 50, before?: string): Promise<Message[]> {
    try {
      logger.info('[MessagingService] Getting messages for conversation:', conversationId);
      
      const messages = await this.messageRepo.findByConversationId(conversationId, { limit, before });
      
      // Set up real-time subscription for messages
      this.subscribeToConversationMessages(conversationId);
      
      return messages;
    } catch (error) {
      logger.error('[MessagingService] Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Create conversation from match (Supabase function)
   */
  async ensureConversationForMatch(matchId: string, userId: string): Promise<Conversation> {
    try {
      logger.info('[MessagingService] Ensuring conversation for match:', matchId);
      
      // First check if conversation already exists
      let conversation = await this.conversationRepo.findByMatchId(matchId);
      
      if (!conversation) {
        // Use Supabase function to create conversation
        const { data, error } = await supabase.rpc('create_conversation_from_match', {
          match_uuid: matchId,
          initiator_user_id: userId
        });
        
        if (error) {
          logger.error('[MessagingService] Error creating conversation:', error);
          throw error;
        }
        
        // Fetch the created conversation
        conversation = await this.conversationRepo.findById(data);
      }
      
      return conversation;
    } catch (error) {
      logger.error('[MessagingService] Error ensuring conversation:', error);
      throw error;
    }
  }

  /**
   * Send message to conversation
   */
  async sendMessage(conversationId: string, content: string, senderId: string): Promise<Message> {
    try {
      logger.info('[MessagingService] Sending message to conversation:', conversationId);
      
      const message = await this.messageRepo.create({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: 'text'
      });
      
      return message;
    } catch (error) {
      logger.error('[MessagingService] Error sending message:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      logger.info('[MessagingService] Marking messages as read:', conversationId, userId);
      
      // Use Supabase function for atomic read updates
      const { error } = await supabase.rpc('mark_messages_as_read', {
        conversation_uuid: conversationId,
        user_uuid: userId
      });
      
      if (error) {
        logger.error('[MessagingService] Error marking messages as read:', error);
        throw error;
      }
      
      logger.info('[MessageRepository] Mock marked messages as read for user', userId, 'in conversation', conversationId);
    } catch (error) {
      logger.error('[MessagingService] Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time conversation updates
   */
  private subscribeToUserConversations(userId: string) {
    const subscriptionKey = `conversations_${userId}`;
    
    if (this.subscriptions.has(subscriptionKey)) {
      return; // Already subscribed
    }
    
    const subscription = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participants.cs.{${userId}}`
        },
        (payload) => {
          logger.info('[MessagingService] Conversation update:', payload);
          // Emit event for components to refresh
          this.emitConversationUpdate(payload);
        }
      )
      .subscribe();
    
    this.subscriptions.set(subscriptionKey, subscription);
  }

  /**
   * Subscribe to real-time message updates
   */
  private subscribeToConversationMessages(conversationId: string) {
    const subscriptionKey = `messages_${conversationId}`;
    
    if (this.subscriptions.has(subscriptionKey)) {
      return; // Already subscribed
    }
    
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          logger.info('[MessagingService] Message update:', payload);
          // Emit event for components to refresh
          this.emitMessageUpdate(payload);
        }
      )
      .subscribe();
    
    this.subscriptions.set(subscriptionKey, subscription);
  }

  /**
   * Emit conversation updates to interested components
   */
  private emitConversationUpdate(payload: any) {
    // Use React Native's built-in event system or a simple event emitter
    // For now, we'll use a simple callback pattern
    if (this.onConversationUpdate) {
      this.onConversationUpdate(payload);
    }
  }

  /**
   * Emit message updates to interested components
   */
  private emitMessageUpdate(payload: any) {
    if (this.onMessageUpdate) {
      this.onMessageUpdate(payload);
    }
  }

  /**
   * Callback handlers for components to subscribe to updates
   */
  public onConversationUpdate?: (payload: any) => void;
  public onMessageUpdate?: (payload: any) => void;

  /**
   * Clean up subscriptions
   */
  async cleanup() {
    logger.info('[MessagingService] Cleaning up subscriptions');
    
    for (const [key, subscription] of this.subscriptions) {
      await supabase.removeChannel(subscription);
      this.subscriptions.delete(key);
    }
  }

  // =================================================================
  // CONVERSATION OPERATIONS
  // =================================================================

  async getConversation(conversationId: string): Promise<ConversationWithParticipants | null> {
    try {
      logger.info('[MessagingService] Getting conversation:', conversationId);
      return await this.conversationRepo.findById(conversationId);
    } catch (error) {
      logger.error('[MessagingService] Error getting conversation:', error);
      throw error;
    }
  }

  async getConversationByMatchId(matchId: string): Promise<ConversationWithParticipants | null> {
    try {
      logger.info('[MessagingService] Getting conversation by match ID:', matchId);
      return await this.conversationRepo.findByMatchId(matchId);
    } catch (error) {
      logger.error('[MessagingService] Error getting conversation by match:', error);
      throw error;
    }
  }

  async createConversation(data: CreateConversationDTO): Promise<ConversationWithParticipants> {
    try {
      logger.info('[MessagingService] Creating conversation:', data);
      return await this.conversationRepo.create(data);
    } catch (error) {
      logger.error('[MessagingService] Error creating conversation:', error);
      throw error;
    }
  }

  async updateConversation(id: string, data: any): Promise<ConversationWithParticipants> {
    try {
      logger.info('[MessagingService] Updating conversation:', id);
      return await this.conversationRepo.update(id, data);
    } catch (error) {
      logger.error('[MessagingService] Error updating conversation:', error);
      throw error;
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      logger.info('[MessagingService] Deleting conversation:', id);
      await this.conversationRepo.delete(id);
    } catch (error) {
      logger.error('[MessagingService] Error deleting conversation:', error);
      throw error;
    }
  }

  // =================================================================
  // MESSAGE OPERATIONS
  // =================================================================

  async sendMessageToMatch(matchId: string, content: string): Promise<{
    conversation: ConversationWithParticipants;
    message: MessageWithSender;
    shouldMoveToMessages: boolean;
  }> {
    try {
      logger.info('[MessagingService] Sending first message to match:', matchId);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new MessagingError(
          'User not authenticated',
          'AUTHENTICATION_ERROR',
          { error: authError?.message }
        );
      }

      // Check if conversation already exists
      let conversation = await this.getConversationByMatchId(matchId);
      let shouldMoveToMessages = false;

      if (!conversation) {
        // Create new conversation
        conversation = await this.ensureConversationForMatch(matchId, user.id);
        shouldMoveToMessages = true; // User initiated, should move to messages

        // Update match to track who initiated the conversation
        await this.updateMatchInitiator(matchId, user.id);
      }

      // Send the message
      const message = await this.sendMessage(conversation.id, content, user.id);

      logger.info(`[MessagingService] First message sent to match ${matchId}, shouldMove: ${shouldMoveToMessages}`);

      return {
        conversation,
        message,
        shouldMoveToMessages
      };

    } catch (error) {
      logger.error('[MessagingService] Error sending first message to match:', error);
      throw error;
    }
  }

  async getMatchCardState(matchId: string, currentUserId: string): Promise<{
    hasConversation: boolean;
    hasUnreadMessages: boolean;
    shouldShowInNewMatches: boolean;
    shouldShowInMessages: boolean;
    unreadCount: number;
  }> {
    try {
      logger.info('[MessagingService] Getting match card state:', matchId, currentUserId);

      // Get match details
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select(`
          id,
          conversation_id,
          has_unread_messages,
          initiated_conversation_by
        `)
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        throw new MessagingError(
          'Match not found',
          'MATCH_NOT_FOUND',
          { matchId, error: matchError?.message }
        );
      }

      const hasConversation = !!match.conversation_id;
      let unreadCount = 0;

      if (hasConversation) {
        unreadCount = await this.getConversationUnreadCount(match.conversation_id, currentUserId);
      }

      // Determine display location based on conversation state
      let shouldShowInNewMatches = true;
      let shouldShowInMessages = false;

      if (hasConversation) {
        if (match.initiated_conversation_by === currentUserId) {
          // User messaged first → Messages section
          shouldShowInNewMatches = false;
          shouldShowInMessages = true;
        } else {
          // Other user messaged first → New Matches section
          shouldShowInNewMatches = true;
          shouldShowInMessages = false;
        }
      }

      return {
        hasConversation,
        hasUnreadMessages: unreadCount > 0,
        shouldShowInNewMatches,
        shouldShowInMessages,
        unreadCount
      };

    } catch (error) {
      logger.error('[MessagingService] Error getting match card state:', error);
      throw error;
    }
  }

  // =================================================================
  // PRIVATE HELPER METHODS
  // =================================================================

  private async updateMatchInitiator(matchId: string, initiatorId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ 
          initiated_conversation_by: initiatorId,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (error) {
        logger.error('[MessagingService] Error updating match initiator:', error);
        // Don't throw, this is not critical for the user experience
      } else {
        logger.info(`[MessagingService] Updated match ${matchId} initiator to ${initiatorId}`);
      }
    } catch (error) {
      logger.error('[MessagingService] Error in updateMatchInitiator:', error);
      // Fail gracefully
    }
  }

  async getConversationUnreadCount(conversationId: string, userId: string): Promise<number> {
    try {
      return await this.messageRepo.getUnreadCount(conversationId, userId);
    } catch (error) {
      logger.error('[MessagingService] Error getting conversation unread count:', error);
      return 0; // Fail gracefully
    }
  }
}

// Singleton instance
export const messagingService = new MessagingService(); 