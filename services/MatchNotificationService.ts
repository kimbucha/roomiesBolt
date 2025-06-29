/**
 * Match Notification Service - Card State Management
 * 
 * Handles the logic for determining where match cards should appear
 * and managing notification states for new matches.
 */

import { supabase } from './supabaseClient';
import { logger } from './Logger';
import { MessagingService } from './MessagingService';
import {
  ConversationWithParticipants,
  MessageWithSender,
  MessagingError
} from '../types/messaging';

export interface MatchCardState {
  matchId: string;
  hasConversation: boolean;
  hasUnreadMessages: boolean;
  unreadCount: number;
  location: 'newMatches' | 'messages';
  lastMessageAt?: string;
  initiatedBy?: string;
}

export interface MatchDisplayLocation {
  location: 'newMatches' | 'messages';
  showNotificationBadge: boolean;
  unreadCount: number;
}

export interface FirstMessageResult {
  conversation: ConversationWithParticipants;
  message: MessageWithSender;
  cardMovement: 'stayInNewMatches' | 'moveToMessages';
}

export class MatchNotificationService {
  private messagingService: MessagingService;

  constructor(messagingService: MessagingService) {
    this.messagingService = messagingService;
  }

  /**
   * Determine where a match card should be displayed
   */
  async getMatchDisplayLocation(
    matchId: string, 
    currentUserId: string
  ): Promise<MatchDisplayLocation> {
    try {
      logger.info('[MatchNotificationService] Getting display location for match:', matchId);

      // Get match details with conversation info
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select(`
          id,
          conversation_id,
          has_unread_messages,
          last_message_at,
          initiated_conversation_by,
          user1_id,
          user2_id
        `)
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        logger.error('[MatchNotificationService] Error fetching match:', matchError);
        throw new MessagingError(
          'Match not found',
          'MATCH_NOT_FOUND',
          { matchId, error: matchError?.message }
        );
      }

      // No conversation exists yet
      if (!match.conversation_id) {
        return {
          location: 'newMatches',
          showNotificationBadge: false,
          unreadCount: 0
        };
      }

      // Get unread count for this user
      const unreadCount = await this.getUnreadCountForMatch(matchId, currentUserId);

      // Determine location based on who initiated the conversation
      if (match.initiated_conversation_by === currentUserId) {
        // Current user messaged first → Always in Messages section
        return {
          location: 'messages',
          showNotificationBadge: false, // No badge needed, user initiated
          unreadCount: unreadCount
        };
      } else if (match.initiated_conversation_by && match.initiated_conversation_by !== currentUserId) {
        // Other user messaged first → Stay in New Matches with badge if unread
        return {
          location: 'newMatches',
          showNotificationBadge: unreadCount > 0,
          unreadCount: unreadCount
        };
      } else {
        // Fallback: conversation exists but no initiator tracked → Messages section
        return {
          location: 'messages',
          showNotificationBadge: false,
          unreadCount: unreadCount
        };
      }

    } catch (error) {
      logger.error('[MatchNotificationService] Error in getMatchDisplayLocation:', error);
      if (error instanceof MessagingError) throw error;
      throw new MessagingError(
        'Failed to determine match display location',
        'MATCH_DISPLAY_ERROR',
        { matchId, currentUserId, error: (error as Error).message }
      );
    }
  }

  /**
   * Handle sending the first message to a new match
   */
  async handleFirstMessage(
    matchId: string,
    senderId: string,
    content: string
  ): Promise<FirstMessageResult> {
    try {
      logger.info('[MatchNotificationService] Handling first message to match:', matchId);

      // Check if conversation already exists
      const existingConversation = await this.messagingService.getConversationByMatchId(matchId);
      
      if (existingConversation) {
        // Conversation exists, just send message
        const message = await this.messagingService.sendMessage(existingConversation.id, content);
        
        return {
          conversation: existingConversation,
          message,
          cardMovement: 'stayInNewMatches' // Already has conversation
        };
      }

      // Create new conversation and send first message
      const conversation = await this.messagingService.ensureConversation(matchId, senderId);
      const message = await this.messagingService.sendMessage(conversation.id, content);

      // Update match to track who initiated the conversation
      await this.updateMatchInitiator(matchId, senderId);

      logger.info(`[MatchNotificationService] First message sent, card should move to messages`);

      return {
        conversation,
        message,
        cardMovement: 'moveToMessages' // User initiated, move to messages
      };

    } catch (error) {
      logger.error('[MatchNotificationService] Error in handleFirstMessage:', error);
      if (error instanceof MessagingError) throw error;
      throw new MessagingError(
        'Failed to handle first message',
        'FIRST_MESSAGE_ERROR',
        { matchId, senderId, error: (error as Error).message }
      );
    }
  }

  /**
   * Update match notification state when new messages arrive
   */
  async updateMatchNotificationState(
    matchId: string,
    hasUnread: boolean,
    lastMessageAt?: string
  ): Promise<void> {
    try {
      logger.info('[MatchNotificationService] Updating notification state:', matchId, hasUnread);

      const updateData: any = {
        has_unread_messages: hasUnread,
        updated_at: new Date().toISOString()
      };

      if (lastMessageAt) {
        updateData.last_message_at = lastMessageAt;
      }

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId);

      if (error) {
        logger.error('[MatchNotificationService] Error updating match notification state:', error);
        throw new MessagingError(
          'Failed to update match notification state',
          'UPDATE_NOTIFICATION_ERROR',
          { matchId, error: error.message }
        );
      }

      logger.info(`[MatchNotificationService] Updated notification state for match ${matchId}`);

    } catch (error) {
      logger.error('[MatchNotificationService] Error in updateMatchNotificationState:', error);
      if (error instanceof MessagingError) throw error;
      throw new MessagingError(
        'Database error while updating notification state',
        'DATABASE_ERROR',
        { matchId, error: (error as Error).message }
      );
    }
  }

  /**
   * Get all match card states for a user
   */
  async getAllMatchCardStates(userId: string): Promise<Record<string, MatchCardState>> {
    try {
      logger.info('[MatchNotificationService] Getting all match card states for user:', userId);

      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          id,
          conversation_id,
          has_unread_messages,
          last_message_at,
          initiated_conversation_by,
          user1_id,
          user2_id,
          created_at
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('[MatchNotificationService] Error fetching match states:', error);
        throw new MessagingError(
          'Failed to fetch match states',
          'FETCH_MATCH_STATES_ERROR',
          { userId, error: error.message }
        );
      }

      const cardStates: Record<string, MatchCardState> = {};

      for (const match of matches || []) {
        const unreadCount = match.conversation_id 
          ? await this.getUnreadCountForMatch(match.id, userId)
          : 0;

        const location = this.determineCardLocation(match, userId, unreadCount);

        cardStates[match.id] = {
          matchId: match.id,
          hasConversation: !!match.conversation_id,
          hasUnreadMessages: match.has_unread_messages || false,
          unreadCount,
          location,
          lastMessageAt: match.last_message_at,
          initiatedBy: match.initiated_conversation_by
        };
      }

      logger.info(`[MatchNotificationService] Retrieved ${Object.keys(cardStates).length} match card states`);
      return cardStates;

    } catch (error) {
      logger.error('[MatchNotificationService] Error in getAllMatchCardStates:', error);
      if (error instanceof MessagingError) throw error;
      throw new MessagingError(
        'Failed to get match card states',
        'GET_CARD_STATES_ERROR',
        { userId, error: (error as Error).message }
      );
    }
  }

  /**
   * Subscribe to match notification changes for real-time updates
   */
  subscribeToMatchNotifications(
    userId: string,
    callback: (matchId: string, state: MatchCardState) => void
  ): () => void {
    logger.info('[MatchNotificationService] Setting up match notifications subscription for user:', userId);

    const subscription = supabase
      .channel(`match_notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${userId}`,
        },
        async (payload) => {
          logger.info('[MatchNotificationService] Match update received:', payload);
          await this.handleMatchUpdate(payload, userId, callback);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `user2_id=eq.${userId}`,
        },
        async (payload) => {
          logger.info('[MatchNotificationService] Match update received:', payload);
          await this.handleMatchUpdate(payload, userId, callback);
        }
      )
      .subscribe();

    return () => {
      logger.info('[MatchNotificationService] Unsubscribing from match notifications');
      supabase.removeChannel(subscription);
    };
  }

  /**
   * Private helper: Get unread count for a specific match
   */
  private async getUnreadCountForMatch(matchId: string, userId: string): Promise<number> {
    try {
      // Get conversation ID for this match
      const { data: match } = await supabase
        .from('matches')
        .select('conversation_id')
        .eq('id', matchId)
        .single();

      if (!match?.conversation_id) {
        return 0;
      }

      // Get unread count from messaging service
      return await this.messagingService.getConversationUnreadCount(match.conversation_id, userId);

    } catch (error) {
      logger.error('[MatchNotificationService] Error getting unread count:', error);
      return 0; // Fail gracefully
    }
  }

  /**
   * Private helper: Determine card location based on match data
   */
  private determineCardLocation(
    match: any, 
    currentUserId: string, 
    unreadCount: number
  ): 'newMatches' | 'messages' {
    if (!match.conversation_id) {
      return 'newMatches'; // No conversation yet
    }

    if (match.initiated_conversation_by === currentUserId) {
      return 'messages'; // User messaged first
    }

    if (match.initiated_conversation_by && match.initiated_conversation_by !== currentUserId) {
      return 'newMatches'; // Other user messaged first, stay in new matches
    }

    return 'messages'; // Fallback to messages
  }

  /**
   * Private helper: Update match initiator
   */
  private async updateMatchInitiator(matchId: string, initiatorId: string): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .update({ 
        initiated_conversation_by: initiatorId,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (error) {
      logger.error('[MatchNotificationService] Error updating match initiator:', error);
      // Don't throw, this is not critical
    }
  }

  /**
   * Private helper: Handle real-time match updates
   */
  private async handleMatchUpdate(
    payload: any,
    userId: string,
    callback: (matchId: string, state: MatchCardState) => void
  ): Promise<void> {
    try {
      const matchId = payload.new?.id || payload.old?.id;
      if (!matchId) return;

      // Get updated card state
      const cardStates = await this.getAllMatchCardStates(userId);
      const cardState = cardStates[matchId];

      if (cardState) {
        callback(matchId, cardState);
      }

    } catch (error) {
      logger.error('[MatchNotificationService] Error handling match update:', error);
    }
  }
} 