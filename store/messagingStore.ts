import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { MessagingService } from '../services/MessagingService';
import { MatchNotificationService } from '../services/MatchNotificationService';
import { 
  Message, 
  Conversation, 
  ConversationWithMessages,
  MatchCard,
  MessagingStoreState,
  MessagingStoreActions 
} from '../types/messaging';

const messagingService = new MessagingService();
const matchNotificationService = new MatchNotificationService(messagingService);

export const useMessagingStore = create<MessagingStoreState & MessagingStoreActions>()(
  subscribeWithSelector((set, get) => ({
    // State
    conversations: new Map(),
    messages: new Map(),
    newMatches: [],
    activeConversations: [],
    loading: false,
    error: null,
    unreadCounts: new Map(),
    
    // Actions
    async loadConversations(userId: string) {
      set({ loading: true, error: null });
      
      try {
        const conversations = await messagingService.getConversations(userId);
        const conversationsMap = new Map<string, Conversation>();
        
        // CRITICAL FIX: Preserve existing conversations from store before adding new ones
        // This prevents conversations from disappearing when loadConversations is called
        const state = get();
        const existingConversations = state.conversations;
        
        // Start with existing conversations
        existingConversations.forEach((conv, id) => {
          conversationsMap.set(id, conv);
        });
        
        // Add new conversations from service (these will override if same ID)
        conversations.forEach((conv: any) => {
          conversationsMap.set(conv.id, conv);
        });
        
        console.log('[MessagingStore] Loaded conversations:', {
          fromService: conversations.length,
          existing: existingConversations.size,
          total: conversationsMap.size
        });
        
        set({ 
          conversations: conversationsMap,
          loading: false 
        });
        
        // Load match cards after conversations are loaded
        get().loadMatchCards(userId);
      } catch (error) {
        console.error('Failed to load conversations:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load conversations',
          loading: false 
        });
      }
    },

    async loadMatchCards(userId: string) {
      try {
        // For now, create simplified match cards from conversations
        // This will be enhanced when we add the missing service methods
        const state = get();
        const conversations = Array.from(state.conversations.values());
        
        // Convert conversations to match cards (simplified approach)
        const matchCards: MatchCard[] = conversations
          .filter((conv: any) => conv.match_id)
          .map((conv: any) => ({
            id: conv.match_id,
            user1_id: '', // Will be populated when we have match data
            user2_id: '',
            created_at: conv.created_at,
            conversation_id: conv.id,
            has_unread_messages: false, // Will be calculated
            last_message_at: conv.updated_at,
            initiated_conversation_by: undefined,
            otherUser: {
              id: '',
              name: 'Unknown User',
              profile_image_url: undefined
            }
          }));
        
        set({ 
          newMatches: [], // Empty for now
          activeConversations: matchCards 
        });
      } catch (error) {
        console.error('Failed to load match cards:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load match cards'
        });
      }
    },

    async loadMessages(conversationId: string, limit: number = 50, offset: number = 0) {
      const state = get();
      const existingMessages = state.messages.get(conversationId) || [];
      
      // Don't reload if we already have messages and this is the first page
      if (existingMessages.length > 0 && offset === 0) {
        return existingMessages;
      }
      
      try {
        // Convert offset to cursor-based pagination (before parameter)
        const messages = await messagingService.getMessages(conversationId, limit);
        const updatedMessages = offset === 0 ? messages : [...existingMessages, ...messages];
        
        const newMessagesMap = new Map(state.messages);
        newMessagesMap.set(conversationId, updatedMessages);
        
        set({ messages: newMessagesMap });
        return updatedMessages;
      } catch (error) {
        console.error('Failed to load messages:', error);
        throw error;
      }
    },

    async sendMessage(conversationId: string, content: string, senderId: string) {
      try {
        const message = await messagingService.sendMessage(conversationId, content, senderId);
        
        // Update messages in store - CRITICAL: This triggers UI updates
        const state = get();
        const existingMessages = state.messages.get(conversationId) || [];
        const updatedMessages = [message, ...existingMessages];
        
        const newMessagesMap = new Map(state.messages);
        newMessagesMap.set(conversationId, updatedMessages);
        
        // Update conversation last activity
        const conversation = state.conversations.get(conversationId);
        if (conversation) {
          const updatedConversation = {
            ...conversation,
            updated_at: new Date().toISOString()
          };
          const newConversationsMap = new Map(state.conversations);
          newConversationsMap.set(conversationId, updatedConversation);
          set({ conversations: newConversationsMap });
        }
        
        // CRITICAL: Update messages store state to trigger match filtering
        set({ messages: newMessagesMap });
        
        console.log('[MessagingStore] Message sent successfully - store updated with:', {
          conversationId,
          messageCount: updatedMessages.length,
          conversationExists: !!conversation
        });
        
        return message;
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },

    async createConversationFromMatch(matchId: string, initiatorId: string) {
      try {
        const conversation = await messagingService.ensureConversationForMatch(matchId, initiatorId);
        
        // CRITICAL DEBUG: Log the conversation object received from service
        console.log('[MessagingStore] Conversation received from service:', {
          id: conversation.id,
          participantProfiles: (conversation as any).participant_profiles,
          participants: (conversation as any).participants,
          participantProfilesCount: (conversation as any).participant_profiles?.length || 0,
          firstParticipantName: (conversation as any).participant_profiles?.[0]?.name || 'none',
          secondParticipantName: (conversation as any).participant_profiles?.[1]?.name || 'none'
        });
        
        // Add to conversations map
        const state = get();
        const newConversationsMap = new Map(state.conversations);
        newConversationsMap.set(conversation.id, conversation);
        
        set({ conversations: newConversationsMap });
        
        // CRITICAL DEBUG: Verify what was stored
        const storedConversation = newConversationsMap.get(conversation.id);
        console.log('[MessagingStore] Conversation stored in map:', {
          id: storedConversation?.id,
          participantProfiles: (storedConversation as any)?.participant_profiles,
          participants: (storedConversation as any)?.participants,
          participantProfilesCount: (storedConversation as any)?.participant_profiles?.length || 0,
          firstParticipantName: (storedConversation as any)?.participant_profiles?.[0]?.name || 'none',
          secondParticipantName: (storedConversation as any)?.participant_profiles?.[1]?.name || 'none'
        });
        
        // Refresh match cards to update states
        get().loadMatchCards(initiatorId);
        
        return conversation;
      } catch (error) {
        console.error('Failed to create conversation from match:', error);
        throw error;
      }
    },

    async markMessagesAsRead(conversationId: string, userId: string) {
      try {
        await messagingService.markMessagesAsRead(conversationId, userId);
        
        // Update local unread counts
        const state = get();
        const newUnreadCounts = new Map(state.unreadCounts);
        newUnreadCounts.set(conversationId, 0);
        
        set({ unreadCounts: newUnreadCounts });
        
        // Refresh match cards to update notification badges
        get().loadMatchCards(userId);
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
        throw error;
      }
    },

    getConversationWithMessages(conversationId: string): ConversationWithMessages | null {
      const state = get();
      const conversation = state.conversations.get(conversationId);
      const messages = state.messages.get(conversationId) || [];
      
      if (!conversation) return null;
      
      return {
        ...conversation,
        messages
      };
    },

    getUnreadCount(conversationId: string): number {
      const state = get();
      return state.unreadCounts.get(conversationId) || 0;
    },

    getTotalUnreadCount(): number {
      const state = get();
      let total = 0;
      state.unreadCounts.forEach(count => {
        total += count;
      });
      return total;
    },

    // Real-time subscription management (simplified for now)
    subscribeToConversations(userId: string) {
      return messagingService.subscribeToConversations(userId, (conversations: any) => {
        const conversationsMap = new Map<string, Conversation>();
        conversations.forEach((conv: any) => {
          conversationsMap.set(conv.id, conv);
        });
        set({ conversations: conversationsMap });
        
        // Refresh match cards when conversations update
        get().loadMatchCards(userId);
      });
    },

    subscribeToMessages(conversationId: string) {
      return messagingService.subscribeToMessages(conversationId, (messages: any) => {
        const state = get();
        const newMessagesMap = new Map(state.messages);
        newMessagesMap.set(conversationId, messages);
        set({ messages: newMessagesMap });
      });
    },

    subscribeToMatches(userId: string) {
      // For now, return a no-op function since the method doesn't exist yet
      return () => {};
    },

    // Cleanup
    clearError() {
      set({ error: null });
    },

    reset() {
      set({
        conversations: new Map(),
        messages: new Map(),
        newMatches: [],
        activeConversations: [],
        loading: false,
        error: null,
        unreadCounts: new Map(),
      });
    }
  }))
);

// Export selectors for optimized component subscriptions
export const selectConversations = (state: MessagingStoreState) => 
  Array.from(state.conversations.values());

export const selectNewMatches = (state: MessagingStoreState) => 
  state.newMatches;

export const selectActiveConversations = (state: MessagingStoreState) => 
  state.activeConversations;

export const selectLoading = (state: MessagingStoreState) => 
  state.loading;

export const selectError = (state: MessagingStoreState) => 
  state.error; 