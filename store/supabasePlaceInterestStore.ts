import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';

// Types for place interest tracking
export interface PlaceInterest {
  id: string;
  place_id: string;           // Which place
  user_id: string;            // Who's interested
  owner_id: string;           // Place owner
  action: 'saved' | 'messaged'; // Type of interest
  status: 'new' | 'contacted' | 'responded';
  created_at: string;
  updated_at: string;
}

export interface PlaceInterestWithProfile {
  interest: PlaceInterest;
  userProfile: {
    id: string;
    name: string;
    image?: string;
    age?: number;
    university?: string;
    bio?: string;
  };
}

interface PlaceInterestState {
  interests: PlaceInterest[];
  isLoading: boolean;
  error: string | null;
  
  // Actions for place seekers
  savePlace: (placeId: string, ownerId: string) => Promise<boolean>;
  messagePlace: (placeId: string, ownerId: string) => Promise<boolean>;
  getMyInterests: () => PlaceInterest[];
  
  // Actions for place owners
  getInterestedUsers: (placeId: string) => Promise<PlaceInterestWithProfile[]>;
  markAsContacted: (interestId: string) => Promise<boolean>;
  markAsResponded: (interestId: string) => Promise<boolean>;
  
  // Data fetching
  fetchInterests: () => Promise<void>;
  fetchInterestsForPlace: (placeId: string) => Promise<PlaceInterest[]>;
}

export const useSupabasePlaceInterestStore = create<PlaceInterestState>((set, get) => ({
  interests: [],
  isLoading: false,
  error: null,

  savePlace: async (placeId: string, ownerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already saved
      const existing = get().interests.find(
        i => i.place_id === placeId && i.user_id === user.id && i.action === 'saved'
      );
      
      if (existing) {
        console.log('[PlaceInterest] Place already saved');
        return true;
      }

      const { data, error } = await supabase
        .from('place_interests')
        .insert({
          place_id: placeId,
          user_id: user.id,
          owner_id: ownerId,
          action: 'saved',
          status: 'new'
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      set(state => ({
        interests: [...state.interests, data]
      }));

      console.log('[PlaceInterest] Place saved successfully');
      return true;
    } catch (error) {
      console.error('[PlaceInterest] Error saving place:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to save place' });
      return false;
    }
  },

  messagePlace: async (placeId: string, ownerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already messaged
      const existing = get().interests.find(
        i => i.place_id === placeId && i.user_id === user.id && i.action === 'messaged'
      );
      
      if (existing) {
        console.log('[PlaceInterest] Place already messaged');
        return true;
      }

      const { data, error } = await supabase
        .from('place_interests')
        .insert({
          place_id: placeId,
          user_id: user.id,
          owner_id: ownerId,
          action: 'messaged',
          status: 'contacted'
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      set(state => ({
        interests: [...state.interests, data]
      }));

      console.log('[PlaceInterest] Place message interest created');
      return true;
    } catch (error) {
      console.error('[PlaceInterest] Error creating message interest:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to message place' });
      return false;
    }
  },

  getMyInterests: () => {
    return get().interests;
  },

  getInterestedUsers: async (placeId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('place_interests')
        .select(`
          *,
          user_profiles!place_interests_user_id_fkey (
            id,
            name,
            profile_picture_url,
            age,
            university,
            bio
          )
        `)
        .eq('place_id', placeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include user profiles
      const interestedUsers: PlaceInterestWithProfile[] = data.map(item => ({
        interest: {
          id: item.id,
          place_id: item.place_id,
          user_id: item.user_id,
          owner_id: item.owner_id,
          action: item.action,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at
        },
        userProfile: {
          id: item.user_profiles.id,
          name: item.user_profiles.name,
          image: item.user_profiles.profile_picture_url,
          age: item.user_profiles.age,
          university: item.user_profiles.university,
          bio: item.user_profiles.bio
        }
      }));

      return interestedUsers;
    } catch (error) {
      console.error('[PlaceInterest] Error fetching interested users:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch interested users' });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  markAsContacted: async (interestId: string) => {
    try {
      const { error } = await supabase
        .from('place_interests')
        .update({ 
          status: 'contacted',
          updated_at: new Date().toISOString()
        })
        .eq('id', interestId);

      if (error) throw error;

      // Update local state
      set(state => ({
        interests: state.interests.map(interest =>
          interest.id === interestId 
            ? { ...interest, status: 'contacted' as const }
            : interest
        )
      }));

      return true;
    } catch (error) {
      console.error('[PlaceInterest] Error marking as contacted:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update status' });
      return false;
    }
  },

  markAsResponded: async (interestId: string) => {
    try {
      const { error } = await supabase
        .from('place_interests')
        .update({ 
          status: 'responded',
          updated_at: new Date().toISOString()
        })
        .eq('id', interestId);

      if (error) throw error;

      // Update local state
      set(state => ({
        interests: state.interests.map(interest =>
          interest.id === interestId 
            ? { ...interest, status: 'responded' as const }
            : interest
        )
      }));

      return true;
    } catch (error) {
      console.error('[PlaceInterest] Error marking as responded:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update status' });
      return false;
    }
  },

  fetchInterests: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('place_interests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ interests: data || [] });
    } catch (error) {
      console.error('[PlaceInterest] Error fetching interests:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch interests' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchInterestsForPlace: async (placeId: string) => {
    try {
      const { data, error } = await supabase
        .from('place_interests')
        .select('*')
        .eq('place_id', placeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[PlaceInterest] Error fetching place interests:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch place interests' });
      return [];
    }
  }
}));