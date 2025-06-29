import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Message as ChatMessage } from '../components/Chat';
// Import necessary stores and types
import { useUserStore } from './userStore';
import { useMatchesStore } from './matchesStore';
import { useRoommateStore, RoommateProfile } from './roommateStore';
import { User } from './userStore';
import { Match } from './matchesStore';
import { useSupabaseAuthStore } from './supabaseAuthStore';  // Use authStore for current user in messaging

export interface Message {
  id: string;
  matchId: string;
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
  participants: Participant[]; // Use the defined type
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date | string;
}

interface MessageState {
  messages: Record<string, Message[]>; // matchId -> messages
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  unreadCount: number; // Add the missing unreadCount property
  sendMessage: (matchId: string, content: string, currentUserId: string) => void;
  markAsRead: (matchId: string) => void;
  getMessagesByMatchId: (matchId: string) => Message[];
  getUnreadCount: (matchId: string) => number;
  getTotalUnreadCount: () => number;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  createConversation: (participantIds: string[], matchId?: string) => Promise<string>;
  getFormattedMessages: (matchId: string, currentUserId: string) => ChatMessage[];
  getConversationById: (conversationId: string) => Conversation | undefined;
}

// Sample messages for demo
const sampleMessages: Record<string, Message[]> = {
  'match-1': [
    {
      id: '1',
      matchId: 'match-1',
      senderId: '1', // Alex
      content: 'What area of the city are you looking to live in?',
      timestamp: '2025-02-26T18:30:00.000Z',
      isRead: true,
    },
    {
      id: '2',
      matchId: 'match-1',
      senderId: 'current-user', // current user
      content: 'I was thinking downtown or maybe the university district. You?',
      timestamp: '2025-02-26T18:35:00.000Z',
      isRead: true,
    },
    {
      id: '3',
      matchId: 'match-1',
      senderId: '1', // Alex
      content: 'What area of the city are you looking to live in?',
      timestamp: '2025-02-26T18:40:00.000Z',
      isRead: false,
    },
  ],
  'match-2': [
    {
      id: '4',
      matchId: 'match-2',
      senderId: '2', // Jamie
      content: 'Hey, just checking in. How\'s your apartment hunt going?',
      timestamp: '2025-02-25T14:20:00.000Z',
      isRead: true,
    },
    {
      id: '5',
      matchId: 'match-2',
      senderId: 'current-user',
      content: 'Still looking! Found a few places but nothing perfect yet.',
      timestamp: '2025-02-25T14:25:00.000Z',
      isRead: true,
    },
    {
      id: '6',
      matchId: 'match-2',
      senderId: '2',
      content: 'Hey, just checking in. How\'s your apartment hunt going?',
      timestamp: '2025-02-25T14:30:00.000Z',
      isRead: false,
    },
  ],
  'match-3': [
    {
      id: '7',
      matchId: 'match-3',
      senderId: '3', // Jordan
      content: 'What area of the city are you looking to live in?',
      timestamp: '2025-02-24T09:15:00.000Z',
      isRead: true,
    },
    {
      id: '8',
      matchId: 'match-3',
      senderId: 'current-user',
      content: 'I\'m flexible, but prefer somewhere with good public transport.',
      timestamp: '2025-02-24T09:20:00.000Z',
      isRead: true,
    },
    {
      id: '9',
      matchId: 'match-3',
      senderId: '3',
      content: 'What area of the city are you looking to live in?',
      timestamp: '2025-02-24T09:25:00.000Z',
      isRead: false,
    },
  ],
  'match-4': [
    {
      id: '10',
      matchId: 'match-4',
      senderId: '4', // Taylor
      content: 'Hey, just checking in. How\'s your apartment hunt going?',
      timestamp: '2025-02-23T16:40:00.000Z',
      isRead: true,
    },
    {
      id: '11',
      matchId: 'match-4',
      senderId: 'current-user',
      content: 'Found a few places but still looking for the right fit.',
      timestamp: '2025-02-23T16:45:00.000Z',
      isRead: true,
    },
    {
      id: '12',
      matchId: 'match-4',
      senderId: '4',
      content: 'Hey, just checking in. How\'s your apartment hunt going?',
      timestamp: '2025-02-23T16:50:00.000Z',
      isRead: false,
    },
  ],
  'match-5': [
    {
      id: '13',
      matchId: 'match-5',
      senderId: '5', // Morgan
      content: 'What area of the city are you looking to live in?',
      timestamp: '2025-02-22T11:10:00.000Z',
      isRead: true,
    },
    {
      id: '14',
      matchId: 'match-5',
      senderId: 'current-user',
      content: 'I\'m looking at the east side, close to the park.',
      timestamp: '2025-02-22T11:15:00.000Z',
      isRead: true,
    },
    {
      id: '15',
      matchId: 'match-5',
      senderId: '5',
      content: 'What area of the city are you looking to live in?',
      timestamp: '2025-02-22T11:20:00.000Z',
      isRead: false,
    },
  ],
};

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messages: sampleMessages,
      conversations: [],
      activeConversationId: null,
      isLoading: false,
      error: null,
      unreadCount: 0, // Initialize the unreadCount property
      sendMessage: (conversationId: string, content: string, currentUserId: string) => {
        // Create the new message
        const newMessage: Message = {
          id: Date.now().toString(),
          matchId: conversationId, // Use conversationId as matchId to ensure consistency
          senderId: currentUserId,
          content,
          timestamp: new Date().toISOString(),
          isRead: true,
        };
        
        set((state) => {
          // Get existing messages for this conversation
          const prev = state.messages[conversationId] || [];
          const updated = [...prev, newMessage];
          
          // Always check and update match conversation ID, not just for the first message
          // This ensures matches are properly removed from "New Matches" section
          
          // Find if there's a match with this ID or with this conversationId
          const matchesStore = require('./matchesStore').useMatchesStore.getState();
          const allMatches = matchesStore.matches;
          
          // Check if this is a match-based conversation (conv_match-*)
          const isMatchConversation = conversationId.startsWith('conv_match');
          const matchId = isMatchConversation ? conversationId.replace('conv_', '') : null;
          
          if (matchId) {
            // If we have a direct match ID from the conversation ID
            const matchById = allMatches.find((m: any) => m.id === matchId);
            if (matchById && (!matchById.conversationId || matchById.conversationId !== conversationId)) {
              console.log(`[MessageStore] Updating match ${matchId} with conversation ID ${conversationId}`);
              matchesStore.startConversation(matchId, conversationId);
            }
          }
          
          // Also look for any match that might be related to this conversation
          const matchWithThisConversation = allMatches.find((m: any) => 
            m.conversationId === conversationId || m.id === conversationId
          );
          
          if (matchWithThisConversation) {
            console.log(`[MessageStore] Found match ${matchWithThisConversation.id} with conversation ${conversationId}`);
            // Ensure the match has the correct conversationId
            if (!matchWithThisConversation.conversationId || matchWithThisConversation.conversationId !== conversationId) {
              console.log(`[MessageStore] Updating match ${matchWithThisConversation.id} with conversation ID ${conversationId}`);
              matchesStore.startConversation(matchWithThisConversation.id, conversationId);
            }
          }
          
          // Find the conversation in the current state
          const conversation = state.conversations.find(c => c.id === conversationId);
          
          // Update the conversations list to include this message
          const updatedConversations = conversation 
            ? state.conversations.map(c => {
                if (c.id === conversationId) {
                  console.log(`[MessageStore] Updating existing conversation ${conversationId} with new message`);
                  return {
                    ...c,
                    lastMessage: newMessage,
                    updatedAt: new Date().toISOString(),
                  };
                }
                return c;
              })
            : [
                ...state.conversations,
                // If conversation doesn't exist, create a new one
                {
                  id: conversationId,
                  participants: [
                    { id: currentUserId, name: 'You' },
                    // We'll update this with proper data in fetchConversations
                    { id: 'temp-user', name: 'Match' }
                  ],
                  lastMessage: newMessage,
                  unreadCount: 0,
                  updatedAt: new Date().toISOString(),
                }
              ];
          
          // console.log(`[MessageStore] Message sent, conversations count: ${updatedConversations.length}`);
          
          return {
            messages: {
              ...state.messages,
              [conversationId]: updated,
            },
            conversations: updatedConversations,
          };
        });
        
        // After sending the message, trigger a fetch of conversations to ensure UI updates
        setTimeout(() => {
          const { fetchConversations } = get();
          fetchConversations().catch(err => console.error('[MessageStore] Error refreshing conversations after message:', err));
        }, 100);
      },
      markAsRead: (matchId: string) => {
        set((state) => {
          const matchMessages = state.messages[matchId] || [];
          const updatedMessages = matchMessages.map((msg: Message) => ({
            ...msg,
            isRead: true,
          }));
          
          return {
            messages: {
              ...state.messages,
              [matchId]: updatedMessages,
            },
          };
        });
      },
      getMessagesByMatchId: (matchId: string) => {
        return get().messages[matchId] || [];
      },
      getUnreadCount: (matchId: string) => {
        const messages = get().messages[matchId] || [];
        return messages.filter((msg: Message) => !msg.isRead && msg.senderId !== 'current-user').length;
      },
      getTotalUnreadCount: () => {
        const { messages } = get();
        let count = 0;
        
        Object.values(messages).forEach(matchMessages => {
          matchMessages.forEach(message => {
            if (!message.isRead) {
              count++;
            }
          });
        });
        
        return count;
      },
      fetchConversations: async () => {
        // console.log('[MessageStore] Fetching conversations based on actual matches...');
        set({ isLoading: true, error: null });

        try {
          const { user: currentUser } = useSupabaseAuthStore.getState();  // Get current user from supabaseAuthStore
          
          // Early return if no current user
          if (!currentUser) {
            console.warn('[MessageStore] No current user found');
            set({ isLoading: false, error: 'User not authenticated' });
            return;
          }
          
          const matchesStore = useMatchesStore.getState();
          // Only consider matches with an existing conversation
          const actualMatches = matchesStore.matches.filter(m => m.conversationId && (m.user1Id === currentUser.id || m.user2Id === currentUser.id));
          // console.log(`[MessageStore] Found ${actualMatches.length} actual matches.`);
        
          // Map matches to Conversation objects or null
          const newConversationsWithNulls: (Conversation | null)[] = actualMatches.map(match => {
            // Safe to use currentUser here since we checked above
            const otherUserId = match.user1Id === currentUser.id ? match.user2Id : match.user1Id;
            const otherUserProfile = useRoommateStore.getState().getById(otherUserId);

            // Return null early if profile is missing
            if (!otherUserProfile) {
                console.warn(`[MessageStore] Profile not found for user ID: ${otherUserId} in match ${match.id}`);
                return null; 
            }

            const matchMessages = get().messages[match.id] || [];
            const lastMessage = matchMessages.length > 0 ? matchMessages[matchMessages.length - 1] : undefined;
            const unreadCount = matchMessages.filter(msg => !msg.isRead && msg.senderId === otherUserId).length;
            const updatedAt = lastMessage ? new Date(lastMessage.timestamp) : new Date(match.createdAt);

            const currentUserParticipant: Participant = { 
                id: currentUser.id, 
                name: currentUser.name, 
                avatar: undefined // User doesn't have a profile picture field
            };
            const otherUserParticipant: Participant = { 
                id: otherUserProfile.id, 
                name: otherUserProfile.name, 
                avatar: otherUserProfile.image || undefined 
            };

            // Explicitly create the Conversation object
            const conversation: Conversation = {
              id: match.conversationId || `conv_${match.id}`,
              participants: [
                {
                  id: 'currentUser',
                  name: currentUser.name,
                  avatar: undefined, // User doesn't have a profile picture field
                },
                {
                  id: otherUserId,
                  name: otherUserProfile.name,
                  avatar: otherUserProfile.image || undefined,
                }
              ],
              lastMessage: lastMessage, 
              unreadCount,
              updatedAt
            };
            return conversation; // Return the typed object
          });
          
          // Filter out the null values using the type predicate
          const newConversations: Conversation[] = newConversationsWithNulls.filter((convo): convo is Conversation => convo !== null);
          
          // Sort the valid conversations
          newConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

          // console.log(`[MessageStore] Generated ${newConversations.length} conversations.`);
          set({ conversations: newConversations, isLoading: false });

        } catch (err) {
          console.error('[MessageStore] Error fetching conversations:', err);
          set({ error: err instanceof Error ? err.message : 'Failed to fetch conversations', isLoading: false });
        }
      },
      fetchMessages: async (conversationId) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Fetch messages for the conversation
          const messages = get().getMessagesByMatchId(conversationId);
          
          // Find the conversation in the conversations array
          const conversation = get().conversations.find(c => c.id === conversationId);
          
          // If conversation not found, fetch conversations first to ensure it's loaded
          if (!conversation) {
            await get().fetchConversations();
          }
          
          // Set the active conversation ID
          set({ 
            activeConversationId: conversationId,
            messages: { ...get().messages, [conversationId]: messages }, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching messages:', error);
          set({ 
            error: 'Failed to fetch messages. Please try again.', 
            isLoading: false 
          });
        }
      },
      setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId });
        
        if (conversationId) {
          get().markAsRead(conversationId);
        }
      },
      createConversation: async (participantIds: string[], matchId?: string): Promise<string> => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Create conversation ID based on match ID if provided, otherwise use participant IDs
          const conversationId = matchId ? `conv_${matchId}` : `conv_${participantIds.join('_')}`;
          
          // Get data from stores for better participant information
          const roommateStore = require('../store/roommateStore').useRoommateStore.getState();
          const matchesStore = require('./matchesStore').useMatchesStore.getState();
          
          // Import mock profiles to get proper names
          const { mockProfiles } = require('../utils/mockDataSetup');
          
          // Create a map for quick profile lookups
          const profileMap: Record<string, any> = {};
          mockProfiles.forEach((profile: any) => {
            profileMap[profile.id] = profile;
          });
          
          // If we have a matchId, get the match details
          let matchData = null;
          if (matchId) {
            matchData = matchesStore.matches.find((m: any) => m.id === matchId);
            console.log("Found match data:", matchData);
            
            // Update the match with the conversation ID
            // This is critical for removing the match from the "New Matches" section
            if (matchData) {
              console.log(`[MessageStore] Updating match ${matchId} with conversation ID ${conversationId}`);
              matchesStore.startConversation(matchId, conversationId);
            }
          }
          
          // Create the conversation object
          const newConversation: Conversation = {
            id: conversationId,
            participants: participantIds.map((participantId: string) => {
              // If it's the current user, use a placeholder
              if (participantId === 'currentUser') {
                return {
                  id: participantId,
                  name: 'You',
                  avatar: 'https://i.pravatar.cc/150?u=currentUser',
                };
              }
              
              // If we have match data and this is the other user in the match
              if (matchData) {
                // Find the profile associated with this match
                const otherUserId = matchData.user1Id === 'currentUser' ? matchData.user2Id : matchData.user1Id;
                if (participantId === otherUserId) {
                  // Get the profile from the roommate store
                  const matchProfile = roommateStore.roommates.find((r: any) => r.id === otherUserId);
                  if (matchProfile) {
                    return {
                      id: participantId,
                      name: matchProfile.name,
                      avatar: matchProfile.image,
                    };
                  }
                }
              }
              
              // Otherwise, look up the profile in the general profile map
              const userProfile = profileMap[participantId];
              if (userProfile) {
                return {
                  id: participantId,
                  name: userProfile.name,
                  avatar: userProfile.image,
                };
              }
              
              // Fallback for unrecognized IDs
              return {
                id: participantId,
                name: `User ${participantId}`,
                avatar: `https://i.pravatar.cc/150?u=${participantId}`,
              };
            }),
            unreadCount: 0,
            updatedAt: new Date().toISOString(),
          };
          
          // Add conversation to messageStore state
          set((state: MessageState) => ({
            conversations: [
              newConversation,
              ...state.conversations,
            ],
            messages: {
              ...state.messages,
              [conversationId]: [],
            },
            isLoading: false,
          }));
          
          // Return the conversation ID
          return conversationId;
        } catch (error) {
          set({ 
            error: 'Failed to create conversation. Please try again.', 
            isLoading: false 
          });
          console.error('Error creating conversation:', error);
          return '';
        }
      },
      getFormattedMessages: (matchId, currentUserId) => {
        const messages = get().getMessagesByMatchId(matchId);
        const conversation = get().getConversationById(matchId);
        
        // If we have no conversation data yet, return empty messages
        if (!conversation) {
          return [];
        }
        
        // Get the other participant's info from the conversation
        const otherParticipant = conversation.participants.find(p => p.id !== 'currentUser' && p.id !== 'current-user');
        
        return messages.map(message => {
          const isMe = message.senderId === currentUserId;
          
          return {
            id: message.id,
            text: message.content,
            sender: {
              id: message.senderId,
              name: isMe ? 'You' : otherParticipant?.name || `User ${message.senderId}`,
              avatar: isMe ? undefined : otherParticipant?.avatar || `https://i.pravatar.cc/150?u=${message.senderId}`,
            },
            timestamp: message.timestamp,
            status: isMe ? (message.isRead ? 'read' : 'delivered') : 'sent',
            isMe,
          };
        });
      },
      getConversationById: (conversationId) => {
        return get().conversations.find(c => c.id === conversationId);
      },
    }),
    {
      name: 'message-storage', 
      storage: createJSONStorage(() => AsyncStorage), 
       partialize: (state) => ({
         // Persist only messages, let conversations rebuild on load
         messages: state.messages,
       }),
    }
  )
);
