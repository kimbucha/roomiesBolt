import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  isPremium: boolean;
  isVerified: boolean;
  onboardingCompleted?: boolean;
  userRole?: 'roommate_seeker' | 'place_lister' | 'both';
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<{ error: string | null }>;
  setPremiumStatus: (isPremium: boolean) => Promise<{ error: string | null }>;
  refreshUser: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<{ error: string | null }>;
  
  // Internal helper functions (not exposed to components)
  _handleUserProfileData: (supabaseUser: SupabaseUser) => Promise<void>;
  _createUserProfile: (supabaseUser: SupabaseUser) => Promise<void>;
  _syncUserMetadata: (supabaseUser: SupabaseUser, userData: any) => Promise<void>;
}

/**
 * Helper function to convert Supabase user data to our app's User format
 */
const formatUser = (authUser: SupabaseUser, userData: any): User => {
  // Extract userRole from user_role column first, fallback to housing_goals JSONB field
  let userRole: 'roommate_seeker' | 'place_lister' | 'both' | undefined;
  if (userData.user_role) {
    userRole = userData.user_role;
  } else if (userData.housing_goals && typeof userData.housing_goals === 'object') {
    userRole = userData.housing_goals.user_role;
  }
  
  return {
    id: authUser.id,
    email: authUser.email!,
    name: userData.name,
    profileImage: userData.profile_image_url,
    isPremium: userData.is_premium || false,
    isVerified: userData.is_verified || false,
    onboardingCompleted: userData.onboarding_completed || false,
    userRole: userRole
  };
};

export const useSupabaseAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      if (data.user) {
        // Fetch user profile data
        const { data: userData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
                      // If user exists in auth but not in the users table, create a profile
            if (profileError.code === 'PGRST116') {
              // CRITICAL: Always create as free user
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: data.user.id,
                  email: data.user.email!,
                  name: data.user.user_metadata?.name || 'New User',
                  is_premium: false,  // ALWAYS false for new accounts
                  is_verified: false,
                  onboarding_completed: false
                });
              
            if (insertError) throw insertError;
            
            // Fetch the newly created user
            const { data: newUserData, error: newProfileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            if (newProfileError) throw newProfileError;
            
            const formattedUser = formatUser(data.user, newUserData);
            set({ user: formattedUser, isLoggedIn: true, isLoading: false });
            return { error: null };
          }
          
          throw profileError;
        }
        
        const formattedUser = formatUser(data.user, userData);
        set({ user: formattedUser, isLoggedIn: true, isLoading: false });
        return { error: null };
      }
      
      set({ isLoading: false });
      return { error: 'User not found' };
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }
  },
  
  signup: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      // Step 1: Check if email already exists in Auth but not in users table
      // This handles the case where a previous signup failed halfway
      const { error: checkError } = await supabase.auth.signInWithPassword({ 
        email, 
        password: 'temporary-check-password' 
      });
      
      // If we get an "Invalid login credentials" error, the email exists in Auth
      if (checkError && checkError.message.includes('Invalid login credentials')) {
        // We can't directly get the user ID from Auth with the anon key
        // Instead, let's try a different approach - use password reset
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        
        if (!resetError) {
          // If we could send a reset email, the user exists in Auth
          console.log('User exists in Auth, sent reset email');
        }
        
        // Since we can't get the user ID easily, let's just use a different email
        return { error: 'Email already exists in Auth. Please use a different email address.' };
      }
      
      // Normal signup flow if the user doesn't already exist
      // Step 1: Sign up the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Step 2: Create user profile using RPC function to bypass RLS
        // This is a workaround for the RLS policy issue
        // CRITICAL: Always create as free user
        const { error: profileError } = await supabase.rpc('create_user_profile', {
          user_id: data.user.id,
          user_email: data.user.email!,
          user_name: name,
          is_user_premium: false,  // ALWAYS false for new accounts
          is_user_verified: false,
          is_onboarding_completed: false
        });
        
        // If RPC fails, try direct insert as fallback
        if (profileError) {
          console.log('RPC failed, trying direct insert:', profileError);
          
          // Try direct insert with auth token (may work if user has just been created)
          // CRITICAL: Always create as free user
          const { error: directError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              name,
              is_premium: false,  // ALWAYS false for new accounts
              is_verified: false,
              onboarding_completed: false
            });
            
          // If both methods fail, log the error but don't throw
          // The user is still created in Auth, they just won't have a profile yet
          if (directError) {
            console.error('Failed to create user profile:', directError);
            // We'll continue anyway and let the user retry later
          }
        }
        
        const formattedUser = {
          id: data.user.id,
          email: data.user.email!,
          name,
          isPremium: false,
          isVerified: false,
          onboardingCompleted: false
        };
        
        set({ user: formattedUser, isLoggedIn: true, isLoading: false });
        return { error: null };
      }
      
      set({ isLoading: false });
      return { error: 'Failed to create user' };
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ user: null, isLoggedIn: false, isLoading: false });
  },
  
  updateUser: async (updates: Partial<User>) => {
    try {
      const { user } = get();
      if (!user) return { error: 'Not authenticated' };
      
      // Update auth metadata if name is being updated
      if (updates.name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { name: updates.name }
        });
        
        if (authError) throw authError;
      }
      
      // Prepare the database update
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.profileImage !== undefined) dbUpdates.profile_image_url = updates.profileImage;
      if (updates.isVerified !== undefined) dbUpdates.is_verified = updates.isVerified;
      if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;
      
      // Update user profile
      const { error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      set({ user: { ...user, ...updates } });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },
  
  setPremiumStatus: async (isPremium: boolean) => {
    try {
      const { user } = get();
      if (!user) return { error: 'Not authenticated' };
      
      const { error } = await supabase
        .from('users')
        .update({ is_premium: isPremium })
        .eq('id', user.id);
        
      if (error) throw error;
      
      set({ user: { ...user, isPremium } });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },
  
  refreshUser: async () => {
    set({ isLoading: true, error: null });
    try {
      // Step 1: Check for active session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[Auth] Session error:', sessionError.message);
        set({ user: null, isLoggedIn: false, isLoading: false, error: sessionError.message });
        return;
      }
      
      if (!sessionData.session) {
        console.log('[Auth] No active session found');
        set({ user: null, isLoggedIn: false, isLoading: false });
        return;
      }
      
      // Step 2: Get authenticated user data
      const { data, error: authError } = await supabase.auth.getUser();
      
      // Handle auth errors with session refresh attempt
      if (authError) {
        console.log('[Auth] Auth error, attempting session refresh');
        const { error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('[Auth] Session refresh failed:', refreshError.message);
          set({ user: null, isLoggedIn: false, isLoading: false, error: authError.message });
          return;
        }
        
        // Try getting user again after refresh
        const { data: refreshedData, error: refreshedAuthError } = await supabase.auth.getUser();
        
        if (refreshedAuthError || !refreshedData.user) {
          console.error('[Auth] User retrieval failed after refresh');
          set({ user: null, isLoggedIn: false, isLoading: false, error: refreshedAuthError?.message || 'Failed to get user data' });
          return;
        }
        
        // Successfully retrieved user after refresh
        const supabaseUser = refreshedData.user;
        await get()._handleUserProfileData(supabaseUser);
        return;
      }
      
      // No auth error, proceed with user data
      if (!data.user) {
        console.log('[Auth] No user found in valid session');
        set({ user: null, isLoggedIn: false, isLoading: false });
        return;
      }
      
      // Successfully retrieved user
      await get()._handleUserProfileData(data.user);
    } catch (error: any) {
      console.error('[Auth] Refresh user error:', error.message);
      set({ user: null, isLoggedIn: false, isLoading: false, error: error.message });
    }
  },
  
  // Helper function to handle user profile data retrieval and creation
  _handleUserProfileData: async (supabaseUser: SupabaseUser) => {
    try {
      if (!supabaseUser) {
        set({ user: null, isLoggedIn: false, isLoading: false });
        return;
      }
      
      console.log('[Auth] User authenticated:', supabaseUser.id);
      
      // Step 3: Fetch user profile from database
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      // Handle case where profile doesn't exist
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('[Auth] Creating new user profile');
          await get()._createUserProfile(supabaseUser);
        } else {
          console.error('[Auth] Profile error:', profileError.message);
          set({ user: null, isLoggedIn: false, isLoading: false, error: profileError.message });
        }
        return;
      }
      
      // Step 4: Successfully retrieved profile, sync with auth metadata
      await get()._syncUserMetadata(supabaseUser, userData);
      
      // Step 5: Update app state with user data
      const formattedUser = formatUser(supabaseUser, userData);
      set({ user: formattedUser, isLoggedIn: true, isLoading: false });
    } catch (error: any) {
      console.error('[Auth] Error handling user profile:', error.message);
      set({ user: null, isLoggedIn: false, isLoading: false, error: error.message });
    }
  },
  
  // Helper function to create a new user profile
  _createUserProfile: async (supabaseUser: SupabaseUser) => {
    try {
      // Get data from user metadata if available
      const userMetadata = supabaseUser.user_metadata || {};
      const userName = userMetadata.name || userMetadata.full_name || 'New User';
      const userPersonalityType = userMetadata.personality_type || null;
      
      // Try RPC function first (more secure)
      const { error: rpcError } = await supabase.rpc('create_user_profile', {
        user_id: supabaseUser.id,
        user_email: supabaseUser.email!,
        user_name: userName,
        is_user_premium: false,
        is_user_verified: false,
        is_onboarding_completed: userMetadata.onboarding_completed || false
      });
      
      // Fall back to direct insert if RPC fails
      if (rpcError) {
        console.log('[Auth] RPC failed, using direct insert');
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: userName,
            is_premium: userMetadata.is_premium || false,
            is_verified: userMetadata.is_verified || false,
            onboarding_completed: userMetadata.onboarding_completed || false,
            personality_type: userPersonalityType,
            profile_image_url: userMetadata.profile_image_url || null
          });
        
        if (insertError) {
          console.error('[Auth] Profile creation failed:', insertError.message);
          set({ user: null, isLoggedIn: true, isLoading: false, error: 'Failed to create user profile' });
          return;
        }
      }
      
      // Fetch the newly created profile
      const { data: newUserData, error: newProfileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (newProfileError) {
        console.error('[Auth] Failed to fetch new profile:', newProfileError.message);
        set({ user: null, isLoggedIn: true, isLoading: false, error: 'Failed to fetch user profile' });
        return;
      }
      
      // Sync profile data with auth metadata
      await get()._syncUserMetadata(supabaseUser, newUserData);
      
      // Update app state
      const formattedUser = formatUser(supabaseUser, newUserData);
      set({ user: formattedUser, isLoggedIn: true, isLoading: false });
    } catch (error: any) {
      console.error('[Auth] Profile creation error:', error.message);
      set({ user: null, isLoggedIn: false, isLoading: false, error: error.message });
    }
  },
  
  // Helper function to sync user profile data with auth metadata
  _syncUserMetadata: async (supabaseUser: SupabaseUser, userData: any) => {
    try {
      // Update auth metadata with profile data for better persistence
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: userData.name,
          personality_type: userData.personality_type,
          onboarding_completed: userData.onboarding_completed,
          is_premium: userData.is_premium,
          is_verified: userData.is_verified,
          profile_image_url: userData.profile_image_url
        }
      });
      
      if (updateError) {
        console.warn('[Auth] Metadata sync warning:', updateError.message);
        // Continue anyway - this is not critical
      }
    } catch (error: any) {
      console.warn('[Auth] Metadata sync warning:', error.message);
      // Continue anyway - metadata sync is not critical
    }
  },
  
  setOnboardingCompleted: async (completed: boolean) => {
    try {
      const { user } = get();
      if (!user) return { error: 'Not authenticated' };
      
      const { error } = await supabase
        .from('users')
        .update({ onboarding_completed: completed })
        .eq('id', user.id);
        
      if (error) throw error;
      
      set({ user: { ...user, onboardingCompleted: completed } });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}));
