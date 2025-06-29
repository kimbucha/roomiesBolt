import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { useSupabaseAuthStore } from './supabaseAuthStore';
import { SupabasePremiumService, SwipeAction, PendingLike } from '../services/supabasePremiumService';

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Action: 'like' | 'superLike';
  user2Action: 'like' | 'superLike';
  status: 'pending' | 'matched' | 'superMatched' | 'mixedMatched';
  conversationId?: string;
  hasRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  name: string;
  image: string;
  university?: string;
  age?: number;
  bio?: string;
}

export interface ProfileWithMatch {
  match: Match;
  profile: Profile;
}

export interface PendingLikeWithProfile {
  action: 'like' | 'superLike';
  profile: Profile;
  timestamp: string;
}

interface SupabaseMatchesState {
  matches: Match[];
  pendingLikes: PendingLike[];
  profiles: Profile[];
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMatches: () => Promise<void>;
  fetchPendingLikes: () => Promise<void>;
  fetchProfiles: () => Promise<void>;
  recordSwipe: (targetUserId: string, action: 'like' | 'pass' | 'superLike') => Promise<boolean>;
  checkPremiumStatus: () => Promise<void>;
  setPremiumStatus: (isPremium: boolean) => void;
  upgradeToPremium: () => Promise<void>;
  startConversation: (matchId: string, conversationId: string) => void;
  deleteMatch: (matchId: string) => Promise<void>;

  // Getters
  getMatches: () => Match[];
  getPendingLikes: () => PendingLike[];
  getProfileById: (id: string) => Profile | undefined;
  getMatchesWithProfiles: () => ProfileWithMatch[];
  getPendingLikesWithProfiles: () => PendingLikeWithProfile[];
  
  // Development utilities
  addMatch: (match: Match) => void;
  setProfiles: (profiles: Profile[]) => void;
  setPendingLikes: (pendingLikes: PendingLike[]) => void;
}

export const useSupabaseMatchesStore = create<SupabaseMatchesState>((set, get) => ({
  matches: [],
  pendingLikes: [],
  profiles: [],
  isPremium: false,
  isLoading: false,
  error: null,

  fetchMatches: async () => {
    const { user } = useSupabaseAuthStore.getState();
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const matches: Match[] = (matchesData || []).map(match => ({
        id: match.id,
        user1Id: match.user1_id,
        user2Id: match.user2_id,
        user1Action: match.user1_action,
        user2Action: match.user2_action,
        status: match.status,
        conversationId: match.conversation_id,
        hasRead: match.has_read || false,
        createdAt: match.created_at,
        updatedAt: match.updated_at
      }));

      set({ matches, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPendingLikes: async () => {
    const { user } = useSupabaseAuthStore.getState();
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const pendingLikes = await SupabasePremiumService.getPendingLikes(user.id);
      set({ pendingLikes, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching pending likes:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchProfiles: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data: profilesData, error } = await supabase
        .from('users')
        .select('id, name, profile_image_url, date_of_birth')
        .limit(50); // Limit for performance

      if (error) throw error;

      const profiles: Profile[] = (profilesData || []).map(profile => ({
        id: profile.id,
        name: profile.name || 'Anonymous',
        image: profile.profile_image_url || 'https://via.placeholder.com/150',
        age: profile.date_of_birth 
          ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
          : undefined
      }));

      set({ profiles, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  recordSwipe: async (targetUserId: string, action: 'like' | 'pass' | 'superLike') => {
    const { user } = useSupabaseAuthStore.getState();
    if (!user) {
      set({ error: 'User not authenticated' });
      return false;
    }

    try {
      const swipeAction: SwipeAction = {
        user_id: user.id,
        target_user_id: targetUserId,
        action
      };

      const success = await SupabasePremiumService.recordSwipe(swipeAction);
      
      if (success) {
        // Refresh matches and pending likes after recording swipe
        await get().fetchMatches();
        await get().fetchPendingLikes();
      }

      return success;
    } catch (error: any) {
      console.error('Error recording swipe:', error);
      set({ error: error.message });
      return false;
    }
  },

  checkPremiumStatus: async () => {
    const { user } = useSupabaseAuthStore.getState();
    if (!user) return;

    try {
      const isPremium = await SupabasePremiumService.checkPremiumStatus(user.id);
      set({ isPremium });
    } catch (error: any) {
      console.error('Error checking premium status:', error);
    }
  },

  setPremiumStatus: (isPremium: boolean) => {
    set({ isPremium });
  },

  upgradeToPremium: async () => {
    const { user } = useSupabaseAuthStore.getState();
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    try {
      const success = await SupabasePremiumService.upgradeToPremium(user.id);
      
      if (success) {
        set({ isPremium: true });
        // Update the auth store as well
        useSupabaseAuthStore.getState().updateUser({ isPremium: true });
      }
    } catch (error: any) {
      console.error('Error upgrading to premium:', error);
      set({ error: error.message });
    }
  },

  startConversation: (matchId: string, conversationId: string) => {
    set(state => ({
      matches: state.matches.map(match =>
        match.id === matchId
          ? { ...match, conversationId }
          : match
      )
    }));
  },

  deleteMatch: async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;

      set(state => ({
        matches: state.matches.filter(match => match.id !== matchId)
      }));
    } catch (error: any) {
      console.error('Error deleting match:', error);
      set({ error: error.message });
    }
  },

  // Getters
  getMatches: () => get().matches,
  
  getPendingLikes: () => get().pendingLikes,
  
  getProfileById: (id: string) => {
    return get().profiles.find(profile => profile.id === id);
  },

  getMatchesWithProfiles: () => {
    const { matches, profiles } = get();
    const { user } = useSupabaseAuthStore.getState();
    
    if (!user) return [];

    return matches.map(match => {
      // In development mode, matches use 'currentUser' as placeholder
      // We need to determine which user is the "other" user to show their profile
      let otherUserId: string;
      
      if (match.user1Id === 'currentUser') {
        // Current user is user1, show user2's profile
        otherUserId = match.user2Id;
      } else if (match.user2Id === 'currentUser') {
        // Current user is user2, show user1's profile  
        otherUserId = match.user1Id;
      } else {
        // Fallback to original logic for production
        otherUserId = match.user1Id === user.id ? match.user2Id : match.user1Id;
      }
      
      console.log(`[SupabaseMatchesStore] Match ${match.id}: user1=${match.user1Id}, user2=${match.user2Id}, otherUser=${otherUserId}`);
      
      const profile = profiles.find(p => p.id === otherUserId);
      
      return {
        match,
        profile: profile || {
          id: otherUserId,
          name: 'Unknown User',
          image: 'https://via.placeholder.com/150'
        }
      };
    }).filter(item => item.profile);
  },

  getPendingLikesWithProfiles: () => {
    const { pendingLikes, profiles } = get();
    
    return pendingLikes.map(like => {
      const profile = profiles.find(p => p.id === like.liker_id);
      
      return {
        action: like.action,
        profile: profile || {
          id: like.liker_id,
          name: like.liker_name || 'Unknown User',
          image: like.liker_image || 'https://via.placeholder.com/150'
        },
        timestamp: like.created_at
      };
    }).filter(item => item.profile);
  },
  
  // Development utilities
  addMatch: (match: Match) => {
    set(state => {
      // When a match is created, remove the matched user from pending likes
      const matchedUserId = match.user2Id; // The person we matched with
      
      // Find pending likes from the matched user
      const initialPendingLikes = state.pendingLikes.filter(like => 
        like.liker_id === matchedUserId || (like as any).userId === matchedUserId
      );
      
      const updatedPendingLikes = state.pendingLikes.filter(like => 
        like.liker_id !== matchedUserId && 
        (like as any).userId !== matchedUserId // Handle both data structures
      );
      
      console.log(`[SupabaseMatchesStore] Adding match ${match.id}, removing user ${matchedUserId} from pending likes`);
      console.log(`[SupabaseMatchesStore] Pending likes before: ${state.pendingLikes.length}, after: ${updatedPendingLikes.length}`);
      console.log(`[SupabaseMatchesStore] Matched user ID: ${matchedUserId}`);
      console.log(`[SupabaseMatchesStore] Found pending likes from matched user:`, initialPendingLikes);
      
      return {
        matches: [...state.matches, match],
        pendingLikes: updatedPendingLikes
      };
    });
  },
  
  setProfiles: (profiles: Profile[]) => {
    set({ profiles });
  },
  
  setPendingLikes: (pendingLikes: PendingLike[]) => {
    set({ pendingLikes });
  }
}));
