// =============================================
// SUPABASE-FIRST ROOMMATE SERVICE
// Clean, simple service with Supabase as primary source of truth
// =============================================

import { supabase } from './supabaseClient';

// =============================================
// TYPES
// =============================================

export interface RoommateProfile {
  id: string;
  user_id?: string;
  name: string;
  age: number;
  bio: string;
  profile_image_url: string;
  additional_images?: string[];
  location: string;
  university?: string;
  hasPlace: boolean;
  
  // Place details (if hasPlace = true)
  place_title?: string;
  place_description?: string;
  rent_amount?: number;
  room_type?: string;
  furnished?: boolean;
  amenities?: string[];
  
  // Lifestyle
  personality_type?: string;
  lifestyle_preferences?: any;
  matchScenario?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface SwipeRecord {
  id: string;
  user_id: string;
  target_profile_id: string;
  swipe_type: 'like' | 'dislike' | 'super_like';
  created_at: string;
}

export interface MatchRecord {
  id: string;
  user_id: string;
  target_profile_id: string;
  target_user_id: string;
  match_type: 'regular' | 'super' | 'mixed' | 'place_interest';
  is_mutual: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================
// SUPABASE ROOMMATE SERVICE
// =============================================

class SupabaseRoommateService {
  
  // =============================================
  // AUTHENTICATION
  // =============================================
  
  private async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('[SupabaseRoommateService] Auth error:', error);
      return null;
    }
    return user;
  }

  // =============================================
  // PROFILES
  // =============================================
  
  async getAllProfiles(): Promise<RoommateProfile[]> {
    try {
      console.log('[SupabaseRoommateService] Fetching all profiles...');
      
      const { data, error } = await supabase
        .from('roommate_profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SupabaseRoommateService] Error fetching profiles:', error);
        return [];
      }

      console.log(`[SupabaseRoommateService] ✅ Fetched ${data?.length || 0} profiles`);
      return data || [];
      
    } catch (error) {
      console.error('[SupabaseRoommateService] Exception fetching profiles:', error);
      return [];
    }
  }

  async getUnswipedProfiles(): Promise<RoommateProfile[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('[SupabaseRoommateService] No authenticated user - returning all profiles');
        return this.getAllProfiles();
      }

      console.log('[SupabaseRoommateService] Fetching unswiped profiles for user:', user.id);

      // Get all profiles that user hasn't swiped on
      const { data, error } = await supabase
        .from('roommate_profiles')
        .select('*')
        .eq('is_active', true)
        .not('id', 'in', `(
          SELECT target_profile_id 
          FROM swipes 
          WHERE user_id = '${user.id}'
        )`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SupabaseRoommateService] Error fetching unswiped profiles:', error);
        // Fallback to all profiles if query fails
        return this.getAllProfiles();
      }

      console.log(`[SupabaseRoommateService] ✅ Found ${data?.length || 0} unswiped profiles`);
      return data || [];
      
    } catch (error) {
      console.error('[SupabaseRoommateService] Exception fetching unswiped profiles:', error);
      return this.getAllProfiles();
    }
  }

  // =============================================
  // SWIPES
  // =============================================
  
  async recordSwipe(targetProfileId: string, swipeType: 'like' | 'dislike' | 'super_like'): Promise<{ success: boolean; match?: MatchRecord }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.error('[SupabaseRoommateService] Cannot record swipe - no authenticated user');
        return { success: false };
      }

      console.log(`[SupabaseRoommateService] Recording ${swipeType} swipe on profile:`, targetProfileId);

      // 1. Record the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          target_profile_id: targetProfileId,
          swipe_type: swipeType
        });

      if (swipeError) {
        console.error('[SupabaseRoommateService] Error recording swipe:', swipeError);
        return { success: false };
      }

      console.log('[SupabaseRoommateService] ✅ Swipe recorded successfully');

      // 2. Check for mutual match (only if current swipe was 'like' or 'super_like')
      if (swipeType === 'like' || swipeType === 'super_like') {
        const match = await this.checkAndCreateMatch(targetProfileId, swipeType);
        if (match) {
          console.log('[SupabaseRoommateService] 🎉 Match created!', match);
          return { success: true, match };
        }
      }

      return { success: true };

    } catch (error) {
      console.error('[SupabaseRoommateService] Exception recording swipe:', error);
      return { success: false };
    }
  }

  private async checkAndCreateMatch(targetProfileId: string, currentSwipeType: string): Promise<MatchRecord | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      // Get target profile to find the target user
      const { data: targetProfile, error: profileError } = await supabase
        .from('roommate_profiles')
        .select('user_id')
        .eq('id', targetProfileId)
        .single();

      if (profileError || !targetProfile?.user_id) {
        console.error('[SupabaseRoommateService] Could not find target profile user_id:', profileError);
        return null;
      }

      // Check if target user also liked current user's profile
      const { data: currentUserProfile } = await supabase
        .from('roommate_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!currentUserProfile) {
        console.log('[SupabaseRoommateService] Current user has no profile - cannot check reverse swipe');
        return null;
      }

      const { data: reverseSwipes, error: swipeError } = await supabase
        .from('swipes')
        .select('swipe_type')
        .eq('user_id', targetProfile.user_id)
        .eq('target_profile_id', currentUserProfile.id)
        .in('swipe_type', ['like', 'super_like']);

      if (swipeError) {
        console.error('[SupabaseRoommateService] Error checking reverse swipe:', swipeError);
        return null;
      }

      // If there's a mutual like, create a match
      if (reverseSwipes && reverseSwipes.length > 0) {
        const reverseSwipeType = reverseSwipes[0].swipe_type;
        
        // Determine match type
        let matchType: 'regular' | 'super' | 'mixed' = 'regular';
        if (currentSwipeType === 'super_like' && reverseSwipeType === 'super_like') {
          matchType = 'super';
        } else if (currentSwipeType === 'super_like' || reverseSwipeType === 'super_like') {
          matchType = 'mixed';
        }

        // Create the match
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            user_id: user.id,
            target_profile_id: targetProfileId,
            target_user_id: targetProfile.user_id,
            match_type: matchType,
            is_mutual: true,
            is_active: true
          })
          .select()
          .single();

        if (matchError) {
          console.error('[SupabaseRoommateService] Error creating match:', matchError);
          return null;
        }

        // Create conversation for the match
        await supabase
          .from('conversations')
          .insert({
            match_id: match.id,
            is_active: true
          });

        return match;
      }

      return null;
      
    } catch (error) {
      console.error('[SupabaseRoommateService] Exception checking for match:', error);
      return null;
    }
  }

  // =============================================
  // MATCHES
  // =============================================
  
  async getUserMatches(): Promise<MatchRecord[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('[SupabaseRoommateService] No authenticated user for matches');
        return [];
      }

      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SupabaseRoommateService] Error fetching matches:', error);
        return [];
      }

      console.log(`[SupabaseRoommateService] ✅ Found ${data?.length || 0} matches`);
      return data || [];
      
    } catch (error) {
      console.error('[SupabaseRoommateService] Exception fetching matches:', error);
      return [];
    }
  }

  // =============================================
  // USER SWIPES
  // =============================================
  
  async getUserSwipes(): Promise<SwipeRecord[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('swipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SupabaseRoommateService] Error fetching user swipes:', error);
        return [];
      }

      return data || [];
      
    } catch (error) {
      console.error('[SupabaseRoommateService] Exception fetching user swipes:', error);
      return [];
    }
  }

  // =============================================
  // RESET/CLEAR UTILITIES
  // =============================================
  
  async clearAllSwipes(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('[SupabaseRoommateService] No authenticated user for clearing swipes');
        return false;
      }

      const { error } = await supabase
        .from('swipes')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('[SupabaseRoommateService] Error clearing swipes:', error);
        return false;
      }

      console.log('[SupabaseRoommateService] ✅ All user swipes cleared');
      return true;
      
    } catch (error) {
      console.error('[SupabaseRoommateService] Exception clearing swipes:', error);
      return false;
    }
  }

  // =============================================
  // DEBUG UTILITIES
  // =============================================
  
  async getDebugInfo() {
    try {
      const user = await this.getCurrentUser();
      const profiles = await this.getAllProfiles();
      const swipes = await this.getUserSwipes();
      const matches = await this.getUserMatches();

      return {
        user: user ? { id: user.id, email: user.email } : null,
        profiles: {
          total: profiles.length,
          roommateSeekers: profiles.filter(p => !p.hasPlace).length,
          placeOwners: profiles.filter(p => p.hasPlace).length
        },
        swipes: {
          total: swipes.length,
          likes: swipes.filter(s => s.swipe_type === 'like').length,
          dislikes: swipes.filter(s => s.swipe_type === 'dislike').length,
          superLikes: swipes.filter(s => s.swipe_type === 'super_like').length
        },
        matches: {
          total: matches.length,
          active: matches.filter(m => m.is_active).length
        }
      };
    } catch (error) {
      console.error('[SupabaseRoommateService] Debug info error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const supabaseRoommateService = new SupabaseRoommateService();
export default supabaseRoommateService; 