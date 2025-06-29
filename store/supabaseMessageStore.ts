import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { useSupabaseAuthStore } from './supabaseAuthStore';
import { Message as ChatMessage } from '../components/Chat';
import { generateId } from '../utils/idGenerator';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

// Define Participant type for clarity
interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

// Conversation interface
export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date | string;
  matchId?: string;
}

interface MessageState {
  messages: Record<string, Message[]>; // conversationId -> messages
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  getMessagesByConversationId: (conversationId: string) => Message[];
  getUnreadCount: (conversationId: string) => number;
  getTotalUnreadCount: () => number;
  setActiveConversation: (conversationId: string | null) => void;
  createConversation: (participantIds: string[], matchId?: string) => Promise<string>;
  getFormattedMessages: (conversationId: string) => ChatMessage[];
  getConversationById: (conversationId: string) => Conversation | undefined;
  
  // Subscription management
  subscribeToMessages: () => Promise<void>;
  unsubscribeFromMessages: () => void;
}

// Helper function to convert database record to Message
const mapDbRecordToMessage = (record: any): Message => {
  return {
    id: record.id,
    conversationId: record.conversation_id,
    senderId: record.sender_id,
    content: record.content,
    timestamp: record.created_at,
    isRead: record.is_read
  };
};

// Helper function to convert database record to Conversation
const mapDbRecordToConversation = (record: any, participants: Participant[], lastMessage?: Message): Conversation => {
  return {
    id: record.id,
    participants,
    lastMessage,
    unreadCount: 0, // Will be calculated separately
    updatedAt: record.updated_at,
    matchId: record.match_id
  };
};

export const useSupabaseMessageStore = create<MessageState>((set, get) => {
  // Store subscription objects to clean up later
  let messageSubscription: any = null;
  
  return {
    messages: {},
    conversations: [],
    activeConversationId: null,
    isLoading: false,
    error: null,
    
    fetchConversations: async () => {
      const { user } = useSupabaseAuthStore.getState();
      if (!user) {
        set({ error: 'User not authenticated' });
        return;
      }
      
      set({ isLoading: true });
      
      try {
        // Fetch all conversations where the current user is a participant
        const { data: participantData, error: participantError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);
          
        if (participantError) throw participantError;
        
        if (!participantData || participantData.length === 0) {
          set({ conversations: [], isLoading: false });
          return;
        }
        
        const conversationIds = participantData.map(item => item.conversation_id);
        
        // Fetch conversation details
        const { data: conversationData, error: conversationError } = await supabase
          .from('conversations')
          .select('*')
          .in('id', conversationIds);
          
        if (conversationError) throw conversationError;
        
        // Fetch participants for each conversation
        const { data: allParticipants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select(`
            conversation_id,
            users!inner(id, name, profile_image_url)
          `)
          .in('conversation_id', conversationIds);
          
        if (participantsError) throw participantsError;
        
        // Group participants by conversation
        const participantsByConversation: Record<string, Participant[]> = {};
        allParticipants.forEach(item => {
          const participant = {
            id: item.users.id,
            name: item.users.name,
            avatar: item.users.profile_image_url
          };
          
          if (!participantsByConversation[item.conversation_id]) {
            participantsByConversation[item.conversation_id] = [];
          }
          
          participantsByConversation[item.conversation_id].push(participant);
        });
        
        // Fetch last message for each conversation
        const { data: lastMessages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (messagesError) throw messagesError;
        
        // Group last messages by conversation
        const lastMessageByConversation: Record<string, Message> = {};
        lastMessages.forEach(message => {
          const formattedMessage = mapDbRecordToMessage(message);
          lastMessageByConversation[message.conversation_id] = formattedMessage;
        });
        
        // Fetch unread counts for each conversation
        const { data: unreadCounts, error: unreadError } = await supabase
          .from('messages')
          .select('conversation_id, count')
          .eq('is_read', false)
          .neq('sender_id', user.id)
          .in('conversation_id', conversationIds)
          .group('conversation_id');
          
        if (unreadError) throw unreadError;
        
        // Group unread counts by conversation
        const unreadCountByConversation: Record<string, number> = {};
        unreadCounts.forEach(item => {
          unreadCountByConversation[item.conversation_id] = parseInt(item.count);
        });
        
        // Construct conversation objects
        const conversations = conversationData.map(conversation => {
          const participants = participantsByConversation[conversation.id] || [];
          const lastMessage = lastMessageByConversation[conversation.id];
          const unreadCount = unreadCountByConversation[conversation.id] || 0;
          
          const formattedConversation = mapDbRecordToConversation(conversation, participants, lastMessage);
          formattedConversation.unreadCount = unreadCount;
          
          return formattedConversation;
        });
        
        // Sort conversations by last message timestamp (most recent first)
        conversations.sort((a, b) => {
          const dateA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
          const dateB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
          return dateB - dateA;
        });
        
        set({ 
          conversations,
          isLoading: false,
          error: null
        });
      } catch (error: any) {
        console.error('Error fetching conversations:', error);
        set({ 
          isLoading: false,
          error: error.message
        });
      }
    },
    
    fetchMessages: async (conversationId) => {
      const { user } = useSupabaseAuthStore.getState();
      if (!user) {
        set({ error: 'User not authenticated' });
        return;
      }
      
      set({ isLoading: true });
      
      try {
        // Fetch messages for the conversation
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        // Map database records to Message objects
        const messages = data.map(mapDbRecordToMessage);
        
        // Update local state
        set(state => ({
          messages: {
            ...state.messages,
            [conversationId]: messages
          },
          isLoading: false,
          error: null
        }));
        
        // Mark messages as read
        await get().markAsRead(conversationId);
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        set({ 
          isLoading: false,
          error: error.message
        });
      }
    },
    
    sendMessage: async (conversationId, content) => {
      const { user } = useSupabaseAuthStore.getState();
      if (!user) {
        set({ error: 'User not authenticated' });
        return;
      }
      
      try {
        const messageId = generateId();
        const now = new Date().toISOString();
        
        // Insert the message into the database
        const { error } = await supabase
          .from('messages')
          .insert({
            id: messageId,
            conversation_id: conversationId,
            sender_id: user.id,
            content,
            created_at: now,
            is_read: false
          });
          
        if (error) throw error;
        
        // Update the conversation's updated_at timestamp
        const { error: updateError } = await supabase
          .from('conversations')
          .update({ updated_at: now })
          .eq('id', conversationId);
          
        if (updateError) throw updateError;
        
        // Create the new message object
        const newMessage: Message = {
          id: messageId,
          conversationId,
          senderId: user.id,
          content,
          timestamp: now,
          isRead: false
        };
        
        // Update local state
        set(state => {
          // Update messages
          const conversationMessages = state.messages[conversationId] || [];
          const updatedMessages = {
            ...state.messages,
            [conversationId]: [...conversationMessages, newMessage]
          };
          
          // Update conversations with the new last message
          const updatedConversations = state.conversations.map(conversation => {
            if (conversation.id === conversationId) {
              return {
                ...conversation,
                lastMessage: newMessage,
                updatedAt: now
              };
            }
            return conversation;
          });
          
          // Sort conversations by last message timestamp (most recent first)
          updatedConversations.sort((a, b) => {
            const dateA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
            const dateB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
            return dateB - dateA;
          });
          
          return {
            messages: updatedMessages,
            conversations: updatedConversations
          };
        });
      } catch (error: any) {
        console.error('Error sending message:', error);
        set({ error: error.message });
      }
    },
    
    markAsRead: async (conversationId) => {
      const { user } = useSupabaseAuthStore.getState();
      if (!user) {
        set({ error: 'User not authenticated' });
        return;
      }
      
      try {
        // Mark all messages in the conversation as read (except those sent by the current user)
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .eq('is_read', false);
          
        if (error) throw error;
        
        // Update local state
        set(state => {
          // Update messages
          const conversationMessages = state.messages[conversationId] || [];
          const updatedMessages = conversationMessages.map(message => {
            if (message.senderId !== user.id) {
              return { ...message, isRead: true };
            }
            return message;
          });
          
          // Update conversations with the new unread count
          const updatedConversations = state.conversations.map(conversation => {
            if (conversation.id === conversationId) {
              return {
                ...conversation,
                unreadCount: 0
              };
            }
            return conversation;
          });
          
          return {
            messages: {
              ...state.messages,
              [conversationId]: updatedMessages
            },
            conversations: updatedConversations
          };
        });
      } catch (error: any) {
        console.error('Error marking messages as read:', error);
        set({ error: error.message });
      }
    },
    
    getMessagesByConversationId: (conversationId) => {
      return get().messages[conversationId] || [];
    },
    
    getUnreadCount: (conversationId) => {
      const conversation = get().conversations.find(c => c.id === conversationId);
      return conversation ? conversation.unreadCount : 0;
    },
    
    getTotalUnreadCount: () => {
      return get().conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);
    },
    
    setActiveConversation: (conversationId) => {
      set({ activeConversationId: conversationId });
      
      // If setting an active conversation, mark messages as read
      if (conversationId) {
        get().markAsRead(conversationId);
      }
    },
    
    createConversation: async (participantIds, matchId) => {
      const { user } = useSupabaseAuthStore.getState();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Ensure the current user is included in participants
      if (!participantIds.includes(user.id)) {
        participantIds = [user.id, ...participantIds];
      }
      
      try {
        const conversationId = generateId();
        const now = new Date().toISOString();
        
        // Create the conversation
        const { error: conversationError } = await supabase
          .from('conversations')
          .insert({
            id: conversationId,
            match_id: matchId,
            created_at: now,
            updated_at: now
          });
          
        if (conversationError) throw conversationError;
        
        // Add participants to the conversation
        const participantRecords = participantIds.map(userId => ({
          conversation_id: conversationId,
          user_id: userId
        }));
        
        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .insert(participantRecords);
          
        if (participantsError) throw participantsError;
        
        // If this conversation is linked to a match, update the match record
        if (matchId) {
          const { error: matchError } = await supabase
            .from('matches')
            .update({ conversation_id: conversationId })
            .eq('id', matchId);
            
          if (matchError) throw matchError;
        }
        
        // Fetch participant details
        const { data: participantData, error: fetchError } = await supabase
          .from('users')
          .select('id, name, profile_image_url')
          .in('id', participantIds);
          
        if (fetchError) throw fetchError;
        
        // Create the conversation object
        const participants = participantData.map(p => ({
          id: p.id,
          name: p.name,
          avatar: p.profile_image_url
        }));
        
        const newConversation: Conversation = {
          id: conversationId,
          participants,
          unreadCount: 0,
          updatedAt: now,
          matchId
        };
        
        // Update local state
        set(state => ({
          conversations: [newConversation, ...state.conversations],
          messages: {
            ...state.messages,
            [conversationId]: []
          }
        }));
        
        return conversationId;
      } catch (error: any) {
        console.error('Error creating conversation:', error);
        throw new Error(error.message);
      }
    },
    
    getFormattedMessages: (conversationId) => {
      const { user } = useSupabaseAuthStore.getState();
      const messages = get().getMessagesByConversationId(conversationId);
      
      if (!user) return [];
      
      return messages.map(message => ({
        _id: message.id,
        text: message.content,
        createdAt: new Date(message.timestamp),
        user: {
          _id: message.senderId,
          name: message.senderId === user.id ? 'You' : 'Other User',
          avatar: message.senderId === user.id ? user.profileImage : undefined
        },
        sent: true,
        received: message.isRead,
        pending: false
      }));
    },
    
    getConversationById: (conversationId) => {
      return get().conversations.find(c => c.id === conversationId);
    },
    
    subscribeToMessages: async () => {
      const { user } = useSupabaseAuthStore.getState();
      if (!user) return;
      
      // Clean up any existing subscription
      get().unsubscribeFromMessages();
      
      // Subscribe to new messages
      messageSubscription = supabase
        .channel('messages-channel')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `sender_id=neq.${user.id}`
          }, 
          async (payload) => {
            const newMessage = mapDbRecordToMessage(payload.new);
            const conversationId = newMessage.conversationId;
            
            // Update local state
            set(state => {
              // Update messages
              const conversationMessages = state.messages[conversationId] || [];
              const updatedMessages = {
                ...state.messages,
                [conversationId]: [...conversationMessages, newMessage]
              };
              
              // Update conversations with the new last message and unread count
              const updatedConversations = state.conversations.map(conversation => {
                if (conversation.id === conversationId) {
                  // Only increment unread count if this isn't the active conversation
                  const shouldIncrementUnread = state.activeConversationId !== conversationId;
                  
                  return {
                    ...conversation,
                    lastMessage: newMessage,
                    updatedAt: newMessage.timestamp,
                    unreadCount: shouldIncrementUnread ? conversation.unreadCount + 1 : conversation.unreadCount
                  };
                }
                return conversation;
              });
              
              // Sort conversations by last message timestamp (most recent first)
              updatedConversations.sort((a, b) => {
                const dateA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
                const dateB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
                return dateB - dateA;
              });
              
              return {
                messages: updatedMessages,
                conversations: updatedConversations
              };
            });
            
            // If this is the active conversation, mark it as read
            if (get().activeConversationId === conversationId) {
              await get().markAsRead(conversationId);
            }
          }
        )
        .subscribe();
    },
    
    unsubscribeFromMessages: () => {
      if (messageSubscription) {
        supabase.removeChannel(messageSubscription);
        messageSubscription = null;
      }
    }
  };
});
