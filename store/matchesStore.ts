import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/idGenerator';
import { useSupabaseAuthStore } from './supabaseAuthStore';

// Types for the matching system
export type SwipeAction = 'like' | 'superLike' | 'pass';
export type MatchStatus = 'pending' | 'matched' | 'superMatched' | 'mixedMatched';

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Action?: SwipeAction;
  user2Action?: SwipeAction;
  status: MatchStatus;
  createdAt: number;
  updatedAt: number;
  hasRead: boolean;
  conversationId?: string; // If a conversation has been started
}

interface MatchesState {
  matches: Match[];
  pendingLikes: { userId: string; action: SwipeAction; timestamp: number }[];
  isPremium: boolean;
  
  // Actions
  handleSwipe: (targetUserId: string, action: SwipeAction) => Promise<Match | null>;
  getMatches: () => Match[];
  getPendingLikes: () => { userId: string; action: SwipeAction; timestamp: number }[];
  setPremiumStatus: (status: boolean) => void;
  markMatchAsRead: (matchId: string) => void;
  deleteMatch: (matchId: string) => void;
  startConversation: (matchId: string, conversationId: string) => void;
  
  // Testing utilities
  setMatches: (matches: Match[]) => void;
  setPendingLikes: (likes: { userId: string; action: SwipeAction; timestamp: number }[]) => void;
}

export const useMatchesStore = create<MatchesState>()(
  persist(
    (set, get) => ({
      matches: [],
      pendingLikes: [],
      isPremium: false,

      handleSwipe: async (targetUserId, action) => {
        const currentUserId = useSupabaseAuthStore.getState().user?.id;
        if (!currentUserId) return null;

        const now = Date.now();
        const currentState = get();
        
        // Check if there's already a match object for these users
        let existingMatch = currentState.matches.find(
          m => (m.user1Id === currentUserId && m.user2Id === targetUserId) || 
               (m.user1Id === targetUserId && m.user2Id === currentUserId)
        );

        // If the target user has already liked/superliked the current user
        const pendingLikeIndex = currentState.pendingLikes.findIndex(
          p => p.userId === targetUserId
        );

        if (pendingLikeIndex !== -1) {
          const pendingLike = currentState.pendingLikes[pendingLikeIndex];
          const newPendingLikes = [...currentState.pendingLikes];
          newPendingLikes.splice(pendingLikeIndex, 1);

          // Create a new match or update existing match
          let newMatch: Match;
          if (existingMatch) {
            // Update existing match
            newMatch = {
              ...existingMatch,
              user2Action: action,
              updatedAt: now,
              status: determineMatchStatus(pendingLike.action, action),
              hasRead: false,
            };
          } else {
            // Create new match
            newMatch = {
              id: generateId(),
              user1Id: targetUserId,
              user2Id: currentUserId,
              user1Action: pendingLike.action,
              user2Action: action,
              status: determineMatchStatus(pendingLike.action, action),
              createdAt: now,
              updatedAt: now,
              hasRead: false,
            };
          }

          set(state => ({
            matches: existingMatch 
              ? state.matches.map(m => m.id === existingMatch?.id ? newMatch : m)
              : [...state.matches, newMatch],
            pendingLikes: newPendingLikes
          }));

          const result = newMatch;
          if (result) {
            get().startConversation(result.id, result.id);
          }
          return result;
        } else {
          // The target user hasn't liked the current user yet
          if (action === 'pass') {
            // If passing, just return null, no need to track passes
            return null;
          }

          // If we already have a match object but the other user hasn't acted yet
          if (existingMatch) {
            const updatedMatch = {
              ...existingMatch,
              user1Action: existingMatch.user1Id === currentUserId ? action : existingMatch.user1Action,
              user2Action: existingMatch.user2Id === currentUserId ? action : existingMatch.user2Action,
              updatedAt: now,
            };
            
            set(state => ({
              matches: state.matches.map(m => m.id === existingMatch?.id ? updatedMatch : m)
            }));
            
            return updatedMatch;
          }

          // Add to pending likes
          set(state => ({
            pendingLikes: [
              ...state.pendingLikes,
              { userId: currentUserId, action: action, timestamp: now }
            ]
          }));

          return null;
        }
      },

      getMatches: () => {
        const currentUserId = useSupabaseAuthStore.getState().user?.id;
        if (!currentUserId) return [];

        return get().matches.filter(
          m => (m.user1Id === currentUserId || m.user2Id === currentUserId) &&
               (m.status === 'matched' || m.status === 'superMatched' || m.status === 'mixedMatched')
        );
      },

      getPendingLikes: () => {
        const currentUserId = useSupabaseAuthStore.getState().user?.id;
        if (!currentUserId || !get().isPremium) return [];

        return get().pendingLikes.filter(p => p.userId !== currentUserId);
      },

      setPremiumStatus: (status) => {
        set({ isPremium: status });
      },

      markMatchAsRead: (matchId) => {
        set(state => ({
          matches: state.matches.map(m => 
            m.id === matchId ? { ...m, hasRead: true } : m
          )
        }));
      },

      deleteMatch: (matchId) => {
        set(state => ({
          matches: state.matches.filter(m => m.id !== matchId)
        }));
      },

      startConversation: (matchId, conversationId) => {
        set(state => ({
          matches: state.matches.map(m => 
            m.id === matchId ? { ...m, conversationId } : m
          )
        }));
      },

      // Add these methods for testing
      setMatches: (matches: Match[]) => {
        set({ matches });
      },
      
      setPendingLikes: (likes: { userId: string; action: SwipeAction; timestamp: number }[]) => {
        set({ pendingLikes: likes });
      }
    }),
    {
      name: 'matches-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper function to determine match status based on both users' actions
function determineMatchStatus(action1: SwipeAction, action2: SwipeAction): MatchStatus {
  if (action1 === 'pass' || action2 === 'pass') return 'pending';
  if (action1 === 'superLike' && action2 === 'superLike') return 'superMatched';
  if (action1 === 'superLike' || action2 === 'superLike') return 'mixedMatched';
  return 'matched';
} 