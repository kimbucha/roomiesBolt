/**
 * Conversation Repository - Data Access Layer
 * 
 * This repository handles all database operations for conversations,
 * providing a clean abstraction over Supabase operations.
 */

import { supabase } from '../services/supabaseClient';
import { logger } from '../services/Logger';
import {
  Conversation,
  ConversationWithParticipants,
  CreateConversationDTO,
  UpdateConversationDTO,
  Participant,
  ConversationRepository as IConversationRepository,
  ConversationNotFoundError,
  MessagingError
} from '../types/messaging';

export class ConversationRepository implements IConversationRepository {
  
  // CRITICAL FIX: In development mode, maintain a static store of mock conversations
  private static mockConversationsStore = new Map<string, any>();
  
  /**
   * Find all conversations for a specific user
   */
  async findByUserId(userId: string): Promise<any[]> {
    try {
      logger.info('ConversationRepository', `Finding conversations for user: ${userId}`);
      
      // CRITICAL FIX: In development mode, return conversations from our static store
      if (__DEV__) {
        console.log('[ConversationRepository] Development mode - returning conversations from static store');
        
        // Get all conversations from static store
        const allConversations = Array.from(ConversationRepository.mockConversationsStore.values());
        
        // Filter conversations where the user is a participant
        const userConversations = allConversations.filter((conv: any) => {
          if (!conv.participants) return false;
          
          // Check if user is in participants array
          return conv.participants.some((participant: any) => 
            participant.user_id === userId || 
            participant.id === userId ||
            participant.user_id === 'current-user' ||
            participant.id === 'current-user'
          );
        });
        
        console.log('[ConversationRepository] Found conversations in static store:', userConversations.length);
        logger.info('ConversationRepository', `Returning ${userConversations.length} conversations from static store`);
        return userConversations;
      }
      
      // Production database query would go here
      logger.info('ConversationRepository', 'Returning empty conversations (temporary fix)');
      return [];
      
    } catch (error) {
      console.error('[ConversationRepository] Error in findByUserId:', error);
      logger.error('ConversationRepository', `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Find conversation by match ID
   */
  async findByMatchId(matchId: string): Promise<any | null> {
    try {
      logger.info('ConversationRepository', `Finding conversation for match: ${matchId}`);
      
      // CRITICAL FIX: Actually search the static store for conversations with this match_id
      if (__DEV__) {
        console.log('[ConversationRepository] Development mode - searching static store for match_id:', matchId);
        
        // Search through all conversations in static store for one with matching match_id
        for (const [conversationId, conversation] of ConversationRepository.mockConversationsStore.entries()) {
          if (conversation.match_id === matchId) {
            logger.info('ConversationRepository', `Found existing conversation: ${conversationId} for match: ${matchId}`);
            return conversation;
          }
        }
        
        logger.info('ConversationRepository', `No conversation found for match: ${matchId}`);
        return null;
      }
      
      // TODO: In production, query Supabase for conversation with this match_id
      logger.info('ConversationRepository', 'No conversation found (production mode not implemented)');
      return null;
      
    } catch (error) {
      logger.error('ConversationRepository', `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Find conversation by ID
   */
  async findById(id: string): Promise<ConversationWithParticipants | null> {
    try {
      logger.info('[ConversationRepository] Finding conversation by ID:', id);

      const { data, error } = await supabase
        .from('conversation_details')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        logger.error('[ConversationRepository] Error finding conversation by ID:', error);
        throw new MessagingError(
          'Failed to fetch conversation',
          'FETCH_CONVERSATION_ERROR',
          { conversationId: id, error: error.message }
        );
      }

      if (!data) {
        logger.info(`[ConversationRepository] Conversation ${id} not found`);
        return null;
      }

      const conversation = this.mapDbRowToConversation(data);
      logger.info(`[ConversationRepository] Found conversation ${id}`);
      return conversation;

    } catch (error) {
      logger.error('[ConversationRepository] Error in findById:', error);
      if (error instanceof MessagingError) throw error;
      throw new MessagingError(
        'Database error while fetching conversation',
        'DATABASE_ERROR',
        { conversationId: id, error: (error as Error).message }
      );
    }
  }

  /**
   * Create a new conversation
   */
  async create(participants: string[], matchId?: string): Promise<any> {
    try {
      // Enhanced validation and logging for debugging
      console.log('[ConversationRepository] create() called with raw parameters:', {
        participants: participants,
        participantsType: typeof participants,
        participantsIsArray: Array.isArray(participants),
        participantsLength: participants?.length,
        matchId: matchId
      });
      
      // Validate participants parameter
      if (!participants || !Array.isArray(participants)) {
        const error = `Invalid participants parameter: ${JSON.stringify(participants)}`;
        logger.error('ConversationRepository', error);
        throw new Error(error);
      }
      
      logger.info('ConversationRepository', `Creating conversation for participants: ${participants.join(', ')}`);
      
      // Map participant IDs to participant objects with proper profile data
      const participantProfiles = participants.map(participantId => {
        // Handle current user - map the actual UUID to current user
        if (participantId === 'current-user' || participantId.includes('-') || participantId.length > 10) {
          return {
            id: participantId,
            name: 'You', // This should be the current user
            avatar_url: undefined
          };
        }
        
        // Handle any user ID - Get profile data from roommate store
        try {
          const { useRoommateStore } = require('../store/roommateStore');
          const roommateStore = useRoommateStore.getState();
          
          // CRITICAL FIX: Check if availableRoommates exists before accessing
          if (roommateStore && roommateStore.availableRoommates && Array.isArray(roommateStore.availableRoommates)) {
            const userProfile = roommateStore.availableRoommates.find((p: any) => p.id === participantId);
            
            if (userProfile) {
              console.log(`[ConversationRepository] Found profile for ${participantId}: ${userProfile.name}`);
              return {
                id: participantId,
                name: userProfile.name,
                avatar_url: userProfile.image || userProfile.profileImage
              };
            }
          } else {
            console.log('[ConversationRepository] availableRoommates not properly initialized');
          }
        } catch (error) {
          console.log('[ConversationRepository] Could not access roommate store:', error);
        }
        
        // Fallback profiles for specific known users
        if (participantId === 'user2') {
          return {
            id: participantId,
            name: 'Jamie Rodriguez',
            avatar_url: 'https://randomuser.me/api/portraits/women/65.jpg'
          };
        }
        
        if (participantId === 'user4') {
          return {
            id: participantId,
            name: 'Jordan Smith',
            avatar_url: 'https://randomuser.me/api/portraits/women/21.jpg'
          };
        }
        
        if (participantId === 'user7') {
          return {
            id: participantId,
            name: 'Marcus Johnson',
            avatar_url: 'https://randomuser.me/api/portraits/men/25.jpg'
          };
        }
        
        // Generic fallback for any other participants
        return {
          id: participantId,
          name: 'Chat Partner',
          avatar_url: undefined
        };
      });
      
      // CRITICAL FIX: Store participants in the format expected by MessagesSection
      // The participants array should have the profile data embedded
      const participantsWithProfiles = participants.map((participantId, index) => {
        const profile = participantProfiles[index];
        
        // CRITICAL FIX: Current user should be distinguished from other participants
        // Check if this participant is the current user (either by UUID or identifier)
        const isCurrentUser = participantId === 'current-user' || 
                              participantId.includes('-') || 
                              participantId.length > 10;
        
        if (isCurrentUser) {
          return {
            id: 'current-user', // Normalize to 'current-user' for consistency
            name: 'You',
            avatar: profile.avatar_url,
            user_id: participantId // Keep the actual UUID for reference
          };
        }
        
        // For the other participant (like Jamie Rodriguez)
        return {
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar_url,
          user_id: profile.id
        };
      });
      
      // CRITICAL FIX: Generate a proper UUID for conversation ID
      // Use crypto API or timestamp-based UUID format
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      // Temporary: Create a mock conversation with proper participant_profiles structure
      const mockConversation = {
        id: generateUUID(), // Use proper UUID format
        participants: participantsWithProfiles, // Use the enhanced participants
        participant_profiles: participantProfiles, // Keep the original format as backup
        match_id: matchId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('[ConversationRepository] Created conversation with participant profiles:', {
        conversationId: mockConversation.id,
        participants: mockConversation.participants,
        participantProfiles: mockConversation.participant_profiles
      });

      // CRITICAL FIX: Store the conversation in the static store for persistence
      ConversationRepository.mockConversationsStore.set(mockConversation.id, mockConversation);

      logger.info('ConversationRepository', `Created mock conversation: ${mockConversation.id}`);
      return mockConversation;
      
    } catch (error) {
      logger.error('ConversationRepository', `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Update an existing conversation
   */
  async update(id: string, data: UpdateConversationDTO): Promise<ConversationWithParticipants> {
    try {
      logger.info('[ConversationRepository] Updating conversation:', id, data);

      const { error } = await supabase
        .from('conversations')
        .update({
          metadata: data.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        logger.error('[ConversationRepository] Error updating conversation:', error);
        throw new MessagingError(
          'Failed to update conversation',
          'UPDATE_CONVERSATION_ERROR',
          { conversationId: id, error: error.message }
        );
      }

      // Fetch the updated conversation
      const updatedConversation = await this.findById(id);
      if (!updatedConversation) {
        throw new ConversationNotFoundError(id);
      }

      logger.info(`[ConversationRepository] Updated conversation ${id}`);
      return updatedConversation;

    } catch (error) {
      logger.error('[ConversationRepository] Error in update:', error);
      if (error instanceof MessagingError) throw error;
      throw new MessagingError(
        'Database error while updating conversation',
        'DATABASE_ERROR',
        { conversationId: id, error: (error as Error).message }
      );
    }
  }

  /**
   * Delete a conversation and all its messages
   */
  async delete(id: string): Promise<void> {
    try {
      logger.info('[ConversationRepository] Deleting conversation:', id);

      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('[ConversationRepository] Error deleting conversation:', error);
        throw new MessagingError(
          'Failed to delete conversation',
          'DELETE_CONVERSATION_ERROR',
          { conversationId: id, error: error.message }
        );
      }

      logger.info(`[ConversationRepository] Deleted conversation ${id}`);

    } catch (error) {
      logger.error('[ConversationRepository] Error in delete:', error);
      if (error instanceof MessagingError) throw error;
      throw new MessagingError(
        'Database error while deleting conversation',
        'DATABASE_ERROR',
        { conversationId: id, error: (error as Error).message }
      );
    }
  }

  /**
   * Ensure conversation exists for a match, create if it doesn't
   */
  async ensureFromMatch(matchId: string, userId: string): Promise<any> {
    try {
      logger.info('ConversationRepository', `Ensuring conversation for match: ${matchId}`);
      
      // First, try to find existing conversation
      const existingConversation = await this.findByMatchId(matchId);
      if (existingConversation) {
        logger.info('ConversationRepository', `Found existing conversation: ${existingConversation.id}`);
        return existingConversation;
      }

      // CRITICAL FIX: Extract the correct participant from match data instead of hardcoding 'user2'
      let otherParticipantId = 'user2'; // Default fallback
      
      try {
        // Get the actual match data from the matches store to find the correct participant
        const { useSupabaseMatchesStore } = require('../store/supabaseMatchesStore');
        const matchesStore = useSupabaseMatchesStore.getState();
        
        // Find the match by ID
        const match = matchesStore.matches.find((m: any) => m.id === matchId);
        
        if (match) {
          // For Supabase matches: user1Id is currentUser, user2Id is the other participant
          otherParticipantId = match.user2Id || match.user2 || 'user2';
          console.log('[ConversationRepository] Found match data for conversation creation:', {
            matchId,
            user1Id: match.user1Id,
            user2Id: match.user2Id,
            selectedOtherParticipant: otherParticipantId
          });
        } else {
          console.log('[ConversationRepository] Match not found in store, using fallback user2');
        }
      } catch (error) {
        console.log('[ConversationRepository] Could not access matches store, using fallback:', error);
      }

      // Create conversation with the correct participants
      const participants = [userId, otherParticipantId];
      const conversation = await this.create(participants, matchId);

      logger.info('ConversationRepository', `Created new conversation from match: ${conversation.id}`);
      return conversation;
      
    } catch (error) {
      logger.error('ConversationRepository', `Error in ensureFromMatch: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Map database row to ConversationWithParticipants
   */
  private mapDbRowToConversation(
    row: any, 
    currentUserId?: string
  ): ConversationWithParticipants {
    const participants: Participant[] = Array.isArray(row.participants) 
      ? row.participants.map((p: any) => ({
          user_id: p.user_id,
          name: p.name || 'Unknown User',
          avatar_url: p.avatar_url,
          joined_at: p.joined_at,
          last_read_at: p.last_read_at,
          notification_settings: {}
        }))
      : [];

    // Find the other participant for 1-on-1 conversations
    const otherParticipant = currentUserId 
      ? participants.find(p => p.user_id !== currentUserId)
      : undefined;

    const conversation: ConversationWithParticipants = {
      id: row.id,
      match_id: row.match_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_message_id: row.last_message_id,
      participant_count: row.participant_count,
      metadata: row.metadata || {},
      participants,
      other_participant: otherParticipant,
      unread_count: 0 // Will be calculated separately if needed
    };

    // Add last message if available
    if (row.last_message_content) {
      conversation.last_message = {
        id: row.last_message_id,
        conversation_id: row.id,
        sender_id: row.last_message_sender_id,
        content: row.last_message_content,
        message_type: 'text',
        created_at: row.last_message_created_at,
        updated_at: row.last_message_created_at,
        read_receipts: {},
        metadata: {}
      };
    }

    return conversation;
  }
} 