import { supabase, supabaseAdmin } from '../services/supabaseClient';
import { Alert } from 'react-native';

/**
 * Helper utility to handle email confirmation issues
 * This provides multiple strategies to deal with unconfirmed emails
 */
export const EmailConfirmationHelper = {
  /**
   * Handles sign-up with automatic email confirmation bypass in development
   * @param email User's email
   * @param password User's password
   * @param userData Additional user data
   * @returns Object with success status, userId, and error message if any
   */
  async signUpWithConfirmationHandling(
    email: string,
    password: string,
    userData: { name: string; [key: string]: any }
  ) {
    try {
      // 1. Create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;
      if (!data?.user) throw new Error('No user returned from sign-up');

      const userId = data.user.id;
      console.log('User created successfully:', userId);

      // 2. Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        console.log('Email not confirmed, applying fallback strategies');
        
        // Strategy 1: In development, use admin client to confirm email
        if (__DEV__ && supabaseAdmin) {
          try {
            // This uses the service role to bypass RLS and confirm the email
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              email_confirm: true
            });
            console.log('Email confirmed using admin client');
          } catch (adminError) {
            console.error('Failed to confirm email with admin client:', adminError);
          }
        }

        // Strategy 2: Create profile directly using service role
        if (__DEV__ && supabaseAdmin) {
          try {
            const { error: profileError } = await supabaseAdmin
              .from('users')
              .upsert({
                id: userId,
                email,
                name: userData.name || '',
                is_premium: false,
                is_verified: false,
                onboarding_completed: false,
                profile_strength: 10 // Starting profile strength
              });

            if (profileError) {
              console.error('Error creating profile with service role:', profileError);
            } else {
              console.log('Profile created successfully with service role');
            }
          } catch (profileError) {
            console.error('Failed to create profile with service role:', profileError);
          }
        }

        // Strategy 3: For production, show a friendly message
        if (!__DEV__) {
          Alert.alert(
            'Email Verification Required',
            'Please check your email and click the confirmation link before continuing.',
            [{ text: 'OK' }]
          );
        }
      }

      return {
        success: true,
        userId,
        message: 'Account created successfully'
      };
    } catch (error: any) {
      console.error('Error in signUpWithConfirmationHandling:', error);
      return {
        success: false,
        userId: null,
        message: error.message || 'Failed to create account'
      };
    }
  },

  /**
   * Attempts to sign in with unconfirmed email
   * @param email User's email
   * @param password User's password
   * @returns Object with success status and session if successful
   */
  async signInWithUnconfirmedEmail(email: string, password: string) {
    try {
      // First try normal sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // If successful, return the session
      if (data?.session) {
        return { success: true, session: data.session };
      }

      // If error is due to unconfirmed email and we're in development
      if (error?.message?.includes('Email not confirmed') && __DEV__ && supabaseAdmin) {
        console.log('Attempting to confirm email and retry sign-in');
        
        // Find the user by email
        const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
        const user = userData?.users?.find(u => u.email === email);
        
        if (user) {
          // Confirm the email
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            email_confirm: true
          });
          
          // Retry sign-in
          const { data: retryData } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (retryData?.session) {
            return { success: true, session: retryData.session };
          }
        }
      }
      
      // Return the error if all strategies fail
      return { 
        success: false, 
        error: error?.message || 'Failed to sign in' 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  }
};

export default EmailConfirmationHelper;
