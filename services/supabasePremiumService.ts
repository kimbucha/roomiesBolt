import { supabase } from './supabaseClient';
import { useSupabaseAuthStore } from '../store/supabaseAuthStore';

export interface PendingLike {
  user_id: string;
  liker_id: string;
  action: 'like' | 'superLike';
  created_at: string;
  liker_name: string;
  liker_image: string | null;
}

export interface SwipeAction {
  user_id: string;
  target_user_id: string;
  action: 'like' | 'pass' | 'superLike';
}

export class SupabasePremiumService {
  /**
   * Check if a user has premium access
   */
  static async checkPremiumStatus(userId: string): Promise<boolean> {
    try {
      // In development mode, check if we're using mock data
      if (__DEV__) {
        console.log('[SupabasePremiumService] Development mode - checking premium status locally');
        // Return false by default in development to avoid Supabase errors
        return false;
      }

      const { data, error } = await supabase
        .rpc('can_view_premium_feature', { user_id: userId });
      
      if (error) {
        // Handle the common PGRST202 error (function not found) gracefully
        if (error.code === 'PGRST202') {
          console.warn('[SupabasePremiumService] Premium feature function not found - defaulting to free tier');
          return false;
        }
        console.error('Error checking premium status:', error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  /**
   * Get pending likes for a user (for the premium card feature)
   */
  static async getPendingLikes(userId: string): Promise<PendingLike[]> {
    try {
      const { data, error } = await supabase
        .from('pending_likes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10); // Limit to 10 most recent likes
      
      if (error) {
        console.error('Error fetching pending likes:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching pending likes:', error);
      return [];
    }
  }

  /**
   * Get the count of pending likes for a user
   */
  static async getPendingLikesCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_pending_likes_count', { user_id: userId });
      
      if (error) {
        console.error('Error fetching pending likes count:', error);
        return 0;
      }
      
      return data || 0;
    } catch (error) {
      console.error('Error fetching pending likes count:', error);
      return 0;
    }
  }

  /**
   * Record a swipe action
   */
  static async recordSwipe(swipeAction: SwipeAction): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('swipes')
        .insert(swipeAction);
      
      if (error) {
        console.error('Error recording swipe:', error);
        return false;
      }
      
      // Check if this creates a match
      await this.checkForMatch(swipeAction.user_id, swipeAction.target_user_id);
      
      return true;
    } catch (error) {
      console.error('Error recording swipe:', error);
      return false;
    }
  }

  /**
   * Check if a swipe creates a mutual match
   */
  static async checkForMatch(userId: string, targetUserId: string): Promise<boolean> {
    try {
      // Check if both users have liked each other
      const { data: mutualLikes, error } = await supabase
        .from('swipes')
        .select('*')
        .in('user_id', [userId, targetUserId])
        .in('target_user_id', [userId, targetUserId])
        .in('action', ['like', 'superLike']);
      
      if (error) {
        console.error('Error checking for match:', error);
        return false;
      }
      
      // We need exactly 2 likes (one from each user)
      if (mutualLikes && mutualLikes.length === 2) {
        // Create a match record
        const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const user1Like = mutualLikes.find(like => like.user_id === userId);
        const user2Like = mutualLikes.find(like => like.user_id === targetUserId);
        
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            id: matchId,
            user1_id: userId,
            user2_id: targetUserId,
            user1_action: user1Like?.action,
            user2_action: user2Like?.action,
            status: this.determineMatchStatus(user1Like?.action, user2Like?.action),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (matchError) {
          console.error('Error creating match:', matchError);
          return false;
        }
        
        console.log(`Created match ${matchId} between ${userId} and ${targetUserId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for match:', error);
      return false;
    }
  }

  /**
   * Determine match status based on swipe actions
   */
  private static determineMatchStatus(action1?: string, action2?: string): string {
    if (action1 === 'superLike' && action2 === 'superLike') {
      return 'superMatched';
    } else if (action1 === 'superLike' || action2 === 'superLike') {
      return 'mixedMatched';
    } else {
      return 'matched';
    }
  }

  /**
   * Upgrade user to premium
   */
  static async upgradeToPremium(userId: string, expiresAt?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_premium: true,
          subscription_tier: 'premium',
          subscription_expires_at: expiresAt || null
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Error upgrading to premium:', error);
        return false;
      }
      
      console.log(`User ${userId} upgraded to premium`);
      return true;
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      return false;
    }
  }

  /**
   * Downgrade user to free
   */
  static async downgradeToFree(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_premium: false,
          subscription_tier: 'free',
          subscription_expires_at: null
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Error downgrading to free:', error);
        return false;
      }
      
      console.log(`User ${userId} downgraded to free`);
      return true;
    } catch (error) {
      console.error('Error downgrading to free:', error);
      return false;
    }
  }

  /**
   * Get user's current subscription status
   */
  static async getSubscriptionStatus(userId: string): Promise<{
    isPremium: boolean;
    tier: string;
    expiresAt: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_premium, subscription_tier, subscription_expires_at')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching subscription status:', error);
        return { isPremium: false, tier: 'free', expiresAt: null };
      }
      
      return {
        isPremium: data.is_premium || false,
        tier: data.subscription_tier || 'free',
        expiresAt: data.subscription_expires_at
      };
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return { isPremium: false, tier: 'free', expiresAt: null };
    }
  }
} 